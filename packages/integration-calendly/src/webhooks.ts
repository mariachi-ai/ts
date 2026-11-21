import { createHash } from 'node:crypto';
import { type Secrets, type Verified, VerifiedWebhookAuth, type VerifiedWebhookAuthOptions, type WebhookHeaders, signatureDigest, verifyStripeWebhook } from '@mariachi/webhooks';
import { z } from 'zod';
import { provider } from './generated';
import { Invitee, ScheduledEvent } from './schemas';

const SIGNATURE_HEADER = 'calendly-webhook-signature';
/** Calendly's docs refuse a signature more than three minutes old. */
const THREE_MINUTES = 180;

export interface CalendlyWebhookOptions extends Omit<VerifiedWebhookAuthOptions, 'secret' | 'provider'> {
  /** How old a delivery's signed timestamp may be, in seconds. Default 180, as Calendly recommends. */
  toleranceSeconds?: number;
}

/**
 * The authenticator for a `WebhookController` that receives Calendly. `Calendly-Webhook-Signature` is
 * `t=<Unix seconds>,v1=<hex>`: the HMAC-SHA256, keyed with the subscription's signing key, of `t`, `.` and the raw
 * body (Stripe's scheme, under Calendly's header). A delivery signed more than three minutes ago, or that doesn't
 * match, is answered 401. Pass two keys while rotating.
 *
 * ```ts
 * class CalendlyWebhooks extends WebhookController {
 *   readonly prefix = 'calendly';
 *   readonly auth = calendlyWebhookAuth(config.calendly.webhookSigningKey);
 *   init() {
 *     this.post('events', { mode: 'queue', jobName: 'calendly-event', eventType: calendlyEventType },
 *       async (_ctx, body) => CalendlyWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function calendlyWebhookAuth(signingKey: Secrets, options: CalendlyWebhookOptions = {}): CalendlyWebhookAuth {
  return new CalendlyWebhookAuth({ ...options, secret: signingKey });
}

export class CalendlyWebhookAuth extends VerifiedWebhookAuth {
  private readonly toleranceSeconds: number;

  constructor(options: Omit<VerifiedWebhookAuthOptions, 'provider'> & { toleranceSeconds?: number }) {
    super({ ...options, provider: provider.id }, provider.id);
    this.toleranceSeconds = options.toleranceSeconds ?? THREE_MINUTES;
  }

  /**
   * Deduplicated on `calendlyEventKey` of the signed body, not on the signature: the signature covers the attempt's
   * timestamp, so a retry of the same payload would get a new one.
   */
  protected verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Verified {
    const { timestampSeconds } = verifyStripeWebhook(rawBody, headers, secret, { header: SIGNATURE_HEADER, provider: provider.name, toleranceSeconds: this.toleranceSeconds });
    let eventId: string | undefined;
    try {
      eventId = calendlyEventKey(JSON.parse(rawBody.toString('utf8')));
    } catch {
      // A signed body that isn't JSON has no fields to key on
    }
    return { eventId: eventId ?? signatureDigest(createHash('sha256').update(rawBody).digest()), timestampSeconds };
  }
}

/**
 * The key to handle a delivery once: a digest of its `event`, its resource's URI (`payload.uri`: the invitee, for
 * `invitee.*`) and its `created_at` (when Calendly made the payload), all inside the signed body. Calendly retries a
 * failed delivery for up to 24 hours, and a retried payload keeps the same key. An invitee canceled after being
 * booked is another event; marked a no-show again, another `created_at`. Undefined for a body without those fields.
 */
export function calendlyEventKey(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) return undefined;
  const { event, created_at: createdAt, payload } = body as { event?: unknown; created_at?: unknown; payload?: { uri?: unknown } | null };
  const resource = payload && typeof payload === 'object' ? payload.uri : undefined;
  if (typeof event !== 'string' || typeof createdAt !== 'string' || typeof resource !== 'string') return undefined;
  return `calendly:${createHash('sha256').update(`${event}\n${resource}\n${createdAt}`).digest('hex')}`;
}

/** An invitee as a webhook carries it: the invitee, and their scheduled event in full. */
export const InviteePayload = Invitee.extend({ scheduled_event: ScheduledEvent });
export type InviteePayload = z.infer<typeof InviteePayload>;

const envelope = { created_at: z.string(), created_by: z.string() };

/** `invitee.created` (a booking, or the new half of a reschedule) and `invitee.canceled` (with `rescheduled` on the old half). */
export const InviteeEvent = z.object({ event: z.enum(['invitee.created', 'invitee.canceled']), ...envelope, payload: InviteePayload }).passthrough();
export type InviteeEvent = z.infer<typeof InviteeEvent>;

/**
 * Any other event (`invitee_no_show.*`, `routing_form_submission.created`, `event_type.*`, …): its payload kept as
 * Calendly sent it. Calendly's reference doesn't pin down the no-show payload; read `payload.uri` and fetch what's
 * needed.
 */
export const OtherCalendlyEvent = z
  .object({ event: z.string().refine((e) => e !== 'invitee.created' && e !== 'invitee.canceled'), ...envelope, payload: z.object({ uri: z.string().optional() }).passthrough() })
  .passthrough();
export type OtherCalendlyEvent = z.infer<typeof OtherCalendlyEvent>;

/**
 * What Calendly posts: `{ event, created_at, created_by, payload }`. An invitee event's payload is the invitee with
 * their scheduled event; narrow with `isInviteeEvent(body)`. A reschedule is an `invitee.canceled` (`rescheduled: true`,
 * `new_invitee`) and an `invitee.created` (`old_invitee`): handle each on its own, in whatever order they arrive.
 */
export const CalendlyWebhookBody = z.union([InviteeEvent, OtherCalendlyEvent]);
export type CalendlyWebhookBody = z.infer<typeof CalendlyWebhookBody>;

/** Whether a delivery is `invitee.created` or `invitee.canceled`, so its `payload` is the invitee and their event. */
export function isInviteeEvent(body: CalendlyWebhookBody): body is InviteeEvent {
  return body.event === 'invitee.created' || body.event === 'invitee.canceled';
}

/** The delivery's event type, for its span: `eventType: calendlyEventType` on the route. */
export function calendlyEventType(payload: unknown): string | undefined {
  const event = (payload as { event?: unknown } | null)?.event;
  return typeof event === 'string' ? event : undefined;
}
