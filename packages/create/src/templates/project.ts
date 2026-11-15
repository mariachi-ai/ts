import { LAYOUT, MARKERS } from '../layout';
import type { ProjectAuth } from '../types';
import { THIRD_PARTY_VERSIONS as V } from '../version';
import { databaseName } from '../names';
import { E2E_GLOBAL_SETUP, E2E_HARNESS_FILE, VITEST_E2E_CONFIG, e2eHarness } from './e2e';
import { gotrueFiles } from './gotrue';
import {
  JWT_ORGANIZATIONS_CONFIG_TS,
  ORGANIZATION_DEPS,
  ORGANIZATIONS_APP_FIELD,
  ORGANIZATIONS_APP_OPTION,
  ORGANIZATIONS_E2E_FILE,
  ORGANIZATIONS_FILE,
  ORGANIZATIONS_SCHEMA,
  ORGANIZATIONS_SCHEMA_FILE,
  ORGANIZATIONS_STRATEGY_COMMENT,
  ORGANIZATIONS_TS,
  organizationsAgents,
  organizationsAppImports,
  organizationsAppSetup,
  organizationsE2eTest,
  organizationsEnv,
  organizationsReadme,
} from './organizations';

const MARIACHI_DEPS = [
  'api-facade',
  'auth',
  'communication',
  'config',
  'core',
  'database',
  'database-postgres',
  'jobs',
  'lifecycle',
  'search',
] as const;

/** Framework packages a sign-in choice adds. */
const AUTH_DEPS: Record<ProjectAuth, readonly string[]> = {
  jwt: [],
  gotrue: ['auth-gotrue', 'tenancy'],
};

export interface ProjectFileOptions {
  /** End-to-end test support (`pnpm test:e2e`, needs Docker). Default true. */
  e2e?: boolean;
  /** Organizations, memberships and invitations (`@mariachi/organizations`). Default false. */
  organizations?: boolean;
}

