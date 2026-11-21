import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Context, TracerAdapter } from '@mariachi/core';
import { IntegrationError } from '@mariachi/core';

/**
 * Signature checks for inbound webhooks, the few shapes providers use. Every one takes the raw bytes of the
 * body as they arrived: JSON parsed and written back out doesn't match the signature.
 */

export type RawBody = string | Buffer | Uint8Array;

/** Two strings compared in constant time. False when their lengths differ. */
export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** The HMAC of `payload` with `secret`, in hex or base64. `secret` may be bytes (a decoded `whsec_` key). */
export function hmac(algorithm: 'sha256' | 'sha1' | 'sha512', secret: string | Buffer, payload: RawBody, encoding: 'hex' | 'base64'): string {
  return createHmac(algorithm, secret).update(typeof payload === 'string' ? payload : Buffer.from(payload)).digest(encoding);
}

/**
 * `t=123,v1=abc,v1=def` (Stripe, Calendly, Mailchimp, WorkOS) or `ts=123;h1=abc` (Paddle) as a map of each key's
 * values, in order.
 */
export function parseSignatureHeader(header: string | undefined | null, separator: ',' | ';' = ','): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const part of (header ?? '').split(separator)) {
    const at = part.indexOf('=');
    if (at <= 0) continue;
    const key = part.slice(0, at).trim();
    const value = part.slice(at + 1).trim();
    out.set(key, [...(out.get(key) ?? []), value]);
  }
  return out;
}

/** Whether a webhook's timestamp (in seconds) is within `toleranceSeconds` of now, either side. */
export function withinTolerance(timestampSeconds: number, toleranceSeconds = 300, now: number = Date.now()): boolean {
  return Number.isFinite(timestampSeconds) && Math.abs(now / 1000 - timestampSeconds) <= toleranceSeconds;
}

/**
 * Standard Webhooks (standardwebhooks.com), which Svix sends: Clerk, Stytch, Supabase's auth hooks. Signs
 * `<id>.<timestamp>.<body>` with the secret after its `whsec_` (base64), and the `webhook-signature` header holds
 * one or more `v1,<base64>`. Checks the timestamp is within five minutes.
 */
export function verifyStandardWebhook(input: {
  secret: string;
  id: string | undefined;
  timestamp: string | undefined;
  signature: string | undefined;
  rawBody: RawBody;
  toleranceSeconds?: number;
  now?: number;
}): boolean {
  const { id, timestamp, signature } = input;
  if (!id || !timestamp || !signature) return false;
  if (!withinTolerance(Number(timestamp), input.toleranceSeconds ?? 300, input.now)) return false;
  const key = Buffer.from(input.secret.replace(/^(v1,)?whsec_/, ''), 'base64');
  const expected = hmac('sha256', key, `${id}.${timestamp}.${Buffer.from(typeof input.rawBody === 'string' ? input.rawBody : Buffer.from(input.rawBody)).toString()}`, 'base64');
  return signature.split(' ').some((entry) => {
    const [version, value] = entry.split(',');
    return version === 'v1' && value !== undefined && safeEqual(value, expected);
  });
}

/** The span a received webhook makes: SERVER, `<integration> webhook`, with the event's type once it's known. */
export interface ReceivedWebhook<T> {
  /** The event's type, such as `invoice.paid`: low-cardinality, safe to record. */
  event: string;
  payload: T;
}

/**
 * Receives one webhook: `verifyAndParse` checks the signature over the raw body and parses the payload, and a
 * SERVER span named `<integration> webhook` records whether it passed. A failed check throws
 * `<integration>/invalid-signature` (401) and the span's status is an error.
 */
export async function receiveProviderWebhook<T>(
  _ctx: Context,
  integration: string,
  verifyAndParse: () => ReceivedWebhook<T> | Promise<ReceivedWebhook<T>>,
  deps: { tracer?: TracerAdapter } = {},
): Promise<ReceivedWebhook<T>> {
  const span = deps.tracer?.startSpan(`${integration} webhook`, { 'mariachi.integration': integration }, { kind: 'server' });
  try {
    const received = await verifyAndParse();
    span?.setAttribute('mariachi.integration.event', received.event);
    span?.setStatus('ok');
    return received;
  } catch (error) {
    span?.setAttribute('error.type', (error as { code?: string })?.code ?? `${integration}/invalid-webhook`);
    span?.setStatus('error', (error as { code?: string })?.code);
    throw error;
  } finally {
    span?.end();
  }
}

/** The error a failed signature check throws: 401, so the provider sees the request was refused. */
export class WebhookSignatureError extends IntegrationError {
  readonly statusCode = 401;
  constructor(integration: string) {
    super(`${integration}/invalid-signature`, `The ${integration} webhook's signature didn't match`);
    this.name = 'WebhookSignatureError';
  }
}
