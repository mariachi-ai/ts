# CLI

`@mariachi/cli` installs the `mariachi` binary (`init`, `generate`, `validate`, `db`, `design`, `explore`). It loads `./.env` when present; variables already set
in the environment win.

## init

```bash
npx @mariachi/cli init my-app            # --name <pkg>, --no-example, --mariachi-version <range>, --auth jwt|ensemble
```

Creates the [project layout](./architecture.md#project-layout): `src/main.ts` (config, lifecycle,
Postgres, BullMQ jobs, communication, API server with JWT auth, health and OpenAPI), registry files,
`docker-compose.yml` (Postgres + Redis), `.env.example`, `vitest.config.ts`, `AGENTS.md`, and an example
`note` entity wired end to end. Dependencies are pinned to the framework version that generated the
project. The directory must be empty or not exist.

`--auth ensemble` signs users in with Ensemble's per-app auth instead of HS256 JWTs: GoTrue at
`/auth/v1` on the app's host, verified with `@mariachi/auth-gotrue` (configured from `AUTH_URL`,
`AUTH_ORIGIN` or `APP_ORIGIN`, else GoTrue on the preview's loopback with its discovered issuer), and
`@mariachi/tenancy` taking the tenant from the `org_id` claim (roles include `org_role`). It adds
`ensemble.environment.json` (the environment's settings: Compose with Postgres and Redis, the `/`
route, `auth`), `seed/users.yaml` (the project's organization with an admin and a member persona), `.env.ensemble` (what a preview runs
with), `GET /api/me` and an example sign-in page at `/api/sign-in` (password, sign-up, magic link).

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
| `entity` | `schema/<plural>.ts`, `contracts/<plural>.ts`, `services/<plural>/{repository,service,handler,service.test}.ts`, `api/controllers/<plural>.controller.ts` with CRUD + cursor pagination | `schema/index.ts`, `services/index.ts`, `api/controllers/index.ts` |
| `service` | `contracts/<name>.ts` with an `<name>.execute` procedure, service, handler, test | `services/index.ts` |
| `controller` | `api/controllers/<name>.controller.ts`; reuses `contracts/<name>.ts` if it exists | `api/controllers/index.ts` |
| `job` | `jobs/<name>.job.ts` (`defineJob` with schema, retry, timeout) | `jobs/index.ts` |
| `integration` | `integrations/<name>/client.ts` (timeouts, retries on transient status codes, `IntegrationError`) and a test | none; construct it in `main.ts` |

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
| `.env` | There is none | Copies `.env.example`. An existing `.env` is never written |
| Services | The project has a Compose file, and its local Postgres or Redis isn't answering | `docker compose up -d`, then waits up to a minute for them. `--no-services` skips this |
| First migration | The schema has tables and the migrations folder is empty | Writes `drizzle/0000_init.sql`. Later schema changes are never turned into migrations here: it prints a note, and `mariachi db generate` stays a deliberate step |
| Migrate | Migrations are pending | Applies them |
| Run | Always | `tsx watch --env-file=.env src/main.ts` (`--entry <file>`, `--no-watch`) |

A database or Redis on another host is never started for you: `dev` says it can't reach it and stops.

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

A check that depends on one that failed is skipped, not failed twice. Passwords in URLs are shown
as `***`. `--strict` exits 1 on warnings too; `--timeout <ms>` sets how long to wait for a service.

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
`@mariachi/events/outbox`, or everything via `@mariachi/schema`).

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

