import { LAYOUT, MARKERS } from '../layout';
import { databaseName } from '../names';
import { E2E_HARNESS_FILE, e2eHarness } from './e2e';
import {
  ORGANIZATIONS_APP_FIELD,
  ORGANIZATIONS_APP_OPTION,
  ORGANIZATIONS_STRATEGY_COMMENT,
  organizationsAgents,
  organizationsAppImports,
  organizationsAppSetup,
  organizationsEnv,
  organizationsReadme,
} from './organizations';
import { UI_APP_CHECK, UI_APP_CONSTANTS, UI_APP_IMPORTS, UI_APP_STATIC, UI_README, uiAgents } from './ui';
import {
  WIRING_APP_EVENTS,
  WIRING_APP_FIELDS,
  WIRING_APP_IMPORTS,
  WIRING_APP_REGISTRY_IMPORTS,
  WIRING_APP_RETURN,
  WIRING_APP_SERVICES,
  WIRING_APP_WEBHOOKS,
} from './wiring';

/**
 * `mariachi init --auth gotrue`: sign-in by GoTrue (Supabase Auth, hosted or your own), verified
 * with `@mariachi/auth-gotrue`. The tenant is the organization claim in the token through
 * `@mariachi/tenancy`, or the user's personal tenant when the token names none. These files
 * replace or extend the default project's.
 */

/** GoTrue's path when it's served under the app's own origin; hosted Supabase uses the same path. */
export const AUTH_PATH = '/auth/v1';

export function gotrueFiles(name: string, e2e = true, orgs = false, ui = false): Record<string, string> {
  return {
    '.env.example': ENV_EXAMPLE(name, databaseName(name)) + (orgs ? organizationsEnv('gotrue') : ''),
    'README.md': README(name) + (orgs ? organizationsReadme('gotrue') : '') + (ui ? UI_README : ''),
    'AGENTS.md': AGENTS_AUTH(e2e) + (orgs ? organizationsAgents('gotrue') : '') + (ui ? uiAgents('gotrue') : ''),
    'src/config.ts': CONFIG_TS(orgs),
    'src/auth.ts': AUTH_TS,
    'src/auth.test.ts': AUTH_TEST(orgs),
    [LAYOUT.app]: APP_TS(orgs, ui),
    ...(e2e ? { 'src/app.e2e.test.ts': orgs ? ORGANIZATIONS_APP_E2E_TEST : APP_E2E_TEST, [E2E_HARNESS_FILE]: e2eHarness('gotrue', orgs) } : {}),
    [LAYOUT.controllersIndex]: CONTROLLERS_INDEX(orgs, ui),
    [`${LAYOUT.controllersDir}/me.controller.ts`]: ME_CONTROLLER,
    [`${LAYOUT.controllersDir}/me.controller.test.ts`]: ME_CONTROLLER_TEST,
    [`${LAYOUT.controllersDir}/sign-in.controller.ts`]: SIGN_IN_CONTROLLER,
    [`${LAYOUT.controllersDir}/sign-in.controller.test.ts`]: SIGN_IN_CONTROLLER_TEST,
    'src/api/pages/sign-in.ts': SIGN_IN_PAGE,
    'src/api/pages/sign-in.test.ts': SIGN_IN_PAGE_TEST,
    'src/api/pages/fake-browser.ts': FAKE_BROWSER,
  };
}

const ENV_EXAMPLE = (name: string, db: string) => `SERVICE_NAME=${name}
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/${db}
# Jobs run in Postgres. To run them on Redis (BullMQ) instead: pnpm add bullmq, then set REDIS_URL.
# REDIS_URL=redis://localhost:6379
# Apply the committed migrations (drizzle/) at start. Handy where nothing else runs them.
MIGRATE_ON_START=false

# Sign-in (GoTrue). Tokens are ES256, checked against GoTrue's JWKS, issuer and audience. Name the
# GoTrue whose tokens this app accepts with one of:
#   AUTH_URL       its public base URL, path included: https://<project>.supabase.co/auth/v1, or
#                  https://app.example.com/auth/v1 for your own GoTrue
#   AUTH_ORIGIN    the origin it's served under; AUTH_PATH (default ${AUTH_PATH}) is appended
#   APP_ORIGIN     the app's own origin, used like AUTH_ORIGIN when that is unset
# and optionally AUTH_JWKS_URL, where to read the JWKS if not <AUTH_URL>/.well-known/jwks.json.
# With none of them set, GoTrue is read at AUTH_INTERNAL_URL (default http://127.0.0.1:9999, its own
# default port) and the issuer comes from its discovery document.
AUTH_URL=
# Hosted Supabase wants its publishable (anon) key on every auth request from the browser. Not a secret.
# AUTH_ANON_KEY=
# The claim holding the user's organization, if your tokens carry one, and their role in it.
# AUTH_ORG_CLAIM=org_id
# AUTH_ORG_ROLE_CLAIM=org_role
# A user in no organization gets a personal tenant. Set false to require an organization.
# AUTH_PERSONAL_TENANTS=true
# Let the sign-in page take a session from a link an admin made (an invite, GoTrue's generate_link). Such
# links can't use PKCE. Off by default; when on, the page shows whose session it is and asks first.
# AUTH_LINK_SESSIONS=false
`;

const CONFIG_TS = (orgs: boolean) => `import { registerConfigSection${orgs ? ', secret' : ''} } from '@mariachi/config';
import { z } from 'zod';

/** This app's own settings, read from the environment by \`@mariachi/config\` (\`useConfigSection(APP_CONFIG)\`). */
export const APP_CONFIG = 'app';

const optional = (v: string | undefined) => (v ? v : undefined);
const flag = (v: string | undefined) => (v ? v === 'true' : undefined);

const appSchema = z.object({
  auth: z
    .object({
      /** GoTrue's public base URL, path included (\`AUTH_URL\`). */
      url: z.string().url().optional(),
      /** The origin GoTrue is served under (\`AUTH_ORIGIN\`, else the app's own \`APP_ORIGIN\`); \`path\` is appended. */
      origin: z.string().url().optional(),
      /** GoTrue's path on that origin (\`AUTH_PATH\`). */
      path: z.string().regex(/^(\\/[A-Za-z0-9._~-]+)+$/).default('${AUTH_PATH}'),
      /** Where GoTrue answers on a private address (\`AUTH_INTERNAL_URL\`): used when no public URL is set. */
      internalUrl: z.string().url().default('http://127.0.0.1:9999'),
      /** Where to read the JWKS, if not \`<url>/.well-known/jwks.json\` (\`AUTH_JWKS_URL\`). */
      jwksUrl: z.string().url().optional(),
      /** The publishable key hosted Supabase wants on browser requests (\`AUTH_ANON_KEY\`). Not a secret. */
      anonKey: z.string().optional(),
      /** The claim holding the user's organization, which becomes the tenant (\`AUTH_ORG_CLAIM\`). */
      orgClaim: z.string().min(1).default('org_id'),
      /** The claim holding their role in it (\`AUTH_ORG_ROLE_CLAIM\`). */
      orgRoleClaim: z.string().min(1).default('org_role'),
      /** Give a user in no organization a personal tenant (\`AUTH_PERSONAL_TENANTS\`). */
      personalTenants: z.boolean().default(true),
      /** Let the sign-in page take a session from an admin-made link, after asking (\`AUTH_LINK_SESSIONS\`). */
      linkSessions: z.boolean().default(false),
${orgs
  ? "      /** A key that may read users through GoTrue's admin API (`AUTH_SERVICE_KEY`): how an invitee's address is known to be verified. A secret. */\n      serviceKey: secret(z.string()).optional(),\n      /** \"required\" when an access token hook always sets a top-level email_verified claim: no key, no lookup (`AUTH_EMAIL_VERIFIED_CLAIM`). */\n      emailVerifiedClaim: z.enum(['optional', 'required']).default('optional'),\n"
  : ''}    })
    .default({}),
${orgs
  ? '  /** The page that accepts an invitation (`INVITATION_URL`). Invitations are emailed only when this and `EMAIL_ADAPTER` are set. */\n  invitationUrl: z.string().url().optional(),\n'
  : ''}  /** Apply the committed migrations (\`drizzle/\`) at start (\`MIGRATE_ON_START\`). */
  migrateOnStart: z.boolean().default(false),
});

export type AppSettings = z.infer<typeof appSchema>;
export type AuthSettings = AppSettings['auth'];

registerConfigSection(APP_CONFIG, {
  schema: appSchema,
  fromEnv: (read) => ({
    auth: {
      url: optional(read('AUTH_URL')),
      origin: optional(read('AUTH_ORIGIN')) ?? optional(read('APP_ORIGIN')),
      path: optional(read('AUTH_PATH')),
      internalUrl: optional(read('AUTH_INTERNAL_URL')),
      jwksUrl: optional(read('AUTH_JWKS_URL')),
      anonKey: optional(read('AUTH_ANON_KEY')),
      orgClaim: optional(read('AUTH_ORG_CLAIM')),
      orgRoleClaim: optional(read('AUTH_ORG_ROLE_CLAIM')),
      personalTenants: flag(read('AUTH_PERSONAL_TENANTS')),
      linkSessions: flag(read('AUTH_LINK_SESSIONS')),
${orgs ? "      serviceKey: optional(read('AUTH_SERVICE_KEY')),\n      emailVerifiedClaim: optional(read('AUTH_EMAIL_VERIFIED_CLAIM')),\n" : ''}    },
${orgs ? "    invitationUrl: optional(read('INVITATION_URL')),\n" : ''}    migrateOnStart: flag(read('MIGRATE_ON_START')),
  }),
});
`;

