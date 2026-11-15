import { randomUUID } from 'node:crypto';
import cronParser from 'cron-parser';
import { and, desc, eq, notInArray, sql } from 'drizzle-orm';
import { JobsError, type Logger } from '@mariachi/core';
import { compileTable, currentTransaction, type DrizzleDb } from '@mariachi/database-postgres';
import { DEFAULT_RETRY, buildJobContext, isNonRetryable, priorityValue, retryDelay, runWithTimeout, unwrap, wrap, type WireJob } from '../envelope';
import type { JobBackend } from '../queue';
import { jobSchedulesTable, jobsTable } from '../schema';
import type {
  DeadLetterEntry,
  EnqueueOptions,
  JobCompletedListener,
  JobConfig,
  JobDefinition,
  JobFailureListener,
  JobQueue,
  JobScheduler,
  JobWorker,
  ScheduleDefinition,
} from '../types';

export { jobSchedulesTable, jobsTable } from '../schema';

const jobs = compileTable(jobsTable);
const schedules = compileTable(jobSchedulesTable);

/** Compiled Drizzle tables, for drizzle-kit schema files and custom queries. */
export const jobTables = { jobs, schedules };

export interface PostgresJobConfig extends Omit<JobConfig, 'adapter' | 'redisUrl' | 'keepCompleted' | 'keepFailed'> {
  /** How often an idle worker looks for work. A job enqueued in this process is picked up at once. Default 1000. */
  pollIntervalMs?: number;
  /**
   * How long a worker's claim on a job holds without being renewed. A running job renews it; if the
   * process dies, another worker takes the job over after this long. Default 30000.
   */
  lockMs?: number;
}

interface ClaimedRow {
  id: string;
  name: string;
  data: unknown;
  attempts: number;
}

const rows = <T>(result: unknown): T[] => (Array.isArray(result) ? (result as T[]) : (((result as { rows?: T[] } | undefined)?.rows ?? []) as T[]));
const json = (value: unknown): unknown => (typeof value === 'string' ? JSON.parse(value) : value);

function nextRun(cron: string, timezone: string | undefined, after: Date): Date {
  try {
    return cronParser.parseExpression(cron, { currentDate: after, tz: timezone }).next().toDate();
  } catch (error) {
    throw new JobsError('jobs/invalid-schedule', `Cron expression "${cron}" can't be read: ${(error as Error).message}`);
  }
}

/**
 * A job queue in Postgres: no Redis. The same semantics as the BullMQ adapter (retries with
 * backoff, deduplication by job id, priorities, delays, a dead-letter list, cron schedules), plus
 * one it can't offer: a job enqueued inside `withTransaction` commits or rolls back with the
 * business write.
 *
 * Workers claim jobs with `FOR UPDATE SKIP LOCKED`, so any number of processes share a queue. A
 * job runs at least once: if a process dies mid-job, its claim expires and another worker runs the
 * job again, counted as an attempt. Requires the tables from `@mariachi/jobs/schema`.
 */
export class PostgresJobAdapter implements JobQueue, JobWorker, JobScheduler {
  readonly queueName: string;
  /** This process's identity in the queue. Changes on `reset()`. */
  get workerId(): string {
    return this.worker;
  }
  private worker = randomUUID();
  /** Ids of the jobs whose handlers are running in this process right now. */
  private readonly live = new Set<string>();
  private readonly definitions = new Map<string, JobDefinition>();
  private readonly failedListeners: JobFailureListener[] = [];
  private readonly completedListeners: JobCompletedListener[] = [];
  private readonly localSchedules = new Map<string, ScheduleDefinition>();
  private readonly inflight = new Set<Promise<void>>();
  private abort = new AbortController();
  private running = false;
  private loop?: Promise<void>;
  private wakeUp?: () => void;
  private lastScheduleTick = 0;

  constructor(
    private readonly db: DrizzleDb,
    private readonly config: PostgresJobConfig,
    private readonly logger: Logger,
  ) {
    this.queueName = config.queue ?? `${config.prefix ?? 'mariachi'}-jobs`;
  }

  private get concurrency(): number {
    return Math.max(1, this.config.concurrency ?? 5);
  }
  private get pollMs(): number {
    return this.config.pollIntervalMs ?? 1000;
  }
  private get lockMs(): number {
    return this.config.lockMs ?? 30_000;
  }
  private own(id: string) {
    return and(eq(jobs.queue, this.queueName), eq(jobs.id, id));
  }
  async connect(): Promise<void> {}

