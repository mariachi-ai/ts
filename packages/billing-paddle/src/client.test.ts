import { createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { describe, expect, it } from 'vitest';
import { createPaddle, paddleEnvironment } from './client';
import { PaddleError } from './errors';
import { settings } from './generated';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger, tenantId: 't1' });
const sandboxKey = 'pdl_sdbx_apikey_01abc_secret';
const liveKey = 'pdl_live_apikey_01abc_secret';
const noWait = { sleep: async () => {} };
const customer = { id: 'ctm_1', email: 'a@b.co', name: 'Ada', status: 'active', custom_data: { tenantId: 't1' } };

describe('the client', () => {
  it('calls the sandbox for a sandbox key, with the key and the API version, one span per call and nothing sensitive on it', async () => {
    const fetch = scriptedFetch({ json: { data: customer, meta: { request_id: 'r' } } });
    const tracer = new TestTracer();
    const got = await createPaddle({ apiKey: sandboxKey }, { fetch, tracer }).customers.get(ctx, 'ctm_1');
    expect(got.email).toBe('a@b.co');
    const [req] = fetch.requests;
    expect(req!.url.href).toBe('https://sandbox-api.paddle.com/customers/ctm_1');
    expect([req!.headers.authorization, req!.headers['paddle-version']]).toEqual([`Bearer ${sandboxKey}`, '1']);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address'], s.attributes['mariachi.integration.category']])).toEqual([
      ['paddle customers.get', 'client', 'sandbox-api.paddle.com', 'payments'],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('calls the live API for a live key', async () => {
    const fetch = scriptedFetch({ json: { data: [], meta: {} } });
    await createPaddle({ apiKey: liveKey }, { fetch }).eventTypes.list(null);
    expect(fetch.requests[0]!.url.href).toBe('https://api.paddle.com/event-types');
  });

  it('needs the environment for a key without a prefix, and refuses one that disagrees with the key', () => {
    expect(paddleEnvironment('0123456789abcdef', 'sandbox')).toBe('sandbox');
    expect(() => paddleEnvironment('0123456789abcdef')).toThrow(/PADDLE_ENVIRONMENT/);
    expect(() => paddleEnvironment(sandboxKey, 'production')).toThrow(/sandbox key/);
    expect(() => paddleEnvironment(liveKey, 'staging')).toThrow(/sandbox or production/);
  });

  it('pages through every price by the after cursor in meta.pagination.next', async () => {
    const price = (id: string) => ({ id, product_id: 'pro_1', name: null, unit_price: { amount: '100', currency_code: 'USD' }, status: 'active', custom_data: null });
    const fetch = scriptedFetch(
      { json: { data: [price('pri_1')], meta: { pagination: { has_more: true, next: 'https://sandbox-api.paddle.com/prices?after=pri_1' } } } },
      { json: { data: [price('pri_2')], meta: { pagination: { has_more: false, next: 'https://sandbox-api.paddle.com/prices?after=pri_2' } } } },
    );
    const seen: string[] = [];
    for await (const p of createPaddle({ apiKey: sandboxKey }, { fetch }).prices.all(ctx, { status: ['active', 'archived'] })) seen.push(p.id);
    expect(seen).toEqual(['pri_1', 'pri_2']);
    expect(fetch.requests[0]!.url.searchParams.get('include')).toBe('product');
    expect(fetch.requests[0]!.url.searchParams.get('status')).toBe('active,archived');
    expect(fetch.requests[1]!.url.searchParams.get('after')).toBe('pri_1');
  });

  it("fails as a PaddleError with Paddle's code and never its detail, retrying only what's worth retrying", async () => {
    const fetch = scriptedFetch(
      { status: 429, headers: { 'retry-after': '0' }, json: { error: { type: 'api_error', code: 'too_many_requests', detail: 'slow down' } } },
      { status: 409, json: { error: { type: 'request_error', code: 'customer_already_exists', detail: 'Customer email conflicts with existing customer ID ctm_x.' } } },
    );
    const tracer = new TestTracer();
    const err = await createPaddle({ apiKey: sandboxKey }, { fetch, tracer, ...noWait }).customers.create(ctx, { email: 'a@b.co' }).catch((e) => e);
    expect(err).toBeInstanceOf(PaddleError);
    expect([err.code, err.category, err.providerCode, fetch.requests.length]).toEqual(['paddle/customer-exists', 'conflict', 'customer_already_exists', 2]);
    expect(err.message).not.toContain('ctm_x');
    expect(tracer.spans[0]!.attributes['error.type']).toBe('customer_already_exists');
    assertProviderSpans(tracer.spans);
  });

  it('makes a refund once: no retry when Paddle is unavailable, since it takes no idempotency key', async () => {
    const fetch = scriptedFetch({ status: 503, json: { error: { type: 'api_error', code: 'service_unavailable' } } });
    const err = await createPaddle({ apiKey: sandboxKey }, { fetch, ...noWait })
      .adjustments.create(ctx, { action: 'refund', type: 'full', transaction_id: 'txn_1', reason: 'requested_by_customer' })
      .catch((e) => e);
    expect([err.category, fetch.requests.length]).toEqual(['unavailable', 1]);
  });

  it('checks its input before calling', async () => {
    const paddle = createPaddle({ apiKey: sandboxKey }, { fetch: scriptedFetch() });
    await expect(paddle.customers.create(ctx, { email: 'not an email' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(paddle.usageEvents.create(ctx, { events: [{ event_key: 'k', customer_id: 'ctm_1', action: 'API Calls', quantity: '1', occurred_at: '2026-11-21T00:00:00Z' }] })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(paddle.usageEvents.create(ctx, { events: [{ event_key: 'k', customer_id: 'ctm_1', action: 'api_calls', quantity: '0', occurred_at: '2026-11-21T00:00:00Z' }] })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(paddle.subscriptions.get(ctx, '')).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('settings', () => {
  const setting = (key: string) => settings.find((s) => s.key === key)!;

  it('reads from the environment by name, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ PADDLE_API_KEY: sandboxKey, PADDLE_CLIENT_TOKEN: 'test_abc' })[n])).toEqual({ apiKey: sandboxKey, clientToken: 'test_abc' });
    expect(settings.every((s) => s.whereToFind)).toBe(true);
    expect(setting('clientToken').public).toBe(true);
  });

  it('refuses a live key or token in test, and a sandbox one in production', () => {
    expect(checkSetting(setting('apiKey'), 'test', liveKey)).toMatch(/live Paddle API key/);
    expect(checkSetting(setting('apiKey'), 'test', sandboxKey)).toBeNull();
    expect(checkSetting(setting('apiKey'), 'production', sandboxKey)).toMatch(/sandbox Paddle API key/);
    expect(checkSetting(setting('apiKey'), 'production', liveKey)).toBeNull();
    expect(checkSetting(setting('clientToken'), 'test', 'live_abc')).toMatch(/live client-side token/);
    expect(checkSetting(setting('clientToken'), 'production', 'test_abc')).toMatch(/sandbox client-side token/);
    expect(checkSetting(setting('clientToken'), 'production', 'live_abc')).toBeNull();
  });
});
