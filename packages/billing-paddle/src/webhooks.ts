import { createHmac, timingSafeEqual } from 'node:crypto';
import { AuthError } from '@mariachi/core';
import { type Secrets, type Verified, VerifiedWebhookAuth, type VerifiedWebhookAuthOptions, type WebhookHeaders, headerValue } from '@mariachi/webhooks';
import { provider } from './generated';
import { PaddleNotification } from './schemas';

export const PADDLE_SIGNATURE_HEADER = 'paddle-signature';

/** Paddle's own tolerance: its SDKs refuse a signature whose `ts` is more than five seconds from now. */
export const PADDLE_TOLERANCE_SECONDS = 5;

export interface PaddleVerifyOptions {
  /** How far `ts` may be from now, either way. Default 5, as Paddle's SDKs. */
  toleranceSeconds?: number;
  /** The current time in Unix seconds, for tests. */
  nowSeconds?: number;
}

/**
 * Paddle's scheme (https://developer.paddle.com/webhooks/signature-verification): the `Paddle-Signature` header is
 * `ts=<Unix seconds>;h1=<hex>`, each `h1` the HMAC-SHA256 of `"<ts>:<raw body>"` keyed with the notification
 * destination's secret key as-is. More than one `h1` comes while Paddle rotates a secret, and `secret` may be a
 * list while you do. The event id is the signed body's `event_id`, the same on every retry of the event.
 * Throws `webhooks/invalid-signature`; pass the exact bytes received.
 */
export function verifyPaddleWebhook(rawBody: string | Buffer, headers: WebhookHeaders, secret: string | string[], options: PaddleVerifyOptions = {}): { eventId: string; timestampSeconds: number } {
  const secrets = (Array.isArray(secret) ? secret : [secret]).filter((s) => typeof s === 'string' && s.trim() !== '');
  if (secrets.length === 0) return invalid('no secret configured');
  const header = headerValue(headers, PADDLE_SIGNATURE_HEADER);
  if (!header) return invalid('Paddle-Signature header is missing');

  let ts: string | undefined;
  const offered: Buffer[] = [];
  for (const part of header.split(';')) {
    const at = part.indexOf('=');
    if (at === -1) continue;
    const name = part.slice(0, at).trim();
    const value = part.slice(at + 1).trim();
    if (name === 'ts') ts = value;
    else if (name === 'h1' && /^[0-9a-fA-F]+$/.test(value) && value.length % 2 === 0) offered.push(Buffer.from(value, 'hex'));
  }
  if (!ts || !/^\d{1,12}$/.test(ts)) return invalid('ts is missing or not Unix seconds');
  const timestampSeconds = Number(ts);
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestampSeconds) > (options.toleranceSeconds ?? PADDLE_TOLERANCE_SECONDS)) return invalid('ts is outside the tolerance');
  if (offered.length === 0) return invalid('no h1 signature');

  // Over the ts exactly as sent: those are the characters Paddle signed
  const matches = secrets.some((key) => {
    const expected = createHmac('sha256', key).update(`${ts}:`).update(rawBody).digest();
    return offered.some((candidate) => candidate.length === expected.length && timingSafeEqual(candidate, expected));
  });
  if (!matches) return invalid('signature mismatch');

  let eventId: unknown;
  try {
    eventId = (JSON.parse(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')) as { event_id?: unknown }).event_id;
  } catch {
    return invalid('signed body is not JSON');
  }
  if (typeof eventId !== 'string' || !eventId) return invalid('signed body has no event_id');
  return { eventId, timestampSeconds };
}

/** `ts=<seconds>;h1=<hex>`: the header Paddle sends for `body`. For tests. */
export function signPaddleWebhook(secret: string, timestampSeconds: number, body: string | Buffer): string {
  return `ts=${timestampSeconds};h1=${createHmac('sha256', secret).update(`${timestampSeconds}:`).update(body).digest('hex')}`;
}

function invalid(reason: string): never {
  throw new AuthError('webhooks/invalid-signature', `Paddle webhook: ${reason}`);
}

/** Paddle's `Paddle-Signature` scheme for a `WebhookController`, deduplicated on the signed `event_id`. */
export class PaddleWebhookAuth extends VerifiedWebhookAuth {
  constructor(private readonly options: VerifiedWebhookAuthOptions & { toleranceSeconds?: number }) {
    super(options, provider.id);
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Verified {
    const { eventId } = verifyPaddleWebhook(rawBody, headers, secret, { toleranceSeconds: this.options.toleranceSeconds });
    return { eventId };
  }
}

/**
 * The authenticator for a `WebhookController` that receives Paddle's notifications as they are: the signature
 * checked over the raw body, a stale `ts` refused, deliveries deduplicated on `event_id`, a forged one answered 401.
 * Pass two secrets while rotating. To keep the billing mirror, use `createBillingWebhookHandler` instead (README).
 *
 * ```ts
 * class PaddleWebhooks extends WebhookController {
 *   readonly prefix = 'paddle';
 *   readonly auth = paddleWebhookAuth(config.paddle.webhookSecret);
 *   init() {
 *     this.post('events', { mode: 'queue', jobName: 'paddle-event', eventType: paddleEventType },
 *       async (_ctx, body) => PaddleWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function paddleWebhookAuth(secret: Secrets, options: Omit<VerifiedWebhookAuthOptions, 'secret'> & { toleranceSeconds?: number } = {}): PaddleWebhookAuth {
  return new PaddleWebhookAuth({ ...options, secret });
}

/** What Paddle posts: `{ event_id, event_type, occurred_at, notification_id, data }`. Order isn't guaranteed: compare `occurred_at`. */
export const PaddleWebhookBody = PaddleNotification;

/** The delivery's event type, for its span: `eventType: paddleEventType` on the route. */
export function paddleEventType(payload: unknown): string | undefined {
  const type = (payload as { event_type?: unknown } | null)?.event_type;
  return typeof type === 'string' ? type : undefined;
}
