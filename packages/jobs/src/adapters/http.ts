import cronParser from 'cron-parser';
import { z } from 'zod';
import { JobsError, type Logger } from '@mariachi/core';
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
  RetryConfig,
  ScheduleDefinition,
} from '../types';
import { DEFAULT_RETRY, buildJobContext, isNonRetryable, priorityValue, runWithTimeout, unwrap, wrap } from '../envelope';
import { verifyJobRunSignature } from './http-signature';

/**
 * The run ids this app has finished, so a repeated `POST /_jobs/run` for one is answered without
 * running it again. The default (`memoryFinishedRuns`) keeps the last 10,000 in one process's memory:
 * it is lost on restart and not shared between instances, so an app that restarts mid-delivery or runs
 * several instances behind one address passes a shared one (a table, Redis).
 */
export interface FinishedRuns {
  has(runId: string): Promise<boolean>;
  add(runId: string): Promise<void>;
}

/** The last `limit` run ids, in memory. */
export function memoryFinishedRuns(limit = 10_000): FinishedRuns {
  const ids = new Set<string>();
  return {
    async has(runId) {
      return ids.has(runId);
    },
    async add(runId) {
      ids.delete(runId);
      ids.add(runId);
      while (ids.size > limit) {
        const oldest = ids.values().next().value;
        if (oldest === undefined) break;
        ids.delete(oldest);
      }
    },
  };
}

export interface HttpJobBackendOptions {
  /** Where finished run ids are kept. Default: the last 10,000, in this process. */
  finishedRuns?: FinishedRuns;
  /** The clock, in milliseconds. Tests. */
  now?: () => number;
  /** Tests. Default the global `fetch`. */
  fetch?: typeof fetch;
}

/** A framework-neutral request for `POST /_jobs/run`. */
export interface JobRunRequest {
  headers: Record<string, string | string[] | undefined>;
  /** The exact bytes received: the signature is over them, not over parsed JSON. */
  rawBody?: Buffer | Uint8Array | string;
}

export interface JobRunResponse {
  status: number;
  headers: Record<string, string>;
  body: { outcome: string };
}

const MAX_DATA_BYTES = 65_536;
const MAX_DELAY_SECONDS = 30 * 24 * 3600;
const MAX_RETRY_AFTER_SECONDS = 3600;
const SERVICE_CODE = /^[A-Za-z0-9._/:-]{1,100}$/;

const RunRequestSchema = z.object({
  job: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/),
  data: z.unknown(),
  trigger: z.enum(['enqueue', 'schedule', 'webhook', 'manual', 'retry']),
  scheduledFor: z.string().nullable(),
});
const RunIdSchema = z.string().regex(/^run_[0-9A-HJKMNP-TV-Z]{26}$/);
const AttemptSchema = z.string().regex(/^[1-9][0-9]{0,2}$/);
const EnqueueResponseSchema = z.object({ runId: z.string().min(1), state: z.string(), deduped: z.boolean() });
const ErrorBodySchema = z.object({ error: z.object({ code: z.string() }).passthrough() }).passthrough();

function header(headers: JobRunRequest['headers'], name: string): string | undefined {
  const want = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === want) return Array.isArray(value) ? value[0] : value;
  }
  return undefined;
}

function answer(status: number, outcome: string, headers: Record<string, string> = {}): JobRunResponse {
  return { status, headers: { 'content-type': 'application/json', ...headers }, body: { outcome: outcome.slice(0, 200) } };
}

/** Seconds from a `Retry-After` header (seconds or an HTTP date), or undefined. */
function retryAfterSeconds(value: string | null, now: number): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);
  const at = Date.parse(value);
  return Number.isNaN(at) ? undefined : Math.max(0, Math.ceil((at - now) / 1000));
}

function errorRetryAfterMs(error: unknown): number | undefined {
  const e = error as { retryAfterMs?: unknown; metadata?: { retryAfterMs?: unknown } } | undefined;
  const ms = e?.retryAfterMs ?? e?.metadata?.retryAfterMs;
  return typeof ms === 'number' && Number.isFinite(ms) && ms >= 0 ? ms : undefined;
}

function isInvalidInput(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  return code === 'jobs/invalid-payload' || code === 'validation/invalid-input';
}

function backoffFor(retry: RetryConfig): { type: RetryConfig['backoff']; delaySeconds: number } {
  return { type: retry.backoff, delaySeconds: Math.min(3600, Math.max(1, Math.ceil((retry.delay ?? 1000) / 1000))) };
}