export function projectFiles(name: string, mariachiRange: string, auth: ProjectAuth = 'jwt', options: ProjectFileOptions = {}): Record<string, string> {
  const e2e = options.e2e ?? true;
  const orgs = options.organizations ?? false;
  const dependencies: Record<string, string> = {};
  for (const pkg of [...MARIACHI_DEPS, ...AUTH_DEPS[auth], ...(orgs ? ORGANIZATION_DEPS : [])].sort()) dependencies[`@mariachi/${pkg}`] = mariachiRange;
  dependencies.zod = V.zod;
  dependencies['drizzle-orm'] = V['drizzle-orm'];
  dependencies.postgres = V.postgres;

  const packageJson = {
    name,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'mariachi dev',
      build: 'tsup src/main.ts --format esm --target node20 --clean',
      start: 'node dist/main.js',
      typecheck: 'tsc --noEmit',
      test: 'vitest run',
      'test:watch': 'vitest',
      ...(e2e ? { 'test:e2e': 'vitest run --config vitest.e2e.config.ts' } : {}),
      validate: 'mariachi validate',
      'db:generate': 'mariachi db generate',
      'db:check': 'mariachi db check',
      'db:migrate': 'mariachi db migrate',
      'db:seed': 'mariachi db seed',
    },
    dependencies,
    devDependencies: {
      '@mariachi/cli': mariachiRange,
      ...(e2e ? { '@mariachi/testing': mariachiRange } : {}),
      '@types/node': V['@types/node'],
      'drizzle-kit': V['drizzle-kit'],
      ...(e2e ? { testcontainers: V.testcontainers } : {}),
      tsup: V.tsup,
      tsx: V.tsx,
      typescript: V.typescript,
      vitest: V.vitest,
    },
    engines: { node: '>=20.12' },
  };

  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      lib: ['ES2022'],
      types: ['node'],
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      skipLibCheck: true,
      isolatedModules: true,
      resolveJsonModule: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ['src'],
  };

  const files: Record<string, string> = {
    'package.json': `${JSON.stringify(packageJson, null, 2)}\n`,
    'tsconfig.json': `${JSON.stringify(tsconfig, null, 2)}\n`,
    '.gitignore': 'node_modules/\ndist/\n.env\ncoverage/\n',
    '.env.example': ENV_EXAMPLE(name) + (orgs ? organizationsEnv('jwt') : ''),
    'docker-compose.yml': DOCKER_COMPOSE(databaseName(name)),
    'vitest.config.ts': VITEST_CONFIG,
    'AGENTS.md': AGENTS_MD(e2e) + (orgs ? organizationsAgents('jwt') : ''),
    'CLAUDE.md': 'See [AGENTS.md](./AGENTS.md).\n',
    'README.md': README(name, e2e) + (orgs ? organizationsReadme('jwt') : ''),
    [LAYOUT.main]: MAIN_TS,
    [LAYOUT.app]: APP_TS(orgs),
    ...(e2e
      ? {
          'vitest.e2e.config.ts': VITEST_E2E_CONFIG,
          'src/app.e2e.test.ts': APP_E2E_TEST,
          [E2E_HARNESS_FILE]: e2eHarness('jwt', orgs),
          'src/testing/global-setup.ts': E2E_GLOBAL_SETUP,
        }
      : {}),
    [LAYOUT.schemaIndex]: SCHEMA_INDEX(orgs),
    [JOB_QUEUE_SCHEMA_FILE]: JOB_QUEUE_SCHEMA,
    [SEARCH_SCHEMA_FILE]: SEARCH_SCHEMA,
    [SEARCH_INDEXES_FILE]: SEARCH_INDEXES,
    ...(e2e ? { [SEARCH_E2E_FILE]: SEARCH_E2E_TEST } : {}),
    [LAYOUT.seedsIndex]: SEEDS_INDEX,
    [LAYOUT.servicesIndex]: SERVICES_INDEX,
    [LAYOUT.controllersIndex]: CONTROLLERS_INDEX(orgs),
    [LAYOUT.jobsIndex]: JOBS_INDEX,
  };
  if (orgs) {
    files[ORGANIZATIONS_FILE] = ORGANIZATIONS_TS;
    files[ORGANIZATIONS_SCHEMA_FILE] = ORGANIZATIONS_SCHEMA;
    if (auth === 'jwt') files['src/config.ts'] = JWT_ORGANIZATIONS_CONFIG_TS;
    if (e2e) files[ORGANIZATIONS_E2E_FILE] = organizationsE2eTest(auth);
  }
  return auth === 'gotrue' ? { ...files, ...gotrueFiles(name, e2e, orgs) } : files;
}

/** The schema index. Shared by both sign-in choices. */
export const SCHEMA_INDEX = (orgs: boolean): string =>
  `/** Every table exported here is picked up by \`mariachi db generate\`. */\nexport * from './job-queue';\nexport * from './search';\n${orgs ? "export * from './organizations';\n" : ''}// ${MARKERS.schema}\nexport {};\n`;

const JOB_QUEUE_SCHEMA_FILE = 'src/schema/job-queue.ts';
const JOB_QUEUE_SCHEMA = `/**
 * The job queue's tables (@mariachi/jobs/postgres). Jobs run in Postgres unless REDIS_URL is set,
 * and a job enqueued inside withTransaction commits or rolls back with the write beside it.
 */
export { jobSchedulesTable, jobsTable } from '@mariachi/jobs/schema';
`;

const SEARCH_SCHEMA_FILE = 'src/schema/search.ts';
const SEARCH_SCHEMA = `/** Search's tables (@mariachi/search/postgres): the index definitions, and each tenant's documents. */
export { searchDocumentsTable, searchIndexesTable } from '@mariachi/search/schema';
`;

const SEARCH_INDEXES_FILE = 'src/search/index.ts';
const SEARCH_INDEXES = `import type { SearchIndex } from '@mariachi/search';

/**
 * The search indexes this app keeps. Each is created at start when it doesn't exist yet.
 *
 *   { name: 'notes', fields: [{ name: 'title', type: 'string' }, { name: 'tags', type: 'string[]', facet: true }] }
 *
 * Then, in a service: \`deps.search.indexDocument(ctx, 'notes', { id, title })\` when a note is written
 * (inside withTransaction it commits with the write), \`removeDocument\` when it is deleted, and
 * \`deps.search.search(ctx, 'notes', { query })\` to find. Every call sees only the documents of
 * ctx.tenantId. An index that exists is left as it is: after changing its fields, reindex
 * (node_modules/@mariachi/core/docs/search.md).
 */
export const searchIndexes: SearchIndex[] = [];
`;

