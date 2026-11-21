import { type BillingEvent, DefaultBilling, MemoryBillingStore, createBillingWebhookHandler } from '@mariachi/billing';
import { InMemoryIdempotencyStore, createContext } from '@mariachi/core';
import { assertProviderSpans } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { describe, expect, it } from 'vitest';
import { fakePaddleBillingAdapter, paddleNotification, paddlePrice, signedPaddleWebhook } from './testing';
import { PaddleWebhookBody, paddleEventType, paddleWebhookAuth, signPaddleWebhook, verifyPaddleWebhook } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const secret = 'pdl_ntfset_01abc_secret';
const now = Math.floor(Date.now() / 1000);

describe('verifyPaddleWebhook', () => {
  const body = JSON.stringify(paddleNotification('subscription.updated', { id: 'sub_1' }, { eventId: 'evt_1' }));

  it('accepts ts=…;h1=… over "<ts>:<body>", and returns the signed event_id', () => {
    expect(verifyPaddleWebhook(body, { 'Paddle-Signature': signPaddleWebhook(secret, now, body) }, secret)).toEqual({ eventId: 'evt_1', timestampSeconds: now });
  });

  it('accepts either h1 while Paddle rotates, and either secret while you do', () => {
    const header = `ts=${now};h1=${'ab'.repeat(32)};h1=${signPaddleWebhook(secret, now, body).split('h1=')[1]}`;
    expect(verifyPaddleWebhook(body, { 'paddle-signature': header }, secret).eventId).toBe('evt_1');
    expect(verifyPaddleWebhook(body, { 'paddle-signature': signPaddleWebhook(secret, now, body) }, ['pdl_ntfset_new', secret]).eventId).toBe('evt_1');
  });

  it('refuses a forged, altered, unsigned or stale delivery', () => {
    const check = (headers: Record<string, string>, raw = body, opts = {}) => () => verifyPaddleWebhook(raw, headers, secret, opts);
    expect(check({ 'paddle-signature': signPaddleWebhook('pdl_ntfset_other', now, body) })).toThrow(/signature mismatch/);
    expect(check({ 'paddle-signature': signPaddleWebhook(secret, now, body) }, `${body} `)).toThrow(/signature mismatch/);
    expect(check({})).toThrow(/missing/);
    // Paddle's tolerance is five seconds
    expect(check({ 'paddle-signature': signPaddleWebhook(secret, now - 6, body) })).toThrow(/tolerance/);
    expect(check({ 'paddle-signature': signPaddleWebhook(secret, now - 60, body) }, body, { toleranceSeconds: 120 })).not.toThrow();
  });
});

describe('WebhookServer', () => {
  class PaddleWebhooks extends WebhookController {
    readonly prefix = 'paddle';
    readonly auth = paddleWebhookAuth(secret);
    init() {
      this.post('events', { mode: 'direct', procedure: 'billing.paddleEvent', eventType: paddleEventType }, async (_ctx, body) => PaddleWebhookBody.parse(body));
    }
  }

  it('receives a signed delivery once, with its span, and answers a forged one 401', async () => {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    const server = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer, idempotency: new InMemoryIdempotencyStore() }).registerController(new PaddleWebhooks());
    const post = (d: { rawBody: string; headers: Record<string, string> }) => server.inject({ method: 'POST', url: '/paddle/events', headers: { 'content-type': 'application/json', ...d.headers }, payload: d.rawBody });

    const notification = paddleNotification('transaction.completed', { id: 'txn_1' }, { eventId: 'evt_9' });
    expect((await post(signedPaddleWebhook(notification, secret))).statusCode).toBe(200);
    // Paddle retries with a fresh signature: the same event_id is a duplicate
    expect((await post(signedPaddleWebhook(notification, secret, now + 1))).json()).toMatchObject({ duplicate: true });
    expect((await post(signedPaddleWebhook(notification, 'pdl_ntfset_forged'))).statusCode).toBe(401);
    expect((await post(signedPaddleWebhook(notification, secret, now - 600))).statusCode).toBe(401);
    expect(received).toEqual([notification]);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])[0]).toEqual(['paddle webhook', 'server', 'transaction.completed']);
    assertProviderSpans(tracer.spans);
  });
});

