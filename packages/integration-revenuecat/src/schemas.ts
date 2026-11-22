import { z } from 'zod';

/**
 * RevenueCat's REST API v2 shapes, as far as an app reads them. Unknown fields pass through (`passthrough`), so a
 * field RevenueCat adds doesn't fail the boundary; a field the app relies on that goes missing does. Times are
 * milliseconds since the epoch, as RevenueCat sends them.
 */

/** One page of a list. `next_page` is the path of the next page, or null on the last. */
function list<T extends z.ZodTypeAny>(item: T) {
  return z.object({ items: z.array(item), next_page: z.string().nullable().optional(), url: z.string().optional() }).passthrough();
}

export const Environment = z.enum(['production', 'sandbox']);
export type Environment = z.infer<typeof Environment>;

/** An entitlement the customer has now. `entitlement_id` is the entitlement's id (`entl…`), not its lookup key. */
export const CustomerEntitlement = z
  .object({
    entitlement_id: z.string(),
    /** When access ends, in ms; null for access that doesn't end (a lifetime purchase). */
    expires_at: z.number().nullable(),
  })
  .passthrough();
export type CustomerEntitlement = z.infer<typeof CustomerEntitlement>;

export const CustomerEntitlementPage = list(CustomerEntitlement);
export type CustomerEntitlementPage = z.infer<typeof CustomerEntitlementPage>;

export const Customer = z
  .object({
    /** The App User ID the app's SDK logged the customer in with. */
    id: z.string(),
    project_id: z.string(),
    first_seen_at: z.number(),
    last_seen_at: z.number().nullable().optional(),
    last_seen_platform: z.string().nullable().optional(),
    last_seen_country: z.string().nullable().optional(),
    /** Read it with `isEntitled` / `activeEntitlements`. `customers.get` fetches every page of it. */
    active_entitlements: CustomerEntitlementPage.default({ items: [], next_page: null }),
  })
  .passthrough();
export type Customer = z.infer<typeof Customer>;

export const DeletedCustomer = z.object({ id: z.string(), deleted_at: z.number() }).passthrough();
export type DeletedCustomer = z.infer<typeof DeletedCustomer>;

export const Store = z.string();

export const Subscription = z
  .object({
    id: z.string(),
    customer_id: z.string(),
    product_id: z.string().nullable(),
    starts_at: z.number(),
    current_period_starts_at: z.number(),
    current_period_ends_at: z.number().nullable(),
    ends_at: z.number().nullable(),
    /** Whether it gives access now: RevenueCat's own answer, which counts trials and grace periods. */
    gives_access: z.boolean(),
    pending_payment: z.boolean(),
    /** `will_renew`, `will_not_renew`, `will_change_product`, `will_pause`, `requires_price_increase_consent`, `has_already_renewed`. */
    auto_renewal_status: z.string(),
    /** `trialing`, `active`, `expired`, `in_grace_period`, `in_billing_retry`, `paused`, `unknown`, `incomplete`. */
    status: z.string(),
    environment: Environment,
    /** `app_store`, `play_store`, `stripe`, `rc_billing`, `promotional`, `test_store`, … */
    store: Store,
    store_subscription_identifier: z.string(),
    management_url: z.string().nullable().optional(),
  })
  .passthrough();
export type Subscription = z.infer<typeof Subscription>;

export const SubscriptionPage = list(Subscription);
export type SubscriptionPage = z.infer<typeof SubscriptionPage>;

export const Purchase = z
  .object({
    id: z.string(),
    customer_id: z.string(),
    product_id: z.string(),
    purchased_at: z.number(),
    quantity: z.number(),
    /** `owned` or `refunded`. */
    status: z.string(),
    environment: Environment,
    store: Store,
    store_purchase_identifier: z.string(),
  })
  .passthrough();
export type Purchase = z.infer<typeof Purchase>;

export const PurchasePage = list(Purchase);
export type PurchasePage = z.infer<typeof PurchasePage>;

export const Entitlement = z
  .object({
    /** What `isEntitled` and the grant calls take: `entl…`. */
    id: z.string(),
    /** The name you gave it (`premium`): stable across projects, unlike the id. */
    lookup_key: z.string(),
    display_name: z.string(),
    /** `active`, or `inactive` once archived. */
    state: z.string(),
  })
  .passthrough();
export type Entitlement = z.infer<typeof Entitlement>;

export const EntitlementPage = list(Entitlement);
export type EntitlementPage = z.infer<typeof EntitlementPage>;