const SEARCH_E2E_FILE = 'src/search.e2e.test.ts';
const SEARCH_E2E_TEST = `import type { SearchIndex } from '@mariachi/search';
import { createTestContext } from '@mariachi/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startApp, type RunningApp } from './testing/e2e';

// An index for this test alone: the app's own are in src/search/index.ts
const articles = { name: 'e2e_articles', fields: [{ name: 'title', type: 'string' }] } satisfies SearchIndex;

let running: RunningApp;
beforeAll(async () => {
  running = await startApp({ searchIndexes: [articles] });
});
afterAll(() => running?.stop());

const inTenant = (tenantId: string) => createTestContext({ tenantId, userId: 'user-1' });

describe('search, as the app wires it', () => {
  it('finds what a tenant indexed, by whole words and by the start of the last one', async () => {
    const { search } = running.app;
    await search.indexDocument(inTenant('tenant-a'), 'e2e_articles', { id: '1', title: 'Wool hat for winter' });
    await search.indexDocument(inTenant('tenant-a'), 'e2e_articles', { id: '2', title: 'Linen shirt' });
    const found = await search.search<{ id: string; title: string }>(inTenant('tenant-a'), 'e2e_articles', { query: 'wool wint' });
    expect(found.hits.map((hit) => hit.document.id)).toEqual(['1']);
  });

  it("keeps each tenant's documents apart, and refuses a search with no tenant", async () => {
    const { search } = running.app;
    await search.indexDocument(inTenant('tenant-b'), 'e2e_articles', { id: '1', title: 'Their own wool hat' });
    const theirs = await search.search<{ title: string }>(inTenant('tenant-b'), 'e2e_articles', { query: 'wool' });
    expect(theirs.hits.map((hit) => hit.document.title)).toEqual(['Their own wool hat']);
    expect((await search.search(inTenant('tenant-c'), 'e2e_articles', { query: 'wool' })).total).toBe(0);
    await expect(search.search(createTestContext(), 'e2e_articles', { query: 'wool' })).rejects.toMatchObject({ code: 'search/tenant-required' });
  });

  it('leaves an index that already exists as it is, and still starts', async () => {
    // The second is found there when the app starts, as an index is on every start after the first
    const again = await startApp({ searchIndexes: [articles, articles] });
    await again.stop();
  });
});
`;

const ENV_EXAMPLE = (name: string) => `SERVICE_NAME=${name}
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/${databaseName(name)}
# Jobs run in Postgres. Set REDIS_URL to run them on Redis (BullMQ) instead.
# REDIS_URL=redis://localhost:6379
# At least 32 characters. Tokens are verified with HS256.
JWT_SECRET=change-me-change-me-change-me-change-me
`;

// POSTGRES_DB creates the database that DATABASE_URL in .env.example names; without it the first migrate fails.
const DOCKER_COMPOSE = (db: string) => `services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ${db}
    ports: ["5432:5432"]
  # Postgres is all the app needs: jobs and search run in it. To run jobs on Redis (BullMQ) instead,
  # add this service and set REDIS_URL in .env.
  # redis:
  #   image: redis:7-alpine
  #   ports: ["6379:6379"]
`;

const VITEST_CONFIG = `import { defineConfig } from 'vitest/config';

// Unit tests: no services needed. The end-to-end tests have their own config (pnpm test:e2e).
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['src/**/*.e2e.test.ts', 'node_modules/**'],
  },
});
`;

