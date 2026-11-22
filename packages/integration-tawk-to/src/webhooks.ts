import { HmacWebhookAuth } from '@mariachi/webhooks';
import { z } from 'zod';
import { provider } from './generated';
import { ChatEndEvent, ChatStartEvent, ChatTranscriptEvent, TicketCreateEvent } from './schemas';

/**
 * The authenticator for a `WebhookController` that receives Tawk.to: `X-Tawk-Signature` is the hex HMAC-SHA1 of the
 * raw body, keyed with the webhook's secret key. Pass two secrets while rotating. A delivery that doesn't match is
 * answered 401.
 *
 * Deliveries are deduplicated on the signature, which Tawk.to's retries repeat. `X-Hook-Event-Id` (the same across
 * retries, but not signed) is kept in `identity.metadata.deliveryId`.
 *
 * ```ts
 * class TawkToWebhooks extends WebhookController {
 *   readonly prefix = 'tawk-to';
 *   readonly auth = tawkToWebhookAuth(config.tawkTo.webhookSecret);
 *   init() {
 *     this.post('events', { mode: 'queue', jobName: 'tawk-to-event', eventType: tawkToEventType },
 *       async (_ctx, body) => TawkToWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function tawkToWebhookAuth(secret: string | string[]): HmacWebhookAuth {
  return new HmacWebhookAuth({ provider: provider.id, secret, header: 'x-tawk-signature', algorithm: 'sha1', encoding: 'hex', deliveryIdHeader: 'x-hook-event-id' });
}

/**
 * What Tawk.to posts, by its `event`: `chat:start`, `chat:end`, `chat:transcript_created` and `ticket:create`. Tawk.to
 * retries a delivery for up to 12 hours until it's answered 2xx within 30 seconds, so queue the work rather than doing
 * it in the request.
 */
export const TawkToWebhookBody = z.discriminatedUnion('event', [ChatStartEvent, ChatEndEvent, ChatTranscriptEvent, TicketCreateEvent]);
export type TawkToWebhookBody = z.infer<typeof TawkToWebhookBody>;

/** The delivery's event type, for its span: `eventType: tawkToEventType` on the route. */
export function tawkToEventType(payload: unknown): string | undefined {
  const type = (payload as { event?: unknown } | null)?.event;
  return typeof type === 'string' ? type : undefined;
}
