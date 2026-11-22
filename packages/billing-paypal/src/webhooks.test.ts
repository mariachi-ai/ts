import { MemoryBillingStore, createBillingWebhookHandler } from '@mariachi/billing';
import { InMemoryIdempotencyStore } from '@mariachi/core';
import { createContext } from '@mariachi/core';
import { assertProviderSpans } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { describe, expect, it } from 'vitest';
import { createPayPalBillingAdapter } from './adapter';
import { normalizePayPalEvent } from './events';
import { fakePayPal, payPalEvent, payPalWebhookSigner } from './testing';
import { PayPalWebhookBody, crc32, payPalEventType, payPalSignature, payPalWebhookAuth } from './webhooks';

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

describe('the billing webhook handler', () => {
  it('verifies, mirrors, dedupes and replays PayPal deliveries through createBillingWebhookHandler', async () => {
    const paypal = fakePayPal();
    const plan = await paypal.plans.create(ctx, { productId: 'PROD-1', name: 'Pro', amount: 1_200, currency: 'usd', interval: 'month' });
    const sub = await paypal.subscriptions.create(ctx, { planId: plan.id, customId: 'paypal:t1' });
    paypal.approveSubscription(sub.id);
    const signer = payPalWebhookSigner();
    const store = new MemoryBillingStore();
    const seen: string[] = [];
    const handler = createBillingWebhookHandler(
      {
        adapter: createPayPalBillingAdapter(paypal, { webhookDeps: { fetch: signer.fetch } }),
        secret: WEBHOOK_ID,
        store,
        idempotency: new InMemoryIdempotencyStore(),
        on: { 'subscription.synced': async (c, e) => void seen.push(`${c.tenantId}:${e.subscription.status}`) },
      },
      { logger },
    );
    const event = payPalEvent('BILLING.SUBSCRIPTION.ACTIVATED', { id: sub.id, status: 'ACTIVE' });
    const { rawBody, headers } = signer.sign(event, { webhookId: WEBHOOK_ID });

    const eventId = `transmission:${headers['paypal-transmission-id']}`;
    expect(await handler.handle(undefined, rawBody, payPalSignature(headers))).toMatchObject({ eventId, outcome: 'processed', events: ['subscription.synced'] });
    expect(await store.findSubscription(sub.id)).toMatchObject({ status: 'active', tenantId: 't1' });
    expect(seen).toEqual(['t1:active']);
    // The same transmission again
    expect((await handler.handle(undefined, rawBody, payPalSignature(headers))).outcome).toBe('duplicate');
    expect((await handler.replay(undefined, eventId)).events).toEqual(['subscription.synced']);

    const forged = payPalWebhookSigner().sign(event, { webhookId: WEBHOOK_ID });
    await expect(handler.handle(undefined, forged.rawBody, payPalSignature({ ...forged.headers, 'paypal-cert-url': signer.certUrl }))).rejects.toMatchObject({ code: 'billing/webhook-invalid-signature' });
    await expect(handler.handle(undefined, rawBody, payPalSignature({}))).rejects.toMatchObject({ code: 'billing/webhook-invalid-signature' });
  });
});

/**
 * The body with `edit` applied and the four bytes after `pad` rewritten so its CRC32 is the original's, as an
 * attacker would: PayPal's signature still matches. Returned as latin1, byte for byte.
 */
function sameCrc(rawBody: string, edit: (body: string) => string, pad: string): string {
  const target = crc32(Buffer.from(rawBody));
  for (let nonce = 0; nonce < 26 * 26; nonce++) {
    const tweak = String.fromCharCode(97 + (nonce % 26), 97 + Math.floor(nonce / 26));
    const buf = Buffer.from(edit(rawBody).replace(`${pad}zzzz`, `${pad}${tweak}zzzz`));
    const offset = buf.indexOf(`${pad}${tweak}`) + pad.length + 2;
    forceCrc(buf, offset, target);
    // Bytes JSON.parse takes inside a string: no control character, quote or backslash
    if ([...buf.subarray(offset, offset + 4)].every((byte) => byte >= 0x20 && byte !== 0x22 && byte !== 0x5c)) return buf.toString('latin1');
  }
  throw new Error('no CRC-preserving patch found');
}

