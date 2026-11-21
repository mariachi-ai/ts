import type {
  BillingAdapter,
  Charge,
  CheckoutSession,
  CreateChargeInput,
  CreateCheckoutInput,
  CreateCustomerInput,
  CreateSubscriptionInput,
  CreditBalance,
  Customer,
  IdempotencyOptions,
  Invoice,
  Plan,
  PortalSession,
  ProviderEvent,
  Refund,
  Subscription,
  SubscriptionChangePreview,
  UpdateSubscriptionInput,
} from '@mariachi/billing';
import { BillingError } from '@mariachi/core';
import { type PayPal, approvalUrl } from './client';
import { PayPalError, notSupported, toBillingError } from './errors';
import { chargeFromOrder, localCustomer, planFromPayPal, refundFromPayPal, subscriptionFromPayPal, tenantOfCustomer } from './mappers';

/** The reason PayPal requires on a cancel or a suspension the port asks for, which carries none. */
const REASONS = { cancel: 'Canceled by the merchant', pause: 'Paused by the merchant', resume: 'Resumed by the merchant' } as const;

/**
 * PayPal behind `@mariachi/billing`'s `BillingAdapter`, so `DefaultBilling` takes payments through it. PayPal's
 * model differs from Stripe's, and the adapter says so rather than pretending:
 *
 * - **No stored customer.** The buyer signs in to PayPal for each payment. `createCustomer` makes no call: the
 *   customer is the tenant (`paypal:<tenantId>`), carried as PayPal's `custom_id`.
 * - **Buyers approve on PayPal.** `createCharge` creates an order (`requires_action`); the buyer approves it in
 *   the browser and the server captures it with `paypal.orders.capture`. `createSubscription` and
 *   `createCheckoutSession` make a subscription that waits for approval (its link is the checkout URL).
 * - **What PayPal can't do** fails with `billing/not-supported`: several prices on one subscription, trials set
 *   per subscription, plan changes without the subscriber's consent (`paypal.subscriptions.revise` gives the
 *   approval link), cancel at period end, previews, a portal, invoices, metered usage, a credit balance, lookup
 *   keys, and the Stripe-style webhook handler (use `payPalWebhookAuth` and `normalizePayPalEvent`).
 *
 * The port's methods take no `ctx`, so these calls carry none (`null`): their spans have no parent.
 */
export class PayPalBillingAdapter implements BillingAdapter {
  readonly name = 'paypal';

  constructor(readonly client: PayPal) {}

