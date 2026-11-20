# @mariachi/core

## 0.2.0

### Minor Changes

- fb0b344: `mariachi list` says what an app exposes without starting it: `mariachi list routes`, `procedures`
  or `jobs`, or all three, as a table or with `--json`.
  - Routes: method, full path, auth (the route's own or the server's default, its tenant rule and
    scopes), the procedure its handler calls, and the controller and `file:line` that declares it.
    The server's own routes (health, OpenAPI, static files) are listed too.
  - Procedures: input and output as one TypeScript-like line, where each is registered, and which
    routes call it.
  - Jobs: payload, retries, timeout, where each is defined, and its `jobs.schedule()` cron schedules.

  It reads the app's real registrations: it loads `src/api/controllers/index.ts`,
  `src/services/index.ts`, `src/organizations.ts` and `src/jobs/index.ts` with a communication layer
  that only records and dependencies that do nothing, so nothing connects anywhere. `src/app.ts` is
  never run; its API prefix, default auth and schedules are read from its source. It reports a route
  calling a procedure nothing registers, a procedure registered twice, a schedule for a missing job,
  and a module that failed to load (exit 1). `typescript` is now a dependency of the CLI.

  The docs (`cli.md`, `ai-guide.md`) describe it.

## 0.1.1

### Patch Changes

- f04e223: The docs can be read and searched from the terminal, and have an index for tools.
  - **`mariachi docs`** lists the framework's docs by group, prints one (`mariachi docs jobs`) or one
    section (`mariachi docs http#pages-and-files`), and searches them (`mariachi docs --search
idempotency key`): every doc with a matching line is shown, likeliest first, and each line says
    which section to read. In a project it reads the docs of the `@mariachi/core` installed there.
    `--json` and `--path` are for tools.
  - **`llms.txt`** ships in `@mariachi/core`'s docs folder: every doc with a line about it, in the
    llms.txt format, generated from the docs index and checked in CI. The check fails for a doc that
    is not in the index, or whose index line doesn't say what it is.
  - A generated project's AGENTS.md names the command.

- 0964659: Organizations, part three: invitation emails, and a project that starts with all of it.
  - **`invitationEmail({ email, acceptUrl, appName })`** in `@mariachi/organizations` sends each
    invitation to the address it is for. Give it to `registerOrganizationProcedures` as
    `deliverInvitation` with any email adapter from `@mariachi/notifications`. The token is added to
    your accept page's address as its fragment, `#token=`, which a browser sends to no server, so it
    is in no access log; `compose` writes your own message. It sends in the request that invites,
    never through a queue, so the token is stored nowhere.
  - **`goTrueVerifiedEmail({ url, serviceKey })`** in `@mariachi/auth-gotrue` says whether a GoTrue
    (Supabase Auth) user's email address is verified, for `verifiedEmail`: from a top-level
    `email_verified` claim when your token hook adds one, otherwise from the user's record, and never
    from `user_metadata`, which the user can rewrite. A GoTrue that confirms sign-ups without sending
    mail is answered unverified. `requireClaim` takes only the claim, so an app whose hook sets it
    holds no service key. With no way to know it says so (`auth/verified-email-unavailable`) instead
    of guessing.
  - **`mariachi init --orgs`** (`createProject({ organizations: true })`) generates a project with the
    tables, the wiring in `src/organizations.ts`, the `/api/organizations` routes, the membership check
    on every request, rate limits, and end-to-end tests. It works with `--auth jwt` and `--auth
gotrue`. Projects made without the flag are unchanged.

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

- 867c6ca: Every package says where its source is: a `repository` field naming this repository and the package's
  directory. npm shows it on the package page, and npm's trusted publishing checks it against the
  repository a release is published from.

## 0.1.0

### Minor Changes

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

