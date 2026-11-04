# @mariachi/cli

## 0.1.0

### Minor Changes

- a591df5: `mariachi init --auth ensemble` (`createProject({ auth: 'ensemble' })`): a project that signs users in
  with Ensemble's per-app auth. `@mariachi/auth-gotrue` verifies GoTrue's tokens (configured from
  `AUTH_URL`, `AUTH_ORIGIN` or `APP_ORIGIN`, else GoTrue on the preview's loopback with its issuer
  discovered), `@mariachi/tenancy` takes the tenant from the `org_id` claim, and roles include `org_role`
  (`GET /api/me`; `GET /api/me/admin` admits owners and admins). It also writes `ensemble.environment.json` (the environment's
  settings in the shape of Ensemble's environment config: Compose with Postgres and Redis, the `/` route,
  `auth` with `seedUsers`), `seed/users.yaml` (the project's organization, an admin and a member persona; Ensemble's layer creates the memberships), `.env.ensemble` (what a
  preview runs with, loaded under `.env`; migrations applied at start) and an example sign-in page at
  `/api/sign-in` (password, sign-up and magic link with plain fetch). The default (`--auth jwt`) is
  unchanged.
- 92577a6: Add `@mariachi/explorer` (alpha): one searchable site for every package, doc, exported symbol, error
  code, CLI command, framework table and design component, generated from the repo at build time and
  styled with `@mariachi/design`.

  `@mariachi/cli` adds:
  - `mariachi explore`: serves the explorer for the installed version (needs `@mariachi/explorer`).
  - `mariachi design build|check|new-theme|list`: build one CSS file from `mariachi.design.ts`, check
    contrast, scaffold a theme that extends a preset.
  - `@mariachi/cli/program`: the command tree without parsing argv.

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

- 8a56f66: Peer dependencies on `@mariachi/database`, `@mariachi/database-postgres` and `@mariachi/explorer` accept any 0.x release (`>=0.0.5 <1`) instead of one exact version. A minor release no longer forces a major one: changesets bumped every peer dependent to major, and the fixed group took every package with it.
- Updated dependencies [a591df5]
- Updated dependencies [0d654a3]
- Updated dependencies [92577a6]
- Updated dependencies [46233a3]
- Updated dependencies [da7d762]
- Updated dependencies [662ccc5]
- Updated dependencies [8a56f66]
- Updated dependencies [662ccc5]
- Updated dependencies [662ccc5]
  - @mariachi/create@0.1.0
  - @mariachi/design@0.1.0
  - @mariachi/core@0.1.0
  - @mariachi/config@0.1.0
  - @mariachi/database@0.1.0
  - @mariachi/database-postgres@0.1.0
