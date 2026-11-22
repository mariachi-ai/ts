/**
 * `@mariachi/integration-revenuecat/testing`: a RevenueCat for an app's tests, held in memory, with the same shape
 * as `createRevenueCat`'s client; a customer builder; and a webhook delivery signed the way RevenueCat signs one.
 */
import { NotFoundError } from '@mariachi/core';
import { signStripeWebhook } from '@mariachi/webhooks';
import type { RevenueCat } from './client';
import type { Customer, CustomerEntitlement, Entitlement, Offering, Product, Purchase, Subscription, WebhookEvent } from './schemas';
import { REVENUECAT_SIGNATURE_HEADER } from './webhooks';

export interface FakeRevenueCat extends RevenueCat {
  customers_: Map<string, Customer>;
  subscriptions_: Map<string, Subscription[]>;
  purchases_: Map<string, Purchase[]>;
  entitlements_: Entitlement[];
  offerings_: Offering[];
  products_: Product[];
}

export interface FakeRevenueCatSeed {
  customers?: Customer[];
  subscriptions?: Record<string, Subscription[]>;
  purchases?: Record<string, Purchase[]>;
  entitlements?: Entitlement[];
  offerings?: Offering[];
  products?: Product[];
}

/**
 * An in-memory RevenueCat: seed customers and the rest, then hand it to the code under test in place of the client.
 * Grants and revokes change the customer's active entitlements as RevenueCat would; lists answer one page.
 */
export function fakeRevenueCat(seed: FakeRevenueCatSeed = {}): FakeRevenueCat {
  const customers_ = new Map((seed.customers ?? []).map((c) => [c.id, c]));
  const subscriptions_ = new Map(Object.entries(seed.subscriptions ?? {}));
  const purchases_ = new Map(Object.entries(seed.purchases ?? {}));
  const entitlements_ = [...(seed.entitlements ?? [])];
  const offerings_ = [...(seed.offerings ?? [])];
  const products_ = [...(seed.products ?? [])];
  const customerOf = (id: string) => {
    const c = customers_.get(id);
    if (!c) throw new NotFoundError('revenuecat customer', id);
    return c;
  };
  const one = <T>(items: T[]) => ({ items, next_page: null });
  const env = <T extends { environment: string }>(items: T[], environment?: string) => (environment ? items.filter((i) => i.environment === environment) : items);

  const fake: FakeRevenueCat = {
    customers_,
    subscriptions_,
    purchases_,
    entitlements_,
    offerings_,
    products_,
    customers: {
      async get(_ctx, customerId) {
        return structuredClone(customerOf(customerId));
      },
      async delete(_ctx, customerId) {
        customerOf(customerId);
        customers_.delete(customerId);
        return { id: customerId, deleted_at: Date.now() };
      },
      async grantEntitlement(_ctx, input) {
        const c = customerOf(input.customerId);
        const expiresAt = input.expiresAt instanceof Date ? input.expiresAt.getTime() : input.expiresAt;
        const items = c.active_entitlements.items.filter((e) => e.entitlement_id !== input.entitlementId);
        c.active_entitlements = { ...c.active_entitlements, items: [...items, { entitlement_id: input.entitlementId, expires_at: expiresAt }] };
        return structuredClone(c);
      },
      async revokeGrantedEntitlement(_ctx, input) {
        const c = customerOf(input.customerId);
        c.active_entitlements = { ...c.active_entitlements, items: c.active_entitlements.items.filter((e) => e.entitlement_id !== input.entitlementId) };
        return structuredClone(c);
      },
    },
    activeEntitlements: {
      async list(_ctx, input) {
        return one([...customerOf(input.customerId).active_entitlements.items]);
      },
    },
    subscriptions: {
      async list(_ctx, input) {
        customerOf(input.customerId);
        return one(env(subscriptions_.get(input.customerId) ?? [], input.environment));
      },
      async *all(ctx, input) {
        yield* (await fake.subscriptions.list(ctx, input)).items;
      },
    },
    purchases: {
      async list(_ctx, input) {
        customerOf(input.customerId);
        return one(env(purchases_.get(input.customerId) ?? [], input.environment));
      },
      async *all(ctx, input) {
        yield* (await fake.purchases.list(ctx, input)).items;
      },
    },
    entitlements: {
      async list() {
        return one([...entitlements_]);
      },
      async *all() {
        yield* entitlements_;
      },
    },
    offerings: {
      async list() {
        return one([...offerings_]);
      },
    },
    products: {
      async list(_ctx, input = {}) {
        return one(products_.filter((p) => !input.appId || p.app_id === input.appId));
      },
    },
  };
  return fake;
}

/** A customer to seed the fake with: `revenueCatCustomer('user_1', [{ entitlement_id: 'entl_pro', expires_at: null }])`. */
export function revenueCatCustomer(id: string, active: CustomerEntitlement[] = [], overrides: Partial<Customer> = {}): Customer {
  return { id, project_id: 'proj_test', first_seen_at: Date.parse('2026-11-01T00:00:00Z'), active_entitlements: { items: active, next_page: null }, ...overrides };
}

/** A webhook event, with the fields every event has filled in. */
export function revenueCatEvent(overrides: Partial<WebhookEvent> & Pick<WebhookEvent, 'type'>): WebhookEvent {
  return { id: `evt_${Math.random().toString(36).slice(2, 10)}`, event_timestamp_ms: Date.now(), environment: 'SANDBOX', ...overrides };
}

/**
 * The body and headers RevenueCat would send for this event: an `X-RevenueCat-Webhook-Signature` when a signing
 * secret is given, an `Authorization` header when an authorization value is.
 */
export function signedRevenueCatWebhook(
  event: WebhookEvent,
  auth: { signingSecret?: string; authorization?: string; timestampSeconds?: number },
): { rawBody: string; headers: Record<string, string> } {
  const rawBody = JSON.stringify({ api_version: '1.0', event });
  const headers: Record<string, string> = {};
  if (auth.signingSecret) headers[REVENUECAT_SIGNATURE_HEADER] = signStripeWebhook(auth.signingSecret, auth.timestampSeconds ?? Math.floor(Date.now() / 1000), rawBody);
  if (auth.authorization) headers.authorization = auth.authorization;
  return { rawBody, headers };
}
