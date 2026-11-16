# @mariachi/config

## 0.1.1

### Patch Changes

- Updated dependencies [f04e223]
- Updated dependencies [0964659]
- Updated dependencies [8486aa5]
- Updated dependencies [867c6ca]
  - @mariachi/core@0.1.1
  - @mariachi/database@0.1.1

## 0.1.0

### Minor Changes

- 9ec6419: `createAI({ adapter: 'anthropic' })` and `createAI({ adapter: 'google' })` work: they used to need
  `adapter: 'custom'` with an instance (`'anthropic'` threw). `AnthropicAdapter` and the new
  `GoogleAdapter` are exported from `@mariachi/ai` and import their optional peer (`@ai-sdk/anthropic`,
  `@ai-sdk/google`) on the first call, failing with `dependency/missing-peer` when it isn't installed.

  `baseURL` on `createAI` and on every adapter (config `ai.baseUrl`, env `AI_BASE_URL`) points a
  provider at a proxy, a gateway or a local model server. For Anthropic it's the host without `/v1`, as
  in Anthropic's SDK (a URL ending in `/v1` also works); for OpenAI and Google it's the full prefix.
  With a `baseURL`, `OpenAIAdapter` calls Chat Completions (`api: 'responses'` overrides).

  `AnthropicAdapter`: the default model is `claude-sonnet-5-5` (was `claude-sonnet-5`); it no longer
  sends the `anthropic-beta` header that `@ai-sdk/anthropic` adds when tools are passed
  (`allowBetaHeaders: true` restores it); `forwardUserId: true` sends the session's `userId` as
  `metadata.user_id`. The adapter port's call config gains `userId` (`AdapterCallConfig`), and a model
  factory passed to `AISdkAdapter` may be async.

  The built-in cost table now has Anthropic's current Claude models, so they're no longer priced at 0.

- 44879db: Config fields the docs named now exist, and an option that was accepted and ignored now works.
  - `config.storage.signingSecret` and `config.storage.publicBaseUrl` (`STORAGE_SIGNING_SECRET`, 32 or
    more characters, and `STORAGE_PUBLIC_BASE_URL`): the storage doc's example read the first, which
    wasn't in the config.
  - `config.encryption.kmsKeyId` (`ENCRYPTION_KMS_KEY_ID`), for the `aws-kms` and `gcp-kms` adapters.
    `createEncryption`'s example named `kmsKeyId` and `localKey`; it now uses `kmsKeyId`, `key` and
    `keyVersion`, which says what `keyVersion` is for: the key's id.
  - `PinoLoggerAdapter({ pretty: true })` writes human-readable lines; before, `pretty` did nothing.
    It needs the optional peer `pino-pretty`. `LOG_PRETTY` / `observability.logging.pretty` turns it
    on from config, and `destination` says where to write.
  - `database.poolMin` / `DATABASE_POOL_MIN` is marked deprecated: it was never used, because the
    Postgres driver opens connections on demand. It still loads, so existing environments don't break.

- 6ed3553: `loadConfig` refuses environment values it can't read instead of silently using the default.
  `PORT=eighty`, `DATABASE_POOL_MAX=ten` and the other numeric variables now fail with
  `config/invalid` naming the variable; before, they were dropped and the default applied.
  `TRUST_PROXY` (the one boolean) accepts `true`, `1`, `yes`, `on`, `false`, `0`, `no`, `off` in any
  case and fails on anything else; before, anything but `true` or `1` meant false. The value is never
  echoed in the message.

  **Changed:** an environment name other than `development`, `test` or `production` in `ENV` or
  `NODE_ENV` is now an error. Before, `NODE_ENV=staging` ran the app as `development`, with
  production safeguards off. If `NODE_ENV` has to keep such a value for other tooling, set `ENV` to
  one of the three; `ENV` decides. With neither variable set the app still runs as `development`,
  and now warns once at start (`MARIACHI_ENV_UNSET`).

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

- 1499837: `SmtpEmailAdapter` is a real SMTP client. It honours `email.smtpUrl` (`SMTP_URL`), which
  `createEmailAdapter` used to ignore, so SMTP always went to `127.0.0.1:1025` with no login and no
  TLS. `smtp://user:pass@host:587` requires STARTTLS when it carries credentials to a remote host,
  `smtps://` is TLS from the start, and `?tls=required|opportunistic|none` overrides, except that
  credentials for a remote host are never sent without TLS unless the URL says `?tls=none-insecure`. It now sends
  through `nodemailer`, an optional peer dependency (`pnpm add nodemailer`), which also ends the old
  client's header injection through a subject containing a line break.

  New `PostmarkEmailAdapter` and `SendGridEmailAdapter` (over `fetch`), and `createEmailAdapter`
  accepts `adapter: 'postmark'`, `'sendgrid'`, or `'custom'` with `instance`.

  `EmailMessage` gains `cc`, `bcc`, `headers` and `attachments`, sent by every built-in adapter, and
  `stream` (Postmark's `MessageStream`, per message).

  Provider failures are split by whether sending again can help: `notifications/provider-failed`
  (HTTP 408, 429, 5xx; SMTP 4xx; network errors) is retried, and the new `notifications/rejected`
  (other HTTP 4xx; SMTP 5xx) is not. Both carry `metadata.retryable`; `providerFailure` builds them
  for custom adapters. Add `notifications/rejected` to the dispatch job's `nonRetryableCodes`.

  Config: `EMAIL_API_KEY` is the key for the adapter `EMAIL_ADAPTER` names, and `email.apiUrl`
  (`EMAIL_API_URL`) holds the base URL of an HTTP email API for Postmark, SendGrid or a custom adapter.
  A key never goes to another provider: `EMAIL_API_KEY` without `EMAIL_ADAPTER` fails at startup
  (`config/email-adapter-required`) instead of being sent to the default adapter, Resend, and
  `RESEND_API_KEY` is only given to the Resend adapter.

  Breaking: `SmtpEmailConfig`'s `host` and `port` are optional and the adapter needs `nodemailer`
  installed; a provider's refusal now has the code `notifications/rejected`, from
  `DefaultNotifications.sendEmail` too (it was always `notifications/email-send-failed`); with
  `EMAIL_ADAPTER` set to anything but `resend`, `RESEND_API_KEY` is no longer read.

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
