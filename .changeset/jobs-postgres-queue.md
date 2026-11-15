---
'@mariachi/jobs': minor
'@mariachi/schema': minor
---

A job queue in Postgres, so an app with background jobs doesn't need Redis.
`createPostgresJobQueue(database.db, config, logger)` from `@mariachi/jobs/postgres` is a backend for
`DefaultJobs` with the BullMQ adapter's semantics: retries with backoff, non-retryable codes,
deduplication by key, priorities, delays, cancel, a dead-letter list with replay, cron schedules
with timezones, progress, timeouts and hooks. Workers claim jobs with `FOR UPDATE SKIP LOCKED`, so
any number of processes share a queue; a worker renews its claim while a handler runs, and a job
whose worker died is taken over after `lockMs` (at-least-once delivery; one that never finishes is
dead-lettered as `jobs/stalled`). A job enqueued inside `withTransaction` commits or rolls back
with the business write. A schedule's tick is enqueued once however many workers are running. A
worker never claims a job it is still running (so a paused and resumed process doesn't run one
twice beside itself), and `reset()` lets a process copied while running abandon its inherited jobs.

Its tables, `jobsTable` and `jobSchedulesTable`, are in `@mariachi/jobs/schema` and `@mariachi/schema`.
`@mariachi/database-postgres` and `drizzle-orm` are optional peers of `@mariachi/jobs`, needed only for
this adapter. `createJobQueue({ adapter: 'postgres' })` points at the new factory.
