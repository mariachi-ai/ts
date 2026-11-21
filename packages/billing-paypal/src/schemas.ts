import { z } from 'zod';

// ── What PayPal answers: only the fields this package reads are checked; the rest passes through ──────────

/** PayPal objects keep every field PayPal sent; these are the ones this package reads. */
type Open = { [key: string]: unknown };

export interface Money extends Open {
  currency_code: string;
  value: string;
}
export interface Link extends Open {
  href: string;
  rel: string;
  method?: string;
}
export interface Capture extends Open {
  id: string;
  status: string;
  amount?: Money;
  custom_id?: string;
  invoice_id?: string;
  status_details?: { reason?: string; [key: string]: unknown };
  supplementary_data?: { related_ids?: { order_id?: string; authorization_id?: string; capture_id?: string; [key: string]: unknown }; [key: string]: unknown };
  links?: Link[];
  create_time?: string;
  update_time?: string;
}
export interface Refund extends Open {
  id: string;
  status: string;
  amount?: Money;
  custom_id?: string;
  links?: Link[];
  create_time?: string;
}
export interface PurchaseUnit extends Open {
  reference_id?: string;
  amount?: Money;
  custom_id?: string;
  invoice_id?: string;
  description?: string;
  payments?: { captures?: Capture[]; refunds?: Refund[]; [key: string]: unknown };
}
export interface Order extends Open {
  id: string;
  status: string;
  intent?: string;
  purchase_units?: PurchaseUnit[];
  links?: Link[];
  create_time?: string;
  update_time?: string;
}
export interface Product extends Open {
  id: string;
  name: string;
  description?: string;
  type?: string;
}
interface Paging {
  total_items?: number;
  total_pages?: number;
  links?: Link[];
}
export interface ProductPage extends Open, Paging {
  products: Product[];
}
export interface BillingCycle extends Open {
  tenure_type: string;
  sequence: number;
  total_cycles?: number;
  frequency: { interval_unit: string; interval_count?: number; [key: string]: unknown };
  pricing_scheme?: { fixed_price?: Money; [key: string]: unknown };
}
export interface PayPalPlan extends Open {
  id: string;
  product_id?: string;
  name?: string;
  status?: string;
  description?: string;
  billing_cycles?: BillingCycle[];
  quantity_supported?: boolean;
  links?: Link[];
}
export interface PlanPage extends Open, Paging {
  plans: PayPalPlan[];
}
export interface PayPalSubscription extends Open {
  id: string;
  status: string;
  plan_id?: string;
  quantity?: string;
  custom_id?: string;
  start_time?: string;
  status_update_time?: string;
  billing_info?: {
    next_billing_time?: string;
    failed_payments_count?: number;
    last_payment?: { time?: string; amount?: Money; [key: string]: unknown };
    [key: string]: unknown;
  };
  links?: Link[];
}
export interface ReviseResponse extends Open {
  plan_id?: string;
  quantity?: string;
  links?: Link[];
}
export interface AccessToken extends Open {
  access_token: string;
  token_type?: string;
  expires_in: number;
}

type Schema<T> = z.ZodType<T, z.ZodTypeDef, unknown>;

const MoneySchema = z.object({ currency_code: z.string(), value: z.string() }).passthrough();
const LinkSchema = z.object({ href: z.string(), rel: z.string(), method: z.string().optional() }).passthrough();
const RelatedIds = z.object({ order_id: z.string().optional(), authorization_id: z.string().optional(), capture_id: z.string().optional() }).passthrough();

export const Capture: Schema<Capture> = z
  .object({
    id: z.string(),
    status: z.string(),
    amount: MoneySchema.optional(),
    custom_id: z.string().optional(),
    invoice_id: z.string().optional(),
    status_details: z.object({ reason: z.string().optional() }).passthrough().optional(),
    supplementary_data: z.object({ related_ids: RelatedIds.optional() }).passthrough().optional(),
    links: z.array(LinkSchema).optional(),
    create_time: z.string().optional(),
    update_time: z.string().optional(),
  })
  .passthrough();

const RefundSchema = z
  .object({
    id: z.string(),
    status: z.string(),
    amount: MoneySchema.optional(),
    custom_id: z.string().optional(),
    links: z.array(LinkSchema).optional(),
    create_time: z.string().optional(),
  })
  .passthrough();
