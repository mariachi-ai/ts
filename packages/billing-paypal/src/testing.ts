/**
 * `@mariachi/billing-paypal/testing`: a PayPal for an app's tests, held in memory, with the same shape as
 * `createPayPal`'s client; events as PayPal sends them; and a signer that makes deliveries `payPalWebhookAuth`
 * accepts, with a certificate of its own made for the test (no key is shipped).
 */
import { generateKeyPairSync, randomUUID, sign as rsaSign } from 'node:crypto';
import type { PayPal } from './client';
import { PayPalError } from './errors';
import { fromPayPalAmount, toPayPalAmount } from './money';
import type { Capture, Order, PayPalPlan, PayPalSubscription, PayPalWebhookEvent, Product, Refund } from './schemas';
import { crc32 } from './webhooks';

export interface FakePayPal extends PayPal {
  orders_: Map<string, Order>;
  captures_: Map<string, Capture>;
  refunds_: Map<string, Refund>;
  products_: Map<string, Product>;
  plans_: Map<string, PayPalPlan>;
  subscriptions_: Map<string, PayPalSubscription>;
  /** What the buyer does on PayPal: the order can now be captured. */
  approveOrder(orderId: string): void;
  /** What the subscriber does on PayPal: the subscription becomes ACTIVE. */
  approveSubscription(subscriptionId: string): void;
}

const fail = (reason: string, category: PayPalError['category'], providerCode: string, status: number) =>
  new PayPalError(`paypal/${reason}`, `paypal fake: ${providerCode}`, { category, providerCode, status });
const notFound = () => fail('not-found', 'not-found', 'RESOURCE_NOT_FOUND', 404);

