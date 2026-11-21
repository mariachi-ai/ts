import { z } from 'zod';

/**
 * Paddle's entities as the adapter reads them: the fields it uses, checked, and everything else kept
 * (`.passthrough()`), so a field Paddle adds never breaks a call. Amounts are strings of integers in the
 * currency's minor unit, as Paddle sends them. https://developer.paddle.com/api-reference/overview
 */

const Id = z.string().min(1);
const When = z.string().min(1);
/** Paddle's `custom_data`: any JSON object, or null. */
const CustomData = z.record(z.unknown()).nullable().optional();
const Period = z.object({ starts_at: When, ends_at: When }).passthrough();
const Money = z.object({ amount: z.string(), currency_code: z.string() }).passthrough();

export const PaddleCustomer = z
  .object({
    id: Id,
    email: z.string(),
    name: z.string().nullable().optional(),
    status: z.string(),
    custom_data: CustomData,
  })
  .passthrough();
export type PaddleCustomer = z.infer<typeof PaddleCustomer>;

export const PaddleProduct = z
  .object({ id: Id, name: z.string(), description: z.string().nullable().optional(), custom_data: CustomData })
  .passthrough();
export type PaddleProduct = z.infer<typeof PaddleProduct>;

export const PaddlePrice = z
  .object({
    id: Id,
    product_id: Id,
    name: z.string().nullable().optional(),
    description: z.string().optional(),
    billing_cycle: z.object({ interval: z.enum(['day', 'week', 'month', 'year']), frequency: z.number() }).passthrough().nullable().optional(),
    unit_price: Money,
    status: z.string(),
    custom_data: CustomData,
    product: PaddleProduct.optional(),
  })
  .passthrough();
export type PaddlePrice = z.infer<typeof PaddlePrice>;

export const PaddleSubscriptionItem = z
  .object({
    status: z.string().optional(),
    quantity: z.number(),
    price: z.object({ id: Id }).passthrough(),
    trial_dates: Period.nullable().optional(),
  })
  .passthrough();

export const PaddleSubscription = z
  .object({
    id: Id,
    status: z.string(),
    customer_id: Id,
    currency_code: z.string().optional(),
    started_at: When.nullable().optional(),
    next_billed_at: When.nullable().optional(),
    paused_at: When.nullable().optional(),
    canceled_at: When.nullable().optional(),
    current_billing_period: Period.nullable().optional(),
    scheduled_change: z
      .object({ action: z.enum(['cancel', 'pause', 'resume']), effective_at: When, resume_at: When.nullable().optional() })
      .passthrough()
      .nullable()
      .optional(),
    items: z.array(PaddleSubscriptionItem),
    custom_data: CustomData,
  })
  .passthrough();
export type PaddleSubscription = z.infer<typeof PaddleSubscription>;

const Totals = z
  .object({ subtotal: z.string().optional(), tax: z.string().optional(), total: z.string(), grand_total: z.string().optional(), balance: z.string().optional(), currency_code: z.string().optional() })
  .passthrough();

const LineItem = z
  .object({
    id: Id.optional(),
    price_id: z.string().nullable().optional(),
    quantity: z.number().optional(),
    totals: Totals,
    product: z.object({ name: z.string().optional() }).passthrough().nullable().optional(),
    proration: z.object({ rate: z.string() }).passthrough().nullable().optional(),
  })
  .passthrough();
export type PaddleLineItem = z.infer<typeof LineItem>;

const Details = z.object({ totals: Totals, line_items: z.array(LineItem).default([]) }).passthrough();

export const PaddleTransaction = z
  .object({
    id: Id,
    status: z.string(),
    customer_id: z.string().nullable().optional(),
    subscription_id: z.string().nullable().optional(),
    origin: z.string().optional(),
    collection_mode: z.string().optional(),
    currency_code: z.string(),
    invoice_number: z.string().nullable().optional(),
    billing_period: Period.nullable().optional(),
    billed_at: When.nullable().optional(),
    created_at: When.optional(),
    custom_data: CustomData,
    items: z.array(z.object({ price: z.object({ id: z.string().nullable().optional() }).passthrough().nullable().optional(), quantity: z.number() }).passthrough()).default([]),
    details: Details.nullable().optional(),
    payments: z
      .array(z.object({ status: z.string(), error_code: z.string().nullable().optional(), captured_at: When.nullable().optional() }).passthrough())
      .default([]),
    checkout: z.object({ url: z.string().nullable() }).passthrough().nullable().optional(),
    adjustments_totals: z.object({ breakdown: z.object({ refund: z.string() }).passthrough() }).passthrough().optional(),
  })
  .passthrough();
