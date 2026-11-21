import { HmacWebhookAuth } from '@mariachi/webhooks';
import { provider } from './generated';
import { CalComWebhookBody, FlatMeetingBody, type WebhookPerson, WebhookBookingPayload } from './schemas';

/**
 * The authenticator for a `WebhookController` that receives Cal.com: the `X-Cal-Signature-256` header is the hex
 * HMAC-SHA256 of the raw body, keyed with the webhook secret. Pass two secrets while rotating. A delivery that doesn't
 * match, or comes from a webhook made without a secret, is answered 401.
 *
 * Cal.com signs no delivery id, so a delivery is deduplicated on a digest of its signature: the same body sent twice
 * is handled once. Different deliveries about one booking differ (`createdAt`, the trigger), so make the handler safe
 * to run again for a booking's `uid` and trigger.
 *
 * ```ts
 * class CalComWebhooks extends WebhookController {
 *   readonly prefix = 'cal-com';
 *   readonly auth = calComWebhookAuth(config.calcom.webhookSecret);
 *   init() {
 *     this.post('events', { mode: 'queue', jobName: 'cal-com-event', eventType: calComEventType },
 *       async (_ctx, body) => CalComWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function calComWebhookAuth(secret: string | string[]): HmacWebhookAuth {
  return new HmacWebhookAuth({ provider: provider.id, secret, header: 'x-cal-signature-256', encoding: 'hex' });
}

export { CalComWebhookBody };

/** The delivery's event type (`BOOKING_CREATED`), for its span: `eventType: calComEventType` on the route. */
export function calComEventType(payload: unknown): string | undefined {
  const type = (payload as { triggerEvent?: unknown } | null)?.triggerEvent;
  return typeof type === 'string' ? type : undefined;
}

/** The booking a webhook is about, the same for every event that carries one. */
export interface WebhookBooking {
  triggerEvent: string;
  /** The booking's uid, as in the API. On `BOOKING_RESCHEDULED`, the new booking's. */
  uid: string;
  bookingId?: number;
  title?: string;
  /** ISO times. */
  startTime: string;
  endTime: string;
  /** Upper case (`ACCEPTED`, `CANCELLED`), as webhooks send it. */
  status?: string;
  eventTypeId?: number | null;
  eventTypeSlug?: string;
  organizer?: WebhookPerson;
  attendees: WebhookPerson[];
  /** What the app put on the booking (`metadata` in `bookings.create`, `metadata[key]` in the embed), and Cal.com's own keys such as `videoCallUrl`. */
  metadata: Record<string, unknown>;
  /** On `BOOKING_RESCHEDULED`: the uid of the booking it replaced. */
  rescheduleUid?: string | null;
  cancellationReason?: string | null;
}

/**
 * The booking in a delivery, read the same way whatever its shape: the `payload` of booking events, or the flat body
 * of `MEETING_STARTED` and `MEETING_ENDED`. `undefined` for an event that isn't about one booking in that shape
 * (`BOOKING_NO_SHOW_UPDATED` names just `payload.bookingUid`; forms and out-of-office entries carry no booking).
 */
export function webhookBooking(body: CalComWebhookBody): WebhookBooking | undefined {
  if (body.triggerEvent === 'MEETING_STARTED' || body.triggerEvent === 'MEETING_ENDED') {
    const flat = FlatMeetingBody.safeParse(body);
    if (!flat.success) return undefined;
    const b = flat.data;
    return {
      triggerEvent: b.triggerEvent,
      uid: b.uid,
      bookingId: b.id,
      title: b.title,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,
      eventTypeId: b.eventTypeId,
      organizer: b.user,
      attendees: b.attendees,
      metadata: b.metadata,
    };
  }
  const parsed = WebhookBookingPayload.safeParse(body.payload);
  if (!parsed.success) return undefined;
  const p = parsed.data;
  return {
    triggerEvent: body.triggerEvent,
    uid: p.uid,
    bookingId: p.bookingId,
    title: p.title,
    startTime: p.startTime,
    endTime: p.endTime,
    status: p.status,
    eventTypeId: p.eventTypeId,
    eventTypeSlug: p.type,
    organizer: p.organizer,
    attendees: p.attendees,
    metadata: p.metadata,
    rescheduleUid: p.rescheduleUid,
    cancellationReason: p.cancellationReason,
  };
}
