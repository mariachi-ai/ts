import { z } from 'zod';

/**
 * Calendly's shapes, as far as an app reads them. Unknown fields pass through (`passthrough`), so a field Calendly
 * adds doesn't fail the boundary; a field the app relies on that goes missing does. Every resource is named by its
 * URI (`https://api.calendly.com/scheduled_events/…`): store the URI, and pass it back to the client as it is.
 */

const uri = z.string().min(1);
const nullable = <T extends z.ZodTypeAny>(schema: T) => schema.nullable().optional();

export const Pagination = z
  .object({
    count: z.number(),
    /** The token for the next page, or null on the last one. */
    next_page_token: nullable(z.string()),
  })
  .passthrough();
export type Pagination = z.infer<typeof Pagination>;

/** One page of a list: `collection` and `pagination.next_page_token`. */
export const pageOf = <T extends z.ZodTypeAny>(item: T) => z.object({ collection: z.array(item), pagination: Pagination }).passthrough();
export interface Page<T> {
  collection: T[];
  pagination: Pagination;
}

export const User = z
  .object({
    uri,
    name: z.string(),
    slug: z.string(),
    email: z.string(),
    /** The user's page listing their event types. */
    scheduling_url: z.string(),
    timezone: z.string(),
    /** The organization's URI: list its event types, events and webhook subscriptions with it. */
    current_organization: uri,
    avatar_url: nullable(z.string()),
  })
  .passthrough();
export type User = z.infer<typeof User>;

export const CustomQuestion = z
  .object({
    name: z.string(),
    type: z.string(),
    position: z.number(),
    enabled: z.boolean(),
    required: z.boolean(),
    answer_choices: z.array(z.string()).default([]),
  })
  .passthrough();
export type CustomQuestion = z.infer<typeof CustomQuestion>;

export const EventType = z
  .object({
    uri,
    name: z.string().nullable(),
    active: z.boolean(),
    slug: nullable(z.string()),
    /** The booking page for this event type: link to it or embed it. */
    scheduling_url: z.string(),
    /** Minutes. */
    duration: z.number(),
    kind: z.string(),
    pooling_type: nullable(z.string()),
    type: z.string(),
    secret: z.boolean().optional(),
    profile: z.object({ type: z.string(), name: z.string(), owner: uri }).passthrough().nullable().optional(),
    /** The questions the booking form asks after name and email; `invitees.create` answers them by `name`. */
    custom_questions: z.array(CustomQuestion).default([]),
    locations: nullable(z.array(z.object({ kind: z.string() }).passthrough())),
    deleted_at: nullable(z.string()),
  })
  .passthrough();
export type EventType = z.infer<typeof EventType>;

export const AvailableTime = z
  .object({
    status: z.string(),
    invitees_remaining: z.number(),
    /** UTC: pass it as `startTime` to `invitees.create`. */
    start_time: z.string(),
    scheduling_url: z.string(),
  })
  .passthrough();
export type AvailableTime = z.infer<typeof AvailableTime>;

export const Cancellation = z
  .object({
    canceled_by: z.string(),
    reason: z.string().nullable(),
    /** `host` or `invitee`. */
    canceler_type: z.string(),
    created_at: z.string(),
  })
  .passthrough();
export type Cancellation = z.infer<typeof Cancellation>;

export const EventMembership = z.object({ user: uri, user_email: z.string().optional(), user_name: z.string().optional() }).passthrough();

export const ScheduledEvent = z
  .object({
    uri,
    name: z.string().nullable(),
    /** `active` or `canceled`. */
    status: z.enum(['active', 'canceled']),
    start_time: z.string(),
    end_time: z.string(),
    event_type: uri,
    /** Where it happens: `type` (`zoom`, `physical`, …) and, by type, `location` or `join_url`. */
    location: z.object({ type: z.string().optional() }).passthrough().nullable().optional(),
    invitees_counter: z.object({ total: z.number(), active: z.number(), limit: z.number() }).passthrough().optional(),
    created_at: z.string(),
    updated_at: z.string(),
    /** The hosts. */
    event_memberships: z.array(EventMembership).default([]),
    event_guests: z.array(z.object({ email: z.string() }).passthrough()).default([]),
    cancellation: Cancellation.optional(),
  })
  .passthrough();
export type ScheduledEvent = z.infer<typeof ScheduledEvent>;

export const QuestionAndAnswer = z.object({ question: z.string(), answer: z.string(), position: z.number() }).passthrough();
export type QuestionAndAnswer = z.infer<typeof QuestionAndAnswer>;