- 6ad742b: Logging the loaded config no longer prints its secrets.
  - `logger.info({ config })`, `console.log(config.database)` and `JSON.stringify(config.auth)` show
    every secret in the built-in config as `[REDACTED]`, and a connection URL (`database.url`,
    `redis.url`, `email.smtpUrl`) with only its password hidden. Reading a field still gives the
    value: `config.auth.jwtSecret` is unchanged for code that uses it.
  - A URL also hides query parameters named like a credential (`?password=`, `?sslkey=`,
    `?access_token=`), and the Sentry DSN is treated as a URL: today's form shows unchanged, the
    older `public:secret@` form has its secret hidden.
  - `Secrets` and `EnvSecretsAdapter` log as `[Secrets]` and `[EnvSecretsAdapter]`. The env adapter
    holds the whole environment, so a logged `ctx.secrets` used to print all of it.
  - `secret(schema)` and `secretUrl(schema)` from `@mariachi/config` mark the secrets in a section
    you register, for the same treatment; `hideContents(instance, label)` does it for a class of
    your own that holds secrets.
  - `@mariachi/core` exports `REDACT` and `redactForOutput(value)`: an object can declare the form
    it should be shown in, and a logger asks for it. `PinoLoggerAdapter` and `ConsoleLoggerAdapter`
    do; a logger of your own should call `redactForOutput` on what it is given.

  **Changed:** code that serialised the config to pass its secrets on (`JSON.stringify(config)` sent
  to a child process, say) now sends `[REDACTED]`. Read the fields you need and pass those.

- 92577a6: Add `@mariachi/design` (alpha): framework-agnostic tokens and CSS for any web app.
  - One token contract (semantic and component tiers) and six presets: minimal, brutalist, editorial,
    soft, enterprise, terminal. Switch with `data-theme`; `data-mode` is `auto`, `light` or `dark`.
  - 36 components as plain HTML + CSS (`m-` classes, data attributes, ARIA state), including AI patterns:
    chat, thinking, tool calls, citations, composer and usage meters.
  - Override at any granularity: one token, one component, one area, a replaced component
    (`replace` in `mariachi.design.ts`), or a whole preset (`extendTheme`). `buildDesign` emits only the
    tokens you changed.
  - Every preset passes WCAG contrast pairs in both modes; `checkTheme` runs them on your overrides.
  - DTCG token export, a Tailwind v4 theme mapping, and an optional behaviours script.

  `@mariachi/core` gains a dependency-free `@mariachi/core/errors` subpath (the error classes only), for
  browser-safe packages.

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

- ea2f8fc: New package `@mariachi/organizations`: organizations, memberships and invitations in the app's own
  database, for apps whose identity provider supplies none (plain Supabase Auth, generic OIDC, the
  built-in JWT adapter).
  - An organization is a row of the existing `tenants` table, so its id is the tenant id that
    repositories, billing and RBAC already use. Two new tables, `organization_memberships` and
    `organization_invitations`, in `@mariachi/organizations/schema`.
  - `DefaultOrganizations`: create (the creator becomes owner), rename, suspend, delete; list, change
    role, remove, leave; invite, resend, revoke, accept. Every method authorizes from the caller's own
    membership of the organization named, and answers the same for "not a member" and "no such
    organization".
  - Three roles: `owner`, `admin`, `member`. An admin can't make or change an owner, and the last
    owner can't leave, be removed or be demoted, even when two owners act at once.
  - Invitations are single-use and expire (seven days by default). Only a hash of the token is
    stored. Accepting needs a signed-in person whose verified identity states the invited address
    (`verifiedEmail` in the config says where to read it; the default is the token's `email` and
    `email_verified` claims), unless `emailCheck` says otherwise. The address is never an argument.
  - `DrizzleOrganizationStore` (`@mariachi/organizations/postgres`) and `MemoryOrganizationStore`
    pass the same contract suite. Changes are written to an audit log when one is given.
  - `@mariachi/core` gains `OrganizationsError` and the HTTP statuses of its codes.

  This release is the package. The request check that makes a named organization the tenant, HTTP
  endpoints and invitation emails follow.

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

### Patch Changes

