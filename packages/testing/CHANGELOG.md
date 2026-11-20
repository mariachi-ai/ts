# @mariachi/testing

## 0.2.0

### Patch Changes

- Updated dependencies [fb0b344]
- Updated dependencies [1613fb7]
  - @mariachi/core@0.2.0
  - @mariachi/cache@0.2.0
  - @mariachi/events@0.2.0
  - @mariachi/jobs@0.2.0
  - @mariachi/search@0.2.0
  - @mariachi/storage@0.2.0
  - @mariachi/notifications@0.2.0
  - @mariachi/ai@0.2.0
  - @mariachi/database@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [a31310b]
- Updated dependencies [df09ec1]
- Updated dependencies [f04e223]
- Updated dependencies [a76affd]
- Updated dependencies [0964659]
- Updated dependencies [8486aa5]
- Updated dependencies [867c6ca]
- Updated dependencies [df6d8df]
  - @mariachi/ai@0.1.1
  - @mariachi/jobs@0.1.1
  - @mariachi/search@0.1.1
  - @mariachi/core@0.1.1
  - @mariachi/storage@0.1.1
  - @mariachi/cache@0.1.1
  - @mariachi/database@0.1.1
  - @mariachi/events@0.1.1
  - @mariachi/notifications@0.1.1

## 0.1.0

### Minor Changes

- b149375: A generated project can test itself end to end. Its wiring moves from `src/main.ts` into
  `src/app.ts`, which exports `createApp(options)` and returns the app with `start()` and `stop()`;
  `main.ts` now only starts it. `pnpm test:e2e` runs `src/**/*.e2e.test.ts`: one throwaway Postgres and
  Redis in Docker for the run, and for each test file the whole app on a free port with its own empty
  database (`startApp()` in `src/testing/e2e.ts`). Requests are real HTTP, signed in with
  `request(path, { as: { userId, tenantId } })`. The project ships a first test (`src/app.e2e.test.ts`),
  and `mariachi generate entity` writes one for the new routes: create, read, list, update, delete,
  another tenant, no token, a bad body. `--auth gotrue` projects test `/api/me` for a member, an owner
  and a personal tenant with no GoTrue running, from claims shaped like a real token's and read by
  the provider's own mapping.

  `createApp` also takes `migrateOnStart` (apply the committed migrations at start) and `configureApi`
  (add auth strategies, middleware or rate limits to the API server), so a project that wraps the
  generated app doesn't have to edit it. `mariachi init --no-e2e` (`createProject({ e2e: false })`)
  leaves the end-to-end support out.

  `@mariachi/testing` gains `createTestAuth()` (tokens for any identity, or for a provider token's
  claims run through the app's own mapping with `fromClaims`, and the verifier that accepts them) and `startPostgres()`, `startRedis()` and `stopContainers()` (`testcontainers` is an optional
  peer). The generated project depends on `@mariachi/testing` and `testcontainers` for development.

  **Changed:** `src/main.ts` in a generated project is now three lines. A tool that edits the generated
  `main.ts` should edit `src/app.ts` instead.

- 662ccc5: Finish the domain packages, verified with integration tests against Postgres, Redis, Typesense and MinIO, and contract suites shared by the real adapters and the test doubles. The Phase 6 packages move from alpha to beta.

  Breaking changes:
  - audit: `AuditQuery.find` and `findByResource` take `ctx` first; `RepositoryAuditQuery` no longer takes a context in its constructor. Reads are scoped to `ctx.tenantId`. The canonical hash form now sorts keys and includes `ipAddress` and `userAgent`, so chains written before this release don't verify.
  - notifications: `InAppNotificationStore.markRead(id, userId)` requires the recipient. `NotificationQueue.enqueue(ctx, name, data, { dedupKey })` matches `DefaultJobs.enqueue`. `DeliveryStore` keeps one row per notification and channel (`get`, `updateByExternalId`). Email template values are HTML-escaped; use `{{{name}}}` for raw HTML.
  - ai: `ai_sessions.id` and `ai_messages.session_id` are text, and `ai_messages` gains `position`. Unknown models cost 0 (with a warning) instead of `gpt-4o-mini` rates, and `costTable` merges over the defaults.
  - search: `SearchField.type` is a closed union (arrays allowed). `default_sorting_field` is only set from `SearchIndex.defaultSortingField`.
  - integrations: `IntegrationRegistry.register` throws when a listed function has no handler, or the integration is already registered.
  - rate-limit: an unknown explicit tier name throws `rate-limit/unknown-tier` instead of falling back to `default`. Fixed-window counters move to a hash (existing counters reset once).
  - core: new HTTP mappings for `rate-limit/backend-failed` (503), `rate-limit/unknown-tier` (500), `auth/unknown-role` (400), `storage/invalid-signature` (403), `search/missing-query-fields` (400), `integrations/invalid-signature` (401) and upstream AI and integration failures (502).

  Added: `DrizzleAuditLog` with a database-backed hash chain, `verifyChain`, retention and export; `DrizzleApiKeyStore`, `DrizzleRoleStore.defineRole` and DB-backed RBAC permissions; `AnthropicAdapter` (`@mariachi/ai/anthropic`) and cross-provider fallback for generate and stream; `ai.costTable`, `ai.fallbackModels` and `ai.anthropicApiKey` config; feature flag writes and tenant overrides; billing plan mirroring (`syncPlans`, `price.*` webhooks); `DefaultRateLimiting.consumeTier` and `resolveTier`; `notificationJobSchema`; `resolveTenantCredential(..., { fallbackToGlobal: false })`; `ctx.request.rawBody` in facade handlers for local signed-URL uploads.

  Fixed: concurrent auth webhook deliveries could both claim an event; API key rotation could leave a tenant without a key; notification retries multiplied between the queue and the service and duplicated deliveries; S3 `putStream` failed for streams of unknown length; Typesense index creation failed with a sort field, alias schemas were lost on restart, and reindexing leaked collections; string search filters weren't quoted; `reset` didn't clear fixed-window limits; token-bucket `retryAfterMs` reported the whole window; prompt versions sorted as strings.