export const Tracking = z
  .object({
    utm_campaign: nullable(z.string()),
    utm_source: nullable(z.string()),
    utm_medium: nullable(z.string()),
    utm_content: nullable(z.string()),
    utm_term: nullable(z.string()),
    salesforce_uuid: nullable(z.string()),
  })
  .passthrough();
export type Tracking = z.infer<typeof Tracking>;

export const NoShow = z.object({ uri, invitee: uri.optional(), created_at: z.string() }).passthrough();
export type NoShow = z.infer<typeof NoShow>;

export const Invitee = z
  .object({
    /** `https://api.calendly.com/scheduled_events/<event>/invitees/<invitee>`: the invitee's id. */
    uri,
    /** As the invitee typed it: Calendly doesn't verify it. */
    email: z.string(),
    name: z.string(),
    first_name: nullable(z.string()),
    last_name: nullable(z.string()),
    status: z.enum(['active', 'canceled']),
    questions_and_answers: z.array(QuestionAndAnswer).default([]),
    timezone: nullable(z.string()),
    /** The scheduled event's URI. */
    event: uri,
    created_at: z.string(),
    updated_at: z.string(),
    tracking: Tracking.nullable().optional(),
    text_reminder_number: nullable(z.string()),
    /** On a canceled invitee: true when they rescheduled rather than canceled; `new_invitee` is the new booking. */
    rescheduled: z.boolean().default(false),
    old_invitee: nullable(z.string()),
    new_invitee: nullable(z.string()),
    cancel_url: z.string().optional(),
    reschedule_url: z.string().optional(),
    routing_form_submission: nullable(z.string()),
    cancellation: Cancellation.optional(),
    no_show: NoShow.nullable().optional(),
    /** `api` when booked through `invitees.create`. */
    scheduling_method: nullable(z.string()),
  })
  .passthrough();
export type Invitee = z.infer<typeof Invitee>;

export const SchedulingLink = z
  .object({
    /** The link to send: it books one event, then stops working. */
    booking_url: z.string(),
    owner: uri.optional(),
    owner_type: z.string().optional(),
  })
  .passthrough();
export type SchedulingLink = z.infer<typeof SchedulingLink>;

export const WEBHOOK_EVENTS = [
  'invitee.created',
  'invitee.canceled',
  'invitee_no_show.created',
  'invitee_no_show.deleted',
  'routing_form_submission.created',
  'event_type.created',
  'event_type.updated',
  'event_type.deleted',
  'contact.created',
  'contact.updated',
  'contact.deleted',
  'meeting_recap.created',
  'meeting_recap.updated',
  'meeting_recap.deleted',
] as const;
export const WebhookEventName = z.enum(WEBHOOK_EVENTS);
export type WebhookEventName = z.infer<typeof WebhookEventName>;

export const WebhookSubscription = z
  .object({
    uri,
    callback_url: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    /** `disabled` after Calendly failed to deliver for 24 hours: delete it and make it again. */
    state: z.enum(['active', 'disabled']),
    events: z.array(z.string()),
    scope: z.enum(['organization', 'user', 'group']),
    organization: uri,
    user: nullable(z.string()),
    group: nullable(z.string()),
  })
  .passthrough();
export type WebhookSubscription = z.infer<typeof WebhookSubscription>;

export const resourceOf = <T extends z.ZodTypeAny>(item: T) => z.object({ resource: item }).passthrough();

// What the app sends

const Uri = z.string().url();
const PageInput = {
  /** Up to 100. */
  count: z.number().int().min(1).max(100).optional(),
  /** `pagination.next_page_token` from the page before. */
  pageToken: z.string().optional(),
};

export const ListEventTypesInput = z
  .object({
    /** A user's URI (from `users.me`), or the organization's: one of the two. */
    user: Uri.optional(),
    organization: Uri.optional(),
    active: z.boolean().optional(),
    /** `name:asc` (the default), `position:asc`, `created_at:desc`, … */
    sort: z.string().optional(),
    ...PageInput,
  })
  .refine((i) => i.user || i.organization, { message: 'Give a user or an organization URI', path: ['user'] });
export type ListEventTypesInput = z.input<typeof ListEventTypesInput>;

export const AvailableTimesInput = z.object({
  eventType: Uri,
  /** ISO time, not in the past. */
  startTime: z.string().datetime({ offset: true }),
  /** ISO time, at most 31 days after `startTime`. */
  endTime: z.string().datetime({ offset: true }),
});
export type AvailableTimesInput = z.input<typeof AvailableTimesInput>;