// CRC32 is linear: four bytes can be set to give any CRC (the method of Nayuki's forcecrc32)
const POLY = 0x104c11db7n;
const degree = (x: bigint) => x.toString(2).length - 1;
const reverse32 = (x: bigint) => {
  let r = 0n;
  for (let i = 0n; i < 32n; i++) r = (r << 1n) | ((x >> i) & 1n);
  return r;
};
const mulMod = (a: bigint, b: bigint) => {
  let [x, y, z] = [a, b, 0n];
  for (; y; y >>= 1n) {
    if (y & 1n) z ^= x;
    x <<= 1n;
    if ((x >> 32n) & 1n) x ^= POLY;
  }
  return z;
};
const powMod = (a: bigint, b: bigint) => {
  let [x, y, z] = [a, b, 1n];
  for (; y; y >>= 1n) {
    if (y & 1n) z = mulMod(z, x);
    x = mulMod(x, x);
  }
  return z;
};
const divMod = (a: bigint, y: bigint): [bigint, bigint] => {
  if (!a) return [0n, 0n];
  let x = a;
  const yd = degree(y);
  let z = 0n;
  for (let i = degree(x) - yd; i >= 0; i--) {
    if ((x >> BigInt(i + yd)) & 1n) {
      x ^= y << BigInt(i);
      z |= 1n << BigInt(i);
    }
  }
  return [z, x];
};
const reciprocalMod = (value: bigint) => {
  let [x, y, a, b] = [POLY, value, 0n, 1n];
  while (y) {
    const [q, r] = divMod(x, y);
    [x, y, a, b] = [y, r, b, a ^ mulMod(q, b)];
  }
  return a;
};
function forceCrc(buf: Buffer, offset: number, target: number): void {
  const delta = mulMod(reciprocalMod(powMod(2n, BigInt((buf.length - offset) * 8))), reverse32(BigInt(crc32(buf))) ^ reverse32(BigInt(target)));
  const r = reverse32(delta);
  for (let i = 0; i < 4; i++) buf[offset + i]! ^= Number((r >> BigInt(i * 8)) & 0xffn);
}

describe('replays', () => {
  it('dedupes a replayed delivery whose body was altered to keep its CRC32, so its signature still matches', async () => {
    const paypal = fakePayPal();
    const plan = await paypal.plans.create(ctx, { productId: 'PROD-1', name: 'Pro', amount: 1_200, currency: 'usd', interval: 'month' });
    const sub = await paypal.subscriptions.create(ctx, { planId: plan.id, customId: 'paypal:t1' });
    paypal.approveSubscription(sub.id);
    const sale = paypal.renewSubscription(sub.id);
    const signer = payPalWebhookSigner();
    const paid: string[] = [];
    const handler = createBillingWebhookHandler(
      {
        adapter: createPayPalBillingAdapter(paypal, { webhookDeps: { fetch: signer.fetch } }),
        secret: WEBHOOK_ID,
        store: new MemoryBillingStore(),
        idempotency: new InMemoryIdempotencyStore(),
        on: { 'payment.succeeded': async (_c, e) => void paid.push(e.charge.id) },
      },
      { logger },
    );
    const event = { ...payPalEvent('PAYMENT.SALE.COMPLETED', sale), summary: 'Payment completed for USD 12.00 PAD-zzzz' };
    const { rawBody, headers } = signer.sign(event, { webhookId: WEBHOOK_ID });
    expect((await handler.handle(undefined, rawBody, payPalSignature(headers))).outcome).toBe('processed');

    // Captured and replayed with a fresh event id in the body: PayPal's signature covers only the CRC32
    const altered = sameCrc(rawBody, (b) => b.replace(event.id, `WH-${'X'.repeat(event.id.length - 3)}`), 'PAD-');
    expect(crc32(Buffer.from(altered, 'latin1'))).toBe(crc32(Buffer.from(rawBody)));
    expect(JSON.parse(altered).id).not.toBe(event.id);
    const replayed = await handler.handle(undefined, Buffer.from(altered, 'latin1'), payPalSignature(headers));
    expect(replayed).toMatchObject({ eventId: `transmission:${headers['paypal-transmission-id']}`, outcome: 'duplicate' });
    expect(paid).toEqual([sale.id]);
  });

  it('refuses a transmission older than four days by default', async () => {
    const signer = payPalWebhookSigner();
    const adapter = createPayPalBillingAdapter(fakePayPal(), { webhookDeps: { fetch: signer.fetch } });
    const event = payPalEvent('BILLING.SUBSCRIPTION.ACTIVATED', { id: 'I-1' });
    const old = signer.sign(event, { webhookId: WEBHOOK_ID, transmissionTime: new Date(Date.now() - 5 * 86_400_000).toISOString() });
    await expect(adapter.parseWebhook(old.rawBody, payPalSignature(old.headers), WEBHOOK_ID)).rejects.toMatchObject({ code: 'billing/webhook-invalid-signature' });
    const late = signer.sign(event, { webhookId: WEBHOOK_ID, transmissionTime: new Date(Date.now() - 3 * 86_400_000).toISOString() });
    expect((await adapter.parseWebhook(late.rawBody, payPalSignature(late.headers), WEBHOOK_ID)).id).toBe(`transmission:${late.headers['paypal-transmission-id']}`);
    const anyAge = createPayPalBillingAdapter(fakePayPal(), { webhookDeps: { fetch: signer.fetch }, webhookToleranceSeconds: Number.POSITIVE_INFINITY });
    expect((await anyAge.parseWebhook(old.rawBody, payPalSignature(old.headers), WEBHOOK_ID)).type).toBe('BILLING.SUBSCRIPTION.ACTIVATED');
  });
});

