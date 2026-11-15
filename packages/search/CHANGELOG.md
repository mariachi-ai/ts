# @mariachi/search

## 0.1.0

### Minor Changes

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
- 879b40f: Full-text search in Postgres, so search doesn't need a search server.
  - `createPostgresSearch(db)` from `@mariachi/search/postgres` is a `SearchClient` on the app's own
    database: the same indexes, typed fields, equality filters, sorting, facet counts, highlights
    and reindexing as the Typesense adapter, and it passes the same contract suite.
  - Indexing inside `withTransaction` commits or rolls back with the business write. A reindex
    replaces an index's documents in one transaction, and a search reads its page, total and facet
    counts from one snapshot.
  - **Tenant-scoped search.** `new DefaultSearch({ client, tenantScoped: true })` confines every
    call to the documents of `ctx.tenantId` and refuses a call without a tenant
    (`search/tenant-required`). It uses the new optional `SearchClient.forTenant(id)`, which the
    Postgres and memory adapters have. Without the option nothing changes.
  - Matching is by whole words in any order, with the last word as a prefix. `{ language:
'english' }` (or any text search configuration) adds stemming. There is no typo tolerance: use
    Typesense when you need it.
  - New tables `mariachi_search_indexes` and `mariachi_search_documents` in
    `@mariachi/search/schema`. Add them to your schema file and migrate to use the adapter; the
    migration creates their GIN indexes. Apps that don't use the adapter need nothing.
  - `@mariachi/database`: a `column.tsvector()` type and `index(...).using('gin' | 'gist' | 'brin' |
'hash')`, which the Postgres compiler turns into the matching DDL.

  **Changed:** the memory search adapter's `reindexAlias` now replaces the index's documents in
  place; it no longer makes a second collection named `<alias>_<timestamp>`.

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

- Updated dependencies [2fd4011]
- Updated dependencies [bb7f53a]
- Updated dependencies [44879db]
- Updated dependencies [6ad742b]
- Updated dependencies [92577a6]
- Updated dependencies [47f9687]
- Updated dependencies [da7d762]
- Updated dependencies [662ccc5]
- Updated dependencies [fcdeb4e]
- Updated dependencies [ea2f8fc]
- Updated dependencies [662ccc5]
- Updated dependencies [879b40f]
  - @mariachi/core@0.1.0
  - @mariachi/database@0.1.0
