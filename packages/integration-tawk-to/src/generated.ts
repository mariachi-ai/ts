// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Tawk.to: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'tawk-to',
  name: 'Tawk.to',
  category: 'support',
  server: 'embed.tawk.to',
  docs: 'https://developer.tawk.to/',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'propertyId',
    env: 'TAWKTO_PROPERTY_ID',
    label: 'Property ID',
    meaning: 'The property (the site) the chat widget belongs to.',
    secret: false,
    required: true,
    whereToFind: 'Administration › Overview: the Property ID, below the property image. Tawk.to has no test mode: use a separate property for test.',
    url: 'https://help.tawk.to/article/where-can-i-find-the-property-and-widget-id',
    public: true,
  },
  {
    key: 'widgetId',
    env: 'TAWKTO_WIDGET_ID',
    label: 'Widget ID',
    meaning: "Which of the property's chat widgets the pages show.",
    secret: false,
    required: true,
    whereToFind: 'Administration › Chat Widget: the Widget ID under Widget Status (the last part of the Direct Chat Link).',
    url: 'https://help.tawk.to/article/where-can-i-find-the-property-and-widget-id',
    public: true,
  },
  {
    key: 'apiKey',
    env: 'TAWKTO_API_KEY',
    label: 'JavaScript API key',
    meaning: "Signs the signed-in user's id, so the widget knows who is chatting and nobody can claim to be someone else (Secure Mode).",
    secret: true,
    required: false,
    whereToFind: 'Administration › Overview › JavaScript API: turn on Secure Mode and copy the key beside it. Each property has its own.',
    url: 'https://help.tawk.to/article/how-to-generate-a-hash-for-javascript-api',
  },
  {
    key: 'webhookSecret',
    env: 'TAWKTO_WEBHOOK_SECRET',
    label: 'Webhook secret key',
    meaning: 'Checks that a webhook came from Tawk.to.',
    secret: true,
    required: false,
    whereToFind: "In the dashboard's Administration section, under Webhooks: create a webhook with the app's URL and its events, then copy its secret key. Each webhook has its own.",
    url: 'https://developer.tawk.to/webhooks/',
  },
];

/** The config `createTawkTo` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  propertyId: z.string().min(1),
  widgetId: z.string().min(1),
  apiKey: z.string().min(1).optional(),
  webhookSecret: z.string().min(1).optional(),
});
export type TawkToConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  propertyId: 'TAWKTO_PROPERTY_ID',
  widgetId: 'TAWKTO_WIDGET_ID',
  apiKey: 'TAWKTO_API_KEY',
  webhookSecret: 'TAWKTO_WEBHOOK_SECRET',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'visitor.login': {
    purpose: "Signs the visitor in, in the browser: Tawk_API.login with the app's user id and the hex HMAC-SHA256 of that id keyed with the JavaScript API key, plus name, email and custom attributes. Restores the user's earlier conversations. Tawk.to has no server API for visitors or contacts.",
    idempotency: 'natural',
  },
  'visitor.logout': {
    purpose: 'Signs the visitor out, in the browser: Tawk_API.logout.',
    idempotency: 'natural',
  },
  'events.add': {
    purpose: "Records a custom event on the visitor's chat, in the browser: Tawk_API.addEvent(name, metadata). The name is letters, digits and dashes. Tawk.to has no server API for events.",
    idempotency: 'none',
  },
} as const;
export type TawkToOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'hmac-sha1-hex',
  header: 'X-Tawk-Signature',
  secretSetting: 'webhookSecret',
  description: "The header is the hex HMAC-SHA1 of the raw request body, keyed with the webhook's secret key, with no prefix and no timestamp. X-Hook-Event-Id names the event and stays the same across retries, but isn't signed.",
} as const;
export const webhookEvents = ['chat:start', 'chat:end', 'chat:transcript_created', 'ticket:create'] as const;
export type TawkToWebhookEvent = (typeof webhookEvents)[number];
