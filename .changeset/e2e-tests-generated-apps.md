---
'@mariachi/create': minor
'@mariachi/testing': minor
---

A generated project can test itself end to end. Its wiring moves from `src/main.ts` into
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
