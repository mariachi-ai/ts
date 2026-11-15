# @mariachi/jobs

## 0.1.0

### Minor Changes

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

- b1b411b: A job queue in Postgres, so an app with background jobs doesn't need Redis.
  `createPostgresJobQueue(database.db, config, logger)` from `@mariachi/jobs/postgres` is a backend for
  `DefaultJobs` with the BullMQ adapter's semantics: retries with backoff, non-retryable codes,
  deduplication by key, priorities, delays, cancel, a dead-letter list with replay, cron schedules
  with timezones, progress, timeouts and hooks. Workers claim jobs with `FOR UPDATE SKIP LOCKED`, so
  any number of processes share a queue; a worker renews its claim while a handler runs, and a job
  whose worker died is taken over after `lockMs` (at-least-once delivery; one that never finishes is
  dead-lettered as `jobs/stalled`). A job enqueued inside `withTransaction` commits or rolls back
  with the business write. A schedule's tick is enqueued once however many workers are running. A
  worker never claims a job it is still running (so a paused and resumed process doesn't run one
  twice beside itself), and `reset()` lets a process copied while running abandon its inherited jobs.

  Its tables, `jobsTable` and `jobSchedulesTable`, are in `@mariachi/jobs/schema` and `@mariachi/schema`.
  `@mariachi/database-postgres` and `drizzle-orm` are optional peers of `@mariachi/jobs`, needed only for
  this adapter. `createJobQueue({ adapter: 'postgres' })` points at the new factory.

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
