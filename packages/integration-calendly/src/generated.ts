// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Calendly: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'calendly',
  name: 'Calendly',
  category: 'scheduling',
  server: 'api.calendly.com',
  baseUrl: 'https://api.calendly.com',
  docs: 'https://developer.calendly.com/',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'accessToken',
    env: 'CALENDLY_ACCESS_TOKEN',
    label: 'Personal access token',
    meaning: "Reads the account's event types, scheduled events and invitees, books and cancels them, and manages webhook subscriptions. An organization owner's or admin's token covers everyone in the organization; anyone else's covers only their own.",
    secret: true,
    required: true,
    whereToFind: 'Profile menu › Developer › Personal access tokens › Create personal access token, with the scopes users:read, event_types:read, scheduled_events:read, scheduled_events:write, scheduling_links:write, webhooks:read and webhooks:write. Calendly shows it once. Calendly has no test mode: use a separate Calendly account for test.',
    url: 'https://calendly.com/app/developer?tab=personal_access_tokens',
  },
  {
    key: 'webhookSigningKey',
    env: 'CALENDLY_WEBHOOK_SIGNING_KEY',
    label: 'Webhook signing key',
    meaning: "Checks that a webhook came from Calendly. You choose it, and it's sent to Calendly when the webhook subscription is made.",
    secret: true,
    required: false,
    whereToFind: "Any long random string of your own: webhookSubscriptions.create gives it to Calendly as the subscription's signing_key.",
    url: 'https://developer.calendly.com/api-docs/overview/webhooks/webhook-signatures',
  },
];

/** The config `createCalendly` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  accessToken: z.string().min(1),
  webhookSigningKey: z.string().min(1).optional(),
});
export type CalendlyConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  accessToken: 'CALENDLY_ACCESS_TOKEN',
  webhookSigningKey: 'CALENDLY_WEBHOOK_SIGNING_KEY',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'users.me': {
    purpose: "Reads the token's own user, with its URI and its organization's URI, which the other operations take.",
    method: 'GET',
    path: '/users/me',
    idempotency: 'natural',
  },
  'eventTypes.list': {
    purpose: "Lists a user's or an organization's event types, a page at a time.",
    method: 'GET',
    path: '/event_types',
    idempotency: 'natural',
  },
  'eventTypes.availableTimes': {
    purpose: "Lists an event type's open start times in a range of up to 31 days, none of it in the past.",
    method: 'GET',
    path: '/event_type_available_times',
    idempotency: 'natural',
  },
  'scheduledEvents.list': {
    purpose: "Lists a user's, a group's or an organization's scheduled events, filtered by status, start time and invitee email, a page at a time.",
    method: 'GET',
    path: '/scheduled_events',
    idempotency: 'natural',
  },
  'scheduledEvents.get': {
    purpose: 'Reads one scheduled event.',
    method: 'GET',
    path: '/scheduled_events/{uuid}',
    idempotency: 'natural',
  },
  'scheduledEvents.cancel': {
    purpose: 'Cancels a scheduled event, with an optional reason.',
    method: 'POST',
    path: '/scheduled_events/{uuid}/cancellation',
    idempotency: 'none',
  },
  'invitees.list': {
    purpose: "Lists a scheduled event's invitees, filtered by status and email, a page at a time.",
    method: 'GET',
    path: '/scheduled_events/{uuid}/invitees',
    idempotency: 'natural',
  },
  'invitees.get': {
    purpose: 'Reads one invitee: their email, name, answers, tracking, and links to cancel or reschedule.',
    method: 'GET',
    path: '/scheduled_events/{event_uuid}/invitees/{invitee_uuid}',
    idempotency: 'natural',
  },
  'invitees.create': {
    purpose: "Books an open start time of an event type for an invitee (the Scheduling API), with Calendly's usual notifications and calendar invites.",
    method: 'POST',
    path: '/invitees',
    idempotency: 'none',
  },
  'noShows.create': {
    purpose: 'Marks an invitee as a no-show.',
    method: 'POST',
    path: '/invitee_no_shows',
    idempotency: 'none',
  },
  'noShows.delete': {
    purpose: 'Undoes marking an invitee as a no-show.',
    method: 'DELETE',
    path: '/invitee_no_shows/{uuid}',
    idempotency: 'natural',
  },
  'schedulingLinks.create': {
    purpose: 'Makes a single-use booking link for an event type: it books one event, then stops working.',
    method: 'POST',
    path: '/scheduling_links',
    idempotency: 'none',
  },
  'webhookSubscriptions.create': {
    purpose: 'Subscribes a URL to events for a user, a group or the organization, signed with the webhook signing key.',
    method: 'POST',
    path: '/webhook_subscriptions',
    idempotency: 'none',
  },
  'webhookSubscriptions.list': {
    purpose: "Lists the organization's, a group's or a user's webhook subscriptions, a page at a time.",
    method: 'GET',
    path: '/webhook_subscriptions',
    idempotency: 'natural',
  },
  'webhookSubscriptions.delete': {
    purpose: 'Deletes a webhook subscription.',
    method: 'DELETE',
    path: '/webhook_subscriptions/{webhook_uuid}',
    idempotency: 'natural',
  },
} as const;
export type CalendlyOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  'Insufficient scope': {
    category: 'forbidden',
    reason: 'insufficient-scope',
  },
  'Already Exists': {
    category: 'conflict',
    reason: 'already-exists',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'hmac-sha256-timestamped',
  header: 'Calendly-Webhook-Signature',
  secretSetting: 'webhookSigningKey',
  description: "The header is t=<Unix seconds>,v1=<hex>, where v1 is the hex HMAC-SHA256, keyed with the subscription's signing key, of t, a period, and the raw request body. Calendly recommends refusing a timestamp more than three minutes old.",
} as const;
export const webhookEvents = ['invitee.created', 'invitee.canceled', 'invitee_no_show.created', 'invitee_no_show.deleted', 'routing_form_submission.created'] as const;
export type CalendlyWebhookEvent = (typeof webhookEvents)[number];
