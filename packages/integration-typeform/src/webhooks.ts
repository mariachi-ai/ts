import { HmacWebhookAuth } from '@mariachi/webhooks';
import { provider } from './generated';
import { FormResponseEvent } from './schemas';

/**
 * The authenticator for a `WebhookController` that receives Typeform: the `Typeform-Signature` header is
 * `sha256=` and the base64 HMAC-SHA256 of the raw body, keyed with the webhook secret. Pass two secrets while
 * rotating. A delivery that doesn't match is answered 401.
 *
 * ```ts
 * class TypeformWebhooks extends WebhookController {
 *   readonly prefix = 'typeform';
 *   readonly auth = typeformWebhookAuth(config.typeform.webhookSecret);
 *   init() {
 *     this.post('responses', { mode: 'queue', jobName: 'typeform-response', eventType: typeformEventType },
 *       async (_ctx, body) => TypeformWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function typeformWebhookAuth(secret: string | string[]): HmacWebhookAuth {
  return new HmacWebhookAuth({ provider: provider.id, secret, header: 'typeform-signature', encoding: 'base64', prefix: 'sha256=' });
}

/**
 * What Typeform posts when a form is submitted. Typeform retries a delivery that fails, so the same response can
 * arrive more than once: dedupe on `form_response.token` where it's stored.
 */
export const TypeformWebhookBody = FormResponseEvent;

/** The delivery's event type, for its span: `eventType: typeformEventType` on the route. */
export function typeformEventType(payload: unknown): string | undefined {
  const type = (payload as { event_type?: unknown } | null)?.event_type;
  return typeof type === 'string' ? type : undefined;
}
