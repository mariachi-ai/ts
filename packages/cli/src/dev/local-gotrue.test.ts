import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseEnv } from 'node:util';
import { afterEach, describe, expect, it } from 'vitest';
import { composeGoTrue, composeServices, goTrueStartHint, goTrueUrl, gotrueService, runDoctor, secretsIn } from '../doctor/checks';
import { probeGoTrue } from '../doctor/probe';
import { prepareDev } from './prepare';

/** The services of a generated `--auth gotrue` project, as `composeServices` reads them. */
const COMPOSE = `services:
  postgres:
    image: postgres:16-alpine
  auth-schema:
    image: postgres:16-alpine
    command:
      - psql
      - -c
      - |
        CREATE SCHEMA IF NOT EXISTS auth;
  auth:
    image: supabase/auth:v2.197.0
    environment:
      GOTRUE_JWT_KEYS: \${GOTRUE_JWT_KEYS:?is not set}
  mail:
    image: axllent/mailpit:v1.27.11
`;

const servers: Server[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map((s) => new Promise((done) => s.close(done))));
});

/** A stand-in for GoTrue's /health on a free port. `listen()` starts it; until then nothing answers there. */
async function fakeGoTrue(status = 200) {
  const server = createServer((req, res) => {
    if (req.url === '/health') res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify({ version: 'v2.197.0', name: 'GoTrue' }));
    else res.writeHead(404).end();
  });
  servers.push(server);
  // Find a free port, then let it go until the test starts "GoTrue" there
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const { port } = server.address() as AddressInfo;
  await new Promise((done) => server.close(done));
  return { url: `http://127.0.0.1:${port}`, listen: () => new Promise<void>((done) => server.listen(port, '127.0.0.1', done)) };
}

/** A project as `init --auth gotrue` leaves it, as far as these steps read it. */
function project(env: string, files: Record<string, string> = {}): string {
  const dir = mkdtempSync(join(tmpdir(), 'mariachi-gotrue-'));
  mkdirSync(join(dir, 'src'));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'app', dependencies: { '@mariachi/core': '^0.1.0', '@mariachi/auth-gotrue': '^0.1.0' } }));
  writeFileSync(join(dir, '.env.example'), env);
  writeFileSync(join(dir, 'docker-compose.yml'), COMPOSE);
  for (const [file, text] of Object.entries(files)) writeFileSync(join(dir, file), text);
  return dir;
}

const EXAMPLE = (url: string) => `AUTH_URL=${url}\nGOTRUE_JWT_SECRET=\nGOTRUE_JWT_KEYS=\n`;

