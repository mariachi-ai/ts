import type { BillingEvent, BillingStore, Charge, Subscription } from '@mariachi/billing';
import type { Context } from '@mariachi/core';
import { z } from 'zod';
import type { PayPal } from './client';
import { captureIdOfRefund, chargeFromCapture, chargeFromOrder, chargeFromSale, orderIdOfCapture, refundFromPayPal, refundFromSaleRefund, subscriptionFromPayPal, tenantOfCustomer } from './mappers';
import { Capture, PayPalSubscription, type PayPalWebhookEvent, Refund, type SaleRefund } from './schemas';

export interface NormalizePayPalEventOptions {
  /**
   * The PayPal client. The capture, refund or subscription an event names is read again from PayPal's API, and
   * that, not the delivery's body, is what is mirrored and reported: PayPal's signature covers only a CRC32 of
   * the body, so the body alone shouldn't move money or grant access.
   */
  paypal: PayPal;
  /**
   * The billing mirror (`DrizzleBillingStore`), updated as Stripe's webhooks update it: charges, refunds and
   * subscriptions, versioned by the event's time so a late delivery never overwrites newer state.
   */
  store?: BillingStore;
}

const SUBSCRIPTION_EVENTS = new Set([
  'BILLING.SUBSCRIPTION.ACTIVATED',
  'BILLING.SUBSCRIPTION.UPDATED',
  'BILLING.SUBSCRIPTION.SUSPENDED',
  'BILLING.SUBSCRIPTION.CANCELLED',
  'BILLING.SUBSCRIPTION.EXPIRED',
  'BILLING.SUBSCRIPTION.PAYMENT.FAILED',
]);

/** A sale event's resource: the sale itself, or (refunds, some reversals) a refund naming its `sale_id`. */
const SaleResource = z.object({ id: z.string().min(1), sale_id: z.string().min(1).optional() }).passthrough();

/**
 * A verified PayPal webhook event as the billing port's events, mirrored into `store` when given. The adapter's
 * `normalizeWebhook` runs it for `createBillingWebhookHandler`; call it yourself from a `WebhookServer` job:
 *
 * | PayPal | Billing event |
 * | --- | --- |
 * | `PAYMENT.CAPTURE.COMPLETED` | `payment.succeeded` |
 * | `PAYMENT.CAPTURE.DECLINED`, `PAYMENT.CAPTURE.DENIED` | `payment.failed` |
 * | `PAYMENT.CAPTURE.REFUNDED` | `charge.refunded` |
 * | `BILLING.SUBSCRIPTION.ACTIVATED`, `.UPDATED`, `.SUSPENDED`, `.PAYMENT.FAILED` | `subscription.synced` (a failed renewal shows as `past_due`) |
 * | `BILLING.SUBSCRIPTION.CANCELLED`, `.EXPIRED` | `subscription.synced` and `subscription.canceled` |
 * | `PAYMENT.SALE.COMPLETED` (a subscription payment: a renewal, or a retry that worked) | `subscription.synced` and `payment.succeeded` |
 * | `PAYMENT.SALE.REFUNDED`, `PAYMENT.SALE.REVERSED` | `subscription.synced` and `charge.refunded` |
 *
 * Other event types give `[]`. Charges are keyed by the order id, as `createCharge` returns them; a subscription
 * payment's by the sale id. For a sale, the sale (and its refund) is read again from PayPal, then the subscription
 * its `billing_agreement_id` names, so the mirror's `currentPeriodEnd` moves on with each renewal and a `past_due`
 * subscription is `active` again once a retried payment goes through. A sale that paid for no subscription gives
 * `[]`. Safe to run again for the same event: PayPal retries deliveries.
 */
