import { randomUUID } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createContext, MariachiError, type Context, type Logger } from '@mariachi/core';
import { applySchema, createPostgresDatabase, withTransaction, type PostgresDatabase } from '@mariachi/database-postgres';
import { startPostgres, stopAll } from '../../../../test/setup';
import { createJobQueue, defineJob, Jobs, type JobCompletedEvent, type JobContext, type JobFailureEvent } from '../index';
import { jobSchedulesTable, jobsTable, jobTables, PostgresJobAdapter, type PostgresJobConfig } from './index';

const logger: Logger = { info() {}, warn() {}, error() {}, debug() {}, child: () => logger };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitFor(check: () => boolean | Promise<boolean>, timeoutMs = 15_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!(await check())) {
    if (Date.now() > deadline) throw new Error('timed out waiting for condition'); // mariachi-lint-ignore test helper
    await sleep(20);
  }
}

class HookedJobs extends Jobs {
  completed: Array<{ ctx: Context; e: JobCompletedEvent }> = [];
  failed: Array<{ ctx: Context; e: JobFailureEvent }> = [];
  protected override async onJobCompleted(ctx: Context, e: JobCompletedEvent) {
    this.completed.push({ ctx, e });
  }
  protected override async onJobFailed(ctx: Context, e: JobFailureEvent) {
    this.failed.push({ ctx, e });
  }
}

let database: PostgresDatabase;
const running: Jobs[] = [];
const ctx = createContext({ logger, traceId: 'trace-pg', tenantId: 't1', userId: 'u1', identityType: 'user' });

/** A queue of its own per test, so tests sharing the database don't take each other's jobs. */
function make(config: PostgresJobConfig = {}) {
  const queue = `q-${randomUUID()}`;
  const backend = new PostgresJobAdapter(database.db, { queue, pollIntervalMs: 25, defaultRetry: { attempts: 1, backoff: 'fixed', delay: 10 }, shutdownTimeoutMs: 2_000, ...config }, logger);
  const jobs = new HookedJobs({ queue: backend }, { logger });
  running.push(jobs);
  return { backend, jobs, queue };
}

const stored = (queue: string) => database.db.select().from(jobTables.jobs).where(eq(jobTables.jobs.queue, queue));

beforeAll(async () => {
  database = createPostgresDatabase({ url: await startPostgres() });
  await database.connect();
  await database.db.execute(sql`drop table if exists mariachi_jobs, mariachi_job_schedules`);
  await applySchema(database.db, [jobsTable, jobSchedulesTable]);
}, 180_000);

afterAll(async () => {
  await Promise.all(running.map((j) => j.disconnect().catch(() => undefined)));
  await database?.disconnect();
  await stopAll();
});

