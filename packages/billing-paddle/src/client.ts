import { ConfigError, type Context, fromZodError } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { PaddleError } from './errors';
import { type PaddleConfig, type PaddleOperation, configSchema, errorMap, provider } from './generated';
import {
  Items,
  PaddleAdjustment,
  PaddleCreditBalance,
  PaddleCustomer,
  PaddlePortalSession,
  PaddlePrice,
  PaddleSubscription,
  PaddleSubscriptionPreview,
  PaddleTransaction,
  ProrationBillingMode,
  UsageEvent,
  one,
  page,
} from './schemas';

export interface PaddleDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

export type PaddleEnvironment = 'sandbox' | 'production';

const BASE_URL: Record<PaddleEnvironment, string> = {
  production: 'https://api.paddle.com',
  sandbox: 'https://sandbox-api.paddle.com',
};

/**
 * Which Paddle the key is for, from its prefix: `pdl_sdbx_apikey_` is the sandbox, `pdl_live_apikey_` live. A
 * sandbox key only works against the sandbox API and a live key only against the live one, so the prefix also
 * picks the base URL. A key made before 6 May 2025 has no prefix: `environment` must say.
 */
export function paddleEnvironment(apiKey: string, environment?: string): PaddleEnvironment {
  const fromKey: PaddleEnvironment | undefined = apiKey.startsWith('pdl_sdbx_') ? 'sandbox' : apiKey.startsWith('pdl_live_') ? 'production' : undefined;
  if (environment !== undefined && environment !== 'sandbox' && environment !== 'production') {
    throw new ConfigError('paddle/invalid-environment', 'PADDLE_ENVIRONMENT must be sandbox or production');
  }
  if (fromKey && environment && environment !== fromKey) {
    throw new ConfigError('paddle/invalid-environment', `PADDLE_ENVIRONMENT is ${environment}, but the API key is a ${fromKey} key`);
  }
  const resolved = fromKey ?? (environment as PaddleEnvironment | undefined);
  if (!resolved) {
    throw new ConfigError('paddle/invalid-environment', 'The Paddle API key has no pdl_live_/pdl_sdbx_ prefix (a key made before May 2025): set PADDLE_ENVIRONMENT to sandbox or production');
  }
  return resolved;
}

type Query = ProviderRequest['query'];

const CustomData = z.record(z.unknown()).nullable();

const CreateCustomerInput = z.object({ email: z.string().email(), name: z.string().max(1024).nullable().optional(), custom_data: CustomData.optional(), locale: z.string().optional() });
const UpdateCustomerInput = z.object({
  email: z.string().email().optional(),
  name: z.string().max(1024).nullable().optional(),
  status: z.enum(['active', 'archived']).optional(),
  custom_data: CustomData.optional(),
  locale: z.string().optional(),
});
const ListInput = z.object({ after: z.string().optional(), per_page: z.number().int().min(1).max(200).optional() });
const ListCustomersInput = ListInput.extend({ email: z.array(z.string()).optional(), status: z.array(z.enum(['active', 'archived'])).optional() });
const ListPricesInput = ListInput.extend({ status: z.array(z.enum(['active', 'archived'])).optional(), product_id: z.array(z.string()).optional() });
const ListSubscriptionsInput = ListInput.extend({ customer_id: z.array(z.string()).min(1), status: z.array(z.enum(['active', 'canceled', 'past_due', 'paused', 'trialing'])).optional() });
const ListTransactionsInput = ListInput.extend({
  customer_id: z.array(z.string()).min(1),
  status: z.array(z.enum(['draft', 'ready', 'billed', 'paid', 'completed', 'canceled', 'past_due'])).optional(),
  order_by: z.enum(['billed_at[ASC]', 'billed_at[DESC]', 'created_at[ASC]', 'created_at[DESC]', 'id[ASC]', 'id[DESC]', 'updated_at[ASC]', 'updated_at[DESC]']).optional(),
  // Transactions come 30 a page, whatever is asked
  per_page: z.number().int().min(1).max(30).optional(),
});
const UpdateSubscriptionInput = z.object({
  items: Items.optional(),
  proration_billing_mode: ProrationBillingMode.optional(),
  custom_data: CustomData.optional(),
  scheduled_change: z.null().optional(),
});
const EffectiveFrom = z.object({ effective_from: z.enum(['next_billing_period', 'immediately']).optional() });
const PauseInput = EffectiveFrom.extend({ resume_at: z.string().nullable().optional(), on_resume: z.enum(['continue_existing_billing_period', 'start_new_billing_period']).optional() });
const ResumeInput = z.object({ effective_from: z.string().min(1).optional(), on_resume: z.enum(['continue_existing_billing_period', 'start_new_billing_period']).optional() });
const CreateTransactionInput = z.object({
  items: z.array(z.object({ price_id: z.string().min(1), quantity: z.number().int().min(1) })).min(1).max(100),
  customer_id: z.string().optional(),
  custom_data: CustomData.optional(),
  /** A page on an approved website that loads Paddle.js; null or unset for the account's default payment link. */
  checkout: z.object({ url: z.string().url().nullable() }).optional(),
});
const CreateAdjustmentInput = z.object({
  action: z.literal('refund'),
  transaction_id: z.string().min(1),
  reason: z.string().regex(/\S/, 'a reason'),
  type: z.enum(['full', 'partial']),
  items: z.array(z.object({ item_id: z.string().min(1), type: z.enum(['full', 'partial']), amount: z.string().regex(/^\d+$/).optional() })).min(1).max(100).optional(),
});
const UsageEventsInput = z.object({ events: z.array(UsageEvent).min(1).max(100) });