const APP_E2E_TEST = `import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startApp, type RunningApp } from './testing/e2e';

let running: RunningApp;
beforeAll(async () => {
  running = await startApp();
});
afterAll(() => running?.stop());

describe('the app, started as main.ts starts it', () => {
  it('is ready: the database, which holds the job queue and search, is connected', async () => {
    const res = await running.request('/api/health/ready');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'healthy' });
  });

  it('describes itself', async () => {
    const res = await running.request('/api/openapi.json');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ openapi: '3.0.3' });
  });

  it('answers a route it does not have with the error envelope', async () => {
    const res = await running.request('/api/no-such-route');
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: { code: 'http/not-found' } });
  });

  it('takes additions to the API through the configureApi option, with no edit to app.ts', async () => {
    const custom = await startApp({
      configureApi: (api) =>
        api.withMiddleware(async (ctx, next) => {
          ctx.responseHeaders['x-served-by'] = 'e2e';
          await next();
        }),
    });
    try {
      expect((await custom.request('/api/health/live')).headers.get('x-served-by')).toBe('e2e');
      expect((await running.request('/api/health/live')).headers.get('x-served-by')).toBeNull();
    } finally {
      await custom.stop();
    }
  });
});
`;

export const AGENTS_TESTS = `
## Tests

\`\`\`bash
pnpm test          # unit tests (src/**/*.test.ts): no services needed
pnpm test:e2e      # the whole app over HTTP (src/**/*.e2e.test.ts): starts a throwaway Postgres in Docker
\`\`\`

- An end-to-end test calls \`startApp()\` from \`src/testing/e2e.ts\`: the same \`createApp()\` that
  \`main.ts\` starts, on a free port, with its own empty database (the tables in \`src/schema\`).
- \`running.request('/api/notes', { as: { userId, tenantId }, json: { ... } })\` is a signed-in request;
  leave \`as\` out for an anonymous one. Sign-in in tests is \`createTestAuth()\` from \`@mariachi/testing\`.
- \`mariachi generate entity\` writes one for the new routes (create, read, list, update, delete,
  another tenant, no token, a bad body). Extend it when you change the entity.
- Write a unit test for logic, and an end-to-end test for anything that crosses the HTTP boundary,
  tenancy or the database.
`;

const AGENTS_MD = (e2e: boolean) => `# Agent guide

This is a Mariachi backend. Before writing code, read the framework docs shipped with
\`@mariachi/core\`:

- \`node_modules/@mariachi/core/docs/README.md\` (start here: layers, conventions, package catalog)
- \`node_modules/@mariachi/core/docs/recipes/\` (step-by-step: entity, job, webhook, integration)

## Layout

| Path | Layer |
| --- | --- |
| \`src/app.ts\` | Composition root: \`createApp()\` builds config, lifecycle, database, jobs, communication and the HTTP server |
| \`src/main.ts\` | The entry point: starts what \`createApp()\` built |
${e2e ? '| \`src/testing/\` | Support for end-to-end tests: \`startApp()\` and the containers they share |\n' : ''}| \`src/contracts/\` | Zod schemas + procedure types shared by controllers and handlers |
| \`src/api/controllers/\` | HTTP controllers (\`BaseController\`); call procedures, never services |
| \`src/services/<name>/\` | Service, repository and communication handlers for one domain |
| \`src/schema/\` | \`defineTable\` tables; \`mariachi db generate\` turns them into migrations |
| \`src/jobs/\` | \`defineJob\` background jobs |
| \`src/search/\` | The search indexes; services reach search as \`deps.search\` |

Postgres is the only service: jobs and search run in it (\`@mariachi/jobs/postgres\`,
\`@mariachi/search/postgres\`). Don't add Redis or a search server to make either work.

## Run and sign in

\`\`\`bash
pnpm dev                                  # .env, Postgres (docker compose), migrations, then the app with reload
TOKEN=$(pnpm -s mariachi token)           # a token for user dev-user in tenant dev-tenant, signed with JWT_SECRET
curl -H "authorization: Bearer $TOKEN" localhost:3000/api/health/ready
\`\`\`

\`mariachi token --user <id> --tenant <id> --email <address> --role <role>\` signs any identity, for
trying the API as different people. It is for development: in production, tokens come from wherever
your users sign in.

## Generators

\`\`\`bash
pnpm mariachi generate entity <name>      # schema + repository + service + handler + controller + unit and end-to-end tests
pnpm mariachi generate service <name>
pnpm mariachi generate controller <name>
pnpm mariachi generate job <name>
pnpm mariachi generate integration <name>
pnpm validate                            # architecture rules; run before committing
\`\`\`
${e2e ? AGENTS_TESTS : ''}`;

