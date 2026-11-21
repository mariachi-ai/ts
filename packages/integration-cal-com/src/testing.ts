/**
 * `@mariachi/integration-cal-com/testing`: a Cal.com for an app's tests, held in memory, with the same shape as
 * `createCalCom`'s client; builders for its objects; and signed webhooks to post to the app's endpoint.
 */
import { createHmac, randomUUID } from 'node:crypto';
import type { CalCom } from './client';
import { CalComError } from './errors';
import type { CalComWebhookEvent } from './generated';
import type { Booking, EventType, Me, SlotsByDate, Webhook } from './schemas';

export interface FakeCalCom extends CalCom {
  me_: Me;
  eventTypes_: Map<number, EventType>;
  /** Free slots by event type id, as `slots.list` answers them. */
  slots_: Map<number, SlotsByDate>;
  bookings_: Map<string, Booking>;
  webhooks_: Map<number, Webhook>;
}

/**
 * An in-memory Cal.com: seed event types and their free slots, then hand it to the code under test in place of the
 * client. Bookings it makes are `accepted`; cancel, reschedule, confirm and decline change them as Cal.com would.
 */
export function fakeCalCom(seed: { me?: Partial<Me>; eventTypes?: EventType[]; slots?: Record<number, SlotsByDate>; bookings?: Booking[] } = {}): FakeCalCom {
  const me_: Me = { id: 1, username: 'host', email: 'host@example.com', name: 'Host', timeZone: 'UTC', ...seed.me };
  const eventTypes_ = new Map((seed.eventTypes ?? []).map((e) => [e.id, e]));
  const slots_ = new Map(Object.entries(seed.slots ?? {}).map(([id, s]) => [Number(id), s]));
  const bookings_ = new Map((seed.bookings ?? []).map((b) => [b.uid, b]));
  const webhooks_ = new Map<number, Webhook>();
  let nextId = 1000;

  const eventTypeOf = (input: { eventTypeId?: number; eventTypeSlug?: string }) => {
    const found = input.eventTypeId !== undefined ? eventTypes_.get(input.eventTypeId) : [...eventTypes_.values()].find((e) => e.slug === input.eventTypeSlug);
    if (!found) throw notFound('event type');
    return found;
  };
  const bookingOf = (uid: string) => {
    const found = bookings_.get(uid);
    if (!found) throw notFound('booking');
    return found;
  };
  const save = (b: Booking) => {
    bookings_.set(b.uid, b);
    return b;
  };
  const utc = (v: string | Date) => new Date(v).toISOString();

  const fake: FakeCalCom = {
    me_,
    eventTypes_,
    slots_,
    bookings_,
    webhooks_,
    me: {
      async get() {
        return me_;
      },
    },
    eventTypes: {
      async list(_ctx, input = {}) {
        return [...eventTypes_.values()].filter((e) => !input.eventSlug || e.slug === input.eventSlug);
      },
      async get(_ctx, eventTypeId) {
        return eventTypeOf({ eventTypeId });
      },
    },
    slots: {
      async list(_ctx, input) {
        return slots_.get(eventTypeOf(input).id) ?? {};
      },
    },
    bookings: {
      async create(_ctx, input) {
        const eventType = eventTypeOf(input);
        const minutes = input.lengthInMinutes ?? eventType.lengthInMinutes;
        const start = utc(input.start);
        if ([...bookings_.values()].some((b) => b.eventType?.id === eventType.id && b.start === start && b.status !== 'cancelled' && b.status !== 'rejected')) {
          throw new CalComError('cal-com/invalid-request', 'cal-com bookings.create failed (400)', { category: 'invalid-request', status: 400 });
        }
        return save(
          calComBooking({
            id: nextId++,
            title: eventType.title,
            start,
            end: new Date(Date.parse(start) + minutes * 60_000).toISOString(),
            duration: minutes,
            eventType: { id: eventType.id, slug: eventType.slug },
            hosts: [{ id: me_.id, name: me_.name, email: me_.email, username: me_.username, timeZone: me_.timeZone }],
            attendees: [{ name: input.attendee.name, email: input.attendee.email ?? '', timeZone: input.attendee.timeZone, absent: false }],
            guests: input.guests,
            metadata: { ...input.metadata },
          }),
        );
      },
      async get(_ctx, bookingUid) {
        return bookingOf(bookingUid);
      },
      async list(_ctx, input = {}) {
        const now = new Date().toISOString();
        const items = [...bookings_.values()]
          .filter((b) => !input.attendeeEmail || b.attendees.some((a) => a.email.toLowerCase() === input.attendeeEmail?.toLowerCase()))
          .filter((b) => !input.eventTypeId || b.eventType?.id === input.eventTypeId)
          .filter((b) => !input.afterStart || b.start >= utc(input.afterStart))
          .filter((b) => {
            switch (input.status) {
              case 'upcoming':
                return b.end >= now && b.status !== 'cancelled' && b.status !== 'rejected';
              case 'past':
                return b.end < now;
              case 'cancelled':
                return b.status === 'cancelled' || b.status === 'rejected';
              case 'unconfirmed':
                return b.status === 'pending';
              default:
                return true;
            }
          })
          .sort((a, b) => a.start.localeCompare(b.start));
        return { items: items.slice(0, input.limit ?? 50), nextCursor: null, hasMore: false };
      },
      async *all(ctx, input = {}) {
        yield* (await fake.bookings.list(ctx, { ...input, limit: 100 })).items;
      },
      async cancel(_ctx, input) {
        return save({ ...bookingOf(input.bookingUid), status: 'cancelled', cancellationReason: input.cancellationReason });
      },
      async reschedule(_ctx, input) {
        const old = bookingOf(input.bookingUid);
        const start = utc(input.start);
        const minutes = input.lengthInMinutes ?? old.duration;
        const moved = calComBooking({ ...old, id: nextId++, uid: randomUUID(), start, end: new Date(Date.parse(start) + minutes * 60_000).toISOString(), duration: minutes, rescheduledFromUid: old.uid });
        save({ ...old, status: 'cancelled', rescheduledToUid: moved.uid });
        return save(moved);
      },
      async confirm(_ctx, bookingUid) {
        return save({ ...bookingOf(bookingUid), status: 'accepted' });
      },
      async decline(_ctx, input) {
        return save({ ...bookingOf(input.bookingUid), status: 'rejected' });
      },
    },
    webhooks: {
      async create(_ctx, input) {
        const hook: Webhook = { id: nextId++, subscriberUrl: input.subscriberUrl, triggers: [...input.triggers], active: input.active ?? true, version: input.version ?? '2021-10-20' };
        webhooks_.set(hook.id, hook);
        return hook;
      },
      async list() {
        return [...webhooks_.values()];
      },
      async delete(_ctx, webhookId) {
        if (!webhooks_.delete(webhookId)) throw notFound('webhook');
      },
    },
  };
  return fake;
}

