import { createContext } from '@mariachi/core';
import { TestMetrics, TestTracer } from '@mariachi/testing';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { callProvider } from './call-provider';
import { ProviderError, categoryForStatus, parseRateLimitReset, parseRetryAfter } from './provider-error';
import { providerRequest } from './request';
import { assertProviderSpans, scriptedFetch } from './testing';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger, tenantId: 'tenant-1' });
const call = { integration: 'acme', operation: 'widgets.create', category: 'crm', server: 'api.acme.test' };
const noWait = { sleep: async () => {} };

class AcmeError extends ProviderError {}

describe('callProvider', () => {
  it('makes one CLIENT span named after the operation, with only the allowed attributes', async () => {
    const tracer = new TestTracer();
    const metrics = new TestMetrics();
    const out = await callProvider(ctx, { ...call, method: 'post' }, async (a) => { a.setStatusCode(201); return 'made'; }, { tracer, metrics });
    expect(out).toBe('made');
    const [span] = tracer.spans;
    expect(span).toMatchObject({ name: 'acme widgets.create', kind: 'client', ended: true, status: { status: 'ok' } });
    expect(span!.attributes).toEqual({
      'mariachi.integration': 'acme',
      'mariachi.integration.operation': 'widgets.create',
      'mariachi.integration.category': 'crm',
      'server.address': 'api.acme.test',
      'http.request.method': 'POST',
      'http.response.status_code': 201,
      'mariachi.integration.attempts': 1,
    });
    assertProviderSpans(tracer.spans);
    expect(metrics.records.map((m) => [m.type, m.name, m.tags?.outcome])).toEqual([
      ['increment', 'mariachi.integration.calls', 'ok'],
      ['histogram', 'mariachi.integration.duration', 'ok'],
    ]);
  });

  it('records the connection id when an end user’s connection was used, and nothing about it otherwise', async () => {
    const tracer = new TestTracer();
    await callProvider(ctx, { ...call, connection: '7f1c0f0e-6a3b-4e8e-9d1c-2b5a4f3e1d00' }, async () => 1, { tracer });
    await callProvider(ctx, call, async () => 1, { tracer });
    expect(tracer.spans.map((s) => s.attributes['mariachi.integration.connection'])).toEqual(['7f1c0f0e-6a3b-4e8e-9d1c-2b5a4f3e1d00', undefined]);
    assertProviderSpans(tracer.spans);
  });

  it('records the tenant only when the app turns it on', async () => {
    const tracer = new TestTracer();
    await callProvider(ctx, call, async () => 1, { tracer });
    await callProvider(ctx, call, async () => 1, { tracer, tenantAttribute: true });
    expect(tracer.spans.map((s) => s.attributes['mariachi.tenant_id'])).toEqual([undefined, 'tenant-1']);
  });

  it('retries rate limits and outages, waiting as the provider asks, each retry an event', async () => {
    const tracer = new TestTracer();
    const waits: number[] = [];
    let n = 0;
    const out = await callProvider(
      ctx,
      call,
      async () => {
        n += 1;
        if (n === 1) throw new AcmeError('acme/rate-limited', 'slow down', { category: 'rate-limited', status: 429, retryAfterMs: 1500 });
        if (n === 2) throw new AcmeError('acme/unavailable', 'down', { category: 'unavailable', status: 503 });
        return 'ok';
      },
      { tracer, sleep: async (ms) => { waits.push(ms); } },
    );
    expect(out).toBe('ok');
    expect(waits[0]).toBe(1500);
    expect(tracer.spans).toHaveLength(1);
    expect(tracer.spans[0]!.attributes['mariachi.integration.attempts']).toBe(3);
    expect(tracer.spans[0]!.events.map((e) => e.attributes['http.response.status_code'])).toEqual([429, 503]);
  });

  it("doesn't retry what would fail again, and names the failure by the provider's code", async () => {
    const tracer = new TestTracer();
    let n = 0;
    const err = await callProvider(ctx, call, async () => { n += 1; throw new AcmeError('acme/invalid-request', 'no', { category: 'invalid-request', status: 400, providerCode: 'bad_email' }); }, { tracer, ...noWait }).catch((e) => e);
    expect(n).toBe(1);
    expect(err).toBeInstanceOf(AcmeError);
    expect(err.statusCode).toBe(422);
    expect(tracer.spans[0]).toMatchObject({ status: { status: 'error', message: 'bad_email' } });
    expect(tracer.spans[0]!.attributes).toMatchObject({ 'error.type': 'bad_email', 'mariachi.integration.error_category': 'invalid-request', 'http.response.status_code': 400 });
  });

  it('gives up after the last attempt', async () => {
    let n = 0;
    await expect(callProvider(ctx, call, async () => { n += 1; throw new AcmeError('acme/unavailable', 'down', { category: 'unavailable' }); }, { ...noWait, retry: { attempts: 2 } })).rejects.toThrow('down');
    expect(n).toBe(2);
  });

  it("treats a provider that can't be reached as unavailable", async () => {
    let n = 0;
    const err = await callProvider(ctx, call, async () => { n += 1; throw new TypeError('fetch failed'); }, noWait).catch((e) => e);
    expect([n, err.code, err.category]).toEqual([3, 'acme/unavailable', 'unavailable']);
  });
});