export type PaddleTransaction = z.infer<typeof PaddleTransaction>;

export const PaddleAdjustment = z
  .object({
    id: Id,
    action: z.string(),
    transaction_id: Id,
    subscription_id: z.string().nullable().optional(),
    customer_id: Id,
    reason: z.string(),
    currency_code: z.string(),
    status: z.string(),
    totals: Totals.optional(),
  })
  .passthrough();
export type PaddleAdjustment = z.infer<typeof PaddleAdjustment>;

export const PaddleCreditBalance = z
  .object({ customer_id: Id, currency_code: z.string(), balance: z.object({ available: z.string(), reserved: z.string(), used: z.string() }).passthrough() })
  .passthrough();

export const PaddlePortalSession = z
  .object({ id: Id, customer_id: Id, urls: z.object({ general: z.object({ overview: z.string() }).passthrough() }).passthrough() })
  .passthrough();

const TransactionPreview = z.object({ billing_period: Period.nullable().optional(), details: Details }).passthrough();

export const PaddleSubscriptionPreview = PaddleSubscription.extend({
  immediate_transaction: TransactionPreview.nullable().optional(),
  next_transaction: TransactionPreview.nullable().optional(),
  update_summary: z
    .object({ result: z.object({ action: z.enum(['credit', 'charge']), amount: z.string(), currency_code: z.string() }).passthrough() })
    .passthrough()
    .nullable()
    .optional(),
});
export type PaddleSubscriptionPreview = z.infer<typeof PaddleSubscriptionPreview>;

/** Every list answers `{ data, meta.pagination }`; `has_more` says whether there's another page (`next` always comes). */
export function page<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    data: z.array(item),
    meta: z.object({ pagination: z.object({ has_more: z.boolean(), next: z.string().nullable().optional() }).passthrough().optional() }).passthrough().optional(),
  });
}

/** Every single entity answers `{ data }`. */
export function one<T extends z.ZodTypeAny>(item: T) {
  return z.object({ data: item }).transform((r) => r.data as z.output<T>);
}

// ── Webhooks ─────────────────────────────────────────────────────────────────

/** A notification as Paddle posts it. `event_id` is the same on every retry of an event: dedupe on it. */
export const PaddleNotification = z
  .object({
    event_id: z.string().min(1),
    event_type: z.string().min(1),
    occurred_at: When,
    notification_id: z.string().min(1),
    data: z.record(z.unknown()),
  })
  .passthrough();
export type PaddleNotification = z.infer<typeof PaddleNotification>;

// ── Inputs the client takes ──────────────────────────────────────────────────

const Item = z.object({ price_id: z.string().min(1), quantity: z.number().int().min(1).optional() });
export const Items = z.array(Item).min(1).max(100);
export type PaddleItemInput = z.infer<typeof Item>;

export const ProrationBillingMode = z.enum(['prorated_immediately', 'prorated_next_billing_period', 'full_immediately', 'full_next_billing_period', 'do_not_bill']);
export type ProrationBillingMode = z.infer<typeof ProrationBillingMode>;

export const UsageEvent = z.object({
  /** Unique for this usage in the app: a request or job id. With `occurred_at`, it's what makes a resend count once. */
  event_key: z.string().min(1).max(255),
  customer_id: z.string().min(1),
  /** The meter's action: lowercase letters, digits and underscores, starting with a letter. */
  action: z.string().regex(/^[a-z][a-z0-9_]{1,63}$/, 'a meter action: lowercase letters, digits and underscores, 2 to 64 long'),
  /** A positive decimal with at most 9 decimal places. */
  quantity: z.string().regex(/^(?!0+(\.0+)?$)\d{1,35}(\.\d{1,9})?$/, 'a positive decimal with at most 9 decimal places'),
  /** RFC 3339, UTC; at most 60 days ago and 24 hours ahead. Send the same one on a resend. */
  occurred_at: z.string().min(1),
});
export type UsageEvent = z.infer<typeof UsageEvent>;
