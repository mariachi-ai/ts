import type { BillingEvent, BillingStore, ProviderEvent } from '@mariachi/billing';
import { mapCharge, mapCustomer, mapInvoice, mapPrice, mapRefund, mapSubscription, tenantOf } from './mappers';
import { PaddleAdjustment, PaddleCustomer, PaddlePrice, PaddleSubscription, PaddleTransaction } from './schemas';

/** What normalizing needs from Paddle itself: an approved refund's transaction, for the charge it refunds. */
export interface NormalizeDeps {
  transactionWithRefunds(transactionId: string): Promise<PaddleTransaction>;
}

async function resolveTenant(store: BillingStore | undefined, own: string | null, customerId: string | null | undefined): Promise<string | null> {
  if (own) return own;
  if (!store || !customerId) return null;
  return (await store.findCustomer(customerId))?.tenantId ?? null;
}

const SUBSCRIPTION_EVENTS = new Set([
  'subscription.created',
  'subscription.imported',
  'subscription.activated',
  'subscription.trialing',
  'subscription.updated',
  'subscription.past_due',
  'subscription.paused',
  'subscription.resumed',
  'subscription.canceled',
]);

/** Origins of a transaction a checkout made: Paddle.js's own (`web`), or one the app created for it (`api`). */
const CHECKOUT_ORIGINS = new Set(['web', 'api']);

/**
 * Paddle's notifications as the billing port's events, mirrored into `store` and versioned by `occurred_at`
 * (Paddle doesn't guarantee delivery order). The tenant is the entity's `custom_data.tenantId`, else the mirrored
 * customer's.
 *
 * - `customer.created` / `updated` → `customer.synced`
 * - `subscription.*` → `subscription.synced`, and `subscription.canceled` when the status becomes canceled
 * - `transaction.completed` → `invoice.paid` and `payment.succeeded`, and `checkout.completed` for a checkout's
 * - `transaction.payment_failed` → `invoice.payment_failed` and `payment.failed`
 * - `adjustment.created` / `updated` for a refund → the refund mirrored, and `charge.refunded` once Paddle approves it
 * - `price.created` / `updated` → `plan.synced`
 *
 * Anything else (chargebacks, credits, payouts…) returns no events.
 */
export async function normalizePaddleEvent(event: ProviderEvent, store: BillingStore | undefined, deps: NormalizeDeps): Promise<BillingEvent[]> {
  const base = { eventId: event.id, occurredAt: event.createdAt, providerType: event.type };
  const at = event.createdAt;
  const type = event.type;

  if (type === 'customer.created' || type === 'customer.updated' || type === 'customer.imported') {
    const mapped = mapCustomer(PaddleCustomer.parse(event.object));
    const tenantId = await resolveTenant(store, mapped.tenantId, mapped.id);
    const customer = { ...mapped, tenantId };
    await store?.upsertCustomer(customer, at);
    return [{ ...base, type: 'customer.synced', tenantId, customer }];
  }

  if (SUBSCRIPTION_EVENTS.has(type)) {
    const mapped = mapSubscription(PaddleSubscription.parse(event.object));
    const tenantId = await resolveTenant(store, mapped.tenantId, mapped.customerId);
    const subscription = { ...mapped, tenantId };
    let previousStatus = null;
    if (store) {
      const result = await store.upsertSubscription(subscription, at);
      // A newer event already won: no transitions from stale data
      if (!result.applied) return [];
      previousStatus = result.previousStatus;
    }
    const events: BillingEvent[] = [{ ...base, type: 'subscription.synced', tenantId, subscription, previousStatus }];
    if (subscription.status === 'canceled' && previousStatus !== 'canceled') events.push({ ...base, type: 'subscription.canceled', tenantId, subscription });
    return events;
  }

  if (type === 'transaction.completed' || type === 'transaction.payment_failed') {
    const transaction = PaddleTransaction.parse(event.object);
    const tenantId = await resolveTenant(store, tenantOf(transaction.custom_data), transaction.customer_id);
    const invoice = { ...mapInvoice(transaction), tenantId };
    const completed = type === 'transaction.completed';
    const charge = { ...mapCharge(transaction), tenantId, status: completed ? ('succeeded' as const) : ('failed' as const) };
    await store?.upsertInvoice(invoice, at);
    await store?.upsertCharge(charge, at);
    const events: BillingEvent[] = [
      { ...base, type: completed ? 'invoice.paid' : 'invoice.payment_failed', tenantId, invoice },
      { ...base, type: completed ? 'payment.succeeded' : 'payment.failed', tenantId, charge },
    ];
    if (completed && CHECKOUT_ORIGINS.has(transaction.origin ?? '') && transaction.collection_mode !== 'manual') {
      events.push({
        ...base,
        type: 'checkout.completed',
        tenantId,
        sessionId: transaction.id,
        customerId: transaction.customer_id ?? null,
        subscriptionId: transaction.subscription_id ?? null,
        mode: transaction.subscription_id ? 'subscription' : 'payment',
      });
    }
    return events;
  }

  if (type === 'adjustment.created' || type === 'adjustment.updated') {
    const adjustment = PaddleAdjustment.parse(event.object);
    if (adjustment.action !== 'refund') return [];
    const tenantId = await resolveTenant(store, null, adjustment.customer_id);
    const refund = mapRefund(adjustment, tenantId);
    await store?.upsertRefund(refund);
    if (refund.status !== 'succeeded') return [];
    // The adjustment carries no charge: read the transaction, with what has been refunded of it so far
    const charge = { ...mapCharge(await deps.transactionWithRefunds(adjustment.transaction_id)), tenantId };
    await store?.upsertCharge(charge, at);
    return [{ ...base, type: 'charge.refunded', tenantId, refund, charge }];
  }

  if (type === 'price.created' || type === 'price.updated' || type === 'price.imported') {
    const price = PaddlePrice.parse(event.object);
    const plan = mapPrice(price);
    // Price events carry the product as an id only: keep the product fields `syncPlans` mirrored
    const stored = price.product ? null : await store?.findPlan(plan.id);
    if (stored) {
      plan.description = stored.description;
      plan.productMetadata = stored.productMetadata;
      if (!price.name) plan.name = stored.name;
    }
    await store?.upsertPlan(plan, at);
    return [{ ...base, type: 'plan.synced', tenantId: null, plan }];
  }

  return [];
}