  async disconnect(): Promise<void> {
    await this.stop();
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.db.execute(sql`select 1 from ${jobs} limit 1`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Adds a job. Inside `withTransaction` the job is part of that transaction: it exists only if the
   * transaction commits. A `jobId` that names a job still in the queue (waiting, running or
   * dead-lettered) is ignored.
   */
  async enqueue<T>(jobName: string, data: T, options: EnqueueOptions = {}): Promise<string> {
    const id = options.jobId ?? randomUUID();
    const delay = Math.max(0, Math.floor(options.delay ?? 0));
    await (currentTransaction() ?? this.db)
      .insert(jobs)
      .values({
        queue: this.queueName,
        id,
        name: jobName,
        data: wrap(data, options),
        priority: priorityValue(options.priority) ?? 3,
        runAt: sql`now() + ${delay} * interval '1 millisecond'`,
      })
      .onConflictDoNothing();
    if (delay === 0) this.wakeUp?.();
    return id;
  }

  async cancel(jobId: string): Promise<boolean> {
    const removed = await this.db.delete(jobs).where(and(this.own(jobId), eq(jobs.status, 'waiting'))).returning({ id: jobs.id });
    return removed.length > 0;
  }

  async listDeadLetters(limit = 100): Promise<DeadLetterEntry[]> {
    const found = await this.db
      .select()
      .from(jobs)
      .where(and(eq(jobs.queue, this.queueName), eq(jobs.status, 'dead')))
      .orderBy(desc(jobs.failedAt))
      .limit(limit);
    return found.map((row) => {
      const { payload, context } = unwrap(row.data);
      return {
        id: row.id,
        jobName: row.name,
        data: payload,
        context,
        error: (row.lastError as DeadLetterEntry['error'] | null) ?? { message: 'unknown' },
        attempts: row.attempts,
        failedAt: (row.failedAt ?? row.createdAt).toISOString(),
      };
    });
  }

  async retryDeadLetter(id: string): Promise<string> {
    const revived = await this.db
      .update(jobs)
      .set({ status: 'waiting', attempts: 0, runAt: sql`now()`, lockedBy: null, lockedUntil: null, failedAt: null, lastError: null })
      .where(and(this.own(id), eq(jobs.status, 'dead')))
      .returning({ id: jobs.id });
    if (!revived.length) throw new JobsError('jobs/dead-letter-not-found', `Dead letter ${id} not found`);
    this.wakeUp?.();
    return id;
  }

  registerJob<T>(definition: JobDefinition<T>): void {
    if (this.definitions.has(definition.name)) {
      throw new JobsError('jobs/duplicate-definition', `Job ${definition.name} is already registered`);
    }
    this.definitions.set(definition.name, definition as JobDefinition);
  }

  onFailed(listener: JobFailureListener): void {
    this.failedListeners.push(listener);
  }

  onCompleted(listener: JobCompletedListener): void {
    this.completedListeners.push(listener);
  }

  register(schedule: ScheduleDefinition): void {
    // Reads the expression now, so a bad one fails at registration and not at the first tick
    nextRun(schedule.cron, schedule.timezone, new Date());
    this.localSchedules.set(schedule.name, schedule);
  }

  async unregister(name: string): Promise<void> {
    this.localSchedules.delete(name);
    await this.db.delete(schedules).where(and(eq(schedules.queue, this.queueName), eq(schedules.name, name)));
  }

  async start(): Promise<void> {
    if (this.running) return;
    await this.syncSchedules();
    this.abort = new AbortController();
    this.running = true;
    this.loop = this.work();
  }

  /** Stops taking jobs and waits for the running ones, up to `shutdownTimeoutMs`. What's still running then goes back to the queue. */
  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;
    this.wakeUp?.();
    await this.loop;
    const timeout = this.config.shutdownTimeoutMs ?? 30_000;
    let timer: NodeJS.Timeout | undefined;
    const finished = await Promise.race([
      Promise.allSettled([...this.inflight]).then(() => true),
      new Promise<boolean>((resolve) => {
        timer = setTimeout(() => resolve(false), timeout);
      }),
    ]);
    if (timer) clearTimeout(timer);
    if (!finished) {
      this.abort.abort();
      // Hand back what didn't finish, without charging the attempt, so another worker takes it now
      await this.db
        .update(jobs)
        .set({ status: 'waiting', lockedBy: null, lockedUntil: null, runAt: sql`now()`, attempts: sql`greatest(${jobs.attempts} - 1, 0)` })
        .where(and(eq(jobs.queue, this.queueName), eq(jobs.lockedBy, this.worker), eq(jobs.status, 'active')));
      this.logger.warn({ queue: this.queueName, jobs: this.inflight.size }, 'job worker stopped with jobs still running; they were returned to the queue');
    }
  }

  /**
   * For a process that has been copied while running (a forked or cloned machine, with its memory
   * and its database): the copy holds the original's worker id and is mid-way through the same
   * jobs. Call this in the copy before it does anything else. It aborts the handlers running here
   * (`ctx.signal`), returns their jobs to the queue with the attempt uncharged, and takes a new
   * worker id. The worker keeps running. Jobs waiting in a copied database run in both copies:
   * nothing here can know the other exists.
   */
  async reset(): Promise<void> {
    const previous = this.worker;
    const abandoned = this.abort;
    this.worker = randomUUID();
    this.abort = new AbortController();
    abandoned.abort();
    await this.db
      .update(jobs)
      .set({ status: 'waiting', lockedBy: null, lockedUntil: null, runAt: sql`now()`, attempts: sql`greatest(${jobs.attempts} - 1, 0)` })
      .where(and(eq(jobs.queue, this.queueName), eq(jobs.lockedBy, previous), eq(jobs.status, 'active')));
    this.live.clear();
    this.wakeUp?.();
    this.logger.info({ queue: this.queueName, from: previous, to: this.worker }, 'job worker reset: its running jobs were returned to the queue and it has a new worker id');
  }

  /** Writes this process's schedules and removes the queue's others, as `JobScheduler.start` promises. */
  private async syncSchedules(): Promise<void> {
    const names = [...this.localSchedules.keys()];
    const stale = names.length
      ? and(eq(schedules.queue, this.queueName), notInArray(schedules.name, names))
      : eq(schedules.queue, this.queueName);
    await this.db.delete(schedules).where(stale);
    for (const s of this.localSchedules.values()) {
      const values = { cron: s.cron, timezone: s.timezone ?? null, jobName: s.jobName, data: (s.data ?? {}) as object };
      const existing = await this.db.select().from(schedules).where(and(eq(schedules.queue, this.queueName), eq(schedules.name, s.name)));
      const current = existing[0];
      if (!current) {
        await this.db
          .insert(schedules)
          .values({ queue: this.queueName, name: s.name, ...values, nextRunAt: nextRun(s.cron, s.timezone, new Date()) })
          .onConflictDoNothing();
      } else {
        // The next tick stands unless the timing changed: a restart doesn't skip or repeat a run
        const retimed = current.cron !== s.cron || (current.timezone ?? null) !== (s.timezone ?? null);
        await this.db
          .update(schedules)
          .set({ ...values, updatedAt: sql`now()`, ...(retimed ? { nextRunAt: nextRun(s.cron, s.timezone, new Date()) } : {}) })
          .where(and(eq(schedules.queue, this.queueName), eq(schedules.name, s.name)));
      }
    }
  }

  /**
   * Enqueues every schedule whose time has come. The job's id is the schedule and the tick, so two
   * processes ticking at once enqueue it once. Ticks missed while nothing was running are not replayed.
   */
  private async tickSchedules(): Promise<void> {
    await this.db.transaction(async (tx) => {
      const due = rows<{ name: string; cron: string; timezone: string | null; job_name: string; data: unknown; next_run_at: string | Date }>(
        await tx.execute(sql`select name, cron, timezone, job_name, data, next_run_at from ${schedules} where queue = ${this.queueName} and next_run_at <= now() for update skip locked`),
      );
      for (const s of due) {
        const tick = new Date(s.next_run_at);
        await tx
          .insert(jobs)
          .values({ queue: this.queueName, id: `schedule:${s.name}:${tick.toISOString()}`, name: s.job_name, data: wrap(json(s.data) ?? {}) })
          .onConflictDoNothing();
        await tx
          .update(schedules)
          .set({ nextRunAt: nextRun(s.cron, s.timezone ?? undefined, new Date(Math.max(tick.getTime(), Date.now()))) })
          .where(and(eq(schedules.queue, this.queueName), eq(schedules.name, s.name)));
      }
    });
  }

  /**
   * Takes up to `limit` jobs that are due, or whose worker's claim ran out, and marks them as this
   * worker's. Never a job this process is still running: after a pause (the machine slept, the
   * process was frozen and thawed) its own claims look lapsed, and the handler is still here.
   */
  private async claim(limit: number): Promise<ClaimedRow[]> {
    const running = [...this.live];
    const notRunningHere = running.length ? sql`and id not in (${sql.join(running.map((id) => sql`${id}`), sql`, `)})` : sql``;
    const result = await this.db.execute(sql`
      update ${jobs} set status = 'active', attempts = attempts + 1, locked_by = ${this.worker},
        locked_until = now() + ${this.lockMs} * interval '1 millisecond'
      where queue = ${this.queueName} and id in (
        select id from ${jobs}
        where queue = ${this.queueName}
          and ((status = 'waiting' and run_at <= now()) or (status = 'active' and locked_until < now() ${notRunningHere}))
        order by priority, run_at
        limit ${limit}
        for update skip locked
      )
      returning id, name, data, attempts`);
    return rows<ClaimedRow>(result).map((row) => ({ ...row, data: json(row.data), attempts: Number(row.attempts) }));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timer = setTimeout(done, ms);
      timer.unref?.();
      const self = this;
      function done() {
        clearTimeout(timer);
        if (self.wakeUp === done) self.wakeUp = undefined;
        resolve();
      }
      this.wakeUp = done;
    });
  }

  private async work(): Promise<void> {
    while (this.running) {
      let took = 0;
      try {
        if (this.localSchedules.size && Date.now() - this.lastScheduleTick >= Math.min(1000, this.pollMs)) {
          this.lastScheduleTick = Date.now();
          await this.tickSchedules();
        }
        const free = this.concurrency - this.inflight.size;
        if (free > 0) {
          const claimed = await this.claim(free);
          took = claimed.length;
          for (const row of claimed) {
            this.live.add(row.id);
            const run = this.run(row).finally(() => {
              this.live.delete(row.id);
              this.inflight.delete(run);
              this.wakeUp?.();
            });
            this.inflight.add(run);
          }
        }
      } catch (error) {
        this.logger.error({ err: error, queue: this.queueName }, 'job worker could not reach the queue');
      }
      // A full batch means there may be more: look again at once. Otherwise wait for the poll, an enqueue here, or a job finishing
      if (this.running && (took === 0 || this.inflight.size >= this.concurrency)) await this.sleep(this.pollMs);
    }
  }

  private async run(row: ClaimedRow): Promise<void> {
    // The claim this run was started under: after reset() these are no longer the adapter's, and the run is abandoned
    const worker = this.worker;
    const stopped = this.abort.signal;
    const mine = and(this.own(row.id), eq(jobs.lockedBy, worker));
    const definition = this.definitions.get(row.name);
    const retry = definition?.retry ?? this.config.defaultRetry ?? DEFAULT_RETRY;
    const { payload, context } = unwrap(row.data as WireJob);
    const startedAt = Date.now();
    // Keeps the claim while the handler runs; if this process dies the claim lapses and another worker takes over
    const renew = setInterval(() => {
      this.db
        .update(jobs)
        .set({ lockedUntil: sql`now() + ${this.lockMs} * interval '1 millisecond'` })
        .where(mine)
        .catch((err: unknown) => this.logger.warn({ err, jobId: row.id }, 'could not renew a job claim'));
    }, Math.max(250, Math.floor(this.lockMs / 3)));
    renew.unref?.();
    try {
      if (!definition) throw new JobsError('jobs/unknown-job', `No handler registered for job ${row.name}`);
      // Every earlier attempt ended without a result (the process died each time): don't run it again
      if (row.attempts > retry.attempts) throw new JobsError('jobs/stalled', `Job ${row.name} never finished in ${retry.attempts} attempt(s)`);
      const parsed = definition.schema.safeParse(payload);
      if (!parsed.success) throw new JobsError('jobs/invalid-payload', parsed.error.message);
      await runWithTimeout(
        (signal) =>
          definition.handler(
            buildJobContext({
              logger: this.logger,
              envelope: context,
              jobId: row.id,
              jobName: row.name,
              attemptNumber: row.attempts,
              maxAttempts: retry.attempts,
              signal,
              updateProgress: async (progress) => {
                await this.db.update(jobs).set({ progress: progress as object }).where(mine);
              },
            }),
            parsed.data,
          ),
        definition.timeoutMs,
        stopped,
      );
      clearInterval(renew);
      // Stopped or reset while it ran: the job has been handed back and will run again, so this run's end doesn't count
      if (stopped.aborted) return;
      const removed = await this.db.delete(jobs).where(mine).returning({ id: jobs.id });
      // The claim was no longer this run's (taken over after a long pause, or handed back): whoever holds it reports the outcome
      if (!removed.length) return;
      for (const l of this.completedListeners) {
        l({ jobId: row.id, jobName: row.name, attempts: row.attempts, durationMs: Date.now() - startedAt, context });
      }
    } catch (error) {
      clearInterval(renew);
      // Stopped or reset mid-job: the job was handed back, so this isn't a failure of the job
      if (stopped.aborted) return;
      const code = (error as { code?: string }).code;
      const final = !definition || isNonRetryable(definition, error) || code === 'jobs/unknown-job' || code === 'jobs/stalled' || row.attempts >= retry.attempts;
      const lastError = { message: (error as Error).message, code };
      try {
        let recorded: unknown[];
        if (!final) {
          const delay = Math.max(0, Math.floor(retryDelay(retry, row.attempts)));
          recorded = await this.db
            .update(jobs)
            .set({ status: 'waiting', lockedBy: null, lockedUntil: null, lastError, runAt: sql`now() + ${delay} * interval '1 millisecond'` })
            .where(mine)
            .returning({ id: jobs.id });
        } else if (this.config.deadLetter !== false) {
          recorded = await this.db
            .update(jobs)
            .set({ status: 'dead', lockedBy: null, lockedUntil: null, lastError, failedAt: sql`now()` })
            .where(mine)
            .returning({ id: jobs.id });
        } else {
          recorded = await this.db.delete(jobs).where(mine).returning({ id: jobs.id });
        }
        // The claim was no longer this run's: whoever holds it now reports the outcome
        if (!recorded.length) return;
      } catch (err) {
        // The claim lapses by itself, and the job is then taken again
        this.logger.error({ err, jobId: row.id }, 'could not record a job failure');
      }
      for (const l of this.failedListeners) l({ jobId: row.id, jobName: row.name, error: error as Error, attempts: row.attempts, final, context });
      if (final) this.logger.error({ jobId: row.id, jobName: row.name, err: error }, 'job failed permanently');
    }
  }
}

