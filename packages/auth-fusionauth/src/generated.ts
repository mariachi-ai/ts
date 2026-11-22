// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** FusionAuth: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'fusionauth',
  name: 'FusionAuth',
  category: 'auth',
  server: '{serverUrl}',
  docs: 'https://fusionauth.io/docs/apis/',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'serverUrl',
    env: 'FUSIONAUTH_URL',
    label: 'Server URL',
    meaning: "FusionAuth's base URL, such as https://auth.example.com. Its APIs, OAuth endpoints and keys (/.well-known/jwks.json) are under it.",
    secret: false,
    required: true,
    whereToFind: "The address your FusionAuth instance is served at (FusionAuth Cloud: the deployment's URL). Test is another instance or tenant, with its own keys.",
    url: 'https://fusionauth.io/docs/get-started/core-concepts/tenants',
    public: true,
  },
  {
    key: 'apiKey',
    env: 'FUSIONAUTH_API_KEY',
    label: 'API key',
    meaning: 'Authenticates the backend to the User, Login, Registration, Passwordless and JWT APIs. Give it only those endpoints.',
    secret: true,
    required: false,
    whereToFind: 'Settings › API Keys › Add: limit it to /api/user, /api/user/registration, /api/login, /api/passwordless, /api/user/verify-email, /api/user/forgot-password, /api/user/change-password and /api/jwt/refresh.',
    url: 'https://fusionauth.io/docs/apis/authentication#managing-api-keys',
  },
  {
    key: 'applicationId',
    env: 'FUSIONAUTH_APPLICATION_ID',
    label: 'Application ID',
    meaning: 'The application users sign in to and are registered for.',
    secret: false,
    required: false,
    whereToFind: 'Applications › [your application] › Id.',
    url: 'https://fusionauth.io/docs/get-started/core-concepts/applications',
    public: true,
  },
  {
    key: 'clientId',
    env: 'FUSIONAUTH_CLIENT_ID',
    label: 'Client ID',
    meaning: "The application's OAuth client id: the audience of its access tokens. Usually the application id.",
    secret: false,
    required: true,
    whereToFind: 'Applications › [your application] › OAuth › Client Id.',
    url: 'https://fusionauth.io/docs/get-started/core-concepts/applications#oauth',
    public: true,
  },
  {
    key: 'clientSecret',
    env: 'FUSIONAUTH_CLIENT_SECRET',
    label: 'Client secret',
    meaning: 'Authenticates the backend for the code exchange and refresh at /oauth2/token.',
    secret: true,
    required: false,
    whereToFind: 'Applications › [your application] › OAuth › Client secret.',
    url: 'https://fusionauth.io/docs/get-started/core-concepts/applications#oauth',
  },
  {
    key: 'tenantId',
    env: 'FUSIONAUTH_TENANT_ID',
    label: 'Tenant ID',
    meaning: "The tenant users are created in, when the API key isn't limited to one (sent as X-FusionAuth-TenantId).",
    secret: false,
    required: false,
    whereToFind: 'Tenants › [your tenant] › Id.',
    url: 'https://fusionauth.io/docs/apis/authentication#making-an-api-request-using-a-tenant-id',
    public: true,
  },
  {
    key: 'issuer',
    env: 'FUSIONAUTH_ISSUER',
    label: 'Issuer',
    meaning: "The iss every token must carry: the tenant's Issuer setting (acme.com unless changed, not the server URL).",
    secret: false,
    required: false,
    whereToFind: 'Tenants › [your tenant] › General › Issuer.',
    url: 'https://fusionauth.io/docs/get-started/core-concepts/tenants#general',
    public: true,
  },
  {
    key: 'webhookSecret',
    env: 'FUSIONAUTH_WEBHOOK_SECRET',
    label: 'Webhook signing secret',
    meaning: "The HMAC key webhooks are signed with, when the webhook's signing key is an HMAC key. Without it, the signature is checked against the server's published keys.",
    secret: true,
    required: false,
    whereToFind: 'Settings › Webhooks › [your webhook] › Security › Signature: the signing key, from Settings › Key Master.',
    url: 'https://fusionauth.io/docs/extend/events-and-webhooks/signing',
  },
];

