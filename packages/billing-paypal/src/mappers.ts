import type { Charge, Customer, Plan, Refund, Subscription, SubscriptionStatus } from '@mariachi/billing';
import { fromPayPalAmount } from './money';
import type { Capture, Order, PayPalPlan, PayPalSubscription, Refund as PayPalRefund, Sale, SaleAmount, SaleRefund } from './schemas';

/**
 * PayPal keeps no customer: the buyer signs in to PayPal for each payment or subscription. The adapter's
 * customer is the tenant itself, with this id, and it travels on orders and subscriptions as PayPal's
 * `custom_id`, which is how a webhook finds its tenant again.
 */
const CUSTOMER_PREFIX = 'paypal:';

export function customerIdFor(tenantId: string): string {
  return `${CUSTOMER_PREFIX}${tenantId}`;
}

/** The tenant a customer id (an order's or subscription's `custom_id`) names, or null when it isn't one of ours. */
export function tenantOfCustomer(customerId: string | null | undefined): string | null {
  return customerId?.startsWith(CUSTOMER_PREFIX) && customerId.length > CUSTOMER_PREFIX.length ? customerId.slice(CUSTOMER_PREFIX.length) : null;
}

export function localCustomer(input: { tenantId: string; email?: string | null; name?: string | null; metadata?: Record<string, string> }): Customer {
  return { id: customerIdFor(input.tenantId), email: input.email ?? null, name: input.name ?? null, tenantId: input.tenantId, delinquent: false, metadata: input.metadata ?? {} };
}

function captureStatus(status: string | undefined): Charge['status'] {
  switch (status) {
    case 'COMPLETED':
    case 'PARTIALLY_REFUNDED':
    case 'REFUNDED':
      return 'succeeded';
    case 'PENDING':
      return 'pending';
    default:
      return 'failed';
  }
}

function refundedTotal(refunds: PayPalRefund[] | undefined): number {
  return (refunds ?? []).filter((r) => r.status === 'COMPLETED' && r.amount).reduce((sum, r) => sum + fromPayPalAmount(r.amount!), 0);
}

/**
 * An order as the billing port's `Charge`, keyed by the order id. Before capture it `requires_action` (the
 * buyer approves on PayPal); after, the capture's status decides it.
 */
export function chargeFromOrder(order: Order): Charge {
  const unit = order.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const amount = unit?.amount ?? capture?.amount;
  const customerId = unit?.custom_id ?? capture?.custom_id ?? '';
  let status: Charge['status'];
  if (capture) status = captureStatus(capture.status);
  else if (order.status === 'VOIDED') status = 'canceled';
  else if (order.status === 'COMPLETED') status = 'failed';
  else status = 'requires_action';
  return {
    id: order.id,
    customerId,
    tenantId: tenantOfCustomer(customerId),
    amount: amount ? fromPayPalAmount(amount) : 0,
    amountRefunded: refundedTotal(unit?.payments?.refunds),
    currency: (amount?.currency_code ?? '').toLowerCase(),
    status,
    description: unit?.description ?? null,
    failureCode: status === 'failed' ? (capture?.status_details?.reason ?? capture?.status ?? order.status) : null,
    failureReason: null,
    invoiceId: null,
    metadata: {},
  };
}

/** The order a capture belongs to, from its related ids. */
export function orderIdOfCapture(capture: Capture): string | null {
  return capture.supplementary_data?.related_ids?.order_id ?? null;
}

/**
 * A capture (as a webhook or `captures.get` gives it) as a `Charge`, keyed by its order id like `chargeFromOrder`,
 * so the mirror keeps one row per payment. `amountRefunded` is the whole amount once PayPal says `REFUNDED`.
 */
export function chargeFromCapture(capture: Capture, refunded = 0): Charge {
  const customerId = capture.custom_id ?? '';
  const amount = capture.amount ? fromPayPalAmount(capture.amount) : 0;
  const status = captureStatus(capture.status);
  return {
    id: orderIdOfCapture(capture) ?? capture.id,
    customerId,
    tenantId: tenantOfCustomer(customerId),
    amount,
    amountRefunded: capture.status === 'REFUNDED' ? amount : refunded,
    currency: (capture.amount?.currency_code ?? '').toLowerCase(),
    status,
    description: null,
    failureCode: status === 'failed' ? (capture.status_details?.reason ?? capture.status) : null,
    failureReason: null,
    invoiceId: null,
    metadata: {},
  };
}