const AUTH_TS = `import type { GoTrueConfig } from '@mariachi/auth-gotrue';
import type { AuthSettings } from './config';

/** GoTrue's public base URL, when the settings name one: \`AUTH_URL\`, or \`AUTH_ORIGIN\` / \`APP_ORIGIN\` plus \`AUTH_PATH\`. */
export function publicAuthUrl(auth: AuthSettings): string | undefined {
  return auth.url ?? (auth.origin ? \`\${auth.origin.replace(/\\/+$/, '')}\${auth.path}\` : undefined);
}

/**
 * Where the app finds GoTrue:
 * - a public URL (see \`publicAuthUrl\`): that URL is the issuer, and the JWKS is read under it unless
 *   \`AUTH_JWKS_URL\` says otherwise;
 * - none: GoTrue on a private address (\`AUTH_INTERNAL_URL\`), whose discovery document names the
 *   public issuer.
 */
export function goTrueConfig(auth: AuthSettings): GoTrueConfig {
  const claims = { orgClaim: auth.orgClaim, orgRoleClaim: auth.orgRoleClaim };
  const url = publicAuthUrl(auth);
  if (url) return auth.jwksUrl ? { url, jwksUrl: auth.jwksUrl, ...claims } : { url, ...claims };
  return { url: auth.internalUrl, discoverIssuer: true, ...claims };
}

/** Where the browser reaches GoTrue: its public URL, else \`AUTH_PATH\` on this app's own origin (behind a proxy). */
export function browserAuthUrl(auth: AuthSettings): string {
  return publicAuthUrl(auth) ?? auth.path;
}
`;

const AUTH_TEST = (orgs: boolean) => `import { describe, expect, it } from 'vitest';
import { browserAuthUrl, goTrueConfig } from './auth';

const defaults = { path: '${AUTH_PATH}', internalUrl: 'http://127.0.0.1:9999', orgClaim: 'org_id', orgRoleClaim: 'org_role', personalTenants: true, linkSessions: false${orgs ? ", emailVerifiedClaim: 'optional' as const" : ''} };
const claims = { orgClaim: 'org_id', orgRoleClaim: 'org_role' };

describe('goTrueConfig', () => {
  it('uses AUTH_URL as the issuer, with its JWKS unless AUTH_JWKS_URL is set', () => {
    expect(goTrueConfig({ ...defaults, url: 'https://app.example.com${AUTH_PATH}' })).toEqual({ url: 'https://app.example.com${AUTH_PATH}', ...claims });
    expect(goTrueConfig({ ...defaults, url: 'https://app.example.com${AUTH_PATH}', jwksUrl: 'http://127.0.0.1:9999/.well-known/jwks.json' })).toEqual({
      url: 'https://app.example.com${AUTH_PATH}',
      jwksUrl: 'http://127.0.0.1:9999/.well-known/jwks.json',
      ...claims,
    });
  });

  it('appends AUTH_PATH to AUTH_ORIGIN (or APP_ORIGIN)', () => {
    expect(goTrueConfig({ ...defaults, origin: 'https://app.example.com/' })).toEqual({ url: 'https://app.example.com${AUTH_PATH}', ...claims });
  });

  it('reads GoTrue on a private address and discovers the issuer when no public URL is set', () => {
    expect(goTrueConfig(defaults)).toEqual({ url: 'http://127.0.0.1:9999', discoverIssuer: true, ...claims });
  });

  it('passes on the claims that hold the organization and the role in it', () => {
    expect(goTrueConfig({ ...defaults, url: 'https://x.example.com${AUTH_PATH}', orgClaim: 'team', orgRoleClaim: 'team_role' })).toMatchObject({ orgClaim: 'team', orgRoleClaim: 'team_role' });
  });
});

describe('browserAuthUrl', () => {
  it("is GoTrue's public URL, else its path on this origin", () => {
    expect(browserAuthUrl({ ...defaults, url: 'https://abc.supabase.co${AUTH_PATH}' })).toBe('https://abc.supabase.co${AUTH_PATH}');
    expect(browserAuthUrl(defaults)).toBe('${AUTH_PATH}');
  });
});
`;

const APP_TS = (orgs: boolean, ui: boolean) => `import { existsSync } from 'node:fs';
${ui ? UI_APP_IMPORTS : ''}import { ConfigError, KEYS } from '@mariachi/core';
import { useConfigSection } from '@mariachi/config';
import { bootstrap, type BootstrapOptions } from '@mariachi/lifecycle';
import { createCommunication, type CommunicationLayer } from '@mariachi/communication';
import { createPostgresDatabase, runMigrations, type PostgresDatabase } from '@mariachi/database-postgres';
import { createJobQueue, DefaultJobs } from '@mariachi/jobs';
import { createPostgresJobQueue } from '@mariachi/jobs/postgres';
import { DefaultSearch, type SearchIndex } from '@mariachi/search';
import { createPostgresSearch } from '@mariachi/search/postgres';
${WIRING_APP_IMPORTS}import { withPersonalTenants, type ResolvedIdentity } from '@mariachi/auth';
import { createGoTrueAuth${orgs ? ', goTrueVerifiedEmail' : ''} } from '@mariachi/auth-gotrue';
import { createTenancy, createTenancyMiddleware } from '@mariachi/tenancy';
import { bearerStrategy, createApiServer, type FastifyAdapter } from '@mariachi/api-facade';
import { APP_CONFIG, type AppSettings } from './config';
import { goTrueConfig } from './auth';
import { createControllers } from './api/controllers/index';
import { registerServices } from './services/index';
import { jobs as jobDefinitions } from './jobs/index';
import { searchIndexes } from './search/index';
${WIRING_APP_REGISTRY_IMPORTS}${orgs ? organizationsAppImports('gotrue') : ''}${ui ? UI_APP_CONSTANTS : ''}
const MIGRATIONS = 'drizzle';

export interface AppOptions {
  /** Passed to bootstrap(). Tests give their own environment and leave the signal handlers off. */
  bootstrap?: BootstrapOptions;
  /** Checks tokens in place of GoTrue. Tests pass createTestAuth().verifier. Personal tenants still apply. */
  verifier?: { verify(token: string): Promise<ResolvedIdentity> };
  /** Apply the committed migrations (drizzle/) at start. Default: the MIGRATE_ON_START setting. */
  migrateOnStart?: boolean;
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
${WIRING_APP_FIELDS}${orgs ? ORGANIZATIONS_APP_FIELD : ''}  /** Connects, starts the job worker and listens. Resolves to the address it listens on. */
  start(): Promise<string>;
  /** Stops listening, then closes the worker and the connections. */
  stop(): Promise<void>;
}

/** The composition root: builds everything the app is made of. main.ts starts it; so do the end-to-end tests. */
export async function createApp(options: AppOptions = {}): Promise<App> {
  const { config, secrets, logger, tracer, metrics, container, lifecycle } = bootstrap(options.bootstrap);
  const instrumentation = { logger, tracer, metrics };
  const app = useConfigSection<AppSettings>(APP_CONFIG);

  if (!config.database) throw new ConfigError('app/database-required', 'DATABASE_URL is required');
${ui ? UI_APP_CHECK : ''}
  // Startup runs in ascending priority; shutdown runs in reverse.
  const database = lifecycle.manage(
    'database',
    createPostgresDatabase({ url: config.database.url, poolMin: config.database.poolMin, poolMax: config.database.poolMax }),
    { priority: 10 },
  );
  container.register(KEYS.Database, database);
  if (options.migrateOnStart ?? app.migrateOnStart) {
    lifecycle.startup.register({
      name: 'migrations',
      priority: 15,
      fn: async () => {
        if (!existsSync(\`\${MIGRATIONS}/meta/_journal.json\`)) {
          logger.warn({ folder: MIGRATIONS }, 'MIGRATE_ON_START: no migrations yet (pnpm db:generate, then commit drizzle/)');
          return;
        }
        await runMigrations(database.adapter, { migrationsFolder: MIGRATIONS, logger });
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
  const search = lifecycle.manage(
    'search',
    new DefaultSearch({ client: createPostgresSearch(database.db), tenantScoped: true }, instrumentation),
    { priority: 25 },
  );
  container.register(KEYS.Search, search);
  // Creates the indexes that aren't there yet. One that exists is left as it is, and a warning says so
  // when its fields here have changed: they take effect when you reindex.
  lifecycle.startup.register({ name: 'search-indexes', priority: 30, fn: async () => void (await search.ensureIndexes(options.searchIndexes ?? searchIndexes)) });

${WIRING_APP_EVENTS}
  // One communication layer per process: handlers register on it, controllers call through it.
  const communication = createCommunication({}, instrumentation);
  container.register(KEYS.Communication, communication);
${WIRING_APP_SERVICES}${orgs ? organizationsAppSetup('gotrue') : ''}
  // Sign-in is GoTrue's: its ES256 tokens are checked against its JWKS, issuer and audience.
  const provider = options.verifier ?? createGoTrueAuth(goTrueConfig(app.auth));
${orgs
  ? '  // A user who names no organization works in a personal tenant, user.app.<id>, so the app also works\n  // for individuals (AUTH_PERSONAL_TENANTS).\n'
  : '  // The tenant is the organization the token names (AUTH_ORG_CLAIM). A user in no organization gets a\n  // personal tenant, user.app.<id>, so the app also works for individuals (AUTH_PERSONAL_TENANTS).\n'}  const auth = app.auth.personalTenants ? withPersonalTenants(provider, { namespace: 'app' }) : provider;
  // A claim or x-tenant-id header that disagrees with the verified identity is refused (tenancy/mismatch).
  const tenancy = createTenancy({ strategy: 'jwt-claim', claimName: app.auth.orgClaim }, instrumentation);

  const api = createApiServer({
    name: 'api',
    prefix: '/api',
    logger,
    tracer,
    trustProxy: config.server.trustProxy,
    bodyLimitBytes: config.server.bodyLimitBytes,
    cors: config.server.corsOrigins.length > 0 ? { origins: config.server.corsOrigins } : false,
  })
${orgs ? ORGANIZATIONS_STRATEGY_COMMENT : ''}    .withAuthStrategy('session', ${orgs ? 'organizationStrategy(bearerStrategy(auth), access)' : 'bearerStrategy(auth)'})
    .withAuth('session')
    .withMiddleware(createTenancyMiddleware(tenancy))
${ui ? UI_APP_STATIC : ''}    .withHealth(lifecycle.health)
    .withOpenApi({ info: { title: config.serviceName, version: '0.1.0' } });
  options.configureApi?.(api);
  for (const controller of createControllers(communication)) api.registerController(controller);
${WIRING_APP_WEBHOOKS}
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
${orgs ? '    organizations,\n' : ''}${WIRING_APP_RETURN}    start: async () => {
      await lifecycle.start();
      return address;
    },
    stop: async () => {
      await lifecycle.stop();
    },
  };
}
`;

