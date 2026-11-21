import { randomUUID } from 'node:crypto';
import type {
  BillingAdapter,
  BillingEvent,
  BillingStore,
  Charge,
  CheckoutSession,
  CreateCheckoutInput,
  CreateCustomerInput,
  CreditBalance,
  Customer,
  Invoice,
  Plan,
  PortalSession,
  ProviderEvent,
  Refund,
  Subscription,
  SubscriptionChangePreview,
  UpdateSubscriptionInput,
} from '@mariachi/billing';
import { BillingError, MariachiError } from '@mariachi/core';
import { ProviderError } from '@mariachi/integrations';
import { type Paddle, type PaddleDeps, type UpdatePaddleSubscriptionInput, createPaddle } from './client';
import type { PaddleConfig } from './generated';
import { amount, mapCustomer, mapInvoice, mapPrice, mapRefund, mapSubscription, tenantOf } from './mappers';
import { normalizePaddleEvent } from './normalize';
import { PaddleNotification, type PaddleSubscription, type PaddleSubscriptionPreview, type ProrationBillingMode } from './schemas';
import { verifyPaddleWebhook } from './webhooks';

export interface PaddleBillingConfig extends PaddleConfig {
  /** How far a webhook's signed `ts` may be from now, in seconds. Default 5, Paddle's own. */
  webhookToleranceSeconds?: number;
}

/** The port's proration behaviours in Paddle's terms. Paddle prorates to the minute at the time of the change. */
const PRORATION: Record<NonNullable<UpdateSubscriptionInput['prorationBehavior']>, ProrationBillingMode> = {
  create_prorations: 'prorated_next_billing_period',
  always_invoice: 'prorated_immediately',
  none: 'do_not_bill',
};

function notSupported(what: string): BillingError {
  return new BillingError('billing/not-supported', `Paddle ${what}`, { provider: 'paddle' });
}

/**
 * A failed call as the billing port's `BillingError`, with the category and Paddle's code in the metadata and
 * never Paddle's message (it can echo the input), so an app's error handling is the same as with Stripe.
 */
export function toBillingError(error: unknown, operation: string): BillingError {
  if (error instanceof BillingError) return error;
  if (error instanceof ProviderError) {
    const meta = { operation, provider: 'paddle', category: error.category, providerCode: error.providerCode, status: error.status };
    const what = `Paddle ${operation} failed (${error.providerCode ?? error.status ?? error.category})`;
    if (error.code === 'paddle/payment-declined') return new BillingError('billing/payment-failed', 'Paddle declined the payment', meta);
    if (error.code === 'paddle/no-payment-link') return new BillingError('billing/config', 'Paddle has no default payment link: set one in Paddle › Checkout › Checkout configuration, or set PADDLE_CHECKOUT_URL', meta);
    if (error.code === 'paddle/domain-not-approved') return new BillingError('billing/config', "PADDLE_CHECKOUT_URL isn't on a website Paddle approved (Paddle › My account › Settings › Website approval)", meta);
    switch (error.category) {
      case 'rate-limited':
        return new BillingError('billing/rate-limited', 'Paddle rate limit reached', meta);
      case 'unauthorized':
      case 'forbidden':
        return new BillingError('billing/config', 'Paddle refused the API key: check PADDLE_API_KEY, its environment and its permissions', meta);
      case 'not-found':
        return new BillingError('billing/not-found', what, meta);
      case 'invalid-request':
        return new BillingError('billing/invalid-input', what, meta);
      default:
        return new BillingError('billing/upstream-failed', what, meta);
    }
  }
  // Input the client refused before calling Paddle
  if (error instanceof MariachiError && error.code.startsWith('validation/')) {
    return new BillingError('billing/invalid-input', `Invalid input for Paddle ${operation}`, { operation, details: error.metadata });
  }
  return new BillingError('billing/upstream-failed', `Paddle ${operation} failed`, { operation, provider: 'paddle' });
}

