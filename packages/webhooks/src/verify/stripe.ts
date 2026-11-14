import { checkedTimestamp, headerValue, hmac, invalidSignature, safeEqual, secretList, type TimestampOptions, type VerifiedWebhook, type WebhookHeaders } from './common';

export const STRIPE_SIGNATURE_HEADER = 'stripe-signature';

export interface StripeStyleOptions extends TimestampOptions {
  /** The header holding `t=…,v1=…`. Default `stripe-signature`. */
  header?: string;
  /** The sender's name, for error messages. Default `Stripe`. */
  provider?: string;
}

/**
 * Stripe's scheme, which other senders copy: a header `t=<Unix seconds>,v1=<hex>[,v1=<hex>…]`, where
 * each `v1` is the HMAC-SHA256 of `"<t>.<raw body>"`. Several `v1` values appear while the sender
 * rotates its secret; `secret` may be a list for the same reason on your side. The event id is the
 * body's `id`, read only after the signature holds.
 */
export function verifyStripeWebhook(rawBody: string | Buffer, headers: WebhookHeaders, secret: string | string[], options: StripeStyleOptions = {}): VerifiedWebhook {
  const provider = options.provider ?? 'Stripe';
  const secrets = secretList(secret, provider);
  const header = headerValue(headers, options.header ?? STRIPE_SIGNATURE_HEADER);
  if (!header) return invalidSignature(provider, 'signature header is missing');

  let timestamp: string | undefined;
  const offered: Buffer[] = [];
  for (const part of header.split(',')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (name === 't') timestamp = value;
    else if (name === 'v1' && /^[0-9a-fA-F]+$/.test(value) && value.length % 2 === 0) offered.push(Buffer.from(value, 'hex'));
  }
  const timestampSeconds = checkedTimestamp(provider, timestamp, options);
  if (offered.length === 0) return invalidSignature(provider, 'no v1 signature');

  const matches = secrets.some((key) => {
    const expected = hmac('sha256', key, [`${timestampSeconds}.`, rawBody]);
    return offered.some((candidate) => safeEqual(candidate, expected));
  });
  if (!matches) return invalidSignature(provider, 'signature mismatch');

  let eventId: string | undefined;
  try {
    const id = (JSON.parse(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')) as { id?: unknown }).id;
    if (typeof id === 'string' && id) eventId = id;
  } catch {
    // A signed body that isn't JSON has no id to deduplicate on.
  }
  return { eventId, timestampSeconds };
}

/** `t=<seconds>,v1=<hex>`: what a sender puts in the header. For tests and for sending in this scheme. */
export function signStripeWebhook(secret: string, timestampSeconds: number, body: string | Buffer): string {
  return `t=${timestampSeconds},v1=${hmac('sha256', secret, [`${timestampSeconds}.`, body]).toString('hex')}`;
}
