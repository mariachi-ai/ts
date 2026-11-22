/**
 * `@mariachi/integration-calendly/testing`: a Calendly for an app's tests, held in memory, with the same shape as
 * `createCalendly`'s client; builders for its resources; and a signed webhook to post to the app's endpoint.
 */
import { signStripeWebhook } from '@mariachi/webhooks';
import type { Calendly } from './client';
import { CalendlyError } from './errors';
import { provider } from './generated';
import type { EventType, Invitee, NoShow, Page, ScheduledEvent, User, WebhookSubscription } from './schemas';
import { emailKey, inviteeUuids, uuidFromUri } from './uris';
import type { InviteePayload } from './webhooks';

const API = provider.baseUrl;
const ORG = `${API}/organizations/ORG0000000000000`;
const NOW = '2026-11-21T10:00:00.000000Z';

let seq = 0;
/** A fresh Calendly-style UUID. */
export function testUuid(): string {
  seq += 1;
  return `FAKE${String(seq).padStart(12, '0')}`;
}

export function testUser(overrides: Partial<User> = {}): User {
  return {
    uri: `${API}/users/USER000000000000`,
    name: 'Ada Host',
    slug: 'ada-host',
    email: 'host@example.com',
    scheduling_url: 'https://calendly.com/ada-host',
    timezone: 'Europe/London',
    current_organization: ORG,
    avatar_url: null,
    ...overrides,
  };
}

export function testEventType(overrides: Partial<EventType> = {}): EventType {
  const uuid = testUuid();
  return {
    uri: `${API}/event_types/${uuid}`,
    name: '30 Minute Meeting',
    active: true,
    slug: '30min',
    scheduling_url: 'https://calendly.com/ada-host/30min',
    duration: 30,
    kind: 'solo',
    pooling_type: null,
    type: 'StandardEventType',
    secret: false,
    custom_questions: [],
    locations: [{ kind: 'zoom_conference' }],
    deleted_at: null,
    ...overrides,
  };
}

export function testScheduledEvent(overrides: Partial<ScheduledEvent> = {}): ScheduledEvent {
  const uuid = testUuid();
  return {
    uri: `${API}/scheduled_events/${uuid}`,
    name: '30 Minute Meeting',
    status: 'active',
    start_time: '2026-11-25T15:00:00.000000Z',
    end_time: '2026-11-25T15:30:00.000000Z',
    event_type: `${API}/event_types/ET00000000000000`,
    location: { type: 'zoom', join_url: 'https://zoom.us/j/1' },
    invitees_counter: { total: 1, active: 1, limit: 1 },
    created_at: NOW,
    updated_at: NOW,
    event_memberships: [{ user: `${API}/users/USER000000000000` }],
    event_guests: [],
    ...overrides,
  };
}

/** An invitee of `event` (a new scheduled event when it's left out). */
export function testInvitee(overrides: Partial<Invitee> = {}, event: Pick<ScheduledEvent, 'uri'> = testScheduledEvent()): Invitee {
  const uuid = testUuid();
  return {
    uri: `${event.uri}/invitees/${uuid}`,
    email: 'invitee@example.com',
    name: 'Grace Invitee',
    first_name: null,
    last_name: null,
    status: 'active',
    questions_and_answers: [],
    timezone: 'America/New_York',
    event: event.uri,
    created_at: NOW,
    updated_at: NOW,
    tracking: { utm_campaign: null, utm_source: null, utm_medium: null, utm_content: null, utm_term: null, salesforce_uuid: null },
    text_reminder_number: null,
    rescheduled: false,
    old_invitee: null,
    new_invitee: null,
    cancel_url: `https://calendly.com/cancellations/${uuid}`,
    reschedule_url: `https://calendly.com/reschedulings/${uuid}`,
    routing_form_submission: null,
    no_show: null,
    scheduling_method: null,
    ...overrides,
  };
}

/** The body Calendly posts for an invitee event: `{ event, created_at, created_by, payload }`. */
export function testInviteeEvent(
  event: 'invitee.created' | 'invitee.canceled',
  invitee: Invitee = testInvitee(),
  scheduledEvent: ScheduledEvent = testScheduledEvent({ uri: invitee.event }),
): { event: string; created_at: string; created_by: string; payload: InviteePayload } {
  return { event, created_at: NOW, created_by: testUser().uri, payload: { ...invitee, scheduled_event: scheduledEvent } };
}

/** The raw body and `Calendly-Webhook-Signature` header Calendly would send, signed now (or at `timestampSeconds`). */
export function signedCalendlyWebhook(body: unknown, signingKey: string, timestampSeconds: number = Math.floor(Date.now() / 1000)): { rawBody: string; headers: Record<string, string> } {
  const rawBody = JSON.stringify(body);
  return { rawBody, headers: { 'calendly-webhook-signature': signStripeWebhook(signingKey, timestampSeconds, rawBody) } };
}

