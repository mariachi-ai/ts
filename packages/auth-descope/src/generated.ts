// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Descope: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'descope',
  name: 'Descope',
  category: 'auth',
  server: 'api.descope.com',
  baseUrl: 'https://api.descope.com',
  docs: 'https://docs.descope.com/api',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'projectId',
    env: 'DESCOPE_PROJECT_ID',
    label: 'Project ID',
    meaning: "The Descope project the app signs users in to. Its keys verify session tokens, and it goes in every API call's Authorization header.",
    secret: false,
    required: true,
    whereToFind: 'Console › Project Settings: Project ID. Test and live are separate projects, each with its own ID.',
    url: 'https://app.descope.com/settings/project',
    public: true,
  },
  {
    key: 'managementKey',
    env: 'DESCOPE_MANAGEMENT_KEY',
    label: 'Management key',
    meaning: 'Lets the server read, create and delete users and set their passwords. Only needed for those calls; never in a browser.',
    secret: true,
    required: false,
    whereToFind: 'Console › Company settings › Management keys › Generate, with access to this project. Each project (test, live) is reached with a key that covers it.',
    url: 'https://docs.descope.com/management/company-settings/mgmt-keys-sdks',
  },
  {
    key: 'webhookSecret',
    env: 'DESCOPE_WEBHOOK_SECRET',
    label: 'Webhook HMAC secret',
    meaning: 'Checks that a webhook came from Descope: the connector signs each body with it. You choose it.',
    secret: true,
    required: false,
    whereToFind: 'Any long random string of your own, set as the HMAC secret of the Audit Webhook (or HTTP) connector that posts to the app: Console › Connectors.',
    url: 'https://docs.descope.com/connectors/connector-hmac-usage',
  },
];

/** The config `createDescope` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  projectId: z.string().min(1),
  managementKey: z.string().min(1).optional(),
  webhookSecret: z.string().min(1).optional(),
});
export type DescopeConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  projectId: 'DESCOPE_PROJECT_ID',
  managementKey: 'DESCOPE_MANAGEMENT_KEY',
  webhookSecret: 'DESCOPE_WEBHOOK_SECRET',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'password.signIn': {
    purpose: 'Signs a user in with their login id (email) and password.',
    method: 'POST',
    path: '/v1/auth/password/signin',
    idempotency: 'none',
  },
  'password.sendReset': {
    purpose: "Emails a user a password reset link; the link's token is verified with magicLink.verify.",
    method: 'POST',
    path: '/v1/auth/password/reset',
    idempotency: 'none',
  },
  'password.update': {
    purpose: "Sets a signed-in user's new password, with their refresh JWT.",
    method: 'POST',
    path: '/v1/auth/password/update',
    idempotency: 'natural',
  },
  'magicLink.verify': {
    purpose: "Verifies a magic link's token (a password reset's) and signs the user in.",
    method: 'POST',
    path: '/v1/auth/magiclink/verify',
    idempotency: 'none',
  },
  'otp.signUpOrInEmail': {
    purpose: 'Emails a one-time code to sign in, signing the user up first when the address is new.',
    method: 'POST',
    path: '/v1/auth/otp/signup-in/email',
    idempotency: 'none',
  },
  'otp.verifyEmail': {
    purpose: 'Signs a user in with the emailed one-time code.',
    method: 'POST',
    path: '/v1/auth/otp/verify/email',
    idempotency: 'none',
  },
  'sessions.refresh': {
    purpose: 'Exchanges a refresh JWT for a new session JWT.',
    method: 'POST',
    path: '/v1/auth/refresh',
    idempotency: 'natural',
  },
  'sessions.logout': {
    purpose: 'Ends the session a refresh JWT belongs to.',
    method: 'POST',
    path: '/v1/auth/logout',
    idempotency: 'natural',
  },
  'users.load': {
    purpose: 'Reads one user by user id, with the management key.',
    method: 'GET',
    path: '/v1/mgmt/user',
    idempotency: 'natural',
  },
  'users.search': {
    purpose: 'Searches users, here by email address, with the management key.',
    method: 'POST',
    path: '/v2/mgmt/user/search',
    idempotency: 'natural',
  },
  'users.create': {
    purpose: 'Creates a user with the email as login id, verified or not, with the management key.',
    method: 'POST',
    path: '/v1/mgmt/user/create',
    idempotency: 'none',
  },
  'users.delete': {
    purpose: 'Deletes a user by user id, with the management key.',
    method: 'POST',
    path: '/v1/mgmt/user/delete',
    idempotency: 'natural',
  },
  'users.setActivePassword': {
    purpose: "Sets a user's password, which they can sign in with as it is, with the management key.",
    method: 'POST',
    path: '/v1/mgmt/user/password/set/active',
    idempotency: 'natural',
  },
} as const;
export type DescopeOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  E062108: {
    category: 'not-found',
    reason: 'user-not-found',
  },
  E061102: {
    category: 'invalid-request',
    reason: 'wrong-otp-code',
  },
  E061103: {
    category: 'invalid-request',
    reason: 'too-many-otp-attempts',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'hmac-sha256-base64',
  header: 'x-descope-webhook-s256',
  secretSetting: 'webhookSecret',
  description: "The header is the base64 HMAC-SHA256 of the raw request body, keyed with the connector's HMAC secret. Nothing signs a timestamp or a delivery id, so a captured delivery can be replayed: deduplicating on the signature is the only protection.",
} as const;
export const webhookEvents = ['UserCreated', 'UserModified', 'UserDeleted', 'LoginSucceed', 'TenantCreated', 'TenantDeleted'] as const;
export type DescopeWebhookEvent = (typeof webhookEvents)[number];
