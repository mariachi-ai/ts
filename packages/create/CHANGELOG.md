# @mariachi/create

## 0.2.0

### Minor Changes

- 91aac4c: New generators, and entities with columns of their own.
  - `mariachi generate event <domain.thing.happened> [--subscriber [name]]`: the event's Zod payload and
    `defineEvent` in `src/events/<name>.event.ts`, how to publish it (through the outbox, or straight
    away), and a test. `mariachi generate subscriber <event> [name]` adds a subscriber, registered in
    `src/events/index.ts`, with a test.
  - `mariachi generate webhook <name>`: a `WebhookController` on the app's webhook server (its own port,
    `WEBHOOK_PORT`) that checks a Standard Webhooks signature, parses the body with Zod, answers a
    redelivery as a duplicate and hands the delivery to a job it also writes; with a test. The secret is
    `<NAME>_WEBHOOK_SECRET`.
  - `mariachi generate procedure <service> <name>`: one more procedure on a service that exists (its
    contract, method, registration and a test). It refuses, naming the services there are, when the
    service doesn't exist.
  - `mariachi generate entity <name> --field title:string --field due_at:timestamp:optional`: the
    entity's own columns (string, text, integer, number, boolean, timestamp, date, uuid) instead of the
    fixed `name`, which stays the default. Plurals know irregular and uncountable words (`person` →
    `people`, `leaf` → `leaves`, `sheep`) and more endings (`analysis` → `analyses`, `quiz` →
    `quizzes`); `--plural` overrides them.

  A new project sets up events (an in-process bus with the outbox in Postgres relayed to it: services
  get `deps.events` and `deps.outbox`) and starts a webhook server once it has a webhook. It depends on
  `@mariachi/events` and `@mariachi/webhooks`, and its first migration has the outbox table. Generated
  services mark where `generate procedure` adds (`// mariachi:procedures`). A project made before this
  gets the registries from its first `generate event` or `generate webhook`, and a note saying what to
  add to its `src/app.ts`.

- a3d1ba6: `mariachi init --ui` gives the project a design kit of its own. It copies a kit into `src/design/` (`linen` unless the new `--kit <id>` names another) with `@mariachi/design-kits` when that can be imported, and otherwise with `npx @mariachi/design-kits@<the project's @mariachi range> add <id>`. A kit that can't be copied is reported with the command to run by hand, and `init` exits 1. Without `--ui`, nothing loads or fetches the kits.

  The generated pages load the kit (`/assets/design/index.css`), its motion, `@mariachi/design`'s components alone (`/assets/lib/components.css`) and then the project's own `src/design.css` (`/assets/design.css`), where token overrides now go; `public/app.css` is gone. `public/enhance.js` starts `@mariachi/design`'s behaviours (`/assets/lib/behaviors.js`) and the kit's `motion.js` on every page. `<html data-theme>` is the kit's id, read from `src/design/kit.json` by the new `src/design-kit.ts` (the layout's `THEME` constant is gone), so `mariachi design add <other>` changes the look with no code change. The app won't start without a kit (`app/design-kit-missing`, naming the command to run).

  `@mariachi/api-facade` adds `withStaticFile(urlPath, file)` and `staticFile(file)`, which serve one file at one path and nothing else from its directory. `@mariachi/design` exports `./behaviors.js`, the behaviours script as a file a server can send.

- 316d23a: A new `--auth gotrue` project signs people in with nothing to sign up for. Its `docker-compose.yml`
  runs GoTrue (`supabase/auth:v2.197.0`) on the project's own Postgres, in an `auth` schema, and
  Mailpit (`axllent/mailpit:v1.27.11`), the mailbox every email goes to, at `http://localhost:8025`.
  `AUTH_URL` in `.env.example` points at it, and sign-ups confirm their address by email.
  - `mariachi init --auth gotrue` writes `.env` with an ES256 signing key made for the project
    (`GOTRUE_JWT_KEYS`, with `GOTRUE_JWT_SECRET`, and with `--orgs` an `AUTH_SERVICE_KEY` signed with
    it). `.env.example` lists them empty. The next steps no longer include `cp .env.example .env`.
  - `mariachi dev` makes those keys wherever `.env` has them empty (a fresh clone), and starts the
    Compose services and waits when the local GoTrue isn't answering. `mariachi doctor` has an `auth`
    check: GoTrue's `/health` where the app reads it, with the fix to run.
  - The sign-in page sends a visitor back to the page that sent them, given
    `/api/sign-in#return=/path` (a path on the same site only), after a password sign-in or an
    emailed link, even one that opens another tab.
  - With `--orgs --ui`, `/invitations/accept` accepts an invitation: it keeps the token from the
    link, has the visitor sign in or sign up and come back, and accepts as them when they click
    Accept. `INVITATION_URL` defaults to it (on `APP_ORIGIN`, or on `http://localhost:<PORT>` in
    development). Invitations go to the mailbox over SMTP (`nodemailer` is now a dependency of a
    GoTrue project with `--orgs`). In a `--auth jwt` project the page says what accepting in the
    browser needs, since that project has no browser sign-in.
  - `@mariachi/create` exports `fillLocalSecrets` and `LOCAL_SECRETS`.

