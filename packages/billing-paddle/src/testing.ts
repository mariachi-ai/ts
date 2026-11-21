/**
 * `@mariachi/billing-paddle/testing`: Paddle for an app's tests, held in memory. `fakePaddleBillingAdapter()` is the
 * real adapter talking to an in-memory Paddle API, so `DefaultBilling` behaves as it will against Paddle;
 * `completeCheckout` does what Paddle does when a customer pays; `signedPaddleWebhook` builds a delivery to post to
 * the app's endpoint.
 */
import { createHmac, randomBytes } from 'node:crypto';
import { NotFoundError } from '@mariachi/core';
import { PaddleBillingAdapter, type PaddleBillingConfig } from './adapter';

const id = (prefix: string) => `${prefix}_${randomBytes(13).toString('hex').slice(0, 26)}`;
const now = () => new Date().toISOString();
type Json = Record<string, any>;

export interface PaddleState {
  customers: Map<string, Json>;
  prices: Map<string, Json>;
  subscriptions: Map<string, Json>;
  transactions: Map<string, Json>;
  adjustments: Map<string, Json>;
  /** Usage events as Paddle counted them: one per customer, action, key and time. */
  usageEvents: Map<string, Json>;
}

/** A catalog price, as Paddle lists it. `custom_data.lookupKey` is what `findPlanByLookupKey` reads. */
export function paddlePrice(overrides: Json = {}): Json {
  const productId = overrides.product_id ?? id('pro');
  return {
    id: id('pri'),
    product_id: productId,
    name: 'Monthly',
    description: 'Monthly plan',
    billing_cycle: { interval: 'month', frequency: 1 },
    unit_price: { amount: '1000', currency_code: 'USD' },
    status: 'active',
    custom_data: null,
    product: { id: productId, name: 'Pro', description: null, custom_data: null },
    ...overrides,
  };
}

function error(status: number, code: string): Response {
  return new Response(JSON.stringify({ error: { type: 'request_error', code, detail: `${code} (fake)` }, meta: { request_id: 'fake' } }), { status, headers: { 'content-type': 'application/json' } });
}
const ok = (data: unknown, status = 200) => new Response(JSON.stringify({ data, meta: { request_id: 'fake', pagination: { per_page: 200, next: null, has_more: false } } }), { status, headers: { 'content-type': 'application/json' } });

function lineItems(items: Array<{ price_id: string; quantity: number }>, state: PaddleState) {
  return items.map((i) => {
    const price = state.prices.get(i.price_id);
    const total = String(Number(price?.unit_price.amount ?? 0) * i.quantity);
    return { id: id('txnitm'), price_id: i.price_id, quantity: i.quantity, totals: { subtotal: total, tax: '0', total }, product: { name: price?.product?.name ?? 'Item' }, proration: null };
  });
}

/**
 * A `fetch` that answers the Paddle API from `state`, for the endpoints the adapter uses. It keeps Paddle's rules
 * that matter to an app: one customer per email (`customer_already_exists`), a subscription made only by a
 * completed checkout, and usage counted once per key and time. Unknown endpoints answer 404.
 */