export type CreateCustomerInput = z.input<typeof CreateCustomerInput>;
export type UpdateCustomerInput = z.input<typeof UpdateCustomerInput>;
export type ListPricesInput = z.input<typeof ListPricesInput>;
export type ListSubscriptionsInput = z.input<typeof ListSubscriptionsInput>;
export type ListTransactionsInput = z.input<typeof ListTransactionsInput>;
export type UpdatePaddleSubscriptionInput = z.input<typeof UpdateSubscriptionInput>;
export type CreateTransactionInput = z.input<typeof CreateTransactionInput>;
export type CreateAdjustmentInput = z.input<typeof CreateAdjustmentInput>;

/**
 * The Paddle Billing API client: each operation takes `ctx` first (or `null` where the caller's interface has
 * none, as the billing port's adapter methods don't), checks its input and Paddle's answer, and makes one span
 * (`paddle subscriptions.get`). Fields are Paddle's own names. Build it once at startup and share it; the billing
 * adapter builds its own from the same settings.
 *
 * ```ts
 * const paddle = createPaddle(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * const sub = await paddle.subscriptions.get(ctx, 'sub_…');
 * ```
 */
export function createPaddle(config: PaddleConfig, deps: PaddleDeps = {}) {
  const cfg = configSchema.parse(config);
  const environment = paddleEnvironment(cfg.apiKey, cfg.environment);
  const base = BASE_URL[environment];
  const server = new URL(base).host;

  function call<T>(
    ctx: Context | null,
    operation: PaddleOperation,
    request: Omit<ProviderRequest, 'url' | 'headers'> & { path: string },
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    const { path, ...rest } = request;
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server },
      { ...rest, url: `${base}${path}`, headers: { authorization: `Bearer ${cfg.apiKey}`, 'paddle-version': '1' } },
      // Paddle takes no idempotency key, so providerRequest retries a POST or PATCH only when it was rate-limited
      { schema, error: PaddleError, failure, deps },
    );
  }

  /** Every entity a list operation returns, page after page, by the `after` cursor in `meta.pagination.next`. */
  async function* every<T>(list: (after: string | undefined) => Promise<{ data: T[]; meta?: { pagination?: { has_more: boolean; next?: string | null } } }>): AsyncGenerator<T> {
    let after: string | undefined;
    for (;;) {
      const result = await list(after);
      yield* result.data;
      const next = result.meta?.pagination;
      const cursor = next?.next ? (new URL(next.next).searchParams.get('after') ?? undefined) : undefined;
      if (!next?.has_more || !cursor || cursor === after) return;
      after = cursor;
    }
  }

  const customers = {
    async create(ctx: Context | null, input: CreateCustomerInput) {
      const json = parse(CreateCustomerInput, input);
      return call(ctx, 'customers.create', { method: 'POST', path: '/customers', json }, one(PaddleCustomer));
    },
    async get(ctx: Context | null, customerId: string) {
      return call(ctx, 'customers.get', { method: 'GET', path: `/customers/${segment(customerId)}` }, one(PaddleCustomer));
    },
    async update(ctx: Context | null, customerId: string, input: UpdateCustomerInput) {
      const json = parse(UpdateCustomerInput, input);
      return call(ctx, 'customers.update', { method: 'PATCH', path: `/customers/${segment(customerId)}`, json }, one(PaddleCustomer));
    },
    /** One page. `email` matches exactly; archived customers are only listed when `status` asks for them. */
    async list(ctx: Context | null, input: z.input<typeof ListCustomersInput> = {}) {
      const i = parse(ListCustomersInput, input);
      return call(ctx, 'customers.list', { method: 'GET', path: '/customers', query: listQuery(i) }, page(PaddleCustomer));
    },
    /** The customer's credit in each currency. Not paginated. */
    async creditBalances(ctx: Context | null, customerId: string) {
      return call(ctx, 'customers.creditBalances', { method: 'GET', path: `/customers/${segment(customerId)}/credit-balances` }, page(PaddleCreditBalance)).then((r) => r.data);
    },
  };

  const customerPortalSessions = {
    /** Signed-in links to the customer portal. Temporary: hand them to the browser, never store them. */
    async create(ctx: Context | null, customerId: string, input: { subscription_ids?: string[] } = {}) {
      const json = parse(z.object({ subscription_ids: z.array(z.string()).max(25).optional() }), input);
      return call(ctx, 'customerPortalSessions.create', { method: 'POST', path: `/customers/${segment(customerId)}/portal-sessions`, json }, one(PaddlePortalSession));
    },
  };

  const prices = {
    /** One page of prices, each with its product. Paddle lists only active prices unless `status` says otherwise. */
    async list(ctx: Context | null, input: ListPricesInput = {}) {
      const i = parse(ListPricesInput, input);
      return call(ctx, 'prices.list', { method: 'GET', path: '/prices', query: { ...listQuery(i), include: 'product' } }, page(PaddlePrice));
    },
    all(ctx: Context | null, input: ListPricesInput = {}) {
      return every((after) => prices.list(ctx, { per_page: 200, ...input, after }));
    },
  };

  const subscriptions = {
    async list(ctx: Context | null, input: ListSubscriptionsInput) {
      const i = parse(ListSubscriptionsInput, input);
      return call(ctx, 'subscriptions.list', { method: 'GET', path: '/subscriptions', query: listQuery(i) }, page(PaddleSubscription));
    },
    all(ctx: Context | null, input: ListSubscriptionsInput) {
      return every((after) => subscriptions.list(ctx, { per_page: 200, ...input, after }));
    },
    async get(ctx: Context | null, subscriptionId: string) {
      return call(ctx, 'subscriptions.get', { method: 'GET', path: `/subscriptions/${segment(subscriptionId)}` }, one(PaddleSubscription));
    },
    /**
     * `items` is the complete list the subscription should have: an item left out is removed. Changing items needs
     * `proration_billing_mode`. `scheduled_change: null` removes a scheduled cancel or pause.
     */
    async update(ctx: Context | null, subscriptionId: string, input: UpdatePaddleSubscriptionInput) {
      const json = parse(UpdateSubscriptionInput, input);
      return call(ctx, 'subscriptions.update', { method: 'PATCH', path: `/subscriptions/${segment(subscriptionId)}`, json }, one(PaddleSubscription));
    },
    /** What `update` would bill (`immediate_transaction`, `next_transaction`, `update_summary`), without making it. */
    async previewUpdate(ctx: Context | null, subscriptionId: string, input: UpdatePaddleSubscriptionInput) {
      const json = parse(UpdateSubscriptionInput, input);
      return call(ctx, 'subscriptions.previewUpdate', { method: 'PATCH', path: `/subscriptions/${segment(subscriptionId)}/preview`, json }, one(PaddleSubscriptionPreview));
    },
    /** At the end of the billing period by default (a scheduled change); `immediately` ends it now. */
    async cancel(ctx: Context | null, subscriptionId: string, input: z.input<typeof EffectiveFrom> = {}) {
      const json = parse(EffectiveFrom, input);
      return call(ctx, 'subscriptions.cancel', { method: 'POST', path: `/subscriptions/${segment(subscriptionId)}/cancel`, json }, one(PaddleSubscription));
    },
    async pause(ctx: Context | null, subscriptionId: string, input: z.input<typeof PauseInput> = {}) {
      const json = parse(PauseInput, input);
      return call(ctx, 'subscriptions.pause', { method: 'POST', path: `/subscriptions/${segment(subscriptionId)}/pause`, json }, one(PaddleSubscription));
    },
    /** Only a paused subscription resumes. By default Paddle starts a new billing period and charges for it now. */
    async resume(ctx: Context | null, subscriptionId: string, input: z.input<typeof ResumeInput> = {}) {
      const json = parse(ResumeInput, input);
      return call(ctx, 'subscriptions.resume', { method: 'POST', path: `/subscriptions/${segment(subscriptionId)}/resume`, json }, one(PaddleSubscription));
    },
  };

  const transactions = {
    /**
     * An automatically-collected transaction for a checkout. Its `checkout.url` is the payment page with
     * `?_ptxn=<id>`, where Paddle.js opens the checkout; or open it in the app with
     * `Paddle.Checkout.open({ transactionId })`. Paddle copies `custom_data` to the subscription it makes.
     */
    async create(ctx: Context | null, input: CreateTransactionInput) {
      const json = parse(CreateTransactionInput, input);
      return call(ctx, 'transactions.create', { method: 'POST', path: '/transactions', json }, one(PaddleTransaction));
    },
    async list(ctx: Context | null, input: ListTransactionsInput) {
      const i = parse(ListTransactionsInput, input);
      return call(ctx, 'transactions.list', { method: 'GET', path: '/transactions', query: listQuery(i) }, page(PaddleTransaction));
    },
    async get(ctx: Context | null, transactionId: string, input: { include?: Array<'adjustments_totals' | 'customer'> } = {}) {
      return call(ctx, 'transactions.get', { method: 'GET', path: `/transactions/${segment(transactionId)}`, query: { include: input.include?.join(',') } }, one(PaddleTransaction));
    },
    /** A link to the invoice PDF, for a billed or completed transaction. It expires after an hour: fetch it when asked. */
    async invoicePdfUrl(ctx: Context | null, transactionId: string, input: { disposition?: 'attachment' | 'inline' } = {}) {
      const answer = z.object({ data: z.object({ url: z.string() }) });
      return call(ctx, 'transactions.invoice', { method: 'GET', path: `/transactions/${segment(transactionId)}/invoice`, query: { disposition: input.disposition } }, answer).then((r) => r.data.url);
    },
  };

  const adjustments = {
    /**
     * A refund of the whole transaction (`type: 'full'`) or of some of its line items (`partial`, with `items`).
     * Most live refunds start `pending_approval`. Paddle takes no idempotency key, so it's retried only when rate-limited.
     */
    async create(ctx: Context | null, input: CreateAdjustmentInput) {
      const json = parse(CreateAdjustmentInput, input);
      if (json.type === 'partial' && !json.items) throw fromZodError({ issues: [{ path: ['items'], message: 'a partial refund lists its items', code: 'custom' }] }, 'Invalid Paddle input');
      return call(ctx, 'adjustments.create', { method: 'POST', path: '/adjustments', json }, one(PaddleAdjustment));
    },
  };

  const usageEvents = {
    /**
     * Records metered usage (Paddle's usage-based billing is in early access). Up to 100 events; Paddle takes all of
     * them or none. A resend with the same `event_key` and `occurred_at` is counted once, for 60 days.
     */
    async create(ctx: Context | null, input: z.input<typeof UsageEventsInput>) {
      const json = parse(UsageEventsInput, input);
      return call(ctx, 'usageEvents.create', { method: 'POST', path: '/usage-events', json }, z.unknown()).then(() => undefined);
    },
  };

  const eventTypes = {
    async list(ctx: Context | null) {
      return call(ctx, 'eventTypes.list', { method: 'GET', path: '/event-types' }, z.object({ data: z.array(z.unknown()) })).then((r) => r.data);
    },
  };

  return { environment, customers, customerPortalSessions, prices, subscriptions, transactions, adjustments, usageEvents, eventTypes };
}

export type Paddle = ReturnType<typeof createPaddle>;

/** Paddle's error body is `{ error: { type, code, detail } }`: the code is kept, `detail` isn't (it can echo input). */
function failure(_status: number, body: unknown): FailureInfo | undefined {
  const code = (body as { error?: { code?: unknown } } | null)?.error?.code;
  const providerCode = typeof code === 'string' ? code : undefined;
  const mapped = mappedFailure(errorMap, providerCode);
  return { providerCode, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

/** List filters as Paddle's query: arrays comma-separated. */
function listQuery(input: Record<string, unknown>): Query {
  const out: NonNullable<Query> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    out[key] = Array.isArray(value) ? value.join(',') : (value as string | number);
  }
  return out;
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Paddle input');
  return parsed.data;
}

function segment(value: string): string {
  if (!value) throw fromZodError({ issues: [{ path: ['id'], message: 'an id is required', code: 'custom' }] }, 'Invalid Paddle input');
  return encodeURIComponent(value);
}
