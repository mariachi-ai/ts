import { type Context, fromZodError } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { CalendlyError } from './errors';
import { type CalendlyConfig, type CalendlyOperation, configSchema, errorMap, provider } from './generated';
import {
  AvailableTime,
  AvailableTimesInput,
  CancelEventInput,
  Cancellation,
  CreateInviteeInput,
  CreateWebhookSubscriptionInput,
  EventType,
  Invitee,
  ListEventTypesInput,
  ListInviteesInput,
  ListScheduledEventsInput,
  ListWebhookSubscriptionsInput,
  NoShow,
  type Page,
  ScheduledEvent,
  SchedulingLink,
  User,
  WebhookSubscription,
  pageOf,
  resourceOf,
} from './schemas';
import { inviteeUuids, uuidFromUri } from './uris';

export interface CalendlyDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

/**
 * The Calendly client: each operation takes `ctx` first, checks its input and Calendly's answer, and makes one span
 * (`calendly scheduledEvents.list`). Build it once at startup and share it. Resources are named by their URIs, as
 * Calendly gives them; an operation that takes one also takes the bare UUID.
 *
 * ```ts
 * const calendly = createCalendly(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * const me = await calendly.users.me(ctx);
 * for await (const event of calendly.scheduledEvents.all(ctx, { user: me.uri, organization: me.current_organization, status: 'active' })) { … }
 * ```
 */