export function paddleApi(state: PaddleState): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    const method = init?.method ?? 'GET';
    const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as Json) : {};
    const parts = url.pathname.split('/').filter(Boolean);
    const q = (name: string) => url.searchParams.get(name)?.split(',');
    const [resource, key, action] = parts;

    if (resource === 'customers') {
      if (!key && method === 'POST') {
        if ([...state.customers.values()].some((c) => c.email.toLowerCase() === String(body.email).toLowerCase())) return error(409, 'customer_already_exists');
        const customer = { id: id('ctm'), status: 'active', name: null, locale: 'en', created_at: now(), updated_at: now(), ...body };
        state.customers.set(customer.id, customer);
        return ok(customer, 201);
      }
      if (!key) {
        const emails = q('email');
        const statuses = q('status') ?? ['active'];
        return ok([...state.customers.values()].filter((c) => (!emails || emails.includes(c.email)) && statuses.includes(c.status)));
      }
      const customer = state.customers.get(key);
      if (!customer) return error(404, 'not_found');
      if (action === 'credit-balances') return ok([]);
      if (action === 'portal-sessions') return ok({ id: id('cpls'), customer_id: key, urls: { general: { overview: 'https://customer-portal.paddle.com/cpl_fake?action=overview&token=fake' }, subscriptions: [] } }, 201);
      if (method === 'PATCH') Object.assign(customer, Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined)), { updated_at: now() });
      return ok(customer);
    }

    if (resource === 'prices') {
      const statuses = q('status') ?? ['active'];
      return ok([...state.prices.values()].filter((p) => statuses.includes(p.status)));
    }

    if (resource === 'subscriptions') {
      if (!key) return ok([...state.subscriptions.values()].filter((s) => q('customer_id')?.includes(s.customer_id)));
      const sub = state.subscriptions.get(key);
      if (!sub) return error(404, 'not_found');
      if (action === 'cancel') {
        if (body.effective_from === 'immediately') Object.assign(sub, { status: 'canceled', canceled_at: now(), scheduled_change: null, current_billing_period: null });
        else sub.scheduled_change = { action: 'cancel', effective_at: sub.current_billing_period?.ends_at ?? now(), resume_at: null };
      } else if (action === 'pause') {
        Object.assign(sub, { status: 'paused', paused_at: now(), current_billing_period: null });
      } else if (action === 'resume') {
        if (sub.status !== 'paused') return error(400, 'subscription_must_be_paused');
        Object.assign(sub, { status: 'active', paused_at: null, current_billing_period: { starts_at: now(), ends_at: new Date(Date.now() + 30 * 86_400_000).toISOString() } });
      } else if (method === 'PATCH') {
        const items = body.items?.map((i: Json) => ({ status: 'active', quantity: i.quantity ?? sub.items.find((x: Json) => x.price.id === i.price_id)?.quantity ?? 1, price: { id: i.price_id }, trial_dates: null }));
        if (body.items && !body.proration_billing_mode) return error(400, 'subscription_items_update_missing_proration_billing_mode');
        if (action === 'preview') {
          const charge = '500';
          return ok({ ...sub, items: items ?? sub.items, immediate_transaction: null, next_transaction: { billing_period: sub.current_billing_period, details: { totals: { total: '1500', grand_total: '1500', currency_code: sub.currency_code }, line_items: lineItems((items ?? sub.items).map((i: Json) => ({ price_id: i.price.id, quantity: i.quantity })), state) } }, update_summary: { result: { action: 'charge', amount: charge, currency_code: sub.currency_code } } });
        }
        if (items) sub.items = items;
        if (body.custom_data !== undefined) sub.custom_data = body.custom_data;
        if ('scheduled_change' in body) sub.scheduled_change = null;
      }
      sub.updated_at = now();
      return ok(sub);
    }

    if (resource === 'transactions') {
      if (!key && method === 'POST') {
        const txn = {
          id: id('txn'),
          status: body.customer_id ? 'ready' : 'draft',
          customer_id: body.customer_id ?? null,
          subscription_id: null,
          origin: 'api',
          collection_mode: 'automatic',
          currency_code: 'USD',
          invoice_number: null,
          billing_period: null,
          billed_at: null,
          created_at: now(),
          custom_data: body.custom_data ?? null,
          items: body.items.map((i: Json) => ({ price: { id: i.price_id }, quantity: i.quantity })),
          details: { totals: { total: '0', grand_total: '0', currency_code: 'USD' }, line_items: lineItems(body.items, state) },
          payments: [],
          checkout: { url: null as string | null },
        };
        const grand = String(txn.details.line_items.reduce((sum: number, l: Json) => sum + Number(l.totals.total), 0));
        txn.details.totals = { total: grand, grand_total: grand, currency_code: 'USD' };
        txn.checkout.url = `${body.checkout?.url ?? 'https://app.test/pay'}?_ptxn=${txn.id}`;
        state.transactions.set(txn.id, txn);
        return ok(txn, 201);
      }
      if (!key) {
        const statuses = q('status');
        return ok([...state.transactions.values()].filter((t) => q('customer_id')?.includes(t.customer_id) && (!statuses || statuses.includes(t.status))).reverse());
      }
      const txn = state.transactions.get(key);
      if (!txn) return error(404, 'not_found');
      if (action === 'invoice') return ok({ url: `https://paddle-invoices.test/${key}.pdf` });
      const refunded = [...state.adjustments.values()].filter((a) => a.transaction_id === key && a.action === 'refund' && a.status === 'approved').reduce((s, a) => s + Number(a.totals.total), 0);
      return ok(q('include')?.includes('adjustments_totals') ? { ...txn, adjustments_totals: { breakdown: { refund: String(refunded), credit: '0', chargeback: '0' } } } : txn);
    }

    if (resource === 'adjustments' && method === 'POST') {
      const txn = state.transactions.get(body.transaction_id);
      if (!txn) return error(404, 'not_found');
      if (txn.status !== 'completed') return error(400, 'adjustment_transaction_invalid_status_for_refund');
      const total = body.type === 'full' ? txn.details.totals.grand_total : String(body.items.reduce((s: number, i: Json) => s + Number(i.amount ?? txn.details.line_items.find((l: Json) => l.id === i.item_id)?.totals.total ?? 0), 0));
      const adjustment = { id: id('adj'), action: 'refund', type: body.type, transaction_id: txn.id, subscription_id: txn.subscription_id, customer_id: txn.customer_id, reason: body.reason, currency_code: txn.currency_code, status: 'pending_approval', items: body.items ?? [], totals: { subtotal: total, tax: '0', total, fee: '0', earnings: total, currency_code: txn.currency_code }, created_at: now(), updated_at: now() };
      state.adjustments.set(adjustment.id, adjustment);
      return ok(adjustment, 201);
    }

    if (resource === 'usage-events' && method === 'POST') {
      for (const event of body.events) state.usageEvents.set(`${event.customer_id}:${event.action}:${event.event_key}:${event.occurred_at}`, event);
      return new Response(JSON.stringify({ data: {}, meta: { request_id: 'fake' } }), { status: 202, headers: { 'content-type': 'application/json' } });
    }

    if (resource === 'event-types') return ok([]);
    return error(404, 'not_found');
  }) as typeof fetch;
}