export interface FakeCalendly extends Calendly {
  user_: User;
  eventTypes_: Map<string, EventType>;
  events_: Map<string, ScheduledEvent>;
  invitees_: Map<string, Invitee>;
  /** Open start times per event type URI, for `eventTypes.availableTimes` and `invitees.create`. */
  availableTimes_: Map<string, string[]>;
  noShows_: Map<string, NoShow>;
  webhookSubscriptions_: Map<string, WebhookSubscription>;
  schedulingLinks_: string[];
}

/**
 * An in-memory Calendly: seed event types, events and invitees, then hand it to the code under test in place of the
 * client. Like Calendly, a missing resource fails with `calendly/not-found`, a second subscription for a URL with
 * `calendly/already-exists`, and a booking at a time that isn't open with `calendly/invalid-request`.
 */
export function fakeCalendly(
  seed: { user?: User; eventTypes?: EventType[]; events?: ScheduledEvent[]; invitees?: Invitee[]; availableTimes?: Record<string, string[]> } = {},
): FakeCalendly {
  const user_ = seed.user ?? testUser();
  const byUuid = <T extends { uri: string }>(items: T[] = []) => new Map(items.map((item) => [uuidFromUri(item.uri), item]));
  const eventTypes_ = byUuid(seed.eventTypes);
  const events_ = byUuid(seed.events);
  const invitees_ = byUuid(seed.invitees);
  const availableTimes_ = new Map(Object.entries(seed.availableTimes ?? {}));
  const noShows_ = new Map<string, NoShow>();
  const webhookSubscriptions_ = new Map<string, WebhookSubscription>();
  const schedulingLinks_: string[] = [];

  const fail = (reason: string, category: 'not-found' | 'conflict' | 'forbidden' | 'invalid-request', status: number) =>
    new CalendlyError(`calendly/${reason}`, `calendly fake: ${reason}`, { category, status });
  const found = <T>(map: Map<string, T>, uriOrUuid: string): T => {
    const item = map.get(uuidFromUri(uriOrUuid));
    if (!item) throw fail('not-found', 'not-found', 404);
    return item;
  };
  const page = <T>(collection: T[]): Page<T> => ({ collection, pagination: { count: collection.length, next_page_token: null } });
  const inviteesOf = (eventUri: string) => [...invitees_.values()].filter((i) => i.event === eventUri);

  const fake: FakeCalendly = {
    user_,
    eventTypes_,
    events_,
    invitees_,
    availableTimes_,
    noShows_,
    webhookSubscriptions_,
    schedulingLinks_,
    users: {
      async me() {
        return user_;
      },
    },
    eventTypes: {
      async list(_ctx, input) {
        return page([...eventTypes_.values()].filter((t) => input.active === undefined || t.active === input.active));
      },
      async *all(ctx, input) {
        yield* (await fake.eventTypes.list(ctx, input)).collection;
      },
      async availableTimes(_ctx, input) {
        found(eventTypes_, input.eventType);
        return (availableTimes_.get(input.eventType) ?? [])
          .filter((t) => t >= input.startTime && t <= input.endTime)
          .map((start_time) => ({ status: 'available', invitees_remaining: 1, start_time, scheduling_url: 'https://calendly.com/ada-host/30min' }));
      },
    },
    scheduledEvents: {
      async list(_ctx, input) {
        const email = input.inviteeEmail && emailKey(input.inviteeEmail);
        const items = [...events_.values()]
          .filter((e) => !input.status || e.status === input.status)
          .filter((e) => (!input.minStartTime || e.start_time >= input.minStartTime) && (!input.maxStartTime || e.start_time <= input.maxStartTime))
          .filter((e) => !email || inviteesOf(e.uri).some((i) => emailKey(i.email) === email))
          .sort((a, b) => a.start_time.localeCompare(b.start_time) * (input.sort === 'start_time:desc' ? -1 : 1));
        return page(items);
      },
      async *all(ctx, input) {
        yield* (await fake.scheduledEvents.list(ctx, input)).collection;
      },
      async get(_ctx, event) {
        return found(events_, event);
      },
      async cancel(_ctx, input) {
        const event = found(events_, input.event);
        if (event.status === 'canceled') throw fail('forbidden', 'forbidden', 403);
        const cancellation = { canceled_by: user_.name, reason: input.reason ?? null, canceler_type: 'host', created_at: NOW };
        events_.set(uuidFromUri(event.uri), { ...event, status: 'canceled', cancellation });
        for (const invitee of inviteesOf(event.uri)) invitees_.set(uuidFromUri(invitee.uri), { ...invitee, status: 'canceled', cancellation });
        return cancellation;
      },
    },
    invitees: {
      async list(_ctx, input) {
        const event = found(events_, input.event);
        const email = input.email && emailKey(input.email);
        return page(inviteesOf(event.uri).filter((i) => (!input.status || i.status === input.status) && (!email || emailKey(i.email) === email)));
      },
      async *all(ctx, input) {
        yield* (await fake.invitees.list(ctx, input)).collection;
      },
      async get(_ctx, inviteeUri) {
        return found(invitees_, inviteeUuids(inviteeUri).inviteeUuid);
      },
      async create(_ctx, input) {
        const type = found(eventTypes_, input.eventType);
        const open = availableTimes_.get(type.uri) ?? [];
        if (!open.includes(input.startTime)) throw fail('invalid-request', 'invalid-request', 400);
        availableTimes_.set(type.uri, open.filter((t) => t !== input.startTime));
        const end = new Date(Date.parse(input.startTime) + type.duration * 60_000).toISOString();
        const event = testScheduledEvent({ name: type.name, event_type: type.uri, start_time: input.startTime, end_time: end });
        events_.set(uuidFromUri(event.uri), event);
        const name = input.invitee.name ?? [input.invitee.firstName, input.invitee.lastName].filter(Boolean).join(' ');
        const invitee = testInvitee(
          {
            email: input.invitee.email,
            name,
            first_name: input.invitee.firstName ?? null,
            last_name: input.invitee.lastName ?? null,
            timezone: input.invitee.timezone,
            questions_and_answers: input.questionsAndAnswers ?? [],
            scheduling_method: 'api',
            tracking: {
              utm_campaign: input.tracking?.utmCampaign ?? null,
              utm_source: input.tracking?.utmSource ?? null,
              utm_medium: input.tracking?.utmMedium ?? null,
              utm_content: input.tracking?.utmContent ?? null,
              utm_term: input.tracking?.utmTerm ?? null,
              salesforce_uuid: input.tracking?.salesforceUuid ?? null,
            },
          },
          event,
        );
        invitees_.set(uuidFromUri(invitee.uri), invitee);
        return invitee;
      },
    },
    noShows: {
      async create(_ctx, inviteeUri) {
        const invitee = found(invitees_, inviteeUuids(inviteeUri).inviteeUuid);
        const noShow = { uri: `${API}/invitee_no_shows/${testUuid()}`, invitee: invitee.uri, created_at: NOW };
        noShows_.set(uuidFromUri(noShow.uri), noShow);
        invitees_.set(uuidFromUri(invitee.uri), { ...invitee, no_show: noShow });
        return noShow;
      },
      async delete(_ctx, noShow) {
        const existing = found(noShows_, noShow);
        noShows_.delete(uuidFromUri(existing.uri));
        const invitee = existing.invitee ? invitees_.get(inviteeUuids(existing.invitee).inviteeUuid) : undefined;
        if (invitee) invitees_.set(uuidFromUri(invitee.uri), { ...invitee, no_show: null });
      },
    },
    schedulingLinks: {
      async create(_ctx, eventType) {
        const type = found(eventTypes_, eventType);
        const booking_url = `https://calendly.com/d/${testUuid().toLowerCase()}`;
        schedulingLinks_.push(booking_url);
        return { booking_url, owner: type.uri, owner_type: 'EventType' };
      },
    },
    webhookSubscriptions: {
      async create(_ctx, input) {
        if ([...webhookSubscriptions_.values()].some((s) => s.callback_url === input.url)) throw fail('already-exists', 'conflict', 409);
        const subscription: WebhookSubscription = {
          uri: `${API}/webhook_subscriptions/${testUuid()}`,
          callback_url: input.url,
          created_at: NOW,
          updated_at: NOW,
          state: 'active',
          events: [...input.events],
          scope: input.scope,
          organization: input.organization,
          user: input.user ?? null,
          group: input.group ?? null,
        };
        webhookSubscriptions_.set(uuidFromUri(subscription.uri), subscription);
        return subscription;
      },
      async list(_ctx, input) {
        return page([...webhookSubscriptions_.values()].filter((s) => s.organization === input.organization && s.scope === input.scope && (!input.user || s.user === input.user)));
      },
      async *all(ctx, input) {
        yield* (await fake.webhookSubscriptions.list(ctx, input)).collection;
      },
      async delete(_ctx, subscription) {
        found(webhookSubscriptions_, subscription);
        webhookSubscriptions_.delete(uuidFromUri(subscription));
      },
    },
  };
  return fake;
}