export function createCalendly(config: CalendlyConfig, deps: CalendlyDeps = {}) {
  const cfg = configSchema.parse(config);
  const base = provider.baseUrl;
  const server = new URL(base).host;

  function call<T>(ctx: Context, operation: CalendlyOperation, request: Omit<ProviderRequest, 'url' | 'headers'> & { path: string }, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    const { path, ...rest } = request;
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server },
      { ...rest, url: `${base}${path}`, headers: { authorization: `Bearer ${cfg.accessToken}` } },
      { schema, error: CalendlyError, failure, deps },
    );
  }

  const one = <T extends z.ZodTypeAny>(schema: T) => resourceOf(schema).transform((r) => r.resource as z.output<T>);

  const users = {
    /** The token's own user: its `uri`, and its organization's (`current_organization`), which the lists take. */
    async me(ctx: Context): Promise<User> {
      return call(ctx, 'users.me', { method: 'GET', path: '/users/me' }, one(User));
    },
  };

  const eventTypes = {
    /** One page of a user's or the organization's event types. */
    async list(ctx: Context, input: ListEventTypesInput): Promise<Page<EventType>> {
      const i = parse(ListEventTypesInput, input);
      return call(
        ctx,
        'eventTypes.list',
        { method: 'GET', path: '/event_types', query: { user: i.user, organization: i.organization, active: i.active, sort: i.sort, count: i.count, page_token: i.pageToken } },
        pageOf(EventType),
      );
    },
    /** Every event type matching `input`, fetching pages as they're read. */
    async *all(ctx: Context, input: ListEventTypesInput): AsyncGenerator<EventType> {
      yield* everything((pageToken) => eventTypes.list(ctx, { ...input, count: input.count ?? 100, pageToken }));
    },
    /** The open start times of an event type between two times, at most 31 days apart and not in the past. */
    async availableTimes(ctx: Context, input: AvailableTimesInput): Promise<AvailableTime[]> {
      const i = parse(AvailableTimesInput, input);
      return call(
        ctx,
        'eventTypes.availableTimes',
        { method: 'GET', path: '/event_type_available_times', query: { event_type: i.eventType, start_time: i.startTime, end_time: i.endTime } },
        z.object({ collection: z.array(AvailableTime) }).passthrough(),
      ).then((r) => r.collection);
    },
  };

  const scheduledEvents = {
    /** One page of scheduled events for a user, a group or the organization. */
    async list(ctx: Context, input: ListScheduledEventsInput): Promise<Page<ScheduledEvent>> {
      const i = parse(ListScheduledEventsInput, input);
      return call(
        ctx,
        'scheduledEvents.list',
        {
          method: 'GET',
          path: '/scheduled_events',
          query: {
            user: i.user,
            organization: i.organization,
            group: i.group,
            invitee_email: i.inviteeEmail,
            status: i.status,
            min_start_time: i.minStartTime,
            max_start_time: i.maxStartTime,
            sort: i.sort,
            count: i.count,
            page_token: i.pageToken,
          },
        },
        pageOf(ScheduledEvent),
      );
    },
    /** Every scheduled event matching `input`, fetching pages as they're read. Stop early with `break`. */
    async *all(ctx: Context, input: ListScheduledEventsInput): AsyncGenerator<ScheduledEvent> {
      yield* everything((pageToken) => scheduledEvents.list(ctx, { ...input, count: input.count ?? 100, pageToken }));
    },
    /** One scheduled event, by its URI (or UUID). */
    async get(ctx: Context, event: string): Promise<ScheduledEvent> {
      return call(ctx, 'scheduledEvents.get', { method: 'GET', path: `/scheduled_events/${uuidFromUri(event)}` }, one(ScheduledEvent));
    },
    /**
     * Cancels a scheduled event. Calendly refuses (403, `calendly/forbidden`) an event that's already canceled or
     * in the past.
     */
    async cancel(ctx: Context, input: CancelEventInput): Promise<Cancellation> {
      const i = parse(CancelEventInput, input);
      return call(ctx, 'scheduledEvents.cancel', { method: 'POST', path: `/scheduled_events/${uuidFromUri(i.event)}/cancellation`, json: { reason: i.reason } }, one(Cancellation));
    },
  };

  const invitees = {
    /** One page of a scheduled event's invitees. */
    async list(ctx: Context, input: ListInviteesInput): Promise<Page<Invitee>> {
      const i = parse(ListInviteesInput, input);
      return call(
        ctx,
        'invitees.list',
        { method: 'GET', path: `/scheduled_events/${uuidFromUri(i.event)}/invitees`, query: { status: i.status, email: i.email, sort: i.sort, count: i.count, page_token: i.pageToken } },
        pageOf(Invitee),
      );
    },
    async *all(ctx: Context, input: ListInviteesInput): AsyncGenerator<Invitee> {
      yield* everything((pageToken) => invitees.list(ctx, { ...input, count: input.count ?? 100, pageToken }));
    },
    /** One invitee, by their URI (`…/scheduled_events/<event>/invitees/<invitee>`, as a webhook or the embed gives it). */
    async get(ctx: Context, inviteeUri: string): Promise<Invitee> {
      const { eventUuid, inviteeUuid } = inviteeUuids(inviteeUri);
      return call(ctx, 'invitees.get', { method: 'GET', path: `/scheduled_events/${eventUuid}/invitees/${inviteeUuid}` }, one(Invitee));
    },
    /**
     * Books an event for an invitee at an open start time (Calendly's Scheduling API): the invitee and hosts get
     * Calendly's usual emails and calendar invites, and an `invitee.created` webhook follows. Pick `startTime` from
     * `eventTypes.availableTimes`. Calendly takes no idempotency key, so this is never retried after an outage:
     * check with `invitees.list` before booking again. Event types that take a payment can't be booked this way.
     */
    async create(ctx: Context, input: CreateInviteeInput): Promise<Invitee> {
      const i = parse(CreateInviteeInput, input);
      const t = i.tracking;
      return call(
        ctx,
        'invitees.create',
        {
          method: 'POST',
          path: '/invitees',
          json: {
            event_type: i.eventType,
            start_time: i.startTime,
            invitee: {
              name: i.invitee.name,
              first_name: i.invitee.firstName,
              last_name: i.invitee.lastName,
              email: i.invitee.email,
              timezone: i.invitee.timezone,
              text_reminder_number: i.invitee.textReminderNumber,
            },
            location: i.location,
            questions_and_answers: i.questionsAndAnswers,
            tracking: t && { utm_source: t.utmSource, utm_medium: t.utmMedium, utm_campaign: t.utmCampaign, utm_content: t.utmContent, utm_term: t.utmTerm, salesforce_uuid: t.salesforceUuid },
            event_guests: i.eventGuests,
          },
        },
        one(Invitee),
      );
    },
  };

  const noShows = {
    /** Marks an invitee, by their URI, as a no-show. The answer's `uri` undoes it with `noShows.delete`. */
    async create(ctx: Context, inviteeUri: string): Promise<NoShow> {
      inviteeUuids(inviteeUri);
      return call(ctx, 'noShows.create', { method: 'POST', path: '/invitee_no_shows', json: { invitee: inviteeUri } }, one(NoShow));
    },
    /** Undoes a no-show, by its URI (an invitee's `no_show.uri`) or UUID. */
    async delete(ctx: Context, noShow: string): Promise<void> {
      await call(ctx, 'noShows.delete', { method: 'DELETE', path: `/invitee_no_shows/${uuidFromUri(noShow)}` }, z.unknown());
    },
  };

  const schedulingLinks = {
    /**
     * A booking link for one event of this event type (by its URI), which stops working once used: for a link sent
     * to one person. To let anyone book, use the event type's `scheduling_url` instead.
     */
    async create(ctx: Context, eventType: string): Promise<SchedulingLink> {
      const owner = parse(z.string().url(), eventType);
      return call(ctx, 'schedulingLinks.create', { method: 'POST', path: '/scheduling_links', json: { max_event_count: 1, owner, owner_type: 'EventType' } }, one(SchedulingLink));
    },
  };

  const webhookSubscriptions = {
    /**
     * Subscribes `url` to `events`, signed with the `webhookSigningKey` setting so `calendlyWebhookAuth` can check
     * what arrives. Calendly allows one subscription per URL: a second fails with `calendly/already-exists`, so at
     * deploy list them first, and delete and make it again to change its events or key.
     */
    async create(ctx: Context, input: CreateWebhookSubscriptionInput): Promise<WebhookSubscription> {
      const i = parse(CreateWebhookSubscriptionInput, input);
      if (!cfg.webhookSigningKey) {
        throw new CalendlyError('calendly/no-webhook-signing-key', 'Set the webhook signing key (CALENDLY_WEBHOOK_SIGNING_KEY) before making a webhook subscription', { category: 'invalid-request' });
      }
      return call(
        ctx,
        'webhookSubscriptions.create',
        { method: 'POST', path: '/webhook_subscriptions', json: { url: i.url, events: i.events, scope: i.scope, organization: i.organization, user: i.user, group: i.group, signing_key: cfg.webhookSigningKey } },
        one(WebhookSubscription),
      );
    },
    /** One page of the organization's, a user's or a group's subscriptions. */
    async list(ctx: Context, input: ListWebhookSubscriptionsInput): Promise<Page<WebhookSubscription>> {
      const i = parse(ListWebhookSubscriptionsInput, input);
      return call(
        ctx,
        'webhookSubscriptions.list',
        { method: 'GET', path: '/webhook_subscriptions', query: { organization: i.organization, scope: i.scope, user: i.user, group: i.group, count: i.count, page_token: i.pageToken } },
        pageOf(WebhookSubscription),
      );
    },
    async *all(ctx: Context, input: ListWebhookSubscriptionsInput): AsyncGenerator<WebhookSubscription> {
      yield* everything((pageToken) => webhookSubscriptions.list(ctx, { ...input, count: input.count ?? 100, pageToken }));
    },
    /** Deletes a subscription, by its URI or UUID. */
    async delete(ctx: Context, subscription: string): Promise<void> {
      await call(ctx, 'webhookSubscriptions.delete', { method: 'DELETE', path: `/webhook_subscriptions/${uuidFromUri(subscription)}` }, z.unknown());
    },
  };

  return { users, eventTypes, scheduledEvents, invitees, noShows, schedulingLinks, webhookSubscriptions };
}

export type Calendly = ReturnType<typeof createCalendly>;

/** Each page's items, following `pagination.next_page_token` until it's null. */
async function* everything<T>(page: (pageToken: string | undefined) => Promise<Page<T>>): AsyncGenerator<T> {
  let token: string | undefined;
  do {
    const current = await page(token);
    yield* current.collection;
    token = current.pagination.next_page_token ?? undefined;
  } while (token);
}

/** Calendly's error body is `{ title, message, details }`: the title is kept as the code, the message isn't (it can echo input). */
function failure(_status: number, body: unknown): FailureInfo | undefined {
  const title = typeof body === 'object' && body !== null && typeof (body as { title?: unknown }).title === 'string' ? (body as { title: string }).title : undefined;
  const mapped = mappedFailure(errorMap, title);
  return { providerCode: title, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Calendly input');
  return parsed.data;
}
