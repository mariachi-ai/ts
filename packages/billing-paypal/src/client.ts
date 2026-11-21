import { createHash, randomUUID } from 'node:crypto';
import { type Context, fromZodError } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { PayPalError } from './errors';
import { type PaypalOperation, configSchema as generatedConfigSchema, errorMap, provider } from './generated';
import { toPayPalAmount } from './money';
import {
  AccessToken,
  ActivateSubscriptionInput,
  CaptureOrderInput,
  Capture,
  CreateOrderInput,
  CreatePlanInput,
  CreateProductInput,
  CreateSubscriptionInput,
  ListPlansInput,
  type Link,
  Order,
  PageInput,
  PayPalPlan,
  PayPalSubscription,
  PlanPage,
  Product,
  ProductPage,
  Refund,
  RefundCaptureInput,
  ReviseResponse,
  ReviseSubscriptionInput,
  SubscriptionActionInput,
} from './schemas';

/** The settings `createPayPal` takes. `environment` picks the host: `sandbox` or `live`. */
export const configSchema = generatedConfigSchema.extend({ environment: z.enum(['sandbox', 'live']) });
export type PayPalConfig = z.input<typeof configSchema>;
export type PayPalEnvironment = 'sandbox' | 'live';

/** PayPal's REST API host for each environment. */
export const API_HOSTS: Readonly<Record<PayPalEnvironment, string>> = { sandbox: 'api-m.sandbox.paypal.com', live: 'api-m.paypal.com' };

export interface PayPalDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
  /** For tests: the wall clock the access token's expiry is measured with (ms). */
  clock?: () => number;
}

const IDEMPOTENCY_HEADER = 'PayPal-Request-Id';
const REPRESENTATION = { prefer: 'return=representation' };

/**
 * The `PayPal-Request-Id` for an operation. The same key gives the same id, so a retried call happens once;
 * it is derived per operation, as PayPal asks for a different id for each kind of call, and kept to a UUID's
 * 36 characters, inside PayPal's recommended 38. Without a key, each call gets a fresh one (still reused by
 * `callProvider`'s own retries of that call).
 */
