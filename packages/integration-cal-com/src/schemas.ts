import { z } from 'zod';
import { webhookEvents } from './generated';

/**
 * Cal.com's shapes, as far as an app reads them. Cal.com's objects pass unknown fields through (`passthrough`), so a
 * field Cal.com adds doesn't fail the boundary; a field the app relies on that goes missing does.
 */

// ---------------------------------------------------------------------------------------------------------------
// Values the inputs check

/** An IANA time zone (`Europe/Rome`), the way Cal.com takes them. */
const TimeZone = z
  .string()
  .min(1)
  .refine((tz) => {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }, 'not an IANA time zone, such as Europe/Rome');

/**
 * A moment, sent to Cal.com in UTC. Cal.com reads a booking's start as UTC whatever offset it carries, so a
 * `2026-12-01T11:00:00+02:00` is turned into `2026-12-01T09:00:00.000Z` here rather than booked two hours late.
 */
const Instant = z.union([z.date(), z.string().datetime({ offset: true })]).transform((v) => new Date(v).toISOString());

/** A day (`2026-12-01`: the start or end of that day in UTC, as Cal.com reads it) or a moment, sent in UTC. */
const RangeBound = z.union([z.string().date(), Instant]);

const Email = z.string().email();

/**
 * What an app keeps on a booking, such as its own reference for the user who booked. Cal.com allows 50 keys of at
 * most 40 characters, with string values of at most 500. It comes back in the booking and in every webhook.
 */
export const BookingMetadata = z
  .record(z.string().min(1).max(40), z.string().max(500))
  .refine((m) => Object.keys(m).length <= 50, 'at most 50 metadata keys');
export type BookingMetadata = z.infer<typeof BookingMetadata>;

/** Which event type: its id, or its slug with the username (or team slug) that owns it. */
const EventTypeRef = {
  eventTypeId: z.number().int().positive().optional(),
  eventTypeSlug: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  teamSlug: z.string().min(1).optional(),
  /** Only for a user or team inside a Cal.com organization. */
  organizationSlug: z.string().min(1).optional(),
};

function namesEventType(i: { eventTypeId?: number; eventTypeSlug?: string; username?: string; teamSlug?: string }, ctx: z.RefinementCtx) {
  if (i.eventTypeId === undefined && !(i.eventTypeSlug && (i.username || i.teamSlug))) {
    ctx.addIssue({ code: 'custom', path: ['eventTypeId'], message: 'give eventTypeId, or eventTypeSlug with username or teamSlug' });
  }
}

// ---------------------------------------------------------------------------------------------------------------
// What Cal.com answers

export const Me = z
  .object({
    id: z.number(),
    /** The user's handle in booking links: `https://cal.com/<username>/<event slug>`. */
    username: z.string().nullable(),
    email: z.string(),
    name: z.string().nullable(),
    timeZone: z.string(),
  })
  .passthrough();
export type Me = z.infer<typeof Me>;

export const EventType = z
  .object({
    id: z.number(),
    slug: z.string(),
    title: z.string(),
    lengthInMinutes: z.number(),
    /** The other lengths a booker may choose, when the event type offers several. */
    lengthInMinutesOptions: z.array(z.number()).optional(),
    description: z.string().nullable().optional(),
    hidden: z.boolean().optional(),
    /** The event type's public booking page. Prefer it to building one: it's right for teams and organizations too. */
    bookingUrl: z.string().optional(),
    /** The questions the booking form asks; answer custom ones in `bookingFieldsResponses`, by `slug`. */
    bookingFields: z.array(z.object({ slug: z.string().optional(), type: z.string().optional(), required: z.boolean().optional() }).passthrough()).optional(),
  })
  .passthrough();
export type EventType = z.infer<typeof EventType>;

