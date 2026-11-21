import { type Context, fromZodError } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { RevenueCatError } from './errors';
import { type RevenuecatConfig, type RevenuecatOperation, configSchema, errorMap, provider } from './generated';
import {
  Customer,
  CustomerEntitlementPage,
  CustomerHistoryInput,
  CustomerPageInput,
  DeletedCustomer,
  type Entitlement,
  EntitlementPage,
  GrantEntitlementInput,
  ListOfferingsInput,
  ListProductsInput,
  OfferingPage,
  ProductPage,
  ProjectPageInput,
  type Purchase,
  PurchasePage,
  RevokeEntitlementInput,
  type Subscription,
  SubscriptionPage,
} from './schemas';

export interface RevenueCatDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

/**
 * The RevenueCat client (REST API v2): each operation takes `ctx` first, checks its input and RevenueCat's
 * answer, and makes one span (`revenuecat customers.get`). Build it once at startup and share it. Server only:
 * it holds the secret key.
 *
 * ```ts
 * const revenuecat = createRevenueCat(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * const customer = await revenuecat.customers.get(ctx, user.id);
 * if (isEntitled(customer, config.revenuecat.proEntitlementId)) { ... }
 * ```
 */
export function createRevenueCat(config: RevenueCatConfig, deps: RevenueCatDeps = {}) {
  const cfg = configSchema.parse(config);
  const base = provider.baseUrl;
  const server = provider.server;
  const project = `/projects/${segment(cfg.projectId)}`;

  function call<T>(
    ctx: Context,
    operation: RevenuecatOperation,
    request: Omit<ProviderRequest, 'url' | 'headers'> & { path: string; expand?: string[] },
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    const { path, expand, ...rest } = request;
    // An array query parameter is the key repeated (`expand=a&expand=b`), OpenAPI's default for RevenueCat's spec.
    const expandQuery = expand?.length ? `?${expand.map((e) => `expand=${encodeURIComponent(e)}`).join('&')}` : '';
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server },
      { ...rest, url: `${base}${project}${path}${expandQuery}`, headers: { authorization: `Bearer ${cfg.secretKey}` } },
      { schema, error: RevenueCatError, failure, deps },
    );
  }

  const customer = (id: string) => `/customers/${segment(id)}`;
  const page = (i: { limit?: number; startingAfter?: string }) => ({ limit: i.limit, starting_after: i.startingAfter });

  const activeEntitlements = {
    /** One page of a customer's active entitlements. `customers.get` already has them all. */
    async list(ctx: Context, input: CustomerPageInput) {
      const i = parse(CustomerPageInput, input);
      return call(ctx, 'activeEntitlements.list', { method: 'GET', path: `${customer(i.customerId)}/active_entitlements`, query: page(i) }, CustomerEntitlementPage);
    },
  };

  const customers = {
    /**
     * The customer with this App User ID and every one of its active entitlements (fetching further pages when
     * there are more than one page holds). Read access with `isEntitled(customer, entitlementId)`. A customer
     * RevenueCat doesn't know fails with `revenuecat/not-found`.
     */
    async get(ctx: Context, customerId: string) {
      const id = parse(CustomerPageInput.shape.customerId, customerId);
      const found = await call(ctx, 'customers.get', { method: 'GET', path: customer(id) }, Customer);
      let next = cursorOf(found.active_entitlements.next_page);
      while (next) {
        const more = await activeEntitlements.list(ctx, { customerId: id, limit: 100, startingAfter: next });
        found.active_entitlements.items.push(...more.items);
        next = cursorOf(more.next_page);
      }
      found.active_entitlements.next_page = null;
      return found;
    },
    /**
     * Permanently deletes the customer and its data in RevenueCat (for a deletion request). RevenueCat queues it:
     * `get` answers `revenuecat/not-found` once it's done.
     */
    async delete(ctx: Context, customerId: string) {
      const id = parse(CustomerPageInput.shape.customerId, customerId);
      return call(ctx, 'customers.delete', { method: 'DELETE', path: customer(id) }, DeletedCustomer);
    },
    /**
     * Grants a promotional entitlement until `expiresAt`, and answers the customer as it is now. To extend a grant,
     * grant again with an expiry at least two hours later; a grant within two hours of an existing one's expiry is
     * ignored (so a retry is harmless). To shorten one, revoke it and grant again.
     */
    async grantEntitlement(ctx: Context, input: GrantEntitlementInput) {
      const i = parse(GrantEntitlementInput, input);
      return call(
        ctx,
        'customers.grantEntitlement',
        { method: 'POST', path: `${customer(i.customerId)}/actions/grant_entitlement`, json: { entitlement_id: i.entitlementId, expires_at: i.expiresAt } },
        Customer,
      );
    },
    /** Ends every promotional grant of the entitlement at once. Access the customer bought in a store stays. */
    async revokeGrantedEntitlement(ctx: Context, input: RevokeEntitlementInput) {
      const i = parse(RevokeEntitlementInput, input);
      return call(
        ctx,
        'customers.revokeGrantedEntitlement',
        { method: 'POST', path: `${customer(i.customerId)}/actions/revoke_granted_entitlement`, json: { entitlement_id: i.entitlementId } },
        Customer,
      );
    },
  };

  const subscriptions = {
    /** One page of a customer's subscriptions, in every store; `environment` keeps only sandbox or production. */
    async list(ctx: Context, input: CustomerHistoryInput) {
      const i = parse(CustomerHistoryInput, input);
      return call(ctx, 'subscriptions.list', { method: 'GET', path: `${customer(i.customerId)}/subscriptions`, query: { ...page(i), environment: i.environment } }, SubscriptionPage);
    },
    /** Every subscription of the customer, fetching pages as they're read. */
    async *all(ctx: Context, input: CustomerHistoryInput): AsyncGenerator<Subscription> {
      yield* pages((startingAfter) => subscriptions.list(ctx, { ...input, limit: input.limit ?? 100, startingAfter }), input.startingAfter);
    },
  };

  const purchases = {
    /** One page of a customer's one-time purchases; `environment` keeps only sandbox or production. */
    async list(ctx: Context, input: CustomerHistoryInput) {
      const i = parse(CustomerHistoryInput, input);
      return call(ctx, 'purchases.list', { method: 'GET', path: `${customer(i.customerId)}/purchases`, query: { ...page(i), environment: i.environment } }, PurchasePage);
    },
    async *all(ctx: Context, input: CustomerHistoryInput): AsyncGenerator<Purchase> {
      yield* pages((startingAfter) => purchases.list(ctx, { ...input, limit: input.limit ?? 100, startingAfter }), input.startingAfter);
    },
  };

  const entitlements = {
    /** One page of the project's entitlements: each one's id (`entl…`), which the other calls take, and its lookup key. */
    async list(ctx: Context, input: ProjectPageInput = {}) {
      const i = parse(ProjectPageInput, input);
      return call(ctx, 'entitlements.list', { method: 'GET', path: '/entitlements', query: page(i) }, EntitlementPage);
    },
    async *all(ctx: Context, input: ProjectPageInput = {}): AsyncGenerator<Entitlement> {
      yield* pages((startingAfter) => entitlements.list(ctx, { ...input, limit: input.limit ?? 100, startingAfter }), input.startingAfter);
    },
  };

  const offerings = {
    /**
     * One page of the project's offerings, each with its packages and their products unless `withProducts` is
     * false. Project configuration calls are limited to 60 a minute: cache the answer rather than calling per
     * request.
     */
    async list(ctx: Context, input: ListOfferingsInput = {}) {
      const i = parse(ListOfferingsInput, input);
      return call(
        ctx,
        'offerings.list',
        { method: 'GET', path: '/offerings', query: page(i), expand: i.withProducts ? ['items.package', 'items.package.product'] : undefined },
        OfferingPage,
      );
    },
  };

  const products = {
    /** One page of the project's products, or one app's (`appId`). Limited to 60 calls a minute, like offerings. */
    async list(ctx: Context, input: ListProductsInput = {}) {
      const i = parse(ListProductsInput, input);
      return call(ctx, 'products.list', { method: 'GET', path: '/products', query: { ...page(i), app_id: i.appId } }, ProductPage);
    },
  };

  return { customers, activeEntitlements, subscriptions, purchases, entitlements, offerings, products };
}