export function payPalRequestId(operation: string, key: string | undefined): string {
  if (!key) return randomUUID();
  const h = createHash('sha256').update(`mariachi:${operation}:${key}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

/** Where the buyer approves an order or a subscription (or a revision): its `approve` or `payer-action` link. */
export function approvalUrl(resource: { links?: Link[] }): string | null {
  const link = resource.links?.find((l) => l.rel === 'approve' || l.rel === 'payer-action');
  return link?.href ?? null;
}

type Request = Omit<ProviderRequest, 'url' | 'headers' | 'idempotencyKey'> & { path: string; headers?: Record<string, string>; idempotencyKey?: string };

/**
 * The PayPal client: PayPal's own operations, each taking `ctx` first, checking its input and PayPal's answer,
 * and making one span (`paypal orders.create`). It signs in with the client credentials and keeps the access
 * token until shortly before it expires. Build it once at startup and share it.
 *
 * ```ts
 * const paypal = createPayPal(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * const order = await paypal.orders.create(ctx, { amount: 4_900, currency: 'usd', idempotencyKey: `order:${id}` });
 * ```
 *
 * Amounts are integers in the currency's minor unit, as in `@mariachi/billing`; the client writes PayPal's
 * decimal strings. A failure is a `PayPalError` with a category; only `rate-limited` and `unavailable` are retried.
 */
export function createPayPal(config: PayPalConfig, deps: PayPalDeps = {}) {
  const cfg = configSchema.parse(config);
  const environment: PayPalEnvironment = cfg.environment;
  const server = API_HOSTS[environment];
  const base = `https://${server}`;
  const clock = deps.clock ?? Date.now;
  let token: { value: string; expiresAt: number } | undefined;
  let loading: Promise<string> | undefined;

  function send<T>(ctx: Context | null, operation: PaypalOperation, request: Request, schema: z.ZodType<T, z.ZodTypeDef, unknown>, authorization: string): Promise<T> {
    const { path, headers, idempotencyKey, ...rest } = request;
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server },
      {
        ...rest,
        url: `${base}${path}`,
        headers: { ...headers, authorization },
        idempotencyKey: idempotencyKey === undefined ? undefined : { header: IDEMPOTENCY_HEADER, value: idempotencyKey },
      },
      { schema, error: PayPalError, failure, deps },
    );
  }

  async function accessToken(ctx: Context | null): Promise<string> {
    if (token && token.expiresAt > clock()) return token.value;
    loading ??= send(
      ctx,
      'oauth.token',
      { method: 'POST', path: '/v1/oauth2/token', form: { grant_type: 'client_credentials' } },
      AccessToken,
      `Basic ${Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString('base64')}`,
    )
      .then((t) => {
        const lifetime = t.expires_in * 1000;
        // Renewed a little early (a tenth of its life, at most five minutes), so no call goes out with a token about to lapse
        token = { value: t.access_token, expiresAt: clock() + lifetime - Math.min(300_000, lifetime / 10) };
        return t.access_token;
      })
      .finally(() => {
        loading = undefined;
      });
    return loading;
  }

  async function call<T>(ctx: Context | null, operation: PaypalOperation, request: Request, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    const bearer = await accessToken(ctx);
    try {
      return await send(ctx, operation, request, schema, `Bearer ${bearer}`);
    } catch (error) {
      // A revoked or expired token: fetch a new one next time
      if (error instanceof PayPalError && error.status === 401) token = undefined;
      throw error;
    }
  }

  const orders = {
    /**
     * Creates an order to capture `amount` (minor units). The buyer approves it on PayPal: hand `order.id` to
     * the JavaScript SDK, or send them to `approvalUrl(order)` when `returnUrl` and `cancelUrl` are given. Then
     * capture it with `orders.capture`.
     */
    async create(ctx: Context | null, input: CreateOrderInput) {
      const i = parse(CreateOrderInput, input);
      if (!i.returnUrl !== !i.cancelUrl) throw fromZodError({ issues: [{ path: ['returnUrl'], message: 'give returnUrl and cancelUrl together' }] }, 'Invalid PayPal input');
      const purchaseUnit = { amount: toPayPalAmount(i.amount, i.currency), description: i.description, custom_id: i.customId, invoice_id: i.invoiceId };
      const json = {
        intent: 'CAPTURE',
        purchase_units: [purchaseUnit],
        ...(i.returnUrl ? { payment_source: { paypal: { experience_context: { return_url: i.returnUrl, cancel_url: i.cancelUrl, user_action: 'PAY_NOW' } } } } : {}),
      };
      return call(ctx, 'orders.create', { method: 'POST', path: '/v2/checkout/orders', json, headers: REPRESENTATION, idempotencyKey: payPalRequestId('orders.create', i.idempotencyKey) }, Order);
    },
    async get(ctx: Context | null, orderId: string) {
      return call(ctx, 'orders.get', { method: 'GET', path: `/v2/checkout/orders/${segment(orderId)}` }, Order);
    },
    /**
     * Captures an approved order. Check the capture's status (`purchase_units[0].payments.captures[0].status`)
     * before fulfilling: a completed order can hold a declined or pending capture.
     */
    async capture(ctx: Context | null, input: CaptureOrderInput) {
      const i = parse(CaptureOrderInput, input);
      return call(
        ctx,
        'orders.capture',
        { method: 'POST', path: `/v2/checkout/orders/${segment(i.orderId)}/capture`, json: {}, headers: REPRESENTATION, idempotencyKey: payPalRequestId('orders.capture', i.idempotencyKey ?? i.orderId) },
        Order,
      );
    },
  };

  const captures = {
    async get(ctx: Context | null, captureId: string) {
      return call(ctx, 'captures.get', { method: 'GET', path: `/v2/payments/captures/${segment(captureId)}` }, Capture);
    },
    /** Refunds a capture, in full (no `amount`) or in part. */
    async refund(ctx: Context | null, input: RefundCaptureInput) {
      const i = parse(RefundCaptureInput, input);
      if ((i.amount === undefined) !== (i.currency === undefined)) throw fromZodError({ issues: [{ path: ['currency'], message: 'give amount and currency together' }] }, 'Invalid PayPal input');
      const json = { ...(i.amount !== undefined && i.currency ? { amount: toPayPalAmount(i.amount, i.currency) } : {}), note_to_payer: i.noteToPayer };
      return call(
        ctx,
        'captures.refund',
        { method: 'POST', path: `/v2/payments/captures/${segment(i.captureId)}/refund`, json, headers: REPRESENTATION, idempotencyKey: payPalRequestId('captures.refund', i.idempotencyKey) },
        Refund,
      );
    },
  };

  const refunds = {
    async get(ctx: Context | null, refundId: string) {
      return call(ctx, 'refunds.get', { method: 'GET', path: `/v2/payments/refunds/${segment(refundId)}` }, Refund);
    },
  };

  const products = {
    async create(ctx: Context | null, input: CreateProductInput) {
      const i = parse(CreateProductInput, input);
      return call(
        ctx,
        'products.create',
        { method: 'POST', path: '/v1/catalogs/products', json: { name: i.name, type: i.type, description: i.description }, headers: REPRESENTATION, idempotencyKey: payPalRequestId('products.create', i.idempotencyKey) },
        Product,
      );
    },
    /** One page of products (`pageSize` up to 20). */
    async list(ctx: Context | null, input: PageInput = {}) {
      const i = parse(PageInput, input);
      return call(ctx, 'products.list', { method: 'GET', path: '/v1/catalogs/products', query: { page: i.page, page_size: i.pageSize, total_required: true } }, ProductPage);
    },
  };

  const plans = {
    /** A plan with one regular billing cycle at a fixed price, billing every `intervalCount` `interval`s until cancelled. Active at once. */
    async create(ctx: Context | null, input: CreatePlanInput) {
      const i = parse(CreatePlanInput, input);
      const json = {
        product_id: i.productId,
        name: i.name,
        description: i.description,
        status: 'ACTIVE',
        quantity_supported: i.quantitySupported,
        billing_cycles: [
          {
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0,
            frequency: { interval_unit: i.interval.toUpperCase(), interval_count: i.intervalCount },
            pricing_scheme: { fixed_price: toPayPalAmount(i.amount, i.currency) },
          },
        ],
        payment_preferences: i.paymentFailureThreshold === undefined ? {} : { payment_failure_threshold: i.paymentFailureThreshold },
      };
      return call(ctx, 'plans.create', { method: 'POST', path: '/v1/billing/plans', json, headers: REPRESENTATION, idempotencyKey: payPalRequestId('plans.create', i.idempotencyKey) }, PayPalPlan);
    },
    /** One page of plans (`pageSize` up to 20), with their billing cycles. */
    async list(ctx: Context | null, input: ListPlansInput = {}) {
      const i = parse(ListPlansInput, input);
      return call(
        ctx,
        'plans.list',
        { method: 'GET', path: '/v1/billing/plans', query: { product_id: i.productId, page: i.page, page_size: i.pageSize, total_required: true }, headers: REPRESENTATION },
        PlanPage,
      );
    },
    /** Every plan, a page at a time. Stop early with `break`. */
    async *all(ctx: Context | null, input: Omit<ListPlansInput, 'page' | 'pageSize'> = {}): AsyncGenerator<PayPalPlan> {
      for (let page = 1; ; page++) {
        const result = await plans.list(ctx, { ...input, page, pageSize: 20 });
        yield* result.plans;
        const pages = result.total_pages ?? (result.plans.length < 20 ? page : page + 1);
        if (page >= pages || result.plans.length === 0) return;
      }
    },
    async get(ctx: Context | null, planId: string) {
      return call(ctx, 'plans.get', { method: 'GET', path: `/v1/billing/plans/${segment(planId)}` }, PayPalPlan);
    },
  };

  const subscriptions = {
    /**
     * Creates a subscription, `APPROVAL_PENDING` until the subscriber approves it: hand `subscription.id` to the
     * JavaScript SDK, or send them to `approvalUrl(subscription)`. It becomes `ACTIVE` (and
     * `BILLING.SUBSCRIPTION.ACTIVATED` arrives) once they have.
     */
    async create(ctx: Context | null, input: CreateSubscriptionInput) {
      const i = parse(CreateSubscriptionInput, input);
      if (!i.returnUrl !== !i.cancelUrl) throw fromZodError({ issues: [{ path: ['returnUrl'], message: 'give returnUrl and cancelUrl together' }] }, 'Invalid PayPal input');
      const json = {
        plan_id: i.planId,
        quantity: i.quantity === undefined ? undefined : String(i.quantity),
        custom_id: i.customId,
        ...(i.returnUrl ? { application_context: { return_url: i.returnUrl, cancel_url: i.cancelUrl, user_action: 'SUBSCRIBE_NOW' } } : {}),
      };
      return call(
        ctx,
        'subscriptions.create',
        { method: 'POST', path: '/v1/billing/subscriptions', json, headers: REPRESENTATION, idempotencyKey: payPalRequestId('subscriptions.create', i.idempotencyKey) },
        PayPalSubscription,
      );
    },
    async get(ctx: Context | null, subscriptionId: string) {
      return call(ctx, 'subscriptions.get', { method: 'GET', path: `/v1/billing/subscriptions/${segment(subscriptionId)}` }, PayPalSubscription);
    },
    /** Stops billing until `activate`. The reason is required by PayPal. */
    async suspend(ctx: Context | null, input: SubscriptionActionInput) {
      const i = parse(SubscriptionActionInput, input);
      await call(ctx, 'subscriptions.suspend', { method: 'POST', path: `/v1/billing/subscriptions/${segment(i.subscriptionId)}/suspend`, json: { reason: i.reason } }, z.unknown());
    },
    async activate(ctx: Context | null, input: ActivateSubscriptionInput) {
      const i = parse(ActivateSubscriptionInput, input);
      await call(ctx, 'subscriptions.activate', { method: 'POST', path: `/v1/billing/subscriptions/${segment(i.subscriptionId)}/activate`, json: { reason: i.reason } }, z.unknown());
    },
    /** Cancels at once; PayPal has no cancel-at-period-end. The reason is required by PayPal. */
    async cancel(ctx: Context | null, input: SubscriptionActionInput) {
      const i = parse(SubscriptionActionInput, input);
      await call(ctx, 'subscriptions.cancel', { method: 'POST', path: `/v1/billing/subscriptions/${segment(i.subscriptionId)}/cancel`, json: { reason: i.reason } }, z.unknown());
    },
    /**
     * Asks to move the subscription to another plan or quantity. It changes only once the subscriber approves:
     * send them to `approvalUrl(revision)`.
     */
    async revise(ctx: Context | null, input: ReviseSubscriptionInput) {
      const i = parse(ReviseSubscriptionInput, input);
      if (!i.planId && i.quantity === undefined) throw fromZodError({ issues: [{ path: ['planId'], message: 'give planId, quantity or both' }] }, 'Invalid PayPal input');
      if (!i.returnUrl !== !i.cancelUrl) throw fromZodError({ issues: [{ path: ['returnUrl'], message: 'give returnUrl and cancelUrl together' }] }, 'Invalid PayPal input');
      const json = {
        plan_id: i.planId,
        quantity: i.quantity === undefined ? undefined : String(i.quantity),
        ...(i.returnUrl ? { application_context: { return_url: i.returnUrl, cancel_url: i.cancelUrl } } : {}),
      };
      return call(ctx, 'subscriptions.revise', { method: 'POST', path: `/v1/billing/subscriptions/${segment(i.subscriptionId)}/revise`, json }, ReviseResponse);
    },
  };

  return {
    environment,
    /** The client id, for the browser's JavaScript SDK. It is public. */
    clientId: cfg.clientId,
    orders,
    captures,
    refunds,
    products,
    plans,
    subscriptions,
    /** Whether PayPal accepts the credentials (fetches an access token when none is cached). */
    async ping(ctx: Context | null): Promise<void> {
      await accessToken(ctx);
    },
  };
}

