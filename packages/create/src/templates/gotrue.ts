import { LAYOUT, MARKERS } from '../layout';
import { databaseName } from '../names';

/**
 * `mariachi init --auth gotrue`: sign-in by GoTrue (Supabase Auth, hosted or your own), verified
 * with `@mariachi/auth-gotrue`. The tenant is the organization claim in the token through
 * `@mariachi/tenancy`, or the user's personal tenant when the token names none. These files
 * replace or extend the default project's.
 */

/** GoTrue's path when it's served under the app's own origin; hosted Supabase uses the same path. */
export const AUTH_PATH = '/auth/v1';

export function gotrueFiles(name: string): Record<string, string> {
  return {
    '.env.example': ENV_EXAMPLE(name, databaseName(name)),
    'README.md': README(name),
    'AGENTS.md': AGENTS_AUTH,
    'src/config.ts': CONFIG_TS,
    'src/auth.ts': AUTH_TS,
    'src/auth.test.ts': AUTH_TEST,
    [LAYOUT.main]: MAIN_TS,
    [LAYOUT.controllersIndex]: CONTROLLERS_INDEX,
    [`${LAYOUT.controllersDir}/me.controller.ts`]: ME_CONTROLLER,
    [`${LAYOUT.controllersDir}/me.controller.test.ts`]: ME_CONTROLLER_TEST,
    [`${LAYOUT.controllersDir}/sign-in.controller.ts`]: SIGN_IN_CONTROLLER,
    [`${LAYOUT.controllersDir}/sign-in.controller.test.ts`]: SIGN_IN_CONTROLLER_TEST,
    'src/api/pages/sign-in.ts': SIGN_IN_PAGE,
  };
}

const ENV_EXAMPLE = (name: string, db: string) => `SERVICE_NAME=${name}
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/${db}
REDIS_URL=redis://localhost:6379
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
`;

const CONFIG_TS = `import { registerConfigSection } from '@mariachi/config';
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
    })
    .default({}),
  /** Apply the committed migrations (\`drizzle/\`) at start (\`MIGRATE_ON_START\`). */
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
    },
    migrateOnStart: flag(read('MIGRATE_ON_START')),
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

const AUTH_TEST = `import { describe, expect, it } from 'vitest';
import { browserAuthUrl, goTrueConfig } from './auth';

const defaults = { path: '${AUTH_PATH}', internalUrl: 'http://127.0.0.1:9999', orgClaim: 'org_id', orgRoleClaim: 'org_role', personalTenants: true };
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

