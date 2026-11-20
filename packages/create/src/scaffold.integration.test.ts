import { randomUUID } from 'node:crypto';
import { execFile, spawn } from 'node:child_process';
import { chmod, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { type AddressInfo, createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseEnv, promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startPostgres, startRedis, stopAll } from '../../../test/setup';
import { JWTAdapter } from '@mariachi/auth';
import { addKit } from '@mariachi/design-kits';
import { signStandardWebhook } from '@mariachi/webhooks';
import {
  createProject,
  generateController,
  generateEntity,
  generateEvent,
  generateIntegration,
  generateJob,
  generatePage,
  generateProcedure,
  generateSeed,
  generateService,
  generateSubscriber,
  generateWebhook,
  validate,
} from './index';

const run = promisify(execFile);
const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Vitest's own TypeScript runner, so a generated entry point runs the way `tsx` runs it, without another dependency.
const viteNode = join(dirname(createRequire(createRequire(import.meta.url).resolve('vitest/package.json')).resolve('vite-node/package.json')), 'vite-node.mjs');
// Inside this package so `@mariachi/*`, zod, drizzle-orm and @types/node resolve from its node_modules.
const workDir = join(pkgRoot, '.scaffold-test');
const project = join(workDir, 'app');

async function sh(bin: string, args: string[], cwd = project) {
  try {
    return await run(process.execPath, [join(pkgRoot, 'node_modules', bin), ...args], {
      cwd,
      maxBuffer: 16 * 1024 * 1024,
      // Turbo sets FORCE_COLOR; ANSI codes would break the output assertions.
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    });
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string };
    throw new Error(`${bin} failed:\n${e.stdout ?? ''}\n${e.stderr ?? ''}`); // mariachi-lint-ignore
  }
}

/**
 * Runs the project's own `lint` script as `pnpm lint` would: `mariachi` is this repo's CLI and `tsc`
 * the TypeScript this package resolves, put first on the PATH.
 */
async function lint(cwd: string): Promise<string> {
  const script = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf-8')).scripts.lint as string;
  const bin = join(cwd, '.lint-bin');
  await mkdir(bin, { recursive: true });
  const shim = async (name: string, target: string) => {
    await writeFile(join(bin, name), `#!/bin/sh\nexec "${process.execPath}" "${target}" "$@"\n`);
    await chmod(join(bin, name), 0o755);
  };
  await shim('mariachi', resolve(pkgRoot, '../cli/dist/index.js'));
  await shim('tsc', join(pkgRoot, 'node_modules/typescript/bin/tsc'));
  try {
    const { stdout } = await run('sh', ['-c', script], {
      cwd,
      maxBuffer: 16 * 1024 * 1024,
      env: { ...process.env, PATH: `${bin}:${process.env.PATH ?? ''}`, FORCE_COLOR: '0', NO_COLOR: '1' },
    });
    return stdout;
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string };
    throw new Error(`lint failed:\n${e.stdout ?? ''}\n${e.stderr ?? ''}`); // mariachi-lint-ignore
  } finally {
    await rm(bin, { recursive: true, force: true });
  }
}

function freePort(): Promise<number> {
  return new Promise((ok, fail) => {
    const server = createServer().once('error', fail);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      server.close(() => ok(port));
    });
  });
}

/**
 * Runs a project's `src/main.ts` until `/api/health/ready` answers, then stops it. `status` is null if
 * it exited or never answered. `probe` runs against the live server once it's ready.
 */
async function bootReady<T = undefined>(
  cwd: string,
  env: Record<string, string>,
  probe?: (base: string) => Promise<T>,
): Promise<{ status: number | null; output: string; probed?: T }> {
  // A port of the test's choosing (env.PORT) when something outside the app has to know it beforehand
  const port = Number(env.PORT) || (await freePort());
  const child = spawn(process.execPath, [viteNode, 'src/main.ts'], {
    cwd,
    env: { ...process.env, ...env, PORT: String(port), FORCE_COLOR: '0', NO_COLOR: '1' },
  });
  let output = '';
  const collect = (chunk: Buffer) => {
    output += chunk;
  };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  const exited = new Promise<'exited'>((ok) => child.once('exit', () => ok('exited')));
  const wait = (ms: number) => new Promise<'waited'>((ok) => setTimeout(() => ok('waited'), ms));
  try {
    for (const deadline = Date.now() + 60_000; Date.now() < deadline; ) {
      if ((await Promise.race([exited, wait(250)])) === 'exited') return { status: null, output };
      const res = await fetch(`http://127.0.0.1:${port}/api/health/ready`).catch(() => null);
      if (res) return { status: res.status, output, probed: res.ok && probe ? await probe(`http://127.0.0.1:${port}`) : undefined };
    }
    return { status: null, output };
  } finally {
    child.kill('SIGTERM');
    if ((await Promise.race([exited, wait(10_000)])) === 'waited') child.kill('SIGKILL');
  }
}

const APPLY_SCHEMA = `import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { applySchema, createPostgresDatabase } from '@mariachi/database-postgres';
import * as schema from './src/schema/index';

const name = 'boot_' + randomUUID().replaceAll('-', '');
const server = createPostgresDatabase({ url: process.argv[2] as string });
await server.connect();
await server.db.execute(sql.raw('create database ' + name));
await server.disconnect();
const url = new URL(process.argv[2] as string);
url.pathname = '/' + name;
if (process.argv[3] !== 'empty') {
  const database = createPostgresDatabase({ url: url.href });
  await database.connect();
  await applySchema(database.db, schema);
  await database.disconnect();
}
console.log('DATABASE_URL=' + url.href);
`;

