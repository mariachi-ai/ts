# @mariachi/cli

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

- 3989057: Kits are published, and `mariachi design add <kit>` copies one into a project. The new
  `@mariachi/design-kits` ships every design language and plain preset as a kit (tokens, base styles,
  self-hosted fonts, motion and `DESIGN.md`, with a sha256 per file), storing shared fonts and the motion
  files once and putting each kit back together byte for byte. `mariachi design add linen` (or
  `npx @mariachi/design-kits add linen`, with nothing installed) writes the kit into `src/design/` and, once,
  `src/design.css` beside it for the project's own changes. It never writes `design.css` again, reports a
  copy the project has edited instead of replacing it (exit 1, unless `--force`), switches languages in
  place so the project's imports don't change, and never removes a file that isn't a kit's. `mariachi design list` shows the kits beside the
  presets and components. Each kit now carries the licence of every font it copies, as
  `fonts/<family>.LICENSE.txt`, recorded in `kit.json`.

  Tools that serve or assemble a kit without writing it use `hasKit(id)`, `kitJson(id)`,
  `kitJsonBytes(id)` and `readKitFile(id, path)`, which gives only the files `kit.json` lists, each
  checked against its sha256. The design catalog (components, languages, presets, tokens) ships as
  `@mariachi/design-kits/catalog.json`: it is too large for `@mariachi/design`, which leaves it out.

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

- Updated dependencies [df09ec1]
- Updated dependencies [df60585]
- Updated dependencies [d12d074]
- Updated dependencies [f04e223]
- Updated dependencies [0964659]
- Updated dependencies [8486aa5]
- Updated dependencies [867c6ca]
  - @mariachi/create@0.1.1
  - @mariachi/auth@0.1.1
  - @mariachi/core@0.1.1
  - @mariachi/config@0.1.1
  - @mariachi/database@0.1.1
  - @mariachi/database-postgres@0.1.1

## 0.1.0

### Minor Changes

- 1728dd3: `mariachi dev` and `mariachi doctor`. `dev` gets a project from a fresh checkout to running: it
  copies `.env.example` to `.env` when there's none, starts the Compose services when the local
  Postgres or Redis isn't answering and waits for them, writes the first migration when the schema has
  tables and none exists, applies pending migrations, then runs the app with reload. It never writes an
  existing `.env` and never generates a migration after the first. `doctor` checks Node, the installed
  packages, `.env`, the configuration, the database, migrations (none, unapplied, or behind the
  schema), Redis and the architecture rules, says what to run for each problem, and exits 1 when
  something has to be fixed. `--json` is a versioned shape for tools, and no secret appears in a
  result, whatever a driver's error says. A project can name its env files in `package.json`
  (`"mariachi": { "envFiles": [...] }`), which every `mariachi` command then loads; `--no-services` or
  `MARIACHI_DEV_SERVICES=off` is for environments that run the database and Redis themselves.
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

- 8a9ee49: `@mariachi/design` ships only what an app or tool reads: ESM only (no CommonJS build), no source maps, and no per-language galleries, recipe pages, DTCG token files or `catalog.json`. They're still built in the repo for the explorer. The packed size goes from 11.5 MB to 2.3 MB. `@mariachi/cli` now has `@mariachi/design` as an optional peer, loaded only by `mariachi design`, so a project that never runs it doesn't install the design package.
- 8a56f66: Peer dependencies on `@mariachi/database`, `@mariachi/database-postgres` and `@mariachi/explorer` accept any 0.x release (`>=0.0.5 <1`) instead of one exact version. A minor release no longer forces a major one: changesets bumped every peer dependent to major, and the fixed group took every package with it.
- Updated dependencies [9ec6419]
- Updated dependencies [2fd4011]
- Updated dependencies [bb7f53a]
- Updated dependencies [44879db]
- Updated dependencies [6ed3553]
- Updated dependencies [6ad742b]
- Updated dependencies [3a7e491]
- Updated dependencies [dd252f3]
- Updated dependencies [0d654a3]
- Updated dependencies [f01fda6]
- Updated dependencies [92577a6]
- Updated dependencies [47f9687]
- Updated dependencies [b149375]
- Updated dependencies [da7d762]
- Updated dependencies [662ccc5]
- Updated dependencies [fcdeb4e]
- Updated dependencies [1499837]
- Updated dependencies [ea2f8fc]
- Updated dependencies [8a56f66]
- Updated dependencies [662ccc5]
- Updated dependencies [662ccc5]
- Updated dependencies [879b40f]
  - @mariachi/config@0.1.0
  - @mariachi/core@0.1.0
  - @mariachi/database@0.1.0
  - @mariachi/create@0.1.0
  - @mariachi/database-postgres@0.1.0
