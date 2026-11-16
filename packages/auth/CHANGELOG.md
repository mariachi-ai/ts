# @mariachi/auth

## 0.1.1

### Patch Changes

- df09ec1: A new project needs only Postgres, starts with one command, and can be called right away.
  - **Generated projects run jobs and search in Postgres.** `createApp()` builds the Postgres job
    queue (`@mariachi/jobs/postgres`) unless `REDIS_URL` is set, and tenant-scoped search
    (`@mariachi/search/postgres`, `deps.search` in services, indexes listed in `src/search/index.ts`).
    The Compose file and `.env.example` no longer ask for Redis, and the end-to-end tests start one
    container, not two. With `--orgs`, rate limits are counted in memory until `REDIS_URL` is set.
  - **`pnpm dev` is `mariachi dev`** in a generated project: it makes `.env`, starts Postgres, writes
    and applies the first migration, and runs the app with reload. `init` now says so in two steps.
  - **`mariachi token`** signs a development token with the project's `JWT_SECRET`, so a fresh
    `--auth jwt` project can be called at once: `curl -H "authorization: Bearer $(pnpm -s mariachi
token)" …`. `--user`, `--tenant` or `--no-tenant`, `--email`, `--role`, `--scope`, `--expires`.
    It does nothing when `NODE_ENV` is `production`.
  - `JWTAdapter.sign(payload, expiresIn, claims)` takes claims of your own (an `email`, say), which
    come back in `identity.claims`. Claims the adapter writes itself can't be given there.
  - The Postgres job queue, started on a database without its tables, says which tables are missing
    and how to add them (`jobs/tables-missing`) instead of a bare SQL error.
  - `search.ensureIndexes(indexes)` (`@mariachi/search`) makes sure an app's indexes exist when it
    starts: it creates the missing ones, leaves existing ones as they are, and reports and warns when
    an existing index's fields differ from the code's, without applying them. Search clients gain an
    optional `getIndex(name)`; the Postgres and memory adapters have it.

  An existing project is not changed by upgrading: this is about what `mariachi init` generates.

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
  - @mariachi/cache@0.1.1
  - @mariachi/communication@0.1.1
  - @mariachi/database@0.1.1

## 0.1.0

### Minor Changes

- 03f68ae: The verified token's claims now reach tenancy. `createAuthMiddleware` sets `ctx.jwtClaims` from
  `ResolvedIdentity.claims` (new `AuthenticatedContext` type), the API facade's `ResolvedIdentity` type
  declares the `claims` its verifiers already return on `ctx.identity`, and `@mariachi/tenancy`'s
  `jwt-claim` strategy reads `ctx.jwtClaims` or, on an HTTP context, `ctx.identity.claims`. Before, nothing
  set `ctx.jwtClaims`, so `jwt-claim` never resolved a tenant. Providers that return no claims are
  unaffected.
- bb7f53a: Personal tenants, for apps whose users don't all belong to an organization. Every provider returns
  an empty tenant for such a user, and an identity with no tenant is refused, so these apps couldn't
  serve them. `withPersonalTenants(verifier, { namespace })` (`@mariachi/auth`) wraps any token
  verifier and gives a person with no tenant their own: `user.<namespace>.<userId>` (the user id
  percent-encoded). Tenant-scoped tables, billing and roles then work as for any tenant.
  `@mariachi/core` exports `personalTenantId`, `parsePersonalTenant` and `isPersonalTenant`. Off
  unless you wrap a verifier.

  It applies only to a person (`identityType: 'session'`), only when the verified identity has no
  tenant, and the namespace keeps the same user id from two issuers apart.

  Tenant ids starting with `user.` are now reserved, with or without personal tenants in use. A token
  that names one as its tenant is refused by `JWTAdapter` (which also refuses to sign one, as
  `SessionManager.create` refuses to store one), and the API facade (`tenancy/reserved-tenant`, 403),
  `createAuthMiddleware` and realtime's `handleConnect` refuse an identity that carries one without
  the mark `withPersonalTenants` puts on it: a symbol, which no token payload can hold. Breaking only
  for an app whose own tenant ids start with `user.`.

  `JWTAdapter` takes `requireTenant: false` to accept a token with no tenant (for use under
  `withPersonalTenants`); `sign` leaves the tenant claim out when it's empty.

- b402753: `DrizzleSessionStore` (`@mariachi/auth/postgres`): `SessionManager` sessions kept in the `sessions`
  table, so they survive a restart and work across instances. `SessionManager` only shipped an
  in-memory store.

  Sessions now have an absolute end. With sliding expiry (the default) every use pushed the expiry
  `ttlSeconds` ahead with no limit, so a session used once a month never expired.
  `maxLifetimeSeconds` (default 90 days from issue; `null` for no limit) caps the slide and is
  checked on `verify`. `revoke(id, { userId, tenantId? })` only revokes that user's session and
  answers `not-found` otherwise.

  `SessionManager.purgeExpired(graceSeconds)` deletes sessions that expired or were revoked before the
  grace period (stores may implement the new optional `deleteExpired`), and `list` leaves out expired
  sessions as well as revoked ones. The in-memory store no longer extends or re-revokes a revoked
  session and lists newest activity first, as the Postgres store does; one contract suite runs against
  both.

  `sessionsTable` gains indexes on `user_id` and `expires_at`: a project that already has the table
  needs a migration for them (`mariachi db generate`, then `db migrate`).

  Breaking: existing sliding sessions older than 90 days are refused unless `maxLifetimeSeconds` is
  raised or set to `null`.

