---
'@mariachi/create': patch
'@mariachi/cli': patch
'@mariachi/auth': patch
'@mariachi/jobs': patch
'@mariachi/search': patch
---

A new project needs only Postgres, starts with one command, and can be called right away.

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