const MAIN_TS = `import { existsSync } from 'node:fs';
import { ConfigError, KEYS } from '@mariachi/core';
import { useConfigSection } from '@mariachi/config';
import { bootstrap } from '@mariachi/lifecycle';
import { createCommunication } from '@mariachi/communication';
import { createPostgresDatabase, runMigrations } from '@mariachi/database-postgres';
import { createJobQueue, DefaultJobs } from '@mariachi/jobs';
import { withPersonalTenants } from '@mariachi/auth';
import { createGoTrueAuth } from '@mariachi/auth-gotrue';
import { createTenancy, createTenancyMiddleware } from '@mariachi/tenancy';
import { bearerStrategy, createApiServer } from '@mariachi/api-facade';
import { APP_CONFIG, type AppSettings } from './config';
import { goTrueConfig } from './auth';
import { createControllers } from './api/controllers/index';
import { registerServices } from './services/index';
import { jobs as jobDefinitions } from './jobs/index';

const MIGRATIONS = 'drizzle';

async function main(): Promise<void> {
  const { config, logger, tracer, metrics, container, lifecycle } = bootstrap();
  const instrumentation = { logger, tracer, metrics };
  const app = useConfigSection<AppSettings>(APP_CONFIG);

  if (!config.database) throw new ConfigError('app/database-required', 'DATABASE_URL is required');
  if (!config.redis) throw new ConfigError('app/redis-required', 'REDIS_URL is required');

  // Startup runs in ascending priority; shutdown runs in reverse.
  const database = lifecycle.manage(
    'database',
    createPostgresDatabase({ url: config.database.url, poolMin: config.database.poolMin, poolMax: config.database.poolMax }),
    { priority: 10 },
  );
  container.register(KEYS.Database, database);
  if (app.migrateOnStart) {
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

  const jobs = new DefaultJobs(
    { queue: createJobQueue({ adapter: 'bullmq', redisUrl: config.redis.url, prefix: config.serviceName }, logger) },
    instrumentation,
  );
  for (const job of jobDefinitions) jobs.registerJob(job);
  lifecycle.manage('jobs', jobs, { priority: 20 });
  lifecycle.startup.register({ name: 'jobs-worker', priority: 90, fn: () => jobs.start() });
  container.register(KEYS.JobQueue, jobs);

  // One communication layer per process: handlers register on it, controllers call through it.
  const communication = createCommunication({}, instrumentation);
  container.register(KEYS.Communication, communication);
  // Repositories take the Drizzle client when they're built, so connect first (the startup connect is then a no-op).
  await database.connect();
  registerServices(communication, { db: database.db, jobs });

  // Sign-in is GoTrue's: its ES256 tokens are checked against its JWKS, issuer and audience.
  const provider = createGoTrueAuth(goTrueConfig(app.auth));
  // The tenant is the organization the token names (AUTH_ORG_CLAIM). A user in no organization gets a
  // personal tenant, user.app.<id>, so the app also works for individuals (AUTH_PERSONAL_TENANTS).
  const auth = app.auth.personalTenants ? withPersonalTenants(provider, { namespace: 'app' }) : provider;
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
    .withAuthStrategy('session', bearerStrategy(auth))
    .withAuth('session')
    .withMiddleware(createTenancyMiddleware(tenancy))
    .withHealth(lifecycle.health)
    .withOpenApi({ info: { title: config.serviceName, version: '0.1.0' } });
  for (const controller of createControllers(communication)) api.registerController(controller);

  lifecycle.startup.register({
    name: 'api',
    priority: 100,
    fn: async () => {
      const address = await api.listen(config.server.port, config.server.host);
      logger.info({ address }, 'API listening');
    },
  });
  lifecycle.shutdown.register({ name: 'api', priority: 100, fn: () => api.close() });

  await lifecycle.start();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
`;

const CONTROLLERS_INDEX = `import type { BaseController } from '@mariachi/api-facade';
import type { CommunicationLayer } from '@mariachi/communication';
import { MeController } from './me.controller';
import { SignInController } from './sign-in.controller';
// ${MARKERS.imports}

export function createControllers(communication: CommunicationLayer): BaseController[] {
  return [
    new MeController(communication),
    new SignInController(communication),
    // ${MARKERS.controllers}
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
        'cache-control': 'no-store',
      });
    });
    this.get('/client.js', { auth: false, summary: "The sign-in page's script" }, async () => {
      const { auth } = useConfigSection<AppSettings>(APP_CONFIG);
      return httpResponse(200, signInScript({ authUrl: browserAuthUrl(auth), anonKey: auth.anonKey }), {
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
 * and sign-out. The session is kept in sessionStorage and sent to the API as a bearer token.
 * supabase-js does the same (see README.md).
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
<p id="status" role="status"></p>
<pre id="output"></pre>
<script type="module" src="/api/sign-in/client.js"></script>
</body>
</html>
\`;

/** The page's script, after the two settings \`signInScript\` puts in front of it (\`AUTH\`, \`ANON_KEY\`). */
export const SIGN_IN_JS = \`const KEY = 'session';
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
  byId('signed-out').hidden = Boolean(session);
  byId('signed-in').hidden = !session;
  if (!session) return;
  const res = await fetch('/api/me', { headers: { authorization: 'Bearer ' + session.accessToken } });
  const body = await res.json().catch(() => ({}));
  if (res.ok) show('Signed in.', body);
  else if (body.error && body.error.code === 'tenancy/missing-tenant') {
    show('Signed in, but in no organization, and this API is set to need one (AUTH_PERSONAL_TENANTS=false).', body);
  } else show('GET /api/me answered ' + res.status, body);
}

// After a magic or confirmation link, GoTrue redirects here with the session (or an error) in the hash.
function fromRedirect() {
  if (!location.hash) return;
  const params = new URLSearchParams(location.hash.slice(1));
  history.replaceState(null, '', location.pathname);
  if (params.get('access_token')) {
    save({ access_token: params.get('access_token'), refresh_token: params.get('refresh_token'), expires_at: params.get('expires_at'), expires_in: params.get('expires_in') });
  } else if (params.get('error_description')) show(params.get('error_description'));
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
    const result = await gotrue('/signup?redirect_to=' + encodeURIComponent(here()), credentials());
    if (result.access_token) {
      save(result);
      await render();
    } else show('Check your email for the confirmation link.');
  } catch (error) {
    show('Sign-up failed: ' + error.message);
  }
});

byId('magic-link').addEventListener('click', async () => {
  try {
    await gotrue('/otp?redirect_to=' + encodeURIComponent(here()), { email: credentials().email, create_user: true });
    show('Check your email for the sign-in link.');
  } catch (error) {
    show('Could not send the link: ' + error.message);
  }
});

byId('sign-out').addEventListener('click', async () => {
  const session = load();
  sessionStorage.removeItem(KEY);
  if (session) await gotrue('/logout', {}, session.accessToken).catch(() => undefined);
  show('Signed out.');
  await render();
});

fromRedirect();
render();
\`;

/** The script as served: where the browser reaches GoTrue, and the key hosted Supabase wants, written in as JSON. */
export function signInScript(options: { authUrl: string; anonKey?: string }): string {
  return \`const AUTH = \${JSON.stringify(options.authUrl)};\\nconst ANON_KEY = \${JSON.stringify(options.anonKey ?? null)};\\n\${SIGN_IN_JS}\`;
}
`;

