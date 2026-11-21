import { BillingError, ValidationError } from '@mariachi/core';

/**
 * The currencies PayPal's REST APIs take payments in, each with the number of decimals in its minor unit (ISO
 * 4217). Billing amounts are integers in that minor unit; PayPal wants a decimal string.
 */
const MINOR_DIGITS: Readonly<Record<string, number>> = {
  AUD: 2, BRL: 2, CAD: 2, CNY: 2, CZK: 2, DKK: 2, EUR: 2, HKD: 2, HUF: 2, ILS: 2, JPY: 0, MYR: 2, MXN: 2,
  TWD: 2, NZD: 2, NOK: 2, PHP: 2, PLN: 2, GBP: 2, RUB: 2, SGD: 2, SEK: 2, CHF: 2, THB: 2, USD: 2,
};

/** Currencies PayPal takes in whole units only: a decimal amount is an error. */
const WHOLE_UNITS = new Set(['HUF', 'JPY', 'TWD']);

/** The currency codes PayPal takes payments in, upper case. */
export const PAYPAL_CURRENCIES: readonly string[] = Object.keys(MINOR_DIGITS);

function digitsOf(currency: string): number {
  const digits = MINOR_DIGITS[currency.toUpperCase()];
  if (digits === undefined) throw new ValidationError(`PayPal doesn't take payments in ${currency.toUpperCase()}`, [{ path: ['currency'], message: 'not a PayPal currency' }]);
  return digits;
}

/**
 * An amount in minor units (cents, as billing keeps it) as PayPal's `{ currency_code, value }`:
 * `toPayPalAmount(4900, 'usd')` is `{ currency_code: 'USD', value: '49.00' }`. HUF, JPY and TWD are whole units at
 * PayPal, so a HUF amount must be a whole number of forints (a multiple of 100 fillér).
 */
export function toPayPalAmount(minor: number, currency: string): { currency_code: string; value: string } {
  if (!Number.isSafeInteger(minor) || minor < 0) throw new ValidationError('amount must be a non-negative integer in minor units', [{ path: ['amount'], message: 'not an integer in minor units' }]);
  const code = currency.toUpperCase();
  const digits = digitsOf(code);
  const scale = 10 ** digits;
  if (WHOLE_UNITS.has(code)) {
    if (minor % scale !== 0) throw new ValidationError(`PayPal takes ${code} in whole units only: give a multiple of ${scale}`, [{ path: ['amount'], message: 'not a whole unit' }]);
    return { currency_code: code, value: String(minor / scale) };
  }
  if (digits === 0) return { currency_code: code, value: String(minor) };
  const whole = Math.floor(minor / scale);
  const fraction = String(minor % scale).padStart(digits, '0');
  return { currency_code: code, value: `${whole}.${fraction}` };
}

/** PayPal's `{ currency_code, value }` in minor units: `fromPayPalAmount({ currency_code: 'USD', value: '49.5' })` is 4950. */
export function fromPayPalAmount(amount: { currency_code: string; value: string }): number {
  const digits = digitsOf(amount.currency_code);
  const match = /^(\d+)(?:\.(\d+))?$/.exec(amount.value.trim());
  if (!match) throw new BillingError('billing/upstream-failed', 'PayPal returned an amount that is not a decimal number');
  const fraction = (match[2] ?? '').padEnd(digits, '0');
  if (fraction.length > digits && /[1-9]/.test(fraction.slice(digits))) {
    throw new BillingError('billing/upstream-failed', `PayPal returned more decimals than ${amount.currency_code} has`);
  }
  return Number(match[1]) * 10 ** digits + Number(fraction.slice(0, digits) || '0');
}