export const Refund: Schema<Refund> = RefundSchema;

const PurchaseUnitSchema = z
  .object({
    reference_id: z.string().optional(),
    amount: MoneySchema.optional(),
    custom_id: z.string().optional(),
    invoice_id: z.string().optional(),
    description: z.string().optional(),
    payments: z.object({ captures: z.array(Capture).optional(), refunds: z.array(RefundSchema).optional() }).passthrough().optional(),
  })
  .passthrough();

export const Order: Schema<Order> = z
  .object({
    id: z.string(),
    status: z.string(),
    intent: z.string().optional(),
    purchase_units: z.array(PurchaseUnitSchema).optional(),
    links: z.array(LinkSchema).optional(),
    create_time: z.string().optional(),
    update_time: z.string().optional(),
  })
  .passthrough();

const Paging = { total_items: z.number().optional(), total_pages: z.number().optional(), links: z.array(LinkSchema).optional() };

const ProductSchema = z.object({ id: z.string(), name: z.string(), description: z.string().optional(), type: z.string().optional() }).passthrough();
export const Product: Schema<Product> = ProductSchema;
export const ProductPage: Schema<ProductPage> = z.object({ products: z.array(ProductSchema).default([]), ...Paging }).passthrough();

const BillingCycleSchema = z
  .object({
    tenure_type: z.string(),
    sequence: z.number(),
    total_cycles: z.number().optional(),
    frequency: z.object({ interval_unit: z.string(), interval_count: z.number().optional() }).passthrough(),
    pricing_scheme: z.object({ fixed_price: MoneySchema.optional() }).passthrough().optional(),
  })
  .passthrough();

const PlanSchema = z
  .object({
    id: z.string(),
    product_id: z.string().optional(),
    name: z.string().optional(),
    status: z.string().optional(),
    description: z.string().optional(),
    billing_cycles: z.array(BillingCycleSchema).optional(),
    quantity_supported: z.boolean().optional(),
    links: z.array(LinkSchema).optional(),
  })
  .passthrough();
export const PayPalPlan: Schema<PayPalPlan> = PlanSchema;
export const PlanPage: Schema<PlanPage> = z.object({ plans: z.array(PlanSchema).default([]), ...Paging }).passthrough();

export const PayPalSubscription: Schema<PayPalSubscription> = z
  .object({
    id: z.string(),
    status: z.string(),
    plan_id: z.string().optional(),
    quantity: z.string().optional(),
    custom_id: z.string().optional(),
    start_time: z.string().optional(),
    status_update_time: z.string().optional(),
    billing_info: z
      .object({
        next_billing_time: z.string().optional(),
        failed_payments_count: z.number().optional(),
        last_payment: z.object({ time: z.string().optional(), amount: MoneySchema.optional() }).passthrough().optional(),
      })
      .passthrough()
      .optional(),
    links: z.array(LinkSchema).optional(),
  })
  .passthrough();

export const ReviseResponse: Schema<ReviseResponse> = z.object({ plan_id: z.string().optional(), quantity: z.string().optional(), links: z.array(LinkSchema).optional() }).passthrough();

export const AccessToken: Schema<AccessToken> = z.object({ access_token: z.string().min(1), token_type: z.string().optional(), expires_in: z.number().positive() }).passthrough();

// ── What the app sends ─────────────────────────────────────────────────────────────────────────────────

const Key = z.string().min(1).optional();
const Url = z.string().url();
const Currency = z.string().regex(/^[A-Za-z]{3}$/, 'a 3-letter currency code');
/** Amounts are integers in the currency's minor unit, as everywhere in billing. */
const Minor = z.number().int().positive();

export const CreateOrderInput = z.object({
  amount: Minor,
  currency: Currency,
  description: z.string().min(1).max(127).optional(),
  /** Reconciles the payment with the app: kept on the order and its capture, never shown to the buyer. */
  customId: z.string().min(1).max(255).optional(),
  invoiceId: z.string().min(1).max(127).optional(),
  /** For a redirect flow without the JavaScript SDK: where PayPal sends the buyer after approving, or cancelling. */
  returnUrl: Url.optional(),
  cancelUrl: Url.optional(),
  idempotencyKey: Key,
});
export type CreateOrderInput = z.input<typeof CreateOrderInput>;

