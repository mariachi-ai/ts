// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Typeform: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'typeform',
  name: 'Typeform',
  category: 'forms',
  server: 'api.typeform.com',
  baseUrl: 'https://api.typeform.com',
  docs: 'https://www.typeform.com/developers/',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'token',
    env: 'TYPEFORM_TOKEN',
    label: 'Personal access token',
    meaning: "Reads the account's forms and responses, and manages their webhooks.",
    secret: true,
    required: true,
    whereToFind: 'Account › Personal tokens › Generate a new token, with the forms:read, responses:read, webhooks:read and webhooks:write scopes. Typeform has no test mode: use a separate form for test.',
    url: 'https://admin.typeform.com/user/tokens',
  },
  {
    key: 'webhookSecret',
    env: 'TYPEFORM_WEBHOOK_SECRET',
    label: 'Webhook secret',
    meaning: "Checks that a webhook came from Typeform. You choose it, and it's sent to Typeform when the webhook is made.",
    secret: true,
    required: false,
    whereToFind: 'Any long random string of your own: webhooks.put sends it to Typeform.',
    url: 'https://www.typeform.com/developers/webhooks/secure-your-webhooks/',
  },
  {
    key: 'apiBaseUrl',
    env: 'TYPEFORM_API_BASE_URL',
    label: 'API address',
    meaning: "Where the account's data lives. Only for accounts in Typeform's EU data center.",
    secret: false,
    required: false,
    whereToFind: 'https://api.eu.typeform.com for an EU account; leave it unset otherwise.',
    url: 'https://www.typeform.com/developers/get-started/responses-data-center/',
    public: true,
  },
];

/** The config `createTypeform` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  token: z.string().min(1),
  webhookSecret: z.string().min(1).optional(),
  apiBaseUrl: z.string().min(1).optional(),
});
export type TypeformConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  token: 'TYPEFORM_TOKEN',
  webhookSecret: 'TYPEFORM_WEBHOOK_SECRET',
  apiBaseUrl: 'TYPEFORM_API_BASE_URL',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'forms.list': {
    purpose: "Lists the account's forms, a page at a time, optionally matching a search.",
    method: 'GET',
    path: '/forms',
    idempotency: 'natural',
  },
  'forms.get': {
    purpose: "Reads one form: its fields, with each field's ref, and its hidden fields.",
    method: 'GET',
    path: '/forms/{formId}',
    idempotency: 'natural',
  },
  'responses.list': {
    purpose: "Lists a form's responses, newest first, a page at a time.",
    method: 'GET',
    path: '/forms/{formId}/responses',
    idempotency: 'natural',
  },
  'webhooks.put': {
    purpose: "Creates or updates the form's webhook with this tag, signed with the webhook secret.",
    method: 'PUT',
    path: '/forms/{formId}/webhooks/{tag}',
    idempotency: 'natural',
  },
  'webhooks.list': {
    purpose: "Lists the form's webhooks.",
    method: 'GET',
    path: '/forms/{formId}/webhooks',
    idempotency: 'natural',
  },
  'webhooks.delete': {
    purpose: "Deletes the form's webhook with this tag.",
    method: 'DELETE',
    path: '/forms/{formId}/webhooks/{tag}',
    idempotency: 'natural',
  },
} as const;
export type TypeformOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'hmac-sha256-base64',
  header: 'Typeform-Signature',
  secretSetting: 'webhookSecret',
  description: "The header is sha256= followed by the base64 HMAC-SHA256 of the raw request body, keyed with the webhook's secret.",
} as const;
export const webhookEvents = ['form_response'] as const;
export type TypeformWebhookEvent = (typeof webhookEvents)[number];
