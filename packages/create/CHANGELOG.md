# @mariachi/create

## 0.1.0

### Minor Changes

- 3a7e491: `mariachi init --auth gotrue` (`createProject({ auth: 'gotrue' })`): a project that signs users in
  with GoTrue (Supabase Auth, hosted or your own). `@mariachi/auth-gotrue` verifies its tokens
  (configured from `AUTH_URL`, `AUTH_ORIGIN` or `APP_ORIGIN`, else a GoTrue on a private address with
  its issuer discovered), `@mariachi/tenancy` takes the tenant from the organization claim
  (`AUTH_ORG_CLAIM`, `org_id` by default), and a user whose token names no organization gets a
  personal tenant (`withPersonalTenants`; `AUTH_PERSONAL_TENANTS=false` turns that off), so the
  project works with a plain Supabase project and no token hook. It generates `GET /api/me`,
  `GET /api/me/admin` (owners and admins, or a user in their own tenant), `MIGRATE_ON_START`, and an
  example sign-in page at `/api/sign-in` (password, sign-up and magic link with plain fetch) that
  reaches GoTrue at its public URL, with the publishable key hosted Supabase wants (`AUTH_ANON_KEY`),
  or under the app's own origin. The default (`--auth jwt`) keeps its `src/main.ts` unchanged.

  The default project's `docker-compose.yml` now creates the database that `DATABASE_URL` in
  `.env.example` names (`POSTGRES_DB`); without it the first `mariachi db migrate` failed with a
  missing database. The generated `AGENTS.md` no longer carries a placeholder link.

- dd252f3: The sign-in page that `mariachi init --auth gotrue` generates uses PKCE for emailed links. Asking
  for a magic link or signing up sends GoTrue a SHA-256 challenge and keeps the verifier in the
  browser; the link comes back with a one-time code in the query, and the page exchanges it
  (`/token?grant_type=pkce`) for a session. A link therefore works once, and only in the browser that
  asked for it, within an hour. By default the page no longer takes a session from the address bar
  (the implicit flow), so a link that carries someone else's tokens signs nobody in. Links an admin
  makes (invites, GoTrue's `generate_link`) can only arrive that way, so `AUTH_LINK_SESSIONS=true`
  turns it on: the page then asks GoTrue whose session it is, shows that account, and takes it only
  when the user clicks Continue and nobody is signed in. A failed link gets the page's own message,
  never the link's text, and the page is served with `Referrer-Policy: no-referrer`. The generated project gains `src/api/pages/sign-in.test.ts`, which
  runs the page's script in a small fake browser (`src/api/pages/fake-browser.ts`).
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

- 0d654a3: A project generated with `--auth jwt` (the default) connects its database before building repositories. Its `main.ts` stopped at startup with `database/not-connected`.
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
