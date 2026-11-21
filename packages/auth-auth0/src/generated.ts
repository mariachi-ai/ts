// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Auth0: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'auth0',
  name: 'Auth0',
  category: 'auth',
  server: '{domain}',
  docs: 'https://auth0.com/docs/api',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'domain',
    env: 'AUTH0_DOMAIN',
    label: 'Domain',
    meaning: "The tenant's domain, such as acme.us.auth0.com, or its custom domain. Tokens are issued by https://<domain>/ and its keys are at https://<domain>/.well-known/jwks.json.",
    secret: false,
    required: true,
    whereToFind: 'Applications › [your application] › Settings › Domain. Auth0 keeps test and live apart by tenant: use another tenant for test, with its own domain and keys.',
    url: 'https://auth0.com/docs/get-started/applications/application-settings',
    public: true,
  },
  {
    key: 'clientId',
    env: 'AUTH0_CLIENT_ID',
    label: 'Client ID',
    meaning: 'The application users sign in to. Also the audience of its ID tokens.',
    secret: false,
    required: true,
    whereToFind: 'Applications › [your application] › Settings › Client ID.',
    url: 'https://auth0.com/docs/get-started/applications/application-settings',
    public: true,
  },
  {
    key: 'clientSecret',
    env: 'AUTH0_CLIENT_SECRET',
    label: 'Client secret',
    meaning: "Authenticates the app's backend to Auth0 for the code exchange, refresh, sign-out and the other sign-in calls. Not needed only to verify tokens.",
    secret: true,
    required: false,
    whereToFind: 'Applications › [your application] › Settings › Client Secret (a Regular Web Application).',
    url: 'https://auth0.com/docs/get-started/applications/application-settings',
  },
  {
    key: 'audience',
    env: 'AUTH0_AUDIENCE',
    label: 'API identifier',
    meaning: "The app's API in Auth0. When set, sign-in asks for access tokens for it and only tokens whose aud names it are accepted; when unset, the app's ID tokens (aud: the client ID) are.",
    secret: false,
    required: false,
    whereToFind: 'Applications › APIs › [your API] › Settings › Identifier.',
    url: 'https://auth0.com/docs/get-started/apis/api-settings',
    public: true,
  },
  {
    key: 'm2mClientId',
    env: 'AUTH0_M2M_CLIENT_ID',
    label: 'Management client ID',
    meaning: 'A Machine to Machine application authorized for the Auth0 Management API, for reading, creating and deleting users. Needs read:users, create:users, update:users and delete:users.',
    secret: false,
    required: false,
    whereToFind: 'Applications › [your Machine to Machine application] › Settings › Client ID; authorize it for the Auth0 Management API under its APIs tab.',
    url: 'https://auth0.com/docs/secure/tokens/access-tokens/management-api-access-tokens/get-management-api-access-tokens-for-production',
  },
  {
    key: 'm2mClientSecret',
    env: 'AUTH0_M2M_CLIENT_SECRET',
    label: 'Management client secret',
    meaning: "The Machine to Machine application's secret, exchanged for a Management API token (client_credentials) that lasts about a day.",
    secret: true,
    required: false,
    whereToFind: 'Applications › [your Machine to Machine application] › Settings › Client Secret.',
    url: 'https://auth0.com/docs/secure/tokens/access-tokens/management-api-access-tokens/get-management-api-access-tokens-for-production',
  },
  {
    key: 'tenantDomain',
    env: 'AUTH0_TENANT_DOMAIN',
    label: 'Tenant domain',
    meaning: "Only when AUTH0_DOMAIN is a custom domain: the tenant's own domain (acme.us.auth0.com). The Management API's audience always names it.",
    secret: false,
    required: false,
    whereToFind: "Settings › Custom Domains shows the custom domain; the tenant's own domain is the one in any application's Settings before the custom domain was added.",
    url: 'https://auth0.com/docs/customize/custom-domains/configure-features-to-use-custom-domains',
    public: true,
  },
  {
    key: 'databaseConnection',
    env: 'AUTH0_DATABASE_CONNECTION',
    label: 'Database connection',
    meaning: 'The database connection users are created in, sign in to with a password, and reset passwords for. Default Username-Password-Authentication.',
    secret: false,
    required: false,
    whereToFind: "Authentication › Database › the connection's name.",
    url: 'https://auth0.com/docs/authenticate/database-connections',
    public: true,
  },
  {
    key: 'eventStreamToken',
    env: 'AUTH0_EVENT_STREAM_TOKEN',
    label: 'Event stream token',
    meaning: "Checks that a webhook came from the tenant's event stream. You choose it, and Auth0 sends it as Authorization: Bearer <token> on every delivery.",
    secret: true,
    required: false,
    whereToFind: 'A long random string of your own (openssl rand -hex 32), entered as the Bearer Token when the webhook event stream is made: Event Streams › Create Event Stream › Webhook.',
    url: 'https://auth0.com/docs/customize/events/create-an-event-stream',
  },
];

