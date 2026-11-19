---
'@mariachi/cli': minor
'@mariachi/core': minor
---

`mariachi list` says what an app exposes without starting it: `mariachi list routes`, `procedures`
or `jobs`, or all three, as a table or with `--json`.

- Routes: method, full path, auth (the route's own or the server's default, its tenant rule and
  scopes), the procedure its handler calls, and the controller and `file:line` that declares it.
  The server's own routes (health, OpenAPI, static files) are listed too.
- Procedures: input and output as one TypeScript-like line, where each is registered, and which
  routes call it.
- Jobs: payload, retries, timeout, where each is defined, and its `jobs.schedule()` cron schedules.

It reads the app's real registrations: it loads `src/api/controllers/index.ts`,
`src/services/index.ts`, `src/organizations.ts` and `src/jobs/index.ts` with a communication layer
that only records and dependencies that do nothing, so nothing connects anywhere. `src/app.ts` is
never run; its API prefix, default auth and schedules are read from its source. It reports a route
calling a procedure nothing registers, a procedure registered twice, a schedule for a missing job,
and a module that failed to load (exit 1). `typescript` is now a dependency of the CLI.

The docs (`cli.md`, `ai-guide.md`) describe it.
