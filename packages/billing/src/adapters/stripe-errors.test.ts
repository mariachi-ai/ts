import { createRequire } from 'node:module';
import StripeEsm from 'stripe';
import { describe, expect, it } from 'vitest';
import { isStripeError, mapStripeError, StripeAdapter } from './stripe';

// The SDK ships two builds, each with its own error classes. This file imports the ES module one;
// `require` gives the CommonJS one, which is the one the adapter loads for itself.
const StripeCjs = createRequire(import.meta.url)('stripe') as typeof StripeEsm;
const BUILDS = [
  ['the ES module build', StripeEsm],
  ['the CommonJS build', StripeCjs],
] as const;

const notFound = (Stripe: typeof StripeEsm) => new Stripe.errors.StripeInvalidRequestError({ type: 'invalid_request_error', code: 'resource_missing', message: 'No such customer: cus_x' });

describe("Stripe's errors, whichever build of the SDK threw them", () => {
  it('are two different classes, which is why they are told by shape', () => {
    expect(StripeEsm.errors.StripeError).not.toBe(StripeCjs.errors.StripeError);
    expect(notFound(StripeEsm) instanceof StripeCjs.errors.StripeError).toBe(false);
  });

  it.each(BUILDS)('are recognised and mapped from %s', (_name, Stripe) => {
    const missing = notFound(Stripe);
    expect(isStripeError(missing)).toBe(true);
    expect(mapStripeError(missing, 'getCustomer')).toMatchObject({ code: 'billing/not-found', message: 'No such customer: cus_x' });
    const declined = new Stripe.errors.StripeCardError({ type: 'card_error', code: 'card_declined', decline_code: 'insufficient_funds', message: 'Your card was declined.' });
    expect(mapStripeError(declined, 'createCharge')).toMatchObject({ code: 'billing/payment-failed', metadata: { stripeCode: 'card_declined', declineCode: 'insufficient_funds' } });
    expect(mapStripeError(new Stripe.errors.StripeRateLimitError({ type: 'rate_limit_error', message: 'Too many requests' }), 'x')).toMatchObject({ code: 'billing/rate-limited' });
  });

  it('does not take other errors for Stripe ones', () => {
    for (const other of [new Error('socket hang up'), { type: 'StripeLookalike' }, { type: 'card_error', rawType: 'card_error' }, null, 'StripeError', undefined]) {
      expect(isStripeError(other), String(other)).toBe(false);
    }
    expect(mapStripeError(new Error('socket hang up'), 'getCustomer')).toMatchObject({ code: 'billing/upstream-failed' });
  });

  it.each(BUILDS)('a client the app made from %s still gets null for something that is not there', async (_name, Stripe) => {
    const client = {
      customers: {
        retrieve: async () => {
          throw notFound(Stripe);
        },
      },
      subscriptions: {
        retrieve: async () => {
          throw notFound(Stripe);
        },
      },
    };
    const adapter = new StripeAdapter({ secretKey: '', client: client as unknown as StripeEsm });
    expect(await adapter.getCustomer('cus_x')).toBeNull();
    expect(await adapter.getSubscription('sub_x')).toBeNull();
  });
});
