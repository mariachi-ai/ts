// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Intercom: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'intercom',
  name: 'Intercom',
  category: 'support',
  server: 'api.intercom.io',
  baseUrl: 'https://api.intercom.io',
  docs: 'https://developers.intercom.com/docs/references/rest-api/api.intercom.io',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'accessToken',
    env: 'INTERCOM_ACCESS_TOKEN',
    label: 'Access token',
    meaning: "Calls Intercom's REST API as the app: contacts, companies, events, conversations and notes.",
    secret: true,
    required: true,
    whereToFind: 'Developer Hub › your app › Configure › Authentication: Access token. Intercom has no test mode: use a separate development workspace, with its own app, for test.',
    url: 'https://developers.intercom.com/docs/build-an-integration/learn-more/authentication',
  },
  {
    key: 'appId',
    env: 'INTERCOM_APP_ID',
    label: 'Workspace ID',
    meaning: 'The workspace the Messenger opens: its app_id. Intercom calls it both the workspace ID and the app ID.',
    secret: false,
    required: false,
    whereToFind: 'The part of the Intercom address after /apps/ (app.intercom.com/a/apps/<workspace ID>/…), or app_id in Settings › Channels › Messenger › Install.',
    url: 'https://developers.intercom.com/installing-intercom/web/installation',
    public: true,
  },
  {
    key: 'region',
    env: 'INTERCOM_REGION',
    label: 'Data region',
    meaning: "Where the workspace's data is hosted: us (the default), eu or au. It picks the REST API's address and the Messenger's api_base.",
    secret: false,
    required: false,
    whereToFind: "The workspace's Intercom address: app.intercom.com is us, app.eu.intercom.com is eu, app.au.intercom.com is au.",
    url: 'https://developers.intercom.com/docs/build-an-integration/learn-more/rest-apis',
    public: true,
  },
  {
    key: 'messengerSecret',
    env: 'INTERCOM_MESSENGER_SECRET',
    label: 'Messenger API secret',
    meaning: "Signs the JWT that tells the Messenger who the signed-in user is (Messenger security), so nobody can open another user's conversations.",
    secret: true,
    required: false,
    whereToFind: "Settings › Workspace › Security › Messenger: the JWT setup's secret key. Test and production workspaces have different keys.",
    url: 'https://www.intercom.com/help/en/articles/10589769-authenticating-users-in-the-messenger-with-json-web-tokens-jwts',
  },
  {
    key: 'clientSecret',
    env: 'INTERCOM_CLIENT_SECRET',
    label: 'Client secret',
    meaning: "Checks that a webhook came from Intercom: each notification is signed with the app's client secret.",
    secret: true,
    required: false,
    whereToFind: 'Developer Hub › your app › Configure › Basic information: Client secret.',
    url: 'https://developers.intercom.com/docs/references/webhooks/webhook-models',
  },
];

