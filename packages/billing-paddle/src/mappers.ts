import type { Charge, Customer, Invoice, Plan, Refund, Subscription, SubscriptionStatus } from '@mariachi/billing';
import type { PaddleAdjustment, PaddleCustomer, PaddlePrice, PaddleSubscription, PaddleTransaction } from './schemas';

/** Paddle's entities in the billing port's shape. Amounts become integers in the currency's minor unit. */

type CustomData = Record<string, unknown> | null | undefined;

/** Paddle sends amounts as strings of integers. */
export function amount(value: string | null | undefined): number {
  if (!value) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

const date = (value: string | null | undefined): Date | null => (value ? new Date(value) : null);
const lower = (code: string | undefined) => (code ?? 'usd').toLowerCase();

/** `custom_data` as the port's string metadata: strings as they are, other values as JSON. */
export function metadataOf(data: CustomData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(data ?? {})) {
    if (value === null || value === undefined) continue;
    out[key] = typeof value === 'string' ? value : JSON.stringify(value);
  }
  return out;
}

/** The app's tenant, which the adapter writes to `custom_data.tenantId` on customers and checkouts. */
export function tenantOf(data: CustomData): string | null {
  const value = data?.tenantId;
  return typeof value === 'string' && value ? value : null;
}

export function mapCustomer(c: PaddleCustomer): Customer {
  return { id: c.id, email: c.email, name: c.name ?? null, tenantId: tenantOf(c.custom_data), delinquent: false, metadata: metadataOf(c.custom_data) };
}

const STATUSES = new Set<SubscriptionStatus>(['active', 'trialing', 'past_due', 'paused', 'canceled']);

/**
 * A Paddle subscription. Its items have no ids of their own, so an item's id is its price id. A cancel scheduled
 * for the end of the period is `cancelAtPeriodEnd`, with `cancelAt` when it takes effect.
 */
export function mapSubscription(s: PaddleSubscription): Subscription {
  const first = s.items[0];
  const cancel = s.scheduled_change?.action === 'cancel' ? s.scheduled_change : null;
  return {
    id: s.id,
    customerId: s.customer_id,
    tenantId: tenantOf(s.custom_data),
    planId: first?.price.id ?? '',
    quantity: first?.quantity ?? 1,
    items: s.items.map((item) => ({ id: item.price.id, priceId: item.price.id, quantity: item.quantity })),
    status: STATUSES.has(s.status as SubscriptionStatus) ? (s.status as SubscriptionStatus) : 'incomplete',
    currentPeriodStart: date(s.current_billing_period?.starts_at),
    currentPeriodEnd: date(s.current_billing_period?.ends_at),
    cancelAtPeriodEnd: cancel !== null,
    cancelAt: date(cancel?.effective_at),
    canceledAt: date(s.canceled_at),
    trialEnd: date(s.items.find((i) => i.trial_dates)?.trial_dates?.ends_at),
    metadata: metadataOf(s.custom_data),
  };
}

/**
 * A price as a plan. Paddle has no lookup key: the adapter reads one from the price's `custom_data.lookupKey`, so
 * set it there to refer to plans by name (`findPlanByLookupKey`).
 */
export function mapPrice(p: PaddlePrice): Plan {
  const lookupKey = p.custom_data?.lookupKey;
  return {
    id: p.id,
    productId: p.product_id,
    name: p.name ?? p.product?.name ?? p.id,
    description: p.product?.description ?? null,
    amount: amount(p.unit_price.amount),
    currency: lower(p.unit_price.currency_code),
    interval: p.billing_cycle?.interval ?? null,
    active: p.status === 'active',
    lookupKey: typeof lookupKey === 'string' && lookupKey ? lookupKey : null,
    metadata: metadataOf(p.custom_data),
    productMetadata: metadataOf(p.product?.custom_data),
  };
}

const INVOICE_STATUS: Record<string, Invoice['status']> = {
  draft: 'draft',
  ready: 'draft',
  billed: 'open',
  past_due: 'open',
  paid: 'paid',
  completed: 'paid',
  canceled: 'void',
};

const total = (t: PaddleTransaction) => amount(t.details?.totals.grand_total ?? t.details?.totals.total);
const paid = (t: PaddleTransaction) => t.status === 'paid' || t.status === 'completed';

/**
 * A transaction as an invoice: Paddle's transactions are its invoices. `pdfUrl` is null because Paddle's PDF link
 * expires after an hour; ask for one with `paddle.transactions.invoicePdfUrl(ctx, invoice.id)` when it's wanted.
 */
export function mapInvoice(t: PaddleTransaction): Invoice {
  return {
    id: t.id,
    customerId: t.customer_id ?? '',
    subscriptionId: t.subscription_id ?? null,
    tenantId: tenantOf(t.custom_data),
    number: t.invoice_number ?? null,
    amountDue: total(t),
    amountPaid: paid(t) ? total(t) : 0,
    currency: lower(t.currency_code),
    status: INVOICE_STATUS[t.status] ?? 'open',
    hostedUrl: null,
    pdfUrl: null,
    periodStart: date(t.billing_period?.starts_at),
    periodEnd: date(t.billing_period?.ends_at),
    paidAt: paid(t) ? date(t.payments.find((p) => p.captured_at)?.captured_at ?? t.billed_at) : null,
  };
}

/** A transaction as a charge: its id is the transaction's, which `refund` takes. */
export function mapCharge(t: PaddleTransaction): Charge {
  const failedAttempt = t.payments.find((p) => p.error_code);
  return {
    id: t.id,
    customerId: t.customer_id ?? '',
    tenantId: tenantOf(t.custom_data),
    amount: total(t),
    amountRefunded: amount(t.adjustments_totals?.breakdown.refund),
    currency: lower(t.currency_code),
    status: paid(t) ? 'succeeded' : t.status === 'canceled' ? 'canceled' : t.status === 'past_due' || failedAttempt ? 'failed' : 'pending',
    description: null,
    failureCode: paid(t) ? null : (failedAttempt?.error_code ?? null),
    // Paddle gives a code, not a message
    failureReason: null,
    invoiceId: t.id,
    metadata: metadataOf(t.custom_data),
  };
}

const REFUND_STATUS: Record<string, Refund['status']> = {
  pending_approval: 'pending',
  approved: 'succeeded',
  rejected: 'failed',
  reversed: 'canceled',
};

/** A refund adjustment. Most live refunds start `pending` until Paddle approves them. */
export function mapRefund(a: PaddleAdjustment, tenantId: string | null = null): Refund {
  return {
    id: a.id,
    chargeId: a.transaction_id,
    tenantId,
    amount: amount(a.totals?.total),
    currency: lower(a.currency_code),
    reason: a.reason,
    status: REFUND_STATUS[a.status] ?? 'pending',
  };
}
