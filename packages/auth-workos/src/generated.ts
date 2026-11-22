// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** WorkOS: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'workos',
  name: 'WorkOS',
  category: 'auth',
  server: 'api.workos.com',
  docs: 'https://workos.com/docs/reference/user-management',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'apiKey',
    env: 'WORKOS_API_KEY',
    label: 'API key',
    meaning: 'Authenticates the backend to the User Management API. Server-side only.',
    secret: true,
    required: false,
    whereToFind: 'Dashboard › API Keys, in the environment: Staging for test, Production for live, each with its own key and client id.',
    url: 'https://workos.com/docs/reference/api-keys',
  },
  {
    key: 'clientId',
    env: 'WORKOS_CLIENT_ID',
    label: 'Client ID',
    meaning: "The environment's client id: names its JWKS (/sso/jwks/<clientId>) and its tokens' issuer, and signs users in.",
    secret: false,
    required: true,
    whereToFind: 'Dashboard › API Keys › Client ID, per environment.',
    url: 'https://workos.com/docs/reference/client-id',
    public: true,
  },
  {
    key: 'apiHostname',
    env: 'WORKOS_API_HOSTNAME',
    label: 'API host',
    meaning: "WorkOS's API host, for a custom authentication domain. Default api.workos.com.",
    secret: false,
    required: false,
    whereToFind: 'Usually not needed. Otherwise Dashboard › Domains.',
    url: 'https://workos.com/docs/custom-domains',
    public: true,
  },
  {
    key: 'webhookSecret',
    env: 'WORKOS_WEBHOOK_SECRET',
    label: 'Webhook signing secret',
    meaning: 'Checks that a webhook came from WorkOS.',
    secret: true,
    required: false,
    whereToFind: 'Dashboard › Webhooks › the endpoint › Signing secret.',
    url: 'https://workos.com/docs/events/data-syncing/webhooks',
  },
];

/** The config `createWorkos` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  apiKey: z.string().min(1).optional(),
  clientId: z.string().min(1),
  apiHostname: z.string().min(1).optional(),
  webhookSecret: z.string().min(1).optional(),
});
export type WorkosConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  apiKey: 'WORKOS_API_KEY',
  clientId: 'WORKOS_CLIENT_ID',
  apiHostname: 'WORKOS_API_HOSTNAME',
  webhookSecret: 'WORKOS_WEBHOOK_SECRET',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'authenticate.password': {
    purpose: 'Signs a user in with their email and password.',
    method: 'POST',
    path: '/user_management/authenticate',
    idempotency: 'none',
  },
  'authenticate.code': {
    purpose: 'Exchanges the authorization code from AuthKit, with its PKCE verifier, for tokens.',
    method: 'POST',
    path: '/user_management/authenticate',
    idempotency: 'none',
  },
  'authenticate.refreshToken': {
    purpose: 'Exchanges a refresh token for new tokens.',
    method: 'POST',
    path: '/user_management/authenticate',
    idempotency: 'none',
  },
  'authenticate.magicAuth': {
    purpose: 'Signs a user in with the one-time code from a Magic Auth.',
    method: 'POST',
    path: '/user_management/authenticate',
    idempotency: 'none',
  },
  'authenticate.emailVerification': {
    purpose: 'Finishes a sign-in held for email verification, with the code and the pending authentication token.',
    method: 'POST',
    path: '/user_management/authenticate',
    idempotency: 'none',
  },
  'sessions.revoke': {
    purpose: 'Revokes a session.',
    method: 'POST',
    path: '/user_management/sessions/revoke',
    idempotency: 'natural',
  },
  'users.get': {
    purpose: 'Reads one user by id.',
    method: 'GET',
    path: '/user_management/users/{id}',
    idempotency: 'natural',
  },
  'users.list': {
    purpose: 'Lists users, here filtered by email address.',
    method: 'GET',
    path: '/user_management/users',
    idempotency: 'natural',
  },
  'users.create': {
    purpose: 'Creates a user.',
    method: 'POST',
    path: '/user_management/users',
    idempotency: 'none',
  },
  'users.update': {
    purpose: 'Updates a user: here, sets their password.',
    method: 'PUT',
    path: '/user_management/users/{id}',
    idempotency: 'natural',
  },
  'users.delete': {
    purpose: 'Deletes a user.',
    method: 'DELETE',
    path: '/user_management/users/{id}',
    idempotency: 'natural',
  },
  'passwordResets.create': {
    purpose: 'Starts a password reset: its token and URL for the app to send, or WorkOS emails it.',
    method: 'POST',
    path: '/user_management/password_reset',
    idempotency: 'none',
  },
  'passwordResets.confirm': {
    purpose: 'Sets a new password with a reset token.',
    method: 'POST',
    path: '/user_management/password_reset/confirm',
    idempotency: 'none',
  },
  'magicAuth.create': {
    purpose: 'Starts a Magic Auth: a one-time sign-in code for the app to send, or WorkOS emails it.',
    method: 'POST',
    path: '/user_management/magic_auth',
    idempotency: 'none',
  },
  'emailVerifications.get': {
    purpose: 'Reads an email verification, for the code the app sends.',
    method: 'GET',
    path: '/user_management/email_verification/{id}',
    idempotency: 'natural',
  },
  'jwks.get': {
    purpose: "Reads the environment's signing keys: when none are cached, when the cache expires, and when a token names a key not yet seen (at most once per cooldown).",
    method: 'GET',
    path: '/sso/jwks/{clientId}',
    idempotency: 'natural',
  },
} as const;
export type WorkosOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  invalid_credentials: {
    category: 'invalid-request',
    reason: 'invalid-credentials',
  },
  invalid_grant: {
    category: 'invalid-request',
    reason: 'invalid-grant',
  },
  email_verification_required: {
    category: 'forbidden',
    reason: 'email-verification-required',
  },
  mfa_challenge: {
    category: 'forbidden',
    reason: 'mfa-challenge',
  },
  mfa_enrollment: {
    category: 'forbidden',
    reason: 'mfa-enrollment',
  },
  organization_selection_required: {
    category: 'forbidden',
    reason: 'organization-selection-required',
  },
  sso_required: {
    category: 'forbidden',
    reason: 'sso-required',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'hmac-sha256-timestamped',
  header: 'WorkOS-Signature',
  secretSetting: 'webhookSecret',
  description: "The header is 't=<milliseconds>, v1=<hex>'. v1 is the hex HMAC-SHA256, keyed with the secret, of '<t>.<raw body>'. Compare in constant time and refuse a t more than three minutes away.",
} as const;
export const webhookEvents = ['user.created', 'user.updated', 'user.deleted', 'session.created', 'organization.created', 'organization.updated', 'organization.deleted', 'organization_membership.created', 'organization_membership.updated', 'organization_membership.deleted'] as const;
export type WorkosWebhookEvent = (typeof webhookEvents)[number];