/** Fails as the client does when Cal.com answers 404, so an app's error handling is tested against the real error. */
function notFound(what: string): CalComError {
  return new CalComError('cal-com/not-found', `Cal.com ${what} not found (404)`, { category: 'not-found', status: 404 });
}

/** An event type to seed the fake with. */
export function calComEventType(overrides: Partial<EventType> = {}): EventType {
  const id = overrides.id ?? 10;
  const slug = overrides.slug ?? 'intro';
  return { id, slug, title: 'Intro call', lengthInMinutes: 30, hidden: false, bookingUrl: `https://cal.com/host/${slug}`, ...overrides };
}

/** A booking, as the API answers it: to seed the fake, or to post in a test webhook. */
export function calComBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 1,
    uid: randomUUID(),
    title: 'Intro call',
    status: 'accepted',
    start: '2026-12-01T09:00:00.000Z',
    end: '2026-12-01T09:30:00.000Z',
    duration: 30,
    eventType: { id: 10, slug: 'intro' },
    hosts: [{ id: 1, name: 'Host', email: 'host@example.com', username: 'host', timeZone: 'UTC' }],
    attendees: [{ name: 'Ada Lovelace', email: 'ada@example.com', timeZone: 'Europe/London', absent: false }],
    metadata: {},
    createdAt: '2026-11-21T10:00:00.000Z',
    ...overrides,
  };
}

/**
 * The body Cal.com would post for this booking and trigger: the booking in `payload`, or flat for `MEETING_STARTED`
 * and `MEETING_ENDED`, as Cal.com sends them. Sign it with `signedCalComWebhook`.
 */
export function calComBookingEvent(triggerEvent: CalComWebhookEvent, booking: Booking, extra: Record<string, unknown> = {}): Record<string, unknown> {
  const host = booking.hosts[0];
  const people = booking.attendees.map((a) => ({ name: a.name, email: a.email, timeZone: a.timeZone }));
  const status = { accepted: 'ACCEPTED', pending: 'PENDING', cancelled: 'CANCELLED', rejected: 'REJECTED', awaiting_host: 'AWAITING_HOST' }[booking.status];
  if (triggerEvent === 'MEETING_STARTED' || triggerEvent === 'MEETING_ENDED') {
    return {
      triggerEvent,
      id: booking.id,
      uid: booking.uid,
      eventTypeId: booking.eventType?.id ?? null,
      title: booking.title,
      startTime: booking.start,
      endTime: booking.end,
      status,
      metadata: booking.metadata,
      user: host ? { email: host.email, name: host.name, timeZone: host.timeZone, username: host.username } : undefined,
      attendees: people,
      ...extra,
    };
  }
  return {
    triggerEvent,
    createdAt: new Date().toISOString(),
    payload: {
      uid: booking.uid,
      bookingId: booking.id,
      title: booking.title,
      type: booking.eventType?.slug,
      eventTypeId: booking.eventType?.id ?? null,
      startTime: booking.start,
      endTime: booking.end,
      status,
      organizer: host ? { id: host.id, name: host.name, email: host.email, username: host.username, timeZone: host.timeZone } : undefined,
      attendees: people,
      metadata: booking.metadata,
      ...(booking.cancellationReason ? { cancellationReason: booking.cancellationReason } : {}),
      ...extra,
    },
  };
}

/** The raw body and `X-Cal-Signature-256` header Cal.com would send for this body. */
export function signedCalComWebhook(body: Record<string, unknown>, secret: string): { rawBody: string; headers: Record<string, string> } {
  const rawBody = JSON.stringify(body);
  return { rawBody, headers: { 'x-cal-signature-256': createHmac('sha256', secret).update(rawBody).digest('hex') } };
}
