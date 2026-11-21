import { type Secrets, type Verified, VerifiedWebhookAuth, type WebhookHeaders, headerValue, verifyHmacSignature } from '@mariachi/webhooks';
import { provider } from './generated';
import { Notification } from './schemas';

/**
 * Intercom's scheme: `X-Hub-Signature` is `sha1=` and the hex HMAC-SHA1 of the raw body, keyed with the app's client
 * secret. A retried notification keeps its `id` but not its body (`delivery_attempts` changes), so deliveries are
 * deduplicated on the signed body's `id`, not on the signature.
 */
export class IntercomWebhookAuth extends VerifiedWebhookAuth {
  constructor(secret: Secrets) {
    super({ secret }, provider.id);
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Verified {
    const { eventId } = verifyHmacSignature(rawBody, headerValue(headers, 'x-hub-signature'), secret, { algorithm: 'sha1', encoding: 'hex', prefix: 'sha1=', provider: provider.id });
    const body = parseJson(rawBody) as { id?: unknown; topic?: unknown } | undefined;
    return { eventId: typeof body?.id === 'string' ? body.id : eventId, metadata: { topic: typeof body?.topic === 'string' ? body.topic : undefined } };
  }
}

/**
 * The authenticator for a `WebhookController` that receives Intercom's notifications, keyed with the app's client
 * secret (`INTERCOM_CLIENT_SECRET`). Pass two secrets while rotating. A delivery that doesn't match is answered 401.
 *
 * ```ts
 * class IntercomWebhooks extends WebhookController {
 *   readonly prefix = 'intercom';
 *   readonly auth = intercomWebhookAuth(config.intercom.clientSecret);
 *   init() {
 *     this.post('notifications', { mode: 'queue', jobName: 'intercom-notification', eventType: intercomEventType },
 *       async (_ctx, body) => IntercomWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function intercomWebhookAuth(secret: Secrets): IntercomWebhookAuth {
  return new IntercomWebhookAuth(secret);
}

/**
 * What Intercom posts: `topic` says what happened, `data.item` is the object it's about (a conversation for
 * `conversation.*`, a contact for `contact.*`; read it with `Conversation.parse` or `Contact.parse`). Intercom
 * doesn't keep notifications in order: compare `created_at`.
 */
export const IntercomWebhookBody = Notification;

/** The notification's topic, for its span: `eventType: intercomEventType` on the route. */
export function intercomEventType(payload: unknown): string | undefined {
  const topic = (payload as { topic?: unknown } | null)?.topic;
  return typeof topic === 'string' ? topic : undefined;
}

function parseJson(rawBody: Buffer): unknown {
  try {
    return JSON.parse(rawBody.toString('utf8'));
  } catch {
    return undefined;
  }
}