const README_TESTS = `
## Tests

\`\`\`bash
pnpm test          # unit tests, no services needed
pnpm test:e2e      # the whole app over HTTP, against a throwaway Postgres (needs Docker)
\`\`\`

The end-to-end tests start the app the way \`src/main.ts\` does (\`createApp()\` in \`src/app.ts\`) and
call it with \`fetch\`. They don't touch the database in \`.env\`. See \`AGENTS.md\` for how to write one.
`;

const README = (name: string, e2e: boolean) => `# ${name}

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

\`pnpm dev\` (\`mariachi dev\`) creates \`.env\` from \`.env.example\`, starts Postgres with Docker
Compose, writes and applies the first migration, and runs the app, reloading on changes. Postgres is
the only service: jobs and search run in it.

The API listens on \`PORT\` (default 3000) under \`/api\`. Health checks: \`/api/health/live\`,
\`/api/health/ready\`, \`/api/health/startup\`. OpenAPI: \`/api/openapi.json\`.

## Sign in

Every route but the health checks and the OpenAPI document wants a bearer token, verified with
\`JWT_SECRET\` (HS256). For development, sign one yourself:

\`\`\`bash
TOKEN=$(pnpm -s mariachi token)                       # user dev-user in tenant dev-tenant, good for an hour
curl -H "authorization: Bearer $TOKEN" localhost:3000/api/notes   # the example entity
pnpm mariachi token --user ada --tenant acme --email ada@example.com --role admin
\`\`\`

In production the tokens come from wherever your users sign in: an identity provider (see
\`mariachi init --auth gotrue\`), or a service of yours that signs them with the same secret.

## Jobs and search

- **Jobs** (\`src/jobs/\`) run in Postgres, so a job enqueued inside \`withTransaction\` commits or rolls
  back with the write beside it. Set \`REDIS_URL\` and they run on Redis (BullMQ) instead.
- **Search** is in Postgres too, and tenant-scoped: declare an index in \`src/search/index.ts\`, then
  \`deps.search.indexDocument(ctx, …)\` and \`deps.search.search(ctx, …)\` in a service. A call sees
  only the documents of \`ctx.tenantId\`.
${e2e ? README_TESTS : ''}`;

const MAIN_TS = `import { createApp } from './app';

// The entry point. Everything the app is made of is built in ./app, which tests start too.
createApp()
  .then((app) => app.start())
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
`;

