import { createHmac, timingSafeEqual } from 'node:crypto';
import { AuthError } from '@mariachi/core';
import { type Secrets, type Verified, VerifiedWebhookAuth, type VerifiedWebhookAuthOptions, type WebhookHeaders, headerValue, signatureDigest } from '@mariachi/webhooks';
import { provider } from './generated';
import { ZendeskEvent } from './schemas';

const SIGNATURE = 'x-zendesk-webhook-signature';
const TIMESTAMP = 'x-zendesk-webhook-signature-timestamp';
const DEFAULT_TOLERANCE_SECONDS = 300;

export interface ZendeskWebhookAuthOptions extends Omit<VerifiedWebhookAuthOptions, 'provider'> {
  /** How far the signed timestamp may be from now, either way. Five minutes by default. */
  toleranceSeconds?: number;
  /** The current time in milliseconds, for tests. */
  now?: () => number;
}

/**
 * Zendesk's webhook signature: `X-Zendesk-Webhook-Signature` is the base64 HMAC-SHA256 of the
 * `X-Zendesk-Webhook-Signature-Timestamp` header's value followed by the raw body, keyed with the webhook's signing
 * secret. A delivery signed more than `toleranceSeconds` from now is refused, so a captured one can't be replayed
 * later.
 *
 * Deduplicated on what's signed: a Zendesk event's `id` (in the body), or for a trigger's or automation's delivery,
 * whose body the account writes, a digest of the signature. Zendesk's webhook and invocation ids are unsigned
 * headers, kept in `identity.metadata` only.
 */
export class ZendeskWebhookAuth extends VerifiedWebhookAuth {
  constructor(private readonly options: ZendeskWebhookAuthOptions) {
    super(options, provider.id);
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Verified {
    const secrets = (Array.isArray(secret) ? secret : [secret]).filter((s) => s.trim() !== '');
    const signature = headerValue(headers, SIGNATURE)?.trim();
    const timestamp = headerValue(headers, TIMESTAMP);
    if (!signature) return invalid('signature is missing');
    if (!timestamp) return invalid('timestamp is missing');
    const signedAt = Date.parse(timestamp);
    // ISO 8601, as Zendesk sends it (2021-03-25T05:09:27Z). The MAC covers the header's exact characters.
    if (!/^\d{4}-\d{2}-\d{2}T[\d:.]+(Z|[+-]\d{2}:?\d{2})$/.test(timestamp) || Number.isNaN(signedAt)) return invalid('timestamp is not an ISO 8601 time');
    const now = this.options.now?.() ?? Date.now();
    if (Math.abs(now - signedAt) > (this.options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS) * 1000) return invalid('timestamp is outside the tolerance');
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(signature)) return invalid('signature is not base64');
    const offered = Buffer.from(signature, 'base64');
    const matches = secrets.some((key) => {
      const expected = createHmac('sha256', key).update(timestamp).update(rawBody).digest();
      return expected.length === offered.length && timingSafeEqual(expected, offered);
    });
    if (!matches) return invalid('signature mismatch');
    const event = ZendeskEvent.safeParse(parseJson(rawBody));
    return {
      eventId: event.success ? `event:${event.data.id}` : signatureDigest(offered),
      timestampSeconds: Math.floor(signedAt / 1000),
      metadata: { webhookId: headerValue(headers, 'x-zendesk-webhook-id'), invocationId: headerValue(headers, 'x-zendesk-webhook-invocation-id') },
    };
  }
}

/**
 * The authenticator for a `WebhookController` that receives Zendesk webhooks. Each webhook has its own signing
 * secret: pass the secrets of every webhook that posts to the controller (or two of one while rotating it). A
 * delivery that doesn't verify is answered 401.
 *
 * ```ts
 * class ZendeskWebhooks extends WebhookController {
 *   readonly prefix = 'zendesk';
 *   readonly auth = zendeskWebhookAuth(config.zendesk.webhookSecret);
 *   init() {
 *     this.post('events', { mode: 'queue', jobName: 'zendesk-event', eventType: zendeskEventType },
 *       async (_ctx, body) => ZendeskWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function zendeskWebhookAuth(secret: string | string[], options: Omit<ZendeskWebhookAuthOptions, 'secret'> = {}): ZendeskWebhookAuth {
  return new ZendeskWebhookAuth({ ...options, secret });
}

/**
 * What a webhook subscribed to Zendesk events posts. Zendesk delivers at least once (it retries on a 409, a timeout,
 * and a 429 or 503 with a short Retry-After), so the same event can arrive twice: the route dedupes on its `id`.
 */
export const ZendeskWebhookBody = ZendeskEvent;

/**
 * The delivery's event type, for its span: `eventType: zendeskEventType` on the route. A Zendesk event's `type`
 * (`zen:event-type:ticket.created`); for a trigger's own body, its `type` field when the account put one in.
 */
export function zendeskEventType(payload: unknown): string | undefined {
  const type = (payload as { type?: unknown } | null)?.type;
  return typeof type === 'string' && /^[A-Za-z0-9_.:-]{1,100}$/.test(type) ? type : undefined;
}

/** What an event is about, from its `subject`: `zen:ticket:342757` is `{ kind: 'ticket', id: '342757' }`. */
export function zendeskSubject(subject: string): { kind: string; id: string } | undefined {
  const match = /^zen:([a-z_]+):(.+)$/.exec(subject);
  return match ? { kind: match[1]!, id: match[2]! } : undefined;
}

/** Every failure the same way, so `VerifiedWebhookAuth` answers 401; the reason names no secret. */
function invalid(reason: string): never {
  throw new AuthError('webhooks/invalid-signature', `Zendesk webhook: ${reason}`);
}

function parseJson(rawBody: Buffer): unknown {
  try {
    return JSON.parse(rawBody.toString('utf8'));
  } catch {
    return undefined;
  }
}
