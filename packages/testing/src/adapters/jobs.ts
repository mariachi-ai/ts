import { JobsError, createContext, type Logger } from '@mariachi/core';
import type { EnqueueOptions, JobContext, JobDefinition, JobQueue, JobScheduler, JobWorker, JobCompletedListener, JobFailureListener, ScheduleDefinition } from '@mariachi/jobs';

const silent: Logger = {
  info() {},
  warn() {},
  error() {},
  debug() {},
  child() { return silent; },
};

export interface EnqueuedJob<T = unknown> {
  id: string;
  name: string;
  data: T;
  options?: EnqueueOptions;
}

/**
 * A job queue for tests: `enqueue` records, `drain()` runs what was queued through the registered
 * handlers. It is a full `JobBackend`, so `new DefaultJobs({ queue: new TestJobQueue() })` works,
 * schedules included: nothing fires on a clock, and `runSchedule(name)` enqueues a schedule's job
 * the way its cron tick would.
 */
export class TestJobQueue implements JobQueue, JobWorker, JobScheduler {
  private readonly jobs: EnqueuedJob[] = [];
  private readonly schedules = new Map<string, ScheduleDefinition>();
  private readonly definitions = new Map<string, JobDefinition>();
  private readonly failed: JobFailureListener[] = [];
  private readonly completed: JobCompletedListener[] = [];

  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}
  async isHealthy(): Promise<boolean> { return true; }

  async enqueue<T>(jobName: string, data: T, options?: EnqueueOptions): Promise<string> {
    if (options?.jobId && this.jobs.some((job) => job.id === options.jobId)) return options.jobId;
    const id = options?.jobId ?? crypto.randomUUID();
    this.jobs.push({ id, name: jobName, data, options });
    return id;
  }

  async cancel(jobId: string): Promise<boolean> {
    const index = this.jobs.findIndex((job) => job.id === jobId);
    if (index === -1) return false;
    this.jobs.splice(index, 1);
    return true;
  }

  async listDeadLetters(): Promise<never[]> { return []; }
  async retryDeadLetter(id: string): Promise<string> { return id; }

  registerJob<T>(definition: JobDefinition<T>): void {
    this.definitions.set(definition.name, definition as JobDefinition);
  }

  onFailed(listener: JobFailureListener): void { this.failed.push(listener); }
  onCompleted(listener: JobCompletedListener): void { this.completed.push(listener); }

  async start(): Promise<void> { await this.drain(); }
  async stop(): Promise<void> {}

  register(schedule: ScheduleDefinition): void {
    this.schedules.set(schedule.name, schedule);
  }

  async unregister(name: string): Promise<void> {
    this.schedules.delete(name);
  }

  /** The cron schedules registered, by name. */
  getSchedules(): ScheduleDefinition[] {
    return [...this.schedules.values()];
  }

  /** Enqueues a schedule's job with its data, as one tick of its cron would. Returns the job id. */
  async runSchedule(name: string): Promise<string> {
    const schedule = this.schedules.get(name);
    if (!schedule) throw new JobsError('jobs/unknown-schedule', `No schedule named ${name} is registered`);
    return this.enqueue(schedule.jobName, schedule.data ?? {});
  }

  getEnqueuedJobs<T = unknown>(): EnqueuedJob<T>[] {
    return [...this.jobs] as EnqueuedJob<T>[];
  }

  /** Runs every queued job through its registered handler. */
  async drain(): Promise<void> {
    while (this.jobs.length > 0) {
      const job = this.jobs.shift()!;
      const definition = this.definitions.get(job.name);
      if (!definition) continue;
      const parsed = definition.schema.parse(job.data);
      const started = performance.now();
      const ctx = this.context(job);
      try {
        await definition.handler(ctx, parsed);
        for (const listener of this.completed) {
          listener({ jobId: job.id, jobName: job.name, attempts: 1, durationMs: performance.now() - started, context: job.options?.context });
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        for (const listener of this.failed) {
          listener({ jobId: job.id, jobName: job.name, error: err, attempts: 1, final: true, context: job.options?.context });
        }
        throw err;
      }
    }
  }

  private context(job: EnqueuedJob): JobContext {
    return {
      ...createContext({
        logger: silent,
        traceId: job.options?.context?.traceId,
        tenantId: job.options?.context?.tenantId,
        userId: job.options?.context?.userId,
        identityType: 'system',
      }),
      jobId: job.id,
      jobName: job.name,
      attemptNumber: 1,
      maxAttempts: 1,
      signal: new AbortController().signal,
      updateProgress: async () => {},
    };
  }
}