export async function normalizePayPalEvent(ctx: Context | null, event: PayPalWebhookEvent, options: NormalizePayPalEventOptions): Promise<BillingEvent[]> {
  const { paypal, store } = options;
  const occurredAt = new Date(event.create_time);
  const base = { eventId: event.id, occurredAt, providerType: event.event_type };
  const tenantOf = async (customerId: string, own: string | null): Promise<string | null> =>
    own ?? tenantOfCustomer(customerId) ?? (store && customerId ? ((await store.findCustomer(customerId))?.tenantId ?? null) : null);

  switch (event.event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED':
    case 'PAYMENT.CAPTURE.DECLINED':
    case 'PAYMENT.CAPTURE.DENIED': {
      const mapped = await chargeOf(ctx, paypal, Capture.parse(event.resource).id);
      const charge: Charge = { ...mapped, tenantId: await tenantOf(mapped.customerId, mapped.tenantId) };
      await store?.upsertCharge(charge, occurredAt);
      // The capture as PayPal has it now decides, not the event's name
      const type = charge.status === 'succeeded' ? 'payment.succeeded' : charge.status === 'failed' ? 'payment.failed' : null;
      return type ? [{ ...base, type, tenantId: charge.tenantId, charge }] : [];
    }

    case 'PAYMENT.CAPTURE.REFUNDED': {
      // The resource is the refund (its `up` link names the capture), or the refunded capture itself
      const sent = Refund.safeParse(event.resource);
      const sentCaptureId = sent.success ? captureIdOfRefund(sent.data) : null;
      const refund = sent.success && sentCaptureId ? await paypal.refunds.get(ctx, sent.data.id) : null;
      const captureId = refund ? (captureIdOfRefund(refund) ?? sentCaptureId) : Capture.parse(event.resource).id;
      if (!captureId) return [];
      const mapped = await chargeOf(ctx, paypal, captureId);
      const tenantId = await tenantOf(mapped.customerId, mapped.tenantId);
      const charge: Charge = { ...mapped, tenantId };
      const mappedRefund = refund
        ? { ...refundFromPayPal(refund, charge.id), tenantId }
        : { id: `${event.id}:refund`, chargeId: charge.id, tenantId, amount: charge.amountRefunded, currency: charge.currency, reason: null, status: 'succeeded' as const };
      await store?.upsertCharge(charge, occurredAt);
      await store?.upsertRefund(mappedRefund);
      return [{ ...base, type: 'charge.refunded', tenantId, refund: mappedRefund, charge }];
    }

    case 'PAYMENT.SALE.COMPLETED':
    case 'PAYMENT.SALE.REFUNDED':
    case 'PAYMENT.SALE.REVERSED': {
      const sent = SaleResource.parse(event.resource);
      // A refund names its sale; read the refund again from PayPal, as its amount is what is reported
      let refund: SaleRefund | null = null;
      if (event.event_type !== 'PAYMENT.SALE.COMPLETED' && sent.sale_id) {
        refund = await paypal.saleRefunds.get(ctx, sent.id);
      }
      const sale = await paypal.sales.get(ctx, refund?.sale_id ?? sent.sale_id ?? sent.id);
      if (!sale.billing_agreement_id) return [];
      const { subscription, events } = await subscriptionEvents(ctx, sale.billing_agreement_id, base, options, tenantOf);
      const tenantId = subscription.tenantId;
      const mappedRefund = refund ? refundFromSaleRefund(refund, sale.id, tenantId) : null;
      const charge: Charge = { ...chargeFromSale(sale, subscription.customerId, mappedRefund?.status === 'succeeded' ? mappedRefund.amount : 0), tenantId };
      await store?.upsertCharge(charge, occurredAt);
      if (event.event_type === 'PAYMENT.SALE.COMPLETED') {
        // The sale as PayPal has it now decides, not the event's name
        const type = charge.status === 'succeeded' ? 'payment.succeeded' : charge.status === 'failed' ? 'payment.failed' : null;
        return type ? [...events, { ...base, type, tenantId, charge }] : events;
      }
      if (!mappedRefund && !['refunded', 'partially_refunded', 'reversed'].includes(sale.state)) return events;
      // A reversal (or a refund sent as the sale itself) has no refund to read: the sale's state says it
      const reported = mappedRefund ?? { id: `${sale.id}:${sale.state}`, chargeId: charge.id, tenantId, amount: charge.amountRefunded, currency: charge.currency, reason: null, status: 'succeeded' as const };
      await store?.upsertRefund(reported);
      return [...events, { ...base, type: 'charge.refunded', tenantId, refund: reported, charge }];
    }

    default: {
      if (!SUBSCRIPTION_EVENTS.has(event.event_type)) return [];
      const sent = PayPalSubscription.parse(event.resource);
      return (await subscriptionEvents(ctx, sent.id, base, options, tenantOf)).events;
    }
  }
}

type EventBase = { eventId: string; occurredAt: Date; providerType: string };

/**
 * The subscription as PayPal has it now, mirrored, with `subscription.synced` (and `subscription.canceled` the
 * first time it is cancelled). No events when the mirror already holds newer state.
 */
async function subscriptionEvents(
  ctx: Context | null,
  subscriptionId: string,
  base: EventBase,
  { paypal, store }: NormalizePayPalEventOptions,
  tenantOf: (customerId: string, own: string | null) => Promise<string | null>,
): Promise<{ subscription: Subscription; events: BillingEvent[] }> {
  const mapped = subscriptionFromPayPal(await paypal.subscriptions.get(ctx, subscriptionId));
  const subscription: Subscription = { ...mapped, tenantId: await tenantOf(mapped.customerId, mapped.tenantId) };
  let previousStatus: Subscription['status'] | null = null;
  if (store) {
    const result = await store.upsertSubscription(subscription, base.occurredAt);
    // A newer event already won; don't report a transition for stale data
    if (!result.applied) return { subscription, events: [] };
    previousStatus = result.previousStatus;
  }
  const events: BillingEvent[] = [{ ...base, type: 'subscription.synced', tenantId: subscription.tenantId, subscription, previousStatus }];
  if (subscription.status === 'canceled' && previousStatus !== 'canceled') events.push({ ...base, type: 'subscription.canceled', tenantId: subscription.tenantId, subscription });
  return { subscription, events };
}

/**
 * The payment a capture belongs to, as PayPal has it now: its order (amount, refunds so far, the app's
 * `custom_id`), keyed by the order id; the capture alone when PayPal names no order.
 */
async function chargeOf(ctx: Context | null, paypal: PayPal, captureId: string): Promise<Charge> {
  const capture = await paypal.captures.get(ctx, captureId);
  const orderId = orderIdOfCapture(capture);
  return orderId ? chargeFromOrder(await paypal.orders.get(ctx, orderId)) : chargeFromCapture(capture);
}