- 2fd4011: Every model call is costed and recorded, streams carry tool calls and can be cancelled, and tools
  survive a saved session.
  - **`ai.stream(ctx, session, message, { signal })`** and **`ai.runAgent(ctx, session, message)`**
    join `ai.send`: each model call made through any of them is checked against the budget, costed,
    counted and recorded as telemetry. Before, a stream or an agent run reached the model and
    recorded nothing.
  - **Streams carry tool calls.** The last chunk has `done: true` with the usage, the `model` and
    `toolCalls`, and they are in the session's history. Before, a streamed reply dropped them.
  - **Cancelling.** `signal` on `send`, `stream` and `runAgent`; a stream nobody reads any more
    cancels its provider call. A cancelled call ends with `ai/aborted` (HTTP 499). What the model had
    written is kept in the history, marked `interrupted`, and counted: with the provider's usage when
    it reported any, else with an estimate that counts toward the budget and is marked `estimated`
    in telemetry.
  - **`toSse(chunks)`** turns `ai.stream(...)` into what `sseResponse` takes: `delta` events, a
    `tool-calls` event, and the closing event's usage and model.
  - **Registered tools are used.** A session offers the model the registered tools it names with the
    new `toolNames` (`'*'` for all of them), or its own `tools`. A session that names none offers
    none. Before, registering a tool had no effect at all.
  - **Saved sessions get working tools back.** A session's tools are saved by name and found in the
    registry when it is opened. Before, tools were saved as JSON and came back without their
    handlers. Rows saved that way are read correctly. A named tool that isn't registered is
    `ai/tool-not-found`.
  - **Budgets.** `maxInputTokens` and `maxOutputTokens` are enforced as `maxTotalTokens` is, and each
    call tells the provider how much the model may still write. `maxIterations` on a session is an
    agent run's default (10 when unset).
  - **Telemetry is saved.** With the Postgres session store, `createAI` writes each entry to
    `ai_telemetry`, with the tenant and user of the context. A failed write is a warning in the log,
    not an unhandled rejection.
  - A tool's handler gets the context as its second argument, and a tool with a typed input can be
    registered without a cast.

  **Schema:** `ai_messages` gains `interrupted` and `ai_telemetry` gains `estimated` (default
  false). Run `mariachi db generate` and migrate.

  **Changed:**
  - A call that fails before the model answers no longer leaves the message in the session's history,
    so a retry doesn't say it twice.
  - `runAgent`'s `maxIterations` and `tools` are optional.
  - `AITelemetryTracker` no longer leaves a rejected `persist` unhandled; set `onPersistError` to hear
    of one.
  - `ai.checkTokenBudget` refuses at the limit, as the session already did, not only past it.

- 47f9687: Docs: fix snippets that didn't compile or broke the framework's own rules. `ConflictError` takes a
  message, not a code (`ai-guide.md`, the entity recipe); the webhook recipe read a secret as a property
  and used an undeclared `redis`; the integration recipe threw raw `Error`. `conventions.md` now says
  which errors have fixed codes and how an app's own code gets its HTTP status.
- da7d762: `errorToHttpStatus`: an error whose code the table doesn't know answers the HTTP status it declares (`statusCode`, 400–599) instead of 500. Codes the table maps are unchanged.
- fcdeb4e: Controllers can set cookies, stream, send server-sent events and take file uploads, so none of
  those needs the raw Fastify instance (whose routes skip authentication, validation and rate limits).
  - **Cookies.** `ctx.request.cookies`, `ctx.setCookie(name, value, options)` (any number per response;
    defaults `Path=/; HttpOnly; Secure; SameSite=Lax`) and `ctx.clearCookie`. `httpResponse` headers may
    be lists. `@mariachi/server` exports `serializeCookie` and `parseCookies`.
  - **Cookie sessions.** `cookieStrategy(verifier, { cookie, allowedOrigins })` signs a request in by a
    cookie and refuses a state-changing request that another site caused (`auth/cross-site-request`,
    403), judged by `Sec-Fetch-Site` and `Origin`. `assertSameOrigin` is the check on its own.
  - **Streams.** A handler may return `sseResponse(asyncIterable)` or `streamResponse(iterable | Readable,
{ contentType })`. Events are sent as produced, with a heartbeat. An event stream always ends
    with `event: done` (optionally carrying data such as usage) or, when its source fails, `event: error`
    carrying the error envelope, so a client can tell a finished stream from a dropped connection. `ctx.request.signal` aborts when the client
    disconnects, and the iterable is ended.
  - **Uploads.** `upload` on a route takes `multipart/form-data`: files in `ctx.request.files`, text
    fields as the validated body, with limits on count, size and declared type. Parsed after
    authentication and the rate limit.

  **Changed:** `bearerStrategy(verifier, { cookie })` now applies the same-origin check when the token
  came from the cookie. A `POST`, `PUT`, `PATCH` or `DELETE` authenticated that way must carry an
  `Origin` (or `Sec-Fetch-Site: same-origin`) for the API's own origin, or one listed in
  `allowedOrigins`. Requests with an `Authorization` header are unaffected. `RequestContext` gains
  `responseCookies` and `signal`, and `HttpContext.request` gains `cookies`, `files` and `signal`, for
  code that builds those objects by hand.

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
