import { type Context, fromZodError } from '@mariachi/core';
import { type ProviderDeps, type ProviderRequest, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { CAL_API_VERSIONS } from './api-versions';
import { CalComError } from './errors';
import { type CalComConfig, type CalComOperation, configSchema, provider } from './generated';
import {
  type Booking,
  BookingData,
  BookingPage,
  CancelBookingInput,
  CreateBookingInput,
  CreateWebhookInput,
  DeclineBookingInput,
  EventType,
  ListBookingsInput,
  ListEventTypesInput,
  ListSlotsInput,
  ListWebhooksInput,
  Me,
  RescheduleBookingInput,
  SlotsByDate,
  Webhook,
} from './schemas';

export interface CalComDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

/** Cal.com answers `{ status: 'success', data }`: the operations return `data`. */
const data = <S extends z.ZodTypeAny>(schema: S) => z.object({ data: schema }).transform((r) => r.data as z.output<S>);

/**
 * The Cal.com client: each operation takes `ctx` first, checks its input and Cal.com's answer, sends the
 * `cal-api-version` that endpoint asks for (`CAL_API_VERSIONS`), and makes one span (`cal-com bookings.create`). Build
 * it once at startup and share it.
 *
 * ```ts
 * const calcom = createCalCom(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * const free = slotList(await calcom.slots.list(ctx, { eventTypeId, start: '2026-12-01', end: '2026-12-07' }));
 * ```
 */
export function createCalCom(config: CalComConfig, deps: CalComDeps = {}) {
  const cfg = configSchema.parse(config);
  const base = (cfg.apiBaseUrl ?? provider.baseUrl).replace(/\/+$/, '');
  const server = new URL(base).host;

  function call<T>(ctx: Context, operation: CalComOperation, request: Omit<ProviderRequest, 'url' | 'headers'> & { path: string }, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    const { path, ...rest } = request;
    const version = CAL_API_VERSIONS[operation];
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server },
      { ...rest, url: `${base}${path}`, headers: { authorization: `Bearer ${cfg.apiKey}`, ...(version ? { 'cal-api-version': version } : {}) } },
      // Cal.com documents no error codes, so the status decides the category; its message is never kept.
      { schema, error: CalComError, deps },
    );
  }

  const me = {
    /** The user the API key belongs to: `username` is what their booking links start with. */
    async get(ctx: Context) {
      return call(ctx, 'me.get', { method: 'GET', path: '/me' }, data(Me));
    },
  };

  const eventTypes = {
    /** The API key's own event types (hidden ones too), or another user's public ones by `username`. */
    async list(ctx: Context, input: ListEventTypesInput = {}) {
      const i = parse(ListEventTypesInput, input);
      return call(ctx, 'eventTypes.list', { method: 'GET', path: '/event-types', query: { username: i.username, eventSlug: i.eventSlug } }, data(z.array(EventType)));
    },
    /** One event type by its id, with its `bookingUrl` and booking fields. */
    async get(ctx: Context, eventTypeId: number) {
      const id = parse(z.number().int().positive(), eventTypeId);
      return call(ctx, 'eventTypes.get', { method: 'GET', path: `/event-types/${id}` }, data(EventType));
    },
  };

  const slots = {
    /**
     * The event type's free slots from `start` to `end`, by date, each with its start and end in `timeZone` (UTC when
     * left out). Show them grouped by date, or make them one list in UTC with `slotList`. A date with no free slot isn't
     * there; no free slot at all is `{}`.
     */
    async list(ctx: Context, input: ListSlotsInput) {
      const i = parse(ListSlotsInput, input);
      return call(
        ctx,
        'slots.list',
        {
          method: 'GET',
          path: '/slots',
          query: {
            eventTypeId: i.eventTypeId,
            eventTypeSlug: i.eventTypeSlug,
            username: i.username,
            teamSlug: i.teamSlug,
            organizationSlug: i.organizationSlug,
            start: i.start,
            end: i.end,
            timeZone: i.timeZone,
            duration: i.duration,
            bookingUidToReschedule: i.bookingUidToReschedule,
            format: 'range',
          },
        },
        data(SlotsByDate),
      );
    },
  };

  const bookings = {
    /**
     * Books the event type at `start` (sent in UTC) for the attendee; Cal.com sends the invites. The answer is the
     * booking, or every occurrence when the event type is recurring.
     *
     * Cal.com takes no idempotency key, so this is never retried after an outage (Cal.com may have booked before it
     * failed), only after a rate limit. A `cal-com/unavailable` error therefore means "maybe booked": look for it with
     * `bookings.list({ attendeeEmail, afterStart })` before booking again. A booking Cal.com refuses (the slot was taken
     * meanwhile, a required booking field is missing) fails at once with the category of its 4xx: list the slots again.
     */
    async create(ctx: Context, input: CreateBookingInput) {
      const i = parse(CreateBookingInput, input);
      return call(ctx, 'bookings.create', { method: 'POST', path: '/bookings', json: i }, data(BookingData));
    },
    /** One booking by its uid; every occurrence when the uid is a recurring booking's. */
    async get(ctx: Context, bookingUid: string) {
      const uid = parse(z.string().min(1), bookingUid);
      return call(ctx, 'bookings.get', { method: 'GET', path: `/bookings/${segment(uid)}` }, data(BookingData));
    },
    /** One page of the API key's bookings matching `input`, and the cursor for the next. */
    async list(ctx: Context, input: ListBookingsInput = {}) {
      const i = parse(ListBookingsInput, input);
      return call(ctx, 'bookings.list', { method: 'GET', path: '/bookings', query: { ...i } }, BookingPage);
    },
    /** Every booking matching `input`, fetching pages as they're read. Stop early with `break`. */
    async *all(ctx: Context, input: Omit<ListBookingsInput, 'cursor'> = {}): AsyncGenerator<Booking> {
      let cursor: string | undefined;
      for (;;) {
        const page = await bookings.list(ctx, { ...input, limit: input.limit ?? 100, cursor });
        yield* page.items;
        if (!page.hasMore || !page.nextCursor) return;
        cursor = page.nextCursor;
      }
    },
    /** Cancels the booking (a recurring uid cancels the series; `seatUid` just one seat). Cal.com tells the attendees. */
    async cancel(ctx: Context, input: CancelBookingInput) {
      const { bookingUid, seatUid, cancellationReason, cancelSubsequentBookings } = parse(CancelBookingInput, input);
      const json = seatUid ? { seatUid, cancellationReason } : { cancellationReason, cancelSubsequentBookings };
      return call(ctx, 'bookings.cancel', { method: 'POST', path: `/bookings/${segment(bookingUid)}/cancel`, json }, data(BookingData));
    },
    /**
     * Moves the booking to `start` (sent in UTC). Cal.com makes a new booking, with a new uid, and cancels this one:
     * keep the new uid. Only `accepted` and `pending` bookings move.
     */
    async reschedule(ctx: Context, input: RescheduleBookingInput) {
      const { bookingUid, seatUid, start, rescheduledBy, reschedulingReason, lengthInMinutes } = parse(RescheduleBookingInput, input);
      const json = seatUid ? { start, seatUid, rescheduledBy } : { start, rescheduledBy, reschedulingReason, lengthInMinutes };
      return call(ctx, 'bookings.reschedule', { method: 'POST', path: `/bookings/${segment(bookingUid)}/reschedule`, json }, data(BookingData));
    },
    /** Accepts a `pending` booking (one whose event type requires confirmation), as its host. */
    async confirm(ctx: Context, bookingUid: string) {
      const uid = parse(z.string().min(1), bookingUid);
      return call(ctx, 'bookings.confirm', { method: 'POST', path: `/bookings/${segment(uid)}/confirm` }, data(BookingData));
    },
    /** Declines a `pending` booking, as its host. */
    async decline(ctx: Context, input: DeclineBookingInput) {
      const i = parse(DeclineBookingInput, input);
      return call(ctx, 'bookings.decline', { method: 'POST', path: `/bookings/${segment(i.bookingUid)}/decline`, json: { reason: i.reason } }, data(BookingData));
    },
  };

  const webhooks = {
    /**
     * Makes a webhook for the API key's bookings, signed with the `webhookSecret` setting so `calComWebhookAuth` can
     * check what arrives. Not idempotent: list first, and make it only when no webhook has that URL.
     */
    async create(ctx: Context, input: CreateWebhookInput) {
      const i = parse(CreateWebhookInput, input);
      if (!cfg.webhookSecret) throw new CalComError('cal-com/no-webhook-secret', 'Set the webhook secret (CALCOM_WEBHOOK_SECRET) before making a webhook', { category: 'invalid-request' });
      return call(ctx, 'webhooks.create', { method: 'POST', path: '/webhooks', json: { ...i, secret: cfg.webhookSecret } }, data(Webhook));
    },
    async list(ctx: Context, input: ListWebhooksInput = {}) {
      const i = parse(ListWebhooksInput, input);
      return call(ctx, 'webhooks.list', { method: 'GET', path: '/webhooks', query: { take: i.take, skip: i.skip } }, data(z.array(Webhook)));
    },
    async delete(ctx: Context, webhookId: number) {
      const id = parse(z.number().int().positive(), webhookId);
      return call(ctx, 'webhooks.delete', { method: 'DELETE', path: `/webhooks/${id}` }, z.unknown()).then(() => undefined);
    },
  };

  return { me, eventTypes, slots, bookings, webhooks };
}

export type CalCom = ReturnType<typeof createCalCom>;

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Cal.com input');
  return parsed.data;
}

function segment(value: string): string {
  return encodeURIComponent(value);
}