const isNotFound = (error: unknown) => error instanceof ProviderError && error.category === 'not-found';

/** Paddle takes a quantity as a decimal string with at most 9 places. */
function decimal(quantity: number): string {
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(9).replace(/0+$/, '').replace(/\.$/, '');
}

/**
 * `@mariachi/billing`'s port on Paddle Billing. Paddle is the merchant of record: it sells to the customer and
 * handles tax, so prices are what the customer pays and amounts include tax per the price's tax mode.
 *
 * Where Paddle's model differs:
 * - **Checkout** is Paddle.js. `createCheckoutSession` creates a transaction; its `url` is the payment page
 *   (`PADDLE_CHECKOUT_URL`, else the account's default payment link) with `?_ptxn=<id>`, where Paddle.js opens the
 *   checkout, and its `id` can open it in place with `Paddle.Checkout.open({ transactionId })`. `successUrl` and
 *   `cancelUrl` aren't Paddle's: set `successUrl` in Paddle.js's checkout settings. A trial comes from the price.
 * - **Subscriptions** are made by a completed checkout, never directly, and **charges** are against a subscription:
 *   `createSubscription` and `createCharge` fail with `billing/not-supported`.
 * - **Idempotency keys**: Paddle takes none. A customer is unique by email, so a repeated create finds the first;
 *   a refund is never retried; usage events are counted once by their key.
 * - **Credit** is Paddle's to give (adjustments, prorations): `getCreditBalance` reads it, `adjustCreditBalance`
 *   fails with `billing/not-supported`. The app's own ledger (`grantCredits`) works as with any provider.
 * - **Usage** goes to Paddle's usage events (early access): `metricName` is the meter's action.
 */
export class PaddleBillingAdapter implements BillingAdapter {
  readonly name = 'paddle';
  /** The Paddle API client, for what the port doesn't cover. */
  readonly paddle: Paddle;
  private readonly checkoutUrl: string | null;
  private readonly tolerance: number | undefined;

  constructor(config: PaddleBillingConfig, deps: PaddleDeps = {}) {
    const { webhookToleranceSeconds, ...settings } = config;
    if (!settings.apiKey) throw new BillingError('billing/config', 'The Paddle billing adapter needs PADDLE_API_KEY');
    try {
      this.paddle = createPaddle(settings, deps);
    } catch (error) {
      throw new BillingError('billing/config', error instanceof MariachiError ? error.message : 'Invalid Paddle settings');
    }
    this.checkoutUrl = settings.checkoutUrl ?? null;
    this.tolerance = webhookToleranceSeconds;
  }

