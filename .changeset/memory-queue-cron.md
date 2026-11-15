---
'@mariachi/jobs': minor
---

The in-memory job queue runs cron schedules.

`MemoryJobAdapter` used to keep registered schedules and never run them. It now enqueues a
schedule's job at each of its times while the queue is started, in the schedule's timezone, and
follows a schedule that is replaced or removed. It runs in this process only, and a time that
passed while the queue was stopped is not made up. A cron expression it can't read is refused when
it is registered (`jobs/invalid-schedule`), as the Postgres queue does.
