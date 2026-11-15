import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { appCommand, servicesFromEnv } from '../commands/dev';
import { formatDoctor } from '../commands/doctor';
import { envFiles, projectEnv, readEnvFiles } from '../env-files';
import { exampleKeys, isLocal, redact, safeUrl, satisfiesMinimum, secretsIn } from './checks';
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
    expect(safeUrl('https://api.example.com/hook?token=abc123&sslmode=require&api_key=k-9')).toBe('https://api.example.com/hook?token=***&sslmode=require&api_key=***');
    for (const url of ['postgres://x@localhost/db', 'redis://127.0.0.1:6379', 'redis://[::1]:6379']) expect(isLocal(url), url).toBe(true);
    for (const url of ['postgres://x@db.internal/db', 'not a url']) expect(isLocal(url), url).toBe(false);
  });

  it('finds the secrets an environment holds and removes them from any text, whoever wrote it', () => {
    const env = {
      DATABASE_URL: 'postgres://app:p%40ss-w0rd@db.internal:5432/app?sslmode=require',
      REDIS_URL: 'rediss://default:r3d1s-secret@cache.internal:6380',
      JWT_SECRET: 'jwt-signing-secret-0123456789abcdef',
      STRIPE_API_KEY: 'sk_test_51abc',
      WEBHOOK_URL: 'https://hooks.example.com/in?token=tok_live_42',
      SERVICE_NAME: 'my-app',
      PORT: '3000',
    };
    const secrets = secretsIn(env);
    expect(secrets).toEqual(expect.arrayContaining(['p%40ss-w0rd', 'p@ss-w0rd', 'r3d1s-secret', 'jwt-signing-secret-0123456789abcdef', 'sk_test_51abc', 'tok_live_42']));
    expect(secrets).not.toContain('my-app');
    expect(secrets).not.toContain('3000');
    // What a driver's error might echo back
    const echoed = 'connection to postgres://app:p%40ss-w0rd@db.internal:5432/app failed: password "p@ss-w0rd" rejected; key sk_test_51abc; see https://hooks.example.com/in?token=tok_live_42';
    const clean = redact(echoed, secrets);
    for (const secret of secrets) expect(clean).not.toContain(secret);
    expect(clean).toBe('connection to postgres://app:***@db.internal:5432/app failed: password "***" rejected; key ***; see https://hooks.example.com/in?token=***');
    // A development default that is also an ordinary word isn't blanked everywhere, only where it is the password
    const local = secretsIn({ DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/app' });
    expect(local).toEqual([]);
    expect(redact("Can't reach Postgres at postgres://postgres:postgres@localhost:5432/app", local)).toBe("Can't reach Postgres at postgres://postgres:***@localhost:5432/app");
    // A URL's password is masked even when it isn't one of the known secrets
    expect(redact('tried mysql://root:hunter2@10.0.0.5/db', [])).toBe('tried mysql://root:***@10.0.0.5/db');
  });

  it("gives the root cause of a wrapped error, with the driver's code", () => {
    const refused = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:1'), { code: 'ECONNREFUSED' });
    expect(reason(Object.assign(new Error('Could not connect to Postgres'), { cause: refused }))).toBe('connect ECONNREFUSED 127.0.0.1:1');
    expect(reason(Object.assign(new Error('password authentication failed'), { code: '28P01' }))).toBe('password authentication failed (28P01)');
    // A framework error keeps its cause in metadata
    expect(reason(Object.assign(new Error('Could not connect to Postgres'), { code: 'database/connect-failed', metadata: { cause: refused } }))).toBe('connect ECONNREFUSED 127.0.0.1:1');
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

  it('takes the env files a project names, in order, later over earlier, skipping what is missing', () => {
    const dir = tmp();
    expect(envFiles(dir)).toEqual({ files: ['.env'], configured: false });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'x', mariachi: { envFiles: ['.env.development', '.env', '.env.local'] } }));
    expect(envFiles(dir)).toEqual({ files: ['.env.development', '.env', '.env.local'], configured: true });
    // Flags on the command line replace the list
    expect(envFiles(dir, ['.env.ci'])).toEqual({ files: ['.env.ci'], configured: true });
    writeFileSync(join(dir, '.env.development'), 'DATABASE_URL=postgres://dev/app\nSHARED_ONLY=shared\n');
    writeFileSync(join(dir, '.env'), 'DATABASE_URL=postgres://mine/app\n');
    expect(readEnvFiles(dir, envFiles(dir).files)).toEqual({ DATABASE_URL: 'postgres://mine/app', SHARED_ONLY: 'shared' });
    // A list that isn't a list of names is ignored
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ mariachi: { envFiles: 'all of them' } }));
    expect(envFiles(dir)).toEqual({ files: ['.env'], configured: false });
  });
});

describe('mariachi dev: whether it starts the services', () => {
  it('starts them unless the environment says something else does', () => {
    for (const value of [undefined, '', 'on', 'true', '1']) expect(servicesFromEnv(value), String(value)).toBe(true);
    for (const value of ['off', 'OFF', 'false', '0', 'no', ' off ']) expect(servicesFromEnv(value), value).toBe(false);
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
    // A project's own files, in its order, and only the ones that exist
    writeFileSync(join(dir, '.env.development'), '');
    expect(appCommand(dir, 'src/main.ts', true, ['.env.development', '.env', '.env.local'])).toEqual({ command: tsx, args: ['watch', '--env-file=.env.development', '--env-file=.env', 'src/main.ts'] });
    expect(() => appCommand(dir, 'src/worker.ts', true)).toThrowError(expect.objectContaining({ code: 'cli/file-not-found' }));
    expect(() => appCommand(tmp(), 'src/main.ts', true)).toThrowError(expect.objectContaining({ code: 'cli/tsx-missing' }));
  });
});
