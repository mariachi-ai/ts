import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import postgres from 'postgres';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createProject, generateEntity } from '@mariachi/create';
import { startPostgres, startRedis, stopAll } from '../../../../test/setup';
import { planProjectMigration, writePlannedMigration } from '../db/project';
import { prepareDev } from '../dev/prepare';
import { envFiles, projectEnv } from '../env-files';
import { runDoctor, type CheckResult } from './checks';

const run = promisify(execFile);
const CLI = resolve(__dirname, '../../dist/index.js');
// Inside the package so the project's schema resolves @mariachi/* from this package's node_modules.
const project = resolve(__dirname, '../../.e2e-project/doctor-app');
// Nothing listens here
const NOWHERE = 'postgres://postgres:postgres@127.0.0.1:1/none';

let databaseUrl: string;
let redisUrl: string;
let env: Record<string, string>;

const byName = (results: CheckResult[]) => Object.fromEntries(results.map((r) => [r.name, r]));
const statuses = (results: CheckResult[]) => Object.fromEntries(results.map((r) => [r.name, r.status]));
const doctor = (over: Record<string, string | undefined> = {}) => runDoctor({ cwd: project, env: { ...env, ...over }, timeoutMs: 3000 });

function prepare(over: Partial<Parameters<typeof prepareDev>[0]> = {}) {
  const logs: string[] = [];
  const calls: string[][] = [];
  const result = prepareDev({
    cwd: project,
    probeMs: 1500,
    log: (line) => void logs.push(line),
    exec: async (command, args) => {
      calls.push([command, ...args]);
      return 0;
    },
    ...over,
  });
  return { logs, calls, result };
}

beforeAll(async () => {
  // A database of this test's own in the shared server, so its migrations table is its own too
  const server = await startPostgres();
  const name = `doctor_${randomUUID().replaceAll('-', '')}`;
  const admin = postgres(server, { max: 1 });
  await admin.unsafe(`create database ${name}`);
  await admin.end();
  const url = new URL(server);
  url.pathname = `/${name}`;
  databaseUrl = url.href;
  redisUrl = await startRedis();
  env = { DATABASE_URL: databaseUrl, REDIS_URL: redisUrl, SERVICE_NAME: 'doctor-app', NODE_ENV: 'development', PORT: '3000', JWT_SECRET: 'x'.repeat(40) };

  await rm(project, { recursive: true, force: true });
  await createProject({ name: 'doctor-app', outputDir: project });
}, 180_000);

afterAll(async () => {
  vi.unstubAllEnvs();
  await rm(project, { recursive: true, force: true });
  await stopAll();
});

