// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Zendesk: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'zendesk',
  name: 'Zendesk',
  category: 'support',
  server: '{subdomain}.zendesk.com',
  baseUrl: 'https://{subdomain}.zendesk.com',
  docs: 'https://developer.zendesk.com/api-reference/',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'subdomain',
    env: 'ZENDESK_SUBDOMAIN',
    label: 'Subdomain',
    meaning: 'The account the app talks to: acme for https://acme.zendesk.com.',
    secret: false,
    required: true,
    whereToFind: "The first part of the account's address, https://<subdomain>.zendesk.com. Zendesk has no test keys: for test, use a sandbox (Enterprise plans: Admin Center › Account › Sandbox) or a trial account, each with its own subdomain and its own credentials.",
    url: 'https://support.zendesk.com/hc/en-us/articles/6150628316058',
    public: true,
  },
  {
    key: 'clientId',
    env: 'ZENDESK_CLIENT_ID',
    label: 'OAuth client identifier',
    meaning: 'With the client secret, gets the server its access tokens to the Support API (OAuth client credentials). Requests act as the admin who made the client.',
    secret: false,
    required: false,
    whereToFind: 'Admin Center › Apps and integrations › APIs › OAuth clients › Add OAuth client, kind Confidential: the Identifier. Make it as a dedicated admin or agent if who did what matters in audits.',
    url: 'https://developer.zendesk.com/documentation/api-basics/authentication/oauth-migration/',
  },
  {
    key: 'clientSecret',
    env: 'ZENDESK_CLIENT_SECRET',
    label: 'OAuth client secret',
    meaning: "The confidential OAuth client's secret. Never sent to a browser.",
    secret: true,
    required: false,
    whereToFind: 'Admin Center › Apps and integrations › APIs › OAuth clients: the Secret, shown once when the client is saved.',
    url: 'https://developer.zendesk.com/api-reference/ticketing/oauth/grant_type_tokens/',
  },
  {
    key: 'email',
    env: 'ZENDESK_EMAIL',
    label: "API token's agent email",
    meaning: 'Only with an API token: the email address of the agent or admin the token signs in as.',
    secret: false,
    required: false,
    whereToFind: 'The email address of the agent whose API token ZENDESK_API_TOKEN is. API tokens are being retired (no new ones since October 27, 2026; all stop on April 30, 2027): use an OAuth client instead.',
    url: 'https://developer.zendesk.com/api-reference/introduction/security-and-auth/',
  },
  {
    key: 'apiToken',
    env: 'ZENDESK_API_TOKEN',
    label: 'API token (legacy)',
    meaning: 'Only for an account that still has one: signs in to the Support API as ZENDESK_EMAIL. Used when no OAuth client is set.',
    secret: true,
    required: false,
    whereToFind: 'Admin Center › Apps and integrations › APIs › API tokens. Zendesk no longer issues new ones and turns the rest off on April 30, 2027.',
    url: 'https://developer.zendesk.com/documentation/api-basics/authentication/oauth-migration/',
  },
  {
    key: 'widgetKey',
    env: 'ZENDESK_WIDGET_KEY',
    label: 'Web Widget key',
    meaning: "Which messaging Web Widget the app's pages load.",
    secret: false,
    required: false,
    whereToFind: "Admin Center › Channels › Messaging and social › Messaging › your widget › Installation: the key= value in the snippet's address.",
    url: 'https://support.zendesk.com/hc/en-us/articles/4500748175258',
    public: true,
  },
  {
    key: 'messagingKeyId',
    env: 'ZENDESK_MESSAGING_KEY_ID',
    label: 'Messaging signing key ID',
    meaning: 'Names the signing key in the header (kid) of the JWT that signs a user in to the Web Widget.',
    secret: false,
    required: false,
    whereToFind: "Admin Center › Account › Security › End user authentication › Messaging › Create key: the key's ID, listed on that tab (it looks like app_5963ceb97cde542d000dbdb1).",
    url: 'https://support.zendesk.com/hc/en-us/articles/4411666638746',
  },
  {
    key: 'messagingSecret',
    env: 'ZENDESK_MESSAGING_SECRET',
    label: 'Messaging signing key secret',
    meaning: 'Signs (HS256) the JWT that tells the Web Widget who the user is, so nobody can claim to be someone else. Never sent to a browser.',
    secret: true,
    required: false,
    whereToFind: 'Admin Center › Account › Security › End user authentication › Messaging › Create key: the shared secret, shown in full only when the key is made.',
    url: 'https://developer.zendesk.com/documentation/conversations/messaging-platform/users/authenticating-users/',
  },
  {
    key: 'webhookSecret',
    env: 'ZENDESK_WEBHOOK_SECRET',
    label: 'Webhook signing secret',
    meaning: 'Checks that a webhook came from Zendesk. Each webhook has its own.',
    secret: true,
    required: false,
    whereToFind: 'Admin Center › Apps and integrations › Webhooks › Webhooks › your webhook › Reveal secret (or the Show Webhook Signing Secret API).',
    url: 'https://developer.zendesk.com/documentation/webhooks/verifying/',
  },
  {
    key: 'eventSource',
    env: 'ZENDESK_EVENT_SOURCE',
    label: 'Events source name',
    meaning: "The name trackEvent gives the app in a user's event timeline, and the source of the profiles it makes. app when unset; zendesk is reserved.",
    secret: false,
    required: false,
    whereToFind: "A short name of your own, such as the app's name. Keep it stable: it is part of each user profile's identity.",
    url: 'https://developer.zendesk.com/documentation/ticketing/events/tracking-events/',
  },
];