export type PayPal = ReturnType<typeof createPayPal>;

/**
 * PayPal's error body is `{ name, message, debug_id, details: [{ issue, description }] }`, and the token
 * endpoint's `{ error, error_description }`. The code is kept (the first detail's `issue` when PayPal gives one,
 * else `name`); messages and descriptions aren't (they can echo input).
 */
function failure(_status: number, body: unknown): FailureInfo | undefined {
  if (typeof body !== 'object' || body === null) return undefined;
  const b = body as { name?: unknown; error?: unknown; details?: Array<{ issue?: unknown }> };
  const issue = Array.isArray(b.details) ? b.details.map((d) => d?.issue).find((x): x is string => typeof x === 'string' && /^[A-Z][A-Z0-9_]*$/.test(x)) : undefined;
  const name = typeof b.name === 'string' && /^[A-Z][A-Z0-9_]*$/.test(b.name) ? b.name : undefined;
  const oauth = typeof b.error === 'string' && /^[a-z][a-z0-9_]*$/.test(b.error) ? b.error : undefined;
  const code = issue ?? name ?? oauth;
  const mapped = mappedFailure(errorMap, issue) ?? mappedFailure(errorMap, name) ?? mappedFailure(errorMap, oauth);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid PayPal input');
  return parsed.data;
}

function segment(value: string): string {
  if (!value) throw fromZodError({ issues: [{ path: ['id'], message: 'an id is required' }] }, 'Invalid PayPal input');
  return encodeURIComponent(value);
}