/** An in-memory PayPal: hand it to the code under test in place of `createPayPal`'s client, or to `createPayPalBillingAdapter`. */
export function fakePayPal(seed: { plans?: PayPalPlan[] } = {}): FakePayPal {
  let seq = 0;
  const id = (prefix: string) => `${prefix}${String(++seq).padStart(12, '0')}`;
  const now = () => new Date().toISOString();
  const orders_ = new Map<string, Order>();
  const captures_ = new Map<string, Capture>();
  const refunds_ = new Map<string, Refund>();
  const products_ = new Map<string, Product>();
  const plans_ = new Map((seed.plans ?? []).map((p) => [p.id, p]));
  const subscriptions_ = new Map<string, PayPalSubscription>();
  const keyed = new Map<string, unknown>();
  const once = <T>(key: string | undefined, make: () => T): T => {
    if (!key) return make();
    if (!keyed.has(key)) keyed.set(key, make());
    return keyed.get(key) as T;
  };
  const get = <T>(map: Map<string, T>, key: string): T => {
    const found = map.get(key);
    if (!found) throw notFound();
    return found;
  };
  const sub = (subscriptionId: string) => get(subscriptions_, subscriptionId);

  const fake: FakePayPal = {
    environment: 'sandbox',
    clientId: 'fake-client-id',
    orders_,
    captures_,
    refunds_,
    products_,
    plans_,
    subscriptions_,
    approveOrder(orderId) {
      get(orders_, orderId).status = 'APPROVED';
    },
    approveSubscription(subscriptionId) {
      Object.assign(sub(subscriptionId), { status: 'ACTIVE', status_update_time: now(), billing_info: { failed_payments_count: 0, next_billing_time: new Date(Date.now() + 30 * 86_400_000).toISOString() } });
    },
    orders: {
      async create(_ctx, input) {
        return once(input.idempotencyKey && `orders.create:${input.idempotencyKey}`, () => {
          const orderId = id('O');
          const order: Order = {
            id: orderId,
            status: 'CREATED',
            intent: 'CAPTURE',
            purchase_units: [{ amount: toPayPalAmount(input.amount, input.currency), custom_id: input.customId, description: input.description, invoice_id: input.invoiceId }],
            links: [{ rel: 'approve', href: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`, method: 'GET' }],
            create_time: now(),
          };
          orders_.set(orderId, order);
          return order;
        });
      },
      async get(_ctx, orderId) {
        return get(orders_, orderId);
      },
      async capture(_ctx, input) {
        const order = get(orders_, input.orderId);
        if (order.status === 'COMPLETED') throw fail('order-already-captured', 'conflict', 'ORDER_ALREADY_CAPTURED', 422);
        if (order.status !== 'APPROVED') throw fail('order-not-approved', 'invalid-request', 'ORDER_NOT_APPROVED', 422);
        const unit = order.purchase_units![0]!;
        const capture: Capture = { id: id('C'), status: 'COMPLETED', amount: unit.amount, custom_id: unit.custom_id, supplementary_data: { related_ids: { order_id: order.id } }, create_time: now() };
        captures_.set(capture.id, capture);
        unit.payments = { captures: [capture], refunds: [] };
        order.status = 'COMPLETED';
        return order;
      },
    },
    captures: {
      async get(_ctx, captureId) {
        return get(captures_, captureId);
      },
      async refund(_ctx, input) {
        return once(input.idempotencyKey && `captures.refund:${input.idempotencyKey}`, () => {
          const capture = get(captures_, input.captureId);
          const order = get(orders_, capture.supplementary_data!.related_ids!.order_id!);
          const unit = order.purchase_units![0]!;
          const total = fromPayPalAmount(capture.amount!);
          const done = (unit.payments?.refunds ?? []).reduce((s, r) => s + fromPayPalAmount(r.amount!), 0);
          const amount = input.amount ?? total - done;
          if (done >= total) throw fail('capture-fully-refunded', 'conflict', 'CAPTURE_FULLY_REFUNDED', 422);
          if (amount + done > total) throw fail('refund-amount-exceeded', 'invalid-request', 'REFUND_AMOUNT_EXCEEDED', 422);
          const refund: Refund = {
            id: id('R'),
            status: 'COMPLETED',
            amount: toPayPalAmount(amount, capture.amount!.currency_code),
            custom_id: capture.custom_id,
            links: [{ rel: 'up', href: `https://api-m.sandbox.paypal.com/v2/payments/captures/${capture.id}`, method: 'GET' }],
            create_time: now(),
          };
          refunds_.set(refund.id, refund);
          unit.payments!.refunds = [...(unit.payments!.refunds ?? []), refund];
          capture.status = amount + done === total ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
          return refund;
        });
      },
    },
    refunds: {
      async get(_ctx, refundId) {
        return get(refunds_, refundId);
      },
    },
    products: {
      async create(_ctx, input) {
        return once(input.idempotencyKey && `products.create:${input.idempotencyKey}`, () => {
          const product: Product = { id: id('PROD-'), name: input.name, type: input.type ?? 'SERVICE', description: input.description };
          products_.set(product.id, product);
          return product;
        });
      },
      async list() {
        const products = [...products_.values()];
        return { products, total_items: products.length, total_pages: 1 };
      },
    },
    plans: {
      async create(_ctx, input) {
        return once(input.idempotencyKey && `plans.create:${input.idempotencyKey}`, () => {
          const plan: PayPalPlan = {
            id: id('P-'),
            product_id: input.productId,
            name: input.name,
            description: input.description,
            status: 'ACTIVE',
            quantity_supported: input.quantitySupported,
            billing_cycles: [
              {
                tenure_type: 'REGULAR',
                sequence: 1,
                total_cycles: 0,
                frequency: { interval_unit: input.interval.toUpperCase(), interval_count: input.intervalCount ?? 1 },
                pricing_scheme: { fixed_price: toPayPalAmount(input.amount, input.currency) },
              },
            ],
          };
          plans_.set(plan.id, plan);
          return plan;
        });
      },
      async list(_ctx, input = {}) {
        const plans = [...plans_.values()].filter((p) => !input.productId || p.product_id === input.productId);
        return { plans, total_items: plans.length, total_pages: 1 };
      },
      async *all(ctx, input = {}) {
        yield* (await fake.plans.list(ctx, input)).plans;
      },
      async get(_ctx, planId) {
        return get(plans_, planId);
      },
    },
    subscriptions: {
      async create(_ctx, input) {
        return once(input.idempotencyKey && `subscriptions.create:${input.idempotencyKey}`, () => {
          get(plans_, input.planId);
          const subscriptionId = id('I-');
          const created: PayPalSubscription = {
            id: subscriptionId,
            status: 'APPROVAL_PENDING',
            plan_id: input.planId,
            quantity: String(input.quantity ?? 1),
            custom_id: input.customId,
            start_time: now(),
            status_update_time: now(),
            links: [{ rel: 'approve', href: `https://www.sandbox.paypal.com/webapps/billing/subscriptions?ba_token=BA-${subscriptionId}`, method: 'GET' }],
          };
          subscriptions_.set(subscriptionId, created);
          return created;
        });
      },
      async get(_ctx, subscriptionId) {
        return sub(subscriptionId);
      },
      async suspend(_ctx, input) {
        const s = sub(input.subscriptionId);
        if (s.status !== 'ACTIVE') throw fail('subscription-status-invalid', 'conflict', 'SUBSCRIPTION_STATUS_INVALID', 422);
        Object.assign(s, { status: 'SUSPENDED', status_update_time: now() });
      },
      async activate(_ctx, input) {
        const s = sub(input.subscriptionId);
        if (s.status !== 'SUSPENDED') throw fail('subscription-status-invalid', 'conflict', 'SUBSCRIPTION_STATUS_INVALID', 422);
        Object.assign(s, { status: 'ACTIVE', status_update_time: now() });
      },
      async cancel(_ctx, input) {
        const s = sub(input.subscriptionId);
        if (s.status === 'CANCELLED' || s.status === 'EXPIRED') throw fail('subscription-status-invalid', 'conflict', 'SUBSCRIPTION_STATUS_INVALID', 422);
        Object.assign(s, { status: 'CANCELLED', status_update_time: now() });
      },
      async revise(_ctx, input) {
        const s = sub(input.subscriptionId);
        if (input.planId) get(plans_, input.planId);
        return {
          plan_id: input.planId ?? s.plan_id,
          quantity: input.quantity === undefined ? s.quantity : String(input.quantity),
          links: [{ rel: 'approve', href: `https://www.sandbox.paypal.com/webapps/billing/subscriptions/update?ba_token=BA-${s.id}`, method: 'GET' }],
        };
      },
    },
    async ping() {},
  };
  return fake;
}

/** An event as PayPal posts it: `payPalEvent('PAYMENT.CAPTURE.COMPLETED', capture, 'capture')`. */
export function payPalEvent(eventType: string, resource: object, resourceType?: string): PayPalWebhookEvent {
  return {
    id: `WH-${randomUUID().slice(0, 17).toUpperCase()}`,
    event_type: eventType,
    create_time: new Date().toISOString(),
    resource_type: resourceType ?? (eventType.startsWith('BILLING.SUBSCRIPTION') ? 'subscription' : eventType === 'PAYMENT.CAPTURE.REFUNDED' ? 'refund' : 'capture'),
    event_version: '1.0',
    resource: resource as Record<string, unknown>,
  };
}

export interface PayPalWebhookSigner {
  /** Pass as `payPalWebhookAuth(options, { fetch })`: it serves the signer's certificate at any PayPal certificate URL. */
  fetch: typeof fetch;
  /** The URL the deliveries name in `PAYPAL-CERT-URL`. */
  certUrl: string;
  /** The raw body and `PAYPAL-*` headers PayPal would send for `event` to the webhook `webhookId`. */
  sign(event: object | string, options: { webhookId: string; transmissionId?: string; transmissionTime?: string }): { rawBody: string; headers: Record<string, string> };
}

/**
 * Signs deliveries as PayPal does, with a key and self-signed certificate made for this signer:
 *
 * ```ts
 * const signer = payPalWebhookSigner();
 * const auth = payPalWebhookAuth({ webhookId: 'WH-1', environment: 'sandbox' }, { fetch: signer.fetch });
 * const { rawBody, headers } = signer.sign(payPalEvent('BILLING.SUBSCRIPTION.ACTIVATED', subscription), { webhookId: 'WH-1' });
 * ```
 */
export function payPalWebhookSigner(options: { environment?: 'sandbox' | 'live' } = {}): PayPalWebhookSigner {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const pem = selfSignedCertificate(publicKey.export({ type: 'spki', format: 'der' }), (tbs) => rsaSign('sha256', tbs, privateKey));
  const host = options.environment === 'live' ? 'api.paypal.com' : 'api.sandbox.paypal.com';
  const certUrl = `https://${host}/v1/notifications/certs/CERT-${randomUUID()}`;
  const serve: typeof fetch = async () => new Response(pem, { status: 200, headers: { 'content-type': 'application/x-pem-file' } });
  return {
    fetch: serve,
    certUrl,
    sign(event, { webhookId, transmissionId = randomUUID(), transmissionTime = new Date().toISOString() }) {
      const rawBody = typeof event === 'string' ? event : JSON.stringify(event);
      const message = `${transmissionId}|${transmissionTime}|${webhookId}|${crc32(Buffer.from(rawBody))}`;
      return {
        rawBody,
        headers: {
          'paypal-transmission-id': transmissionId,
          'paypal-transmission-time': transmissionTime,
          'paypal-transmission-sig': rsaSign('sha256', Buffer.from(message), privateKey).toString('base64'),
          'paypal-cert-url': certUrl,
          'paypal-auth-algo': 'SHA256withRSA',
        },
      };
    },
  };
}

// ── A minimal X.509 v1 certificate in DER, so no private key ships with the package ───────────────────────

function der(tag: number, ...parts: Buffer[]): Buffer {
  const body = Buffer.concat(parts);
  const n = body.length;
  const length = n < 0x80 ? Buffer.from([n]) : n < 0x100 ? Buffer.from([0x81, n]) : Buffer.from([0x82, n >> 8, n & 0xff]);
  return Buffer.concat([Buffer.from([tag]), length, body]);
}

const SHA256_WITH_RSA = der(0x30, der(0x06, Buffer.from([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b])), der(0x05));

function selfSignedCertificate(spki: Buffer, signTbs: (tbs: Buffer) => Buffer): string {
  const name = der(0x30, der(0x31, der(0x30, der(0x06, Buffer.from([0x55, 0x04, 0x03])), der(0x0c, Buffer.from('paypal-webhook-test.invalid')))));
  const time = (d: Date) => der(0x18, Buffer.from(`${d.toISOString().slice(0, 19).replace(/[-:T]/g, '')}Z`));
  const validity = der(0x30, time(new Date(Date.now() - 86_400_000)), time(new Date(Date.now() + 365 * 86_400_000)));
  const tbs = der(0x30, der(0x02, Buffer.from([0x01])), SHA256_WITH_RSA, name, validity, name, spki);
  const cert = der(0x30, tbs, SHA256_WITH_RSA, der(0x03, Buffer.concat([Buffer.from([0x00]), signTbs(tbs)])));
  const b64 = cert.toString('base64').replace(/(.{64})/g, '$1\n');
  return `-----BEGIN CERTIFICATE-----\n${b64}${b64.endsWith('\n') ? '' : '\n'}-----END CERTIFICATE-----\n`;
}