/**
 * A job backend on a remote queue spoken over HTTP (`packages/jobs/protocol`). `start()` declares the
 * app's jobs and schedules (`PUT /definitions`, which replaces the set, so a schedule removed from the
 * code stops); `enqueue` and `cancel` call the queue; the queue runs each attempt by calling the app's
 * `POST /_jobs/run`, which the app mounts with `handleRun`.
 *
 * The queue keeps failed runs, so `listDeadLetters` is empty here and `retryDeadLetter` is refused.
 */
export class HttpJobBackend implements JobQueue, JobWorker, JobScheduler {
  private readonly url: string;
  private readonly key: string;
  private readonly signingSecret: string;
  private readonly timeoutMs: number;
  private readonly definitions = new Map<string, JobDefinition>();
  private readonly schedules = new Map<string, ScheduleDefinition>();
  private readonly failedListeners: JobFailureListener[] = [];
  private readonly completedListeners: JobCompletedListener[] = [];
  private readonly running = new Set<string>();
  private readonly inflight = new Set<Promise<unknown>>();
  private readonly finished: FinishedRuns;
  private readonly now: () => number;
  private readonly fetchImpl: typeof fetch;
  private abort = new AbortController();
  private started = false;

  constructor(
    private readonly config: Partial<JobConfig>,
    private readonly logger: Logger,
    options: HttpJobBackendOptions = {},
  ) {
    if (!config.httpUrl || !config.httpKey || !config.httpSigningSecret) {
      throw new JobsError(
        'jobs/invalid-config',
        'The http job backend needs JOBS_HTTP_URL, JOBS_HTTP_KEY and JOBS_HTTP_SIGNING_SECRET',
      );
    }
    this.url = config.httpUrl.replace(/\/+$/, '');
    this.key = config.httpKey;
    this.signingSecret = config.httpSigningSecret;
    this.timeoutMs = config.httpTimeoutMs ?? 10_000;
    this.finished = options.finishedRuns ?? memoryFinishedRuns();
    this.now = options.now ?? Date.now;
    this.fetchImpl = options.fetch ?? ((...args) => fetch(...args));
  }

  async connect(): Promise<void> {}

  async disconnect(): Promise<void> {
    await this.stop();
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }

  async enqueue<T>(jobName: string, data: T, options: EnqueueOptions = {}): Promise<string> {
    const body: Record<string, unknown> = { job: jobName, data: wrap(data, options) };
    if (Buffer.byteLength(JSON.stringify(body.data)) > MAX_DATA_BYTES) {
      throw new JobsError('jobs/payload-too-large', `A job's data is at most ${MAX_DATA_BYTES} bytes of JSON: keep big things in the database and pass their id`, { job: jobName });
    }
    if (options.delay !== undefined && options.delay > 0) {
      const delaySeconds = Math.ceil(options.delay / 1000);
      if (delaySeconds > MAX_DELAY_SECONDS) throw new JobsError('jobs/invalid-delay', 'A job can be delayed by at most 30 days', { job: jobName });
      body.delaySeconds = delaySeconds;
    }
    if (options.jobId) body.dedupKey = options.jobId;
    const priority = priorityValue(options.priority);
    if (priority !== undefined) body.priority = Math.min(10, Math.max(1, Math.round(priority)));
    const res = await this.call('enqueue', 'POST', '/runs', body);
    const parsed = EnqueueResponseSchema.safeParse(await res.json().catch(() => undefined));
    if (!parsed.success) throw new JobsError('jobs/invalid-response', 'The job queue answered an enqueue with an unexpected body', { operation: 'enqueue' });
    return parsed.data.runId;
  }

  async cancel(jobId: string): Promise<boolean> {
    const res = await this.call('cancel', 'DELETE', `/runs/${encodeURIComponent(jobId)}`, undefined, [404, 409]);
    return res.status === 200;
  }

  /** Empty: the queue keeps failed runs, and they are looked at and retried there. */
  async listDeadLetters(): Promise<DeadLetterEntry[]> {
    return [];
  }

