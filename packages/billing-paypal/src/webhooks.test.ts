import { MemoryBillingStore } from '@mariachi/billing';
import { createContext } from '@mariachi/core';
import { assertProviderSpans } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { describe, expect, it } from 'vitest';
import { normalizePayPalEvent } from './events';
import { fakePayPal, payPalEvent, payPalWebhookSigner } from './testing';
import { PayPalWebhookBody, crc32, payPalEventType, payPalWebhookAuth } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger, tenantId: 't1' });
const WEBHOOK_ID = '1JE4291016473214C';

function server(auth: ReturnType<typeof payPalWebhookAuth>, tracer?: TestTracer) {
  const received: unknown[] = [];
  class PayPalWebhooks extends WebhookController {
    readonly prefix = 'paypal';
    readonly auth = auth;
    init() {
      this.post('events', { mode: 'direct', procedure: 'billing.paypalEvent', eventType: payPalEventType }, async (_ctx, body) => PayPalWebhookBody.parse(body));
    }
  }
  const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
  const webhooks = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer }).registerController(new PayPalWebhooks());
  const post = (rawBody: string, headers: Record<string, string>) => webhooks.inject({ method: 'POST', url: '/paypal/events', headers: { 'content-type': 'application/json', ...headers }, payload: rawBody });
  return { received, post };
}

const capture = { id: '3C679366HH908993F', status: 'COMPLETED', amount: { currency_code: 'USD', value: '49.00' }, custom_id: 'paypal:t1' };