describe('the billing port on Paddle', () => {
  function setup(options: { live?: boolean; requireLivemode?: boolean } = {}) {
    const pro = paddlePrice({ id: 'pri_pro', custom_data: { lookupKey: 'pro_monthly' } });
    const adapter = fakePaddleBillingAdapter(
      { prices: [pro, paddlePrice({ id: 'pri_seats', name: 'Seat' })] },
      { checkoutUrl: 'https://app.test/pay', ...(options.live ? { apiKey: 'pdl_live_apikey_fake' } : {}) },
    );
    const store = new MemoryBillingStore();
    const billing = new DefaultBilling({ adapter, store }, { logger });
    const received: BillingEvent[] = [];
    const webhooks = createBillingWebhookHandler(
      { adapter, store, secret, idempotency: new InMemoryIdempotencyStore(), requireLivemode: options.requireLivemode, onEvent: async (_c, e) => void received.push(e) },
      { logger },
    );
    const ctx = createContext({ logger, tenantId: 't1' });
    const deliver = (type: string, data: Record<string, unknown>, at?: { occurredAt?: Date; eventId?: string }) => {
      const { rawBody, signature } = signedPaddleWebhook(paddleNotification(type, data, at), secret);
      return webhooks.handle(undefined, Buffer.from(rawBody), signature);
    };
    return { adapter, store, billing, received, webhooks, ctx, deliver };
  }

  it('checks out, and the webhooks bring the subscription, the invoice and the payment into the mirror for the tenant', async () => {
    const { adapter, billing, received, ctx, deliver } = setup({ live: true, requireLivemode: true });
    const customer = await billing.ensureCustomer(ctx, { email: 'ada@example.com', name: 'Ada' });
    expect(await billing.ensureCustomer(ctx, { email: 'ada@example.com' }, { verify: true })).toEqual(customer);
    await expect(billing.subscribe(ctx, { priceId: 'pri_pro' })).rejects.toMatchObject({ code: 'billing/not-supported' });

    const checkout = await billing.createCheckout(ctx, { mode: 'subscription', priceId: 'pri_pro', successUrl: 'https://app.test/ok', cancelUrl: 'https://app.test/pricing' });
    expect(checkout.url).toBe(`https://app.test/pay?_ptxn=${checkout.id}`);
    expect(await billing.hasActiveSubscription(ctx)).toBe(false);

    const { transaction, subscription } = adapter.completeCheckout(checkout.id);
    expect(await deliver('subscription.created', subscription!, { eventId: 'evt_sub' })).toMatchObject({ outcome: 'processed', events: ['subscription.synced'] });
    expect(await deliver('transaction.completed', transaction, { eventId: 'evt_txn' })).toMatchObject({ events: ['invoice.paid', 'payment.succeeded', 'checkout.completed'] });
    // Paddle retries: the same event_id is a duplicate, whatever its signature
    expect((await deliver('transaction.completed', transaction, { eventId: 'evt_txn' })).outcome).toBe('duplicate');

    expect(await billing.hasActiveSubscription(ctx, ['pri_pro'])).toBe(true);
    expect(received.find((e) => e.type === 'checkout.completed')).toMatchObject({ tenantId: 't1', sessionId: checkout.id, subscriptionId: subscription!.id, mode: 'subscription' });
    expect(received.find((e) => e.type === 'invoice.paid')).toMatchObject({ tenantId: 't1', invoice: { amountPaid: 1000, currency: 'usd', status: 'paid' } });
    expect((await billing.listInvoices(ctx)).map((i) => i.id)).toEqual([checkout.id]);
  });

  it("ignores a sandbox key's events where live mode is required", async () => {
    const { deliver } = setup({ requireLivemode: true });
    expect((await deliver('price.updated', paddlePrice())).outcome).toBe('ignored');
  });

  it('changes, cancels and resumes through Paddle, keeping the mirror; a late webhook never overwrites newer state', async () => {
    const { adapter, billing, ctx, deliver, store, received } = setup();
    await billing.ensureCustomer(ctx, { email: 'ada@example.com' });
    const checkout = await billing.createCheckout(ctx, { mode: 'subscription', priceId: 'pri_pro', successUrl: 'https://a.test', cancelUrl: 'https://a.test' });
    const { subscription } = adapter.completeCheckout(checkout.id);
    const created = structuredClone(subscription!);
    await deliver('subscription.created', created, { occurredAt: new Date(Date.now() - 60_000) });

    const changed = await billing.changePlan(ctx, subscription!.id, { items: [{ priceId: 'pri_pro' }, { priceId: 'pri_seats', quantity: 3 }] });
    expect(changed.items).toEqual([{ id: 'pri_pro', priceId: 'pri_pro', quantity: 1 }, { id: 'pri_seats', priceId: 'pri_seats', quantity: 3 }]);
    expect((await billing.previewPlanChange(ctx, subscription!.id, { quantity: 2 })).prorationAmount).toBe(500);

    const canceling = await billing.cancelSubscription(ctx, subscription!.id);
    expect([canceling.status, canceling.cancelAtPeriodEnd]).toEqual(['active', true]);
    expect((await billing.resumeSubscription(ctx, subscription!.id)).cancelAtPeriodEnd).toBe(false);

    // A delivery from before the change arrives late: ignored
    received.length = 0;
    await deliver('subscription.updated', created, { occurredAt: new Date(Date.now() - 30_000) });
    expect(received).toEqual([]);
    expect((await store.findSubscription(subscription!.id))!.items).toHaveLength(2);

    // Canceled now through the service, which already mirrored it: the webhook only syncs
    await billing.cancelSubscription(ctx, subscription!.id, { atPeriodEnd: false });
    await deliver('subscription.canceled', adapter.state.subscriptions.get(subscription!.id)!, { occurredAt: new Date(Date.now() + 1000) });
    expect(received.map((e) => e.type)).toEqual(['subscription.synced']);
  });

  it('refunds, and reports charge.refunded once Paddle approves the refund', async () => {
    const { adapter, billing, ctx, deliver, received } = setup();
    await billing.ensureCustomer(ctx, { email: 'ada@example.com' });
    const checkout = await billing.createCheckout(ctx, { mode: 'payment', priceId: 'pri_pro', successUrl: 'https://a.test', cancelUrl: 'https://a.test' });
    adapter.completeCheckout(checkout.id);
    const refund = await billing.refund(ctx, checkout.id, { amount: 400, idempotencyKey: 'refund-1' });
    expect([refund.status, refund.amount]).toEqual(['pending', 400]);

    const adjustment = adapter.state.adjustments.get(refund.id)!;
    await deliver('adjustment.created', adjustment);
    expect(received).toEqual([]);
    adjustment.status = 'approved';
    await deliver('adjustment.updated', adjustment);
    expect(received).toMatchObject([{ type: 'charge.refunded', tenantId: 't1', refund: { id: refund.id, status: 'succeeded' }, charge: { id: checkout.id, amount: 1000, amountRefunded: 400 } }]);
  });

  it('reports usage once per key, and finds plans by the lookup key in custom_data', async () => {
    const { adapter, billing, ctx, deliver, received } = setup();
    await billing.ensureCustomer(ctx, { email: 'ada@example.com' });
    expect(await billing.reportUsage(ctx, { metricName: 'api_calls', quantity: 3, idempotencyKey: 'req-1' })).toBe(true);
    expect(await billing.reportUsage(ctx, { metricName: 'api_calls', quantity: 3, idempotencyKey: 'req-1' })).toBe(false);
    expect([...adapter.state.usageEvents.values()]).toMatchObject([{ event_key: 'req-1', action: 'api_calls', quantity: '3' }]);
    expect((await billing.findPlanByLookupKey(ctx, 'pro_monthly'))?.id).toBe('pri_pro');
    expect(await billing.syncPlans(ctx)).toBe(2);
    // A price event carries the product as an id only: the product fields from syncPlans are kept
    const { product: _product, ...bare } = adapter.state.prices.get('pri_pro')!;
    await deliver('price.updated', { ...bare, status: 'archived' }, { occurredAt: new Date(Date.now() + 1000) });
    expect(received.at(-1)).toMatchObject({ type: 'plan.synced', plan: { id: 'pri_pro', active: false, name: 'Monthly', lookupKey: 'pro_monthly' } });
  });

  it('refuses a forged or stale delivery before touching the mirror, and replays a stored one', async () => {
    const { webhooks, store, deliver } = setup();
    const notification = paddleNotification('price.updated', paddlePrice({ id: 'pri_x' }));
    const forged = signedPaddleWebhook(notification, 'pdl_ntfset_forged');
    await expect(webhooks.handle(undefined, forged.rawBody, forged.signature)).rejects.toMatchObject({ code: 'billing/webhook-invalid-signature' });
    const stale = signedPaddleWebhook(notification, secret, now - 60);
    await expect(webhooks.handle(undefined, stale.rawBody, stale.signature)).rejects.toMatchObject({ code: 'billing/webhook-invalid-signature' });
    expect(await store.findPlan('pri_x')).toBeNull();

    await deliver('price.updated', paddlePrice({ id: 'pri_y' }), { eventId: 'evt_price' });
    expect((await webhooks.replay(undefined, 'evt_price')).events).toEqual(['plan.synced']);
    expect((await store.findPlan('pri_y'))?.productId).toBeTruthy();
  });
});