  async retryDeadLetter(): Promise<string> {
    throw new JobsError('jobs/not-supported', 'The http job backend keeps no dead letters: failed runs are retried on the queue');
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
    // Checked where it is written: the queue takes five fields, so nothing runs more often than once a minute
    const fields = schedule.cron.trim().split(/\s+/);
    if (fields.length !== 5) {
      throw new JobsError('jobs/invalid-schedule', `Schedule "${schedule.name}": the http backend takes a five-field cron (minute to day of week)`);
    }
    try {
      cronParser.parseExpression(schedule.cron, { tz: schedule.timezone });
    } catch (error) {
      throw new JobsError('jobs/invalid-schedule', `Cron expression "${schedule.cron}" can't be read: ${(error as Error).message}`);
    }
    this.schedules.set(schedule.name, schedule);
  }

  async unregister(name: string): Promise<void> {
    this.schedules.delete(name);
    if (this.started) await this.declare();
  }

  /** Declares every registered job and schedule; the queue drops what isn't declared. */
  async start(): Promise<void> {
    if (this.abort.signal.aborted) this.abort = new AbortController();
    await this.declare();
    this.started = true;
  }

  async stop(): Promise<void> {
    this.started = false;
    this.abort.abort();
    await Promise.allSettled([...this.inflight]);
  }

  private retryFor(definition: JobDefinition | undefined): RetryConfig {
    return definition?.retry ?? this.config.defaultRetry ?? DEFAULT_RETRY;
  }

  private async declare(): Promise<void> {
    const jobs = [...this.definitions.values()].map((d) => {
      const retry = this.retryFor(d);
      const job: Record<string, unknown> = {
        name: d.name,
        retries: Math.min(10, Math.max(0, retry.attempts - 1)),
        backoff: backoffFor(retry),
      };
      if (d.timeoutMs) job.timeoutSeconds = Math.min(900, Math.max(1, Math.ceil(d.timeoutMs / 1000)));
      return job;
    });
    const schedules = [...this.schedules.values()].map((s) => ({
      name: s.name,
      cron: s.cron.trim(),
      tz: s.timezone ?? 'UTC',
      job: s.jobName,
      data: s.data ?? null,
    }));
    await this.call('definitions', 'PUT', '/definitions', { jobs, schedules });
  }

