# Testing

Unit tests use `@mariachi/testing`: in-memory doubles, factories and a harness. End-to-end tests
start a generated app and call it over HTTP. The framework's own integration tests run against real
Postgres, Redis, Typesense and S3 (MinIO) through Testcontainers. The doubles are
only useful if they behave like the real adapters, so shared contract suites check both.

## Unit tests

```ts
import { createTestHarness, TestEmailAdapter } from '@mariachi/testing';

const harness = createTestHarness();                  // test logger, tracer and metrics in a fresh DI container
const ctx = harness.ctx({ tenantId: 't1', userId: 'u1' });
const email = new TestEmailAdapter();
const notifications = new DefaultNotifications({ email }, harness.deps);

await notifications.notify(ctx, intent);
expect(email.getSentEmails()[0]?.subject).toBe('Invoice 42 is ready');
```

| Double | Stands in for | Notes |
| --- | --- | --- |
| `TestCacheClient` | `CacheClient` (Redis) | The memory cache: TTLs, atomic `incr`, prefix-scoped `keys` and `flush`. |
| `TestLock` | `DistributedLock` | Tokens, expiry, owned locks. |
| `TestStorageClient` | `StorageClient` | The memory adapter's key validation; URLs on `test.example.com`. |
| `TestSearchClient` | `SearchClient` | The memory search adapter. |
| `TestInAppStore` | `InAppNotificationStore` | The memory inbox. |
| `TestEmailAdapter`, `TestSMSAdapter`, `TestPushAdapter` | notification channels | Record what was sent. |
| `TestJobQueue` | The whole job backend (`new DefaultJobs({ queue })`) | `drain()` runs queued jobs through their registered handlers. Schedules are recorded (`getSchedules()`) and never fire on a clock; `runSchedule(name)` enqueues one as its cron tick would. |
| `TestRepository` | `Repository` (Postgres) | With `{ tenantColumn: 'tenantId' }` it is tenant-scoped like the real one: an operation without `ctx.tenantId` throws `database/tenant-required`, a row for another tenant is `database/tenant-mismatch`, `crossTenant()` is the only way across. Every filter operator works as in SQL; an unknown one throws. |
| `TestEventBus`, `TestAISession`, `TestTracer`, `TestMetrics` | events, AI, observability | Record calls for assertions. |

Types come from the real packages, so a double that drifts from its interface fails to compile.

## End-to-end tests

A generated project tests itself over HTTP. `pnpm test:e2e` starts one throwaway Postgres in
Docker, and each test file starts the whole app against its own empty database, which holds its job
queue and search too:

```ts
import { afterAll, beforeAll, expect, it } from 'vitest';
import { startApp, type RunningApp } from '../../testing/e2e';

const ada = { userId: 'user-ada', tenantId: 'tenant-a' };
const lin = { userId: 'user-lin', tenantId: 'tenant-b' };

let running: RunningApp;
beforeAll(async () => {
  running = await startApp();
});
afterAll(() => running?.stop());

it("keeps one tenant's notes from another", async () => {
  const created = await running.request('/api/notes', { as: ada, json: { name: 'Private' } });
  const { id } = (await created.json()) as { id: string };
  expect((await running.request(`/api/notes/${id}`, { as: lin })).status).toBe(404);
});
```

The pieces, all in the generated project so you can change them:

| File | What it does |
| --- | --- |
| `src/app.ts` | `createApp(options)` builds the app and returns it with `start()` (resolves to the address) and `stop()`. `main.ts` starts it; so do the tests. Options: `bootstrap` (config and environment), `verifier` (who checks tokens), `migrateOnStart`, and `configureApi` (add auth strategies, middleware or rate limits without editing the file), and `searchIndexes` (the indexes to keep, in place of the app's own) |
| `src/testing/global-setup.ts` | Starts Postgres once per run with `startPostgres()` from `@mariachi/testing` |
| `src/testing/e2e.ts` | `startApp({ env?, migrateOnStart?, configureApi? })`: creates a database, calls `createApp()` with a test environment and `createTestAuth()`, creates the tables in `src/schema` with `applySchema`, and listens on a free port. Returns `request(path, { as, json, method, headers })`, `auth`, `app` and `stop()` |
| `vitest.e2e.config.ts` | Runs `src/**/*.e2e.test.ts`; `pnpm test` leaves them out |

`createTestAuth()` stands in for the identity provider: `auth.tokenFor({ userId, tenantId, scopes, roles, claims })`
gives a token its `verifier` accepts, `auth.headersFor(identity)` the `Authorization` header, and
`auth.revoke(token)` makes one stop working. Everything after the verifier (tenancy, scopes, rate
limits, validation, the database) is the real thing.

With an identity provider, test the mapping from its token to an identity as well. Give
`createTestAuth` the provider's own mapping and write each user as the claims their token carries:

```ts
const auth = createTestAuth<GoTrueJwtPayload>({ fromClaims: (claims) => provider.toIdentity(claims) });
auth.headersForClaims({ sub: userId, role: 'authenticated', org_id: orgId, org_role: 'owner' });
```

The `--auth gotrue` project's harness does this: `request('/api/me', { claims: { ... } })`, and
`{ as: { userId, tenantId } }` writes the claims for you. A wrong claim name or a role that isn't
where the app looks then fails a test instead of a sign-in.

In a project made with `--orgs`, `{ as: { userId, tenantId: 'acme' } }` is a member of an
organization the test calls `acme`. The harness creates it, and the membership, the first time
they are named (the first user named is its owner), and sends its id in `x-organization-id` as a
client would, so the app's own membership check runs on every test request. `tenantId: ''` is a
user in no organization. Tests written by `mariachi generate entity` work unchanged.

A project made with `mariachi init --no-e2e` has none of this (no Docker needed); add it later by
copying these files from a project generated with it.

For a quick test of routes with no socket, `app.api.inject({ method, url, headers, payload })`
runs a request in memory and returns `{ statusCode, headers, body, json() }`.

`applySchema` creates tables straight from `defineTable`, so a test doesn't need generated
migrations. To test the migrations themselves, run them against the test database with
`runMigrations` in place of `applySchema`.

## Contract suites

Each adapter interface has one suite in `packages/testing/src/contracts/`, run against every
implementation:

| Suite | Unit run (`contracts.test.ts`) | Integration run (`contracts.integration.test.ts`) |
| --- | --- | --- |
| `storageContract` | memory, local disk, `TestStorageClient` | S3 on MinIO |
| `searchContract` | memory, `TestSearchClient` | Typesense |
| `inboxContract` | memory, `TestInAppStore` | Postgres (`DrizzleNotificationStore`) |
| `cacheContract` | memory, `TestCacheClient` | Redis |
| `lockContract` | `TestLock` | Redis |
| `repositoryContract` | `TestRepository` | Postgres (`DrizzleRepository`) |

When you change an adapter's behavior, change the suite first; whichever side you didn't update
then fails. When you add an adapter, add a line that runs the suite against it.

## Integration tests

This section is about the framework's own repository. An app tests against real services with the
[end-to-end tests](#end-to-end-tests) above; `startPostgres()`, `startRedis()` and
`stopContainers()` from `@mariachi/testing` are the same idea as a package (`testcontainers` is an
optional peer: `pnpm add -D testcontainers`).

Files named `*.integration.test.ts` run with `pnpm test:integration` (one package at a time).
In this repository `test/setup.ts` starts what a test needs:

```ts
// inside mariachi-ai/ts only: this file isn't published
import { startPostgres, startRedis, startTypesense, startMinio, stopAll } from '../../../test/setup';

beforeAll(async () => {
  database = createPostgresDatabase({ url: await startPostgres() });
  await database.connect();
  await applySchema(database.db, [auditLogsTable]);
}, 180_000);
afterAll(() => stopAll());
```

Each helper uses `DATABASE_URL`, `REDIS_URL`, `TYPESENSE_URL` or `S3_ENDPOINT` when set (CI service
containers, `docker compose -f docker-compose.dev.yml up`) and otherwise starts a throwaway
container. MinIO has no CI service (it needs a command argument), so it always runs through
Testcontainers there. CI shares one database across packages, so tests should use unique ids or
keys (`crypto.randomUUID()`) instead of assuming empty tables.

The domain packages that talk to infrastructure all have one: billing, notifications, ai, audit
and auth (Postgres), config feature flags (Postgres), rate-limit (Redis and Postgres, one contract), search (Typesense) and
storage (MinIO).
