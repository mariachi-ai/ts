// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Cal.com: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'cal-com',
  name: 'Cal.com',
  category: 'scheduling',
  server: 'api.cal.com',
  baseUrl: 'https://api.cal.com/v2',
  docs: 'https://cal.com/docs/api-reference/v2',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'apiKey',
    env: 'CALCOM_API_KEY',
    label: 'API key',
    meaning: 'Acts as the Cal.com user who made it: reads their event types and availability, and makes and manages their bookings and webhooks.',
    secret: true,
    required: true,
    whereToFind: "Settings › Developer › API keys › New. Cal.com's docs describe test keys starting cal_ and live keys starting cal_live_, but the dashboard makes no test keys, so the prefix tells nothing and no check is made: use a separate Cal.com account for test.",
    url: 'https://app.cal.com/settings/developer/api-keys',
  },
  {
    key: 'webhookSecret',
    env: 'CALCOM_WEBHOOK_SECRET',
    label: 'Webhook secret',
    meaning: "Checks that a webhook came from Cal.com. You choose it, and it's given to Cal.com when the webhook is made.",
    secret: true,
    required: false,
    whereToFind: 'Any long random string of your own: webhooks.create sends it to Cal.com. For a webhook made in Settings › Developer › Webhooks, the secret entered there.',
    url: 'https://cal.com/docs/developing/guides/automation/webhooks',
  },
  {
    key: 'apiBaseUrl',
    env: 'CALCOM_API_BASE_URL',
    label: 'API address',
    meaning: 'Where API v2 is served. Only for a self-hosted Cal.com.',
    secret: false,
    required: false,
    whereToFind: "Your instance's API v2 address, the one that stands for https://api.cal.com/v2; leave it unset for Cal.com's own cloud.",
    url: 'https://cal.com/docs/api-reference/v2/introduction',
    public: true,
  },
];

/** The config `createCalCom` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  apiKey: z.string().min(1),
  webhookSecret: z.string().min(1).optional(),
  apiBaseUrl: z.string().min(1).optional(),
});
export type CalComConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  apiKey: 'CALCOM_API_KEY',
  webhookSecret: 'CALCOM_WEBHOOK_SECRET',
  apiBaseUrl: 'CALCOM_API_BASE_URL',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'me.get': {
    purpose: 'Reads the user the API key belongs to: their username (for booking links), email and time zone.',
    method: 'GET',
    path: '/me',
    idempotency: 'natural',
  },
  'eventTypes.list': {
    purpose: "Lists the user's event types, or another user's public ones by username (cal-api-version 2026-06-12).",
    method: 'GET',
    path: '/event-types',
    idempotency: 'natural',
  },
  'eventTypes.get': {
    purpose: 'Reads one event type by its id: its slug, length, booking fields and booking page URL (cal-api-version 2026-06-12).',
    method: 'GET',
    path: '/event-types/{eventTypeId}',
    idempotency: 'natural',
  },
  'slots.list': {
    purpose: "Lists an event type's free slots between two times, by date, in a time zone (cal-api-version 2024-09-04, format=range).",
    method: 'GET',
    path: '/slots',
    idempotency: 'natural',
  },
  'bookings.create': {
    purpose: 'Books an event type at a start time in UTC for an attendee. Cal.com takes no idempotency key, so it is never retried after an outage (cal-api-version 2026-02-25).',
    method: 'POST',
    path: '/bookings',
    idempotency: 'none',
  },
  'bookings.get': {
    purpose: 'Reads one booking by its uid (cal-api-version 2026-02-25).',
    method: 'GET',
    path: '/bookings/{bookingUid}',
    idempotency: 'natural',
  },
  'bookings.list': {
    purpose: "Lists the user's bookings, a page at a time by cursor, filtered by status, attendee, event type and time (cal-api-version 2026-05-01).",
    method: 'GET',
    path: '/bookings',
    idempotency: 'natural',
  },
  'bookings.cancel': {
    purpose: 'Cancels a booking, optionally with a reason (cal-api-version 2026-02-25).',
    method: 'POST',
    path: '/bookings/{bookingUid}/cancel',
    idempotency: 'none',
  },
  'bookings.reschedule': {
    purpose: 'Moves a booking to a new start time: Cal.com makes a new booking and cancels the old one (cal-api-version 2026-02-25).',
    method: 'POST',
    path: '/bookings/{bookingUid}/reschedule',
    idempotency: 'none',
  },
  'bookings.confirm': {
    purpose: 'Accepts a booking of an event type that requires confirmation (cal-api-version 2026-02-25).',
    method: 'POST',
    path: '/bookings/{bookingUid}/confirm',
    idempotency: 'none',
  },
  'bookings.decline': {
    purpose: 'Declines a booking of an event type that requires confirmation, optionally with a reason (cal-api-version 2026-02-25).',
    method: 'POST',
    path: '/bookings/{bookingUid}/decline',
    idempotency: 'none',
  },
  'webhooks.create': {
    purpose: "Makes a webhook for the user's bookings, signed with the webhook secret.",
    method: 'POST',
    path: '/webhooks',
    idempotency: 'none',
  },
  'webhooks.list': {
    purpose: "Lists the user's webhooks.",
    method: 'GET',
    path: '/webhooks',
    idempotency: 'natural',
  },
  'webhooks.delete': {
    purpose: "Deletes one of the user's webhooks by its id.",
    method: 'DELETE',
    path: '/webhooks/{webhookId}',
    idempotency: 'natural',
  },
} as const;
export type CalComOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'hmac-sha256-hex',
  header: 'X-Cal-Signature-256',
  secretSetting: 'webhookSecret',
  description: "The header is the hex HMAC-SHA256 of the raw request body, keyed with the webhook's secret, with no prefix. A webhook made without a secret sends the text no-secret-provided instead: refuse it. No delivery id is signed.",
} as const;
export const webhookEvents = ['BOOKING_CREATED', 'BOOKING_REQUESTED', 'BOOKING_RESCHEDULED', 'BOOKING_CANCELLED', 'BOOKING_REJECTED', 'BOOKING_PAYMENT_INITIATED', 'BOOKING_PAID', 'BOOKING_NO_SHOW_UPDATED', 'BOOKING_LOCATION_UPDATED', 'BOOKING_TITLE_UPDATED', 'BOOKING_REASSIGNED', 'BOOKING_SEAT_ACCEPTED', 'BOOKING_SEAT_REJECTED', 'MEETING_STARTED', 'MEETING_ENDED', 'RECORDING_READY', 'RECORDING_TRANSCRIPTION_GENERATED', 'INSTANT_MEETING', 'INSTANT_MEETING_ACCEPTED', 'OOO_CREATED', 'FORM_SUBMITTED', 'FORM_SUBMITTED_NO_EVENT'] as const;
export type CalComWebhookEvent = (typeof webhookEvents)[number];