/** One free slot as Cal.com lists it, in the time zone asked for. `end` is there because the client asks for ranges. */
export const Slot = z.union([
  z.string().transform((start) => ({ start }) as { start: string; end?: string }),
  z.object({ start: z.string(), end: z.string().optional(), attendeesCount: z.number().optional(), bookingUid: z.string().optional() }).passthrough(),
]);
export type Slot = z.infer<typeof Slot>;

/** Free slots by date (`2026-12-01`), each date's in order. `slotList` makes them one list in UTC. */
export const SlotsByDate = z.record(z.array(Slot));
export type SlotsByDate = z.infer<typeof SlotsByDate>;

export const Attendee = z
  .object({
    name: z.string(),
    /** As the booker typed it: compare it lowercased (`attendeeEmails`). */
    email: z.string(),
    timeZone: z.string(),
    absent: z.boolean().optional(),
    phoneNumber: z.string().optional(),
    language: z.string().optional(),
    /** For a seated event type: the attendee's seat, to cancel or move just it. */
    seatUid: z.string().optional(),
  })
  .passthrough();
export type Attendee = z.infer<typeof Attendee>;

export const Host = z
  .object({ id: z.number(), name: z.string().nullable().optional(), email: z.string(), username: z.string().nullable().optional(), timeZone: z.string().optional() })
  .passthrough();
export type Host = z.infer<typeof Host>;

export const BOOKING_STATUSES = ['accepted', 'pending', 'cancelled', 'rejected', 'awaiting_host'] as const;

export const Booking = z
  .object({
    id: z.number(),
    /** The booking's stable id: the one every other operation and the webhooks use. */
    uid: z.string(),
    title: z.string(),
    /** `pending` waits for the host to confirm; `awaiting_host` is an instant meeting waiting for a host to join. */
    status: z.enum(BOOKING_STATUSES),
    /** ISO times in UTC. */
    start: z.string(),
    end: z.string(),
    duration: z.number(),
    eventType: z.object({ id: z.number(), slug: z.string() }).passthrough().optional(),
    hosts: z.array(Host).default([]),
    /** The booker first, then any guests who were added as attendees. */
    attendees: z.array(Attendee).default([]),
    guests: z.array(z.string()).optional(),
    location: z.string().nullable().optional(),
    metadata: z.record(z.unknown()).default({}),
    cancellationReason: z.string().nullable().optional(),
    /** On a booking made by rescheduling: the one it replaced. */
    rescheduledFromUid: z.string().nullable().optional(),
    /** On a booking that was rescheduled (and so cancelled): the one that replaced it. */
    rescheduledToUid: z.string().nullable().optional(),
    /** On each occurrence of a recurring booking: the series' uid. */
    recurringBookingUid: z.string().optional(),
    createdAt: z.string(),
  })
  .passthrough();
export type Booking = z.infer<typeof Booking>;

/** One booking, or every occurrence of a recurring one (create, get by a recurring uid, cancel a series). */
export const BookingData = z.union([Booking, z.array(Booking)]);
export type BookingData = z.infer<typeof BookingData>;

export const BookingPage = z
  .object({ data: z.array(Booking), pagination: z.object({ nextCursor: z.string().nullable(), hasMore: z.boolean() }).passthrough() })
  .transform((r) => ({ items: r.data, nextCursor: r.pagination.nextCursor, hasMore: r.pagination.hasMore }));
export type BookingPage = z.output<typeof BookingPage>;

/** A webhook as Cal.com lists it. Its secret is never read back. */
export const Webhook = z.object({
  id: z.number(),
  subscriberUrl: z.string(),
  triggers: z.array(z.string()),
  active: z.boolean(),
  version: z.string().optional(),
  payloadTemplate: z.string().nullable().optional(),
});
export type Webhook = z.infer<typeof Webhook>;

// ---------------------------------------------------------------------------------------------------------------
// What the app sends

export const ListEventTypesInput = z.object({
  /** Another user's public event types. Leave it out for the API key's own, hidden ones included. */
  username: z.string().min(1).optional(),
  /** With `username`: just that event type. */
  eventSlug: z.string().min(1).optional(),
});
export type ListEventTypesInput = z.infer<typeof ListEventTypesInput>;

