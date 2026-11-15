# Jobs

Background work in Postgres or on BullMQ (Redis), or in memory for tests. Use a job when work should
leave the request path, run later or on a schedule, or needs retries that survive a restart.

## Which queue

| | Postgres (`@mariachi/jobs/postgres`) | BullMQ (`createJobQueue({ adapter: 'bullmq' })`) |
| --- | --- | --- |
| Needs | The database the app already has | Redis |
| Enqueue inside `withTransaction` | Commits or rolls back with the business write | Not transactional: use the [outbox](./events.md) for that |
| Throughput | Plenty for most apps: workers poll (1 s by default; a job enqueued in the same process starts at once) | Higher, and push-based |
| Completed jobs | Deleted | Kept for inspection (`keepCompleted`) |

Start with Postgres: one service fewer to run, and a job can't be lost or orphaned by a rolled-back
request. Move to BullMQ when the queue's volume calls for it. Definitions, `enqueue`, retries, the
dead-letter list, schedules and hooks are the same on both.

```ts
import { createPostgresJobQueue } from '@mariachi/jobs/postgres';

const jobs = new DefaultJobs({ queue: createPostgresJobQueue(database.db, { prefix: config.serviceName }, logger) }, instrumentation);
```

It needs two tables. Export them from your schema so `mariachi db generate` writes the migration:

```ts
// src/schema/index.ts
export { jobsTable, jobSchedulesTable } from '@mariachi/jobs/schema';   // a worker started without them says so: jobs/tables-missing
```

Options: `queue` or `prefix` (workers with the same queue name share it), `concurrency` (5),
`pollIntervalMs` (1000), `lockMs` (30000), `defaultRetry`, `deadLetter`, `shutdownTimeoutMs`.

Any number of processes can work one queue: a job is claimed with `FOR UPDATE SKIP LOCKED`, and the
worker renews its claim while the handler runs. **A job runs at least once.** If a process dies
mid-job, the claim lapses after `lockMs` and another worker runs the job again, counted as an
attempt; a job that dies on every allowed attempt is dead-lettered as `jobs/stalled`. So handlers
must be safe to repeat: wrap side effects that must happen once with `runOnce`.

What to know when you run it:

- **Size the connection pool for both.** Claiming is one statement and holds no connection while
  handlers run, but handlers use the same pool as requests. `poolMax` should cover the worker's
  `concurrency` plus the request load.
- **A paused process is safe.** A machine that sleeps, or a process frozen and thawed, wakes to find
  its own claims lapsed. A worker never claims a job it is still running, so it doesn't start a
  second copy beside itself, and its next renewal re-asserts the claim. Every lock time is the
  database's `now()`, one clock for all workers. If another worker took the job over meanwhile, the
  job runs twice (at-least-once) and only the worker that holds the claim records the outcome.
- **A copied process needs telling.** If a running machine is cloned with its memory and its
  database (a fork, a snapshot restored beside the original), the copy has the same worker id and
  is mid-way through the same jobs. Call `queue.reset()` in the copy before it does anything else:
  it aborts the handlers running there (`ctx.signal`), returns their jobs to the copy's queue with
  the attempt uncharged, and takes a new worker id. `resetOnSignal(queue)` from
  `@mariachi/jobs/postgres` does that when the process receives `SIGUSR2` (or the signal you name),
  for a runtime that can signal the processes of a copy. A process with it installed no longer
  exits on that signal, so name another one under `nodemon`, which restarts with `SIGUSR2`. Mariachi can't know a copy exists, so anything
  waiting in a copied database, and every schedule, runs in both: side effects that leave the
  machine (email, webhooks, payments) happen twice unless the copy's queue is emptied or its
  handlers check where they are.

## Define and register

