import type { ProjectAuth } from '../types';

/** What a generated project needs to test itself over HTTP: the vitest config, the containers and the harness. */
export const VITEST_E2E_CONFIG = `import { defineConfig } from 'vitest/config';

// End-to-end tests: the whole app over HTTP against a throwaway Postgres and Redis (needs Docker).
export default defineConfig({
  test: {
    include: ['src/**/*.e2e.test.ts'],
    globalSetup: ['./src/testing/global-setup.ts'],
    testTimeout: 30_000,
    hookTimeout: 180_000,
  },
});
`;

export const E2E_GLOBAL_SETUP = `import type { TestProject } from 'vitest/node';
import { startPostgres, startRedis, stopContainers } from '@mariachi/testing';

/**
 * Runs once before the end-to-end tests: one throwaway Postgres and one Redis, in Docker, for all
 * of them. Each test file then makes its own database in that Postgres (see ./e2e).
 */
export default async function setup(project: TestProject): Promise<() => Promise<void>> {
  const [postgresUrl, redisUrl] = await Promise.all([startPostgres(), startRedis()]);
  project.provide('postgresUrl', postgresUrl);
  project.provide('redisUrl', redisUrl);
  return stopContainers;
}
`;

export const E2E_HARNESS_FILE = 'src/testing/e2e.ts';

/**
 * The end-to-end harness. With `gotrue`, a request's identity is written as the claims GoTrue's token
 * carries and read back through the provider's own mapping, so the tests cover that mapping too.
 */
export function e2eHarness(kind: ProjectAuth): string {
  const gotrue = kind === 'gotrue';
  return `import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { inject } from 'vitest';
${gotrue ? "import { useConfigSection } from '@mariachi/config';\n" : ''}import { applySchema, createPostgresDatabase } from '@mariachi/database-postgres';
${gotrue ? "import { createGoTrueAuth, type GoTrueAuthProvider, type GoTrueJwtPayload } from '@mariachi/auth-gotrue';\n" : ''}import { createTestAuth, type TestAuth, type TestIdentity } from '@mariachi/testing';
import { createApp, type App, type AppOptions } from '../app';
${gotrue ? "import { goTrueConfig } from '../auth';\nimport { APP_CONFIG, type AppSettings } from '../config';\n" : ''}import * as schema from '../schema/index';

declare module 'vitest' {
  export interface ProvidedContext {
    postgresUrl: string;
    redisUrl: string;
  }
}

export interface RequestOptions {
  method?: string;
  /** Who is asking. Left out, the request carries no token. */
  as?: TestIdentity;
${gotrue ? "  /** Who is asking, as the claims of their GoTrue token (sub, role, the organization claims a hook adds). */\n  claims?: GoTrueJwtPayload;\n" : ''}  /** Sent as the JSON body (and makes the request a POST unless \`method\` says otherwise). */
  json?: unknown;
  headers?: Record<string, string>;
}

export interface StartOptions extends Omit<AppOptions, 'bootstrap' | 'verifier'> {
  /** Anything else the app reads from its environment, over the test defaults. */
  env?: Record<string, string>;
}

export interface RunningApp {
  app: App;
  /** Where it listens: http://127.0.0.1:<port> */
  url: string;
  auth: TestAuth${gotrue ? '<GoTrueJwtPayload>' : ''};
  /** A real HTTP request to the app. \`path\` starts with /api. */
  request(path: string, options?: RequestOptions): Promise<Response>;
  stop(): Promise<void>;
}

/**
 * Starts the whole app for a test file: the same createApp() that main.ts starts, on a free port,
 * with its own empty database (the tables in src/schema, created directly) and its own job queue.
${gotrue
  ? " * No GoTrue is needed: a request's claims are read by the provider's own mapping, then by personal\n * tenants, tenancy and roles, as a real token's are. \`request(path, { claims: { sub, role, org_id } })\`\n * is a signed-in request; \`{ as: { userId, tenantId } }\` writes the claims for you.\n"
  : " * Sign-in is createTestAuth(): \`request(path, { as: { userId, tenantId } })\` is a signed-in request.\n"} * \`options\` are createApp()'s own (migrateOnStart, configureApi), plus \`env\`.
 */
export async function startApp(options: StartOptions = {}): Promise<RunningApp> {
  const { env, ...appOptions } = options;
  const name = \`e2e_\${randomUUID().replaceAll('-', '')}\`;
  const server = createPostgresDatabase({ url: inject('postgresUrl') });
  await server.connect();
  await server.db.execute(sql.raw(\`create database \${name}\`));
  await server.disconnect();
  const databaseUrl = new URL(inject('postgresUrl'));
  databaseUrl.pathname = \`/\${name}\`;

${gotrue
  ? "  // Built on first use: the app's settings are loaded by createApp() below\n  let provider: GoTrueAuthProvider | undefined;\n  const settings = () => useConfigSection<AppSettings>(APP_CONFIG).auth;\n  const auth = createTestAuth<GoTrueJwtPayload>({\n    fromClaims: (claims) => {\n      provider ??= createGoTrueAuth(goTrueConfig(settings()));\n      return provider.toIdentity(claims);\n    },\n  });\n  // A user as GoTrue's token describes them: the subject, GoTrue's own role, and the organization claim when they're in one\n  const claimsFor = (identity: TestIdentity): GoTrueJwtPayload => ({\n    sub: identity.userId,\n    role: 'authenticated',\n    ...(identity.tenantId ? { [settings().orgClaim]: identity.tenantId } : {}),\n    ...identity.claims,\n  });\n"
  : '  const auth = createTestAuth();\n'}  const app = await createApp({
    ...appOptions,
    verifier: auth.verifier,
    bootstrap: {
      installSignalHandlers: false,
      captureProcessErrors: false,
      configOptions: {
        dotenv: false,
        env: {
          NODE_ENV: 'test',
          // Also the job queue's prefix, so files sharing the Redis don't see each other's jobs
          SERVICE_NAME: name,
          PORT: '0',
          HOST: '127.0.0.1',
          LOG_LEVEL: 'error',
          DATABASE_URL: databaseUrl.href,
          REDIS_URL: inject('redisUrl'),
          ...env,
        },
      },
    },
  });
  await applySchema(app.database.db, schema);
  const url = await app.start();

  return {
    app,
    url,
    auth,
    request: (path, request = {}) =>
      fetch(url + path, {
        method: request.method ?? (request.json === undefined ? 'GET' : 'POST'),
        headers: {
          ...(request.json === undefined ? {} : { 'content-type': 'application/json' }),
${gotrue
  ? '          ...(request.claims ? auth.headersForClaims(request.claims) : request.as ? auth.headersForClaims(claimsFor(request.as)) : {}),\n'
  : '          ...(request.as ? auth.headersFor(request.as) : {}),\n'}          ...request.headers,
        },
        body: request.json === undefined ? undefined : JSON.stringify(request.json),
      }),
    stop: () => app.stop(),
  };
}
`;
}
