import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { JobsError, MariachiError, createContext } from '@mariachi/core';
import {
  DefaultJobs,
  HttpJobBackend,
  createJobQueue,
  defineJob,
  memoryFinishedRuns,
  signJobRun,
  verifyJobRunSignature,
  type JobContext,
  type JobFailureEvent,
} from '../index';
import { expectSchema, requestSchemaFor, runVectors } from './__tests__/protocol-check';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child() { return silent; } };
const SECRET = 'example-signing-secret-new';
const NOW = 1_763_805_000_000;
const RUN_ID = 'run_01HFQ8Z3J6Y2K9V4T7N5M1C0BD';

interface Sent {
  method: string;
  path: string;
  headers: Headers;
  body: unknown;
}

/** A queue that answers from a script, and checks every request against the protocol. */
function queue(answers: Array<() => Response> = []) {
  const sent: Sent[] = [];
  const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    const method = init?.method ?? 'GET';
    sent.push({ method, path: url.pathname, headers: new Headers(init?.headers), body });
    // Every call refuses to follow a redirect, which would carry the key elsewhere
    expect(init?.redirect).toBe('error');
    const schema = requestSchemaFor(method, url.pathname);
    if (schema) expectSchema('app-api', schema, body);
    const next = answers.shift();
    if (next) return next();
    if (method === 'PUT') return Response.json({ jobs: [], schedules: [], nextRuns: {} });
    if (method === 'POST') return Response.json({ runId: RUN_ID, state: 'queued', deduped: false }, { status: 202 });
    return Response.json({ state: 'cancelled' });
  }) as typeof fetch;
  return { sent, fetchImpl };
}

function backend(answers?: Array<() => Response>, extra: Partial<ConstructorParameters<typeof HttpJobBackend>[0]> = {}) {
  const q = queue(answers);
  const b = new HttpJobBackend(
    { adapter: 'http', httpUrl: 'https://queue.example/v1/', httpKey: 'opaque-key', httpSigningSecret: SECRET, defaultRetry: { attempts: 3, backoff: 'fixed', delay: 1000 }, ...extra },
    silent,
    { fetch: q.fetchImpl, now: () => NOW, finishedRuns: memoryFinishedRuns(100) },
  );
  return { ...q, backend: b };
}

function signed(body: unknown, opts: { runId?: string; attempt?: string; t?: number; secrets?: string[] } = {}) {
  const raw = JSON.stringify(body);
  const t = opts.t ?? NOW / 1000;
  return {
    headers: {
      'Jobs-Signature': signJobRun(opts.secrets ?? [SECRET], { runId: opts.runId ?? RUN_ID, attempt: opts.attempt ?? '1' }, raw, t),
      'jobs-run-id': opts.runId ?? RUN_ID,
      'Jobs-Run-Attempt': opts.attempt ?? '1',
    },
    rawBody: Buffer.from(raw),
  };
}

const runBody = (job: string, data: unknown) => ({ job, data, trigger: 'enqueue', scheduledFor: null });