```ts
export const sendDigestJob = defineJob({
  name: 'send-digest',
  schema: z.object({ userId: z.string().uuid() }),
  retry: { attempts: 5, backoff: 'exponential', delay: 1_000 },
  timeoutMs: 60_000,
  nonRetryableCodes: ['users/not-found'],
  handler: async (ctx, data) => {
    // ctx: the enqueuer's traceId/tenantId/userId, plus jobId, attemptNumber, maxAttempts,
    // signal (aborted on timeout or shutdown) and updateProgress()
    await digests.send(ctx, data.userId);
  },
});

const jobs = new DefaultJobs({ queue: createPostgresJobQueue(database.db, { prefix: 'app' }, logger) }, instrumentation);
// or, on Redis: createJobQueue({ adapter: 'bullmq', redisUrl, prefix: 'app' }, logger)
jobs.registerJob(sendDigestJob);
lifecycle.manage('jobs', jobs);                        // connect/disconnect/health
lifecycle.startup.register({ name: 'jobs-worker', priority: 90, fn: () => jobs.start() }); // worker processes only
```

Generated projects list definitions in `src/jobs/index.ts` (`mariachi generate job <name>`).

## Enqueue

```ts
await jobs.enqueue(ctx, 'send-digest', { userId });                          // validated against the schema
await jobs.enqueue(ctx, 'send-digest', { userId }, { delay: 60_000, priority: 'high' });
await jobs.enqueueWithDedup(ctx, 'send-digest', { userId }, `digest:${userId}`); // no-op while one is pending
await jobs.cancel(ctx, jobId);                                               // waiting or delayed jobs only
```

The context is serialized into the job, so the handler logs with the same `traceId` and repositories
are scoped to the same tenant. Dedup keys may contain any characters (on BullMQ they're hashed into
a safe id). A key only dedups while the job still exists: waiting, delayed, running or
dead-lettered, and on BullMQ also while it's kept after completion. To guarantee a side effect
happens once, also wrap it with `runOnce`.

## Retries and the dead-letter queue

Attempts back off per `retry` (default 3 attempts, exponential from 1s). Errors whose `code` is in
`nonRetryableCodes` fail immediately. When attempts run out, the job moves to the dead-letter queue with
its data, context and last error (`deadLetter: true` by default).

```ts
const dead = await jobs.listDeadLetters(50);
await jobs.retryDeadLetter(dead[0].id);   // re-enqueues with the original context and removes the entry
```

## Hooks

Subclass `DefaultJobs` to observe outcomes. Hooks receive a context rebuilt from the job's envelope.

```ts
class AppJobs extends DefaultJobs {
  protected async onJobCompleted(ctx: Context, e: JobCompletedEvent) { /* e.durationMs, e.attempts */ }
  protected async onJobFailed(ctx: Context, e: JobFailureEvent) {
    if (e.final) await alerts.page(ctx, `${e.jobName} dead-lettered: ${e.error.message}`);
  }
}
```

Metrics: `jobs.enqueued`, `jobs.completed`, `jobs.retried`, `jobs.failed` (dead-lettered), `jobs.duration`.

## Schedules

```ts
jobs.schedule({ name: 'nightly-digest', cron: '0 6 * * *', timezone: 'Europe/Amsterdam', jobName: 'send-digest', data: {} });
await jobs.unschedule('nightly-digest');
```

Schedules are upserted when `start()` runs, and any schedule in the queue that this process didn't
register is removed. Removing a `schedule()` call from code therefore removes the schedule on the next deploy.
It also means every process that calls `start()` must register the full set of schedules; an API-only
process should not call `start()`.

On Postgres, each tick is enqueued once however many workers are running (the job's id is the
schedule and the tick's time), a restart keeps the next tick, and ticks missed while no worker was
running are not replayed.

## Shutdown

`disconnect()` stops taking new jobs and waits up to `shutdownTimeoutMs` (30s) for running ones to
finish. After that it aborts `ctx.signal` with `jobs/shutdown` and force-closes, and the interrupted
jobs are retried later. Handlers doing long work should check `ctx.signal`.
