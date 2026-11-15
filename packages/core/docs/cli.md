# CLI

`@mariachi/cli` installs the `mariachi` binary (`init`, `generate`, `validate`, `db`, `design`, `explore`). It loads `./.env` when present; variables already set
in the environment win.

## init

```bash
npx @mariachi/cli init my-app            # --name <pkg>, --no-example, --no-e2e, --mariachi-version <range>, --auth jwt|gotrue, --orgs
```

Creates the [project layout](./architecture.md#project-layout): `src/app.ts` (`createApp()`: config, lifecycle,
Postgres, BullMQ jobs, communication, API server with JWT auth, health and OpenAPI), a `src/main.ts`
that starts it, registry files, `docker-compose.yml` (Postgres + Redis), `.env.example`,
`vitest.config.ts`, end-to-end test support (`pnpm test:e2e`, see [testing.md](./testing.md#end-to-end-tests)),
`AGENTS.md`, and an example `note` entity wired end to end. Dependencies are pinned to the framework version that generated the
project. The directory must be empty or not exist.

`--no-e2e` leaves out the end-to-end test support (`pnpm test:e2e`, `src/testing/`, the
`@mariachi/testing` and `testcontainers` devDependencies), for environments with no Docker.

`--auth gotrue` signs users in with GoTrue (Supabase Auth, hosted or your own) instead of HS256
JWTs. `@mariachi/auth-gotrue` verifies its tokens (configured from `AUTH_URL`, `AUTH_ORIGIN` or
`APP_ORIGIN`, else a GoTrue on a private address with its discovered issuer), and
`@mariachi/tenancy` takes the tenant from the organization claim (`AUTH_ORG_CLAIM`, `org_id` by
default). A user whose token names no organization gets a personal tenant, so the project works
with a plain Supabase project; `AUTH_PERSONAL_TENANTS=false` requires an organization instead. It
adds `GET /api/me`, `MIGRATE_ON_START`, and an example sign-in page at `/api/sign-in` (password,
sign-up, magic link; emailed links use PKCE, so a link works once and only in the browser that
asked for it).

`--orgs` adds organizations, memberships and invitations kept in the app's own database
(`@mariachi/organizations`, see [organizations.md](./organizations.md)), for apps whose identity
provider keeps none. It works with either `--auth`. The project gets the tables
(`src/schema/organizations.ts`), the wiring in one file (`src/organizations.ts`), the routes under
`/api/organizations`, the check that puts a request in the organization its `x-organization-id`
header names once the user's membership is confirmed, rate limits on creating, inviting and
accepting, and end-to-end tests for all of it. Invitations are emailed once `INVITATION_URL` (your
accept page) and an email adapter (`EMAIL_ADAPTER`) are set; until then the invite's response
carries the token. With `--auth gotrue`, whether an invitee's address is verified is read from the
user's record (`AUTH_SERVICE_KEY`) or a claim your own token hook adds, never from what the user can
edit. The page that accepts an invitation is yours to build.

## generate

```bash
mariachi generate entity invoice-item     # alias: mariachi g
mariachi generate service billing-report
mariachi generate controller billing-report
mariachi generate job send-digest
mariachi generate integration acme
```

| Type | Creates | Registers in |
| --- | --- | --- |
| `entity` | `schema/<plural>.ts`, `contracts/<plural>.ts`, `services/<plural>/{repository,service,handler,service.test}.ts`, `api/controllers/<plural>.controller.ts` with CRUD + cursor pagination, and `api/controllers/<plural>.e2e.test.ts` | `schema/index.ts`, `services/index.ts`, `api/controllers/index.ts` |
| `service` | `contracts/<name>.ts` with an `<name>.execute` procedure, service, handler, test | `services/index.ts` |
| `controller` | `api/controllers/<name>.controller.ts`; reuses `contracts/<name>.ts` if it exists | `api/controllers/index.ts` |
| `job` | `jobs/<name>.job.ts` (`defineJob` with schema, retry, timeout) | `jobs/index.ts` |
| `integration` | `integrations/<name>/client.ts` (timeouts, retries on transient status codes, `IntegrationError`) and a test | none; construct it in `app.ts` |

Names can be kebab, camel or Pascal case (`invoice-item`, `invoiceItem`, `InvoiceItem`). Generators
never overwrite files without `--force`: if any target exists, nothing is written. Registry files are
edited by inserting above the `// mariachi:<kind>` marker comments, so keep those comments.
`--project-root <dir>` targets another directory.

## dev

```bash
mariachi dev                 # everything a first run needs, then the app with reload
mariachi dev --prepare-only  # the preparation without starting the app (CI, scripts)
```

Gets a project from a fresh checkout to running, doing only what's missing:

| Step | When | What it does |
| --- | --- | --- |
| `.env` | There is none, and the project hasn't named its own env files | Copies `.env.example`. An existing `.env` is never written |
| Services | The project has a Compose file, and its local Postgres or Redis isn't answering | `docker compose up -d`, then waits up to a minute for them (`--wait <ms>`) |
| First migration | The schema has tables and the migrations folder is empty | Writes `drizzle/0000_init.sql`. Later schema changes are never turned into migrations here: it prints a note, and `mariachi db generate` stays a deliberate step |
| Migrate | Migrations are pending | Applies them |
| Run | Always | `tsx watch --env-file=.env src/main.ts` (`--entry <file>`, `--no-watch`) |

A database or Redis on another host is never started for you: `dev` says it can't reach it and stops.

**Where something else runs the services** (a container platform, an environment's own Compose),
pass `--no-services` or set `MARIACHI_DEV_SERVICES=off` in that environment. `dev` then never calls
Docker: it waits for the database and Redis to answer, since they may still be starting, and says
so if they don't.

**Env files.** By default the app's environment is `.env`. A project that keeps it elsewhere names
its files once in `package.json`, in order, a later file winning over an earlier one, missing files
skipped:

```json
{ "mariachi": { "envFiles": [".env.development", ".env"] } }
```

Every `mariachi` command then loads those (variables already set in the environment still win),
`dev` starts the app with them and never copies `.env.example`, and `doctor` checks what they
produce. `--env-file <file>` (repeatable) replaces the list for one run of `dev` or `doctor`.

## doctor

```bash
mariachi doctor            # exit 1 when something has to be fixed
mariachi doctor --json     # { ready, checks: [{ name, status, detail, fix? }] }
```

Checks that the project is ready to run, in the order a first run goes wrong, and says what to run
for each problem:

| Check | Fails when | Warns when |
| --- | --- | --- |
| `node` | Node is older than the project's `engines.node` | |
| `project` | There's no `package.json` depending on `@mariachi/core`, or no `src/` | |
| `dependencies` | Packages aren't installed | Installed `@mariachi/*` packages are at different versions |
| `env` | `.env` is missing and the environment lacks what `.env.example` lists | A variable `.env.example` lists is empty |
| `config` | The configuration the app would load is invalid (it names the variable) | |
| `database` | `DATABASE_URL` is unset or Postgres doesn't answer | |
| `migrations` | The schema has tables and no migration exists, or migrations aren't applied | The schema has changes no migration captures |
| `redis` | `REDIS_URL` is unset though `.env.example` lists it, or Redis doesn't answer | |
| `architecture` | `mariachi validate` finds errors | It finds warnings |

A check that depends on one that failed is skipped, not failed twice. `--strict` exits 1 on
warnings too; `--timeout <ms>` sets how long to wait for a service.

`--json` is a contract for tools and agents:

```json
{ "version": 1, "ready": false, "checks": [{ "name": "database", "status": "fail", "detail": "…", "fix": "docker compose up -d …" }] }
```

- `version` changes if the shape does. The nine check names above, and the four statuses (`ok`,
  `warn`, `fail`, `skip`), are stable.
- `fix` is one command or one sentence.
- **No secret appears in `detail` or `fix`**, whatever a driver's error says: passwords in URLs,
  secret-looking query parameters, and the values of variables named like secrets (`*_SECRET`,
  `*_TOKEN`, `*_KEY`, `*_PASSWORD`) are replaced by `***`. A variable is named, never quoted.

## validate

```bash
mariachi validate [path]      # --strict (warnings fail), --disable <rules...>, --json, --list
```

Checks the rules in [conventions.md](./conventions.md): layer boundaries (controllers ↔ services ↔
database ↔ HTTP), extensionless relative imports, no deep `@mariachi/*` imports, no `process.env`
outside config, no raw `Error` throws, unique procedure names, event naming, and a handler and test for
each service. Exits 1 on errors. Run it in CI next to `tsc`.

## db

All `db` commands take `--schema <path>` (default `src/schema/index.ts`) and `--out <dir>` (default
`drizzle`). Commands that connect use `--url` or `DATABASE_URL`.

| Command | What it does |
| --- | --- |
| `db init` | Creates a starter schema module if there is none. |
| `db generate --name <name>` | Diffs the `defineTable` schema against the last migration snapshot and writes a SQL migration. Refuses destructive changes (drops) unless `--allow-destructive`. A rename looks like drop + add, so edit the SQL into `ALTER ... RENAME`. Also writes `drizzle.config.ts` and a schema shim so `drizzle-kit` tools work. |
| `db check` | Exits 1 if the schema has changes that aren't in a migration. Use it in CI. |
| `db sql` | Prints the full DDL for the schema, without a database. |
| `db migrate` | Applies pending migrations inside a Postgres advisory lock, so concurrent deploys don't race. |
| `db seed --env <env>` | Runs `defineSeed` seeds from `src/seeds/index.ts` (`--file`). Each seed runs once per environment and is recorded; `--force` re-runs. |

The schema module exports every table: your own `defineTable`s, plus framework tables you use
(`export { usersTable, tenantsTable } from '@mariachi/database'`, `eventOutboxTable` from
`@mariachi/events/schema`, or everything via `@mariachi/schema`, which re-exports each package's
`./schema` subpath and so holds every framework table).

## design

Builds and checks [design library](./design.md) themes from `mariachi.design.ts` (or `--config <file>`).

| Command | What it does |
| --- | --- |
| `design build [-o design.css] [--minify] [--strict]` | One CSS file: foundation, the chosen components (with replacements), the base theme, and only the tokens you changed. Prints contrast failures; `--strict` exits 1 on them. |
| `design check [--json]` | Validates the config against the token contract and checks contrast in both modes. Exits 1 on failures. |
| `design new-theme <name> [--from minimal] [-o file]` | Scaffolds `src/styles/<name>.theme.ts` extending a preset. |
| `design list` | Presets and components. |

## explore

```bash
mariachi explore [--port 4321] [--host 127.0.0.1] [--open]
```

Serves the [explorer](./explorer.md) for the installed Mariachi version. Needs `@mariachi/explorer`
(`pnpm add -D @mariachi/explorer`).

