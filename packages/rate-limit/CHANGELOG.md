# @mariachi/rate-limit

## 0.2.0

### Minor Changes

- bd1e82d: Rate limits can be kept in Postgres, so an app whose processes share one database shares its limits
  without Redis.
  - `createRateLimiter({ adapter: 'postgres', db })` (or `new PostgresRateLimiter({ db })`) keeps one
    row per key in `rate_limit_buckets`, from `@mariachi/rate-limit/schema`: add
    `rateLimitBucketsTable` to your schema and generate a migration. It gives the same answers as the
    Redis limiter for all three algorithms, weighted requests and `reset`.
  - Each check is one `INSERT … ON CONFLICT … DO UPDATE … RETURNING` statement on the database
    server's clock, so concurrent checks from any number of processes never lose a count, with no
    transaction or advisory lock.
  - Rows of keys whose windows have passed are deleted by `sweep()`, which each process starts in the
    background from a check at most once per `sweepIntervalMs` (default a minute; 0 turns it off).
  - `RATE_LIMIT_ADAPTER` (`memory`, `redis` or `postgres`) is read into `config.rateLimit.adapter`; an
    unknown name fails the boot with `config/invalid`.
  - `@mariachi/rate-limit` now depends on `@mariachi/database`, and takes `drizzle-orm` as an optional
    peer, loaded only by the Postgres limiter.

- 1613fb7: **Breaking for installs:** vendor SDKs are optional peer dependencies. A Mariachi package no longer
  installs the SDK of an adapter you may not use; add the ones you do use to your app.

  | If you use                                                                      | Add                                                                     |
  | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
  | Redis for cache, rate limits, realtime across instances, or the Redis event bus | `ioredis`                                                               |
  | The NATS event bus                                                              | `nats`                                                                  |
  | The BullMQ job queue                                                            | `bullmq`                                                                |
  | Typesense search                                                                | `typesense`                                                             |
  | S3 storage                                                                      | `@aws-sdk/client-s3 @aws-sdk/lib-storage @aws-sdk/s3-request-presigner` |
  | Stripe billing                                                                  | `stripe`                                                                |
  | The Resend email adapter                                                        | `resend`                                                                |
  | The OpenAI adapter                                                              | `@ai-sdk/openai`                                                        |

  Nothing in the API changed. An adapter whose SDK is missing throws `dependency/missing-peer` when it
  is first made or used, naming the package to add. The Postgres and in-memory adapters need none of
  them, so an app on the Postgres job queue and Postgres search installs no Redis or Typesense client.

  The OpenAI adapter now loads its SDK on the first call, as the Anthropic and Google adapters do.

  The packages' type declarations still name the SDKs' types (a Redis client you pass in, a Stripe
  object). With `skipLibCheck` on, as generated projects have it, a missing SDK is no type error.

### Patch Changes

- Updated dependencies [fb0b344]
  - @mariachi/core@0.2.0
  - @mariachi/database@0.2.0

## 0.1.1

### Patch Changes

- 8486aa5: Organizations over HTTP: a request's named organization becomes its tenant once the membership is
  confirmed.
  - `createOrganizationAccess({ organizations })` and `organizationStrategy(strategy, access)`
    (`@mariachi/organizations/http`): the organization a client names in `x-organization-id` becomes
    `ctx.tenantId` only after the signed-in user's membership is found, and the member's role joins
    the identity's roles. A non-member and an unknown organization get the same 404; a suspended
    organization is 403; a request and a token that name different organizations are refused. A
    request that names none keeps the identity's own tenant: nothing is chosen for the user.
    `source: 'token'` is for providers that keep memberships themselves.
  - `registerOrganizationProcedures(communication, organizations)` registers the `organizations.*`
    procedures, with rate limits on creating, inviting and accepting when given a limiter, and
    `deliverInvitation` to send the link so the token reaches only the invited address.
  - `OrganizationsController`: endpoints under `/organizations` for all of it.
  - `@mariachi/api-facade`: a route option `tenant: 'optional'` lets a signed-in user with no tenant
    onto a route, with `ctx.tenantId` null. The default still refuses them.
  - `@mariachi/auth`: `withUserNamespace(verifier, namespace)` prefixes the user ids a verifier
    returns, for apps that accept sign-ins from more than one identity provider.
  - **No tenant is not every tenant.** `isTenantlessCaller(ctx)` in `@mariachi/core` says whether a
    context is someone signed in who is in no tenant. Audit reads, exports, retention and chain checks
    refuse such a caller (`audit/tenant-required`), and API keys can't be rotated or revoked by one.
    Before, those paths read a missing tenant as "all tenants", which only the system ever reached.
  - `rateLimiting.checkTier` counts a signed-in caller who is in no tenant on their own (`user:<id>`
    or `key:<id>`), not in the one counter all anonymous callers share.

  **Changed:**
  - `audit.verifyChain(ctx, tenantId)` and `audit.retain(ctx, …)` cover only the context's own tenant
    when it has one. Before, a tenant's context could name another tenant's chain, and the in-memory
    audit log's `retain` deleted every tenant's entries whatever the context.

- Updated dependencies [f04e223]
- Updated dependencies [0964659]
- Updated dependencies [8486aa5]
- Updated dependencies [867c6ca]
  - @mariachi/core@0.1.1

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

### Patch Changes

- Updated dependencies [2fd4011]
- Updated dependencies [bb7f53a]
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
