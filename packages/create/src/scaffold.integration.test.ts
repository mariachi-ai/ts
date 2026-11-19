import { execFile, spawn } from 'node:child_process';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { type AddressInfo, createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
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
  const port = await freePort();
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
    expect(services).toContain('registerNotesHandlers(communication, new NotesService(new NotesRepository(deps.db)));');
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

  it('passes mariachi validate with no findings', async () => {
    const result = await validate(project);
    expect(result.violations).toEqual([]);
    expect(result.filesChecked).toBeGreaterThan(15);
  });

  it('flags a controller that imports a service', async () => {
    const file = join(project, 'src/api/controllers/notes.controller.ts');
    const original = await readFile(file, 'utf-8');
    await writeFile(file, `import { NotesService } from '../../services/notes/notes.service';\n${original}`);
    try {
      const result = await validate(project);
      expect(result.valid).toBe(false);
      expect(result.violations).toMatchObject([{ rule: 'no-service-import-in-controller', file: 'src/api/controllers/notes.controller.ts', line: 1 }]);
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

  it('passes mariachi validate with no findings', async () => {
    const result = await validate(app);
    expect(result.violations).toEqual([]);
  });
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

  it('passes mariachi validate with no findings', async () => {
    const result = await validate(app);
    expect(result.violations).toEqual([]);
  });
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

  it('passes mariachi validate with no findings', async () => {
    const result = await validate(app);
    expect(result.violations).toEqual([]);
  });

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