export const CaptureOrderInput = z.object({ orderId: z.string().min(1), idempotencyKey: Key });
export type CaptureOrderInput = z.input<typeof CaptureOrderInput>;

export const RefundCaptureInput = z.object({
  captureId: z.string().min(1),
  /** Leave it out to refund what remains of the capture. */
  amount: Minor.optional(),
  currency: Currency.optional(),
  /** Shown to the buyer. */
  noteToPayer: z.string().min(1).max(255).optional(),
  idempotencyKey: Key,
});
export type RefundCaptureInput = z.input<typeof RefundCaptureInput>;

export const CreateProductInput = z.object({
  name: z.string().min(1).max(127),
  type: z.enum(['PHYSICAL', 'DIGITAL', 'SERVICE']).default('SERVICE'),
  description: z.string().min(1).max(256).optional(),
  idempotencyKey: Key,
});
export type CreateProductInput = z.input<typeof CreateProductInput>;

export const PageInput = z.object({ page: z.number().int().positive().optional(), pageSize: z.number().int().min(1).max(20).optional() });
export type PageInput = z.input<typeof PageInput>;

export const ListPlansInput = PageInput.extend({ productId: z.string().min(1).optional() });
export type ListPlansInput = z.input<typeof ListPlansInput>;

export const CreatePlanInput = z.object({
  productId: z.string().min(1),
  name: z.string().min(1).max(127),
  description: z.string().min(1).max(127).optional(),
  /** The price of each billing cycle, in minor units. */
  amount: Minor,
  currency: Currency,
  interval: z.enum(['day', 'week', 'month', 'year']),
  intervalCount: z.number().int().positive().default(1),
  /** Allow `quantity` on subscriptions to this plan (seats). */
  quantitySupported: z.boolean().optional(),
  /** Failed payments in a row before PayPal suspends the subscription. */
  paymentFailureThreshold: z.number().int().min(0).optional(),
  idempotencyKey: Key,
});
export type CreatePlanInput = z.input<typeof CreatePlanInput>;

export const CreateSubscriptionInput = z.object({
  planId: z.string().min(1),
  quantity: z.number().int().positive().optional(),
  /** Reconciles the subscription with the app (at most 127 printable ASCII characters). */
  customId: z.string().min(1).max(127).regex(/^[\x20-\x7E]+$/).optional(),
  /** For a redirect flow: where PayPal sends the subscriber after approving, or cancelling. Give both or neither. */
  returnUrl: Url.optional(),
  cancelUrl: Url.optional(),
  idempotencyKey: Key,
});
export type CreateSubscriptionInput = z.input<typeof CreateSubscriptionInput>;

const Reason = z.string().min(1).max(128);

export const SubscriptionActionInput = z.object({ subscriptionId: z.string().min(1), reason: Reason });
export type SubscriptionActionInput = z.input<typeof SubscriptionActionInput>;

export const ActivateSubscriptionInput = z.object({ subscriptionId: z.string().min(1), reason: Reason.optional() });
export type ActivateSubscriptionInput = z.input<typeof ActivateSubscriptionInput>;

export const ReviseSubscriptionInput = z.object({
  subscriptionId: z.string().min(1),
  planId: z.string().min(1).optional(),
  quantity: z.number().int().positive().optional(),
  /** Where PayPal sends the subscriber after approving the change, or cancelling it. Give both or neither. */
  returnUrl: Url.optional(),
  cancelUrl: Url.optional(),
});
export type ReviseSubscriptionInput = z.input<typeof ReviseSubscriptionInput>;

// ── Webhooks ─────────────────────────────────────────────────────────────────────────────────────────────

/** A webhook delivery's body: the event, with the resource it is about (a capture, a refund, a subscription). */
export interface PayPalWebhookEvent extends Open {
  id: string;
  event_type: string;
  create_time: string;
  resource_type?: string;
  event_version?: string;
  resource_version?: string;
  summary?: string;
  resource: Record<string, unknown>;
}

export const PayPalWebhookEvent: Schema<PayPalWebhookEvent> = z
  .object({
    id: z.string().min(1),
    event_type: z.string().min(1),
    create_time: z.string(),
    resource_type: z.string().optional(),
    event_version: z.string().optional(),
    resource_version: z.string().optional(),
    summary: z.string().optional(),
    resource: z.record(z.unknown()),
  })
  .passthrough();