describe('providerRequest', () => {
  const Widget = z.object({ id: z.string() });

  it("doesn't retry a create without an idempotency key after an outage, only after a rate limit", async () => {
    const outage = scriptedFetch({ status: 503 });
    await expect(providerRequest(ctx, call, { method: 'POST', url: 'https://api.acme.test/v1/widgets', json: {} }, { schema: Widget, deps: { fetch: outage, ...noWait } })).rejects.toMatchObject({ category: 'unavailable' });
    expect(outage.requests).toHaveLength(1);
    const limited = scriptedFetch({ status: 429, headers: { 'retry-after': '0' } }, { status: 201, json: { id: 'w2' } });
    expect(await providerRequest(ctx, call, { method: 'POST', url: 'https://api.acme.test/v1/widgets', json: {} }, { schema: Widget, deps: { fetch: limited, ...noWait } })).toEqual({ id: 'w2' });
    const read = scriptedFetch({ status: 503 }, { json: { id: 'w3' } });
    expect(await providerRequest(ctx, call, { method: 'GET', url: 'https://api.acme.test/v1/widgets/w3' }, { schema: Widget, deps: { fetch: read, ...noWait } })).toEqual({ id: 'w3' });
  });

  it('sends JSON, the query and the idempotency key on every attempt, and checks the answer', async () => {
    const fetch = scriptedFetch({ status: 503 }, { status: 201, json: { id: 'w1' } });
    const out = await providerRequest(ctx, call, {
      method: 'POST',
      url: 'https://api.acme.test/v1/widgets',
      query: { expand: 'owner', skip: undefined },
      json: { name: 'Bolt' },
      idempotencyKey: { header: 'Idempotency-Key', value: 'k-1' },
    }, { schema: Widget, deps: { fetch, ...noWait } });
    expect(out).toEqual({ id: 'w1' });
    expect(fetch.requests).toHaveLength(2);
    for (const r of fetch.requests) {
      expect(r.url.search).toBe('?expand=owner');
      expect(r.headers['idempotency-key']).toBe('k-1');
      expect(r.json).toEqual({ name: 'Bolt' });
    }
  });

  it("turns a failed answer into the integration's error, with what the provider's body says", async () => {
    const fetch = scriptedFetch({ status: 400, json: { error: { type: 'card_declined' } } });
    const err = await providerRequest(ctx, call, { method: 'POST', url: 'https://api.acme.test/v1/charge' }, {
      schema: Widget,
      error: AcmeError,
      failure: (_status, body) => ({ reason: 'card-declined', providerCode: (body as { error: { type: string } }).error.type }),
      deps: { fetch },
    }).catch((e) => e);
    expect(err).toBeInstanceOf(AcmeError);
    expect([err.code, err.category, err.providerCode, err.status]).toEqual(['acme/card-declined', 'invalid-request', 'card_declined', 400]);
  });

  it('fails a 2xx answer that carries a failure inside, before the schema, retrying only what the category allows', async () => {
    const fetch = scriptedFetch({ json: { results: [{ ok: false, code: 'DUPLICATE_VALUE' }] } });
    const err = await providerRequest(ctx, call, { method: 'POST', url: 'https://api.acme.test/v1/batch' }, {
      schema: Widget,
      error: AcmeError,
      failureInBody: (body) => {
        const failed = (body as { results: Array<{ ok: boolean; code: string }> }).results.find((r) => !r.ok);
        return failed ? { category: 'conflict', reason: 'duplicate', providerCode: failed.code } : undefined;
      },
      deps: { fetch },
    }).catch((e) => e);
    expect(err).toBeInstanceOf(AcmeError);
    expect([err.code, err.category, err.providerCode, err.status, fetch.requests.length]).toEqual(['acme/duplicate', 'conflict', 'DUPLICATE_VALUE', 200, 1]);
  });

  it('fails an answer in the wrong shape at the boundary', async () => {
    const fetch = scriptedFetch({ json: { nope: true } }, { json: { nope: true } }, { json: { nope: true } });
    await expect(providerRequest(ctx, call, { method: 'GET', url: 'https://api.acme.test/v1/w' }, { schema: Widget, deps: { fetch, ...noWait } })).rejects.toMatchObject({ code: 'acme/invalid-response' });
  });
});

describe('errors', () => {
  it('maps HTTP statuses to categories, and reads Retry-After', () => {
    expect([401, 403, 404, 409, 429, 500, 400, 422].map(categoryForStatus)).toEqual(['unauthorized', 'forbidden', 'not-found', 'conflict', 'rate-limited', 'unavailable', 'invalid-request', 'invalid-request']);
    expect(parseRetryAfter('2')).toBe(2000);
    expect(parseRetryAfter(new Date(10_000).toUTCString(), 4_000)).toBe(6000);
    expect(parseRetryAfter('9999')).toBe(300_000);
    expect(parseRetryAfter('soon')).toBeUndefined();
    expect(parseRateLimitReset('12')).toBe(12_000);
    expect(parseRateLimitReset('1700000030', 1_700_000_000_000)).toBe(30_000);
    expect(parseRateLimitReset('99999')).toBe(300_000);
    expect(parseRateLimitReset(undefined)).toBeUndefined();
  });
});

describe('assertProviderSpans', () => {
  it('fails on an attribute outside the table, or a value that looks like data', () => {
    expect(() => assertProviderSpans([{ name: 'x', attributes: { 'http.url': 'https://a.test/v1/c/123' } }])).toThrow(/http.url/);
    expect(() => assertProviderSpans([{ name: 'x', attributes: { 'error.type': 'someone@example.com' } }])).toThrow(/looks like data/);
  });
});