describe('webhooks', () => {
  it('CRC32 is the zlib one PayPal signs', () => {
    expect(crc32(Buffer.from('123456789'))).toBe(0xcbf43926);
    expect(crc32(Buffer.alloc(0))).toBe(0);
  });

  it('receives a signed delivery through WebhookServer, fetching the certificate once, with its spans', async () => {
    const signer = payPalWebhookSigner();
    let fetched = 0;
    const tracer = new TestTracer();
    const fetch: typeof globalThis.fetch = async (input, init) => {
      fetched++;
      return signer.fetch(input, init);
    };
    const { received, post } = server(payPalWebhookAuth({ webhookId: WEBHOOK_ID, environment: 'sandbox' }, { fetch, tracer }), tracer);
    const event = payPalEvent('PAYMENT.CAPTURE.COMPLETED', capture);
    const first = signer.sign(event, { webhookId: WEBHOOK_ID });
    expect((await post(first.rawBody, first.headers)).statusCode).toBe(200);
    const second = signer.sign(payPalEvent('BILLING.SUBSCRIPTION.ACTIVATED', { id: 'I-1', status: 'ACTIVE' }), { webhookId: WEBHOOK_ID });
    expect((await post(second.rawBody, second.headers)).statusCode).toBe(200);

    expect(received.map((b) => (b as { event_type: string }).event_type)).toEqual(['PAYMENT.CAPTURE.COMPLETED', 'BILLING.SUBSCRIPTION.ACTIVATED']);
    expect(fetched).toBe(1);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event'] ?? s.attributes['server.address']])).toEqual([
      ['paypal webhook', 'server', 'PAYMENT.CAPTURE.COMPLETED'],
      ['paypal webhookCerts.get', 'client', 'api.sandbox.paypal.com'],
      ['paypal webhook', 'server', 'BILLING.SUBSCRIPTION.ACTIVATED'],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('refuses a forged, altered or misaddressed delivery', async () => {
    const signer = payPalWebhookSigner();
    const other = payPalWebhookSigner();
    let fetched = 0;
    const fetch: typeof globalThis.fetch = async (input, init) => {
      fetched++;
      return signer.fetch(input, init);
    };
    const { received, post } = server(payPalWebhookAuth({ webhookId: WEBHOOK_ID, environment: 'sandbox' }, { fetch }));
    const event = payPalEvent('PAYMENT.CAPTURE.COMPLETED', capture);
    const good = signer.sign(event, { webhookId: WEBHOOK_ID });

    // Signed with another key, but naming this signer's certificate
    const forged = other.sign(event, { webhookId: WEBHOOK_ID });
    expect((await post(forged.rawBody, { ...forged.headers, 'paypal-cert-url': signer.certUrl })).statusCode).toBe(401);
    // The body changed after signing
    expect((await post(good.rawBody.replace('49.00', '0.01'), good.headers)).statusCode).toBe(401);
    // Signed for another webhook
    const elsewhere = signer.sign(event, { webhookId: 'SOMEONE-ELSES' });
    expect((await post(elsewhere.rawBody, elsewhere.headers)).statusCode).toBe(401);
    const before = fetched;
    // A certificate from anywhere but PayPal's sandbox API, refused without fetching it
    for (const url of ['https://evil.test/v1/notifications/certs/CERT-1', 'http://api.sandbox.paypal.com/v1/notifications/certs/CERT-1', 'https://api.paypal.com/v1/notifications/certs/CERT-1', 'https://api.sandbox.paypal.com/v1/other']) {
      expect((await post(good.rawBody, { ...good.headers, 'paypal-cert-url': url })).statusCode).toBe(401);
    }
    expect(fetched).toBe(before);
    expect((await post(good.rawBody, { ...good.headers, 'paypal-auth-algo': 'SHA1withRSA' })).statusCode).toBe(401);
    expect(received).toHaveLength(0);
  });

  it('dedupes on the signed transmission id, and can refuse an old transmission', async () => {
    const signer = payPalWebhookSigner();
    const auth = payPalWebhookAuth({ webhookId: [WEBHOOK_ID, 'WH-NEXT'], environment: 'sandbox', toleranceSeconds: 300 }, { fetch: signer.fetch });
    const { post } = server(auth);
    const old = signer.sign(payPalEvent('PAYMENT.CAPTURE.COMPLETED', capture), { webhookId: WEBHOOK_ID, transmissionTime: new Date(Date.now() - 3_600_000).toISOString() });
    expect((await post(old.rawBody, old.headers)).statusCode).toBe(401);
    const rotated = signer.sign(payPalEvent('PAYMENT.CAPTURE.COMPLETED', capture), { webhookId: 'WH-NEXT', transmissionId: 'tx-1' });
    const identity = await auth.auth({ rawBody: Buffer.from(rotated.rawBody), headers: rotated.headers } as never, { logger } as never);
    expect(identity?.eventId).toBe('transmission:tx-1');
  });
});

describe('normalizePayPalEvent', () => {
  async function paidOrder() {
    const paypal = fakePayPal();
    const order = await paypal.orders.create(ctx, { amount: 4_900, currency: 'usd', customId: 'paypal:t1' });
    paypal.approveOrder(order.id);
    const captured = await paypal.orders.capture(ctx, { orderId: order.id });
    return { paypal, order, capture: captured.purchase_units![0]!.payments!.captures![0]! };
  }

  it("reports a completed capture as payment.succeeded for the order's tenant, from PayPal's own state", async () => {
    const { paypal, order, capture: captured } = await paidOrder();
    const store = new MemoryBillingStore();
    // The body says a different amount: what PayPal's API says is what counts
    const event = payPalEvent('PAYMENT.CAPTURE.COMPLETED', { ...captured, amount: { currency_code: 'USD', value: '1.00' } });
    const [result] = await normalizePayPalEvent(ctx, event, { paypal, store });
    expect(result).toMatchObject({ type: 'payment.succeeded', tenantId: 't1', charge: { id: order.id, amount: 4_900, status: 'succeeded' } });
    expect((await store.listWebhookEvents()).length).toBe(0);
  });

  it('reports a refund as charge.refunded, with the refund and what is left of the charge', async () => {
    const { paypal, order, capture } = await paidOrder();
    const refund = await paypal.captures.refund(ctx, { captureId: capture.id, amount: 900, currency: 'usd' });
    const events = await normalizePayPalEvent(ctx, payPalEvent('PAYMENT.CAPTURE.REFUNDED', refund, 'refund'), { paypal });
    expect(events).toMatchObject([{ type: 'charge.refunded', tenantId: 't1', refund: { id: refund.id, chargeId: order.id, amount: 900 }, charge: { id: order.id, amountRefunded: 900 } }]);
  });

  it('mirrors subscription changes, and reports a cancellation once', async () => {
    const paypal = fakePayPal();
    const plan = await paypal.plans.create(ctx, { productId: 'PROD-1', name: 'Pro', amount: 1_200, currency: 'usd', interval: 'month' });
    const sub = await paypal.subscriptions.create(ctx, { planId: plan.id, customId: 'paypal:t1' });
    paypal.approveSubscription(sub.id);
    const store = new MemoryBillingStore();
    const activated = await normalizePayPalEvent(ctx, payPalEvent('BILLING.SUBSCRIPTION.ACTIVATED', { id: sub.id, status: 'ACTIVE' }), { paypal, store });
    expect(activated.map((e) => e.type)).toEqual(['subscription.synced']);
    expect(await store.findSubscription(sub.id)).toMatchObject({ status: 'active', tenantId: 't1', planId: plan.id });

    await paypal.subscriptions.cancel(ctx, { subscriptionId: sub.id, reason: 'test' });
    const cancelled = payPalEvent('BILLING.SUBSCRIPTION.CANCELLED', { id: sub.id, status: 'CANCELLED' });
    cancelled.create_time = new Date(Date.now() + 1000).toISOString();
    expect((await normalizePayPalEvent(ctx, cancelled, { paypal, store })).map((e) => e.type)).toEqual(['subscription.synced', 'subscription.canceled']);
    expect(await normalizePayPalEvent(ctx, payPalEvent('CHECKOUT.ORDER.APPROVED', { id: 'O1' }), { paypal, store })).toEqual([]);
  });

  it('shows a failed renewal as past_due, still entitled', async () => {
    const paypal = fakePayPal();
    const plan = await paypal.plans.create(ctx, { productId: 'PROD-1', name: 'Pro', amount: 1_200, currency: 'usd', interval: 'month' });
    const sub = await paypal.subscriptions.create(ctx, { planId: plan.id, customId: 'paypal:t1' });
    paypal.approveSubscription(sub.id);
    paypal.subscriptions_.get(sub.id)!.billing_info = { failed_payments_count: 1 };
    const [synced] = await normalizePayPalEvent(ctx, payPalEvent('BILLING.SUBSCRIPTION.PAYMENT.FAILED', { id: sub.id, status: 'ACTIVE' }), { paypal });
    expect(synced).toMatchObject({ type: 'subscription.synced', subscription: { status: 'past_due' } });
  });
});
