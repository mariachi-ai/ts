// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Crisp: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'crisp',
  name: 'Crisp',
  category: 'support',
  server: 'api.crisp.chat',
  baseUrl: 'https://api.crisp.chat/v1',
  docs: 'https://docs.crisp.chat/references/rest-api/v1/',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'websiteId',
    env: 'CRISP_WEBSITE_ID',
    label: 'Website ID',
    meaning: "Which Crisp website the chat widget opens and the REST operations act on. It's in every page that shows the widget.",
    secret: false,
    required: true,
    whereToFind: 'Settings › Workspace Settings › Setup & Integrations: the Website ID in the chatbox code. Crisp has no test mode: use a separate website (workspace) for test.',
    url: 'https://help.crisp.chat/en/article/how-to-find-the-website-id-1ylqx1s/',
    public: true,
  },
  {
    key: 'tokenIdentifier',
    env: 'CRISP_TOKEN_IDENTIFIER',
    label: 'API token identifier',
    meaning: 'The first half of the REST API token, sent with the key as Basic authentication. Only the REST operations need it.',
    secret: false,
    required: false,
    whereToFind: "Settings › Workspace Settings › Advanced configuration › API Token › Generate Token (an owner only; shown once). For a Marketplace plugin's token instead, set CRISP_TOKEN_TIER=plugin.",
    url: 'https://docs.crisp.chat/guides/rest-api/authentication/website-token/',
  },
  {
    key: 'tokenKey',
    env: 'CRISP_TOKEN_KEY',
    label: 'API token key',
    meaning: 'The secret half of the REST API token.',
    secret: true,
    required: false,
    whereToFind: 'Shown once, beside the identifier, when the API token is generated.',
    url: 'https://docs.crisp.chat/guides/rest-api/authentication/website-token/',
  },
  {
    key: 'tokenTier',
    env: 'CRISP_TOKEN_TIER',
    label: 'API token kind',
    meaning: "website (the default) for a token generated in the workspace's settings; plugin for a Marketplace plugin's token. Sent as the X-Crisp-Tier header.",
    secret: false,
    required: false,
    whereToFind: 'website, unless the token came from a plugin at marketplace.crisp.chat (Tokens › Production, installed on the website).',
    url: 'https://docs.crisp.chat/guides/rest-api/authentication/plugin-token/',
  },
  {
    key: 'identitySecret',
    env: 'CRISP_IDENTITY_SECRET',
    label: 'Identity verification secret',
    meaning: "Signs the signed-in user's email for the chat widget, so a visitor can't claim to be someone else, and derives each user's session token. Only chatIdentity needs it.",
    secret: true,
    required: false,
    whereToFind: 'Settings › Workspace Settings › Advanced configuration › Identity Verification: turn on "Verify user emails with cryptographic signatures" and copy the secret key (an owner only; from the Mini plan).',
    url: 'https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/identity-verification/',
  },
  {
    key: 'webhookSecret',
    env: 'CRISP_WEBHOOK_SECRET',
    label: 'Web hook secret',
    meaning: "Checks that a web hook came from Crisp. For a plugin's web hooks, the signing secret Crisp shows; for a website's own web hooks (which Crisp doesn't sign), a random key of your own in the hook's URL.",
    secret: true,
    required: false,
    whereToFind: "Plugin hooks: marketplace.crisp.chat › your plugin › Web Hooks: the signing secret shown when the hook is made. Website hooks: any long random string, added to the hook's URL as ?key=… (Settings › Advanced configuration › Web Hooks).",
    url: 'https://docs.crisp.chat/guides/web-hooks/quickstart/',
  },
];