describe('Postgres job queue', () => {
  it('runs jobs with the enqueuing context, fires completion hooks, and deletes what completed', async () => {
    const { jobs, queue } = make();
    const seen: Array<{ ctx: JobContext; data: { to: string } }> = [];
    jobs.registerJob(defineJob({ name: 'email', schema: z.object({ to: z.string() }), handler: async (c, data) => void seen.push({ ctx: c, data }) }));
    await jobs.start();
    const id = await jobs.enqueue(ctx, 'email', { to: 'a@b.co' });
    await waitFor(() => seen.length === 1 && jobs.completed.length === 1);
    expect(seen[0]?.ctx).toMatchObject({ traceId: 'trace-pg', tenantId: 't1', userId: 'u1', attemptNumber: 1, jobId: id, jobName: 'email' });
    expect(seen[0]?.data).toEqual({ to: 'a@b.co' });
    expect(jobs.completed[0]?.ctx).toMatchObject({ traceId: 'trace-pg', tenantId: 't1' });
    expect(jobs.completed[0]?.e).toMatchObject({ jobId: id, jobName: 'email', attempts: 1 });
    await waitFor(async () => (await stored(queue)).length === 0);
  });

  it('refuses a payload the schema rules out at enqueue, before anything is stored', async () => {
    const { jobs, queue } = make();
    jobs.registerJob(defineJob({ name: 'email', schema: z.object({ to: z.string().email() }), handler: async () => {} }));
    await expect(jobs.enqueue(ctx, 'email', { to: 'nope' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    expect(await stored(queue)).toEqual([]);
  });

  it('retries with backoff, then dead-letters with the error code, and can replay', async () => {
    const { jobs } = make({ defaultRetry: { attempts: 3, backoff: 'fixed', delay: 20 } });
    let calls = 0;
    let healed = false;
    jobs.registerJob(
      defineJob({
        name: 'flaky',
        schema: z.object({ n: z.number() }),
        handler: async () => {
          calls++;
          if (!healed) throw new MariachiError('upstream/down', 'still down');
        },
      }),
    );
    await jobs.start();
    const id = await jobs.enqueue(ctx, 'flaky', { n: 1 });
    await waitFor(() => jobs.failed.some((f) => f.e.final));
    expect(calls).toBe(3);
    expect(jobs.failed.map((f) => [f.e.attempts, f.e.final])).toEqual([[1, false], [2, false], [3, true]]);
    expect(jobs.failed[2]?.ctx).toMatchObject({ traceId: 'trace-pg', tenantId: 't1' });

    const dead = await jobs.listDeadLetters();
    expect(dead).toHaveLength(1);
    expect(dead[0]).toMatchObject({ id, jobName: 'flaky', data: { n: 1 }, attempts: 3, error: { message: 'still down', code: 'upstream/down' }, context: { tenantId: 't1', traceId: 'trace-pg' } });

    healed = true;
    expect(await jobs.retryDeadLetter(id)).toBe(id);
    await waitFor(() => jobs.completed.length === 1);
    expect(calls).toBe(4);
    expect(await jobs.listDeadLetters()).toEqual([]);
    await expect(jobs.retryDeadLetter(id)).rejects.toMatchObject({ code: 'jobs/dead-letter-not-found' });
  });

  it('skips retries for non-retryable codes, an unknown job and a bad stored payload', async () => {
    const { jobs, backend } = make({ defaultRetry: { attempts: 5, backoff: 'fixed', delay: 10 } });
    let calls = 0;
    jobs.registerJob(
      defineJob({
        name: 'charge',
        schema: z.object({ amount: z.number() }),
        nonRetryableCodes: ['billing/card-declined'],
        handler: async () => {
          calls++;
          throw new MariachiError('billing/card-declined', 'declined');
        },
      }),
    );
    await jobs.start();
    await jobs.enqueue(ctx, 'charge', { amount: 5 });
    // Straight to the backend, past the facade's check: what another version of the app might have enqueued
    await backend.enqueue('charge', { amount: 'five' });
    await backend.enqueue('no-such-job', {});
    await waitFor(() => jobs.failed.filter((f) => f.e.final).length === 3);
    expect(calls).toBe(1);
    expect(jobs.failed.every((f) => f.e.attempts === 1 && f.e.final)).toBe(true);
    expect((await jobs.listDeadLetters()).map((d) => d.error.code).sort()).toEqual(['billing/card-declined', 'jobs/invalid-payload', 'jobs/unknown-job']);
  });

  it('deduplicates by dedupKey while the job is in the queue', async () => {
    const { jobs, queue } = make();
    let runs = 0;
    jobs.registerJob(defineJob({ name: 'digest', schema: z.object({}), handler: async () => void runs++ }));
    const first = await jobs.enqueue(ctx, 'digest', {}, { dedupKey: 'digest:2026-11-15' });
    const second = await jobs.enqueue(ctx, 'digest', {}, { dedupKey: 'digest:2026-11-15' });
    expect(second).toBe(first);
    expect(await stored(queue)).toHaveLength(1);
    await jobs.start();
    await waitFor(() => jobs.completed.length === 1);
    await sleep(100);
    expect(runs).toBe(1);
    // Done and gone, so the key is free again
    await jobs.enqueue(ctx, 'digest', {}, { dedupKey: 'digest:2026-11-15' });
    await waitFor(() => runs === 2);
  });

  it('runs a delayed job no sooner than its delay, higher priority first, and cancels what has not started', async () => {
    const { jobs } = make({ concurrency: 1 });
    const order: string[] = [];
    jobs.registerJob(defineJob({ name: 'step', schema: z.object({ label: z.string() }), handler: async (_c, data) => void order.push(data.label) }));
    const enqueuedAt = Date.now();
    await jobs.enqueue(ctx, 'step', { label: 'low' }, { priority: 'low' });
    await jobs.enqueue(ctx, 'step', { label: 'normal' });
    await jobs.enqueue(ctx, 'step', { label: 'critical' }, { priority: 'critical' });
    await jobs.enqueue(ctx, 'step', { label: 'later' }, { delay: 400, priority: 'critical' });
    const cancelled = await jobs.enqueue(ctx, 'step', { label: 'cancelled' }, { delay: 300 });
    expect(await jobs.cancel(ctx, cancelled)).toBe(true);
    expect(await jobs.cancel(ctx, cancelled)).toBe(false);
    await jobs.start();
    await waitFor(() => order.length === 4);
    expect(order).toEqual(['critical', 'normal', 'low', 'later']);
    expect(Date.now() - enqueuedAt).toBeGreaterThanOrEqual(400);
  });

  it('commits or rolls back an enqueue with the transaction it is made in', async () => {
    const { jobs, queue } = make();
    const ran: string[] = [];
    jobs.registerJob(defineJob({ name: 'welcome', schema: z.object({ user: z.string() }), handler: async (_c, data) => void ran.push(data.user) }));
    await jobs.start();

    await expect(
      withTransaction(database.db, ctx, async () => {
        await jobs.enqueue(ctx, 'welcome', { user: 'rolled-back' });
        throw new MariachiError('signup/failed', 'the business write failed');
      }),
    ).rejects.toMatchObject({ code: 'signup/failed' });
    await withTransaction(database.db, ctx, async () => {
      await jobs.enqueue(ctx, 'welcome', { user: 'committed' });
      // Not visible to the worker until the commit
      await sleep(120);
      expect(ran).toEqual([]);
    });
    await waitFor(() => ran.length === 1);
    await sleep(120);
    expect(ran).toEqual(['committed']);
    expect(await stored(queue)).toEqual([]);
  });

  it('shares a queue between workers: every job runs once', async () => {
    const queue = `q-${randomUUID()}`;
    const ran: number[] = [];
    const workers = [0, 1, 2].map(() => {
      const backend = new PostgresJobAdapter(database.db, { queue, pollIntervalMs: 20, concurrency: 4, shutdownTimeoutMs: 2_000 }, logger);
      const jobs = new HookedJobs({ queue: backend }, { logger });
      jobs.registerJob(
        defineJob({
          name: 'count',
          schema: z.object({ n: z.number() }),
          handler: async (_c, data) => {
            await sleep(5);
            ran.push(data.n);
          },
        }),
      );
      running.push(jobs);
      return jobs;
    });
    for (let n = 0; n < 60; n++) await workers[0]?.enqueue(ctx, 'count', { n });
    await Promise.all(workers.map((w) => w.start()));
    await waitFor(() => ran.length >= 60);
    await sleep(150);
    expect([...ran].sort((a, b) => a - b)).toEqual(Array.from({ length: 60 }, (_, n) => n));
    // The work was shared, not done by one
    expect(workers.filter((w) => w.completed.length > 0).length).toBeGreaterThan(1);
  });

  it('takes over a job whose worker died, counts the attempt, and gives up on one that never finishes', async () => {
    const { jobs, queue } = make({ lockMs: 150, defaultRetry: { attempts: 2, backoff: 'fixed', delay: 10 } });
    const attempts: number[] = [];
    jobs.registerJob(defineJob({ name: 'report', schema: z.object({}), handler: async (c) => void attempts.push(c.attemptNumber) }));
    // A job another process claimed and then died with: active, its claim already lapsed, one attempt used
    const values = { queue, name: 'report', data: { __mariachi: { v: 1 }, payload: {} }, status: 'active', lockedBy: 'a-dead-worker', lockedUntil: new Date(Date.now() - 1000) };
    await database.db.insert(jobTables.jobs).values([
      { ...values, id: 'orphan', attempts: 1 },
      // This one has died on every attempt it was allowed
      { ...values, id: 'poison', attempts: 2 },
      // Still held by a live worker: not to be touched
      { ...values, id: 'held', attempts: 1, lockedBy: 'a-live-worker', lockedUntil: new Date(Date.now() + 60_000) },
    ]);
    await jobs.start();
    await waitFor(() => jobs.completed.length === 1 && jobs.failed.length === 1);
    expect(attempts).toEqual([2]);
    expect(jobs.completed[0]?.e).toMatchObject({ jobId: 'orphan', attempts: 2 });
    expect(jobs.failed[0]?.e).toMatchObject({ jobId: 'poison', final: true });
    expect((await jobs.listDeadLetters())[0]).toMatchObject({ id: 'poison', error: { code: 'jobs/stalled' } });
    const held = await database.db.select().from(jobTables.jobs).where(and(eq(jobTables.jobs.queue, queue), eq(jobTables.jobs.id, 'held')));
    expect(held[0]).toMatchObject({ status: 'active', lockedBy: 'a-live-worker', attempts: 1 });
  });

  it('keeps its claim on a job that runs longer than the lock, and records progress', async () => {
    const { jobs, queue } = make({ lockMs: 300 });
    let runs = 0;
    jobs.registerJob(
      defineJob({
        name: 'long',
        schema: z.object({}),
        handler: async (c) => {
          runs++;
          await c.updateProgress({ step: 1 });
          await sleep(900);
        },
      }),
    );
    // A second worker on the same queue would take the job if the claim lapsed
    const other = new PostgresJobAdapter(database.db, { queue, pollIntervalMs: 25, lockMs: 300 }, logger);
    const otherJobs = new HookedJobs({ queue: other }, { logger });
    otherJobs.registerJob(defineJob({ name: 'long', schema: z.object({}), handler: async () => void runs++ }));
    running.push(otherJobs);
    await jobs.start();
    await jobs.enqueue(ctx, 'long', {});
    await waitFor(async () => (await stored(queue))[0]?.status === 'active');
    await otherJobs.start();
    await waitFor(async () => ((await stored(queue))[0]?.progress as { step?: number } | null)?.step === 1);
    await waitFor(() => jobs.completed.length === 1);
    expect(runs).toBe(1);
    expect(otherJobs.completed).toEqual([]);
  });

  it('fails an attempt that runs past its timeout, and tells the handler through its signal', async () => {
    const { jobs } = make();
    let aborted = false;
    jobs.registerJob(
      defineJob({
        name: 'slow',
        schema: z.object({}),
        timeoutMs: 80,
        handler: async (c) => {
          c.signal.addEventListener('abort', () => {
            aborted = true;
          });
          await sleep(2_000);
        },
      }),
    );
    await jobs.start();
    await jobs.enqueue(ctx, 'slow', {});
    await waitFor(() => jobs.failed.length === 1);
    expect(jobs.failed[0]?.e).toMatchObject({ final: true, error: { code: 'jobs/timeout' } });
    expect(aborted).toBe(true);
  });

  it('returns a job to the queue, attempt uncharged, when the worker stops before it finishes', async () => {
    const { jobs, queue } = make({ shutdownTimeoutMs: 100 });
    let started = 0;
    jobs.registerJob(
      defineJob({
        name: 'long',
        schema: z.object({}),
        handler: async () => {
          started++;
          await sleep(1_500);
        },
      }),
    );
    await jobs.start();
    await jobs.enqueue(ctx, 'long', {});
    await waitFor(() => started === 1);
    await jobs.stop();
    expect((await stored(queue))[0]).toMatchObject({ status: 'waiting', lockedBy: null, attempts: 0 });
    expect(jobs.failed).toEqual([]);
  });

  it('enqueues a cron schedule once per tick however many workers tick, and prunes and unschedules', async () => {
    const queue = `q-${randomUUID()}`;
    const fired: string[] = [];
    const worker = () => {
      const backend = new PostgresJobAdapter(database.db, { queue, pollIntervalMs: 25 }, logger);
      const jobs = new HookedJobs({ queue: backend }, { logger });
      jobs.registerJob(defineJob({ name: 'tick', schema: z.object({ from: z.string() }), handler: async (c, data) => void fired.push(`${data.from}:${c.jobId}`) }));
      running.push(jobs);
      return jobs;
    };
    const a = worker();
    const b = worker();
    for (const jobs of [a, b]) jobs.schedule({ name: 'every-second', cron: '* * * * * *', jobName: 'tick', data: { from: 'cron' } });
    await database.db.insert(jobTables.schedules).values({ queue, name: 'left-by-an-old-version', cron: '0 0 * * *', jobName: 'tick', nextRunAt: new Date(Date.now() + 86_400_000) });
    await Promise.all([a.start(), b.start()]);
    const names = async () => (await database.db.select().from(jobTables.schedules).where(eq(jobTables.schedules.queue, queue))).map((s) => s.name);
    expect(await names()).toEqual(['every-second']);

    await waitFor(() => fired.length >= 2, 6_000);
    await sleep(200);
    // One job per tick: its id is the schedule and the tick's time
    expect(new Set(fired).size).toBe(fired.length);
    for (const entry of fired) expect(entry).toMatch(/^cron:schedule:every-second:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000Z$/);

    await a.unschedule('every-second');
    expect(await names()).toEqual([]);
    const before = fired.length;
    await sleep(1_300);
    expect(fired.length).toBeLessThanOrEqual(before + 1);
  });

  it('keeps a schedule\'s next tick across a restart, and re-times it when the cron changes', async () => {
    const queue = `q-${randomUUID()}`;
    const start = async (cron: string) => {
      const backend = new PostgresJobAdapter(database.db, { queue, pollIntervalMs: 25 }, logger);
      const jobs = new HookedJobs({ queue: backend }, { logger });
      jobs.schedule({ name: 'nightly', cron, jobName: 'tick', timezone: 'Europe/Berlin' });
      running.push(jobs);
      await jobs.start();
      const [row] = await database.db.select().from(jobTables.schedules).where(eq(jobTables.schedules.queue, queue));
      await jobs.stop();
      return row;
    };
    const first = await start('0 3 * * *');
    expect(first?.timezone).toBe('Europe/Berlin');
    expect(first?.nextRunAt.getTime()).toBeGreaterThan(Date.now());
    const again = await start('0 3 * * *');
    expect(again?.nextRunAt.getTime()).toBe(first?.nextRunAt.getTime());
    const moved = await start('30 4 * * *');
    expect(moved?.nextRunAt.getTime()).not.toBe(first?.nextRunAt.getTime());
    expect(moved?.cron).toBe('30 4 * * *');
  });

  it('refuses a cron expression it cannot read at registration, and points createJobQueue at the right factory', () => {
    const { jobs } = make();
    expect(() => jobs.schedule({ name: 'bad', cron: 'every tuesday', jobName: 'tick' })).toThrowError(expect.objectContaining({ code: 'jobs/invalid-schedule' }));
    expect(() => createJobQueue({ adapter: 'postgres' }, logger)).toThrowError(expect.objectContaining({ code: 'jobs/postgres-needs-database' }));
  });

  it('reports healthy while the table is reachable, and unhealthy when the database is not', async () => {
    const { jobs } = make();
    expect(await jobs.isHealthy()).toBe(true);
    const down = { execute: async () => Promise.reject(new MariachiError('database/down', 'connection refused')) };
    expect(await new PostgresJobAdapter(down as never, {}, logger).isHealthy()).toBe(false);
  });
});