- 35dc946: `IdentityClient` in `@mariachi/auth`: the calls an app's own backend makes to its identity provider (password sign-in, the social sign-in redirect and code exchange, refresh, sign-out, user lookups), so an app can switch providers by configuration. New `@mariachi/auth-workos`: WorkOS AuthKit token verification (JWKS, issuer, `client_id`, or `audience` for MCP tokens), `WorkOS-Signature` webhooks, and `createWorkOSIdentityClient` on `@workos-inc/node` (an optional peer). `@mariachi/auth-fusionauth` adds `createFusionAuthIdentityClient` and `fusionAuthEmailVouched`; its existing exports are unchanged.
- 662ccc5: Harden the framework core: architecture, security, data, async, HTTP, CLI and docs.

  Breaking changes to migrate:
  - **Communication**
    - The call signature is now `communication.call(ctx, name, input)`, with `ctx` first.
    - Procedures register as `register(name, { schema: { input, output }, handler })`.
    - Duplicate names throw `communication/duplicate-procedure`.
    - Declare procedure types with `declare module '@mariachi/communication' { interface Procedures { ... } }`.
  - **Dependency injection**
    - Abstract services take an explicit `deps` or instrumentation object instead of reading the global container in their constructors.
    - Container keys are typed (`createKey<T>()`, `KEYS`).
  - **Config**
    - Importing `@mariachi/config` no longer loads `.env`. Pass `loadConfig({ dotenv: true })` or load it yourself.
    - Invalid config throws `ConfigError`.
  - **HTTP**
    - The api-facade stub auth strategies, the auth resolver and `createRouter` are removed. Use `bearerStrategy`, `apiKeyStrategy`, `serviceTokenStrategy` or `hmacSignatureStrategy`, or use `SignatureAuthController` for webhooks.
    - Controller routes declare Zod schemas and are prefixed automatically.
    - Health and OpenAPI routes live under the server prefix, for example `/api/health/ready`.
    - Errors use the JSON error envelope.
  - **Database**
    - A repository with a `tenantColumn` throws when `ctx.tenantId` is missing, unless the call goes through `crossTenant()`.
    - Database failures throw `DatabaseError`.
    - Migrations are generated from `defineTable` schemas with `mariachi db generate`.
  - **Jobs**
    - `enqueue` and `enqueueWithDedup` take `ctx` first. Job data travels in a context envelope.
    - `start()` prunes schedules that the current process didn't register.
  - **Events**
    - `traceId` and `tenantId` travel on the envelope, not in the payload.
    - For at-least-once delivery, use the Redis Streams adapter or the outbox.
  - **Encryption**
    - Ciphertexts use the new `mx1:` envelope, which records the key id and supports associated data.
    - Values written by earlier versions can't be read. Decrypt them with the old version and re-encrypt them.
  - **Tenancy**
    - The authenticated tenant is authoritative. A header that names another tenant throws `tenancy/mismatch`, which maps to HTTP 403.
  - **`@mariachi/create` and the CLI**
    - Generators target the `src/` project layout created by `mariachi init` and use the current APIs.
    - The generator API is `generateEntity`, `generateService`, `generateController`, `generateJob` and `generateIntegration`.
    - The Handlebars dependency is removed.
    - `mariachi validate` rules have new names (list them with `mariachi validate --list`).
  - **Docs**
    - The docs are consolidated in `@mariachi/core/docs`, and the `.mariachi/` copies are removed.
    - The package catalog is generated from `package.json` metadata.

- 37e3d31: `IdentityClient`: email codes (`startEmailCode`, `signInWithEmailCode`), finishing a sign-in held at email verification (`pendingVerificationCode`, `verifyEmailAndSignIn`), `resetPassword` and `setPassword`. `sendPasswordReset` now returns who sends the email: `{ deliveredBy: 'app', token, url }` (the app emails it), `'provider'`, or `'nobody'` (no such account). `@mariachi/auth-workos` gains `emailsSentBy` (`'app'` by default: WorkOS's own emails off). FusionAuth implements the codes with its passwordless API and `setPassword` with the User API; held sign-ins and app-side resets stay FusionAuth's own (`auth/not-supported`).
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

- 27ab7f7: An audit of the four provider packages against two rules: webhook dedup uses only signed material,
  and a tenant is authenticated.

  `@mariachi/auth-clerk`:
  - `ClerkWebhookAuth` returns the Svix id as the event id, so `WebhookServer` deduplicates Clerk
    deliveries. It put the id in `metadata` only, and nothing was deduplicated.
  - `ClerkWebhookHandler` sets `tenantId` from the signed body for organization events.
  - `verify` returns `roles` (`org_role`), `org_permissions` among the scopes, and the verified
    payload in `claims`; `clerkIdentity` exports the mapping.
  - `createClerkMiddleware` is now the framework's `createAuthMiddleware`, so the claims reach
    `ctx.jwtClaims` and tenancy's `jwt-claim` strategy. Its own copy dropped them.

  `@mariachi/auth-workos`: the webhook handler accepts several secrets during a rotation
  (`secret: string | string[]`), and checks the signature over the timestamp exactly as sent.

  `@mariachi/auth-gotrue`: hooks are checked over the timestamp exactly as sent.

  `@mariachi/auth-fusionauth`: `verify` returns the verified payload in `claims`. The `issuer` option's
  comment said it defaulted to the server URL; it isn't checked unless set, and now says so, and the
  provider warns once when built without one (through `logger` if given).

  All four providers' `verify`, and `createAuthWebhookDispatcher`, refuse a tenant in the reserved
  personal-tenant namespace (`user.`).

- 8a56f66: Peer dependencies on `@mariachi/database`, `@mariachi/database-postgres` and `@mariachi/explorer` accept any 0.x release (`>=0.0.5 <1`) instead of one exact version. A minor release no longer forces a major one: changesets bumped every peer dependent to major, and the fixed group took every package with it.
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
  - @mariachi/communication@0.1.0
  - @mariachi/cache@0.1.0