/** The config `createCrisp` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  websiteId: z.string().min(1),
  tokenIdentifier: z.string().min(1).optional(),
  tokenKey: z.string().min(1).optional(),
  tokenTier: z.string().min(1).optional(),
  identitySecret: z.string().min(1).optional(),
  webhookSecret: z.string().min(1).optional(),
});
export type CrispConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  websiteId: 'CRISP_WEBSITE_ID',
  tokenIdentifier: 'CRISP_TOKEN_IDENTIFIER',
  tokenKey: 'CRISP_TOKEN_KEY',
  tokenTier: 'CRISP_TOKEN_TIER',
  identitySecret: 'CRISP_IDENTITY_SECRET',
  webhookSecret: 'CRISP_WEBHOOK_SECRET',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'people.create': {
    purpose: 'Adds a people profile: its email (unique on the website) and nickname.',
    method: 'POST',
    path: '/website/{websiteId}/people/profile',
    idempotency: 'none',
  },
  'people.get': {
    purpose: 'Reads a people profile by its people_id or by its email.',
    method: 'GET',
    path: '/website/{websiteId}/people/profile/{peopleId}',
    idempotency: 'natural',
  },
  'people.update': {
    purpose: 'Updates the fields given on a people profile, keeping the rest.',
    method: 'PATCH',
    path: '/website/{websiteId}/people/profile/{peopleId}',
    idempotency: 'natural',
  },
  'people.updateData': {
    purpose: "Merges custom data keys (strings, numbers, booleans) into a people profile's data.",
    method: 'PATCH',
    path: '/website/{websiteId}/people/data/{peopleId}',
    idempotency: 'natural',
  },
  'people.addEvent': {
    purpose: "Stacks an event on a people profile's timeline: its text, optional data and color.",
    method: 'POST',
    path: '/website/{websiteId}/people/events/{peopleId}',
    idempotency: 'none',
  },
  'conversations.list': {
    purpose: "Lists the website's conversations, a page at a time, optionally only unread, resolved or unresolved, or matching a search.",
    method: 'GET',
    path: '/website/{websiteId}/conversations/{pageNumber}',
    idempotency: 'natural',
  },
  'conversations.get': {
    purpose: "Reads one conversation: its state, people_id, whether the visitor's email is verified, and its last message.",
    method: 'GET',
    path: '/website/{websiteId}/conversation/{sessionId}',
    idempotency: 'natural',
  },
  'conversations.sendMessage': {
    purpose: 'Sends a text message, or a private note, in a conversation as an operator.',
    method: 'POST',
    path: '/website/{websiteId}/conversation/{sessionId}/message',
    idempotency: 'none',
  },
  'conversations.setState': {
    purpose: "Changes a conversation's state: pending, unresolved or resolved.",
    method: 'PATCH',
    path: '/website/{websiteId}/conversation/{sessionId}/state',
    idempotency: 'natural',
  },
  'conversations.getMeta': {
    purpose: "Reads a conversation's metas: the visitor's nickname, email, phone, data and segments, and the subject.",
    method: 'GET',
    path: '/website/{websiteId}/conversation/{sessionId}/meta',
    idempotency: 'natural',
  },
  'conversations.updateMeta': {
    purpose: 'Updates the given metas of a conversation: nickname, email, phone, subject, data or segments.',
    method: 'PATCH',
    path: '/website/{websiteId}/conversation/{sessionId}/meta',
    idempotency: 'natural',
  },
} as const;
export type CrispOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  invalid_session: {
    category: 'unauthorized',
    reason: 'invalid-token',
  },
  authenticated_route: {
    category: 'unauthorized',
    reason: 'invalid-token',
  },
  ip_not_whitelisted: {
    category: 'forbidden',
    reason: 'ip-not-allowed',
  },
  invalid_data: {
    category: 'invalid-request',
    reason: 'invalid-data',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'hmac-sha256-timestamped',
  header: 'X-Crisp-Signature',
  secretSetting: 'webhookSecret',
  description: "Plugin hooks only: X-Crisp-Signature is the hex HMAC-SHA256, keyed with the hook's signing secret, of the string [timestamp;body], where timestamp is the X-Crisp-Request-Timestamp header exactly as sent and body is the JSON body as a string (JSON.stringify of the parsed body), with the brackets and semicolon included. Website hooks (set up in the website's settings) aren't signed: Crisp advises a key of your own as a ?key= URL parameter, compared on arrival.",
} as const;
export const webhookEvents = ['message:send', 'message:received', 'message:updated', 'message:removed', 'session:set_email', 'session:set_nickname', 'session:set_data', 'session:set_segments', 'session:set_state', 'session:removed', 'people:profile:created', 'people:profile:updated', 'people:profile:removed', 'people:bind:session'] as const;
export type CrispWebhookEvent = (typeof webhookEvents)[number];