const APP_TS = (orgs: boolean) => `import { existsSync } from 'node:fs';
import { ConfigError, KEYS } from '@mariachi/core';
import { bootstrap, type BootstrapOptions } from '@mariachi/lifecycle';
import { createCommunication, type CommunicationLayer } from '@mariachi/communication';
import { createPostgresDatabase, runMigrations, type PostgresDatabase } from '@mariachi/database-postgres';
import { createJobQueue, DefaultJobs } from '@mariachi/jobs';
import { createPostgresJobQueue } from '@mariachi/jobs/postgres';
import { DefaultSearch, type SearchIndex } from '@mariachi/search';
import { createPostgresSearch } from '@mariachi/search/postgres';
import { JWTAdapter } from '@mariachi/auth';
import { bearerStrategy, createApiServer, type FastifyAdapter, type TokenVerifier } from '@mariachi/api-facade';
import { createControllers } from './api/controllers/index';
import { registerServices } from './services/index';
import { jobs as jobDefinitions } from './jobs/index';
import { searchIndexes } from './search/index';
${orgs ? organizationsAppImports('jwt') : ''}
export interface AppOptions {
  /** Passed to bootstrap(). Tests give their own environment and leave the signal handlers off. */
  bootstrap?: BootstrapOptions;
  /**
   * Checks tokens in place of the JWT adapter, and JWT_SECRET is then not needed. Tests pass
   * createTestAuth().verifier; an app with an identity provider passes the provider.
   */
  verifier?: TokenVerifier;
  /**
   * Apply the committed migrations at start, before anything else uses the database. \`true\` reads
   * them from drizzle/. Handy where no deploy step runs \`mariachi db migrate\`.
   */
  migrateOnStart?: boolean | { folder: string };
  /**
   * Called with the API server after the defaults below and before the controllers are registered:
   * add auth strategies (\`api.withAuthStrategy('api-key', ...).withAuth(['session', 'api-key'])\`),
   * middleware or rate limits without editing this file.
   */
  configureApi?: (api: FastifyAdapter) => void;
  /** The search indexes to keep, in place of the ones in src/search/index.ts. Tests pass their own. */
  searchIndexes?: SearchIndex[];
${orgs ? ORGANIZATIONS_APP_OPTION : ''}}

export interface App {
  api: FastifyAdapter;
  communication: CommunicationLayer;
  database: PostgresDatabase;
  jobs: DefaultJobs;
  /** Search over the app's own Postgres. Every call reads and writes only the documents of ctx.tenantId. */
  search: DefaultSearch;
${orgs ? ORGANIZATIONS_APP_FIELD : ''}  /** Connects, starts the job worker and listens. Resolves to the address it listens on. */
  start(): Promise<string>;
  /** Stops listening, then closes the worker and the connections. */
  stop(): Promise<void>;
}

/** The composition root: builds everything the app is made of. main.ts starts it; so do the end-to-end tests. */
export async function createApp(options: AppOptions = {}): Promise<App> {
  const { config, logger, tracer, metrics, container, lifecycle } = bootstrap(options.bootstrap);
  const instrumentation = { logger, tracer, metrics };
${orgs ? '  const app = useConfigSection<AppSettings>(APP_CONFIG);\n' : ''}
  if (!config.database) throw new ConfigError('app/database-required', 'DATABASE_URL is required');
  let verifier = options.verifier;
  if (!verifier) {
    if (!config.auth?.jwtSecret) throw new ConfigError('app/jwt-secret-required', 'JWT_SECRET is required');
${orgs
  ? "    // A token may name no tenant: a user who is in no organization yet still has to create or join one\n    verifier = new JWTAdapter({ secret: config.auth.jwtSecret, issuer: config.auth.jwtIssuer, audience: config.auth.jwtAudience, requireTenant: false });"
  : '    verifier = new JWTAdapter({ secret: config.auth.jwtSecret, issuer: config.auth.jwtIssuer, audience: config.auth.jwtAudience });'}
  }

  // Startup runs in ascending priority; shutdown runs in reverse.
  const database = lifecycle.manage(
    'database',
    createPostgresDatabase({ url: config.database.url, poolMin: config.database.poolMin, poolMax: config.database.poolMax }),
    { priority: 10 },
  );
  container.register(KEYS.Database, database);
  const migrations = options.migrateOnStart === true ? { folder: 'drizzle' } : options.migrateOnStart || undefined;
  if (migrations) {
    lifecycle.startup.register({
      name: 'migrations',
      priority: 15,
      fn: async () => {
        if (!existsSync(\`\${migrations.folder}/meta/_journal.json\`)) {
          logger.warn({ folder: migrations.folder }, 'migrateOnStart: no migrations yet (pnpm db:generate, then commit them)');
          return;
        }
        await runMigrations(database.adapter, { migrationsFolder: migrations.folder, logger });
      },
    });
  }

  // Repositories, the job queue and search take the Drizzle client when they're built, so connect first (the startup connect is then a no-op).
  await database.connect();

  // Jobs run in Postgres (the tables in src/schema/job-queue.ts), so the app needs nothing but its
  // database, and a job enqueued inside withTransaction commits with the write. With REDIS_URL set
  // they run on Redis (BullMQ) instead.
  const queue = config.redis
    ? createJobQueue({ adapter: 'bullmq', redisUrl: config.redis.url, prefix: config.serviceName }, logger)
    : createPostgresJobQueue(database.db, { prefix: config.serviceName }, logger);
  const jobs = new DefaultJobs({ queue }, instrumentation);
  for (const job of jobDefinitions) jobs.registerJob(job);
  lifecycle.manage('jobs', jobs, { priority: 20 });
  lifecycle.startup.register({ name: 'jobs-worker', priority: 90, fn: () => jobs.start() });
  container.register(KEYS.JobQueue, jobs);

  // Search in Postgres too (src/schema/search.ts), each tenant's documents kept apart: a call reads and
  // writes only those of ctx.tenantId, and one with no tenant is refused. The indexes are in src/search/index.ts.
  const searchClient = createPostgresSearch(database.db);
  const search = new DefaultSearch({ client: searchClient, tenantScoped: true }, instrumentation);
  container.register(KEYS.Search, search);
  lifecycle.startup.register({
    name: 'search-indexes',
    priority: 30,
    fn: async () => {
      for (const index of options.searchIndexes ?? searchIndexes) {
        await searchClient.createIndex(index).catch((error: { code?: string }) => {
          // Already there, from an earlier start: left as it is
          if (error.code !== 'search/index-exists') throw error;
        });
      }
    },
  });

  // One communication layer per process: handlers register on it, controllers call through it.
  const communication = createCommunication({}, instrumentation);
  container.register(KEYS.Communication, communication);
  registerServices(communication, { db: database.db, jobs, search });
${orgs ? organizationsAppSetup('jwt') : ''}
  const api = createApiServer({
    name: 'api',
    prefix: '/api',
    logger,
    tracer,
    trustProxy: config.server.trustProxy,
    bodyLimitBytes: config.server.bodyLimitBytes,
    cors: config.server.corsOrigins.length > 0 ? { origins: config.server.corsOrigins } : false,
  })
${orgs ? ORGANIZATIONS_STRATEGY_COMMENT : ''}    .withAuthStrategy('session', ${orgs ? 'organizationStrategy(bearerStrategy(verifier), access)' : 'bearerStrategy(verifier)'})
    .withAuth('session')
    .withHealth(lifecycle.health)
    .withOpenApi({ info: { title: config.serviceName, version: '0.1.0' } });
  options.configureApi?.(api);
  for (const controller of createControllers(communication)) api.registerController(controller);

  let address = '';
  lifecycle.startup.register({
    name: 'api',
    priority: 100,
    fn: async () => {
      address = await api.listen(config.server.port, config.server.host);
      logger.info({ address }, 'API listening');
    },
  });
  lifecycle.shutdown.register({ name: 'api', priority: 100, fn: () => api.close() });

  return {
    api,
    communication,
    database,
    jobs,
    search,
${orgs ? '    organizations,\n' : ''}    start: async () => {
      await lifecycle.start();
      return address;
    },
    stop: async () => {
      await lifecycle.stop();
    },
  };
}
`;