describe('a local GoTrue', () => {
  it('is the Compose service whose image is GoTrue', () => {
    expect(gotrueService(composeServices(COMPOSE))).toBe('auth');
    for (const image of ['supabase/gotrue:v2.151.0', 'netlify/gotrue', 'public.ecr.aws/supabase/auth:v2.197.0']) {
      expect(gotrueService([{ name: 'x', image }]), image).toBe('x');
    }
    expect(gotrueService([{ name: 'auth', image: 'acme/auth-proxy:1' }, { name: 'oauth', image: 'acme/oauth:1' }])).toBeUndefined();
    expect(composeGoTrue(project(''))).toBe('auth');
  });

  it("is read where the app reads it, as its src/auth.ts works that out", () => {
    expect(goTrueUrl({ AUTH_URL: 'http://localhost:9999' })).toBe('http://localhost:9999');
    expect(goTrueUrl({ APP_ORIGIN: 'https://app.example.com/' })).toBe('https://app.example.com/auth/v1');
    expect(goTrueUrl({ AUTH_ORIGIN: 'https://app.example.com', AUTH_PATH: '/auth' })).toBe('https://app.example.com/auth');
    expect(goTrueUrl({})).toBe('http://127.0.0.1:9999');
  });

  it('is started by its Compose service, once it has its keys', () => {
    const dir = project('');
    expect(goTrueStartHint(dir, 'http://localhost:9999', { GOTRUE_JWT_KEYS: '[{}]', GOTRUE_JWT_SECRET: 'x' }, '.env')).toBe(
      'docker compose up -d auth (or: mariachi dev, which starts the services and waits for them)',
    );
    expect(goTrueStartHint(dir, 'http://localhost:9999', {}, '.env')).toBe(
      'GOTRUE_JWT_SECRET and GOTRUE_JWT_KEYS are empty, and the local GoTrue signs with them: mariachi dev writes new ones into .env, then starts it',
    );
    expect(goTrueStartHint(dir, 'https://abc.supabase.co/auth/v1', {}, '.env')).toBe('Check that GoTrue at https://abc.supabase.co/auth/v1 is running and reachable from here');
    writeFileSync(join(dir, 'docker-compose.yml'), 'services:\n  postgres:\n    image: postgres:16-alpine\n');
    expect(goTrueStartHint(dir, 'http://localhost:9999', {}, '.env')).toMatch(/^Nothing in docker-compose\.yml runs GoTrue: set AUTH_URL in \.env/);
  });

  it("answers its /health with its version, and a gateway that wants a key still counts as there", async () => {
    const up = await fakeGoTrue();
    await expect(probeGoTrue(up.url, 1000)).rejects.toMatchObject({ code: 'cli/unreachable' });
    await up.listen();
    expect(await probeGoTrue(up.url, 1000)).toEqual({ version: 'v2.197.0' });
    const gated = await fakeGoTrue(401);
    await gated.listen();
    expect(await probeGoTrue(gated.url, 1000)).toEqual({ version: null });
    const broken = await fakeGoTrue(503);
    await broken.listen();
    await expect(probeGoTrue(broken.url, 1000)).rejects.toThrow(/answered 503/);
  });
});

describe('mariachi doctor, in a GoTrue project', () => {
  it('checks GoTrue, and says how to start the local one', async () => {
    const gotrue = await fakeGoTrue();
    // What .env holds is passed as the environment below; the file has to be there for the env check
    const dir = project(EXAMPLE(gotrue.url), { '.env': '' });
    const keys = { GOTRUE_JWT_KEYS: '[{}]', GOTRUE_JWT_SECRET: 'x'.repeat(64) };
    const down = await runDoctor({ cwd: dir, env: { AUTH_URL: gotrue.url, ...keys }, timeoutMs: 1000 });
    expect(down.find((r) => r.name === 'auth')).toMatchObject({ status: 'fail', fix: 'docker compose up -d auth (or: mariachi dev, which starts the services and waits for them)' });
    await gotrue.listen();
    const up = await runDoctor({ cwd: dir, env: { AUTH_URL: gotrue.url, ...keys }, timeoutMs: 1000 });
    expect(up.find((r) => r.name === 'auth')).toEqual({ name: 'auth', status: 'ok', detail: `GoTrue v2.197.0 at ${gotrue.url}/ (the local one, in Compose)` });
    // An empty key is made, not copied from .env.example
    const env = up.find((r) => r.name === 'env');
    expect(env).toMatchObject({ status: 'ok' });
    const unset = await runDoctor({ cwd: dir, env: { AUTH_URL: gotrue.url }, timeoutMs: 1000 });
    expect(unset.find((r) => r.name === 'env')?.fix).toBe("mariachi dev (it writes the local GoTrue's keys into .env where they are empty)");
  });

  it("keeps the local GoTrue's keys out of every message, and shows where GoTrue is", () => {
    const found = secretsIn({ AUTH_URL: 'http://localhost:9999', AUTH_SERVICE_KEY: 'eyJhbGciOi.service.key', GOTRUE_JWT_KEYS: '[{"d":"private"}]', GOTRUE_JWT_SECRET: 'abcdef123456' });
    expect(found).toEqual(expect.arrayContaining(['eyJhbGciOi.service.key', '[{"d":"private"}]', 'abcdef123456']));
    expect(found).not.toContain('http://localhost:9999');
  });

  it('skips the check in a project that does not sign in with GoTrue', async () => {
    const dir = project('');
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'app', dependencies: { '@mariachi/core': '^0.1.0' } }));
    const results = await runDoctor({ cwd: dir, env: {}, timeoutMs: 500 });
    expect(results.find((r) => r.name === 'auth')).toEqual({ name: 'auth', status: 'skip', detail: 'This project does not sign in with GoTrue' });
  });
});

