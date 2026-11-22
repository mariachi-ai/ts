import { InMemoryIdempotencyStore, createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { describe, expect, it } from 'vitest';
import { createRevenueCat } from './client';
import { activeEntitlements, customersToRefresh, isEntitled } from './entitlements';
import { RevenueCatError } from './errors';
import { settings } from './generated';
import { fakeRevenueCat, revenueCatCustomer, revenueCatEvent, signedRevenueCatWebhook } from './testing';
import { RevenueCatWebhookBody, type RevenueCatWebhookAuthOptions, revenueCatEventType, revenueCatWebhookAuth } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const config = { secretKey: 'sk_test', projectId: 'proj1ab2c3d4' };
const noWait = { sleep: async () => {} };
const BASE = 'https://api.revenuecat.com/v2/projects/proj1ab2c3d4';
const customerJson = (id: string, items: unknown[], nextPage: string | null = null) => ({
  object: 'customer',
  id,
  project_id: 'proj1ab2c3d4',
  first_seen_at: 1,
  last_seen_at: null,
  active_entitlements: { object: 'list', items, next_page: nextPage, url: '/v2/…' },
});

describe('the client', () => {
  it('reads a customer with the secret key, one span per call, and nothing sensitive on it', async () => {
    const fetch = scriptedFetch({ json: customerJson('user 1', [{ object: 'customer.active_entitlement', entitlement_id: 'entl_pro', expires_at: null }]) });
    const tracer = new TestTracer();
    const customer = await createRevenueCat(config, { fetch, tracer }).customers.get(ctx, 'user 1');
    expect(isEntitled(customer, 'entl_pro')).toBe(true);
    const [req] = fetch.requests;
    expect([req!.method, req!.url.href]).toEqual(['GET', `${BASE}/customers/user%201`]);
    expect(req!.headers.authorization).toBe('Bearer sk_test');
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([['revenuecat customers.get', 'client', 'api.revenuecat.com']]);
    assertProviderSpans(tracer.spans);
  });

  it("fetches every page of a customer's active entitlements", async () => {
    const fetch = scriptedFetch(
      { json: customerJson('u1', [{ entitlement_id: 'entl_a', expires_at: null }], '/v2/projects/proj1ab2c3d4/customers/u1/active_entitlements?starting_after=entl_a') },
      { json: { object: 'list', items: [{ entitlement_id: 'entl_b', expires_at: null }], next_page: null, url: '/v2/…' } },
    );
    const tracer = new TestTracer();
    const customer = await createRevenueCat(config, { fetch, tracer }).customers.get(ctx, 'u1');
    expect(activeEntitlements(customer)).toEqual(['entl_a', 'entl_b']);
    expect(fetch.requests[1]!.url.href).toBe(`${BASE}/customers/u1/active_entitlements?limit=100&starting_after=entl_a`);
    expect(tracer.spans.map((s) => s.name)).toEqual(['revenuecat customers.get', 'revenuecat activeEntitlements.list']);
    assertProviderSpans(tracer.spans);
  });

  it('grants a promotional entitlement until a time, and revokes it', async () => {
    const fetch = scriptedFetch({ status: 201, json: customerJson('u1', [{ entitlement_id: 'entl_pro', expires_at: 1_800_000_000_000 }]) }, { json: customerJson('u1', []) });
    const tracer = new TestTracer();
    const rc = createRevenueCat(config, { fetch, tracer });
    await rc.customers.grantEntitlement(ctx, { customerId: 'u1', entitlementId: 'entl_pro', expiresAt: new Date(1_800_000_000_000) });
    await rc.customers.revokeGrantedEntitlement(ctx, { customerId: 'u1', entitlementId: 'entl_pro' });
    expect(fetch.requests.map((r) => [r.method, r.url.pathname, r.json])).toEqual([
      ['POST', '/v2/projects/proj1ab2c3d4/customers/u1/actions/grant_entitlement', { entitlement_id: 'entl_pro', expires_at: 1_800_000_000_000 }],
      ['POST', '/v2/projects/proj1ab2c3d4/customers/u1/actions/revoke_granted_entitlement', { entitlement_id: 'entl_pro' }],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('pages through every subscription by the cursor in next_page, filtered by environment', async () => {
    const sub = (id: string) => ({
      object: 'subscription', id, customer_id: 'u1', product_id: 'monthly', starts_at: 1, current_period_starts_at: 1, current_period_ends_at: 2, ends_at: null,
      gives_access: true, pending_payment: false, auto_renewal_status: 'will_renew', status: 'active', environment: 'production', store: 'app_store', store_subscription_identifier: 's',
    });
    const fetch = scriptedFetch(
      { json: { object: 'list', items: [sub('a'), sub('b')], next_page: '/v2/projects/proj1ab2c3d4/customers/u1/subscriptions?environment=production&starting_after=b', url: '' } },
      { json: { object: 'list', items: [sub('c')], next_page: null, url: '' } },
    );
    const tracer = new TestTracer();
    const seen: string[] = [];
    for await (const s of createRevenueCat(config, { fetch, tracer }).subscriptions.all(ctx, { customerId: 'u1', environment: 'production' })) seen.push(s.id);
    expect(seen).toEqual(['a', 'b', 'c']);
    expect(fetch.requests[0]!.url.search).toBe('?limit=100&environment=production');
    expect(fetch.requests[1]!.url.searchParams.get('starting_after')).toBe('b');
    assertProviderSpans(tracer.spans);
  });

  it('lists offerings with their packages and products expanded, and products of one app', async () => {
    const fetch = scriptedFetch({ json: { object: 'list', items: [], next_page: null, url: '' } }, { json: { object: 'list', items: [], next_page: null, url: '' } });
    const rc = createRevenueCat(config, { fetch });
    await rc.offerings.list(ctx);
    await rc.products.list(ctx, { appId: 'app1a2b3c4', limit: 50 });
    expect(fetch.requests[0]!.url.searchParams.getAll('expand')).toEqual(['items.package', 'items.package.product']);
    expect(fetch.requests[1]!.url.href).toBe(`${BASE}/products?limit=50&app_id=app1a2b3c4`);
  });

  it("fails as a RevenueCatError with RevenueCat's type, retrying only rate limits and outages", async () => {
    const fetch = scriptedFetch(
      { status: 429, headers: { 'retry-after': '0' }, json: { object: 'error', type: 'rate_limit_error', message: 'slow', retryable: true, backoff_ms: 0 } },
      { status: 404, json: { object: 'error', type: 'resource_missing', message: 'Customer user@example.com not found', retryable: false } },
    );
    const tracer = new TestTracer();
    const err = await createRevenueCat(config, { fetch, tracer, ...noWait }).customers.get(ctx, 'gone').catch((e) => e);
    expect(err).toBeInstanceOf(RevenueCatError);
    expect([err.code, err.category, err.providerCode, fetch.requests.length]).toEqual(['revenuecat/not-found', 'not-found', 'resource_missing', 2]);
    expect(err.message).not.toContain('example.com');
    assertProviderSpans(tracer.spans);

    const store = scriptedFetch({ status: 422, json: { object: 'error', type: 'store_error', message: 'x', retryable: true } }, { status: 400, json: { object: 'error', type: 'parameter_error', param: 'expires_at', message: 'x', retryable: false } });
    const bad = await createRevenueCat(config, { fetch: store, ...noWait }).customers.grantEntitlement(ctx, { customerId: 'u1', entitlementId: 'entl_pro', expiresAt: 1 }).catch((e) => e);
    expect([bad.code, bad.category, store.requests.length]).toEqual(['revenuecat/invalid-parameter', 'invalid-request', 2]);
  });

  it('checks its input before calling', async () => {
    const fetch = scriptedFetch();
    const rc = createRevenueCat(config, { fetch });
    await expect(rc.customers.get(ctx, '')).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(rc.customers.grantEntitlement(ctx, { customerId: 'u1', entitlementId: 'entl_pro', expiresAt: -5 })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    expect(fetch.requests).toHaveLength(0);
  });
});

describe('settings', () => {
  it('reads from the environment by name, needs the project id, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ REVENUECAT_SECRET_KEY: 'sk_1', REVENUECAT_PROJECT_ID: 'proj1' })[n])).toEqual({ secretKey: 'sk_1', projectId: 'proj1' });
    expect(() => settingsFromEnv(settings, (n) => ({ REVENUECAT_SECRET_KEY: 'sk_1' })[n])).toThrow(/REVENUECAT_PROJECT_ID/);
    expect(settings.every((s) => s.whereToFind)).toBe(true);
    expect(settings.filter((s) => s.public).map((s) => s.env)).toEqual(['REVENUECAT_PUBLIC_KEY_IOS', 'REVENUECAT_PUBLIC_KEY_ANDROID', 'REVENUECAT_PUBLIC_KEY_WEB']);
    expect(checkSetting(settings[0]!, 'test', 'sk_1')).toBeNull();
  });
});

describe('entitlements', () => {
  const customer = revenueCatCustomer('u1', [
    { entitlement_id: 'entl_pro', expires_at: Date.parse('2026-12-01T00:00:00Z') },
    { entitlement_id: 'entl_lifetime', expires_at: null },
  ]);

  it('reads access at a time, so a customer read earlier still answers right', () => {
    expect(isEntitled(customer, 'entl_pro', new Date('2026-11-21T00:00:00Z'))).toBe(true);
    expect(isEntitled(customer, 'entl_pro', new Date('2026-12-02T00:00:00Z'))).toBe(false);
    expect(activeEntitlements(customer, Date.parse('2026-12-02T00:00:00Z'))).toEqual(['entl_lifetime']);
    expect(isEntitled(customer.active_entitlements.items, 'entl_other')).toBe(false);
  });

  it("names the customers a webhook is about, both sides of a transfer", () => {
    expect(customersToRefresh({ app_user_id: 'u1' })).toEqual(['u1']);
    expect(customersToRefresh({ transferred_from: ['old'], transferred_to: ['new', 'old'] })).toEqual(['old', 'new']);
  });
});

describe('webhooks', () => {
  const SIGNING = 'rc_signing_secret';
  const AUTH = 'Bearer long-random-value';

  function serverWith(auth: RevenueCatWebhookAuthOptions, tracer = new TestTracer()) {
    const received: unknown[] = [];
    class RevenueCatWebhooks extends WebhookController {
      readonly prefix = 'revenuecat';
      readonly auth = revenueCatWebhookAuth(auth);
      init() {
        this.post('events', { mode: 'direct', procedure: 'billing.fromRevenueCat', eventType: revenueCatEventType }, async (_ctx, body) => RevenueCatWebhookBody.parse(body));
      }
    }
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    const server = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer, idempotency: new InMemoryIdempotencyStore() }).registerController(new RevenueCatWebhooks());
    const post = (d: { rawBody: string; headers: Record<string, string> }) => server.inject({ method: 'POST', url: '/revenuecat/events', headers: { 'content-type': 'application/json', ...d.headers }, payload: d.rawBody });
    return { received, post, tracer };
  }

  it('receives an HMAC-signed delivery with its span, and refuses a forged, altered or stale one', async () => {
    const { received, post, tracer } = serverWith({ signingSecret: SIGNING });
    const event = revenueCatEvent({ id: 'evt_1', type: 'INITIAL_PURCHASE', app_user_id: 'u1', entitlement_ids: ['pro'] });
    const signed = signedRevenueCatWebhook(event, { signingSecret: SIGNING });
    expect((await post(signed)).statusCode).toBe(200);
    const body = received[0] as ReturnType<typeof RevenueCatWebhookBody.parse>;
    expect([body.event.type, customersToRefresh(body.event)]).toEqual(['INITIAL_PURCHASE', ['u1']]);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])).toEqual([['revenuecat webhook', 'server', 'INITIAL_PURCHASE']]);

    expect((await post(signedRevenueCatWebhook(event, { signingSecret: 'someone-else' }))).statusCode).toBe(401);
    expect((await post({ ...signed, rawBody: `${signed.rawBody} ` })).statusCode).toBe(401);
    expect((await post(signedRevenueCatWebhook(event, { signingSecret: SIGNING, timestampSeconds: Math.floor(Date.now() / 1000) - 3600 }))).statusCode).toBe(401);
    expect((await post({ rawBody: signed.rawBody, headers: {} })).statusCode).toBe(401);
    expect(received).toHaveLength(1);
  });

  it('dedupes a retry on event.id, though RevenueCat signs each attempt afresh', async () => {
    const { received, post } = serverWith({ signingSecret: SIGNING });
    const event = revenueCatEvent({ id: 'evt_retry', type: 'RENEWAL', app_user_id: 'u1' });
    expect((await post(signedRevenueCatWebhook(event, { signingSecret: SIGNING, timestampSeconds: Math.floor(Date.now() / 1000) - 60 }))).statusCode).toBe(200);
    const again = await post(signedRevenueCatWebhook(event, { signingSecret: SIGNING }));
    expect([again.statusCode, again.json()]).toEqual([200, { ok: true, duplicate: true }]);
    expect(received).toHaveLength(1);
  });

  it('checks the Authorization header when no signing secret is set, and both when both are', async () => {
    const event = revenueCatEvent({ type: 'EXPIRATION', app_user_id: 'u1' });
    const headerOnly = serverWith({ authorization: AUTH });
    expect((await headerOnly.post(signedRevenueCatWebhook(event, { authorization: AUTH }))).statusCode).toBe(200);
    expect((await headerOnly.post(signedRevenueCatWebhook(revenueCatEvent({ type: 'EXPIRATION' }), { authorization: 'Bearer guess' }))).statusCode).toBe(401);

    const both = serverWith({ authorization: AUTH, signingSecret: SIGNING });
    expect((await both.post(signedRevenueCatWebhook(revenueCatEvent({ type: 'RENEWAL' }), { authorization: AUTH }))).statusCode).toBe(401);
    expect((await both.post(signedRevenueCatWebhook(revenueCatEvent({ type: 'RENEWAL' }), { signingSecret: SIGNING }))).statusCode).toBe(401);
    expect((await both.post(signedRevenueCatWebhook(revenueCatEvent({ type: 'RENEWAL' }), { authorization: AUTH, signingSecret: SIGNING }))).statusCode).toBe(200);
  });

  it('refuses to start with neither secret', () => {
    expect(() => revenueCatWebhookAuth({ authorization: '', signingSecret: [] })).toThrow(expect.objectContaining({ code: 'webhooks/invalid-secret' }));
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests, grants changing access', async () => {
    const rc = fakeRevenueCat({ customers: [revenueCatCustomer('u1')] });
    expect(isEntitled(await rc.customers.get(ctx, 'u1'), 'entl_pro')).toBe(false);
    await rc.customers.grantEntitlement(ctx, { customerId: 'u1', entitlementId: 'entl_pro', expiresAt: Date.now() + 86_400_000 });
    expect(isEntitled(await rc.customers.get(ctx, 'u1'), 'entl_pro')).toBe(true);
    await rc.customers.revokeGrantedEntitlement(ctx, { customerId: 'u1', entitlementId: 'entl_pro' });
    expect(isEntitled(await rc.customers.get(ctx, 'u1'), 'entl_pro')).toBe(false);
    await expect(rc.customers.get(ctx, 'nope')).rejects.toMatchObject({ code: 'not-found' });
  });
});
