import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { appCommand } from '../commands/dev';
import { formatDoctor, projectEnv } from '../commands/doctor';
import { exampleKeys, isLocal, safeUrl, satisfiesMinimum } from './checks';
import { reason } from './probe';

const tmp = () => mkdtempSync(join(tmpdir(), 'mariachi-doctor-'));

describe('doctor helpers', () => {
  it('compares a Node version with the >= a project asks for, and lets other range shapes pass', () => {
    expect(satisfiesMinimum('20.12.0', '>=20.12')).toBe(true);
    expect(satisfiesMinimum('24.13.0', '>=20.12')).toBe(true);
    expect(satisfiesMinimum('20.11.9', '>=20.12')).toBe(false);
    expect(satisfiesMinimum('18.19.0', '>= 20')).toBe(false);
    expect(satisfiesMinimum('v20.12.1', '>=20.12.1')).toBe(true);
    expect(satisfiesMinimum('20.12.0', '>=20.12.1')).toBe(false);
    expect(satisfiesMinimum('18.0.0', '^20 || ^22')).toBe(true);
  });

  it('reads the variable names a .env.example sets, not the commented ones', () => {
    expect(exampleKeys('SERVICE_NAME=app\n# AUTH_ANON_KEY=\nDATABASE_URL=postgres://x\n  INDENTED=1\nlower=1\nJWT_SECRET=\n')).toEqual(['SERVICE_NAME', 'DATABASE_URL', 'JWT_SECRET']);
  });

  it('keeps passwords out of messages, and knows a local address', () => {
    expect(safeUrl('postgres://app:hunter2@db.example.com:5432/app')).toBe('postgres://app:***@db.example.com:5432/app');
    expect(safeUrl('redis://localhost:6379')).toBe('redis://localhost:6379');
    expect(safeUrl('not a url')).toBe('(not a URL)');
    for (const url of ['postgres://x@localhost/db', 'redis://127.0.0.1:6379', 'redis://[::1]:6379']) expect(isLocal(url), url).toBe(true);
    for (const url of ['postgres://x@db.internal/db', 'not a url']) expect(isLocal(url), url).toBe(false);
  });

  it("gives the root cause of a wrapped error, with the driver's code", () => {
    const refused = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:1'), { code: 'ECONNREFUSED' });
    expect(reason(Object.assign(new Error('Could not connect to Postgres'), { cause: refused }))).toBe('connect ECONNREFUSED 127.0.0.1:1');
    expect(reason(Object.assign(new Error('password authentication failed'), { code: '28P01' }))).toBe('password authentication failed (28P01)');
    expect(reason('plain')).toBe('plain');
  });

  it('prints each check with its fix, and a last line that says whether the project can run', () => {
    const lines = formatDoctor([
      { name: 'node', status: 'ok', detail: 'Node 24' },
      { name: 'database', status: 'fail', detail: "Can't reach Postgres", fix: 'docker compose up -d' },
      { name: 'env', status: 'warn', detail: 'JWT_SECRET is empty', fix: 'Set it in .env' },
    ]);
    expect(lines[0]).toMatch(/ok\s+node\s+Node 24/);
    expect(lines[1]).toMatch(/fail database\s+Can't reach Postgres/);
    expect(lines[2]).toMatch(/→ docker compose up -d/);
    expect(lines.at(-1)).toMatch(/1 problem\(s\) to fix, 1 warning\(s\)\./);
    expect(formatDoctor([{ name: 'node', status: 'ok', detail: 'Node 24' }]).at(-1)).toMatch(/Ready to run\./);
    expect(formatDoctor([{ name: 'env', status: 'warn', detail: 'x' }]).at(-1)).toMatch(/Ready to run, with 1 warning\(s\)\./);
  });

  it("reads a project's .env under what the environment already has", () => {
    const dir = tmp();
    writeFileSync(join(dir, '.env'), 'ONLY_IN_FILE=from-file\nPATH=overridden-by-the-file?\n');
    const env = projectEnv(dir);
    expect(env.ONLY_IN_FILE).toBe('from-file');
    // What's already set wins, as when the app starts
    expect(env.PATH).toBe(process.env.PATH);
    expect(projectEnv(tmp()).ONLY_IN_FILE).toBeUndefined();
  });
});

describe('mariachi dev: the command that runs the app', () => {
  it("uses the project's tsx, watching unless told not to, with .env when there is one", () => {
    const dir = tmp();
    mkdirSync(join(dir, 'node_modules', '.bin'), { recursive: true });
    mkdirSync(join(dir, 'src'));
    const tsx = join(dir, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx');
    writeFileSync(tsx, '');
    writeFileSync(join(dir, 'src', 'main.ts'), '');
    expect(appCommand(dir, 'src/main.ts', true)).toEqual({ command: tsx, args: ['watch', 'src/main.ts'] });
    writeFileSync(join(dir, '.env'), '');
    expect(appCommand(dir, 'src/main.ts', true)).toEqual({ command: tsx, args: ['watch', '--env-file=.env', 'src/main.ts'] });
    expect(appCommand(dir, 'src/main.ts', false)).toEqual({ command: tsx, args: ['--env-file=.env', 'src/main.ts'] });
    expect(() => appCommand(dir, 'src/worker.ts', true)).toThrowError(expect.objectContaining({ code: 'cli/file-not-found' }));
    expect(() => appCommand(tmp(), 'src/main.ts', true)).toThrowError(expect.objectContaining({ code: 'cli/tsx-missing' }));
  });
});