const APP_E2E_TEST = `import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startApp, type RunningApp } from './testing/e2e';

let running: RunningApp;
beforeAll(async () => {
  running = await startApp();
});
afterAll(() => running?.stop());

// Each user as the claims of their GoTrue token. GoTrue adds sub, email and its own role
// ("authenticated"). An access-token hook adds the organization and the role in it, for a member only:
// a user in no organization has none of those claims at all. The mapping to an identity is the provider's.
const ORG = '6f0d6b0c-3a4e-4c1b-9f5e-2b7d1a9c8e10';
const ADA = '0b9d4c53-8f0a-4d0e-9a63-5c2f1e7b3a41';
const member = { sub: ADA, email: 'ada@example.test', role: 'authenticated', org_id: ORG, org_slug: 'acme', org_role: 'member' };
const owner = { sub: 'c2a1f0de-7b6c-4e59-8d3a-1f0e9b8c7d62', role: 'authenticated', org_id: ORG, org_slug: 'acme', org_role: 'owner' };
const solo = { sub: 'e4b7a9c1-2d3f-4a5b-8c6d-7e8f9a0b1c23', email: 'solo@example.test', role: 'authenticated' };

describe('the app, started as main.ts starts it', () => {
  it('is ready: the database, which holds the job queue and search, is connected', async () => {
    const res = await running.request('/api/health/ready');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'healthy' });
  });

  it('serves the sign-in page to anyone, and asks everyone else for a token', async () => {
    expect((await running.request('/api/sign-in')).status).toBe(200);
    expect((await running.request('/api/me')).status).toBe(401);
    expect((await running.request('/api/me', { headers: { authorization: 'Bearer made-up' } })).status).toBe(401);
  });

  it('puts a member in their organization, with the role the token gives them there', async () => {
    const res = await running.request('/api/me', { claims: member });
    expect(await res.json()).toEqual({ userId: ADA, tenantId: ORG, personal: false, roles: ['authenticated', 'member'], email: 'ada@example.test' });
    expect((await running.request('/api/me/admin', { claims: member })).status).toBe(403);
    expect((await running.request('/api/me/admin', { claims: owner })).status).toBe(200);
  });

  it('gives a user in no organization a personal tenant, where they are the admin', async () => {
    const me = (await (await running.request('/api/me', { claims: solo })).json()) as { tenantId: string; personal: boolean; roles: string[] };
    expect(me).toMatchObject({ tenantId: 'user.app.' + solo.sub, personal: true, roles: ['authenticated'] });
    expect((await running.request('/api/me/admin', { claims: solo })).status).toBe(200);
  });

  it('treats a token someone acts through as the user it is for', async () => {
    // An impersonation ("view as") token: sub is the user being viewed, act says who is acting
    const viewed = { ...member, act: { sub: 'support:42' } };
    const me = (await (await running.request('/api/me', { claims: viewed })).json()) as { userId: string; tenantId: string };
    expect(me).toMatchObject({ userId: ADA, tenantId: ORG });
    expect((await running.request('/api/me/admin', { claims: viewed })).status).toBe(403);
  });

  it('refuses a token that names a personal tenant itself, one with no subject, and a tenant header that disagrees', async () => {
    const forged = await running.request('/api/me', { claims: { ...solo, org_id: 'user.app.' + ADA } });
    expect(forged.status).toBe(401);
    expect(await forged.json()).toMatchObject({ error: { code: 'auth/invalid-token' } });
    expect((await running.request('/api/me', { claims: { role: 'authenticated', org_id: ORG } })).status).toBe(401);
    expect((await running.request('/api/me', { claims: member, headers: { 'x-tenant-id': 'another-org' } })).status).toBe(403);
  });

  it('requires an organization when personal tenants are off', async () => {
    const strict = await startApp({ env: { AUTH_PERSONAL_TENANTS: 'false' } });
    try {
      const res = await strict.request('/api/me', { claims: solo });
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(await res.json()).toMatchObject({ error: { code: 'tenancy/missing-tenant' } });
      expect((await strict.request('/api/me', { claims: member })).status).toBe(200);
    } finally {
      await strict.stop();
    }
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

/** `src/app.e2e.test.ts` with `--orgs`: organizations come from the app's own memberships, not from a token hook. */
const ORGANIZATIONS_APP_E2E_TEST = `import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startApp, type RunningApp } from './testing/e2e';

let running: RunningApp;
beforeAll(async () => {
  running = await startApp();
});
afterAll(() => running?.stop());

// Users as the harness signs them in: GoTrue's token gives the subject, the email and its own role
// ("authenticated"). \`tenantId\` is the name of an organization they are in (the harness makes it, and
// the membership, the first time it is named: the first user named is its owner); '' is none.
const ADA = '0b9d4c53-8f0a-4d0e-9a63-5c2f1e7b3a41';
const LIN = 'c2a1f0de-7b6c-4e59-8d3a-1f0e9b8c7d62';
const owner = { userId: ADA, tenantId: 'acme', claims: { email: 'ada@example.test' } };
const member = { userId: LIN, tenantId: 'acme' };
const solo = { sub: 'e4b7a9c1-2d3f-4a5b-8c6d-7e8f9a0b1c23', email: 'solo@example.test', role: 'authenticated' };