describe('mariachi doctor and mariachi dev, on a freshly generated project', () => {
  it('doctor says what a fresh checkout is missing, each with what to run', async () => {
    const results = await runDoctor({ cwd: project, env: {}, timeoutMs: 1500 });
    expect(statuses(results)).toEqual({
      node: 'ok',
      project: 'ok',
      dependencies: 'fail',
      env: 'fail',
      config: 'ok',
      database: 'fail',
      migrations: 'fail',
      // A new project runs its jobs in Postgres: Redis is not asked for
      redis: 'skip',
      architecture: 'ok',
    });
    const found = byName(results);
    expect(found.dependencies?.fix).toBe('pnpm install');
    expect(found.env?.detail).toMatch(/\.env is missing, and the environment has no .*DATABASE_URL/);
    expect(found.env?.fix).toBe('cp .env.example .env');
    expect(found.migrations?.detail).toBe('The schema has tables and there are no migrations yet');
    expect(found.migrations?.fix).toMatch(/mariachi db generate && mariachi db migrate/);
  });

  it('dev does the first run: .env, a first migration, and applies it, without touching Docker when the services answer', async () => {
    await symlink(resolve(__dirname, '../../node_modules'), join(project, 'node_modules'), 'dir');
    // The environment wins over .env, as when the app starts; .env.example's URLs point at defaults that may or may not be running here
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);

    const first = prepare();
    expect((await first.result).did).toEqual(['env', 'migration', 'migrate']);
    expect(first.calls).toEqual([]);
    expect(first.logs[0]).toBe('created .env from .env.example');
    expect(first.logs[1]).toMatch(/^wrote the first migration: .*0000_init\.sql \(\d+ statements\)\. Commit the drizzle\/ folder$/);
    expect(await readFile(join(project, '.env'), 'utf8')).toBe(await readFile(join(project, '.env.example'), 'utf8'));
    expect(existsSync(join(project, 'drizzle', 'meta', '_journal.json'))).toBe(true);
    expect(existsSync(join(project, 'drizzle.config.ts'))).toBe(true);

    const sql = postgres(databaseUrl, { max: 1 });
    try {
      expect(await sql`select to_regclass('public.notes') as name`).toEqual([{ name: 'notes' }]);
    } finally {
      await sql.end();
    }

    // A second run has nothing to do, and doesn't write .env again
    const again = prepare();
    expect((await again.result).did).toEqual([]);
    expect(again.logs).toEqual([]);
  }, 60_000);

  it('doctor then finds the project ready', async () => {
    const results = await doctor();
    expect(statuses(results)).toEqual({ node: 'ok', project: 'ok', dependencies: 'ok', env: 'ok', config: 'ok', database: 'ok', migrations: 'ok', redis: 'ok', architecture: 'ok' });
    expect(byName(results).migrations?.detail).toBe('1 migration(s), all applied, matching the schema');
    expect(byName(results).database?.detail).toMatch(/^Postgres \d+.* at postgres(ql)?:\/\//);
    // The password never appears in a message
    expect(JSON.stringify(results)).not.toContain(':test@');
  });

  it('a schema change is a warning until a migration is written; dev does not write it; an unapplied migration is a failure dev fixes', async () => {
    await generateEntity({ name: 'invoice-item', projectRoot: project });
    const drifted = byName(await doctor()).migrations;
    expect(drifted).toMatchObject({ status: 'warn', fix: 'mariachi db generate, review the SQL, then mariachi db migrate' });
    expect(drifted?.detail).toMatch(/change\(s\) that no migration captures/);

    const noted = prepare();
    expect((await noted.result).did).toEqual([]);
    expect(noted.logs).toEqual([expect.stringMatching(/^note: the schema has \d+ change\(s\) that no migration captures\. Run `mariachi db generate`/)]);
    expect((await readFile(join(project, 'drizzle', 'meta', '_journal.json'), 'utf8')).match(/"tag"/g)).toHaveLength(1);

    await writePlannedMigration({ cwd: project, schema: 'src/schema/index.ts', out: 'drizzle', name: 'invoice items', plan: await planProjectMigration({ cwd: project, schema: 'src/schema/index.ts', out: 'drizzle' }) });
    const unapplied = byName(await doctor()).migrations;
    expect(unapplied).toMatchObject({ status: 'fail', fix: 'mariachi db migrate', detail: '1 migration(s) are not applied to the database: 0001_invoice_items' });

    const applied = prepare();
    expect((await applied.result).did).toEqual(['migrate']);
    expect(byName(await doctor()).migrations?.status).toBe('ok');
  }, 60_000);

  it('doctor names an unreachable service and how to start it; dev starts Compose and waits, or says why it could not', async () => {
    const results = byName(await doctor({ DATABASE_URL: NOWHERE, REDIS_URL: 'redis://127.0.0.1:1' }));
    expect(results.database).toMatchObject({ status: 'fail', fix: expect.stringContaining('docker compose up -d') });
    expect(results.database?.detail).toMatch(/^Can't reach Postgres at postgres:\/\/postgres:\*\*\*@127\.0\.0\.1:1\/none: /);
    expect(results.redis).toMatchObject({ status: 'fail', fix: expect.stringContaining('docker compose up -d') });
    // Whether migrations are applied can't be told without the database: skipped, not failed twice
    expect(results.migrations?.status).toBe('skip');
    const remote = byName(await doctor({ DATABASE_URL: 'postgres://app:secret@db.example.invalid:5432/app' }));
    expect(remote.database?.fix).toBe('Check that Postgres at postgres://app:***@db.example.invalid:5432/app is running and reachable from here');

    vi.stubEnv('DATABASE_URL', NOWHERE);
    try {
      // Something else runs the services (--no-services, or MARIACHI_DEV_SERVICES=off): Docker isn't called, and dev waits for them
      const managed = prepare({ services: false, waitMs: 900 });
      await expect(managed.result).rejects.toMatchObject({ code: 'cli/services-unreachable', message: expect.stringContaining("still isn't answering") });
      expect(managed.calls).toEqual([]);
      expect(managed.logs[0]).toBe('waiting for Postgres (not started here: services are managed outside this command)');

      const noDocker = prepare({ exec: async () => 127 });
      await expect(noDocker.result).rejects.toMatchObject({ code: 'cli/compose-failed' });

      const started = prepare({ waitMs: 1200 });
      await expect(started.result).rejects.toMatchObject({ code: 'cli/services-unreachable', message: expect.stringContaining("still isn't answering") });
      expect(started.calls).toEqual([['docker', 'compose', 'up', '-d']]);
      expect(started.logs[0]).toBe('starting services (docker compose up -d): Postgres not answering');
    } finally {
      vi.stubEnv('DATABASE_URL', databaseUrl);
    }
  }, 60_000);

  it('doctor fails on a Node older than the project asks for, a configuration that does not load, and a folder that is no project', async () => {
    expect(byName(await runDoctor({ cwd: project, env, nodeVersion: '18.19.0', timeoutMs: 3000 })).node).toMatchObject({ status: 'fail', fix: 'Install Node 20.12 or newer' });
    const badSecret = byName(await doctor({ JWT_SECRET: 'too-short' }));
    expect(badSecret.config?.status).toBe('fail');
    expect(badSecret.config?.detail).toMatch(/^The configuration does not load: .*auth\.jwtSecret/);
    const elsewhere = await runDoctor({ cwd: resolve(__dirname), env });
    expect(elsewhere.map((r) => [r.name, r.status])).toEqual([['node', 'ok'], ['project', 'fail']]);
    await expect(prepareDev({ cwd: resolve(__dirname), exec: async () => 0, log: () => {} })).rejects.toMatchObject({ code: 'cli/not-a-project' });
  });

  it('never lets a secret into a result, whatever the failure says', async () => {
    const password = 'S3cr3t-p4ssw0rd!';
    const results = await doctor({
      DATABASE_URL: `postgres://app:${encodeURIComponent(password)}@127.0.0.1:1/app?sslmode=disable`,
      REDIS_URL: `redis://default:${password}@127.0.0.1:1`,
      JWT_SECRET: 'short',
    });
    const text = JSON.stringify(results);
    expect(text).not.toContain(password);
    expect(text).not.toContain(encodeURIComponent(password));
    expect(byName(results).database?.detail).toMatch(/^Can't reach Postgres at postgres:\/\/app:\*\*\*@127\.0\.0\.1:1\/app\?sslmode=disable: /);
    expect(byName(results).redis?.detail).toMatch(/^Can't reach Redis at redis:\/\/default:\*\*\*@127\.0\.0\.1:1: /);
    expect(byName(results).config?.status).toBe('fail');
  });

  it("uses the env files a project names: dev copies no .env.example over them, and doctor checks what they give", async () => {
    const other = resolve(__dirname, '../../.e2e-project/doctor-envfiles');
    await rm(other, { recursive: true, force: true });
    await createProject({ name: 'envfiles-app', outputDir: other, example: false });
    await symlink(resolve(__dirname, '../../node_modules'), join(other, 'node_modules'), 'dir');
    const pkg = JSON.parse(await readFile(join(other, 'package.json'), 'utf8'));
    await writeFile(join(other, 'package.json'), JSON.stringify({ ...pkg, mariachi: { envFiles: ['.env.development', '.env'] } }, null, 2));
    // Committed defaults, and a personal file that overrides one of them
    // A database of its own: every project has tables now (its job queue and search), so dev migrates it
    const ownDatabase = new URL(databaseUrl);
    ownDatabase.pathname = `/envfiles_${randomUUID().replaceAll('-', '')}`;
    const admin = postgres(databaseUrl, { max: 1 });
    await admin.unsafe(`create database ${ownDatabase.pathname.slice(1)}`);
    await admin.end();
    const otherUrl = ownDatabase.href;
    await writeFile(join(other, '.env.development'), `SERVICE_NAME=envfiles-app\nNODE_ENV=development\nPORT=3000\nDATABASE_URL=${NOWHERE}\nREDIS_URL=${redisUrl}\nJWT_SECRET=${'d'.repeat(40)}\n`);
    await writeFile(join(other, '.env'), `DATABASE_URL=${otherUrl}\n`);
    // This test's own values, not the ones stubbed into the process for the other project
    vi.unstubAllEnvs();
    try {
      const files = envFiles(other);
      expect(files).toEqual({ files: ['.env.development', '.env'], configured: true });
      const logs: string[] = [];
      const prepared = await prepareDev({ cwd: other, envFiles: files, exec: async () => 0, log: (line) => void logs.push(line), probeMs: 1500 });
      // No 'env': nothing was copied over the project's own files. The first migration is written and applied.
      expect(prepared.did).toEqual(['migration', 'migrate']);
      expect(prepared.env.DATABASE_URL).toBe(otherUrl);
      expect(await readFile(join(other, '.env'), 'utf8')).toBe(`DATABASE_URL=${otherUrl}\n`);

      const results = byName(await runDoctor({ cwd: other, env: projectEnv(other, files.files), envFiles: files, timeoutMs: 3000 }));
      expect(results.env).toMatchObject({ status: 'ok', detail: 'Env files: .env.development, .env' });
      expect(results.database?.status).toBe('ok');
      expect(results.redis?.status).toBe('ok');

      const none = byName(await runDoctor({ cwd: other, env: {}, envFiles: { files: ['.env.staging'], configured: true }, timeoutMs: 1000 }));
      expect(none.env).toMatchObject({ status: 'fail', detail: "None of the project's env files exists (.env.staging)", fix: 'Create .env.staging' });
    } finally {
      for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
      await rm(other, { recursive: true, force: true });
    }
  }, 60_000);

  it('runs from the command line: doctor --json exits 0 when ready and 1 when not; dev --prepare-only does the preparation', async () => {
    const cli = (args: string[], over: Record<string, string> = {}) =>
      run(process.execPath, [CLI, ...args], { cwd: project, env: { ...process.env, ...env, NO_COLOR: '1', ...over } }).then(
        (r) => ({ code: 0, stdout: r.stdout, stderr: r.stderr }),
        (e: { code: number; stdout: string; stderr: string }) => ({ code: e.code, stdout: e.stdout, stderr: e.stderr }),
      );
    const ready = await cli(['doctor', '--json']);
    expect(ready.code).toBe(0);
    expect(JSON.parse(ready.stdout)).toMatchObject({ version: 1, ready: true, checks: expect.arrayContaining([expect.objectContaining({ name: 'migrations', status: 'ok' })]) });

    const text = await cli(['doctor']);
    expect(text.stdout).toMatch(/ok\s+database\s+Postgres /);
    expect(text.stdout).toMatch(/Ready to run\./);

    const broken = await cli(['doctor'], { DATABASE_URL: NOWHERE });
    expect(broken.code).toBe(1);
    expect(broken.stdout).toMatch(/fail database\s+Can't reach Postgres/);
    expect(broken.stdout).toMatch(/→ docker compose up -d/);
    expect(broken.stdout).toMatch(/1 problem\(s\) to fix/);

    const prepared = await cli(['dev', '--prepare-only']);
    expect(prepared.code).toBe(0);
    const offline = await cli(['dev', '--prepare-only', '--no-services', '--wait', '700'], { DATABASE_URL: NOWHERE });
    expect(offline.code).toBe(1);
    expect(offline.stderr).toMatch(/Postgres at postgres:\/\/postgres:\*\*\*@127\.0\.0\.1:1\/none still isn't answering/);
    expect(offline.stdout).toMatch(/waiting for Postgres \(not started here/);
    // The same from the environment, with no flag to remember
    const switched = await cli(['dev', '--prepare-only', '--wait', '700'], { DATABASE_URL: NOWHERE, MARIACHI_DEV_SERVICES: 'off' });
    expect(switched.code).toBe(1);
    expect(switched.stdout).toMatch(/waiting for Postgres \(not started here/);
    expect(switched.stdout).not.toMatch(/docker compose/);
  }, 60_000);
});
