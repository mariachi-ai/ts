// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Stytch: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'stytch',
  name: 'Stytch',
  category: 'auth',
  server: 'api.stytch.com',
  baseUrl: 'https://api.stytch.com',
  docs: 'https://stytch.com/docs/api-reference/consumer/api',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'projectId',
    env: 'STYTCH_PROJECT_ID',
    label: 'Project ID',
    meaning: 'Names the Stytch environment: the user name of every API call, the audience of its session JWTs and part of their issuer. A live project id calls https://api.stytch.com; any other calls https://test.stytch.com.',
    secret: false,
    required: true,
    whereToFind: 'Dashboard › Project ID & API keys, for the environment (Test or Live). Each environment has its own project id, secret and public token.',
    url: 'https://stytch.com/docs/resources/workspace-management/api-keys',
    public: true,
    environments: {
      test: {
        notStartsWith: ['project-live-'],
        because: "This is a Live project id (project-live-…): use the Test environment's project id. The prefix is how Stytch's own SDKs tell Live from Test.",
      },
      production: {
        startsWith: ['project-live-'],
        because: "Production needs the Live environment's project id, which starts with project-live-. The prefix is how Stytch's own SDKs tell Live from Test.",
      },
    },
  },
  {
    key: 'secret',
    env: 'STYTCH_SECRET',
    label: 'Secret',
    meaning: 'The password of every API call (HTTP Basic, with the project id). Server-side only.',
    secret: true,
    required: true,
    whereToFind: 'Dashboard › Project ID & API keys › Secrets, for the same environment as the project id.',
    url: 'https://stytch.com/docs/resources/workspace-management/api-keys',
  },
  {
    key: 'publicToken',
    env: 'STYTCH_PUBLIC_TOKEN',
    label: 'Public token',
    meaning: "Stytch's frontend SDKs authenticate with it, and the OAuth start URL carries it. Safe in a browser.",
    secret: false,
    required: false,
    whereToFind: 'Dashboard › Project ID & API keys › Public tokens, for the same environment as the project id.',
    url: 'https://stytch.com/docs/resources/workspace-management/api-keys',
    public: true,
  },
  {
    key: 'webhookSecret',
    env: 'STYTCH_WEBHOOK_SECRET',
    label: 'Webhook signing secret',
    meaning: "Checks that a webhook came from Stytch. Stytch sends its webhooks through Svix, signed with the endpoint's secret (whsec_…).",
    secret: true,
    required: false,
    whereToFind: 'Dashboard › Webhooks › the endpoint › Signing Secret.',
    url: 'https://stytch.com/docs/resources/workspace-management/webhooks',
  },
];