- c5823c2: `mariachi init --orgs` projects keep their rate limits in their own database, so every process that
  serves the API shares them, with no Redis.
  - `src/schema/organizations.ts` exports `rateLimitBucketsTable` from `@mariachi/rate-limit/schema`, so
    the first migration creates `rate_limit_buckets`.
  - `src/app.ts` builds the limiter for creating organizations, inviting and accepting with
    `createRateLimiter({ adapter: config.rateLimit?.adapter ?? (config.redis ? 'redis' : 'postgres'), url: config.redis?.url, db: database.db, prefix })`.
    With `REDIS_URL` set the counts stay in Redis, as before; `RATE_LIMIT_ADAPTER` (`postgres`, `redis`
    or `memory`) chooses for itself, and `RATE_LIMIT_ADAPTER=redis` without `REDIS_URL` stops the boot
    with `app/rate-limit-redis-url-required`. The production warning that `REDIS_URL` was needed to
    share the limits is gone.
  - `.env.example` lists `RATE_LIMIT_ADAPTER` (commented), and the README and AGENTS.md say where the
    counts are kept.

- 8459fd2: `mariachi validate` reads each file's syntax tree (with the TypeScript compiler, now a dependency of
  `@mariachi/create`, loaded only when `validate` runs) and checks more than imports:
  - `ctx-first`: procedure, route, job and event handlers, and the public methods of services and
    repositories, take `ctx: Context` first; `communication.call`, `this.call`, `jobs.enqueue` and
    `events.publish` pass it first.
  - `zod-at-boundaries`: procedures have input and output schemas, routes a schema for the body, params
    and query their handler reads, and jobs and events a payload schema.
  - `procedure-name-format`: registered and called procedure names are `domainCamel.action`.
  - `procedure-registered` (warning): each procedure called with a literal name is registered in the project.
  - `unique-procedure-names` now reads registrations from the syntax tree too.

  Each finding gives the file and line, the rule and a one-line fix; `--json` and the exit code are as before.

  Projects made by `mariachi init` get a `lint` script, `mariachi validate && tsc --noEmit`, and their
  README and AGENTS.md say to run it before committing.

### Patch Changes

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

- Updated dependencies [fb0b344]
  - @mariachi/core@0.2.0

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

- df60585: `mariachi generate seed <name>` writes `src/seeds/<name>.seed.ts` (a `defineSeed`, with a note on
  writing it so it is safe to repeat) and lists it in `src/seeds/index.ts`, which `mariachi db seed`
  runs. A new project's seeds index has the markers the generator inserts at; in an older project it
  says which two lines to add by hand.

  `mariachi db seed` runs as `NODE_ENV` when `--env` isn't given. It used to run as `development`
  whatever the environment said, so against a production database it ran every seed that didn't name
  its environments. With `NODE_ENV=production`, such seeds are now skipped unless you pass `--env`. It
  prints the database and the environment before it runs, and refuses a database on another machine
  when it would run as `development` without `--env` saying so.

- d12d074: `mariachi init --ui` and `mariachi generate page`: a project with pages a person can open.
  - **`--ui`** (`createProject({ ui: true })`) adds pages sent by the same server as the API and
    styled with `@mariachi/design`: a layout with the design library's stylesheets and one `THEME`
    constant, a home page, a pages controller with routes at the server's root, `public/` served under
    `/assets`, and unit and end-to-end tests. Pages are built with `html`, which escapes what is put
    into it; scripts are files, and the page's policy runs no inline script. It works with `--auth
jwt`, `--auth gotrue` and `--orgs`. Projects made without the flag are unchanged.
  - **`mariachi generate page <name>`** writes `src/api/pages/<name>.ts` and its test, adds its route
    at `/<name>` and its link in the bar.

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

- Updated dependencies [f04e223]
- Updated dependencies [0964659]
- Updated dependencies [8486aa5]
- Updated dependencies [867c6ca]
  - @mariachi/core@0.1.1

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