/** The config `createIntercom` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  accessToken: z.string().min(1),
  appId: z.string().min(1).optional(),
  region: z.string().min(1).optional(),
  messengerSecret: z.string().min(1).optional(),
  clientSecret: z.string().min(1).optional(),
});
export type IntercomConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  accessToken: 'INTERCOM_ACCESS_TOKEN',
  appId: 'INTERCOM_APP_ID',
  region: 'INTERCOM_REGION',
  messengerSecret: 'INTERCOM_MESSENGER_SECRET',
  clientSecret: 'INTERCOM_CLIENT_SECRET',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'contacts.create': {
    purpose: "Creates a user (or a lead), with the app's own id as external_id.",
    method: 'POST',
    path: '/contacts',
    idempotency: 'none',
  },
  'contacts.update': {
    purpose: "Updates a contact's email, name, custom attributes and the rest.",
    method: 'PUT',
    path: '/contacts/{contactId}',
    idempotency: 'natural',
  },
  'contacts.get': {
    purpose: "Reads one contact by Intercom's id.",
    method: 'GET',
    path: '/contacts/{contactId}',
    idempotency: 'natural',
  },
  'contacts.findByExternalId': {
    purpose: "Reads one user by the app's own id (users only, not leads).",
    method: 'GET',
    path: '/contacts/find_by_external_id/{externalId}',
    idempotency: 'natural',
  },
  'contacts.search': {
    purpose: 'Finds contacts by their attributes (email, external_id, role…), a page at a time. New contacts can take a few minutes to appear.',
    method: 'POST',
    path: '/contacts/search',
    idempotency: 'natural',
  },
  'contacts.attachCompany': {
    purpose: 'Attaches a company to a contact.',
    method: 'POST',
    path: '/contacts/{contactId}/companies',
    idempotency: 'natural',
  },
  'companies.createOrUpdate': {
    purpose: "Creates the company with this company_id (the app's own id), or updates it when it exists.",
    method: 'POST',
    path: '/companies',
    idempotency: 'natural',
  },
  'events.create': {
    purpose: 'Records that a user did something (a data event). Intercom ignores a repeat with the same user, name and created_at.',
    method: 'POST',
    path: '/events',
    idempotency: 'natural',
  },
  'conversations.list': {
    purpose: 'Lists conversations, a page at a time.',
    method: 'GET',
    path: '/conversations',
    idempotency: 'natural',
  },
  'conversations.search': {
    purpose: 'Finds conversations by their attributes (contact_ids, state, updated_at…), a page at a time.',
    method: 'POST',
    path: '/conversations/search',
    idempotency: 'natural',
  },
  'conversations.get': {
    purpose: 'Reads one conversation, with its parts.',
    method: 'GET',
    path: '/conversations/{conversationId}',
    idempotency: 'natural',
  },
  'conversations.reply': {
    purpose: 'Replies to a conversation as an admin: a comment the user sees, or a note only teammates see.',
    method: 'POST',
    path: '/conversations/{conversationId}/reply',
    idempotency: 'none',
  },
  'conversations.close': {
    purpose: 'Closes a conversation as an admin, optionally with a last message.',
    method: 'POST',
    path: '/conversations/{conversationId}/parts',
    idempotency: 'none',
  },
  'notes.create': {
    purpose: 'Adds a note to a contact, which only teammates see.',
    method: 'POST',
    path: '/contacts/{contactId}/notes',
    idempotency: 'none',
  },
} as const;
export type IntercomOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  unauthorized: {
    category: 'unauthorized',
    reason: 'unauthorized',
  },
  token_not_found: {
    category: 'unauthorized',
    reason: 'unauthorized',
  },
  missing_authorization: {
    category: 'unauthorized',
    reason: 'unauthorized',
  },
  token_unauthorized: {
    category: 'forbidden',
    reason: 'forbidden',
  },
  action_forbidden: {
    category: 'forbidden',
    reason: 'forbidden',
  },
  forbidden: {
    category: 'forbidden',
    reason: 'forbidden',
  },
  token_suspended: {
    category: 'forbidden',
    reason: 'workspace-suspended',
  },
  api_plan_restricted: {
    category: 'forbidden',
    reason: 'plan-restricted',
  },
  not_found: {
    category: 'not-found',
    reason: 'not-found',
  },
  admin_not_found: {
    category: 'invalid-request',
    reason: 'admin-not-found',
  },
  conflict: {
    category: 'conflict',
    reason: 'conflict',
  },
  resource_conflict: {
    category: 'conflict',
    reason: 'conflict',
  },
  not_restorable: {
    category: 'conflict',
    reason: 'contact-blocked',
  },
  parameter_invalid: {
    category: 'invalid-request',
    reason: 'invalid-parameter',
  },
  parameter_not_found: {
    category: 'invalid-request',
    reason: 'missing-parameter',
  },
  parameter_missing: {
    category: 'invalid-request',
    reason: 'missing-parameter',
  },
  missing_parameter: {
    category: 'invalid-request',
    reason: 'missing-parameter',
  },
  intercom_version_invalid: {
    category: 'invalid-request',
    reason: 'version-invalid',
  },
  rate_limit_exceeded: {
    category: 'rate-limited',
    reason: 'rate-limited',
  },
  too_many_requests: {
    category: 'rate-limited',
    reason: 'rate-limited',
  },
  server_error: {
    category: 'unavailable',
    reason: 'unavailable',
  },
  service_unavailable: {
    category: 'unavailable',
    reason: 'unavailable',
  },
  request_timeout: {
    category: 'unavailable',
    reason: 'unavailable',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'hmac-sha1-hex',
  header: 'X-Hub-Signature',
  secretSetting: 'clientSecret',
  description: "The header is sha1= followed by the lowercase hex HMAC-SHA1 of the raw request body, keyed with the app's client secret. A retried notification keeps its id (notif_…) but its body changes (delivery_attempts), so dedupe on the body's id.",
} as const;
export const webhookEvents = ['ping', 'conversation.user.created', 'conversation.user.replied', 'conversation.admin.replied', 'conversation.admin.noted', 'conversation.admin.assigned', 'conversation.admin.closed', 'conversation.admin.opened', 'contact.user.created', 'contact.user.updated', 'contact.lead.created', 'contact.deleted', 'contact.merged', 'company.created'] as const;
export type IntercomWebhookEvent = (typeof webhookEvents)[number];