  /** The adapter's methods have no `ctx` (the port's don't), so their calls carry `null`: spans without a tenant. */
  private async run<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw toBillingError(error, operation);
    }
  }

  // ── Customers ──────────────────────────────────────────────────────────────

  /**
   * Paddle keeps one customer per email address and takes no idempotency key. When it already has one with this
   * address that belongs to the same tenant (a retried create), that one is returned, made active again if it was
   * archived; one that isn't this tenant's is refused (`billing/invalid-input`), never shared across tenants.
   */
  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    return this.run('createCustomer', async () => {
      const custom_data = { ...input.metadata, tenantId: input.tenantId };
      try {
        return mapCustomer(await this.paddle.customers.create(null, { email: input.email, name: input.name, custom_data }));
      } catch (error) {
        if (!(error instanceof ProviderError && error.code === 'paddle/customer-exists')) throw error;
        const found = (await this.paddle.customers.list(null, { email: [input.email], status: ['active', 'archived'] })).data[0];
        if (!found || tenantOf(found.custom_data) !== input.tenantId) {
          throw new BillingError('billing/invalid-input', 'Paddle already has a customer with this email address, and it is not this tenant’s', {
            operation: 'createCustomer',
            provider: 'paddle',
            providerCode: error.providerCode,
          });
        }
        return mapCustomer(found.status === 'archived' ? await this.paddle.customers.update(null, found.id, { status: 'active' }) : found);
      }
    });
  }

  /** Null when Paddle has no such customer, or it's archived (an archived customer can't be billed). */
  async getCustomer(id: string): Promise<Customer | null> {
    return this.run('getCustomer', async () => {
      try {
        const customer = await this.paddle.customers.get(null, id);
        return customer.status === 'archived' ? null : mapCustomer(customer);
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    });
  }

  /** `metadata` is merged into `custom_data`, which keeps the tenant. */
  async updateCustomer(id: string, patch: { email?: string; name?: string; metadata?: Record<string, string> }): Promise<Customer> {
    return this.run('updateCustomer', async () => {
      const custom_data = patch.metadata ? { ...(await this.paddle.customers.get(null, id)).custom_data, ...patch.metadata } : undefined;
      return mapCustomer(await this.paddle.customers.update(null, id, { email: patch.email, name: patch.name, custom_data }));
    });
  }

  // ── Subscriptions ──────────────────────────────────────────────────────────

  async createSubscription(): Promise<Subscription> {
    throw notSupported('makes a subscription only when a checkout completes: use createCheckout, and the subscription arrives by webhook (subscription.synced)');
  }

  /** The complete item list Paddle wants, and the custom data, for the port's patch. */
  private changes(current: PaddleSubscription, patch: UpdateSubscriptionInput): UpdatePaddleSubscriptionInput {
    let items: UpdatePaddleSubscriptionInput['items'];
    if (patch.items) {
      const existing = new Set(current.items.map((i) => i.price.id));
      // Paddle needs a quantity for an item it doesn't have yet; it has no metered prices, so 1
      items = patch.items.map((i) => ({ price_id: i.priceId, quantity: i.quantity ?? (existing.has(i.priceId) ? undefined : 1) }));
    } else if (patch.priceId !== undefined || patch.quantity !== undefined) {
      const [first, ...rest] = current.items;
      if (!first) throw new BillingError('billing/invalid-input', 'The subscription has no item to change');
      const priceId = patch.priceId ?? first.price.id;
      items = [
        { price_id: priceId, quantity: patch.quantity ?? (priceId === first.price.id ? undefined : first.quantity) },
        ...rest.map((i) => ({ price_id: i.price.id })),
      ];
    }
    return {
      items,
      proration_billing_mode: items ? PRORATION[patch.prorationBehavior ?? 'create_prorations'] : undefined,
      custom_data: patch.metadata ? { ...current.custom_data, ...patch.metadata } : undefined,
    };
  }

  /**
   * `prorationBehavior`: `create_prorations` (the default) bills the prorated difference at the next renewal,
   * `always_invoice` now, `none` not at all. Paddle prorates at the time of the change, so `prorationDate` isn't
   * sent. The idempotency key isn't either: Paddle takes none, and the update sets the whole item list, so a
   * repeat changes nothing.
   */
  async updateSubscription(id: string, patch: UpdateSubscriptionInput): Promise<Subscription> {
    return this.run('updateSubscription', async () => {
      const current = await this.paddle.subscriptions.get(null, id);
      const body = this.changes(current, patch);
      if (!body.items && !body.custom_data) return mapSubscription(current);
      return mapSubscription(await this.paddle.subscriptions.update(null, id, body));
    });
  }

  async previewSubscriptionChange(id: string, patch: UpdateSubscriptionInput): Promise<SubscriptionChangePreview> {
    return this.run('previewSubscriptionChange', async () => {
      const current = await this.paddle.subscriptions.get(null, id);
      const body = this.changes(current, patch);
      const preview = await this.paddle.subscriptions.previewUpdate(null, id, { ...body, custom_data: undefined });
      return mapPreview(preview, patch.prorationBehavior ?? 'create_prorations');
    });
  }

  /** At the end of the period by default (Paddle schedules the cancel); `atPeriodEnd: false` ends it now. */
  async cancelSubscription(id: string, options: { atPeriodEnd?: boolean } = {}): Promise<Subscription> {
    return this.run('cancelSubscription', async () =>
      mapSubscription(await this.paddle.subscriptions.cancel(null, id, { effective_from: options.atPeriodEnd ? 'next_billing_period' : 'immediately' })),
    );
  }

  /** Pauses now, until resumed. */
  async pauseSubscription(id: string): Promise<Subscription> {
    return this.run('pauseSubscription', async () => mapSubscription(await this.paddle.subscriptions.pause(null, id, { effective_from: 'immediately' })));
  }

  /**
   * Resumes a paused subscription now (Paddle starts a new billing period and charges for it), or removes a
   * scheduled cancel or pause from an active one.
   */
  async resumeSubscription(id: string): Promise<Subscription> {
    return this.run('resumeSubscription', async () => {
      const current = await this.paddle.subscriptions.get(null, id);
      if (current.status === 'paused') return mapSubscription(await this.paddle.subscriptions.resume(null, id, { effective_from: 'immediately' }));
      if (current.scheduled_change) return mapSubscription(await this.paddle.subscriptions.update(null, id, { scheduled_change: null }));
      return mapSubscription(current);
    });
  }

  async getSubscription(id: string): Promise<Subscription | null> {
    return this.run('getSubscription', async () => {
      try {
        return mapSubscription(await this.paddle.subscriptions.get(null, id));
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    });
  }

  async listSubscriptions(customerId: string): Promise<Subscription[]> {
    return this.run('listSubscriptions', async () => {
      const out: Subscription[] = [];
      for await (const s of this.paddle.subscriptions.all(null, { customer_id: [customerId] })) out.push(mapSubscription(s));
      return out;
    });
  }

  // ── Payments ───────────────────────────────────────────────────────────────

  async createCharge(): Promise<Charge> {
    throw notSupported("charges a customer through a checkout or a subscription's renewal, not by amount: use createCheckout");
  }

  /**
   * Refunds a transaction (`chargeId` is its `txn_` id): all of it without `amount`, else `amount` (tax included)
   * taken from its line items in order. Most live refunds are `pending` until Paddle approves them;
   * `charge.refunded` comes by webhook when it does. Made once, never retried: Paddle takes no idempotency key and
   * refuses another refund while one is pending.
   */
  async refund(chargeId: string, options: { amount?: number; reason?: string } = {}): Promise<Refund> {
    return this.run('refund', async () => {
      const reason = options.reason?.trim() || 'requested_by_customer';
      if (options.amount === undefined) {
        const adjustment = await this.paddle.adjustments.create(null, { action: 'refund', type: 'full', transaction_id: chargeId, reason });
        return mapRefund(adjustment);
      }
      if (!Number.isInteger(options.amount) || options.amount <= 0) throw new BillingError('billing/invalid-input', 'amount must be a positive integer in minor units');
      const transaction = await this.paddle.transactions.get(null, chargeId);
      const lines = transaction.details?.line_items ?? [];
      const items: Array<{ item_id: string; type: 'partial' | 'full'; amount?: string }> = [];
      let left = options.amount;
      for (const line of lines) {
        const lineTotal = amount(line.totals.total);
        if (left <= 0 || lineTotal <= 0 || !line.id) continue;
        const take = Math.min(left, lineTotal);
        items.push(take === lineTotal ? { item_id: line.id, type: 'full' } : { item_id: line.id, type: 'partial', amount: String(take) });
        left -= take;
      }
      if (left > 0 || items.length === 0) throw new BillingError('billing/invalid-input', 'The refund is more than the transaction total');
      const adjustment = await this.paddle.adjustments.create(null, { action: 'refund', type: 'partial', transaction_id: chargeId, reason, items });
      return mapRefund(adjustment, tenantOf(transaction.custom_data));
    });
  }

  /**
   * A transaction for the items, with the tenant in its `custom_data` (Paddle copies it to the subscription the
   * checkout makes). `url` is the payment page with `?_ptxn=<id>`; `id` opens it in place with Paddle.js. `mode`
   * isn't sent: the prices say whether it's recurring. `trialDays` is refused (`billing/not-supported`): in Paddle a
   * trial is set on the price.
   */
  async createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSession> {
    if (input.trialDays) throw notSupported("sets a trial on the price, not on a checkout: give the price a trial period in Paddle's catalog");
    return this.run('createCheckoutSession', async () => {
      const customer = await this.paddle.customers.get(null, input.customerId);
      const tenantId = tenantOf(customer.custom_data);
      const lines = input.items ?? (input.priceId ? [{ priceId: input.priceId, quantity: input.quantity }] : []);
      const transaction = await this.paddle.transactions.create(null, {
        items: lines.map((i) => ({ price_id: i.priceId, quantity: i.quantity ?? 1 })),
        customer_id: input.customerId,
        custom_data: { ...input.metadata, ...(tenantId ? { tenantId } : {}) },
        checkout: { url: this.checkoutUrl },
      });
      const url = transaction.checkout?.url;
      if (!url) throw new BillingError('billing/config', 'Paddle returned no checkout URL: set a default payment link (Paddle › Checkout › Checkout configuration) or PADDLE_CHECKOUT_URL');
      return { id: transaction.id, url };
    });
  }

  /** A signed-in link to Paddle's customer portal. Paddle has no return URL: the portal links back on its own. */
  async createPortalSession(customerId: string, _returnUrl: string): Promise<PortalSession> {
    return this.run('createPortalSession', async () => ({ url: (await this.paddle.customerPortalSessions.create(null, customerId)).urls.general.overview }));
  }

  /** Billed, paid, completed and past-due transactions, newest first. Each `pdfUrl` is null: see `mapInvoice`. */
  async listInvoices(customerId: string, options: { limit?: number } = {}): Promise<Invoice[]> {
    return this.run('listInvoices', async () => {
      const limit = Math.max(1, Math.min(options.limit ?? 24, 100));
      const out: Invoice[] = [];
      let after: string | undefined;
      while (out.length < limit) {
        const page = await this.paddle.transactions.list(null, { customer_id: [customerId], status: ['billed', 'paid', 'completed', 'past_due'], order_by: 'created_at[DESC]', after });
        out.push(...page.data.map(mapInvoice));
        const next = page.meta?.pagination;
        const cursor = next?.has_more && next.next ? new URL(next.next).searchParams.get('after') : null;
        if (!cursor || page.data.length === 0) break;
        after = cursor;
      }
      return out.slice(0, limit);
    });
  }

  /** Prices with their products. `lookupKeys` matches each price's `custom_data.lookupKey` (Paddle has no lookup keys). */
  async listPlans(options: { activeOnly?: boolean; lookupKeys?: string[] } = {}): Promise<Plan[]> {
    return this.run('listPlans', async () => {
      const out: Plan[] = [];
      for await (const price of this.paddle.prices.all(null, { status: options.activeOnly === false ? ['active', 'archived'] : ['active'] })) out.push(mapPrice(price));
      const keys = options.lookupKeys;
      return keys ? out.filter((p) => p.lookupKey !== null && keys.includes(p.lookupKey)) : out;
    });
  }

  /**
   * One usage event (Paddle's usage-based billing is in early access): `metricName` is the meter's action, the
   * idempotency key its `event_key`. Paddle counts an event once by its key and time, so a resend is safe.
   */
  async reportUsage(input: { customerId: string; metricName: string; quantity: number; timestamp: Date; idempotencyKey?: string }): Promise<void> {
    if (!(input.quantity > 0)) throw new BillingError('billing/invalid-input', 'Paddle records only a positive usage quantity');
    await this.run('reportUsage', () =>
      this.paddle.usageEvents.create(null, {
        events: [
          {
            event_key: input.idempotencyKey ?? randomUUID(),
            customer_id: input.customerId,
            action: input.metricName,
            quantity: decimal(input.quantity),
            occurred_at: input.timestamp.toISOString(),
          },
        ],
      }),
    );
  }

  /** The credit Paddle holds for the customer in `currency` (its first balance's when none is given): `available`. */
  async getCreditBalance(customerId: string, currency?: string): Promise<CreditBalance> {
    return this.run('getCreditBalance', async () => {
      const balances = await this.paddle.customers.creditBalances(null, customerId);
      const wanted = currency?.toUpperCase();
      const balance = wanted ? balances.find((b) => b.currency_code === wanted) : balances[0];
      return { customerId, balance: amount(balance?.balance.available), currency: (balance?.currency_code ?? wanted ?? 'usd').toLowerCase() };
    });
  }

  async adjustCreditBalance(): Promise<CreditBalance> {
    throw notSupported("adds credit only through its own adjustments and prorations: use the app's credit ledger (grantCredits) for credit of your own");
  }

  // ── Webhooks ───────────────────────────────────────────────────────────────

  /**
   * Checks the `Paddle-Signature` header over the raw body (a `ts` more than five seconds off is refused) and
   * reads the notification. Paddle's notifications don't say which environment sent them: `livemode` is whether
   * this adapter's key is live, since a destination's secret only signs its own environment's events.
   */
  async parseWebhook(rawBody: Buffer | string, signature: string, secret: string): Promise<ProviderEvent> {
    try {
      verifyPaddleWebhook(rawBody, { 'paddle-signature': signature }, secret, { toleranceSeconds: this.tolerance });
    } catch (error) {
      throw new BillingError('billing/webhook-invalid-signature', 'Paddle webhook signature verification failed', { reason: (error as Error).message });
    }
    const parsed = PaddleNotification.safeParse(JSON.parse(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')));
    if (!parsed.success) throw new BillingError('billing/invalid-input', 'The Paddle webhook body is not a notification');
    const n = parsed.data;
    return { id: n.event_id, type: n.event_type, createdAt: new Date(n.occurred_at), object: n.data, livemode: this.paddle.environment === 'production' };
  }

  normalizeWebhook(event: ProviderEvent, store?: BillingStore): Promise<BillingEvent[]> {
    return normalizePaddleEvent(event, store, {
      transactionWithRefunds: (id) => this.run('getTransaction', () => this.paddle.transactions.get(null, id, { include: ['adjustments_totals'] })),
    });
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.paddle.eventTypes.list(null);
      return true;
    } catch {
      return false;
    }
  }
}

/** The billing port's adapter for Paddle: `createPaddleBillingAdapter(settingsFromEnv(settings, readEnv), { tracer, metrics })`. */
export function createPaddleBillingAdapter(config: PaddleBillingConfig, deps: PaddleDeps = {}): PaddleBillingAdapter {
  return new PaddleBillingAdapter(config, deps);
}

/** Paddle's preview as the port's: the proration result, and the transaction that bills it (now or at renewal). */
function mapPreview(preview: PaddleSubscriptionPreview, behavior: NonNullable<UpdateSubscriptionInput['prorationBehavior']>): SubscriptionChangePreview {
  const now = behavior === 'always_invoice';
  const bill = now ? preview.immediate_transaction : preview.next_transaction;
  const result = preview.update_summary?.result;
  const lines = (bill?.details.line_items ?? []).map((l) => ({ description: l.product?.name ?? null, amount: amount(l.totals.total), proration: !!l.proration }));
  return {
    currency: (bill?.details.totals.currency_code ?? result?.currency_code ?? preview.currency_code ?? 'usd').toLowerCase(),
    prorationAmount: behavior === 'none' || !result ? 0 : (result.action === 'credit' ? -1 : 1) * amount(result.amount),
    invoiceTotal: amount(bill?.details.totals.grand_total ?? bill?.details.totals.total),
    invoiceAt: now ? null : bill?.billing_period?.starts_at ? new Date(bill.billing_period.starts_at) : preview.next_billed_at ? new Date(preview.next_billed_at) : null,
    prorationDate: new Date(),
    lines,
  };
}
