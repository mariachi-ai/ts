# @mariachi/observability

## 0.1.1

### Patch Changes

- Updated dependencies [f04e223]
- Updated dependencies [0964659]
- Updated dependencies [8486aa5]
- Updated dependencies [867c6ca]
  - @mariachi/core@0.1.1

## 0.1.0

### Minor Changes

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
