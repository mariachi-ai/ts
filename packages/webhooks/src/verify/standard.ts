import { ConfigError } from '@mariachi/core';
import { checkedTimestamp, headerValue, hmac, invalidSignature, safeEqual, type TimestampOptions, type VerifiedWebhook, type WebhookHeaders } from './common';

/**
 * Standard Webhooks (https://www.standardwebhooks.com), the scheme Svix, Clerk, Resend and many
 * others send: an id, a timestamp in Unix seconds, and a signature header holding a space-separated
 * list of `v1,<base64 HMAC-SHA256 of "<id>.<timestamp>.<body>">`. The headers are `webhook-id`,
 * `webhook-timestamp` and `webhook-signature`, or Svix's `svix-*` names for the same values.
 */

/** Decodes secrets written `whsec_<base64>`, `v1,whsec_<base64>` or bare base64; several may be joined by `|` or given as a list. */
export function parseStandardWebhookSecrets(secret: string | string[]): Buffer[] {
  const list = (Array.isArray(secret) ? secret : secret.split('|')).map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) throw new ConfigError('webhooks/invalid-secret', 'Standard webhook: no secret configured');
  return list.map((entry) => {
    const b64 = entry.replace(/^v1,/, '').replace(/^whsec_/, '');
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) throw new ConfigError('webhooks/invalid-secret', 'Standard webhook: a secret is not whsec_<base64>');
    const key = Buffer.from(b64, 'base64');
    if (key.length < 16) throw new ConfigError('webhooks/invalid-secret', 'Standard webhook: a secret is shorter than 16 bytes');
    return key;
  });
}

/** `v1,<base64>` for one key: what a sender puts in the signature header. */
export function signStandardWebhook(key: Buffer, id: string, timestampSeconds: number, body: string | Buffer): string {
  return `v1,${hmac('sha256', key, [`${id}.${timestampSeconds}.`, body]).toString('base64')}`;
}

/**
 * Verifies the three headers against the raw body. `secret` takes what `parseStandardWebhookSecrets`
 * does, or keys it already decoded. Throws `webhooks/invalid-signature` when a header is missing,
 * the timestamp is stale, or no signature matches any key.
 */
export function verifyStandardWebhook(
  rawBody: string | Buffer,
  headers: WebhookHeaders,
  secret: string | string[] | Buffer[],
  options: TimestampOptions = {},
): VerifiedWebhook {
  const provider = 'Standard';
  const keys = Array.isArray(secret) && secret.every((s) => Buffer.isBuffer(s)) && secret.length > 0 ? (secret as Buffer[]) : parseStandardWebhookSecrets(secret as string | string[]);
  const prefix = headerValue(headers, 'webhook-id') !== undefined ? 'webhook' : 'svix';
  const id = headerValue(headers, `${prefix}-id`);
  const signature = headerValue(headers, `${prefix}-signature`);
  if (!id || !signature) return invalidSignature(provider, 'webhook-id or webhook-signature is missing');
  const timestampSeconds = checkedTimestamp(provider, headerValue(headers, `${prefix}-timestamp`), options);

  const offered = signature
    .split(' ')
    .map((entry) => entry.trim())
    .filter((entry) => entry.startsWith('v1,'))
    .map((entry) => Buffer.from(entry.slice(3), 'base64'));
  if (offered.length === 0) return invalidSignature(provider, 'no v1 signature');
  for (const key of keys) {
    const expected = hmac('sha256', key, [`${id}.${timestampSeconds}.`, rawBody]);
    if (offered.some((candidate) => safeEqual(candidate, expected))) return { eventId: id, timestampSeconds };
  }
  return invalidSignature(provider, 'signature mismatch');
}