- 662ccc5: Complete the domain packages: billing replay and automatic idempotency keys, notification dispatch, AI sessions with budgets and fallback, append-only audit chaining, database-backed RBAC and API key rotation, and the storage, search, rate-limit, and integration gaps.
- 2521b15: The test doubles now behave like what they stand in for, and shared contract suites hold them to it.

  `TestRepository` with a `tenantColumn` is tenant-scoped the way the Postgres repository is. Before,
  an operation whose context had no tenant ran across every tenant's rows, so a service that forgot the
  tenant passed its tests and failed in production. Now it throws `database/tenant-required`, a row
  written for another tenant is `database/tenant-mismatch`, an update can't change a row's id or
  tenant, soft-deleted rows are hidden from updates, deleting a missing row throws `not-found`, and
  `crossTenant()` is the way across. The filter operators `in`, `notIn`, `like`, `ilike`, `isNull`
  and `isNotNull` were treated as "match everything"; they now work as in SQL, `null` means
  `IS NULL`, and an unknown operator throws. A new `repositoryContract` runs against the double and
  against `DrizzleRepository` on Postgres.

  `TestJobQueue` implements `JobScheduler`, so `new DefaultJobs({ queue: new TestJobQueue() })`
  type-checks and `jobs.schedule()` works: `getSchedules()` lists them and `runSchedule(name)`
  enqueues one as its cron tick would.

  The memory search adapter (and `TestSearchClient`) applies `sort` (`field:asc`, `field:desc`,
  comma-separated) and returns `facetCounts` over everything that matched; before, both were ignored.
  The search contract checks this against Typesense too.

  **Changed:** a test that used `TestRepository` with a `tenantColumn` and a context without
  `tenantId` now fails with `database/tenant-required`. Give the context a tenant, or use
  `crossTenant()` where reading across tenants is the intent.

### Patch Changes

- f01fda6: `DrizzleRepository.updateWhere` refuses an empty filter (`{}`, `[]`, or only `undefined` values) with
  `database/unsafe-operation`, as `deleteWhere` does. Its check looked at the combined condition, which
  always holds the tenant and soft-delete clauses, so on a tenant-scoped or soft-delete table an empty
  filter updated every row in the tenant, or in every tenant through `crossTenant()` on a soft-delete
  table. `TestRepository` now refuses an empty filter in `updateWhere`
  and `deleteWhere` too.
- Updated dependencies [9ec6419]
- Updated dependencies [2fd4011]
- Updated dependencies [bb7f53a]
- Updated dependencies [44879db]
- Updated dependencies [6ad742b]
- Updated dependencies [92577a6]
- Updated dependencies [47f9687]
- Updated dependencies [da7d762]
- Updated dependencies [662ccc5]
- Updated dependencies [fcdeb4e]
- Updated dependencies [b1b411b]
- Updated dependencies [1499837]
- Updated dependencies [402cc1a]
- Updated dependencies [ea2f8fc]
- Updated dependencies [8a56f66]
- Updated dependencies [662ccc5]
- Updated dependencies [662ccc5]
- Updated dependencies [c5019d6]
- Updated dependencies [879b40f]
- Updated dependencies [2521b15]
  - @mariachi/ai@0.1.0
  - @mariachi/core@0.1.0
  - @mariachi/database@0.1.0
  - @mariachi/cache@0.1.0
  - @mariachi/events@0.1.0
  - @mariachi/jobs@0.1.0
  - @mariachi/notifications@0.1.0
  - @mariachi/search@0.1.0
  - @mariachi/storage@0.1.0