export const ListSlotsInput = z
  .object({
    ...EventTypeRef,
    /** From this day or moment (a day is its start in UTC). */
    start: RangeBound,
    /** Up to this day or moment (a day is its end in UTC). */
    end: RangeBound,
    /** The time zone the slots are listed in and grouped by date in. Defaults to UTC. */
    timeZone: TimeZone.optional(),
    /** Minutes, for an event type that offers several lengths. */
    duration: z.number().int().positive().optional(),
    /** When rescheduling: that booking's time counts as free. */
    bookingUidToReschedule: z.string().min(1).optional(),
  })
  .superRefine(namesEventType);
export type ListSlotsInput = z.input<typeof ListSlotsInput>;

export const CreateBookingInput = z
  .object({
    ...EventTypeRef,
    /** When it starts: any offset, sent in UTC. Take it from `slotList`. */
    start: Instant,
    attendee: z.object({
      name: z.string().min(1),
      /** Leave it out only for an event type that books by phone. The app matches bookings to its users by it. */
      email: Email.optional(),
      /** The attendee's own time zone, for their emails and calendar invite. */
      timeZone: TimeZone,
      phoneNumber: z.string().min(1).optional(),
      language: z.string().min(2).optional(),
    }),
    /** Other people's emails, invited too. */
    guests: z.array(Email).optional(),
    /** Minutes, for an event type that offers several lengths. */
    lengthInMinutes: z.number().int().positive().optional(),
    metadata: BookingMetadata.optional(),
    /** Answers to the event type's custom booking fields, by each field's slug. */
    bookingFieldsResponses: z.record(z.unknown()).optional(),
    /** One of the event type's locations, as Cal.com's location object (`{ type: 'link' }`, `{ type: 'integration', integration }`…). */
    location: z.object({ type: z.string().min(1) }).passthrough().optional(),
  })
  .superRefine(namesEventType);
export type CreateBookingInput = z.input<typeof CreateBookingInput>;

export const ListBookingsInput = z.object({
  /** One status; leave it out for all. */
  status: z.enum(['upcoming', 'recurring', 'past', 'cancelled', 'unconfirmed']).optional(),
  attendeeEmail: z.string().min(1).optional(),
  attendeeName: z.string().min(1).optional(),
  eventTypeId: z.number().int().positive().optional(),
  afterStart: Instant.optional(),
  beforeEnd: Instant.optional(),
  afterCreatedAt: Instant.optional(),
  beforeCreatedAt: Instant.optional(),
  /** Bookings changed since then (made, moved, cancelled): for catching up after a gap in webhooks. */
  afterUpdatedAt: Instant.optional(),
  beforeUpdatedAt: Instant.optional(),
  sortStart: z.enum(['asc', 'desc']).optional(),
  sortCreated: z.enum(['asc', 'desc']).optional(),
  sortUpdatedAt: z.enum(['asc', 'desc']).optional(),
  /** `nextCursor` from the page before. */
  cursor: z.string().min(1).optional(),
  /** At most 100; Cal.com's default is 50. */
  limit: z.number().int().min(1).max(100).optional(),
});
export type ListBookingsInput = z.infer<typeof ListBookingsInput>;

const BookingUid = z.string().min(1);

export const CancelBookingInput = z.object({
  bookingUid: BookingUid,
  cancellationReason: z.string().min(1).optional(),
  /** For one occurrence of a recurring booking: cancel it and every one after it. */
  cancelSubsequentBookings: z.boolean().optional(),
  /** For a seated booking: cancel just this attendee's seat. */
  seatUid: z.string().min(1).optional(),
});
export type CancelBookingInput = z.infer<typeof CancelBookingInput>;