describe('the run signature', () => {
  it('matches the protocol test vectors, one secret and two during a rotation', () => {
    for (const v of runVectors) {
      const run = { runId: v.runId, attempt: v.attempt };
      expect(signJobRun([v.secrets[0] as string], run, v.body, v.timestamp)).toBe(v.signatures[0]);
      expect(signJobRun(v.secrets, run, v.body, v.timestamp)).toBe(v.signatures[1]);
      for (const secret of v.secrets) {
        expect(verifyJobRunSignature(secret, v.signatures[1], run, v.body, v.timestamp)).toBe(true);
      }
      expect(verifyJobRunSignature(v.secrets[0] as string, v.signatures[0], run, v.body, v.timestamp)).toBe(true);
      // The old secret alone is not in a one-secret header
      expect(verifyJobRunSignature(v.secrets[1] as string, v.signatures[0], run, v.body, v.timestamp)).toBe(false);
    }
  });

  it('refuses a time more than 300 seconds off, either way, and any change to the body', () => {
    const v = runVectors[0];
    if (!v) throw new Error('no vectors');
    const sig = v.signatures[0];
    const run = { runId: v.runId, attempt: v.attempt };
    expect(verifyJobRunSignature(v.secrets[0] as string, sig, run, v.body, v.timestamp + 300)).toBe(true);
    expect(verifyJobRunSignature(v.secrets[0] as string, sig, run, v.body, v.timestamp + 301)).toBe(false);
    expect(verifyJobRunSignature(v.secrets[0] as string, sig, run, v.body, v.timestamp - 301)).toBe(false);
    expect(verifyJobRunSignature(v.secrets[0] as string, sig, run, `${v.body} `, v.timestamp)).toBe(false);
    expect(verifyJobRunSignature(v.secrets[0] as string, 'garbage', run, v.body, v.timestamp)).toBe(false);
    expect(verifyJobRunSignature('', sig, run, v.body, v.timestamp)).toBe(false);
  });

  it('refuses the protocol refused vectors, and their passing signatures pass', () => {
    for (const v of runVectors) {
      expect(v.refused.length).toBeGreaterThan(0);
      for (const r of v.refused) {
        const run = { runId: r.runId, attempt: r.attempt };
        expect(verifyJobRunSignature(v.secrets[0] as string, r.header, run, v.body, v.timestamp), r.summary).toBe(false);
        expect(verifyJobRunSignature(v.secrets[0] as string, `t=${v.timestamp},v1=${r.passing}`, run, v.body, v.timestamp), r.summary).toBe(true);
        expect(signJobRun([v.secrets[0] as string], run, v.body, v.timestamp)).toBe(`t=${v.timestamp},v1=${r.passing}`);
      }
    }
  });

  it('refuses run headers that do not match their patterns, before any HMAC, even if signed as given', () => {
    const v = runVectors[0];
    if (!v) throw new Error('no vectors');
    const secret = v.secrets[0] as string;
    const badIds = ['run_01HFQ8Z3J6Y2K9V4T7N5M1C0B', 'run_01HFQ8Z3J6Y2K9V4T7N5M1C0BDX', 'run_01hfq8z3j6y2k9v4t7n5m1c0bd', 'run_01HFQ8Z3J6Y2K9V4T7N5M1C0BI', 'run_01HFQ8Z3J6Y2K9V4T7N5M1C.BD', 'RUN_01HFQ8Z3J6Y2K9V4T7N5M1C0BD', ''];
    const badAttempts = ['0', '01', '1000', '1.2', '-1', ' 1', ''];
    // A queue could compute an HMAC over any strings: the verifier must refuse these headers regardless
    const forged = (runId: string, attempt: string) => {
      const mac = createHmac('sha256', secret).update(`${v.timestamp}.${runId}.${attempt}.`).update(v.body).digest('hex');
      return `t=${v.timestamp},v1=${mac}`;
    };
    for (const runId of badIds) {
      expect(verifyJobRunSignature(secret, forged(runId, '1'), { runId, attempt: '1' }, v.body, v.timestamp), runId).toBe(false);
      expect(() => signJobRun([secret], { runId, attempt: '1' }, v.body, v.timestamp)).toThrow(expect.objectContaining({ code: 'jobs/invalid-signature-input' }));
    }
    for (const attempt of badAttempts) {
      expect(verifyJobRunSignature(secret, forged(v.runId, attempt), { runId: v.runId, attempt }, v.body, v.timestamp), attempt).toBe(false);
    }
    // The control: the same forging with good headers does check
    expect(verifyJobRunSignature(secret, forged(v.runId, '999'), { runId: v.runId, attempt: '999' }, v.body, v.timestamp)).toBe(true);
  });

  it('covers the run headers: the same body and signature under another run id or attempt is refused', () => {
    const v = runVectors[0];
    if (!v) throw new Error('no vectors');
    const secret = v.secrets[0] as string;
    const sig = v.signatures[0];
    expect(verifyJobRunSignature(secret, sig, { runId: v.runId, attempt: v.attempt }, v.body, v.timestamp)).toBe(true);
    expect(verifyJobRunSignature(secret, sig, { runId: 'run_01HFQ8Z3J6Y2K9V4T7N5M1C0BE', attempt: v.attempt }, v.body, v.timestamp)).toBe(false);
    expect(verifyJobRunSignature(secret, sig, { runId: v.runId, attempt: '2' }, v.body, v.timestamp)).toBe(false);
    // A missing or ill-formed run header is a bad signature too
    expect(verifyJobRunSignature(secret, sig, { runId: v.runId }, v.body, v.timestamp)).toBe(false);
    expect(verifyJobRunSignature(secret, sig, { runId: 'run_nope', attempt: v.attempt }, v.body, v.timestamp)).toBe(false);
    expect(verifyJobRunSignature(secret, sig, undefined, v.body, v.timestamp)).toBe(false);
  });
});