/** The capture a refund belongs to: its `up` link points at `/v2/payments/captures/<id>`. */
export function captureIdOfRefund(refund: PayPalRefund): string | null {
  const up = refund.links?.find((l) => l.rel === 'up')?.href;
  const match = up ? /\/v2\/payments\/captures\/([^/?#]+)/.exec(up) : null;
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function refundFromPayPal(refund: PayPalRefund, chargeId: string, reason: string | null = null): Refund {
  const status: Refund['status'] =
    refund.status === 'COMPLETED' ? 'succeeded' : refund.status === 'PENDING' ? 'pending' : refund.status === 'CANCELLED' ? 'canceled' : 'failed';
  const customerId = refund.custom_id ?? null;
  return {
    id: refund.id,
    chargeId,
    tenantId: tenantOfCustomer(customerId),
    amount: refund.amount ? fromPayPalAmount(refund.amount) : 0,
    currency: (refund.amount?.currency_code ?? '').toLowerCase(),
    reason,
    status,
  };
}

/** A v1 amount in minor units, unsigned (a reversal's total is negative). */
function fromSaleAmount(amount: SaleAmount | undefined): number {
  return amount ? fromPayPalAmount({ currency_code: amount.currency, value: amount.total.trim().replace(/^-/, '') }) : 0;
}

function saleStatus(state: string): Charge['status'] {
  switch (state) {
    case 'completed':
    case 'partially_refunded':
    case 'refunded':
    case 'reversed':
      return 'succeeded';
    case 'pending':
      return 'pending';
    default:
      return 'failed';
  }
}

/**
 * A subscription payment (a v1 sale) as the billing port's `Charge`, keyed by the sale id, for the subscription's
 * customer (`customerId`: the subscription's `custom_id`). A refunded or reversed sale is refunded in full; a
 * partly refunded one by `refunded` (the refund at hand, as the sale doesn't say how much is refunded).
 */
export function chargeFromSale(sale: Sale, customerId: string, refunded = 0): Charge {
  const amount = fromSaleAmount(sale.amount);
  const status = saleStatus(sale.state);
  return {
    id: sale.id,
    customerId,
    tenantId: tenantOfCustomer(customerId),
    amount,
    amountRefunded: sale.state === 'refunded' || sale.state === 'reversed' ? amount : Math.min(refunded, amount),
    currency: (sale.amount?.currency ?? '').toLowerCase(),
    status,
    description: null,
    failureCode: status === 'failed' ? sale.state : null,
    failureReason: null,
    invoiceId: null,
    metadata: {},
  };
}

export function refundFromSaleRefund(refund: SaleRefund, chargeId: string, tenantId: string | null): Refund {
  const status: Refund['status'] = refund.state === 'completed' ? 'succeeded' : refund.state === 'pending' ? 'pending' : refund.state === 'cancelled' ? 'canceled' : 'failed';
  return { id: refund.id, chargeId, tenantId, amount: fromSaleAmount(refund.amount), currency: (refund.amount?.currency ?? '').toLowerCase(), reason: null, status };
}

function subscriptionStatus(sub: PayPalSubscription): SubscriptionStatus {
  switch (sub.status) {
    case 'ACTIVE':
      // A renewal failed and PayPal is retrying it: still entitled, as Stripe's past_due is
      return (sub.billing_info?.failed_payments_count ?? 0) > 0 ? 'past_due' : 'active';
    case 'SUSPENDED':
      return 'paused';
    case 'CANCELLED':
    case 'EXPIRED':
      return 'canceled';
    default:
      // APPROVAL_PENDING and APPROVED: the subscriber hasn't finished on PayPal yet
      return 'incomplete';
  }
}

const date = (value: string | undefined): Date | null => (value ? new Date(value) : null);

/**
 * A PayPal subscription as the billing port's `Subscription`. It has one plan, so one item (whose id is the
 * subscription's). `currentPeriodEnd` is PayPal's next billing time and `currentPeriodStart` the last payment's;
 * PayPal cancels at once, so `cancelAtPeriodEnd` is always false.
 */
export function subscriptionFromPayPal(sub: PayPalSubscription): Subscription {
  const customerId = sub.custom_id ?? '';
  const quantity = sub.quantity ? Number(sub.quantity) : 1;
  const planId = sub.plan_id ?? '';
  const status = subscriptionStatus(sub);
  return {
    id: sub.id,
    customerId,
    tenantId: tenantOfCustomer(customerId),
    planId,
    quantity,
    items: [{ id: sub.id, priceId: planId, quantity }],
    status,
    currentPeriodStart: date(sub.billing_info?.last_payment?.time) ?? date(sub.start_time),
    currentPeriodEnd: date(sub.billing_info?.next_billing_time),
    cancelAtPeriodEnd: false,
    cancelAt: null,
    canceledAt: sub.status === 'CANCELLED' ? date(sub.status_update_time) : null,
    trialEnd: null,
    metadata: {},
  };
}

const INTERVALS: Record<string, Plan['interval']> = { DAY: 'day', WEEK: 'week', MONTH: 'month', YEAR: 'year' };

/**
 * A billing plan as the billing port's `Plan`: the price and interval of its regular cycle. `interval` is null
 * when the cycle is several units long (every 3 months), which the port can't say. PayPal has no lookup keys
 * or metadata.
 */
export function planFromPayPal(plan: PayPalPlan): Plan {
  const regular = plan.billing_cycles?.find((c) => c.tenure_type === 'REGULAR');
  const price = regular?.pricing_scheme?.fixed_price;
  const count = regular?.frequency.interval_count ?? 1;
  return {
    id: plan.id,
    productId: plan.product_id ?? '',
    name: plan.name ?? plan.id,
    description: plan.description ?? null,
    amount: price ? fromPayPalAmount(price) : 0,
    currency: (price?.currency_code ?? '').toLowerCase(),
    interval: regular && count === 1 ? (INTERVALS[regular.frequency.interval_unit] ?? null) : null,
    active: plan.status === 'ACTIVE',
    lookupKey: null,
    metadata: {},
    productMetadata: {},
  };
}