/** The config `createZendesk` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  subdomain: z.string().min(1),
  clientId: z.string().min(1).optional(),
  clientSecret: z.string().min(1).optional(),
  email: z.string().min(1).optional(),
  apiToken: z.string().min(1).optional(),
  widgetKey: z.string().min(1).optional(),
  messagingKeyId: z.string().min(1).optional(),
  messagingSecret: z.string().min(1).optional(),
  webhookSecret: z.string().min(1).optional(),
  eventSource: z.string().min(1).optional(),
});
export type ZendeskConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  subdomain: 'ZENDESK_SUBDOMAIN',
  clientId: 'ZENDESK_CLIENT_ID',
  clientSecret: 'ZENDESK_CLIENT_SECRET',
  email: 'ZENDESK_EMAIL',
  apiToken: 'ZENDESK_API_TOKEN',
  widgetKey: 'ZENDESK_WIDGET_KEY',
  messagingKeyId: 'ZENDESK_MESSAGING_KEY_ID',
  messagingSecret: 'ZENDESK_MESSAGING_SECRET',
  webhookSecret: 'ZENDESK_WEBHOOK_SECRET',
  eventSource: 'ZENDESK_EVENT_SOURCE',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'oauth.token': {
    purpose: "Gets an access token for the Support API with the OAuth client's identifier and secret (grant_type client_credentials).",
    method: 'POST',
    path: '/oauth/tokens',
    idempotency: 'natural',
  },
  'users.createOrUpdate': {
    purpose: 'Creates a user, or updates the one with this external_id or email address. Answers 201 when it created one, 200 when it updated one.',
    method: 'POST',
    path: '/api/v2/users/create_or_update',
    idempotency: 'natural',
  },
  'users.get': {
    purpose: 'Reads one user by Zendesk id.',
    method: 'GET',
    path: '/api/v2/users/{userId}',
    idempotency: 'natural',
  },
  'users.search': {
    purpose: "Finds users by external_id, or by a query in Zendesk's search syntax, a page at a time.",
    method: 'GET',
    path: '/api/v2/users/search',
    idempotency: 'natural',
  },
  'organizations.createOrUpdate': {
    purpose: 'Creates an organization, or updates the one with this external_id or id (never matched by name).',
    method: 'POST',
    path: '/api/v2/organizations/create_or_update',
    idempotency: 'natural',
  },
  'tickets.create': {
    purpose: 'Creates a ticket with its first comment. The same Idempotency-Key and body within two hours gives back the same ticket.',
    method: 'POST',
    path: '/api/v2/tickets',
    idempotency: {
      header: 'Idempotency-Key',
    },
  },
  'tickets.get': {
    purpose: 'Reads one ticket.',
    method: 'GET',
    path: '/api/v2/tickets/{ticketId}',
    idempotency: 'natural',
  },
  'tickets.update': {
    purpose: "Changes a ticket's status, priority, subject, tags or fields, optionally adding a comment.",
    method: 'PUT',
    path: '/api/v2/tickets/{ticketId}',
    idempotency: 'none',
  },
  'tickets.listRequested': {
    purpose: 'Lists the tickets a user requested, a page at a time (cursor pagination).',
    method: 'GET',
    path: '/api/v2/users/{userId}/tickets/requested',
    idempotency: 'natural',
  },
  'tickets.search': {
    purpose: "Finds tickets with Zendesk's search syntax (type:ticket is added), a page at a time.",
    method: 'GET',
    path: '/api/v2/search',
    idempotency: 'natural',
  },
  'comments.list': {
    purpose: "Lists a ticket's comments, oldest first, a page at a time (cursor pagination).",
    method: 'GET',
    path: '/api/v2/tickets/{ticketId}/comments',
    idempotency: 'natural',
  },
  'comments.add': {
    purpose: 'Adds a public reply or an internal note to a ticket: a ticket update carrying only a comment.',
    method: 'PUT',
    path: '/api/v2/tickets/{ticketId}',
    idempotency: 'none',
  },
  'events.track': {
    purpose: "Records an event in a user's timeline (the Events API), against a profile identified by the user's external_id. Answers 202.",
    method: 'POST',
    path: '/api/v2/user_profiles/events',
    idempotency: 'none',
  },
} as const;
export type ZendeskOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  RecordNotFound: {
    category: 'not-found',
    reason: 'not-found',
  },
  RecordInvalid: {
    category: 'invalid-request',
    reason: 'record-invalid',
  },
  IdempotentRequestError: {
    category: 'conflict',
    reason: 'idempotency-key-reused',
  },
  invalid_token: {
    category: 'unauthorized',
    reason: 'invalid-token',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'hmac-sha256-timestamped',
  header: 'X-Zendesk-Webhook-Signature',
  secretSetting: 'webhookSecret',
  description: "X-Zendesk-Webhook-Signature is the base64 HMAC-SHA256, keyed with the webhook's signing secret (its text, as shown), of the X-Zendesk-Webhook-Signature-Timestamp header's value (ISO 8601, such as 2021-03-25T05:09:27Z) followed by the raw request body. A delivery whose timestamp is more than five minutes from now is refused. Zendesk event deliveries are deduplicated on the body's id; trigger and automation deliveries, whose body the account writes, on the signature.",
} as const;
export const webhookEvents = ['zen:event-type:ticket.created', 'zen:event-type:ticket.comment_added', 'zen:event-type:ticket.status_changed', 'zen:event-type:ticket.agent_assignment_changed', 'zen:event-type:ticket.priority_changed', 'zen:event-type:ticket.tags_changed', 'zen:event-type:ticket.soft_deleted', 'zen:event-type:user.created', 'zen:event-type:user.deleted', 'zen:event-type:user.merged', 'zen:event-type:user.external_id_changed', 'zen:event-type:organization.created', 'zen:event-type:organization.deleted'] as const;
export type ZendeskWebhookEvent = (typeof webhookEvents)[number];