const AGENTS_AUTH = `# Agent guide

This is a Mariachi backend. Before writing code, read the framework docs shipped with
\`@mariachi/core\`:

- \`node_modules/@mariachi/core/docs/README.md\` (start here: layers, conventions, package catalog)
- \`node_modules/@mariachi/core/docs/recipes/\` (step-by-step: entity, job, webhook, integration)
- \`node_modules/@mariachi/core/docs/auth-and-providers.md\` (how identity reaches \`ctx\`, personal tenants)

## Layout

| Path | Layer |
| --- | --- |
| \`src/main.ts\` | Composition root: config, lifecycle, database, jobs, communication, sign-in and tenancy, HTTP server |
| \`src/config.ts\`, \`src/auth.ts\` | This app's settings (\`AUTH_*\`, \`MIGRATE_ON_START\`) and where it finds GoTrue |
| \`src/contracts/\` | Zod schemas + procedure types shared by controllers and handlers |
| \`src/api/controllers/\` | HTTP controllers (\`BaseController\`); call procedures, never services |
| \`src/api/pages/\` | The example sign-in page |
| \`src/services/<name>/\` | Service, repository and communication handlers for one domain |
| \`src/schema/\` | \`defineTable\` tables; \`mariachi db generate\` turns them into migrations |
| \`src/jobs/\` | \`defineJob\` background jobs |

## Sign-in, tenants and roles

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
pnpm mariachi generate entity <name>      # schema + repository + service + handler + controller + test
pnpm mariachi generate service <name>
pnpm mariachi generate controller <name>
pnpm mariachi generate job <name>
pnpm mariachi generate integration <name>
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
cp .env.example .env    # then set AUTH_URL, e.g. https://<project>.supabase.co${AUTH_PATH}
docker compose up -d    # Postgres and Redis
pnpm install
pnpm db:generate && pnpm db:migrate
pnpm dev
\`\`\`

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

const supabase = createClient('https://<project>.supabase.co', '<publishable key>');
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: \`\${window.location.origin}/api/sign-in\` } });
const { data } = await supabase.auth.getSession();
await fetch('/api/me', { headers: { authorization: \`Bearer \${data.session?.access_token}\` } });
\`\`\`

## Tenants and roles

- \`ctx.tenantId\` is the organization the token names, read from the \`AUTH_ORG_CLAIM\` claim (\`org_id\`
  by default). GoTrue doesn't add one by itself: put it there with a custom access-token hook that
  only your server controls, together with the user's role in it (\`AUTH_ORG_ROLE_CLAIM\`, \`org_role\`).
- A user whose token names no organization gets a personal tenant, \`user.app.<userId>\`, so the app
  works for individuals without any hook. \`GET /api/me\` reports \`personal: true\` for them. Set
  \`AUTH_PERSONAL_TENANTS=false\` to refuse such users instead (\`tenancy/missing-tenant\`).
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
| \`MIGRATE_ON_START\` | \`false\` | Apply \`drizzle/\` migrations at start |
`;
