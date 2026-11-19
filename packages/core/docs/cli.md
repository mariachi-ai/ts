# CLI

`@mariachi/cli` installs the `mariachi` binary (`init`, `generate`, `validate`, `list`, `db`, `design`, `explore`). It loads `./.env` when present; variables already set
in the environment win.

## init

```bash
npx @mariachi/cli init my-app            # --name <pkg>, --no-example, --no-e2e, --mariachi-version <range>, --auth jwt|gotrue, --orgs, --ui
```

Creates the [project layout](./architecture.md#project-layout): `src/app.ts` (`createApp()`: config, lifecycle,
Postgres, jobs, search, communication, API server with JWT auth, health and OpenAPI), a `src/main.ts`
that starts it, registry files, `docker-compose.yml` (Postgres), `.env.example`,
`vitest.config.ts`, end-to-end test support (`pnpm test:e2e`, see [testing.md](./testing.md#end-to-end-tests)),
`AGENTS.md`, and an example `note` entity wired end to end. Dependencies are pinned to the framework version that generated the
project. The directory must be empty or not exist.

**Postgres is the only service a new project needs.** Jobs run in it (`@mariachi/jobs/postgres`,
so a job enqueued in a transaction commits with the write) and so does search
(`@mariachi/search/postgres`, tenant-scoped: `deps.search` in a service sees only the documents of
`ctx.tenantId`; the indexes are listed in `src/search/index.ts`). Set `REDIS_URL` and jobs run on
Redis (BullMQ) instead. The project's `pnpm dev` is [`mariachi dev`](#dev), so after `pnpm install`
that one command is the whole setup, and [`mariachi token`](#token) signs a token to call the API
with.

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
carries the token. The link carries the token in its fragment (`#token=`), which reaches no server
log. With `--auth gotrue`, whether an invitee's address is verified is read from the user's record
(`AUTH_SERVICE_KEY`) or from a claim your own token hook adds (`AUTH_EMAIL_VERIFIED_CLAIM=required`
then needs no key), never from what the user can edit. The page that accepts an invitation is yours
to build.

`--ui` adds pages, sent by the same server as the API and styled with `@mariachi/design`
([design.md](./design.md)). The project gets a layout and a home page (`src/api/pages/`), a
controller that gives each page a route at the server's root (`src/api/controllers/pages.controller.ts`),
`public/` for the files pages load (served under `/assets`), the design library's stylesheets under
`/assets/design`, and tests. A page is a function that returns `html`, which escapes what is put
into it ([http.md](./http.md#pages-and-files)); its script, if it has one, is a file in `public/`.
There is no client framework and no build step. `mariachi generate page <name>` adds a page. It
works with either `--auth` and with `--orgs`.

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
| `seed` | `seeds/<name>.seed.ts` (`defineSeed`, run once per database by `mariachi db seed`) | `seeds/index.ts` |
| `page` | `api/pages/<name>.ts` (the page, as `html` in the project's layout) and a test. Needs a project made with `--ui` | `api/controllers/pages.controller.ts` (its route at `/<name>`) and `api/pages/layout.ts` (its link in the bar) |

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

## token

```bash
mariachi token                                         # user dev-user in tenant dev-tenant, good for an hour
mariachi token --user ada --tenant acme --role admin --scope notes:read --expires 7d
mariachi token --user ada --no-tenant --email ada@example.com
curl -H "authorization: Bearer $(pnpm -s mariachi token)" localhost:3000/api/notes
```

Signs a token the project's API accepts, for calling it in development as any user. It signs with
the project's own `JWT_SECRET` (and `JWT_ISSUER` and `JWT_AUDIENCE` when set), read from its env
files like every other command, so it is for projects that verify HS256 tokens: the default
`--auth jwt`. The token alone goes to stdout; who it is for goes to stderr.

- `--no-tenant` names no tenant: a user in no organization, which is what a project made with
  `--orgs` expects (there the request names the organization, in `x-organization-id`).
- `--email` adds the address and marks it verified. You are vouching for it: that is what lets the
  user accept an invitation sent to that address.
- It does nothing when `NODE_ENV` is `production`. It gives no access the secret doesn't already
  give; in production, tokens come from wherever your users sign in.
- **Never point it at a deployed app's secret.** A token signed with it is a real sign-in as anyone,
  with no record of who made it. Keep a development secret in `.env` and the real one out of reach.
- **In your own code, never sign `email_verified: true` because a request said so.** Sign it only
  after you have confirmed the address yourself: it is what lets someone accept an invitation.

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

## list

```bash
mariachi list                   # routes, procedures and jobs
mariachi list routes            # or: procedures, jobs
mariachi list procedures --json # { version, root, procedures: [...], issues: [...] }
mariachi list -C path/to/app
```

Says what the app exposes without reading every file or starting it: each HTTP route with its
method, full path, auth and the procedure its handler calls; each procedure with its input and
output, where it is registered and which routes call it; each job with its payload, retries,
timeout and cron schedules. Every entry says where it is written (`file:line`), so the next thing
to open is on the line.

```
Routes (9)
GET     /api/health/live     public   (health)      src/app.ts:120
...
POST    /api/notes           session  notes.create  NotesController src/api/controllers/notes.controller.ts:19
GET     /api/notes/:id       session  notes.get     NotesController src/api/controllers/notes.controller.ts:29
...

Procedures (5)
notes.create  src/services/notes/notes.handler.ts:14  ← POST /api/notes
  in  { name: string }
  out { id: uuid, name: string, createdAt: date, updatedAt: date }
...

Jobs (1)
send-digest  src/jobs/send-digest.job.ts:10  5 attempts, exponential from 1s; timeout 60s
  payload  { id: string }
  schedule 0 6 * * * Europe/Amsterdam (nightly-digest)  src/app.ts:98
```

**Where it looks.** It reads the app's own registrations, not a search of its text. It loads the
modules the generated layout keeps its wiring in, as `mariachi db` loads the schema, and calls them
with a communication layer that only notes what is registered and dependencies that do nothing:

| Section | Loaded from | What it reads |
| --- | --- | --- |
| Routes | `src/api/controllers/index.ts` | `createControllers(communication)`, then each controller's `routes()` |
| Procedures | `src/services/index.ts`, `src/organizations.ts` (`--orgs`) | what `registerServices(communication, deps)` and `setupOrganizations(deps)` register |
| Jobs | `src/jobs/index.ts` | the `jobs` array |

The composition root, `src/app.ts`, and `main.ts` are never run, so nothing connects to a database,
a queue or the network, and no setting is needed. What only exists once the app runs is read from
`src/app.ts`'s source with the TypeScript parser: the API prefix (`createApiServer({ prefix })`),
the default auth (`.withAuth(...)`), and the routes the server adds itself (`withHealth`,
`withOpenApi`, `withStatic`). Cron schedules are the `jobs.schedule({ cron, jobName })` calls
anywhere in `src`. A value held in a variable shows as its source in angle brackets
(`<config.prefix>`).

- **Auth** is the route's own `auth`, or else the server's default: `public` for none, strategies
  joined with `|`, and `tenant optional` or the scopes when the route sets them.
- **The procedure a route calls** is read from its handler's code (`this.call(ctx, 'notes.create', ...)`).
  A name built at run time is shown as written (`organizations.${action}`).
- **Schemas** are summed up in one line, TypeScript-like: `?` marks a key the input may leave out
  (optional or defaulted), and objects more than three levels down are `{…}`.
- **What it misses**: a controller registered in `src/app.ts` rather than through
  `createControllers`, procedures registered anywhere but the two files above, and a schedule whose
  arguments aren't an object literal.
- **Issues** follow the list: `cli/list-load-failed` (an error: a module could not be loaded or its
  registration threw, and what it registers is missing), `cli/duplicate-procedure` (an error: the app
  would stop at startup), `cli/unknown-procedure` (a route calls a procedure nothing registers) and
  `cli/unknown-job` (a schedule names a job `src/jobs/index.ts` doesn't have). It exits 1 on an
  error.
- Keep the top level of those modules free of side effects, as the layout already asks: loading
  them runs it.
- `--json`'s `version` changes if the shape does. Each route is `{ method, path, auth, defaultAuth,
  tenant?, scopes, procedures, controller, kind, location?, summary?, schema: { params?, query?,
  body?, response? } }`, each procedure `{ name, input?, output?, service?, location?, calledBy }`
  and each job `{ name, payload?, retry?, timeoutMs?, nonRetryableCodes?, schedules, location? }`.

## docs

```bash
mariachi docs                              # the list: every doc, by group, with a line about it
mariachi docs jobs                         # one doc
mariachi docs http#pages-and-files         # one section (or: mariachi docs http --section "pages and files")
mariachi docs --search idempotency key     # the lines that have every word, in every doc that has one
mariachi docs jobs --search retry          # the same, in one doc
mariachi docs recipes                      # a group's list
mariachi docs jobs --path                  # where the file is
```

Reads the framework's docs from the terminal, so a person or a coding agent can find the rule or
the recipe without opening `node_modules`. In a project it reads the docs of the `@mariachi/core`
that project has installed, so they match the version in use; anywhere else, the ones the CLI came
with.

- A doc is named by its path without `.md` (`recipes/add-domain-entity`), by its last part
  (`add-domain-entity`), or by the start of either when only one doc fits.
- A section is named by its heading, in any case, its slug (`pages-and-files`), or the start of it.
  It runs to the next heading of the same level.
- **A search shows every doc that has a matching line**, with its first five and how many more it
  has, so a common word can't push the doc you want out of the answer. Docs come likeliest first:
  one named for a word, then one with a word in a heading, then the rest, with the generated
  catalogs last. Each line starts with what to read next (`storage#browser-uploads-and-downloads:55`
  is `mariachi docs storage#browser-uploads-and-downloads`). A quoted phrase is its words:
  `--search "tables missing"` and `--search tables missing` are the same search. A word matches
  inside longer words (`auth` finds `authenticate`). A doc named before `--search` limits the
  search to it.
- **A name that isn't a doc** gets the lines that mention it, in the same form, and exit code 1. A
  group's name (`recipes`, `guides`) gets that group's list.
- `--json` gives the list (`{ dir, docs }`), a doc (`{ name, file, section, summary, text }`) or the
  search (`{ words, total, docs: [{ name, file, total, matches: [{ ref, line, heading, text }] }] }`)
  to a tool.
- The list is `llms.txt`, in the docs folder: an index of the docs in the
  [llms.txt](https://llmstxt.org) format, generated from this folder's README by `pnpm docs:catalog`
  and checked by `pnpm docs:check`. A tool that reads that format can be pointed at
  `node_modules/@mariachi/core/docs/llms.txt`.

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
| `db seed` | Runs `defineSeed` seeds from `src/seeds/index.ts` (`--file`), each in a transaction. A seed runs once per database and is recorded there; `--force` re-runs. The environment it runs as is `--env`, else `NODE_ENV`, else `development`: a seed with no `environments` runs as anything but `production`. It prints the database and the environment before it runs, and refuses a database on another host (a name with a dot, or an address) when it would run as `development` without `--env` saying so (`cli/seed-target-unclear`). A host without a dot is taken as a local service, as a Unix socket is. A URL with no host reaches its `host=` parameter, else `PGHOST`, else this machine, and that host is the one checked. |

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
| `design add <kit> [--dir src/design] [--force] [--dry-run] [--json]` | Copies a design language or plain preset into the project as its own: the kit's files in `<dir>`, exactly as built, and `design.css` beside it, once. Reports an edited copy and exits 1 unless `--force`. Needs `@mariachi/design-kits`. See [design.md](design.md#copying-a-language-into-a-project-kits). |
| `design list [--kits] [--json]` | Presets and components, and the kits `design add` can copy in. |

## explore

```bash
mariachi explore [--port 4321] [--host 127.0.0.1] [--open]
```

Serves the [explorer](./explorer.md) for the installed Mariachi version. Needs `@mariachi/explorer`
(`pnpm add -D @mariachi/explorer`).

