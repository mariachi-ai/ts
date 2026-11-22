import { createHash, timingSafeEqual } from 'node:crypto';
import { AuthError, ConfigError } from '@mariachi/core';
import { type Secrets, type Verified, VerifiedWebhookAuth, type WebhookHeaders, headerValue, verifyStripeWebhook } from '@mariachi/webhooks';
import { provider } from './generated';
import { WebhookBody } from './schemas';

export const REVENUECAT_SIGNATURE_HEADER = 'x-revenuecat-webhook-signature';

export interface RevenueCatWebhookAuthOptions {
  /**
   * The HMAC signing secret (`REVENUECAT_WEBHOOK_SIGNING_SECRET`), when HMAC webhook signing is on. Two while
   * rotating. Prefer it: it covers the body and a timestamp.
   */
  signingSecret?: string | string[];
  /** The Authorization header value set in the dashboard (`REVENUECAT_WEBHOOK_AUTH`). Two while rotating. */
  authorization?: string | string[];
  /** How far the signed timestamp may be from now, in seconds. Default 300. */
  toleranceSeconds?: number;
}

/**
 * RevenueCat's webhooks, for a `WebhookController`. With a signing secret, the `X-RevenueCat-Webhook-Signature`
 * header (`t=…,v1=…`, the hex HMAC-SHA256 of `"<t>.<raw body>"`) must hold, within five minutes. With an
 * authorization value, the `Authorization` header must equal it, compared in constant time. Give both and both
 * are checked. A delivery that fails is answered 401. Deliveries are deduplicated on the body's `event.id`, which
 * RevenueCat keeps the same on every retry.
 */
export class RevenueCatWebhookAuth extends VerifiedWebhookAuth {
  private readonly signing?: string[];
  private readonly authorization?: Buffer[];

  constructor(private readonly options: RevenueCatWebhookAuthOptions) {
    const signing = values(options.signingSecret);
    const authorization = values(options.authorization);
    if (!signing && !authorization) {
      throw new ConfigError('webhooks/invalid-secret', 'revenuecat webhook: set the signing secret (REVENUECAT_WEBHOOK_SIGNING_SECRET) or the authorization header (REVENUECAT_WEBHOOK_AUTH)');
    }
    super({ secret: signing ?? authorization ?? [] }, provider.id);
    this.signing = signing;
    this.authorization = authorization?.map(digest);
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders, _secret: Secrets): Verified {
    if (this.signing) {
      verifyStripeWebhook(rawBody, headers, this.signing, { header: REVENUECAT_SIGNATURE_HEADER, provider: 'RevenueCat', toleranceSeconds: this.options.toleranceSeconds });
    }
    if (this.authorization) {
      const sent = headerValue(headers, 'authorization');
      // Compared as digests, so neither the value nor its length leaks through timing.
      const matches = sent !== undefined && this.authorization.some((expected) => timingSafeEqual(digest(sent), expected));
      if (!matches) throw new AuthError('webhooks/invalid-signature', 'RevenueCat webhook: authorization header mismatch');
    }
    return { eventId: eventIdOf(rawBody) ?? `body:${createHash('sha256').update(rawBody).digest('hex')}` };
  }
}

/**
 * The authenticator for RevenueCat's webhooks: pass the signing secret, the authorization value, or both.
 *
 * ```ts
 * class RevenueCatWebhooks extends WebhookController {
 *   readonly prefix = 'revenuecat';
 *   readonly auth = revenueCatWebhookAuth({ signingSecret: config.revenuecat.webhookSigningSecret, authorization: config.revenuecat.webhookAuthorization });
 *   init() {
 *     this.post('events', { mode: 'queue', jobName: 'revenuecat-event', eventType: revenueCatEventType },
 *       async (_ctx, body) => RevenueCatWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function revenueCatWebhookAuth(options: RevenueCatWebhookAuthOptions): RevenueCatWebhookAuth {
  return new RevenueCatWebhookAuth(options);
}

/**
 * What RevenueCat posts: `{ api_version, event }`. Delivery is at least once, so dedupe on `event.id`. Don't decide
 * access from the event's fields: fetch the customer again (`customers.get`, for each of `customersToRefresh(event)`)
 * and read its entitlements, as RevenueCat recommends.
 */
export const RevenueCatWebhookBody = WebhookBody;

/** The delivery's event type (`INITIAL_PURCHASE`), for its span: `eventType: revenueCatEventType` on the route. */
export function revenueCatEventType(payload: unknown): string | undefined {
  const type = (payload as { event?: { type?: unknown } } | null)?.event?.type;
  return typeof type === 'string' ? type : undefined;
}

function values(secret: string | string[] | undefined): string[] | undefined {
  const list = (Array.isArray(secret) ? secret : secret === undefined ? [] : [secret]).filter((s) => typeof s === 'string' && s.trim() !== '');
  return list.length ? list : undefined;
}

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

function eventIdOf(rawBody: Buffer): string | undefined {
  try {
    const id = (JSON.parse(rawBody.toString('utf8')) as { event?: { id?: unknown } }).event?.id;
    return typeof id === 'string' && id ? id : undefined;
  } catch {
    return undefined;
  }
}
