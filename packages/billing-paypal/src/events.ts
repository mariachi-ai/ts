import type { BillingEvent, BillingStore, Charge, Subscription } from '@mariachi/billing';
import type { Context } from '@mariachi/core';
import type { PayPal } from './client';
import { captureIdOfRefund, chargeFromCapture, chargeFromOrder, orderIdOfCapture, refundFromPayPal, subscriptionFromPayPal, tenantOfCustomer } from './mappers';
import { Capture, PayPalSubscription, type PayPalWebhookEvent, Refund } from './schemas';

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

/**
 * A verified PayPal webhook event as the billing port's events, the ones `createBillingWebhookHandler` emits
 * for Stripe, mirrored into `store` when given:
 *
 * | PayPal | Billing event |
 * | --- | --- |
 * | `PAYMENT.CAPTURE.COMPLETED` | `payment.succeeded` |
 * | `PAYMENT.CAPTURE.DECLINED`, `PAYMENT.CAPTURE.DENIED` | `payment.failed` |
 * | `PAYMENT.CAPTURE.REFUNDED` | `charge.refunded` |
 * | `BILLING.SUBSCRIPTION.ACTIVATED`, `.UPDATED`, `.SUSPENDED`, `.PAYMENT.FAILED` | `subscription.synced` (a failed renewal shows as `past_due`) |
 * | `BILLING.SUBSCRIPTION.CANCELLED`, `.EXPIRED` | `subscription.synced` and `subscription.canceled` |
 *
 * Other event types give `[]`. Charges are keyed by the order id, as `createCharge` returns them. Safe to run
 * again for the same event: PayPal retries deliveries.
 */
export async function normalizePayPalEvent(ctx: Context, event: PayPalWebhookEvent, options: NormalizePayPalEventOptions): Promise<BillingEvent[]> {
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

    default: {
      if (!SUBSCRIPTION_EVENTS.has(event.event_type)) return [];
      const sent = PayPalSubscription.parse(event.resource);
      const mapped = subscriptionFromPayPal(await paypal.subscriptions.get(ctx, sent.id));
      const subscription: Subscription = { ...mapped, tenantId: await tenantOf(mapped.customerId, mapped.tenantId) };
      let previousStatus: Subscription['status'] | null = null;
      if (store) {
        const result = await store.upsertSubscription(subscription, occurredAt);
        // A newer event already won; don't report a transition for stale data
        if (!result.applied) return [];
        previousStatus = result.previousStatus;
      }
      const events: BillingEvent[] = [{ ...base, type: 'subscription.synced', tenantId: subscription.tenantId, subscription, previousStatus }];
      if (subscription.status === 'canceled' && previousStatus !== 'canceled') events.push({ ...base, type: 'subscription.canceled', tenantId: subscription.tenantId, subscription });
      return events;
    }
  }
}

/**
 * The payment a capture belongs to, as PayPal has it now: its order (amount, refunds so far, the app's
 * `custom_id`), keyed by the order id; the capture alone when PayPal names no order.
 */
async function chargeOf(ctx: Context, paypal: PayPal, captureId: string): Promise<Charge> {
  const capture = await paypal.captures.get(ctx, captureId);
  const orderId = orderIdOfCapture(capture);
  return orderId ? chargeFromOrder(await paypal.orders.get(ctx, orderId)) : chargeFromCapture(capture);
}