/** The config `createStytch` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  projectId: z.string().min(1),
  secret: z.string().min(1),
  publicToken: z.string().min(1).optional(),
  webhookSecret: z.string().min(1).optional(),
});
export type StytchConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  projectId: 'STYTCH_PROJECT_ID',
  secret: 'STYTCH_SECRET',
  publicToken: 'STYTCH_PUBLIC_TOKEN',
  webhookSecret: 'STYTCH_WEBHOOK_SECRET',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'sessions.jwks': {
    purpose: "Reads the keys that sign the project's session JWTs, to check them locally. Keys rotate about every six months; both are served for a month. Needs no credentials.",
    method: 'GET',
    path: '/v1/sessions/jwks/{projectId}',
    idempotency: 'natural',
  },
  'sessions.authenticate': {
    purpose: 'Checks a session token or session JWT with Stytch, so a revoked session fails at once; returns the session, the user and a fresh session JWT.',
    method: 'POST',
    path: '/v1/sessions/authenticate',
    idempotency: 'natural',
  },
  'sessions.revoke': {
    purpose: 'Ends a session, by its id or token. Its JWTs still pass a local check until they expire (five minutes).',
    method: 'POST',
    path: '/v1/sessions/revoke',
    idempotency: 'natural',
  },
  'passwords.authenticate': {
    purpose: 'Signs a user in with their email and password, starting a session.',
    method: 'POST',
    path: '/v1/passwords/authenticate',
    idempotency: 'none',
  },
  'passwords.create': {
    purpose: 'Creates a user with an email and password.',
    method: 'POST',
    path: '/v1/passwords',
    idempotency: 'none',
  },
  'passwords.resetStart': {
    purpose: 'Emails the user a link to reset their password; the link carries the token for passwords.reset.',
    method: 'POST',
    path: '/v1/passwords/email/reset/start',
    idempotency: 'none',
  },
  'passwords.reset': {
    purpose: 'Sets a new password with the token from the reset email.',
    method: 'POST',
    path: '/v1/passwords/email/reset',
    idempotency: 'none',
  },
  'otps.emailLoginOrCreate': {
    purpose: 'Emails a one-time passcode, creating the user when the address is new.',
    method: 'POST',
    path: '/v1/otps/email/login_or_create',
    idempotency: 'none',
  },
  'otps.authenticate': {
    purpose: "Signs a user in with the passcode, by the email's id (email_id), starting a session.",
    method: 'POST',
    path: '/v1/otps/authenticate',
    idempotency: 'none',
  },
  'oauth.start': {
    purpose: 'Where the browser is sent to sign in with Google or GitHub (a redirect, never called by the server). Query: public_token, login_redirect_url, signup_redirect_url, code_challenge, provider_login_hint.',
    method: 'GET',
    path: '/v1/public/oauth/{provider}/start',
    idempotency: 'natural',
  },
  'oauth.authenticate': {
    purpose: 'Exchanges the token Stytch put on the redirect, with the PKCE verifier, for a session.',
    method: 'POST',
    path: '/v1/oauth/authenticate',
    idempotency: 'none',
  },
  'users.get': {
    purpose: 'Reads one user.',
    method: 'GET',
    path: '/v1/users/{userId}',
    idempotency: 'natural',
  },
  'users.search': {
    purpose: 'Finds users by a query, such as an exact email address.',
    method: 'POST',
    path: '/v1/users/search',
    idempotency: 'natural',
  },
  'users.create': {
    purpose: 'Creates a user with an email and no password.',
    method: 'POST',
    path: '/v1/users',
    idempotency: 'none',
  },
  'users.update': {
    purpose: "Changes a user's name, metadata or external id.",
    method: 'PUT',
    path: '/v1/users/{userId}',
    idempotency: 'natural',
  },
  'users.delete': {
    purpose: 'Deletes a user.',
    method: 'DELETE',
    path: '/v1/users/{userId}',
    idempotency: 'natural',
  },
} as const;
export type StytchOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  unauthorized_credentials: {
    category: 'unauthorized',
    reason: 'unauthorized-credentials',
  },
  unauthorized_project_id_live: {
    category: 'unauthorized',
    reason: 'wrong-environment',
  },
  unauthorized_project_id_test: {
    category: 'unauthorized',
    reason: 'wrong-environment',
  },
  wrong_stack_live: {
    category: 'invalid-request',
    reason: 'wrong-environment',
  },
  wrong_stack_test: {
    category: 'invalid-request',
    reason: 'wrong-environment',
  },
  reset_password: {
    category: 'invalid-request',
    reason: 'password-reset-required',
  },
  weak_password: {
    category: 'invalid-request',
    reason: 'weak-password',
  },
  breached_password: {
    category: 'invalid-request',
    reason: 'weak-password',
  },
  duplicate_email: {
    category: 'conflict',
    reason: 'duplicate-email',
  },
  invalid_email: {
    category: 'invalid-request',
    reason: 'invalid-email',
  },
  unable_to_auth_otp_code: {
    category: 'invalid-request',
    reason: 'invalid-code',
  },
  otp_code_not_found: {
    category: 'invalid-request',
    reason: 'invalid-code',
  },
  unable_to_auth_password_reset_token: {
    category: 'invalid-request',
    reason: 'invalid-reset-token',
  },
  oauth_token_not_found: {
    category: 'invalid-request',
    reason: 'invalid-oauth-token',
  },
  pkce_mismatch: {
    category: 'invalid-request',
    reason: 'pkce-mismatch',
  },
  oauth_unverified_email: {
    category: 'invalid-request',
    reason: 'unverified-email',
  },
  user_not_found: {
    category: 'not-found',
    reason: 'user-not-found',
  },
  email_not_found: {
    category: 'not-found',
    reason: 'email-not-found',
  },
  session_not_found: {
    category: 'not-found',
    reason: 'session-not-found',
  },
  user_lock_limit_reached: {
    category: 'forbidden',
    reason: 'user-locked',
  },
  too_many_requests: {
    category: 'rate-limited',
    reason: 'rate-limited',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'standard-webhooks',
  header: 'svix-signature',
  secretSetting: 'webhookSecret',
  description: "Sent through Svix. svix-signature is a space-separated list of v1,<base64 HMAC-SHA256 of \"<svix-id>.<svix-timestamp>.<raw body>\">, keyed with the base64 after whsec_ in the endpoint's secret. svix-timestamp is Unix seconds; refuse one more than five minutes from now. The body has no type field: the event type is source.object_type.action, lowercased (direct.user.create).",
} as const;
export const webhookEvents = ['direct.user.create', 'direct.user.update', 'direct.user.delete', 'dashboard.user.create', 'dashboard.user.update', 'dashboard.user.delete'] as const;
export type StytchWebhookEvent = (typeof webhookEvents)[number];