describe('the app, started as main.ts starts it', () => {
  it('is ready: the database, which holds the job queue and search, is connected', async () => {
    const res = await running.request('/api/health/ready');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'healthy' });
  });

  it('serves the sign-in page to anyone, and asks everyone else for a token', async () => {
    expect((await running.request('/api/sign-in')).status).toBe(200);
    expect((await running.request('/api/me')).status).toBe(401);
    expect((await running.request('/api/me', { headers: { authorization: 'Bearer made-up' } })).status).toBe(401);
  });

  it('puts a member in the organization the request names, with the role their membership gives them', async () => {
    const me = (await (await running.request('/api/me', { as: owner })).json()) as { tenantId: string };
    expect(me).toEqual({ userId: ADA, tenantId: expect.stringMatching(/^[0-9a-f-]{36}$/), personal: false, roles: ['authenticated', 'owner'], email: 'ada@example.test' });
    expect((await running.request('/api/me/admin', { as: owner })).status).toBe(200);
    expect((await running.request('/api/me/admin', { as: member })).status).toBe(403);
    // A role that comes with the token says nothing about this organization
    expect((await running.request('/api/me/admin', { as: { ...member, claims: { org_role: 'owner' } } })).status).toBe(403);
    // And an organization the user isn't in is the same as one that doesn't exist
    const outsider = await running.request('/api/me', { claims: solo, headers: { 'x-organization-id': me.tenantId } });
    expect(outsider.status).toBe(404);
    expect(await outsider.json()).toMatchObject({ error: { code: 'organizations/not-found' } });
  });

  it('gives a user who names no organization a personal tenant, where they are the owner', async () => {
    const me = (await (await running.request('/api/me', { claims: solo })).json()) as { tenantId: string; personal: boolean; roles: string[] };
    expect(me).toMatchObject({ tenantId: 'user.app.' + solo.sub, personal: true, roles: ['authenticated', 'owner'] });
    expect((await running.request('/api/me/admin', { claims: solo })).status).toBe(200);
  });

  it('treats a token someone acts through as the user it is for', async () => {
    // An impersonation ("view as") token: sub is the user being viewed, act says who is acting
    const viewed = { ...member, claims: { act: { sub: 'support:42' } } };
    expect(await (await running.request('/api/me', { as: viewed })).json()).toMatchObject({ userId: LIN, roles: ['authenticated', 'member'] });
    expect((await running.request('/api/me/admin', { as: viewed })).status).toBe(403);
  });

  it('refuses a token that names a personal tenant itself, one with no subject, and a tenant header that disagrees', async () => {
    const forged = await running.request('/api/me', { claims: { ...solo, org_id: 'user.app.' + ADA } });
    expect(forged.status).toBe(401);
    expect(await forged.json()).toMatchObject({ error: { code: 'auth/invalid-token' } });
    expect((await running.request('/api/me', { claims: { role: 'authenticated' } })).status).toBe(401);
    expect((await running.request('/api/me', { as: owner, headers: { 'x-tenant-id': 'another-org' } })).status).toBe(403);
  });

  it('requires an organization when personal tenants are off', async () => {
    const strict = await startApp({ env: { AUTH_PERSONAL_TENANTS: 'false' } });
    try {
      const res = await strict.request('/api/me', { claims: solo });
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(await res.json()).toMatchObject({ error: { code: 'tenancy/missing-tenant' } });
      expect((await strict.request('/api/me', { as: owner })).status).toBe(200);
      // The organization routes still answer: that is how such a user creates or joins one
      expect((await strict.request('/api/organizations', { claims: solo })).status).toBe(200);
    } finally {
      await strict.stop();
    }
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

const CONTROLLERS_INDEX = (orgs: boolean, ui: boolean) => `import type { BaseController } from '@mariachi/api-facade';
import type { CommunicationLayer } from '@mariachi/communication';
${ui ? "import { PagesController } from './pages.controller';\n" : ''}${orgs ? "import { OrganizationsController } from '@mariachi/organizations/http';\n" : ''}import { MeController } from './me.controller';
import { SignInController } from './sign-in.controller';
// ${MARKERS.imports}

export function createControllers(communication: CommunicationLayer): BaseController[] {
  return [
${ui ? '    new PagesController(communication),\n' : ''}    new MeController(communication),
    new SignInController(communication),
${orgs ? '    new OrganizationsController(communication),\n' : ''}    // ${MARKERS.controllers}
  ];
}
`;

const ME_CONTROLLER = `import { BaseController } from '@mariachi/api-facade';
import { AuthError, isPersonalTenant } from '@mariachi/core';
import { z } from 'zod';

/** Roles in an organization that may administer it. */
export const ADMIN_ROLES = ['owner', 'admin'];

const meResponse = z.object({
  userId: z.string(),
  /** The user's organization (the org claim), or their personal tenant when they're in none. */
  tenantId: z.string(),
  /** True when the tenant is the user's own and not an organization's. */
  personal: z.boolean(),
  /** GoTrue's role (\`authenticated\`) plus the role in the organization, if any. */
  roles: z.array(z.string()),
  email: z.string().optional(),
});

export type Me = z.infer<typeof meResponse>;

const text = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
const record = (v: unknown) => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {});

/** The signed-in user, from the verified token. Anything else in the token is in \`ctx.identity.claims\`. */
export class MeController extends BaseController {
  readonly prefix = 'me';
  readonly tags = ['me'];

  init(): void {
    this.get('/', { schema: { response: meResponse } }, async (ctx) => {
      const claims = record(ctx.identity?.claims);
      return {
        userId: ctx.userId ?? '',
        tenantId: ctx.tenantId ?? '',
        personal: isPersonalTenant(ctx.tenantId),
        roles: ctx.identity?.roles ?? [],
        email: text(claims.email),
      };
    });

    // Roles include the role in the organization. Route \`scopes\` need every listed one, so a check
    // for any of several roles goes in the handler. In a personal tenant the user is the only member.
    this.get('/admin', { schema: { response: z.object({ admin: z.literal(true) }) } }, async (ctx) => {
      const admin = isPersonalTenant(ctx.tenantId) || ctx.identity?.roles?.some((r) => ADMIN_ROLES.includes(r));
      if (!admin) throw new AuthError('auth/forbidden', 'Organization owners and admins only');
      return { admin: true as const };
    });
  }
}
`;

const ME_CONTROLLER_TEST = `import { describe, expect, it } from 'vitest';
import { AuthError, markPersonalTenant, personalTenantId, type Logger } from '@mariachi/core';
import { bearerStrategy, createApiServer, type ResolvedIdentity } from '@mariachi/api-facade';
import { MeController } from './me.controller';

const logger = { debug() {}, info() {}, warn() {}, error() {}, child: () => logger } as unknown as Logger;

// What @mariachi/auth-gotrue returns for a token that carries an organization and a role in it.
const ORG = '0b7c3f0e-5d1a-4c9e-9a51-3f7d2a6c8e10';
const member = (name: string, orgRole: string): ResolvedIdentity => ({
  userId: \`user-\${name}\`,
  tenantId: ORG,
  scopes: ['authenticated', orgRole],
  roles: ['authenticated', orgRole],
  identityType: 'session',
  claims: { sub: \`user-\${name}\`, email: \`\${name}@example.test\`, org_id: ORG, org_role: orgRole },
});
// And for a user in no organization, once withPersonalTenants has given them their own tenant.
const solo: ResolvedIdentity = markPersonalTenant({
  userId: 'user-solo',
  tenantId: personalTenantId('app', 'user-solo'),
  scopes: ['authenticated'],
  roles: ['authenticated'],
  identityType: 'session',
  claims: { sub: 'user-solo', email: 'solo@example.test' },
});
const tokens: Record<string, ResolvedIdentity> = {
  owner: member('owner', 'owner'),
  admin: member('admin', 'admin'),
  member: member('member', 'member'),
  solo,
};

function server() {
  const verifier = {
    async verify(token: string) {
      const identity = tokens[token];
      if (!identity) throw new AuthError('auth/invalid-token', 'Invalid token');
      return identity;
    },
  };
  return createApiServer({ name: 'test', prefix: '/api', logger })
    .withAuthStrategy('session', bearerStrategy(verifier))
    .withAuth('session')
    .registerController(new MeController());
}

const get = (url: string, token?: string) =>
  server().inject({ method: 'GET', url, headers: token ? { authorization: \`Bearer \${token}\` } : {} });

describe('MeController', () => {
  it('returns the signed-in user with their organization and roles', async () => {
    const res = await get('/api/me', 'member');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      userId: 'user-member',
      tenantId: ORG,
      personal: false,
      roles: ['authenticated', 'member'],
      email: 'member@example.test',
    });
  });

  it('returns a user in no organization with their personal tenant', async () => {
    const res = await get('/api/me', 'solo');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ userId: 'user-solo', tenantId: 'user.app.user-solo', personal: true, roles: ['authenticated'], email: 'solo@example.test' });
  });

  it("admits an organization's owners and admins, and a user in their own tenant, to /me/admin", async () => {
    expect((await get('/api/me/admin', 'owner')).statusCode).toBe(200);
    expect((await get('/api/me/admin', 'admin')).statusCode).toBe(200);
    expect((await get('/api/me/admin', 'solo')).statusCode).toBe(200);
    expect((await get('/api/me/admin', 'member')).statusCode).toBe(403);
  });

  it('needs a valid token', async () => {
    expect((await get('/api/me')).statusCode).toBe(401);
    expect((await get('/api/me', 'forged')).statusCode).toBe(401);
  });
});
`;

const SIGN_IN_CONTROLLER = `import { BaseController, httpResponse } from '@mariachi/api-facade';
import { useConfigSection } from '@mariachi/config';
import { browserAuthUrl } from '../../auth';
import { APP_CONFIG, type AppSettings } from '../../config';
import { SIGN_IN_HTML, signInScript } from '../pages/sign-in';

/** The page loads its script from this origin, and calls only this origin and GoTrue. */
export function contentSecurityPolicy(authUrl: string): string {
  const connect = /^https?:\\/\\//.test(authUrl) ? \`'self' \${new URL(authUrl).origin}\` : "'self'";
  return \`default-src 'none'; script-src 'self'; connect-src \${connect}; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'\`;
}

/** An example sign-in page at /api/sign-in: password, sign-up and magic link against GoTrue, then GET /api/me. */
export class SignInController extends BaseController {
  readonly prefix = 'sign-in';
  readonly tags = ['sign-in'];

  init(): void {
    this.get('/', { auth: false, summary: 'Example sign-in page' }, async () => {
      const { auth } = useConfigSection<AppSettings>(APP_CONFIG);
      return httpResponse(200, SIGN_IN_HTML, {
        'content-type': 'text/html; charset=utf-8',
        'content-security-policy': contentSecurityPolicy(browserAuthUrl(auth)),
        // A link lands here with a one-time code in the query; it's never sent on in a Referer
        'referrer-policy': 'no-referrer',
        'cache-control': 'no-store',
      });
    });
    this.get('/client.js', { auth: false, summary: "The sign-in page's script" }, async () => {
      const { auth } = useConfigSection<AppSettings>(APP_CONFIG);
      return httpResponse(200, signInScript({ authUrl: browserAuthUrl(auth), anonKey: auth.anonKey, linkSessions: auth.linkSessions }), {
        'content-type': 'text/javascript; charset=utf-8',
        'cache-control': 'no-store',
      });
    });
  }
}
`;

const SIGN_IN_CONTROLLER_TEST = `import { Script } from 'node:vm';
import { afterEach, describe, expect, it } from 'vitest';
import type { Logger } from '@mariachi/core';
import { loadConfig, resetConfig } from '@mariachi/config';
import { createApiServer } from '@mariachi/api-facade';
import { SignInController } from './sign-in.controller';
import { signInScript } from '../pages/sign-in';

const logger = { debug() {}, info() {}, warn() {}, error() {}, child: () => logger } as unknown as Logger;
const server = (env: Record<string, string> = {}) => {
  loadConfig({}, { env });
  return createApiServer({ name: 'test', prefix: '/api', logger }).registerController(new SignInController());
};

afterEach(() => resetConfig());

describe('SignInController', () => {
  it('serves the page without a token, locked to this origin by its CSP', async () => {
    const res = await server().inject({ method: 'GET', url: '/api/sign-in' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.headers['content-security-policy']).toContain("script-src 'self'");
    expect(res.headers['content-security-policy']).toContain("connect-src 'self';");
    expect(res.body).toContain('<script type="module" src="/api/sign-in/client.js">');
  });

  it("serves the page's script, which talks to GoTrue at ${AUTH_PATH} on this origin by default", async () => {
    const res = await server().inject({ method: 'GET', url: '/api/sign-in/client.js' });
    expect(res.headers['content-type']).toContain('text/javascript');
    expect(res.body).toContain('const AUTH = "${AUTH_PATH}";');
    expect(res.body).toContain('const ANON_KEY = null;');
    expect(res.body).toContain('const LINK_SESSIONS = false;');
    expect(() => new Script(res.body)).not.toThrow();
  });

  it("points the page at GoTrue's public URL when one is set, and lets the browser reach only that origin", async () => {
    const env = { AUTH_URL: 'https://abc.supabase.co${AUTH_PATH}', AUTH_ANON_KEY: 'publishable-key' };
    const page = await server(env).inject({ method: 'GET', url: '/api/sign-in' });
    expect(page.headers['content-security-policy']).toContain("connect-src 'self' https://abc.supabase.co;");
    const script = await server(env).inject({ method: 'GET', url: '/api/sign-in/client.js' });
    expect(script.body).toContain('const AUTH = "https://abc.supabase.co${AUTH_PATH}";');
    expect(script.body).toContain('const ANON_KEY = "publishable-key";');
  });

  it('lets the page take a session from an admin-made link only when AUTH_LINK_SESSIONS says so', async () => {
    const script = await server({ AUTH_LINK_SESSIONS: 'true' }).inject({ method: 'GET', url: '/api/sign-in/client.js' });
    expect(script.body).toContain('const LINK_SESSIONS = true;');
  });

  it('writes its settings into the script as data, never as code', () => {
    const script = signInScript({ authUrl: '"; alert(1); "', anonKey: "'</script>" });
    expect(() => new Script(script)).not.toThrow();
    expect(script.startsWith('const AUTH = ' + JSON.stringify('"; alert(1); "') + ';')).toBe(true);
  });
});
`;

// The page's script is plain browser JavaScript in a string: no template literals or backslashes inside.
const SIGN_IN_PAGE = `/**
 * An example sign-in flow against GoTrue with plain fetch: password sign-in, sign-up, a magic link
 * and sign-out. Emailed links use PKCE: the link comes back with a one-time code, which only the
 * browser that asked for it can exchange for a session. The session is kept in sessionStorage and
 * sent to the API as a bearer token. supabase-js does the same with \`flowType: 'pkce'\` (see README.md).
 */
export const SIGN_IN_HTML = \`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign in</title>
<style>
  body { font: 16px/1.5 system-ui, sans-serif; max-width: 32rem; margin: 3rem auto; padding: 0 1rem; }
  label, input, button { display: block; width: 100%; box-sizing: border-box; }
  input { margin: 0.25rem 0 1rem; padding: 0.5rem; }
  button { margin: 0.5rem 0; padding: 0.5rem; cursor: pointer; }
  pre { background: #f4f4f5; padding: 1rem; overflow: auto; white-space: pre-wrap; }
</style>
</head>
<body>
<h1>Sign in</h1>
<p>Signs in against GoTrue with plain <code>fetch</code>, then calls <code>GET /api/me</code>.</p>
<section id="signed-out">
  <form id="password-form">
    <label for="email">Email</label>
    <input id="email" type="email" autocomplete="email" required>
    <label for="password">Password</label>
    <input id="password" type="password" autocomplete="current-password">
    <button type="submit">Sign in with password</button>
    <button type="button" id="sign-up">Sign up with this email and password</button>
    <button type="button" id="magic-link">Email me a sign-in link</button>
  </form>
</section>
<section id="signed-in" hidden>
  <button type="button" id="sign-out">Sign out</button>
</section>
<section id="link-session" hidden>
  <p>This link signs you in as <strong id="link-account"></strong>. Continue only if that is the account you expect.</p>
  <button type="button" id="link-accept">Continue as this account</button>
  <button type="button" id="link-decline">Cancel</button>
</section>
<p id="status" role="status"></p>
<pre id="output"></pre>
<script type="module" src="/api/sign-in/client.js"></script>
</body>
</html>
\`;

/** The page's script, after the settings \`signInScript\` puts in front of it (\`AUTH\`, \`ANON_KEY\`, \`LINK_SESSIONS\`). */
export const SIGN_IN_JS = \`const KEY = 'session';
// PKCE: an emailed link comes back with a one-time code, and the code is only good with the verifier this
// browser kept when it asked for the link. It's in localStorage because the link opens in a new tab.
const VERIFIER = 'sign-in-verifier';
const VERIFIER_SECONDS = 3600;
// A session a link brought, shown to the user and not yet accepted. In memory only.
let offered = null;
// Said in place of "Signed in." on the next render
let notice = '';
const byId = (id) => document.getElementById(id);
const here = () => location.origin + location.pathname;

function show(message, data) {
  byId('status').textContent = message;
  byId('output').textContent = data === undefined ? '' : JSON.stringify(data, null, 2);
}

function save(session) {
  const expiresAt = Number(session.expires_at) || Math.floor(Date.now() / 1000) + Number(session.expires_in || 3600);
  sessionStorage.setItem(KEY, JSON.stringify({ accessToken: session.access_token, refreshToken: session.refresh_token, expiresAt: expiresAt }));
}

function load() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
}

// GoTrue's endpoints (what supabase-js calls): POST JSON, errors as { msg } or { error_description }.
async function gotrue(path, body, token) {
  const headers = { 'content-type': 'application/json' };
  if (ANON_KEY) headers.apikey = ANON_KEY;
  if (token) headers.authorization = 'Bearer ' + token;
  const res = await fetch(AUTH + path, { method: 'POST', headers: headers, body: JSON.stringify(body || {}) });
  const data = await res.json().catch(() => ({}));
  // Browser code, outside the framework's error types. mariachi-validate-ignore no-raw-error
  if (!res.ok) throw new Error(data.msg || data.error_description || data.message || 'HTTP ' + res.status);
  return data;
}

function base64url(bytes) {
  let text = '';
  for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text).split('+').join('-').split('/').join('_').split('=').join('');
}

// A new verifier, kept in this browser, and its SHA-256 challenge for GoTrue to hold until the code comes back.
async function challenge() {
  // Browser code, outside the framework's error types. mariachi-validate-ignore no-raw-error
  if (!crypto.subtle) throw new Error('this page needs https (or localhost) to ask for a link');
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(48)));
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  // With the time it was made: a link older than an hour finds no verifier
  localStorage.setItem(VERIFIER, verifier + '.' + Math.floor(Date.now() / 1000));
  return { code_challenge: base64url(new Uint8Array(digest)), code_challenge_method: 's256' };
}

// The stored session, refreshed when its access token is (nearly) expired.
async function current() {
  const session = load();
  if (!session || session.expiresAt - 30 > Date.now() / 1000) return session;
  try {
    save(await gotrue('/token?grant_type=refresh_token', { refresh_token: session.refreshToken }));
    return load();
  } catch {
    sessionStorage.removeItem(KEY);
    return null;
  }
}

async function render() {
  const session = await current();
  byId('link-session').hidden = !offered;
  byId('signed-out').hidden = Boolean(session) || Boolean(offered);
  byId('signed-in').hidden = !session;
  if (!session) return;
  const res = await fetch('/api/me', { headers: { authorization: 'Bearer ' + session.accessToken } });
  const body = await res.json().catch(() => ({}));
  if (res.ok) show(notice || 'Signed in.', body);
  else if (body.error && body.error.code === 'tenancy/missing-tenant') {
    show('Signed in, but in no organization, and this API is set to need one (AUTH_PERSONAL_TENANTS=false).', body);
  } else show('GET /api/me answered ' + res.status, body);
  notice = '';
}

// After a magic or confirmation link, GoTrue redirects here with a one-time code (or an error) in the query.
// A session is never taken from the address bar: a link that carried tokens could sign someone in as its sender.
async function fromRedirect() {
  if (!location.search && !location.hash) return;
  const query = new URLSearchParams(location.search);
  const hash = new URLSearchParams(location.hash.slice(1));
  // Out of the address bar first, so the code isn't kept in history
  history.replaceState(null, '', location.pathname);
  const code = query.get('code');
  if (code) {
    const kept = (localStorage.getItem(VERIFIER) || '').split('.');
    localStorage.removeItem(VERIFIER);
    const verifier = Date.now() / 1000 - Number(kept[1]) < VERIFIER_SECONDS ? kept[0] : '';
    if (!verifier) return show('This link was not asked for in this browser, is more than an hour old, or was already used. Ask for a new one here.');
    try {
      save(await gotrue('/token?grant_type=pkce', { auth_code: code, code_verifier: verifier }));
    } catch (error) {
      show('The link did not work: ' + error.message);
    }
    return;
  }
  // The page's own words, never the link's: a crafted link can't put text on this page
  if (query.get('error') || query.get('error_description') || hash.get('error') || hash.get('error_description')) {
    show('The link is invalid or has expired. Ask for a new one here.');
  } else if (hash.get('access_token')) await offer(hash);
}

// Who a token belongs to, asked of GoTrue.
async function whose(token) {
  const headers = { authorization: 'Bearer ' + token };
  if (ANON_KEY) headers.apikey = ANON_KEY;
  const res = await fetch(AUTH + '/user', { headers: headers });
  const user = res.ok ? await res.json().catch(() => null) : null;
  return (user && (user.email || user.phone || user.id)) || null;
}

// A link an admin made (an invite, or GoTrue's generate_link) can't use PKCE: no browser asked for it, so it
// arrives with the session itself. A stranger's link would sign you in as them the same way, so the page takes
// one only if the app allows it (AUTH_LINK_SESSIONS), only when signed out, and only after showing whose it is.
async function offer(hash) {
  if (!LINK_SESSIONS) return show('This page takes sign-in links by one-time code only. Ask for a new link here.');
  if (load()) {
    notice = 'You are already signed in, so the link was not used. Sign out first to use it.';
    return;
  }
  const account = await whose(hash.get('access_token')).catch(() => null);
  if (!account) return show('The link is invalid or has expired. Ask for a new one here.');
  offered = { access_token: hash.get('access_token'), refresh_token: hash.get('refresh_token'), expires_at: hash.get('expires_at'), expires_in: hash.get('expires_in') };
  byId('link-account').textContent = account;
}

const credentials = () => ({ email: byId('email').value.trim(), password: byId('password').value });

byId('password-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    save(await gotrue('/token?grant_type=password', credentials()));
    await render();
  } catch (error) {
    show('Sign-in failed: ' + error.message);
  }
});

byId('sign-up').addEventListener('click', async () => {
  try {
    const result = await gotrue('/signup?redirect_to=' + encodeURIComponent(here()), Object.assign(credentials(), await challenge()));
    if (result.access_token) {
      localStorage.removeItem(VERIFIER);
      save(result);
      await render();
    } else show('Check your email for the confirmation link.');
  } catch (error) {
    show('Sign-up failed: ' + error.message);
  }
});

byId('magic-link').addEventListener('click', async () => {
  try {
    await gotrue('/otp?redirect_to=' + encodeURIComponent(here()), Object.assign({ email: credentials().email, create_user: true }, await challenge()));
    show('Check your email for the sign-in link.');
  } catch (error) {
    show('Could not send the link: ' + error.message);
  }
});

byId('link-accept').addEventListener('click', async () => {
  const session = offered;
  offered = null;
  if (session) save(session);
  await render();
});

byId('link-decline').addEventListener('click', async () => {
  offered = null;
  show('The link was not used.');
  await render();
});

byId('sign-out').addEventListener('click', async () => {
  const session = load();
  sessionStorage.removeItem(KEY);
  localStorage.removeItem(VERIFIER);
  if (session) await gotrue('/logout', {}, session.accessToken).catch(() => undefined);
  show('Signed out.');
  await render();
});

// Tests wait on this
const ready = fromRedirect().then(render);
\`;

/** The script as served: where the browser reaches GoTrue, and the key hosted Supabase wants, written in as JSON. */
export function signInScript(options: { authUrl: string; anonKey?: string; linkSessions?: boolean }): string {
  const settings = [
    \`const AUTH = \${JSON.stringify(options.authUrl)};\`,
    \`const ANON_KEY = \${JSON.stringify(options.anonKey ?? null)};\`,
    \`const LINK_SESSIONS = \${options.linkSessions === true};\`,
  ];
  return \`\${settings.join('\\n')}\\n\${SIGN_IN_JS}\`;
}
`;

// Test support in the generated project: enough of a browser to run the page's script under vitest.
const FAKE_BROWSER = `import { webcrypto } from 'node:crypto';
import { createContext, Script } from 'node:vm';

/**
 * Test support: a browser small enough to run the sign-in page's script. It has the elements the
 * script reads, both storages, the address bar and \`fetch\`. Not for production code.
 */
export interface FakePage {
  /** The address bar, after any history.replaceState */
  url(): string;
  /** sessionStorage: this tab's */
  session: Map<string, string>;
  /** localStorage: the browser's, shared by its tabs. Pass one page's to the next to open a second tab. */
  local: Map<string, string>;
  /** The text of the element with this id */
  text(id: string): string;
  /** Types into an input */
  type(id: string, value: string): void;
  /** Clicks a button, or submits a form, and waits for the script's handler */
  fire(id: string, event: 'click' | 'submit'): Promise<void>;
}

export interface FakePageOptions {
  /** The script as served: signInScript({ ... }) */
  script: string;
  /** The address the page is opened at, with any query and hash a link brought */
  url: string;
  /** Every request the script makes. Relative addresses (/api/me) arrive as written. */
  fetch: (input: string, init?: RequestInit) => Promise<Response>;
  local?: Map<string, string>;
  /** This tab's sessionStorage from an earlier page load, to load another address in the same tab */
  session?: Map<string, string>;
}

const storage = (map: Map<string, string>) => ({
  getItem: (key: string) => map.get(key) ?? null,
  setItem: (key: string, value: string) => void map.set(key, String(value)),
  removeItem: (key: string) => void map.delete(key),
});

/** Opens the page: runs the script and waits until it has dealt with the address it was opened at. */
export async function openPage(options: FakePageOptions): Promise<FakePage> {
  let url = new URL(options.url);
  const session = options.session ?? new Map<string, string>();
  const local = options.local ?? new Map<string, string>();
  const elements = new Map<string, { value: string; hidden: boolean; textContent: string; handlers: Map<string, (event: unknown) => unknown> }>();
  const element = (id: string) => {
    let found = elements.get(id);
    if (!found) {
      const handlers = new Map<string, (event: unknown) => unknown>();
      found = { value: '', hidden: false, textContent: '', handlers };
      Object.assign(found, { addEventListener: (name: string, handler: (event: unknown) => unknown) => void handlers.set(name, handler) });
      elements.set(id, found);
    }
    return found;
  };
  const context = createContext({
    document: { getElementById: element },
    location: {
      get origin() { return url.origin; },
      get pathname() { return url.pathname; },
      get search() { return url.search; },
      get hash() { return url.hash; },
    },
    history: { replaceState: (_state: unknown, _title: string, to: string) => void (url = new URL(to, url)) },
    sessionStorage: storage(session),
    localStorage: storage(local),
    fetch: options.fetch,
    crypto: webcrypto,
    URLSearchParams,
    TextEncoder,
    btoa,
  });
  new Script(options.script).runInContext(context);
  await new Script('ready').runInContext(context);
  return {
    url: () => url.href,
    session,
    local,
    text: (id) => element(id).textContent,
    type: (id, value) => void (element(id).value = value),
    fire: async (id, event) => {
      await element(id).handlers.get(event)?.({ preventDefault() {} });
    },
  };
}
`;

const SIGN_IN_PAGE_TEST = `import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { openPage } from './fake-browser';
import { signInScript } from './sign-in';

const script = signInScript({ authUrl: 'https://auth.example.test${AUTH_PATH}' });
const page = 'https://app.example.test/api/sign-in';
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const session = { access_token: 'access-1', refresh_token: 'refresh-1', expires_in: 3600 };
/** A verifier as the page keeps it: with the second it was made. */
const fresh = (verifier: string, ageSeconds = 0) => verifier + '.' + (Math.floor(Date.now() / 1000) - ageSeconds);

/** A fetch that records every request and answers GoTrue's token endpoint and GET /api/me. */
function recorder(answers: Record<string, () => Response> = {}) {
  const calls: Array<{ url: string; body: Record<string, unknown>; authorization?: string }> = [];
  const fetch = async (input: string, init?: RequestInit) => {
    const headers = (init?.headers ?? {}) as Record<string, string>;
    calls.push({ url: input, body: init?.body ? JSON.parse(String(init.body)) : {}, authorization: headers.authorization });
    const path = input.replace('https://auth.example.test${AUTH_PATH}', '');
    for (const [prefix, answer] of Object.entries(answers)) if (path.startsWith(prefix)) return answer();
    if (path === '/api/me') return json({ userId: 'user-1' });
    return json({});
  };
  return { calls, fetch };
}

describe('the sign-in page', () => {
  it('asks for a link with a PKCE challenge and keeps the verifier in this browser', async () => {
    const { calls, fetch } = recorder();
    const tab = await openPage({ script, url: page, fetch });
    tab.type('email', 'ada@example.test');
    await tab.fire('magic-link', 'click');

    const [verifier, madeAt] = (tab.local.get('sign-in-verifier') as string).split('.') as [string, string];
    expect(verifier).toMatch(/^[A-Za-z0-9_-]{43,128}$/);
    expect(Math.abs(Date.now() / 1000 - Number(madeAt))).toBeLessThan(5);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe('https://auth.example.test${AUTH_PATH}/otp?redirect_to=' + encodeURIComponent(page));
    expect(calls[0]?.body).toEqual({
      email: 'ada@example.test',
      create_user: true,
      code_challenge: createHash('sha256').update(verifier).digest('base64url'),
      code_challenge_method: 's256',
    });
    // The verifier itself never leaves the browser with the request
    expect(JSON.stringify(calls[0])).not.toContain(verifier);
    expect(tab.session.size).toBe(0);
  });

  it('turns the code a link brings into a session, with the verifier, once', async () => {
    const { calls, fetch } = recorder({ '/token?grant_type=pkce': () => json(session) });
    const local = new Map([['sign-in-verifier', fresh('the-verifier')]]);
    const tab = await openPage({ script, url: page + '?code=one-time-code', fetch, local });

    expect(calls[0]).toMatchObject({ url: 'https://auth.example.test${AUTH_PATH}/token?grant_type=pkce', body: { auth_code: 'one-time-code', code_verifier: 'the-verifier' } });
    expect(JSON.parse(tab.session.get('session') as string)).toMatchObject({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    expect(calls[1]).toMatchObject({ url: '/api/me', authorization: 'Bearer access-1' });
    // The code is out of the address bar and the verifier is spent
    expect(tab.url()).toBe(page);
    expect(local.has('sign-in-verifier')).toBe(false);
    expect(tab.text('status')).toBe('Signed in.');
  });

  it('does nothing with a code it has no verifier for (a link opened in another browser)', async () => {
    const { calls, fetch } = recorder({ '/token': () => json(session) });
    const tab = await openPage({ script, url: page + '?code=one-time-code', fetch });
    expect(calls).toEqual([]);
    expect(tab.session.size).toBe(0);
    expect(tab.url()).toBe(page);
    expect(tab.text('status')).toMatch(/not asked for in this browser/);
  });

  it('does nothing with a code whose verifier is more than an hour old', async () => {
    const { calls, fetch } = recorder({ '/token': () => json(session) });
    const local = new Map([['sign-in-verifier', fresh('the-verifier', 3601)]]);
    const tab = await openPage({ script, url: page + '?code=one-time-code', fetch, local });
    expect(calls).toEqual([]);
    expect(tab.session.size).toBe(0);
    expect(local.has('sign-in-verifier')).toBe(false);
  });

  it('says so when GoTrue refuses the code, and stays signed out', async () => {
    const { fetch } = recorder({ '/token?grant_type=pkce': () => json({ msg: 'invalid flow state' }, 404) });
    const tab = await openPage({ script, url: page + '?code=used', fetch, local: new Map([['sign-in-verifier', fresh('v')]]) });
    expect(tab.session.size).toBe(0);
    expect(tab.text('status')).toBe('The link did not work: invalid flow state');
  });

  it('never takes a session from the address bar', async () => {
    const { calls, fetch } = recorder();
    const tab = await openPage({ script, url: page + '#access_token=planted&refresh_token=planted&expires_in=3600', fetch });
    expect(tab.session.size).toBe(0);
    expect(calls).toEqual([]);
    expect(tab.url()).toBe(page);
    expect(tab.text('status')).toMatch(/one-time code only/);
  });

  it("says a link failed in its own words, never the link's", async () => {
    const { fetch } = recorder();
    for (const at of ['?', '#']) {
      const tab = await openPage({ script, url: page + at + 'error=access_denied&error_description=Call+this+number+to+restore+your+account', fetch });
      expect(tab.text('status')).toBe('The link is invalid or has expired. Ask for a new one here.');
      expect(tab.url()).toBe(page);
    }
  });

  describe('with AUTH_LINK_SESSIONS on (links an admin made: invites, generate_link)', () => {
    const allowing = signInScript({ authUrl: 'https://auth.example.test${AUTH_PATH}', linkSessions: true });
    const link = page + '#access_token=invited-token&refresh_token=invited-refresh&expires_in=3600&token_type=bearer';
    const invited = { '/user': () => json({ id: 'user-2', email: 'invited@example.test' }) };

    it('shows whose session the link carries and takes it only on Continue', async () => {
      const { calls, fetch } = recorder(invited);
      const tab = await openPage({ script: allowing, url: link, fetch });
      // Asked GoTrue who it is; nothing stored, and the API not called, until the user says yes
      expect(calls).toEqual([{ url: 'https://auth.example.test${AUTH_PATH}/user', body: {}, authorization: 'Bearer invited-token' }]);
      expect(tab.text('link-account')).toBe('invited@example.test');
      expect(tab.session.size).toBe(0);
      expect(tab.url()).toBe(page);

      await tab.fire('link-accept', 'click');
      expect(JSON.parse(tab.session.get('session') as string)).toMatchObject({ accessToken: 'invited-token', refreshToken: 'invited-refresh' });
      expect(calls.at(-1)).toMatchObject({ url: '/api/me', authorization: 'Bearer invited-token' });
    });

    it('drops it on Cancel', async () => {
      const { calls, fetch } = recorder(invited);
      const tab = await openPage({ script: allowing, url: link, fetch });
      await tab.fire('link-decline', 'click');
      await tab.fire('link-accept', 'click');
      expect(tab.session.size).toBe(0);
      expect(calls.filter((c) => c.url === '/api/me')).toEqual([]);
      expect(tab.text('status')).toBe('The link was not used.');
    });

    it("drops a session GoTrue doesn't recognise without offering it", async () => {
      const { fetch } = recorder({ '/user': () => json({ msg: 'invalid JWT' }, 403) });
      const tab = await openPage({ script: allowing, url: link, fetch });
      await tab.fire('link-accept', 'click');
      expect(tab.session.size).toBe(0);
      expect(tab.text('status')).toBe('The link is invalid or has expired. Ask for a new one here.');
    });

    it('never replaces a sign-in the browser already has', async () => {
      const { calls, fetch } = recorder({ ...invited, '/token?grant_type=password': () => json(session) });
      const tab = await openPage({ script: allowing, url: page, fetch });
      tab.type('email', 'ada@example.test');
      tab.type('password', 'correct horse');
      await tab.fire('password-form', 'submit');
      calls.length = 0;

      // The same tab follows a link carrying someone else's session
      const again = await openPage({ script: allowing, url: link, fetch, session: tab.session });
      expect(calls.some((c) => c.authorization === 'Bearer invited-token')).toBe(false);
      expect(again.text('status')).toBe('You are already signed in, so the link was not used. Sign out first to use it.');
      await again.fire('link-accept', 'click');
      expect(JSON.parse(again.session.get('session') as string)).toMatchObject({ accessToken: 'access-1' });
    });
  });

  it('signs in with a password and calls GET /api/me with the token', async () => {
    const { calls, fetch } = recorder({ '/token?grant_type=password': () => json(session) });
    const tab = await openPage({ script, url: page, fetch });
    tab.type('email', 'ada@example.test');
    tab.type('password', 'correct horse');
    await tab.fire('password-form', 'submit');
    expect(calls[0]?.body).toEqual({ email: 'ada@example.test', password: 'correct horse' });
    expect(calls[1]).toMatchObject({ url: '/api/me', authorization: 'Bearer access-1' });
    expect(tab.text('status')).toBe('Signed in.');
  });
});
`;

const AGENTS_AUTH_TESTS = `## Tests

\`\`\`bash
pnpm test          # unit tests (src/**/*.test.ts): no services needed
pnpm test:e2e      # the whole app over HTTP (src/**/*.e2e.test.ts): starts a throwaway Postgres in Docker
\`\`\`

- An end-to-end test calls \`startApp()\` from \`src/testing/e2e.ts\`: the same \`createApp()\` that
  \`main.ts\` starts, on a free port, with its own empty database. GoTrue isn't needed:
  \`createTestAuth()\` from \`@mariachi/testing\` stands in for it, and everything after the token
  check (personal tenants, tenancy, roles) is the real thing.
- \`running.request('/api/me', { as: { userId, tenantId: 'org-1', claims: { org_id: 'org-1' } } })\`
  is a member of an organization; \`tenantId: ''\` is a user in none, who gets a personal tenant.
- \`mariachi generate entity\` writes an end-to-end test for the new routes. Extend it when you change them.

`;

const AGENTS_AUTH = (e2e: boolean) => `# Agent guide

This is a Mariachi backend. Before writing code, read the framework docs shipped with
\`@mariachi/core\`:

- \`node_modules/@mariachi/core/docs/README.md\` (start here: layers, conventions, package catalog)
- \`node_modules/@mariachi/core/docs/recipes/\` (step-by-step: entity, job, webhook, integration)
- \`node_modules/@mariachi/core/docs/auth-and-providers.md\` (how identity reaches \`ctx\`, personal tenants)

\`pnpm mariachi docs\` lists them all. \`pnpm mariachi docs <name>#<section>\` prints one section
(\`pnpm mariachi docs jobs#schedules\`), which is the cheapest way to read, and
\`pnpm mariachi docs --search <words>\` finds the lines you need and says which section each is in.

## Layout

| Path | Layer |
| --- | --- |
| \`src/app.ts\` | Composition root: \`createApp()\` builds config, lifecycle, database, jobs, communication, sign-in and tenancy, and the HTTP server |
| \`src/main.ts\` | The entry point: starts what \`createApp()\` built |
${e2e ? '| \`src/testing/\` | Support for end-to-end tests: \`startApp()\` and the containers they share |\n' : ''}| \`src/config.ts\`, \`src/auth.ts\` | This app's settings (\`AUTH_*\`, \`MIGRATE_ON_START\`) and where it finds GoTrue |
| \`src/contracts/\` | Zod schemas + procedure types shared by controllers and handlers |
| \`src/api/controllers/\` | HTTP controllers (\`BaseController\`); call procedures, never services |
| \`src/api/pages/\` | The example sign-in page |
| \`src/services/<name>/\` | Service, repository and communication handlers for one domain |
| \`src/schema/\` | \`defineTable\` tables; \`mariachi db generate\` turns them into migrations |
| \`src/jobs/\` | \`defineJob\` background jobs |
| \`src/search/\` | The search indexes; services reach search as \`deps.search\` |
| \`src/events/\` | \`defineEvent\` events and their subscribers; services publish through \`deps.outbox\` or \`deps.events\` |
| \`src/webhooks/\` | Webhook controllers, served on \`WEBHOOK_PORT\`: signature checked, deduplicated, handed to a job |

Postgres is the only service the app itself needs: jobs and search run in it
(\`@mariachi/jobs/postgres\`, \`@mariachi/search/postgres\`). Don't add Redis or a search server to
make either work. \`pnpm dev\` starts Postgres, applies migrations and runs the app with reload.

${e2e ? AGENTS_AUTH_TESTS : ''}## Sign-in, tenants and roles

- Users sign in with GoTrue (Supabase Auth, hosted or your own); \`@mariachi/auth-gotrue\` verifies
  its tokens. Never store passwords here or add a second way to sign in beside it.
- \`ctx.tenantId\` is the organization the token names (the \`AUTH_ORG_CLAIM\` claim, \`org_id\` by
  default), or the user's personal tenant (\`user.app.<userId>\`) when it names none.
  \`isPersonalTenant(ctx.tenantId)\` from \`@mariachi/core\` tells them apart. Tenant-scoped tables and
  repositories rely on it. Never take the tenant from the request body.
- \`ctx.identity.roles\` holds GoTrue's role (\`authenticated\`) and the role in the organization
  (\`AUTH_ORG_ROLE_CLAIM\`), if any. Route \`scopes\` need every listed one; for "owner or admin" check
  the roles in the handler (see \`GET /api/me/admin\`). Every other claim is in \`ctx.identity.claims\`.
- Put the organization claim in the token on GoTrue's side, with a custom access-token hook that
  only your server controls. A claim copied from user-editable metadata would let a user name any tenant.

## Generators

\`\`\`bash
pnpm mariachi generate entity <name> [--field title:string --field done:boolean]   # schema + repository + service + handler + controller + test
pnpm mariachi generate service <name>
pnpm mariachi generate controller <name>
pnpm mariachi generate job <name>
pnpm mariachi generate integration <name>
pnpm mariachi generate procedure <service> <name>   # one more procedure on an existing service
pnpm mariachi generate event <domain.thing.happened> [--subscriber <name>]
pnpm mariachi generate subscriber <domain.thing.happened> <name>
pnpm mariachi generate webhook <name>     # signed endpoint on WEBHOOK_PORT + the job it hands deliveries to
pnpm validate                            # architecture rules; run before committing
pnpm test && pnpm typecheck
\`\`\`
`;

const README = (name: string) => `# ${name}

A Mariachi backend with sign-in by **GoTrue** (Supabase Auth, hosted or your own). The API verifies
GoTrue's tokens (\`@mariachi/auth-gotrue\`) and scopes every request to a tenant: the organization the
token names, or the user's own personal tenant when it names none.

## Run

\`\`\`bash
pnpm install
cp .env.example .env    # then set AUTH_URL, e.g. https://<project>.supabase.co${AUTH_PATH}
pnpm dev
\`\`\`

\`pnpm dev\` (\`mariachi dev\`) starts Postgres with Docker Compose, writes and applies the first
migration, and runs the app, reloading on changes. Postgres is the only service the app itself
needs: jobs and search run in it (\`pnpm add bullmq\` and set \`REDIS_URL\` to run jobs on Redis instead).

The API listens on \`PORT\` (default 3000) under \`/api\`. Health checks: \`/api/health/live\`,
\`/api/health/ready\`, \`/api/health/startup\`. OpenAPI: \`/api/openapi.json\`.

GoTrue isn't in \`docker-compose.yml\`: point \`AUTH_URL\` at a Supabase project, or at a GoTrue you
run. It must sign tokens with an asymmetric key (ES256 by default) and publish its JWKS; a GoTrue
that still signs with a shared secret is refused.

## Sign-in

\`/api/sign-in\` is an example page (\`src/api/pages/sign-in.ts\`): password sign-in, sign-up and a magic
link against GoTrue with plain \`fetch\`, then \`GET /api/me\` with the access token as a bearer token.
The browser reaches GoTrue at \`AUTH_URL\` (with \`AUTH_ANON_KEY\` as the \`apikey\` header, which hosted
Supabase wants), or at \`${AUTH_PATH}\` on this app's own origin when no public URL is set and a proxy
serves it there. The same with supabase-js:

\`\`\`ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://<project>.supabase.co', '<publishable key>', { auth: { flowType: 'pkce' } });
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: \`\${window.location.origin}/api/sign-in\` } });
const { data } = await supabase.auth.getSession();
await fetch('/api/me', { headers: { authorization: \`Bearer \${data.session?.access_token}\` } });
\`\`\`

This page is an example to start from, not a finished sign-in. Before you ship one, know what it does:

- **It keeps the session in \`sessionStorage\`**, so any script running on this origin can read the
  refresh token. Keep GoTrue's refresh-token rotation on (its default), and in production keep the
  refresh token on the server (a session cookie the API sets) with only short-lived access tokens
  in the browser.
- **Emailed links use PKCE.** The page keeps a random verifier in \`localStorage\` and sends GoTrue its
  SHA-256 challenge; the link comes back with a one-time code in the query, and only the verifier
  turns it into a session. So a link works once, and only in the browser that asked for it (opened
  on another device, or after an hour, it says so and offers a new one). With supabase-js, pass
  \`{ auth: { flowType: 'pkce' } }\` to \`createClient\`. Asking for a second link replaces the first one's verifier.
  PKCE needs \`crypto.subtle\`, which browsers offer on https and on localhost only.
- **A session in the address bar is refused unless you turn it on.** Links an admin makes (an invite,
  GoTrue's \`/admin/generate_link\`, an impersonation link) can't use PKCE, because no browser asked
  for them: GoTrue puts the session itself in the link's hash. A stranger's link would sign a
  visitor in as the stranger the same way, so the page ignores such a session by default. Set
  \`AUTH_LINK_SESSIONS=true\` if you send invites or admin links to this page. It then asks GoTrue
  whose session it is, shows that account and takes the session only when the user clicks
  Continue, and never while someone is already signed in.
- **GoTrue only redirects to addresses on its allow list** (\`GOTRUE_URI_ALLOW_LIST\`; "Redirect URLs"
  in Supabase). Add this app's \`/api/sign-in\` there, for each host you run it on, or the links in
  its emails are refused.
- **Sign-out ends every session of the user**, GoTrue's default scope. Call \`/logout?scope=local\`
  to end only this one.
- If a proxy serves GoTrue under this app's origin, route the whole prefix (\`${AUTH_PATH}/...\`) to it.

## Tenants and roles

- \`ctx.tenantId\` is the organization the token names, read from the \`AUTH_ORG_CLAIM\` claim (\`org_id\`
  by default). GoTrue doesn't add one by itself: put it there with a custom access-token hook that
  only your server controls, together with the user's role in it (\`AUTH_ORG_ROLE_CLAIM\`, \`org_role\`).
- A user whose token names no organization gets a personal tenant, \`user.app.<userId>\`, so the app
  works for individuals without any hook. \`GET /api/me\` reports \`personal: true\` for them. In an
  app where everyone must belong to an organization (most B2B apps), set
  \`AUTH_PERSONAL_TENANTS=false\`: such users are then refused (\`tenancy/missing-tenant\`).
- A request naming another tenant than the token's gets \`tenancy/mismatch\`.
- \`ctx.identity.roles\` is \`authenticated\` plus the role in the organization. \`GET /api/me/admin\`
  admits owners and admins, and a user in their own personal tenant (route \`scopes\` need every
  listed one, so an any-of check goes in the handler).

## Settings

| Variable | Default | |
| --- | --- | --- |
| \`AUTH_URL\` | | GoTrue's public base URL, path included: the tokens' issuer |
| \`AUTH_ORIGIN\`, \`APP_ORIGIN\` | | Or the origin it's served under; \`AUTH_PATH\` is appended |
| \`AUTH_PATH\` | \`${AUTH_PATH}\` | |
| \`AUTH_JWKS_URL\` | \`<AUTH_URL>/.well-known/jwks.json\` | Where to read the signing keys |
| \`AUTH_INTERNAL_URL\` | \`http://127.0.0.1:9999\` | GoTrue on a private address, used when none of the above is set; the issuer then comes from its discovery document |
| \`AUTH_ANON_KEY\` | | Hosted Supabase's publishable key, sent by the sign-in page. Not a secret |
| \`AUTH_ORG_CLAIM\`, \`AUTH_ORG_ROLE_CLAIM\` | \`org_id\`, \`org_role\` | The claims holding the organization and the role in it |
| \`AUTH_PERSONAL_TENANTS\` | \`true\` | Give a user in no organization a personal tenant |
| \`AUTH_LINK_SESSIONS\` | \`false\` | Let the sign-in page take a session from an admin-made link (invites, \`generate_link\`), after showing whose it is |
| \`MIGRATE_ON_START\` | \`false\` | Apply \`drizzle/\` migrations at start |
`;
