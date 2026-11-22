import { BillingError, ValidationError } from '@mariachi/core';
import { ProviderError } from '@mariachi/integrations';

/**
 * A PayPal call that failed, as `callProvider` sees it. Codes are `paypal/<reason>`, and `providerCode` is
 * PayPal's own (`INSTRUMENT_DECLINED`, the first `details[].issue`, else the error's `name`). The client
 * (`createPayPal`) throws it; the billing adapter turns it into the billing port's `BillingError`.
 */
export class PayPalError extends ProviderError {
  override name = 'PayPalError';
}

/** PayPal codes that mean the buyer's payment didn't go through: `billing/payment-failed` (402). */
const PAYMENT_FAILED = new Set([
  'INSTRUMENT_DECLINED',
  'PAYER_ACTION_REQUIRED',
  'ORDER_NOT_APPROVED',
  'ORDER_EXPIRED',
  'TRANSACTION_REFUSED',
  'PAYER_CANNOT_PAY',
  'MAX_NUMBER_OF_PAYMENT_ATTEMPTS_EXCEEDED',
]);

/**
 * A failed call as the billing port's `BillingError`, the code an app already handles for Stripe, with the
 * category, PayPal's code and the status in metadata. Never PayPal's message: it can echo the input.
 */
export function toBillingError(error: unknown, operation: string): BillingError {
  if (error instanceof BillingError) return error;
  if (!(error instanceof PayPalError)) {
    // A validation error from the client's own input check keeps its code (`validation/invalid-input`, 400)
    if (error instanceof ValidationError) return new BillingError('billing/invalid-input', `PayPal ${operation}: ${error.message}`, { operation, issues: error.issues });
    return new BillingError('billing/upstream-failed', `PayPal ${operation} failed`, { operation });
  }
  const { category, providerCode, status } = error;
  const meta = { operation, category, providerCode, status };
  const detail = `${status ?? 'no answer'}${providerCode ? `, ${providerCode}` : ''}`;
  if (providerCode && PAYMENT_FAILED.has(providerCode)) return new BillingError('billing/payment-failed', `PayPal declined the payment (${detail})`, meta);
  switch (category) {
    case 'not-found':
      return new BillingError('billing/not-found', `PayPal has no such resource (${operation})`, meta);
    case 'rate-limited':
      return new BillingError('billing/rate-limited', 'PayPal rate limit reached', meta);
    case 'unauthorized':
    case 'forbidden':
      return new BillingError('billing/config', `PayPal refused the app's credentials for ${operation} (${detail}): check PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET and PAYPAL_ENVIRONMENT`, meta);
    case 'conflict':
      return new BillingError('billing/conflict', `PayPal refused ${operation} in the resource's current state (${detail})`, meta);
    case 'invalid-request':
      return new BillingError('billing/invalid-input', `PayPal refused ${operation} (${detail})`, meta);
    default:
      return new BillingError('billing/upstream-failed', `PayPal ${operation} failed (${detail})`, meta);
  }
}

/**
 * What PayPal can't do behind the billing port. The port has no code of its own for it, so it is
 * `billing/not-supported`, never a silent no-op.
 */
export function notSupported(what: string): BillingError {
  return new BillingError('billing/not-supported', `PayPal: ${what}`);
}