/** Written into the project: an event added to the outbox in a transaction reaches its subscriber, as app.ts wires them. */
const OUTBOX_E2E_TEST = `import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import { withTransaction } from '@mariachi/database-postgres';
import { Outbox } from '@mariachi/events/outbox';
import { createTestContext } from '@mariachi/testing';
import { billingInvoicePaid } from './events/billing-invoice-paid.event';
import { startApp, type RunningApp } from './testing/e2e';

let running: RunningApp;
beforeAll(async () => {
  running = await startApp();
});
afterAll(() => running?.stop());

it('relays an event from the outbox, once the transaction commits, to a subscriber in the publisher tenant', async () => {
  const seen = vi.fn();
  running.app.events.subscribe(billingInvoicePaid, async (ctx, payload) => {
    seen(ctx.tenantId, payload);
  });
  const ctx = createTestContext({ tenantId: 'tenant-a', userId: 'user-a' });
  const outbox = new Outbox(running.app.database.db);
  await withTransaction(running.app.database.db, ctx, () => outbox.add(ctx, billingInvoicePaid, { id: 'invoice-1' }));
  await vi.waitFor(() => expect(seen).toHaveBeenCalledWith('tenant-a', { id: 'invoice-1' }), { timeout: 10_000 });
});
`;

// One Postgres for every boot below; each gets a database of its own in it
let postgres: Promise<string> | undefined;

/**
 * A new database on the test Postgres holding the project's own tables (its src/schema), as its
 * migrations would leave it. Stands in for `mariachi dev`, which migrates before it starts the app.
 * With `empty`, a new database with nothing in it.
 */