export const ListScheduledEventsInput = z
  .object({
    /** A user's URI; with an organization admin's token, give `organization` as well. */
    user: Uri.optional(),
    /** The organization's URI: every member's events (needs an owner's or admin's token). */
    organization: Uri.optional(),
    group: Uri.optional(),
    inviteeEmail: z.string().email().optional(),
    status: z.enum(['active', 'canceled']).optional(),
    /** ISO time, UTC: events starting after it. */
    minStartTime: z.string().datetime({ offset: true }).optional(),
    maxStartTime: z.string().datetime({ offset: true }).optional(),
    /** `start_time:asc` or `start_time:desc`. */
    sort: z.enum(['start_time:asc', 'start_time:desc']).optional(),
    ...PageInput,
  })
  .refine((i) => i.user || i.organization || i.group, { message: 'Give a user, group or organization URI', path: ['user'] });
export type ListScheduledEventsInput = z.input<typeof ListScheduledEventsInput>;

export const CancelEventInput = z.object({
  /** The scheduled event's URI (or its UUID). */
  event: z.string().min(1),
  reason: z.string().max(10_000).optional(),
});
export type CancelEventInput = z.input<typeof CancelEventInput>;

export const ListInviteesInput = z.object({
  /** The scheduled event's URI (or its UUID). */
  event: z.string().min(1),
  status: z.enum(['active', 'canceled']).optional(),
  email: z.string().email().optional(),
  /** By `created_at`. */
  sort: z.enum(['created_at:asc', 'created_at:desc']).optional(),
  ...PageInput,
});
export type ListInviteesInput = z.input<typeof ListInviteesInput>;

export const CreateInviteeInput = z.object({
  /** The event type's URI. */
  eventType: Uri,
  /** One of `eventTypes.availableTimes`' `start_time`s, in UTC. */
  startTime: z.string().datetime({ offset: true }),
  invitee: z
    .object({
      /** The full name, or `firstName` (and `lastName`) for an event type that asks for them apart. */
      name: z.string().min(1).optional(),
      firstName: z.string().min(1).optional(),
      lastName: z.string().optional(),
      email: z.string().email(),
      /** IANA: `America/New_York`. */
      timezone: z.string().min(1),
      /** E.164, for SMS reminders where the event type asks for a number. */
      textReminderNumber: z.string().optional(),
    })
    .refine((i) => i.name || i.firstName, { message: 'Give the invitee a name or a first name', path: ['name'] }),
  /**
   * Required when the event type has a location, and must be one of its kinds; omit it when it has none, and for
   * round-robin event types. `location` is the detail the invitee gives for `ask_invitee`, `outbound_call` and the like.
   */
  location: z.object({ kind: z.string().min(1), location: z.string().optional() }).optional(),
  /** Answers to the event type's `custom_questions`: `question` exactly as its `name`. */
  questionsAndAnswers: z.array(z.object({ question: z.string(), answer: z.string(), position: z.number().int() })).optional(),
  tracking: z
    .object({
      utmSource: z.string().max(255).optional(),
      utmMedium: z.string().max(255).optional(),
      utmCampaign: z.string().max(255).optional(),
      utmContent: z.string().max(255).optional(),
      utmTerm: z.string().max(255).optional(),
      salesforceUuid: z.string().optional(),
    })
    .optional(),
  /** Other people to invite, by email. At most 10. */
  eventGuests: z.array(z.string().email()).max(10).optional(),
});
export type CreateInviteeInput = z.input<typeof CreateInviteeInput>;

export const CreateWebhookSubscriptionInput = z
  .object({
    /** Where Calendly posts: the app's `WebhookController` route. */
    url: z.string().url(),
    events: z.array(WebhookEventName).min(1),
    /** `organization` for every member (an owner's or admin's token), `user` for one, `group` for a group. */
    scope: z.enum(['organization', 'user', 'group']),
    /** The organization's URI: Calendly needs it whatever the scope. */
    organization: Uri,
    /** With `scope: 'user'`. */
    user: Uri.optional(),
    /** With `scope: 'group'`. */
    group: Uri.optional(),
  })
  .refine((i) => i.scope !== 'user' || i.user, { message: "A user subscription needs the user's URI", path: ['user'] })
  .refine((i) => i.scope !== 'group' || i.group, { message: "A group subscription needs the group's URI", path: ['group'] });
export type CreateWebhookSubscriptionInput = z.input<typeof CreateWebhookSubscriptionInput>;

export const ListWebhookSubscriptionsInput = z.object({
  organization: Uri,
  scope: z.enum(['organization', 'user', 'group']),
  user: Uri.optional(),
  group: Uri.optional(),
  ...PageInput,
});
export type ListWebhookSubscriptionsInput = z.input<typeof ListWebhookSubscriptionsInput>;