export interface ResetOnSignalOptions {
  /** Default `SIGUSR2`. */
  signal?: NodeJS.Signals;
  logger?: Logger;
}

/**
 * Calls `queue.reset()` when the process receives a signal, for a runtime that copies running
 * machines and can tell each copied process so (see `PostgresJobAdapter.reset`). Opt-in. A second
 * signal while a reset is under way waits for it and resets again, which finds nothing to return.
 * Returns a function that removes the handler.
 *
 * Once this is installed the process no longer exits on that signal. `nodemon` restarts a process
 * with `SIGUSR2` by default, so under it name another signal (or don't install this in development),
 * or restarts will hang.
 */
export function resetOnSignal(queue: Pick<PostgresJobAdapter, 'reset'>, options: ResetOnSignalOptions = {}): () => void {
  const signal = options.signal ?? 'SIGUSR2';
  let last: Promise<void> = Promise.resolve();
  const handler = () => {
    last = last
      .then(() => queue.reset())
      .catch((err: unknown) => options.logger?.error({ err, signal }, 'could not reset the job worker'));
  };
  process.on(signal, handler);
  return () => void process.off(signal, handler);
}

/** A Postgres-backed job queue for `new DefaultJobs({ queue })`. `db` is the app's Drizzle client. */
export function createPostgresJobQueue(db: DrizzleDb, config: PostgresJobConfig, logger: Logger): JobBackend {
  return new PostgresJobAdapter(db, config, logger);
}
