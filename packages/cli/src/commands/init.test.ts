import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextSteps, registerInitCommand } from './init';

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'mariachi-init-'));
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(dir, { recursive: true, force: true });
});

async function init(...args: string[]) {
  const program = new Command().exitOverride();
  registerInitCommand(program);
  await program.parseAsync(['node', 'mariachi', 'init', ...args]);
}

describe('mariachi init --auth', () => {
  it('defaults to the JWT template', async () => {
    await init(join(dir, 'app'), '--no-example');
    const pkg = JSON.parse(await readFile(join(dir, 'app/package.json'), 'utf-8'));
    expect(pkg.dependencies['@mariachi/auth-gotrue']).toBeUndefined();
    expect(existsSync(join(dir, 'app/src/api/pages/sign-in.ts'))).toBe(false);
  });

  it('generates the GoTrue sign-in template with --auth gotrue', async () => {
    await init(join(dir, 'app'), '--no-example', '--auth', 'gotrue');
    const pkg = JSON.parse(await readFile(join(dir, 'app/package.json'), 'utf-8'));
    expect(pkg.dependencies).toHaveProperty('@mariachi/auth-gotrue');
    expect(pkg.dependencies).toHaveProperty('@mariachi/tenancy');
    expect(existsSync(join(dir, 'app/src/api/pages/sign-in.ts'))).toBe(true);
    expect(existsSync(join(dir, 'app/src/api/controllers/me.controller.ts'))).toBe(true);
  });

  it('refuses an unknown provider', async () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`exit ${code}`); // mariachi-lint-ignore: stands in for process.exit in the test
    }) as never);
    await expect(init(join(dir, 'app'), '--auth', 'clerk')).rejects.toThrow('exit 1');
    expect(exit).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Unknown auth "clerk"'));
  });
});

describe('mariachi init --orgs', () => {
  it('leaves organizations out unless asked', async () => {
    await init(join(dir, 'app'), '--no-example');
    const pkg = JSON.parse(await readFile(join(dir, 'app/package.json'), 'utf-8'));
    expect(pkg.dependencies['@mariachi/organizations']).toBeUndefined();
    expect(existsSync(join(dir, 'app/src/organizations.ts'))).toBe(false);
  });

  it('adds organizations to either sign-in choice', async () => {
    await init(join(dir, 'jwt'), '--no-example', '--orgs');
    await init(join(dir, 'gotrue'), '--no-example', '--orgs', '--auth', 'gotrue');
    for (const app of ['jwt', 'gotrue']) {
      const pkg = JSON.parse(await readFile(join(dir, app, 'package.json'), 'utf-8'));
      expect(pkg.dependencies).toHaveProperty('@mariachi/organizations');
      expect(existsSync(join(dir, app, 'src/organizations.ts'))).toBe(true);
      expect(existsSync(join(dir, app, 'src/schema/organizations.ts'))).toBe(true);
      expect(await readFile(join(dir, app, 'src/app.ts'), 'utf-8')).toContain('organizationStrategy(bearerStrategy(');
    }
  });
});

describe('what init says to do next', () => {
  const said = () =>
    vi
      .mocked(console.log)
      .mock.calls.map(([line]) => String(line))
      .join('\n');

  it('is install and dev: dev makes .env, starts Postgres and migrates', async () => {
    expect(nextSteps('app', 'jwt')).toEqual(['cd app', 'pnpm install', 'pnpm dev']);
    await init(join(dir, 'app'), '--no-example');
    expect(said()).not.toMatch(/docker compose up|db:migrate/);
    expect(said()).toContain('$(pnpm -s mariachi token)" localhost:3000/api/health/ready');
    expect(JSON.parse(await readFile(join(dir, 'app/package.json'), 'utf-8')).scripts.dev).toBe('mariachi dev');
  });

  it('has a GoTrue project make its .env first, since AUTH_URL has to be set in it', () => {
    expect(nextSteps('app', 'gotrue')).toEqual(['cd app', 'pnpm install', 'cp .env.example .env', 'pnpm dev']);
  });

  it('names a token with no tenant for a project with organizations', async () => {
    await init(join(dir, 'app'), '--no-example', '--orgs');
    expect(said()).toContain('$(pnpm -s mariachi token --no-tenant)" localhost:3000/api/organizations');
  });
});
