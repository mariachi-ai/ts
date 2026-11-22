import { type IncomingMessage, type Server, type ServerResponse, createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createContext } from '@mariachi/core';
import { DefaultJobs, HttpJobBackend, createJobQueue, defineJob, handleJobRun, signJobRun, type JobContext } from '../index';
import { expectSchema, requestSchemaFor } from './__tests__/protocol-check';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child() { return silent; } };
const KEY = 'stand-in-key';
const SECRET = 'stand-in-signing-secret';

function read(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function listen(server: Server): Promise<string> {
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${(server.address() as AddressInfo).port}`)));
}

function json(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) {
  res.writeHead(status, { 'content-type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
}

/**
 * A stand-in for a remote queue, over real HTTP: it keeps what PUT /v1/definitions declares, takes
 * POST /v1/runs, and runs each by calling the app's POST /_jobs/run, signed, retrying a 500 and a 429.
 */
class StandInQueue {
  readonly server = createServer((req, res) => void this.handle(req, res));
  url = '';
  appUrl = '';
  declared: { jobs: Array<{ name: string; retries: number }>; schedules: unknown[] } = { jobs: [], schedules: [] };
  readonly answers: Array<{ runId: string; attempt: number; status: number; outcome?: string }> = [];
  private seq = 0;
  private readonly dedup = new Map<string, string>();
  private readonly pending = new Set<Promise<void>>();

  private async handle(req: IncomingMessage, res: ServerResponse) {
    const body = await read(req);
    if (req.headers.authorization !== `Bearer ${KEY}`) return json(res, 401, { error: { code: 'queue/unauthorized', message: 'no' } });
    const parsed = body.length ? JSON.parse(body.toString()) : undefined;
    const schema = requestSchemaFor(req.method ?? '', req.url ?? '');
    if (schema) expectSchema('app-api', schema, parsed);
    if (req.method === 'PUT' && req.url === '/v1/definitions') {
      this.declared = parsed;
      return json(res, 200, { jobs: [], schedules: [], nextRuns: {} });
    }
    if (req.method === 'POST' && req.url === '/v1/runs') {
      if (!this.declared.jobs.some((j) => j.name === parsed.job)) return json(res, 422, { error: { code: 'queue/unknown-job', message: 'not declared' } });
      const known = parsed.dedupKey ? this.dedup.get(parsed.dedupKey) : undefined;
      if (known) return json(res, 202, { runId: known, state: 'queued', deduped: true });
      const runId = `run_01HFQ8Z3J6Y2K9V4T7N5M1C0${String(this.seq++).padStart(2, '0')}`;
      if (parsed.dedupKey) this.dedup.set(parsed.dedupKey, runId);
      const p = this.dispatch(runId, parsed.job, parsed.data).finally(() => this.pending.delete(p));
      this.pending.add(p);
      return json(res, 202, { runId, state: 'queued', deduped: false });
    }
    json(res, 404, { error: { code: 'queue/not-found', message: 'no' } });
  }

  private async dispatch(runId: string, job: string, data: unknown) {
    const retries = this.declared.jobs.find((j) => j.name === job)?.retries ?? 0;
    for (let attempt = 1; attempt <= retries + 1; ) {
      const raw = JSON.stringify({ job, data, trigger: 'enqueue', scheduledFor: null });
      const res = await fetch(`${this.appUrl}/_jobs/run`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'jobs-signature': signJobRun([SECRET], raw, Math.floor(Date.now() / 1000)),
          'jobs-run-id': runId,
          'jobs-run-attempt': String(attempt),
        },
        body: raw,
      });
      const answer = (await res.json()) as { outcome?: string };
      expectSchema('run-call', 'RunAnswer', answer);
      this.answers.push({ runId, attempt, status: res.status, outcome: answer.outcome });
      if (res.ok || res.status === 409 || res.status === 422) return;
      // A 429 doesn't use up an attempt
      if (res.status !== 429) attempt++;
    }
  }

  async settled() {
    while (this.pending.size) await Promise.allSettled([...this.pending]);
  }
}

const queue = new StandInQueue();
let backend: HttpJobBackend;
let jobs: DefaultJobs;
let app: Server;
const seen: Array<{ ctx: JobContext; data: unknown }> = [];
let flakyCalls = 0;

beforeAll(async () => {
  queue.url = await listen(queue.server);
  backend = createJobQueue({ adapter: 'http', httpUrl: `${queue.url}/v1`, httpKey: KEY, httpSigningSecret: SECRET, defaultRetry: { attempts: 3, backoff: 'fixed', delay: 1000 } }, silent) as HttpJobBackend;
  jobs = new DefaultJobs({ queue: backend }, { logger: silent });
  jobs.registerJob(defineJob({ name: 'make-thumbnails', schema: z.object({ uploadId: z.string() }), handler: async (ctx, data) => void seen.push({ ctx, data }) }));
  jobs.registerJob(
    defineJob({
      name: 'flaky',
      schema: z.object({}),
      handler: async () => {
        flakyCalls++;
        if (flakyCalls < 3) throw new Error('not yet');
      },
    }),
  );
  jobs.schedule({ name: 'morning', cron: '0 8 * * *', jobName: 'make-thumbnails', data: { uploadId: 'daily' } });
  // The app's route: the raw body goes to handleJobRun as it came
  app = createServer(async (req, res) => {
    const rawBody = await read(req);
    const answer = await handleJobRun(backend, { headers: req.headers, rawBody });
    res.writeHead(answer.status, answer.headers);
    res.end(JSON.stringify(answer.body));
  });
  queue.appUrl = await listen(app);
  await jobs.start();
});

afterAll(async () => {
  await jobs.stop();
  await new Promise((r) => app.close(r));
  await new Promise((r) => queue.server.close(r));
});

describe('the http job backend against a queue over HTTP', () => {
  it('declares its jobs and schedules at start', () => {
    expect(queue.declared.jobs.map((j) => j.name)).toEqual(['make-thumbnails', 'flaky']);
    expect(queue.declared.schedules).toEqual([{ name: 'morning', cron: '0 8 * * *', tz: 'UTC', job: 'make-thumbnails', data: { uploadId: 'daily' } }]);
  });

  it('enqueues, and the queue runs it through the signed route with the enqueuer context', async () => {
    const ctx = createContext({ logger: silent, tenantId: 't1', userId: 'u1', traceId: 'trace-http' });
    const runId = await jobs.enqueue(ctx, 'make-thumbnails', { uploadId: 'u_42' }, { dedupKey: 'u_42' });
    expect(await jobs.enqueue(ctx, 'make-thumbnails', { uploadId: 'u_42' }, { dedupKey: 'u_42' })).toBe(runId);
    await queue.settled();
    expect(seen).toHaveLength(1);
    expect(seen[0]?.data).toEqual({ uploadId: 'u_42' });
    expect(seen[0]?.ctx).toMatchObject({ jobId: runId, traceId: 'trace-http', tenantId: 't1', userId: 'u1', attemptNumber: 1 });
  });

  it('retries a failed attempt until it succeeds', async () => {
    const runId = await jobs.enqueue(createContext({ logger: silent }), 'flaky', {});
    await queue.settled();
    expect(queue.answers.filter((a) => a.runId === runId).map((a) => [a.attempt, a.status])).toEqual([
      [1, 500],
      [2, 500],
      [3, 200],
    ]);
  });

  it('turns a refusal into a JobsError', async () => {
    await expect(backend.enqueue('not-declared', {})).rejects.toMatchObject({ code: 'jobs/rejected', metadata: { status: 422, serviceCode: 'queue/unknown-job' } });
  });

  it('refuses a run with a bad signature over HTTP', async () => {
    const res = await fetch(`${queue.appUrl}/_jobs/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'jobs-signature': signJobRun(['wrong-secret'], '{}', Math.floor(Date.now() / 1000)), 'jobs-run-id': 'run_01HFQ8Z3J6Y2K9V4T7N5M1C0ZZ', 'jobs-run-attempt': '1' },
      body: '{}',
    });
    expect(res.status).toBe(401);
  });
});