export type RevenueCat = ReturnType<typeof createRevenueCat>;
export type RevenueCatConfig = RevenuecatConfig;
export type RevenueCatOperation = RevenuecatOperation;

/** Items from each page in turn, following `next_page` until there is none. */
async function* pages<T>(fetchPage: (startingAfter: string | undefined) => Promise<{ items: T[]; next_page?: string | null }>, start: string | undefined): AsyncGenerator<T> {
  let cursor = start;
  for (;;) {
    const p = await fetchPage(cursor);
    yield* p.items;
    cursor = cursorOf(p.next_page);
    if (!cursor) return;
  }
}

/** RevenueCat's `next_page` is a path with `starting_after=<cursor>`; the cursor is all the client needs from it. */
function cursorOf(nextPage: string | null | undefined): string | undefined {
  if (!nextPage) return undefined;
  return new URL(nextPage, provider.baseUrl).searchParams.get('starting_after') ?? undefined;
}

/** RevenueCat's error body is `{ type, message, retryable, … }`: the type is kept, the message isn't (it can echo input). */
function failure(_status: number, body: unknown): FailureInfo | undefined {
  const type = typeof body === 'object' && body !== null && typeof (body as { type?: unknown }).type === 'string' ? (body as { type: string }).type : undefined;
  const mapped = mappedFailure(errorMap, type);
  return { providerCode: type, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid RevenueCat input');
  return parsed.data;
}

function segment(value: string): string {
  return encodeURIComponent(value);
}