  /**
   * One call to the queue. A refusal is a `JobsError` from the status alone: `jobs/unauthorized`
   * (401, 403), `jobs/rate-limited` (429, with `retryAfterMs`), `jobs/unavailable` (5xx, a timeout or
   * no connection) or `jobs/rejected` (any other 4xx). Details carry the status and the queue's own
   * error code, never the key or a body.
   */
  private async call(operation: string, method: string, path: string, body?: unknown, accept: number[] = []): Promise<Response> {
    let res: Response;
    try {
      res = await this.fetchImpl(`${this.url}${path}`, {
        method,
        headers: {
          authorization: `Bearer ${this.key}`,
          accept: 'application/json',
          ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        // A redirect would carry the key somewhere else: refuse it
        redirect: 'error',
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      const timedOut = (error as Error)?.name === 'TimeoutError';
      throw new JobsError('jobs/unavailable', timedOut ? `The job queue didn't answer within ${this.timeoutMs}ms` : 'The job queue could not be reached', { operation });
    }
    if (res.ok || accept.includes(res.status)) return res;

    const parsed = ErrorBodySchema.safeParse(await res.json().catch(() => undefined));
    const serviceCode = parsed.success && SERVICE_CODE.test(parsed.data.error.code) ? parsed.data.error.code : undefined;
    const details: Record<string, unknown> = { operation, status: res.status, ...(serviceCode ? { serviceCode } : {}) };
    if (res.status === 429) {
      const seconds = retryAfterSeconds(res.headers.get('retry-after'), this.now());
      const error = new JobsError('jobs/rate-limited', `The job queue refused ${operation}: too many calls, or a cap reached`, {
        ...details,
        ...(seconds === undefined ? {} : { retryAfterMs: seconds * 1000 }),
      });
      throw error;
    }
    if (res.status === 401 || res.status === 403) {
      throw new JobsError('jobs/unauthorized', `The job queue refused the key for ${operation} (${res.status})`, details);
    }
    if (res.status >= 500) throw new JobsError('jobs/unavailable', `The job queue failed ${operation} (${res.status})`, details);
    throw new JobsError('jobs/rejected', `The job queue refused ${operation} (${res.status})`, details);
  }

  /**
   * Answers the queue's `POST /_jobs/run`: checks the signature over the raw body first, then runs
   * one attempt. `200` done (or already done), `422` the input can't work, `409` failed for good,
   * `429` later (with `Retry-After`), `401` a bad signature, `500` or `503` a failed attempt to retry.
   */
  async handleRun(request: JobRunRequest): Promise<JobRunResponse> {
    const raw = request.rawBody ?? '';
    const nowSeconds = Math.floor(this.now() / 1000);
    const signedRun = { runId: header(request.headers, 'jobs-run-id'), attempt: header(request.headers, 'jobs-run-attempt') };
    // The signature covers both run headers, so a missing or ill-formed one is a bad signature
    if (!verifyJobRunSignature(this.signingSecret, header(request.headers, 'jobs-signature'), signedRun, raw, nowSeconds)) {
      return answer(401, 'bad signature');
    }
    const runId = RunIdSchema.safeParse(signedRun.runId);
    const attemptHeader = AttemptSchema.safeParse(signedRun.attempt);
    if (!runId.success || !attemptHeader.success) return answer(401, 'bad signature');
    let json: unknown;
    try {
      json = JSON.parse(typeof raw === 'string' ? raw : Buffer.from(raw).toString('utf8'));
    } catch {
      return answer(422, 'jobs/invalid-run-body');
    }
    const run = RunRequestSchema.safeParse(json);
    if (!run.success) return answer(422, 'jobs/invalid-run-body');

    if (await this.finished.has(runId.data)) return answer(200, 'already done');
    if (!this.started) return answer(503, 'jobs/not-started');
    // The same run delivered again while this attempt is still going: later, without using an attempt
    if (this.running.has(runId.data)) return answer(429, 'jobs/already-running', { 'retry-after': '60' });

    const definition = this.definitions.get(run.data.job);
    if (!definition) return answer(422, 'jobs/unknown-job');

    this.running.add(runId.data);
    const work = this.runAttempt(definition, runId.data, Number(attemptHeader.data), run.data.data);
    this.inflight.add(work);
    try {
      return await work;
    } finally {
      this.inflight.delete(work);
      this.running.delete(runId.data);
    }
  }

  private async runAttempt(definition: JobDefinition, runId: string, attempt: number, data: unknown): Promise<JobRunResponse> {
    const retry = this.retryFor(definition);
    const { payload, context } = unwrap(data);
    const startedAt = this.now();
    try {
      const parsed = definition.schema.safeParse(payload);
      if (!parsed.success) throw new JobsError('jobs/invalid-payload', parsed.error.message);
      await runWithTimeout(
        (signal) =>
          definition.handler(
            buildJobContext({
              logger: this.logger,
              envelope: context,
              jobId: runId,
              jobName: definition.name,
              attemptNumber: attempt,
              maxAttempts: retry.attempts,
              signal,
              updateProgress: async () => {},
            }),
            parsed.data,
          ),
        definition.timeoutMs,
        this.abort.signal,
      );
      await this.finished.add(runId);
      for (const l of this.completedListeners) {
        l({ jobId: runId, jobName: definition.name, attempts: attempt, durationMs: this.now() - startedAt, context });
      }
      return answer(200, 'ok');
    } catch (error) {
      const code = (error as { code?: string })?.code;
      const outcome = typeof code === 'string' && SERVICE_CODE.test(code) ? code : 'failed';
      const retryAfterMs = errorRetryAfterMs(error);
      const nonRetryable = isNonRetryable(definition, error);
      const later = !nonRetryable && retryAfterMs !== undefined;
      const final = nonRetryable || (!later && attempt >= retry.attempts);
      for (const l of this.failedListeners) {
        l({ jobId: runId, jobName: definition.name, error: error as Error, attempts: attempt, final, context });
      }
      if (nonRetryable) {
        this.logger.error({ jobId: runId, jobName: definition.name, code }, 'job failed permanently');
        return answer(isInvalidInput(error) ? 422 : 409, outcome);
      }
      if (later) {
        const seconds = Math.min(MAX_RETRY_AFTER_SECONDS, Math.max(1, Math.ceil((retryAfterMs ?? 0) / 1000)));
        return answer(429, outcome, { 'retry-after': String(seconds) });
      }
      this.logger.warn({ jobId: runId, jobName: definition.name, attempt, code }, 'job attempt failed');
      return answer(500, outcome);
    }
  }
}

/** Serves the queue's `POST /_jobs/run` from a controller: mount it at the app's root with the raw body. */
export function handleJobRun(backend: HttpJobBackend, request: JobRunRequest): Promise<JobRunResponse> {
  return backend.handleRun(request);
}