  private async call<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw toBillingError(error, operation);
    }
  }

  // ── Customers: local only ────────────────────────────────────────────────────────────────────────────

  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    if (!input.tenantId) throw new BillingError('billing/invalid-input', 'A PayPal customer is a tenant: tenantId is required');
    return localCustomer(input);
  }

  /** The customer for an id this adapter made; null for any other (the memory adapter's, say), so `ensureCustomer({ verify })` replaces it. */
  async getCustomer(id: string): Promise<Customer | null> {
    const tenantId = tenantOfCustomer(id);
    return tenantId ? localCustomer({ tenantId }) : null;
  }

  async updateCustomer(id: string, patch: { email?: string; name?: string; metadata?: Record<string, string> }): Promise<Customer> {
    const tenantId = tenantOfCustomer(id);
    if (!tenantId) throw new BillingError('billing/not-found', `No PayPal customer ${id}`);
    return localCustomer({ tenantId, ...patch });
  }

  // ── Subscriptions ────────────────────────────────────────────────────────────────────────────────────

  /**
   * A subscription waiting for the subscriber's approval (`incomplete`): hand its id to the JavaScript SDK. For a
   * redirect to PayPal instead, use `createCheckoutSession`.
   */
  async createSubscription(input: CreateSubscriptionInput, opts: IdempotencyOptions = {}): Promise<Subscription> {
    const { planId, quantity } = onePlan(input);
    if (input.trialDays) throw notSupported("a trial is part of the plan's billing cycles, not of a subscription");
    return this.call('createSubscription', async () =>
      subscriptionFromPayPal(await this.client.subscriptions.create(null, { planId, quantity, customId: input.customerId, idempotencyKey: opts.idempotencyKey })),
    );
  }

  async updateSubscription(_id: string, _patch: UpdateSubscriptionInput): Promise<Subscription> {
    throw notSupported('a plan or quantity change needs the subscriber to approve it on PayPal: use paypal.subscriptions.revise and send them to approvalUrl(revision)');
  }

  async previewSubscriptionChange(_id: string, _patch: UpdateSubscriptionInput): Promise<SubscriptionChangePreview> {
    throw notSupported('there is no preview of what a plan change would bill');
  }

  /** At once (`atPeriodEnd: false`): PayPal has no cancel at period end, so asking for one fails. */
  async cancelSubscription(id: string, options: { atPeriodEnd?: boolean } = {}): Promise<Subscription> {
    if (options.atPeriodEnd) throw notSupported('a subscription is cancelled at once, not at the end of its period: pass { atPeriodEnd: false }');
    return this.call('cancelSubscription', async () => {
      await this.client.subscriptions.cancel(null, { subscriptionId: id, reason: REASONS.cancel });
      return subscriptionFromPayPal(await this.client.subscriptions.get(null, id));
    });
  }

  /** Suspends it: PayPal stops billing until it is activated again. */
  async pauseSubscription(id: string): Promise<Subscription> {
    return this.call('pauseSubscription', async () => {
      await this.client.subscriptions.suspend(null, { subscriptionId: id, reason: REASONS.pause });
      return subscriptionFromPayPal(await this.client.subscriptions.get(null, id));
    });
  }

  async resumeSubscription(id: string): Promise<Subscription> {
    return this.call('resumeSubscription', async () => {
      await this.client.subscriptions.activate(null, { subscriptionId: id, reason: REASONS.resume });
      return subscriptionFromPayPal(await this.client.subscriptions.get(null, id));
    });
  }

  async getSubscription(id: string): Promise<Subscription | null> {
    try {
      return subscriptionFromPayPal(await this.client.subscriptions.get(null, id));
    } catch (error) {
      if (error instanceof PayPalError && error.category === 'not-found') return null;
      throw toBillingError(error, 'getSubscription');
    }
  }

  async listSubscriptions(_customerId: string): Promise<Subscription[]> {
    throw notSupported("subscriptions can't be listed by customer: read the billing mirror (billing.listSubscriptions)");
  }

  // ── Payments ─────────────────────────────────────────────────────────────────────────────────────────

  /**
   * Creates an order for `amount`, which the buyer approves on PayPal: the charge comes back `requires_action`,
   * with the order id as its id. Give that id to the JavaScript SDK, then capture it with
   * `paypal.orders.capture(ctx, { orderId })` when the buyer approves. A stored payment method isn't supported.
   */
  async createCharge(input: CreateChargeInput, opts: IdempotencyOptions = {}): Promise<Charge> {
    if (input.paymentMethodId) throw notSupported('there is no stored payment method to charge: the buyer approves each order on PayPal');
    return this.call('createCharge', async () =>
      chargeFromOrder(
        await this.client.orders.create(null, {
          amount: input.amount,
          currency: input.currency,
          description: input.description?.slice(0, 127),
          customId: input.customerId,
          idempotencyKey: opts.idempotencyKey,
        }),
      ),
    );
  }

  /** Refunds the order's capture (`chargeId` is the order id, as `createCharge` returns it), in full or for `amount`. */
  async refund(chargeId: string, options: { amount?: number; reason?: string } = {}, opts: IdempotencyOptions = {}): Promise<Refund> {
    return this.call('refund', async () => {
      const order = await this.client.orders.get(null, chargeId);
      const capture = order.purchase_units?.[0]?.payments?.captures?.find((c) => c.status === 'COMPLETED' || c.status === 'PARTIALLY_REFUNDED');
      if (!capture) throw new BillingError('billing/invalid-input', `Order ${chargeId} has no completed capture to refund`);
      const refund = await this.client.captures.refund(null, {
        captureId: capture.id,
        ...(options.amount !== undefined ? { amount: options.amount, currency: capture.amount?.currency_code ?? order.purchase_units?.[0]?.amount?.currency_code } : {}),
        idempotencyKey: opts.idempotencyKey,
      });
      return refundFromPayPal(refund, chargeId, options.reason ?? null);
    });
  }

  /**
   * A subscription the subscriber approves on PayPal: `url` is its approve link, `id` the subscription's.
   * PayPal sends them to `successUrl` once approved, or `cancelUrl`. `mode: 'payment'` isn't supported: PayPal
   * has no price catalog for one-time payments, so use `charge` and the JavaScript SDK.
   */
  async createCheckoutSession(input: CreateCheckoutInput, opts: IdempotencyOptions = {}): Promise<CheckoutSession> {
    if (input.mode !== 'subscription') throw notSupported("a one-time checkout needs an amount, not a price: use charge (an order) and the PayPal JavaScript SDK");
    if (input.trialDays) throw notSupported("a trial is part of the plan's billing cycles, not of a checkout");
    if (input.allowPromotionCodes) throw notSupported('there are no promotion codes');
    const { planId, quantity } = onePlan(input);
    return this.call('createCheckoutSession', async () => {
      const sub = await this.client.subscriptions.create(null, {
        planId,
        quantity,
        customId: input.customerId,
        returnUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
        idempotencyKey: opts.idempotencyKey,
      });
      const url = approvalUrl(sub);
      if (!url) throw new BillingError('billing/upstream-failed', 'PayPal returned a subscription without an approve link');
      return { id: sub.id, url };
    });
  }

  async createPortalSession(_customerId: string, _returnUrl: string): Promise<PortalSession> {
    throw notSupported('there is no hosted billing portal: subscribers manage their subscriptions in their PayPal account');
  }

  async listInvoices(_customerId: string): Promise<Invoice[]> {
    throw notSupported('subscriptions and orders make no invoices');
  }

  /** Every billing plan, each with its regular cycle's price. PayPal has no lookup keys, so filtering by them isn't supported. */
  async listPlans(options: { activeOnly?: boolean; lookupKeys?: string[] } = {}): Promise<Plan[]> {
    if (options.lookupKeys) throw notSupported('plans have no lookup keys: refer to them by plan id');
    return this.call('listPlans', async () => {
      const out: Plan[] = [];
      for await (const plan of this.client.plans.all(null)) {
        const full = plan.billing_cycles ? plan : await this.client.plans.get(null, plan.id);
        out.push(planFromPayPal(full));
      }
      return options.activeOnly === false ? out : out.filter((p) => p.active);
    });
  }

  async reportUsage(): Promise<void> {
    throw notSupported('there is no metered billing: keep usage in the billing mirror and charge for it yourself');
  }

  async getCreditBalance(_customerId: string): Promise<CreditBalance> {
    throw notSupported("there is no customer credit balance: use the billing mirror's ledger (billing.getCreditBalance)");
  }

  async adjustCreditBalance(): Promise<CreditBalance> {
    throw notSupported("there is no customer credit balance: use the billing mirror's ledger (billing.grantCredits)");
  }

  async parseWebhook(_rawBody: Buffer | string, _signature: string, _secret: string): Promise<ProviderEvent> {
    throw notSupported('webhooks are signed with a certificate across several headers: receive them with payPalWebhookAuth and normalizePayPalEvent');
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.client.ping(null);
      return true;
    } catch {
      return false;
    }
  }
}

/** The billing adapter on a PayPal client. */
export function createPayPalBillingAdapter(client: PayPal): PayPalBillingAdapter {
  return new PayPalBillingAdapter(client);
}

/** A PayPal subscription has one plan: the port's single price, or a one-item list. */
function onePlan(input: { priceId?: string; quantity?: number; items?: Array<{ priceId: string; quantity?: number }> }): { planId: string; quantity?: number } {
  if (input.items && input.items.length > 1) throw notSupported('a subscription has one plan, not several prices');
  const item = input.items?.[0];
  const planId = item?.priceId ?? input.priceId;
  if (!planId) throw new BillingError('billing/invalid-input', 'priceId (the PayPal plan id) is required');
  return { planId, quantity: item ? item.quantity : input.quantity };
}
