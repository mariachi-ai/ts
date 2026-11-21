// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Mailchimp: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'mailchimp',
  name: 'Mailchimp',
  category: 'marketing',
  server: '<dc>.api.mailchimp.com',
  docs: 'https://mailchimp.com/developer/marketing/',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'apiKey',
    env: 'MAILCHIMP_API_KEY',
    label: 'API key',
    meaning: "Reaches the account's audiences with full access to the account. Keep it on the server, never in a browser or a mobile app. Its suffix after the dash (us6) is the account's data center.",
    secret: true,
    required: true,
    whereToFind: "Profile › Extras › API keys › Create A Key. It's shown once, and it can stop working (its user leaves the account, or it expires): plan to rotate it. Mailchimp has no test mode: use a separate audience for test.",
    url: 'https://us1.admin.mailchimp.com/account/api/',
  },
  {
    key: 'serverPrefix',
    env: 'MAILCHIMP_SERVER_PREFIX',
    label: 'Server prefix',
    meaning: "The account's data center, the first part of the API's host (us6 in us6.api.mailchimp.com). Read from the API key when unset.",
    secret: false,
    required: false,
    whereToFind: "The API key's suffix after the dash, or the first part of the address of the Mailchimp app (us6.admin.mailchimp.com). Leave it unset.",
    url: 'https://mailchimp.com/developer/marketing/api-concepts/authentication/',
    public: true,
  },
  {
    key: 'audienceId',
    env: 'MAILCHIMP_AUDIENCE_ID',
    label: 'Audience ID',
    meaning: "The audience (list) the app's contacts are kept in.",
    secret: false,
    required: true,
    whereToFind: 'Audience › All contacts › Settings › Audience name and defaults: Audience ID. Use a separate audience for test.',
    url: 'https://admin.mailchimp.com/audience/',
    public: true,
  },
  {
    key: 'webhookSecret',
    env: 'MAILCHIMP_WEBHOOK_SECRET',
    label: 'Webhook signing secret',
    meaning: 'Checks that a webhook came from Mailchimp. Mailchimp makes it when the webhook is created and shows it once.',
    secret: true,
    required: false,
    whereToFind: "Audience › Settings › Webhooks › Create New Webhook shows it after Save; webhooks.create returns it as signingSecret. Lost, it can't be read again: delete the webhook and create it again.",
    url: 'https://mailchimp.com/developer/marketing/api-concepts/webhooks/',
  },
];

/** The config `createMailchimp` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  apiKey: z.string().min(1),
  serverPrefix: z.string().min(1).optional(),
  audienceId: z.string().min(1),
  webhookSecret: z.string().min(1).optional(),
});
export type MailchimpConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  apiKey: 'MAILCHIMP_API_KEY',
  serverPrefix: 'MAILCHIMP_SERVER_PREFIX',
  audienceId: 'MAILCHIMP_AUDIENCE_ID',
  webhookSecret: 'MAILCHIMP_WEBHOOK_SECRET',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'members.upsert': {
    purpose: 'Adds a contact to the audience or updates it, by the MD5 of the lowercased email; status_if_new is the status a new contact gets.',
    method: 'PUT',
    path: '/3.0/lists/{listId}/members/{subscriberHash}',
    idempotency: 'natural',
  },
  'members.get': {
    purpose: 'Reads one contact, whatever its status: subscribed, pending, unsubscribed, cleaned or archived.',
    method: 'GET',
    path: '/3.0/lists/{listId}/members/{subscriberHash}',
    idempotency: 'natural',
  },
  'members.update': {
    purpose: "Changes a contact's merge fields, status, language or email address.",
    method: 'PATCH',
    path: '/3.0/lists/{listId}/members/{subscriberHash}',
    idempotency: 'natural',
  },
  'members.archive': {
    purpose: "Archives a contact: it stays in the account's history but is no longer in the audience, and it can be added again.",
    method: 'DELETE',
    path: '/3.0/lists/{listId}/members/{subscriberHash}',
    idempotency: 'natural',
  },
  'members.deletePermanently': {
    purpose: 'Deletes everything personal about a contact and removes it from the audience. The address can never be added through the API again: only the person can re-subscribe, through a Mailchimp form.',
    method: 'POST',
    path: '/3.0/lists/{listId}/members/{subscriberHash}/actions/delete-permanent',
    idempotency: 'natural',
  },
  'members.updateTags': {
    purpose: "Adds tags to a contact (status active) and removes them (inactive). A tag that doesn't exist is created.",
    method: 'POST',
    path: '/3.0/lists/{listId}/members/{subscriberHash}/tags',
    idempotency: 'natural',
  },
  'members.batch': {
    purpose: "Adds or updates up to 500 contacts in one call; update_existing says whether existing contacts' status changes. Answers with the ones created, the ones updated and the ones that failed.",
    method: 'POST',
    path: '/3.0/lists/{listId}',
    idempotency: 'natural',
  },
  'mergeFields.list': {
    purpose: "Lists the audience's merge fields: each one's tag (FNAME), name, type and whether it's required.",
    method: 'GET',
    path: '/3.0/lists/{listId}/merge-fields',
    idempotency: 'natural',
  },
  'webhooks.create': {
    purpose: 'Creates a webhook on the audience for the events and sources chosen. The answer carries the signing secret, once.',
    method: 'POST',
    path: '/3.0/lists/{listId}/webhooks',
    idempotency: 'none',
  },
  'webhooks.list': {
    purpose: "Lists the audience's webhooks.",
    method: 'GET',
    path: '/3.0/lists/{listId}/webhooks',
    idempotency: 'natural',
  },
  'webhooks.delete': {
    purpose: "Deletes one of the audience's webhooks.",
    method: 'DELETE',
    path: '/3.0/lists/{listId}/webhooks/{webhookId}',
    idempotency: 'natural',
  },
} as const;
export type MailchimpOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  'API Key Invalid': {
    category: 'unauthorized',
    reason: 'invalid-api-key',
  },
  'User Disabled': {
    category: 'forbidden',
    reason: 'account-disabled',
  },
  'Invalid Resource': {
    category: 'invalid-request',
    reason: 'invalid-resource',
  },
  'Member Exists': {
    category: 'conflict',
    reason: 'member-exists',
  },
  'Forgotten Email Not Subscribed': {
    category: 'invalid-request',
    reason: 'forgotten-email',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'hmac-sha256-timestamped',
  header: 'X-Mailchimp-Signature',
  secretSetting: 'webhookSecret',
  description: "The header is t=<Unix seconds>,v1=<hex>, where v1 is the HMAC-SHA256, keyed with the webhook's signing secret, of the timestamp, a period and the raw request body (\"<t>.<body>\"), compared in constant time. Deliveries whose timestamp is more than five minutes from now are refused. The body is application/x-www-form-urlencoded with bracketed keys (type=unsubscribe&data[email]=…), and is verified before it's decoded. Mailchimp checks the URL with a GET when the webhook is created, which is answered 200.",
} as const;
export const webhookEvents = ['subscribe', 'unsubscribe', 'profile', 'upemail', 'cleaned', 'campaign'] as const;
export type MailchimpWebhookEvent = (typeof webhookEvents)[number];