async function migratedDatabase(cwd: string, empty = false): Promise<string> {
  const script = join(cwd, 'apply-schema.mts');
  await writeFile(script, APPLY_SCHEMA);
  try {
    postgres ??= startPostgres();
    const { stdout } = await run(process.execPath, [viteNode, script, await postgres, ...(empty ? ['empty'] : [])], { cwd, env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' } });
    const url = /^DATABASE_URL=(.+)$/m.exec(stdout)?.[1];
    if (!url) throw new Error(`no database url in: ${stdout}`); // mariachi-lint-ignore
    return url;
  } finally {
    await rm(script, { force: true });
  }
}

describe('generated project', () => {
  beforeAll(async () => {
    await rm(workDir, { recursive: true, force: true });
    await createProject({ name: 'scaffold-app', outputDir: project });
    await generateService({ name: 'billing-report', projectRoot: project });
    await generateController({ name: 'billing-report', projectRoot: project });
    await generateController({ name: 'status', projectRoot: project });
    await generateEntity({ name: 'invoice-item', projectRoot: project });
    await generateJob({ name: 'send-digest', projectRoot: project });
    await generateIntegration({ name: 'acme', projectRoot: project });
    await generateSeed({ name: 'demo-data', projectRoot: project });
    await generateEntity({
      name: 'task',
      projectRoot: project,
      fields: ['title:string', 'done:boolean', 'dueAt:timestamp?', 'points:integer:optional', 'day:date', 'ownerId:uuid', 'score:number', 'notes:text?'],
    });
    await generateEntity({ name: 'person', projectRoot: project });
    await generateEvent({ name: 'billing.invoice.paid', projectRoot: project, subscriber: 'send-receipt' });
    await generateSubscriber({ event: 'billing.invoice.paid', name: 'audit-payment', projectRoot: project });
    await generateWebhook({ name: 'acme', projectRoot: project });
    await generateProcedure({ service: 'note', name: 'archive', projectRoot: project });
    await generateProcedure({ service: 'billing-report', name: 'summarize-month', projectRoot: project });
    await writeFile(join(project, 'src/events.e2e.test.ts'), OUTBOX_E2E_TEST);
  }, 30_000);

  afterAll(async () => {
    await rm(workDir, { recursive: true, force: true });
    await stopAll();
    // The Postgres the boots shared went with it
    postgres = undefined;
  });

  it('registers generated pieces in the registry files', async () => {
    const services = await readFile(join(project, 'src/services/index.ts'), 'utf-8');
    // The example notes are kept in a search index; entities generated without --search are not
    expect(services).toContain('registerNotesHandlers(communication, new NotesService(new NotesRepository(deps.db), deps.search, deps.db));');
    expect(services).toContain('registerPeopleHandlers(communication, new PeopleService(new PeopleRepository(deps.db)));');
    expect(await readFile(join(project, 'src/search/index.ts'), 'utf-8')).toMatch(/export const searchIndexes: SearchIndex\[\] = \[\n\s+notesIndex,\n\s+\/\/ mariachi:search\n\];/);
    expect(services).toContain('registerInvoiceItemsHandlers(');
    expect(services).toContain('registerBillingReportHandlers(communication, new BillingReportService());');
    const controllers = await readFile(join(project, 'src/api/controllers/index.ts'), 'utf-8');
    expect(controllers).toMatch(/new NotesController\(communication\),\n\s+new BillingReportController\(communication\),/);
    expect(await readFile(join(project, 'src/schema/index.ts'), 'utf-8')).toContain("export * from './invoice-items';");
    expect(await readFile(join(project, 'src/jobs/index.ts'), 'utf-8')).toContain('sendDigestJob,');
    const seeds = await readFile(join(project, 'src/seeds/index.ts'), 'utf-8');
    expect(seeds).toContain("import { demoDataSeed } from './demo-data.seed';");
    expect(seeds).toMatch(/export const seeds: SeedDefinition<DrizzleDb>\[\] = \[\n\s+demoDataSeed,\n\s+\/\/ mariachi:seeds\n\];/);
    const pkg = JSON.parse(await readFile(join(project, 'package.json'), 'utf-8'));
    expect(pkg.dependencies['@mariachi/core']).toMatch(/^\^\d+\.\d+\.\d+/);
  });

  it('registers the events, webhooks and procedures it was given', async () => {
    const events = await readFile(join(project, 'src/events/index.ts'), 'utf-8');
    expect(events).toMatch(/registerSendReceiptSubscriber\(events, deps\);\n\s+registerAuditPaymentSubscriber\(events, deps\);/);
    expect(await readFile(join(project, 'src/webhooks/index.ts'), 'utf-8')).toContain("signed('ACME_WEBHOOK_SECRET'");
    expect(await readFile(join(project, 'src/jobs/index.ts'), 'utf-8')).toContain('acmeWebhookJob,');
    const schema = await readFile(join(project, 'src/schema/index.ts'), 'utf-8');
    expect(schema).toContain("export * from './events';");
    expect(schema).toContain("export * from './webhooks';");
    expect(schema).toContain("export * from './people';");
    expect(await readFile(join(project, 'src/services/notes/notes.handler.ts'), 'utf-8')).toContain("communication.register('notes.archive'");
    expect(await readFile(join(project, 'src/contracts/billing-report.ts'), 'utf-8')).toContain("'billingReport.summarizeMonth'");
  });

  it('refuses to overwrite and leaves registries untouched', async () => {
    const before = await readFile(join(project, 'src/services/index.ts'), 'utf-8');
    await expect(generateEntity({ name: 'note', projectRoot: project })).rejects.toMatchObject({ code: 'create/file-exists' });
    expect(await readFile(join(project, 'src/services/index.ts'), 'utf-8')).toBe(before);
  });

  it('typechecks against the current framework packages', async () => {
    await sh('typescript/bin/tsc', ['-p', 'tsconfig.json']);
  }, 120_000);

  it('passes its own generated tests', async () => {
    const { stdout } = await sh('vitest/vitest.mjs', ['run', '--root', project]);
    for (const test of [
      'billing-invoice-paid.event.test.ts',
      'send-receipt.subscriber.test.ts',
      'audit-payment.subscriber.test.ts',
      'acme.controller.test.ts',
      'notes.archive.test.ts',
      'billing-report.summarize-month.test.ts',
      'tasks.service.test.ts',
    ]) {
      expect(stdout).toContain(test);
    }
    expect(stdout).toMatch(/Tests\s+\d+ passed/);
  }, 120_000);

  it('passes its own end-to-end tests: the app over HTTP against a throwaway Postgres, which holds its jobs and search too', async () => {
    const { stdout } = await sh('vitest/vitest.mjs', ['run', '--root', project, '--config', join(project, 'vitest.e2e.config.ts')]);
    expect(stdout).toMatch(/src\/app\.e2e\.test\.ts/);
    expect(stdout).toMatch(/src\/search\.e2e\.test\.ts/);
    expect(stdout).toMatch(/notes\.e2e\.test\.ts/);
    expect(stdout).toMatch(/invoice-items\.e2e\.test\.ts/);
    expect(stdout).toMatch(/tasks\.e2e\.test\.ts/);
    expect(stdout).toMatch(/people\.e2e\.test\.ts/);
    expect(stdout).toMatch(/src\/events\.e2e\.test\.ts/);
    expect(stdout).toMatch(/Tests\s+\d+ passed/);
    expect(stdout).not.toMatch(/failed/);
  }, 300_000);

  it('serves its webhook on WEBHOOK_PORT once its secret is set: a signed delivery is taken once, an unsigned one refused', async () => {
    const key = Buffer.from('the scaffold test signing key 32');
    const webhookPort = await freePort();
    const { status, output, probed } = await bootReady(
      project,
      {
        SERVICE_NAME: 'scaffold-app',
        NODE_ENV: 'development',
        DATABASE_URL: await migratedDatabase(project),
        JWT_SECRET: 'scaffold-test-secret-at-least-32-characters',
        WEBHOOK_PORT: String(webhookPort),
        ACME_WEBHOOK_SECRET: `whsec_${key.toString('base64')}`,
      },
      async () => {
        const url = `http://127.0.0.1:${webhookPort}/webhooks/acme/events`;
        const payload = JSON.stringify({ type: 'thing.updated', data: { id: 'thing-1' } });
        const timestamp = Math.floor(Date.now() / 1000);
        const headers = {
          'content-type': 'application/json',
          'webhook-id': 'msg_scaffold',
          'webhook-timestamp': String(timestamp),
          'webhook-signature': signStandardWebhook(key, 'msg_scaffold', timestamp, payload),
        };
        // The webhook server starts with the API, at the same priority: wait for it
        let first: Response | undefined;
        for (const deadline = Date.now() + 10_000; !first && Date.now() < deadline; ) {
          first = await fetch(url, { method: 'POST', headers, body: payload }).catch(async () => {
            await new Promise((ok) => setTimeout(ok, 100));
            return undefined;
          });
        }
        const again = await fetch(url, { method: 'POST', headers, body: payload });
        const unsigned = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload });
        return { first: first?.status, again: again.status, duplicate: await again.json(), unsigned: unsigned.status };
      },
    );
    expect({ status, output }).toMatchObject({ status: 200 });
    expect(probed).toMatchObject({ first: 202, again: 200, duplicate: { duplicate: true }, unsigned: 401 });
  }, 180_000);

  it('boots its main.ts and searches its notes over HTTP in its own Postgres, each tenant finding only its own', async () => {
    const secret = 'scaffold-test-secret-at-least-32-characters';
    const { status, output, probed } = await bootReady(
      project,
      { SERVICE_NAME: 'scaffold-app', NODE_ENV: 'development', DATABASE_URL: await migratedDatabase(project), JWT_SECRET: secret },
      async (base) => {
        const jwt = new JWTAdapter({ secret });
        const as = async (tenantId: string) => ({ authorization: `Bearer ${await jwt.sign({ userId: `user-${tenantId}`, tenantId, scopes: [] })}` });
        const create = async (tenantId: string, name: string) => {
          const res = await fetch(`${base}/api/notes`, { method: 'POST', headers: { ...(await as(tenantId)), 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
          return ((await res.json()) as { id: string }).id;
        };
        const search = async (tenantId: string, q: string) => {
          const res = await fetch(`${base}/api/notes/search?q=${encodeURIComponent(q)}`, { headers: await as(tenantId) });
          return ((await res.json()) as { data: Array<{ id: string; name: string }> }).data;
        };
        const acme = await create('acme', 'Quarterly harbour report');
        const globex = await create('globex', 'Harbour inspection');
        const found = { acme: await search('acme', 'harb'), globex: await search('globex', 'harbour'), initech: await search('initech', 'harbour') };
        await fetch(`${base}/api/notes/${acme}`, { method: 'PATCH', headers: { ...(await as('acme')), 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Annual report' }) });
        return { acme, globex, found, afterUpdate: { harbour: await search('acme', 'harbour'), annual: await search('acme', 'annual') } };
      },
    );
    expect({ status, output }).toMatchObject({ status: 200 });
    const { acme, globex, found, afterUpdate } = probed as NonNullable<typeof probed>;
    expect(found.acme).toEqual([expect.objectContaining({ id: acme, name: 'Quarterly harbour report' })]);
    expect(found.globex.map((note) => note.id)).toEqual([globex]);
    expect(found.initech).toEqual([]);
    expect(afterUpdate.harbour).toEqual([]);
    expect(afterUpdate.annual.map((note) => note.id)).toEqual([acme]);
  }, 180_000);

  it('boots its main.ts against Postgres alone and answers ready', async () => {
    const { status, output } = await bootReady(project, {
      SERVICE_NAME: 'scaffold-app',
      NODE_ENV: 'development',
      DATABASE_URL: await migratedDatabase(project),
      JWT_SECRET: 'scaffold-test-secret-at-least-32-characters',
    });
    expect(output).not.toContain('database/not-connected');
    expect({ status, output }).toMatchObject({ status: 200 });
  }, 180_000);

  it('says to migrate, and stops, when the database has none of its tables', async () => {
    const { status, output } = await bootReady(project, {
      SERVICE_NAME: 'scaffold-app',
      NODE_ENV: 'development',
      DATABASE_URL: await migratedDatabase(project, true),
      JWT_SECRET: 'scaffold-test-secret-at-least-32-characters',
    });
    expect(status).toBeNull();
    // The first thing to look for its tables says they are missing and what to do
    expect(output).toContain('The search tables are not there');
    expect(output).toContain('migrate');
  }, 180_000);

  it('runs its jobs on Redis when REDIS_URL is set, and is ready with both', async () => {
    const { status, output } = await bootReady(project, {
      SERVICE_NAME: 'scaffold-app',
      NODE_ENV: 'development',
      DATABASE_URL: await migratedDatabase(project),
      REDIS_URL: await startRedis(),
      JWT_SECRET: 'scaffold-test-secret-at-least-32-characters',
    });
    expect({ status, output }).toMatchObject({ status: 200 });
  }, 180_000);

  it('passes mariachi validate and its lint script; the controller generated without its service is the one warning', async () => {
    const result = await validate(project);
    expect(result.valid).toBe(true);
    expect(result.violations).toEqual([
      expect.objectContaining({ rule: 'procedure-registered', severity: 'warning', file: 'src/api/controllers/status.controller.ts', line: 14 }),
    ]);
    expect(result.filesChecked).toBeGreaterThan(15);
    expect(await lint(project)).toMatch(/0 error\(s\), 1 warning\(s\)/);
  }, 120_000);

  it('flags a handler that drops ctx, a route without a schema and a misnamed procedure, and its lint fails', async () => {
    const handler = join(project, 'src/services/notes/notes.handler.ts');
    const controller = join(project, 'src/api/controllers/notes.controller.ts');
    const originals = [await readFile(handler, 'utf-8'), await readFile(controller, 'utf-8')] as const;
    const broken = originals[0]
      .replace('handler: (ctx, input) => service.create(ctx, input)', 'handler: (input) => service.create(input as never, input as never)')
      .replace("'notes.update'", "'notes.update-note'");
    // Where the findings land in the handler, read from the file so a template change doesn't move them
    const lineOf = (needle: string) => broken.split('\n').findIndex((l) => l.includes(needle)) + 1;
    await writeFile(handler, broken);
    const listRoute = "{ schema: { query: listNotesInput, response: noteListSchema }, summary: 'List notes' }";
    // Reported on the route's call, two lines above its options
    const listLine = originals[1].split('\n').findIndex((l) => l.includes(listRoute)) - 1;
    await writeFile(controller, originals[1].replace(listRoute, "{ summary: 'List notes' }"));
    try {
      const result = await validate(project);
      expect(result.violations.filter((v) => v.severity === 'error').map((v) => `${v.rule}@${v.file}:${v.line}`)).toEqual([
        `zod-at-boundaries@src/api/controllers/notes.controller.ts:${listLine}`,
        `ctx-first@src/services/notes/notes.handler.ts:${lineOf('handler: (input) =>')}`,
        `procedure-name-format@src/services/notes/notes.handler.ts:${lineOf("'notes.update-note'")}`,
      ]);
      await expect(lint(project)).rejects.toThrow(/3 error\(s\)/);
    } finally {
      await writeFile(handler, originals[0]);
      await writeFile(controller, originals[1]);
    }
  }, 120_000);

  it('flags a controller that imports a service', async () => {
    const file = join(project, 'src/api/controllers/notes.controller.ts');
    const original = await readFile(file, 'utf-8');
    await writeFile(file, `import { NotesService } from '../../services/notes/notes.service';\n${original}`);
    try {
      const result = await validate(project);
      expect(result.valid).toBe(false);
      expect(result.violations.filter((v) => v.severity === 'error')).toMatchObject([{ rule: 'no-service-import-in-controller', file: 'src/api/controllers/notes.controller.ts', line: 1 }]);
    } finally {
      await writeFile(file, original);
    }
  });
});

describe('generated project with --auth gotrue', () => {
  const app = join(workDir, 'gotrue-app');

  beforeAll(async () => {
    await rm(app, { recursive: true, force: true });
    await createProject({ name: 'gotrue-app', outputDir: app, auth: 'gotrue' });
    await generateEntity({ name: 'invoice-item', projectRoot: app });
  }, 30_000);

  afterAll(async () => {
    await rm(workDir, { recursive: true, force: true });
    await stopAll();
    // The Postgres the boots shared went with it
    postgres = undefined;
  });

  it('boots, serves the sign-in page to anyone, and asks everyone else for a token', async () => {
    const { status, output, probed } = await bootReady(
      app,
      {
        SERVICE_NAME: 'gotrue-app',
        NODE_ENV: 'development',
        DATABASE_URL: await migratedDatabase(app),
        AUTH_URL: 'https://auth.example.test/auth/v1',
        AUTH_ANON_KEY: 'publishable-key',
      },
      async (base) => {
        const page = await fetch(`${base}/api/sign-in`);
        const script = await fetch(`${base}/api/sign-in/client.js`);
        return {
          page: page.status,
          csp: page.headers.get('content-security-policy'),
          script: await script.text(),
          me: (await fetch(`${base}/api/me`)).status,
          forged: (await fetch(`${base}/api/me`, { headers: { authorization: 'Bearer not-a-token' } })).status,
        };
      },
    );
    expect({ status, output }).toMatchObject({ status: 200 });
    expect(probed).toMatchObject({ page: 200, me: 401, forged: 401 });
    expect(probed?.csp).toContain("connect-src 'self' https://auth.example.test;");
    expect(probed?.script).toContain('const AUTH = "https://auth.example.test/auth/v1";');
    expect(probed?.script).toContain('const ANON_KEY = "publishable-key";');
  }, 180_000);

  it('registers generated controllers beside the sign-in ones', async () => {
    const controllers = await readFile(join(app, 'src/api/controllers/index.ts'), 'utf-8');
    expect(controllers).toMatch(
      /new MeController\(communication\),\n\s+new SignInController\(communication\),\n\s+new NotesController\(communication\),\n\s+new InvoiceItemsController\(communication\),/,
    );
  });

  it('typechecks against the current framework packages', async () => {
    await sh('typescript/bin/tsc', ['-p', 'tsconfig.json'], app);
  }, 120_000);

  it('passes its own generated tests (config, /api/me with an organization and a personal tenant, the sign-in page and its PKCE flow)', async () => {
    const { stdout } = await sh('vitest/vitest.mjs', ['run', '--root', app], app);
    expect(stdout).toMatch(/src\/auth\.test\.ts/);
    expect(stdout).toMatch(/me\.controller\.test\.ts/);
    expect(stdout).toMatch(/sign-in\.controller\.test\.ts/);
    expect(stdout).toMatch(/pages\/sign-in\.test\.ts/);
    expect(stdout).toMatch(/Tests\s+\d+ passed/);
    expect(stdout).not.toMatch(/failed/);
  }, 120_000);

  it('passes its own end-to-end tests with no GoTrue: /api/me for a member, an owner and a personal tenant', async () => {
    const { stdout } = await sh('vitest/vitest.mjs', ['run', '--root', app, '--config', join(app, 'vitest.e2e.config.ts')], app);
    expect(stdout).toMatch(/src\/app\.e2e\.test\.ts/);
    expect(stdout).toMatch(/notes\.e2e\.test\.ts/);
    expect(stdout).toMatch(/Tests\s+\d+ passed/);
    expect(stdout).not.toMatch(/failed/);
  }, 300_000);

  it('passes mariachi validate with no findings, and its lint script', async () => {
    const result = await validate(app);
    expect(result.violations).toEqual([]);
    expect(await lint(app)).toMatch(/0 error\(s\), 0 warning\(s\)/);
  }, 120_000);
});

const JWT_SECRET = 'scaffold-test-secret-at-least-32-characters';

describe.each(['jwt', 'gotrue'] as const)('generated project with --orgs (--auth %s)', (auth) => {
  const app = join(workDir, `${auth}-orgs-app`);

  beforeAll(async () => {
    await rm(app, { recursive: true, force: true });
    await createProject({ name: `${auth}-orgs-app`, outputDir: app, auth, organizations: true });
    await generateEntity({ name: 'invoice-item', projectRoot: app });
  }, 30_000);

  afterAll(async () => {
    await rm(workDir, { recursive: true, force: true });
    await stopAll();
    // The Postgres the boots shared went with it
    postgres = undefined;
  });

  it('registers the organizations routes and tables beside the generated ones', async () => {
    const controllers = await readFile(join(app, 'src/api/controllers/index.ts'), 'utf-8');
    expect(controllers).toMatch(/new OrganizationsController\(communication\),\n\s+new NotesController\(communication\),\n\s+new InvoiceItemsController\(communication\),/);
    const schema = await readFile(join(app, 'src/schema/index.ts'), 'utf-8');
    expect(schema).toContain("export * from './organizations';");
    expect(schema).toContain("export * from './invoice-items';");
  });

  it('typechecks against the current framework packages', async () => {
    await sh('typescript/bin/tsc', ['-p', 'tsconfig.json'], app);
  }, 120_000);

  it('passes its own generated tests', async () => {
    const { stdout } = await sh('vitest/vitest.mjs', ['run', '--root', app], app);
    expect(stdout).toMatch(/Tests\s+\d+ passed/);
    expect(stdout).not.toMatch(/\d+ failed/);
  }, 120_000);

  it('passes its own end-to-end tests: organizations, invitations by email, and the generated entities inside an organization', async () => {
    const { stdout } = await sh('vitest/vitest.mjs', ['run', '--root', app, '--config', join(app, 'vitest.e2e.config.ts')], app);
    expect(stdout).toMatch(/src\/organizations\.e2e\.test\.ts/);
    expect(stdout).toMatch(/src\/app\.e2e\.test\.ts/);
    // Written by `generate entity`, unchanged: its users are put in organizations by the harness
    expect(stdout).toMatch(/notes\.e2e\.test\.ts/);
    expect(stdout).toMatch(/invoice-items\.e2e\.test\.ts/);
    expect(stdout).toMatch(/Tests\s+\d+ passed/);
    // Vitest's own count: the app logs "request failed" for a refusal a test provokes on purpose
    expect(stdout).not.toMatch(/\d+ failed/);
  }, 300_000);

  it('boots its main.ts, and answers the organization routes only to someone signed in', async () => {
    const { status, output, probed } = await bootReady(
      app,
      {
        SERVICE_NAME: `${auth}-orgs-app`,
        NODE_ENV: 'development',
        DATABASE_URL: await migratedDatabase(app),
        ...(auth === 'gotrue' ? { AUTH_URL: 'https://auth.example.test/auth/v1' } : { JWT_SECRET }),
      },
      async (base) => {
        const anonymous = (await fetch(`${base}/api/organizations`)).status;
        if (auth !== 'jwt') return { anonymous };
        // A real token for a user in no organization yet, through the app's own verifier. The route answers
        // before it reads the database (which has no tables here): the token was accepted, the invitation wasn't.
        const token = await new JWTAdapter({ secret: JWT_SECRET }).sign({ userId: 'user-ada', tenantId: '', scopes: [] });
        const accept = await fetch(`${base}/api/organizations/invitations/accept`, {
          method: 'POST',
          headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
          body: JSON.stringify({ token: 'not-an-invitation' }),
        });
        return { anonymous, tenantless: accept.status, code: ((await accept.json()) as { error?: { code?: string } }).error?.code };
      },
    );
    expect({ status, output }).toMatchObject({ status: 200 });
    expect(probed).toEqual(auth === 'jwt' ? { anonymous: 401, tenantless: 400, code: 'organizations/invitation-invalid' } : { anonymous: 401 });
  }, 180_000);

  it('passes mariachi validate with no findings, and its lint script', async () => {
    const result = await validate(app);
    expect(result.violations).toEqual([]);
    expect(await lint(app)).toMatch(/0 error\(s\), 0 warning\(s\)/);
  }, 120_000);
});

describe.each(['jwt', 'gotrue'] as const)('generated project with --ui (--auth %s)', (auth) => {
  const app = join(workDir, `${auth}-ui-app`);

  beforeAll(async () => {
    await rm(app, { recursive: true, force: true });
    // With organizations too, so the three options are shown to work together
    await createProject({ name: `${auth}-ui-app`, outputDir: app, auth, organizations: true, ui: true });
    // What `mariachi init --ui` does next: the kit into src/design (the generator's design.css stays)
    const kit = addKit('linen', { dir: join(app, 'src/design') });
    expect(kit.designCss.created).toBe(false);
    await generatePage({ name: 'team-settings', projectRoot: app });
  }, 30_000);

  afterAll(async () => {
    await rm(workDir, { recursive: true, force: true });
    await stopAll();
    // The Postgres the boots shared went with it
    postgres = undefined;
  });

  it('typechecks against the current framework packages, generated page included', async () => {
    await sh('typescript/bin/tsc', ['-p', 'tsconfig.json'], app);
  }, 120_000);

  it('passes its own generated tests, the pages among them', async () => {
    const { stdout } = await sh('vitest/vitest.mjs', ['run', '--root', app], app);
    expect(stdout).toMatch(/pages\/home\.test\.ts/);
    expect(stdout).toMatch(/pages\/team-settings\.test\.ts/);
    expect(stdout).toMatch(/Tests\s+\d+ passed/);
    expect(stdout).not.toMatch(/\d+ failed/);
  }, 120_000);

  it("passes its own end-to-end tests: the pages, the design kit, the library's components and the app's own files over HTTP", async () => {
    const { stdout } = await sh('vitest/vitest.mjs', ['run', '--root', app, '--config', join(app, 'vitest.e2e.config.ts')], app);
    expect(stdout).toMatch(/src\/pages\.e2e\.test\.ts/);
    expect(stdout).toMatch(/Tests\s+\d+ passed/);
    expect(stdout).not.toMatch(/\d+ failed/);
  }, 300_000);

  it('boots its main.ts and sends the pages, the generated one too, beside the API', async () => {
    const { status, output, probed } = await bootReady(
      app,
      {
        SERVICE_NAME: `${auth}-ui-app`,
        NODE_ENV: 'development',
        DATABASE_URL: await migratedDatabase(app),
        ...(auth === 'gotrue' ? { AUTH_URL: 'https://auth.example.test/auth/v1' } : { JWT_SECRET }),
      },
      async (base) => {
        const home = await fetch(`${base}/`);
        const page = await fetch(`${base}/team-settings`);
        return {
          home: home.status,
          type: home.headers.get('content-type'),
          bar: (await home.text()).includes('<a class="m-navbar-link" href="/team-settings" aria-current="false">Team settings</a>'),
          page: page.status,
          current: (await page.text()).includes('<a class="m-navbar-link" href="/team-settings" aria-current="page">Team settings</a>'),
          theme: (await fetch(`${base}/`).then((res) => res.text())).includes('<html lang="en" data-theme="linen" data-mode="auto">'),
          kit: (await fetch(`${base}/assets/design/index.css`)).status,
          motion: (await fetch(`${base}/assets/design/motion/motion.js`)).status,
          components: (await fetch(`${base}/assets/lib/components.css`)).status,
          behaviors: (await fetch(`${base}/assets/lib/behaviors.js`)).status,
          own: (await fetch(`${base}/assets/design.css`)).status,
          script: (await fetch(`${base}/assets/home.js`)).status,
          source: (await fetch(`${base}/assets/../src/app.ts`)).status,
          api: (await fetch(`${base}/api/organizations`)).status,
        };
      },
    );
    expect({ status, output }).toMatchObject({ status: 200 });
    expect(probed).toEqual({
      home: 200,
      type: 'text/html; charset=utf-8',
      bar: true,
      page: 200,
      current: true,
      theme: true,
      kit: 200,
      motion: 200,
      components: 200,
      behaviors: 200,
      own: 200,
      script: 200,
      source: 404,
      api: 401,
    });
  }, 180_000);

  it('passes mariachi validate with no findings, and its lint script', async () => {
    const result = await validate(app);
    expect(result.violations).toEqual([]);
    expect(await lint(app)).toMatch(/0 error\(s\), 0 warning\(s\)/);
  }, 120_000);

  it('will not start without its design kit, and says what to run', async () => {
    await rm(join(app, 'src/design'), { recursive: true, force: true });
    const { status, output } = await bootReady(app, {
      SERVICE_NAME: `${auth}-ui-app`,
      NODE_ENV: 'development',
      DATABASE_URL: 'postgres://nobody@127.0.0.1:1/none',
      ...(auth === 'gotrue' ? { AUTH_URL: 'https://auth.example.test/auth/v1' } : { JWT_SECRET }),
    });
    expect(status).toBeNull();
    expect(output).toContain('app/design-kit-missing');
    expect(output).toContain('pnpm mariachi design add linen');
  }, 60_000);
});

/**
 * A new `--auth gotrue --orgs --ui` project, run as `pnpm dev` runs it: its own Compose file brings up
 * Postgres, GoTrue and Mailpit (on free ports, through an override file, since the defaults may be
 * taken here), and the app starts against them with the .env `init` wrote. Then two people use it
 * from the generated pages' own scripts, run in the generated fake browser: one signs up, confirms by
 * email and invites the other; the other opens the emailed link, signs up through the accept page,
 * confirms, comes back and accepts. Every email is read from Mailpit's API.
 */
describe('generated project with --auth gotrue --orgs --ui, on its own Compose services', () => {
  const app = join(workDir, 'local-auth-app');
  const projectName = `mariachi-scaffold-${process.pid}`;
  const docker = (args: string[], env: Record<string, string> = {}) =>
    run('docker', ['compose', '-p', projectName, '-f', 'docker-compose.yml', '-f', 'compose.test.yml', ...args], {
      cwd: app,
      env: { ...process.env, ...env },
      maxBuffer: 16 * 1024 * 1024,
    });
  const ports = { postgres: 0, auth: 0, mailbox: 0, smtp: 0, app: 0 };
  let started = false;

  beforeAll(async () => {
    await rm(app, { recursive: true, force: true });
    await createProject({ name: 'local-auth-app', outputDir: app, auth: 'gotrue', organizations: true, ui: true });
    addKit('linen', { dir: join(app, 'src/design') });
    for (const name of Object.keys(ports) as Array<keyof typeof ports>) ports[name] = await freePort();
    // What a developer whose ports are taken would write: the same services, elsewhere on this machine
    await writeFile(
      join(app, 'compose.test.yml'),
      `services:
  postgres:
    ports: !override ["${ports.postgres}:5432"]
  auth:
    ports: !override ["${ports.auth}:9999"]
    environment:
      API_EXTERNAL_URL: http://localhost:${ports.auth}
      GOTRUE_JWT_ISSUER: http://localhost:${ports.auth}
  mail:
    ports: !override ["${ports.mailbox}:8025", "${ports.smtp}:1025"]
`,
    );
    started = true;
    // PORT is the app's: the Compose file reads it for the addresses GoTrue's links may send people back to
    await docker(['up', '-d', '--wait', '--wait-timeout', '240'], { PORT: String(ports.app) });
  }, 300_000);

  afterAll(async () => {
    if (started) await docker(['down', '-v', '--remove-orphans']).catch(() => undefined);
    await rm(workDir, { recursive: true, force: true });
  }, 120_000);

  it('runs GoTrue on its own Postgres with the keys init wrote: an ES256 key in its JWKS, and the issuer AUTH_URL names', async () => {
    const env = parseEnv(await readFile(join(app, '.env'), 'utf8'));
    const health = (await (await fetch(`http://localhost:${ports.auth}/health`)).json()) as { version: string };
    expect(health.version).toMatch(/^v\d+\.\d+\.\d+$/);
    const jwks = (await (await fetch(`http://localhost:${ports.auth}/.well-known/jwks.json`)).json()) as { keys: Array<{ kid: string; alg: string; d?: string }> };
    const [key] = JSON.parse(env.GOTRUE_JWT_KEYS as string) as Array<{ kid: string }>;
    expect(jwks.keys).toEqual([expect.objectContaining({ kid: key?.kid, alg: 'ES256' })]);
    // The public half only
    expect(jwks.keys[0]?.d).toBeUndefined();
    // GoTrue's tables are in the app's database, in their own schema
    const tables = await run('docker', ['compose', '-p', projectName, 'exec', '-T', 'postgres', 'psql', '-U', 'postgres', '-d', 'local_auth_app', '-Atc', "select count(*) from information_schema.tables where table_schema = 'auth' and table_name = 'users'"], { cwd: app });
    expect(tables.stdout.trim()).toBe('1');
  });

  it('signs up and in against the local GoTrue, and carries an invitation from the email through sign-up and back to accepted', async () => {
    const databaseUrl = `postgres://postgres:postgres@localhost:${ports.postgres}/local_auth_app`;
    // The project's own tables, as its first migration would make them (mariachi dev's step)
    const script = join(app, 'apply-schema.mts');
    await writeFile(
      script,
      `import { applySchema, createPostgresDatabase } from '@mariachi/database-postgres';\nimport * as schema from './src/schema/index';\nconst database = createPostgresDatabase({ url: process.argv[2] as string });\nawait database.connect();\nawait applySchema(database.db, schema);\nawait database.disconnect();\n`,
    );
    await run(process.execPath, [viteNode, script, databaseUrl], { cwd: app, env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' } });
    await rm(script, { force: true });

    const origin = `http://localhost:${ports.app}`;
    const authUrl = `http://localhost:${ports.auth}`;
    const mailbox = `http://localhost:${ports.mailbox}`;
    type FakePage = {
      url(): string;
      session: Map<string, string>;
      local: Map<string, string>;
      text(id: string): string;
      hidden(id: string): boolean;
      assigned(): string | undefined;
      type(id: string, value: string): void;
      fire(id: string, event: 'click' | 'submit'): Promise<void>;
    };
    const { openPage } = (await import(pathToFileURL(join(app, 'src/api/pages/fake-browser.ts')).href)) as {
      openPage(options: { script: string; url: string; fetch: (input: string, init?: RequestInit) => Promise<Response>; local?: Map<string, string>; session?: Map<string, string> }): Promise<FakePage>;
    };

    /** The newest email to `address` whose body has `marker`, from Mailpit's API. */
    const emailTo = async (address: string, marker: string): Promise<{ HTML: string; Text: string }> => {
      for (let attempt = 0; attempt < 75; attempt++) {
        const found = (await (await fetch(`${mailbox}/api/v1/search?query=${encodeURIComponent(`to:${address}`)}`)).json()) as { messages: Array<{ ID: string }> };
        for (const { ID } of found.messages) {
          const message = (await (await fetch(`${mailbox}/api/v1/message/${ID}`)).json()) as { HTML: string; Text: string };
          if (message.HTML.includes(marker) || message.Text.includes(marker)) return message;
        }
        await new Promise((r) => setTimeout(r, 200));
      }
      throw new Error(`no email to ${address} with ${marker}`); // mariachi-lint-ignore test helper
    };
    /** The confirmation link GoTrue emailed, followed as a browser does, to where it sends the browser back. */
    const confirm = async (address: string): Promise<string> => {
      const message = await emailTo(address, '/verify?');
      const href = /href="([^"]*\/verify\?[^"]*)"/.exec(message.HTML)?.[1]?.replaceAll('&amp;', '&') as string;
      expect(new URL(href).origin).toBe(authUrl);
      const res = await fetch(href, { redirect: 'manual' });
      expect(res.status).toBe(303);
      return res.headers.get('location') as string;
    };
    const signUp = async (tab: FakePage, address: string, password: string) => {
      tab.type('email', address);
      tab.type('password', password);
      await tab.fire('sign-up', 'click');
      expect(tab.text('status')).toBe('Check your email for the confirmation link.');
    };
    const tokenOf = (tab: FakePage) => (JSON.parse(tab.session.get('session') ?? 'null') as { accessToken: string }).accessToken;

    const { status, output, probed } = await bootReady(
      app,
      {
        ...parseEnv(await readFile(join(app, '.env'), 'utf8')),
        PORT: String(ports.app),
        DATABASE_URL: databaseUrl,
        AUTH_URL: authUrl,
        SMTP_URL: `smtp://localhost:${ports.smtp}`,
      },
      async (base) => {
        // The page's requests: the app's own go to the running app, GoTrue's to GoTrue
        const browser = (input: string, init?: RequestInit) => fetch(input.startsWith('/') ? base + input : input, init);
        const api = (path: string, token: string, body?: unknown) =>
          fetch(base + path, {
            method: body === undefined ? 'GET' : 'POST',
            headers: { authorization: `Bearer ${token}`, ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
            body: body === undefined ? undefined : JSON.stringify(body),
          });
        // The scripts as the app serves them, with the settings it writes in
        const signIn = await (await fetch(`${base}/api/sign-in/client.js`)).text();
        expect(signIn).toContain(`const AUTH = ${JSON.stringify(authUrl)};`);
        const acceptPage = await (await fetch(`${base}/invitations/accept`)).text();
        expect(acceptPage).toContain('href="/api/sign-in#return=/invitations/accept"');
        const accept = await (await fetch(`${base}/assets/accept-invitation.js`)).text();

        // Ada signs up, confirms her address from the email, and is signed in: the app checked GoTrue's ES256 token
        const ada = 'ada@example.test';
        const adaPassword = `pw-${randomUUID()}`;
        const asked = await openPage({ script: signIn, url: `${origin}/api/sign-in`, fetch: browser });
        await signUp(asked, ada, adaPassword);
        const adaTab = await openPage({ script: signIn, url: await confirm(ada), fetch: browser, local: asked.local });
        expect(adaTab.text('status')).toBe('Signed in.');
        const me = (await (await api('/api/me', tokenOf(adaTab))).json()) as { email: string; personal: boolean };
        expect(me).toMatchObject({ email: ada, personal: true });
        // And her password signs her in from now on
        const later = await openPage({ script: signIn, url: `${origin}/api/sign-in`, fetch: browser });
        later.type('email', ada);
        later.type('password', adaPassword);
        await later.fire('password-form', 'submit');
        expect(later.text('status')).toBe('Signed in.');

        // She creates an organization and invites Ivy, by email: the token never comes back to her
        const created = await api('/api/organizations', tokenOf(adaTab), { name: 'Acme Rockets' });
        expect(created.status).toBe(201);
        const { organization } = (await created.json()) as { organization: { id: string } };
        const ivy = 'ivy@example.test';
        const invited = await api(`/api/organizations/${organization.id}/invitations`, tokenOf(adaTab), { email: ivy, role: 'member' });
        expect(invited.status).toBe(201);
        expect(await invited.json()).not.toHaveProperty('token');

        // The link in Ivy's email is the accept page on this app: INVITATION_URL's default
        const invitation = await emailTo(ivy, '/invitations/accept#token=');
        const link = invitation.Text.split(/\s+/).find((word) => word.startsWith(`${origin}/invitations/accept#token=`)) as string;
        expect(link).toBeTruthy();

        // She opens it: not signed in, so the page keeps the token and sends her to sign in
        const landed = await openPage({ script: accept, url: link, fetch: browser });
        expect(landed.url()).toBe(`${origin}/invitations/accept`);
        expect(landed.hidden('invitation-sign-in')).toBe(false);
        // She follows that link, signs up, and confirms from the email, which opens a new tab
        const signingUp = await openPage({ script: signIn, url: `${origin}/api/sign-in#return=/invitations/accept`, fetch: browser, local: landed.local });
        await signUp(signingUp, ivy, `pw-${randomUUID()}`);
        const confirmed = await openPage({ script: signIn, url: await confirm(ivy), fetch: browser, local: landed.local });
        // Signed in there, and sent back to the accept page
        expect(confirmed.assigned()).toBe(`${origin}/invitations/accept`);
        const back = await openPage({ script: accept, url: `${origin}/invitations/accept`, fetch: browser, local: landed.local, session: confirmed.session });
        expect(back.text('invitation-status')).toBe(`You are signed in as ${ivy}. Accept the invitation as this account, or sign in with another.`);
        // Accepting reads her confirmed address from GoTrue with the service key init wrote
        await back.fire('invitation-accept', 'click');
        expect(back.text('invitation-status')).toBe('You joined Acme Rockets as member.');

        const hers = (await (await api('/api/organizations', tokenOf(confirmed))).json()) as Array<{ organization: { id: string }; role: string }>;
        return { joined: hers.find((m) => m.organization.id === organization.id)?.role };
      },
    );
    expect({ status, output: status === 200 ? '' : output }).toMatchObject({ status: 200 });
    expect(probed).toEqual({ joined: 'member' });
  }, 300_000);
});