export interface FakePaddleBillingAdapter extends PaddleBillingAdapter {
  state: PaddleState;
  /**
   * What Paddle does when the customer pays for a checkout's transaction: it's completed and, for recurring prices,
   * a subscription is made with the transaction's `custom_data`. Returns both, to post as webhooks
   * (`transaction.completed`, `subscription.created`) with `signedPaddleWebhook`.
   */
  completeCheckout(transactionId: string): { transaction: Json; subscription: Json | null };
}

/**
 * The Paddle billing adapter over an in-memory Paddle: hand it to `DefaultBilling` in an app's tests. Seed the
 * catalog with `paddlePrice()`.
 */
export function fakePaddleBillingAdapter(seed: { prices?: Json[] } = {}, config: Partial<PaddleBillingConfig> = {}): FakePaddleBillingAdapter {
  const state: PaddleState = {
    customers: new Map(),
    prices: new Map((seed.prices ?? []).map((p) => [p.id, p])),
    subscriptions: new Map(),
    transactions: new Map(),
    adjustments: new Map(),
    usageEvents: new Map(),
  };
  const adapter = new PaddleBillingAdapter({ apiKey: 'pdl_sdbx_apikey_fake', ...config }, { fetch: paddleApi(state), sleep: async () => {} }) as FakePaddleBillingAdapter;
  adapter.state = state;
  adapter.completeCheckout = (transactionId) => {
    const txn = state.transactions.get(transactionId);
    if (!txn) throw new NotFoundError('paddle transaction', transactionId);
    const recurring = txn.items.filter((i: Json) => state.prices.get(i.price.id)?.billing_cycle);
    let subscription: Json | null = null;
    if (recurring.length) {
      const start = new Date();
      const end = new Date(start.getTime() + 30 * 86_400_000);
      subscription = {
        id: id('sub'),
        status: 'active',
        customer_id: txn.customer_id,
        currency_code: txn.currency_code,
        started_at: start.toISOString(),
        next_billed_at: end.toISOString(),
        paused_at: null,
        canceled_at: null,
        current_billing_period: { starts_at: start.toISOString(), ends_at: end.toISOString() },
        scheduled_change: null,
        items: recurring.map((i: Json) => ({ status: 'active', quantity: i.quantity, price: { id: i.price.id }, trial_dates: null })),
        custom_data: txn.custom_data,
        created_at: start.toISOString(),
        updated_at: start.toISOString(),
      };
      state.subscriptions.set(subscription.id, subscription);
    }
    Object.assign(txn, {
      status: 'completed',
      subscription_id: subscription?.id ?? null,
      billed_at: now(),
      billing_period: subscription?.current_billing_period ?? null,
      payments: [{ status: 'captured', error_code: null, captured_at: now(), amount: txn.details.totals.grand_total }],
    });
    return { transaction: txn, subscription };
  };
  return adapter;
}

/** A notification as Paddle posts it. */
export function paddleNotification(eventType: string, data: Json, overrides: { eventId?: string; occurredAt?: Date } = {}): Json {
  return {
    event_id: overrides.eventId ?? id('evt'),
    event_type: eventType,
    occurred_at: (overrides.occurredAt ?? new Date()).toISOString(),
    notification_id: id('ntf'),
    data,
  };
}

/** The body and `Paddle-Signature` header Paddle would send for this notification, signed now (or at `atSeconds`). */
export function signedPaddleWebhook(notification: Json, secret: string, atSeconds = Math.floor(Date.now() / 1000)): { rawBody: string; headers: Record<string, string>; signature: string } {
  const rawBody = JSON.stringify(notification);
  const signature = `ts=${atSeconds};h1=${createHmac('sha256', secret).update(`${atSeconds}:${rawBody}`).digest('hex')}`;
  return { rawBody, headers: { 'paddle-signature': signature }, signature };
}