describe('HttpJobBackend calls to the queue', () => {
  it('is made by createJobQueue, and needs its three settings', () => {
    expect(createJobQueue({ adapter: 'http', httpUrl: 'https://q/v1', httpKey: 'k', httpSigningSecret: 's' }, silent)).toBeInstanceOf(HttpJobBackend);
    expect(() => createJobQueue({ adapter: 'http', httpUrl: 'https://q/v1' }, silent)).toThrow(expect.objectContaining({ code: 'jobs/invalid-config' }));
  });

  it('declares every job and schedule at start, replacing the set', async () => {
    const { backend: b, sent } = backend();
    b.registerJob(defineJob({ name: 'make-thumbnails', schema: z.object({}), retry: { attempts: 4, backoff: 'exponential', delay: 2500 }, timeoutMs: 2_000_000, handler: async () => {} }));
    b.registerJob(defineJob({ name: 'send-reminders', schema: z.object({}), handler: async () => {} }));
    b.register({ name: 'morning', cron: '0 8 * * *', jobName: 'send-reminders', timezone: 'Europe/Berlin' });
    b.register({ name: 'nightly', cron: '30 2 * * 1-5', jobName: 'send-reminders', data: { kind: 'digest' } });
    await b.start();
    expect(sent[0]).toMatchObject({
      method: 'PUT',
      path: '/v1/definitions',
      body: {
        jobs: [
          { name: 'make-thumbnails', retries: 3, backoff: { type: 'exponential', delaySeconds: 3 }, timeoutSeconds: 900 },
          { name: 'send-reminders', retries: 2, backoff: { type: 'fixed', delaySeconds: 1 } },
        ],
        schedules: [
          { name: 'morning', cron: '0 8 * * *', tz: 'Europe/Berlin', job: 'send-reminders', data: null },
          { name: 'nightly', cron: '30 2 * * 1-5', tz: 'UTC', job: 'send-reminders', data: { kind: 'digest' } },
        ],
      },
    });
    expect(sent[0]?.headers.get('authorization')).toBe('Bearer opaque-key');
    // Removing a schedule while started declares the set again without it
    await b.unregister('nightly');
    expect((sent[1]?.body as { schedules: unknown[] }).schedules).toHaveLength(1);
  });

  it('refuses a cron that is not five fields where it is written', () => {
    const { backend: b } = backend();
    expect(() => b.register({ name: 's', cron: '*/5 * * * * *', jobName: 'x' })).toThrow(expect.objectContaining({ code: 'jobs/invalid-schedule' }));
    expect(() => b.register({ name: 's', cron: '61 * * * *', jobName: 'x' })).toThrow(expect.objectContaining({ code: 'jobs/invalid-schedule' }));
  });

  it('enqueues with the context envelope, dedup key, delay in seconds and priority', async () => {
    const { backend: b, sent } = backend();
    const jobs = new DefaultJobs({ queue: b }, { logger: silent });
    const ctx = createContext({ logger: silent, tenantId: 't1', userId: 'u1', traceId: 'trace-1' });
    const id = await jobs.enqueue(ctx, 'make-thumbnails', { uploadId: 'u_42' }, { dedupKey: 'u_42', delay: 1500, priority: 'high' });
    expect(id).toBe(RUN_ID);
    expect(sent[0]).toMatchObject({
      method: 'POST',
      path: '/v1/runs',
      body: {
        job: 'make-thumbnails',
        data: { __mariachi: { v: 1, context: { traceId: 'trace-1', tenantId: 't1', userId: 'u1' } }, payload: { uploadId: 'u_42' } },
        dedupKey: 'u_42',
        delaySeconds: 2,
        priority: 2,
      },
    });
  });

  it('refuses data over 64 KiB before sending it', async () => {
    const { backend: b, sent } = backend();
    await expect(b.enqueue('x', { blob: 'a'.repeat(70_000) })).rejects.toMatchObject({ code: 'jobs/payload-too-large' });
    expect(sent).toHaveLength(0);
  });

  it('cancels: true when cancelled, false when started, ended or unknown', async () => {
    const { backend: b, sent } = backend([
      () => Response.json({ state: 'cancelled' }),
      () => Response.json({ error: { code: 'queue/not-cancellable', message: 'running' } }, { status: 409 }),
      () => Response.json({ error: { code: 'queue/unknown-run', message: 'no' } }, { status: 404 }),
    ]);
    expect(await b.cancel(RUN_ID)).toBe(true);
    expect(await b.cancel(RUN_ID)).toBe(false);
    expect(await b.cancel(RUN_ID)).toBe(false);
    expect(sent[0]).toMatchObject({ method: 'DELETE', path: `/v1/runs/${RUN_ID}` });
  });

  it('turns a refusal into a JobsError from the status, with the queue code and never the key', async () => {
    const refusal = (status: number, code: string, headers: Record<string, string> = {}) => () =>
      Response.json({ error: { code, message: 'the queue said opaque-key' } }, { status, headers });
    const { backend: b } = backend([
      refusal(429, 'queue/rate-limited', { 'retry-after': '12' }),
      refusal(401, 'queue/unauthorized'),
      refusal(503, 'queue/unavailable'),
      refusal(422, 'queue/unknown-job'),
      refusal(402, 'queue/no-credits'),
    ]);
    const outcomes: JobsError[] = [];
    for (let i = 0; i < 5; i++) outcomes.push(await b.enqueue('x', {}).catch((e: JobsError) => e) as JobsError);
    expect(outcomes.map((e) => e.code)).toEqual(['jobs/rate-limited', 'jobs/unauthorized', 'jobs/unavailable', 'jobs/rejected', 'jobs/rejected']);
    expect(outcomes[0]?.metadata).toEqual({ operation: 'enqueue', status: 429, serviceCode: 'queue/rate-limited', retryAfterMs: 12_000 });
    expect(outcomes[3]?.metadata).toMatchObject({ status: 422, serviceCode: 'queue/unknown-job' });
    for (const e of outcomes) {
      expect(e).toBeInstanceOf(MariachiError);
      expect(JSON.stringify({ message: e.message, metadata: e.metadata })).not.toContain('opaque-key');
    }
  });

  it('is unavailable when the queue cannot be reached', async () => {
    const b = new HttpJobBackend({ httpUrl: 'https://q/v1', httpKey: 'k', httpSigningSecret: 's' }, silent, {
      fetch: (async () => {
        throw new TypeError('fetch failed');
      }) as typeof fetch,
    });
    await expect(b.enqueue('x', {})).rejects.toMatchObject({ code: 'jobs/unavailable' });
  });

  it('keeps no dead letters: failed runs live on the queue', async () => {
    const { backend: b } = backend();
    expect(await b.listDeadLetters()).toEqual([]);
    await expect(b.retryDeadLetter()).rejects.toMatchObject({ code: 'jobs/not-supported' });
  });
});