const SEEDS_INDEX = `import type { SeedDefinition } from '@mariachi/database';

/** Seeds run by \`mariachi db seed\`, each once per environment. Create them with \`defineSeed\`. */
export const seeds: SeedDefinition[] = [];
`;

const SERVICES_INDEX = `import type { CommunicationLayer } from '@mariachi/communication';
import type { DrizzleDb } from '@mariachi/database-postgres';
import type { Jobs } from '@mariachi/jobs';
import type { Search } from '@mariachi/search';
// ${MARKERS.imports}

export interface ServiceDeps {
  db: DrizzleDb;
  jobs: Jobs;
  /** Tenant-scoped: every call sees only the documents of ctx.tenantId. The indexes are in src/search/index.ts. */
  search: Search;
}

/** Wires every domain service and registers its communication handlers. */
export function registerServices(communication: CommunicationLayer, deps: ServiceDeps): void {
  // ${MARKERS.services}
}
`;

const CONTROLLERS_INDEX = (orgs: boolean) => `import type { BaseController } from '@mariachi/api-facade';
import type { CommunicationLayer } from '@mariachi/communication';
${orgs ? "import { OrganizationsController } from '@mariachi/organizations/http';\n" : ''}// ${MARKERS.imports}

export function createControllers(communication: CommunicationLayer): BaseController[] {
  return [
${orgs ? '    new OrganizationsController(communication),\n' : ''}    // ${MARKERS.controllers}
  ];
}
`;

const JOBS_INDEX = `import type { JobDefinition } from '@mariachi/jobs';
// ${MARKERS.imports}

// biome-ignore lint/suspicious/noExplicitAny: heterogeneous job payloads
export const jobs: JobDefinition<any>[] = [
  // ${MARKERS.jobs}
];
`;