export const Product = z
  .object({
    id: z.string(),
    /** The product's id in its store: what the app's SDK purchases. */
    store_identifier: z.string(),
    /** `subscription`, `one_time`, `consumable`, `non_consumable`, `non_renewing_subscription`. */
    type: z.string(),
    state: z.string(),
    app_id: z.string(),
    display_name: z.string().nullable(),
  })
  .passthrough();
export type Product = z.infer<typeof Product>;

export const ProductPage = list(Product);
export type ProductPage = z.infer<typeof ProductPage>;

export const Package = z
  .object({
    id: z.string(),
    lookup_key: z.string(),
    display_name: z.string(),
    position: z.number().nullable().optional(),
    products: list(z.object({ product: Product.partial().passthrough(), eligibility_criteria: z.string().optional() }).passthrough()).optional(),
  })
  .passthrough();
export type Package = z.infer<typeof Package>;

export const Offering = z
  .object({
    id: z.string(),
    lookup_key: z.string(),
    display_name: z.string(),
    /** The offering the SDK shows by default. */
    is_current: z.boolean(),
    state: z.string(),
    metadata: z.record(z.unknown()).nullable().optional(),
    packages: list(Package).nullable().optional(),
  })
  .passthrough();
export type Offering = z.infer<typeof Offering>;

export const OfferingPage = list(Offering);
export type OfferingPage = z.infer<typeof OfferingPage>;

const Id = z.string().min(1).max(1500);
const Page = { limit: z.number().int().min(1).max(100).optional(), startingAfter: z.string().min(1).optional() };

export const CustomerPageInput = z.object({ customerId: Id, ...Page });
export type CustomerPageInput = z.infer<typeof CustomerPageInput>;

export const CustomerHistoryInput = CustomerPageInput.extend({ environment: Environment.optional() });
export type CustomerHistoryInput = z.infer<typeof CustomerHistoryInput>;

export const ProjectPageInput = z.object(Page);
export type ProjectPageInput = z.infer<typeof ProjectPageInput>;

export const ListOfferingsInput = ProjectPageInput.extend({
  /** Include each offering's packages and their products (the default), as a paywall needs. */
  withProducts: z.boolean().default(true),
});
export type ListOfferingsInput = z.input<typeof ListOfferingsInput>;

export const ListProductsInput = ProjectPageInput.extend({ appId: z.string().min(1).optional() });
export type ListProductsInput = z.infer<typeof ListProductsInput>;

export const GrantEntitlementInput = z.object({
  customerId: Id,
  entitlementId: z.string().min(1).max(255),
  /** When the grant ends: a Date or ms since the epoch, in the future. */
  expiresAt: z.union([z.date().transform((d) => d.getTime()), z.number().int().positive()]),
});
export type GrantEntitlementInput = z.input<typeof GrantEntitlementInput>;

export const RevokeEntitlementInput = z.object({ customerId: Id, entitlementId: z.string().min(1).max(255) });
export type RevokeEntitlementInput = z.infer<typeof RevokeEntitlementInput>;

/** What RevenueCat posts to a webhook. Fields vary by event type; the ones every app needs are typed. */
export const WebhookEvent = z
  .object({
    /** The same on every retry of the delivery: dedupe on it. */
    id: z.string().min(1),
    type: z.string().min(1),
    event_timestamp_ms: z.number(),
    app_id: z.string().nullable().optional(),
    /** The customer's App User ID. Absent on TRANSFER: read `transferred_from` and `transferred_to`. */
    app_user_id: z.string().optional(),
    original_app_user_id: z.string().optional(),
    aliases: z.array(z.string()).nullable().optional(),
    /** `SANDBOX` or `PRODUCTION`: one customer can have both. */
    environment: z.string().optional(),
    store: z.string().optional(),
    product_id: z.string().nullable().optional(),
    /** The entitlements the event is about. Decide access from the customer you fetch, not from this. */
    entitlement_ids: z.array(z.string()).nullable().optional(),
    period_type: z.string().optional(),
    purchased_at_ms: z.number().nullable().optional(),
    expiration_at_ms: z.number().nullable().optional(),
    cancel_reason: z.string().optional(),
    expiration_reason: z.string().optional(),
    transferred_from: z.array(z.string()).optional(),
    transferred_to: z.array(z.string()).optional(),
  })
  .passthrough();
export type WebhookEvent = z.infer<typeof WebhookEvent>;

export const WebhookBody = z.object({ api_version: z.string().optional(), event: WebhookEvent }).passthrough();
export type WebhookBody = z.infer<typeof WebhookBody>;