describe('HttpJobBackend runs (POST /_jobs/run)', () => {
  async function started(define: (b: HttpJobBackend) => void) {
    const made = backend();
    define(made.backend);
    await made.backend.start();
    return made.backend;
  }

  it('runs a signed run with the enqueuer context, and a repeat of a finished run id is not run again', async () => {
    const seen: JobContext[] = [];
    const b = await started((b) =>
      b.registerJob(defineJob({ name: 'make-thumbnails', schema: z.object({ uploadId: z.string() }), handler: async (ctx) => void seen.push(ctx) })),
    );
    const data = { __mariachi: { v: 1, context: { traceId: 'trace-1', tenantId: 't1', userId: 'u1', scopes: [], identityType: 'session' } }, payload: { uploadId: 'u_42' } };
    const body = runBody('make-thumbnails', data);
    expectSchema('run-call', 'RunRequest', body);
    const first = await b.handleRun(signed(body, { attempt: '2' }));
    expect(first).toMatchObject({ status: 200, body: { outcome: 'ok' } });
    expectSchema('run-call', 'RunAnswer', first.body);
    expect(seen[0]).toMatchObject({ jobId: RUN_ID, jobName: 'make-thumbnails', traceId: 'trace-1', tenantId: 't1', userId: 'u1', attemptNumber: 2, maxAttempts: 3 });
    expect((await b.handleRun(signed(body))).status).toBe(200);
    expect(seen).toHaveLength(1);
  });

  it('takes a run signed during a rotation, and refuses a bad, stale or missing signature before reading the body', async () => {
    let runs = 0;
    const b = await started((b) => b.registerJob(defineJob({ name: 'j', schema: z.unknown(), handler: async () => void runs++ })));
    expect((await b.handleRun(signed(runBody('j', null), { secrets: [SECRET, 'example-signing-secret-old'], runId: 'run_01HFQ8Z3J6Y2K9V4T7N5M1C0B1' }))).status).toBe(200);
    expect((await b.handleRun(signed(runBody('j', null), { secrets: ['example-signing-secret-old', 'another'], runId: 'run_01HFQ8Z3J6Y2K9V4T7N5M1C0B2' })))).toMatchObject({ status: 401, body: { outcome: 'bad signature' } });
    expect((await b.handleRun(signed(runBody('j', null), { t: NOW / 1000 - 301, runId: 'run_01HFQ8Z3J6Y2K9V4T7N5M1C0B3' }))).status).toBe(401);
    const tampered = signed(runBody('j', null), { runId: 'run_01HFQ8Z3J6Y2K9V4T7N5M1C0B4' });
    expect((await b.handleRun({ ...tampered, rawBody: Buffer.from('not json at all') })).status).toBe(401);
    expect((await b.handleRun({ headers: {}, rawBody: Buffer.from('{}') })).status).toBe(401);
    const original = signed(runBody('j', null), { runId: 'run_01HFQ8Z3J6Y2K9V4T7N5M1C0B5', attempt: '1' });
    const { 'Jobs-Run-Attempt': _dropped, ...noAttempt } = original.headers;
    expect(await b.handleRun({ ...original, headers: noAttempt })).toMatchObject({ status: 401, body: { outcome: 'bad signature' } });
    expect(runs).toBe(1);
  });

  // The same body and signature, delivered under other run headers: the signature covers them
  const replay = async (change: Record<string, string>) => {
    let runs = 0;
    const b = await started((b) => b.registerJob(defineJob({ name: 'j', schema: z.unknown(), handler: async () => void runs++ })));
    const original = signed(runBody('j', null), { runId: 'run_01HFQ8Z3J6Y2K9V4T7N5M1C0B5', attempt: '1' });
    const res = await b.handleRun({ ...original, headers: { ...original.headers, ...change } });
    return { res, runs };
  };

  it('refuses a signed run replayed under another run id', async () => {
    const { res, runs } = await replay({ 'jobs-run-id': 'run_01HFQ8Z3J6Y2K9V4T7N5M1C0B6' });
    expect(res).toMatchObject({ status: 401, body: { outcome: 'bad signature' } });
    expect(runs).toBe(0);
  });

  it('refuses a signed run replayed as another attempt', async () => {
    const { res, runs } = await replay({ 'Jobs-Run-Attempt': '2' });
    expect(res).toMatchObject({ status: 401, body: { outcome: 'bad signature' } });
    expect(runs).toBe(0);
  });

  it('answers 422 for a body or job that cannot work, 409 for a non-retryable failure, 429 for later and 500 to retry', async () => {
    const failures: JobFailureEvent[] = [];
    const later = Object.assign(new MariachiError('provider/rate-limited', 'slow down'), { retryAfterMs: 4_200 });
    const b = await started((b) => {
      b.registerJob(defineJob({ name: 'typed', schema: z.object({ n: z.number() }), handler: async () => {} }));
      b.registerJob(defineJob({ name: 'gone', schema: z.unknown(), nonRetryableCodes: ['uploads/not-found'], handler: async () => { throw new MariachiError('uploads/not-found', 'upload u_42 was deleted'); } }));
      b.registerJob(defineJob({ name: 'busy', schema: z.unknown(), handler: async () => { throw later; } }));
      b.registerJob(defineJob({ name: 'flaky', schema: z.unknown(), handler: async () => { throw new MariachiError('db/unavailable', 'secret detail'); } }));
      b.onFailed((e) => failures.push(e));
    });
    let n = 0;
    const id = () => `run_01HFQ8Z3J6Y2K9V4T7N5M1C0${String(n++).padStart(2, '0')}`;
    expect(await b.handleRun(signed(runBody('typed', { n: 'x' }), { runId: id() }))).toMatchObject({ status: 422, body: { outcome: 'jobs/invalid-payload' } });
    expect(await b.handleRun(signed(runBody('nope', null), { runId: id() }))).toMatchObject({ status: 422, body: { outcome: 'jobs/unknown-job' } });
    expect(await b.handleRun(signed({ job: 'typed' }, { runId: id() }))).toMatchObject({ status: 422, body: { outcome: 'jobs/invalid-run-body' } });
    expect(await b.handleRun(signed(runBody('gone', null), { runId: id() }))).toMatchObject({ status: 409, body: { outcome: 'uploads/not-found' } });
    expect(await b.handleRun(signed(runBody('busy', null), { runId: id() }))).toMatchObject({ status: 429, headers: { 'retry-after': '5' }, body: { outcome: 'provider/rate-limited' } });
    const flaky = await b.handleRun(signed(runBody('flaky', null), { runId: id(), attempt: '1' }));
    expect(flaky).toMatchObject({ status: 500, body: { outcome: 'db/unavailable' } });
    expect(JSON.stringify(flaky)).not.toContain('secret detail');
    await b.handleRun(signed(runBody('flaky', null), { runId: id(), attempt: '3' }));
    expect(failures.map((f) => [f.jobName, f.final])).toEqual([
      ['typed', true],
      ['gone', true],
      ['busy', false],
      ['flaky', false],
      ['flaky', true],
    ]);
  });

  it('answers 503 before start, and 429 for a run id already running', async () => {
    const { backend: b } = backend();
    let release: () => void = () => {};
    b.registerJob(defineJob({ name: 'slow', schema: z.unknown(), handler: () => new Promise<void>((r) => { release = r; }) }));
    expect((await b.handleRun(signed(runBody('slow', null)))).status).toBe(503);
    await b.start();
    const first = b.handleRun(signed(runBody('slow', null)));
    await new Promise((r) => setTimeout(r, 5));
    expect(await b.handleRun(signed(runBody('slow', null)))).toMatchObject({ status: 429, headers: { 'retry-after': '60' } });
    release();
    expect((await first).status).toBe(200);
  });

  it('keeps only the last N finished run ids by default', async () => {
    const finished = memoryFinishedRuns(2);
    await finished.add('a');
    await finished.add('b');
    await finished.add('c');
    expect([await finished.has('a'), await finished.has('b'), await finished.has('c')]).toEqual([false, true, true]);
  });
});