export const RescheduleBookingInput = z.object({
  bookingUid: BookingUid,
  /** The new start: any offset, sent in UTC. */
  start: Instant,
  reschedulingReason: z.string().min(1).optional(),
  /** Who is moving it. Only needed for an event type that requires confirmation: the owner's email keeps it confirmed. */
  rescheduledBy: Email.optional(),
  lengthInMinutes: z.number().int().positive().optional(),
  /** For a seated booking: move just this attendee's seat. */
  seatUid: z.string().min(1).optional(),
});
export type RescheduleBookingInput = z.input<typeof RescheduleBookingInput>;

export const DeclineBookingInput = z.object({ bookingUid: BookingUid, reason: z.string().min(1).optional() });
export type DeclineBookingInput = z.infer<typeof DeclineBookingInput>;

export const CreateWebhookInput = z.object({
  /** HTTPS on Cal.com's cloud. */
  subscriberUrl: z.string().url(),
  triggers: z.array(z.enum(webhookEvents)).min(1),
  active: z.boolean().default(true),
  /** The payload format; leave it out for Cal.com's default. `2026-07-27` adds calendar invites to booking events. */
  version: z.enum(['2021-10-20', '2026-07-27']).optional(),
});
export type CreateWebhookInput = z.input<typeof CreateWebhookInput>;

export const ListWebhooksInput = z.object({ take: z.number().int().min(1).max(250).optional(), skip: z.number().int().min(0).optional() });
export type ListWebhooksInput = z.infer<typeof ListWebhooksInput>;

// ---------------------------------------------------------------------------------------------------------------
// What Cal.com posts

/** A person in a webhook: the organizer, or an attendee. */
export const WebhookPerson = z
  .object({ name: z.string().nullable().optional(), email: z.string(), timeZone: z.string().optional(), username: z.string().nullable().optional() })
  .passthrough();
export type WebhookPerson = z.infer<typeof WebhookPerson>;

/**
 * Every delivery: `triggerEvent`, and for most events `createdAt` and the event's `payload`. `MEETING_STARTED` and
 * `MEETING_ENDED` are flat instead, with the booking's fields beside `triggerEvent`; `webhookBooking` reads both.
 */
export const CalComWebhookBody = z.object({ triggerEvent: z.string(), createdAt: z.string().optional(), payload: z.record(z.unknown()).optional() }).passthrough();
export type CalComWebhookBody = z.infer<typeof CalComWebhookBody>;

/** The booking in a booking event's `payload` (`BOOKING_CREATED`, `BOOKING_CANCELLED`…). */
export const WebhookBookingPayload = z
  .object({
    uid: z.string(),
    bookingId: z.number().optional(),
    title: z.string().optional(),
    startTime: z.string(),
    endTime: z.string(),
    /** Upper case here (`ACCEPTED`), unlike the API. */
    status: z.string().optional(),
    eventTypeId: z.number().nullable().optional(),
    /** The event type's slug. */
    type: z.string().optional(),
    organizer: WebhookPerson.optional(),
    attendees: z.array(WebhookPerson).default([]),
    metadata: z.record(z.unknown()).default({}),
    /** On `BOOKING_RESCHEDULED`: the booking this one replaced. */
    rescheduleUid: z.string().nullable().optional(),
    cancellationReason: z.string().nullable().optional(),
    responses: z.record(z.unknown()).optional(),
  })
  .passthrough();

/** The booking in a flat `MEETING_STARTED` or `MEETING_ENDED` body. */
export const FlatMeetingBody = z
  .object({
    triggerEvent: z.string(),
    id: z.number().optional(),
    uid: z.string(),
    title: z.string().optional(),
    startTime: z.string(),
    endTime: z.string(),
    status: z.string().optional(),
    eventTypeId: z.number().nullable().optional(),
    user: WebhookPerson.optional(),
    attendees: z.array(WebhookPerson).default([]),
    metadata: z.record(z.unknown()).default({}),
  })
  .passthrough();