describe('mariachi dev, in a GoTrue project', () => {
  const quietly = (dir: string, exec: (command: string, args: string[]) => Promise<number>) => {
    const logs: string[] = [];
    return { logs, run: () => prepareDev({ cwd: dir, exec, log: (line) => void logs.push(line), probeMs: 500, waitMs: 5000 }) };
  };

  it("makes .env with the local GoTrue's own keys, starts the Compose services when GoTrue isn't answering, and waits for it", async () => {
    const gotrue = await fakeGoTrue();
    const dir = project(EXAMPLE(gotrue.url));
    const calls: string[][] = [];
    const dev = quietly(dir, async (command, args) => {
      calls.push([command, ...args]);
      await gotrue.listen();
      return 0;
    });
    expect((await dev.run()).did).toEqual(['env', 'services']);
    expect(calls).toEqual([['docker', 'compose', 'up', '-d']]);
    expect(dev.logs).toEqual([
      'created .env from .env.example, with new keys for the local GoTrue (GOTRUE_JWT_SECRET, GOTRUE_JWT_KEYS)',
      'starting services (docker compose up -d): GoTrue not answering',
      'GoTrue is up',
    ]);
    const env = parseEnv(readFileSync(join(dir, '.env'), 'utf8'));
    expect(env.AUTH_URL).toBe(gotrue.url);
    expect(env.GOTRUE_JWT_SECRET).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.parse(env.GOTRUE_JWT_KEYS as string)).toEqual([expect.objectContaining({ kty: 'EC', alg: 'ES256' })]);

    // Running again: everything is there
    const again = quietly(dir, async () => 1);
    expect((await again.run()).did).toEqual([]);
  });

  it('fills keys an existing .env has empty, and touches nothing else in it', async () => {
    const gotrue = await fakeGoTrue();
    await gotrue.listen();
    const dir = project(EXAMPLE(gotrue.url), { '.env': `AUTH_URL=${gotrue.url}\n# a note of mine\nGOTRUE_JWT_SECRET=mine\nGOTRUE_JWT_KEYS=\n` });
    const dev = quietly(dir, async () => 1);
    expect((await dev.run()).did).toEqual(['keys']);
    expect(dev.logs).toEqual(['wrote new keys for the local GoTrue (GOTRUE_JWT_KEYS) into .env, where they were empty']);
    const text = readFileSync(join(dir, '.env'), 'utf8');
    expect(text).toMatch(/^AUTH_URL=.+\n# a note of mine\nGOTRUE_JWT_SECRET=mine\nGOTRUE_JWT_KEYS='\[\{.+\}\]'\n$/);
  });

  it('leaves a hosted GoTrue alone, and the keys of a project with no local one', async () => {
    const dir = project(EXAMPLE('https://abc.supabase.co/auth/v1'));
    const dev = quietly(dir, async () => {
      throw new Error('Docker was not to be called'); // mariachi-lint-ignore test double
    });
    expect((await dev.run()).did).toEqual(['env']);
    const elsewhere = project(EXAMPLE('http://127.0.0.1:1'));
    writeFileSync(join(elsewhere, 'docker-compose.yml'), 'services:\n  postgres:\n    image: postgres:16-alpine\n');
    const plain = quietly(elsewhere, async () => 1);
    expect((await plain.run()).did).toEqual(['env']);
    expect(plain.logs).toEqual(['created .env from .env.example']);
    expect(readFileSync(join(elsewhere, '.env'), 'utf8')).toBe(EXAMPLE('http://127.0.0.1:1'));
  });
});
