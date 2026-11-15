---
'@mariachi/cli': minor
---

`mariachi dev` and `mariachi doctor`. `dev` gets a project from a fresh checkout to running: it
copies `.env.example` to `.env` when there's none, starts the Compose services when the local
Postgres or Redis isn't answering and waits for them, writes the first migration when the schema has
tables and none exists, applies pending migrations, then runs the app with reload. It never writes an
existing `.env` and never generates a migration after the first. `doctor` checks Node, the installed
packages, `.env`, the configuration, the database, migrations (none, unapplied, or behind the
schema), Redis and the architecture rules, says what to run for each problem, and exits 1 when
something has to be fixed (`--json` for tools).