/** The config `createAuth0` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  domain: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1).optional(),
  audience: z.string().min(1).optional(),
  m2mClientId: z.string().min(1).optional(),
  m2mClientSecret: z.string().min(1).optional(),
  tenantDomain: z.string().min(1).optional(),
  databaseConnection: z.string().min(1).optional(),
  eventStreamToken: z.string().min(1).optional(),
});
export type Auth0Config = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  domain: 'AUTH0_DOMAIN',
  clientId: 'AUTH0_CLIENT_ID',
  clientSecret: 'AUTH0_CLIENT_SECRET',
  audience: 'AUTH0_AUDIENCE',
  m2mClientId: 'AUTH0_M2M_CLIENT_ID',
  m2mClientSecret: 'AUTH0_M2M_CLIENT_SECRET',
  tenantDomain: 'AUTH0_TENANT_DOMAIN',
  databaseConnection: 'AUTH0_DATABASE_CONNECTION',
  eventStreamToken: 'AUTH0_EVENT_STREAM_TOKEN',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'tokens.exchangeCode': {
    purpose: 'Exchanges the authorization code from Universal Login, with its PKCE verifier, for tokens.',
    method: 'POST',
    path: '/oauth/token',
    idempotency: 'none',
  },
  'tokens.refresh': {
    purpose: 'Exchanges a refresh token for new tokens (and, with rotation on, a new refresh token).',
    method: 'POST',
    path: '/oauth/token',
    idempotency: 'none',
  },
  'tokens.password': {
    purpose: 'Signs a user in with their email and password in the database connection (the password-realm grant).',
    method: 'POST',
    path: '/oauth/token',
    idempotency: 'none',
  },
  'tokens.emailCode': {
    purpose: 'Signs a user in with the one-time code Auth0 emailed them (the passwordless OTP grant).',
    method: 'POST',
    path: '/oauth/token',
    idempotency: 'none',
  },
  'tokens.clientCredentials': {
    purpose: 'Gets a Management API token for the Machine to Machine application.',
    method: 'POST',
    path: '/oauth/token',
    idempotency: 'natural',
  },
  'tokens.revoke': {
    purpose: 'Revokes a refresh token, and the access tokens issued with it are no longer renewed.',
    method: 'POST',
    path: '/oauth/revoke',
    idempotency: 'natural',
  },
  'passwordless.start': {
    purpose: "Emails a one-time sign-in code from the tenant's email connection.",
    method: 'POST',
    path: '/passwordless/start',
    idempotency: 'none',
  },
  'passwords.requestChange': {
    purpose: 'Emails a password reset link for a database connection user. Answers the same whether or not the address has an account.',
    method: 'POST',
    path: '/dbconnections/change_password',
    idempotency: 'none',
  },
  'users.get': {
    purpose: 'Reads one user by id.',
    method: 'GET',
    path: '/api/v2/users/{id}',
    idempotency: 'natural',
  },
  'users.byEmail': {
    purpose: 'Lists the users with this email address, one per connection.',
    method: 'GET',
    path: '/api/v2/users-by-email',
    idempotency: 'natural',
  },
  'users.create': {
    purpose: 'Creates a user in the database connection.',
    method: 'POST',
    path: '/api/v2/users',
    idempotency: 'none',
  },
  'users.update': {
    purpose: 'Updates a user: here, sets their password.',
    method: 'PATCH',
    path: '/api/v2/users/{id}',
    idempotency: 'natural',
  },
  'users.delete': {
    purpose: 'Deletes a user.',
    method: 'DELETE',
    path: '/api/v2/users/{id}',
    idempotency: 'natural',
  },
} as const;
export type Auth0Operation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  invalid_request: {
    category: 'invalid-request',
    reason: 'invalid-request',
  },
  invalid_grant: {
    category: 'invalid-request',
    reason: 'invalid-grant',
  },
  invalid_client: {
    category: 'unauthorized',
    reason: 'invalid-client',
  },
  invalid_user_password: {
    category: 'invalid-request',
    reason: 'invalid-user-password',
  },
  mfa_required: {
    category: 'forbidden',
    reason: 'mfa-required',
  },
  access_denied: {
    category: 'forbidden',
    reason: 'access-denied',
  },
  too_many_requests: {
    category: 'rate-limited',
    reason: 'rate-limited',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'shared-secret',
  header: 'Authorization',
  secretSetting: 'eventStreamToken',
  description: "Event streams sign nothing. A webhook stream with Bearer Token authentication sends Authorization: Bearer <token> with the token chosen when the stream was made; compare the whole header with 'Bearer ' + token in constant time. The body is a CloudEvent: id (evt_…), source, specversion, type, time, and data.object.",
} as const;
export const webhookEvents = ['user.created', 'user.updated', 'user.deleted'] as const;
export type Auth0WebhookEvent = (typeof webhookEvents)[number];