describe('subscription payments', () => {
  async function pastDue() {
    const paypal = fakePayPal();
    const plan = await paypal.plans.create(ctx, { productId: 'PROD-1', name: 'Pro', amount: 1_200, currency: 'usd', interval: 'month' });
    const sub = await paypal.subscriptions.create(ctx, { planId: plan.id, customId: 'paypal:t1' });
    paypal.approveSubscription(sub.id);
    const store = new MemoryBillingStore();
    paypal.subscriptions_.get(sub.id)!.billing_info = { failed_payments_count: 1, next_billing_time: new Date(Date.now() - 86_400_000).toISOString() };
    const failed = payPalEvent('BILLING.SUBSCRIPTION.PAYMENT.FAILED', { id: sub.id, status: 'ACTIVE' });
    failed.create_time = new Date(Date.now() - 60_000).toISOString();
    await normalizePayPalEvent(ctx, failed, { paypal, store });
    expect(await store.findSubscription(sub.id)).toMatchObject({ status: 'past_due' });
    return { paypal, store, sub };
  }

  it('reports a completed sale as a renewal: the subscription synced (active again, period moved on) and payment.succeeded', async () => {
    const { paypal, store, sub } = await pastDue();
    const sale = paypal.renewSubscription(sub.id);
    // The body says another amount: the sale as PayPal's API has it is what counts
    const event = payPalEvent('PAYMENT.SALE.COMPLETED', { ...sale, amount: { total: '0.01', currency: 'USD' } });
    const events = await normalizePayPalEvent(ctx, event, { paypal, store });
    expect(events.map((e) => e.type)).toEqual(['subscription.synced', 'payment.succeeded']);
    expect(events[0]).toMatchObject({ tenantId: 't1', previousStatus: 'past_due', subscription: { id: sub.id, status: 'active' } });
    expect(events[1]).toMatchObject({ tenantId: 't1', charge: { id: sale.id, customerId: 'paypal:t1', amount: 1_200, currency: 'usd', status: 'succeeded' } });
    const mirrored = await store.findSubscription(sub.id);
    expect(mirrored).toMatchObject({ status: 'active' });
    expect(mirrored!.currentPeriodEnd!.getTime()).toBeGreaterThan(Date.now());
  });

  it('reports a refunded sale as charge.refunded, reading the refund again', async () => {
    const { paypal, sub } = await pastDue();
    const sale = paypal.renewSubscription(sub.id);
    const refund = paypal.refundSale(sale.id, 500);
    const events = await normalizePayPalEvent(ctx, payPalEvent('PAYMENT.SALE.REFUNDED', { ...refund, amount: { total: '12.00', currency: 'USD' } }), { paypal });
    expect(events.map((e) => e.type)).toEqual(['subscription.synced', 'charge.refunded']);
    expect(events[1]).toMatchObject({ tenantId: 't1', refund: { id: refund.id, chargeId: sale.id, amount: 500, status: 'succeeded' }, charge: { id: sale.id, amount: 1_200, amountRefunded: 500 } });
  });

  it('reports a reversed sale as charge.refunded in full, and ignores a sale that paid for no subscription', async () => {
    const { paypal, sub } = await pastDue();
    const sale = paypal.renewSubscription(sub.id);
    paypal.sales_.get(sale.id)!.state = 'reversed';
    const events = await normalizePayPalEvent(ctx, payPalEvent('PAYMENT.SALE.REVERSED', { id: sale.id, state: 'reversed' }), { paypal });
    expect(events.map((e) => e.type)).toEqual(['subscription.synced', 'charge.refunded']);
    expect(events[1]).toMatchObject({ refund: { id: `${sale.id}:reversed`, chargeId: sale.id, amount: 1_200 }, charge: { amountRefunded: 1_200 } });

    paypal.sales_.set('S-OTHER', { id: 'S-OTHER', state: 'completed', amount: { total: '5.00', currency: 'USD' } });
    expect(await normalizePayPalEvent(ctx, payPalEvent('PAYMENT.SALE.COMPLETED', { id: 'S-OTHER', billing_agreement_id: sub.id }), { paypal })).toEqual([]);
  });
});