/** The config `createFusionauth` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  serverUrl: z.string().min(1),
  apiKey: z.string().min(1).optional(),
  applicationId: z.string().min(1).optional(),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
  issuer: z.string().min(1).optional(),
  webhookSecret: z.string().min(1).optional(),
});
export type FusionauthConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  serverUrl: 'FUSIONAUTH_URL',
  apiKey: 'FUSIONAUTH_API_KEY',
  applicationId: 'FUSIONAUTH_APPLICATION_ID',
  clientId: 'FUSIONAUTH_CLIENT_ID',
  clientSecret: 'FUSIONAUTH_CLIENT_SECRET',
  tenantId: 'FUSIONAUTH_TENANT_ID',
  issuer: 'FUSIONAUTH_ISSUER',
  webhookSecret: 'FUSIONAUTH_WEBHOOK_SECRET',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'users.login': {
    purpose: 'Signs a user in with their login id and password, or with a one-time password (after a password change). 212, 213 and 242 answer a pending sign-in.',
    method: 'POST',
    path: '/api/login',
    idempotency: 'none',
  },
  'tokens.exchangeCode': {
    purpose: "Exchanges the authorization code from FusionAuth's hosted login, with its PKCE verifier, for tokens.",
    method: 'POST',
    path: '/oauth2/token',
    idempotency: 'none',
  },
  'tokens.refresh': {
    purpose: 'Exchanges a refresh token for a new access token.',
    method: 'POST',
    path: '/oauth2/token',
    idempotency: 'none',
  },
  'tokens.revoke': {
    purpose: 'Revokes a refresh token (by the token, or by its id: the session).',
    method: 'DELETE',
    path: '/api/jwt/refresh',
    idempotency: 'natural',
  },
  'users.get': {
    purpose: 'Reads one user by id.',
    method: 'GET',
    path: '/api/user/{id}',
    idempotency: 'natural',
  },
  'users.byEmail': {
    purpose: 'Reads the user with this email address.',
    method: 'GET',
    path: '/api/user',
    idempotency: 'natural',
  },
  'users.create': {
    purpose: 'Creates a user and registers them for the application.',
    method: 'POST',
    path: '/api/user/registration',
    idempotency: 'none',
  },
  'users.update': {
    purpose: 'Updates a user: here, sets their password.',
    method: 'PATCH',
    path: '/api/user/{id}',
    idempotency: 'natural',
  },
  'users.delete': {
    purpose: 'Deletes a user for good.',
    method: 'DELETE',
    path: '/api/user/{id}',
    idempotency: 'natural',
  },
  'passwords.forgot': {
    purpose: 'Starts a password reset: FusionAuth emails the link, or returns its changePasswordId for the app to send.',
    method: 'POST',
    path: '/api/user/forgot-password',
    idempotency: 'none',
  },
  'passwords.change': {
    purpose: 'Sets a new password with a changePasswordId.',
    method: 'POST',
    path: '/api/user/change-password',
    idempotency: 'none',
  },
  'emailVerification.start': {
    purpose: "Starts a new email verification without FusionAuth's email, for the app to send its code.",
    method: 'PUT',
    path: '/api/user/verify-email',
    idempotency: 'none',
  },
  'emailVerification.verify': {
    purpose: 'Completes an email verification with its id and one-time code.',
    method: 'POST',
    path: '/api/user/verify-email',
    idempotency: 'none',
  },
  'passwordless.start': {
    purpose: 'Starts a passwordless sign-in and returns its code, for the app to send.',
    method: 'POST',
    path: '/api/passwordless/start',
    idempotency: 'none',
  },
  'passwordless.login': {
    purpose: 'Signs a user in with a passwordless code.',
    method: 'POST',
    path: '/api/passwordless/login',
    idempotency: 'none',
  },
  'jwks.get': {
    purpose: "Reads the server's signing keys, for tokens and asymmetrically signed webhooks: when none are cached, when the cache expires, and when a token names a key not yet seen.",
    method: 'GET',
    path: '/.well-known/jwks.json',
    idempotency: 'natural',
  },
} as const;
export type FusionauthOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'jwt',
  header: 'X-FusionAuth-Signature-JWT',
  secretSetting: 'webhookSecret',
  description: "The header is a JWT signed with the webhook's signing key (HS256/384/512 with the HMAC secret, or RSA/EC with a key from the server's JWKS). Verify it, refuse it when older than five minutes, and compare its request_body_sha256 claim with the base64 SHA-256 of the raw body.",
} as const;
export const webhookEvents = ['user.create', 'user.update', 'user.delete', 'user.deactivate', 'user.reactivate', 'user.registration.create', 'user.registration.update', 'user.registration.delete', 'user.login.success', 'jwt.refresh-token.revoke', 'group.create', 'group.update', 'group.delete', 'group.member.add', 'group.member.update', 'group.member.remove'] as const;
export type FusionauthWebhookEvent = (typeof webhookEvents)[number];
