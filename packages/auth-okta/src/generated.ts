// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Okta: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'okta',
  name: 'Okta',
  category: 'auth',
  server: '{yourOktaDomain}',
  docs: 'https://developer.okta.com/docs/',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'issuer',
    env: 'OKTA_ISSUER',
    label: 'Issuer',
    meaning: 'The custom authorization server that issues the access tokens your API accepts, and the one sign-in goes through: https://{yourOktaDomain}/oauth2/{authorizationServerId}.',
    secret: false,
    required: true,
    whereToFind: "Admin Console › Security › API › Authorization Servers: the server's issuer, https://{yourOktaDomain}/oauth2/{authorizationServerId}, so https://{yourOktaDomain}/oauth2/default for the default server. Never the org authorization server (https://{yourOktaDomain} alone): its access tokens are for Okta's own APIs, not yours. Okta has no test mode: use a separate org for test (an Integrator Free Plan org from developer.okta.com).",
    url: 'https://developer.okta.com/docs/concepts/auth-servers/',
    public: true,
  },
  {
    key: 'audience',
    env: 'OKTA_AUDIENCE',
    label: 'Audience',
    meaning: "The aud every access token must carry: the authorization server's Audience. Required for any server but the default one, whose audience is api://default.",
    secret: false,
    required: false,
    whereToFind: 'Admin Console › Security › API › Authorization Servers › the server › Settings: its Audience. Leave it unset for the default server (api://default).',
    url: 'https://developer.okta.com/docs/guides/customize-authz-server/main/',
    public: true,
  },
  {
    key: 'clientId',
    env: 'OKTA_CLIENT_ID',
    label: 'Client ID',
    meaning: 'The OIDC app users sign in through. Access tokens must have been issued to it (their cid claim).',
    secret: false,
    required: true,
    whereToFind: 'Admin Console › Applications › Applications › your OIDC web app: its Client ID.',
    url: 'https://developer.okta.com/docs/guides/sign-into-web-app-redirect/node-express/main/',
    public: true,
  },
  {
    key: 'clientSecret',
    env: 'OKTA_CLIENT_SECRET',
    label: 'Client secret',
    meaning: "Authenticates the app's backend when it exchanges a sign-in code, refreshes or revokes tokens. Needed by the identity client, not to verify tokens.",
    secret: true,
    required: false,
    whereToFind: "The same app's client secret (client authentication: Client secret).",
    url: 'https://developer.okta.com/docs/guides/sign-into-web-app-redirect/node-express/main/',
  },
  {
    key: 'apiToken',
    env: 'OKTA_API_TOKEN',
    label: 'API token',
    meaning: 'Reads, creates and deletes users through the Management API (Authorization: SSWS <token>). It has the privileges of the admin who made it and expires after 30 days unused. Prefer a service app (OKTA_SERVICE_CLIENT_ID).',
    secret: true,
    required: false,
    whereToFind: 'Admin Console › Security › API › Tokens › Create token. It takes the privileges of the admin who creates it, so create it as a service account with only the user privileges the app needs.',
    url: 'https://developer.okta.com/docs/guides/create-an-api-token/main/',
  },
  {
    key: 'serviceClientId',
    env: 'OKTA_SERVICE_CLIENT_ID',
    label: 'Service app client ID',
    meaning: "An OAuth 2.0 service app for the Management API: client credentials with a private key, granted okta.users.read and okta.users.manage. Okta's recommended way to call its APIs; used instead of the API token when set.",
    secret: false,
    required: false,
    whereToFind: "An API service app in Admin Console › Applications, with public key / private key client authentication, the okta.users.read and okta.users.manage scopes granted, and an admin role assigned to it. Turn off General Settings › Proof of possession › Require Demonstrating Proof of Possession (DPoP) header in token requests: DPoP isn't supported yet.",
    url: 'https://developer.okta.com/docs/guides/implement-oauth-for-okta-serviceapp/main/',
    public: true,
  },
  {
    key: 'servicePrivateKey',
    env: 'OKTA_SERVICE_PRIVATE_KEY',
    label: 'Service app private key',
    meaning: "Signs the service app's client assertions (private_key_jwt). A private JWK as JSON (with its kid), or a PKCS#8 PEM.",
    secret: true,
    required: false,
    whereToFind: 'The key pair added to the service app: the private key Okta shows once when it generates one, or yours whose public key you added.',
    url: 'https://developer.okta.com/docs/guides/implement-oauth-for-okta-serviceapp/main/',
  },
  {
    key: 'eventHookSecret',
    env: 'OKTA_EVENT_HOOK_SECRET',
    label: 'Event hook secret',
    meaning: 'Checks that an Event Hook delivery came from Okta: Okta sends it, as you gave it, in the Authorization header of every request.',
    secret: true,
    required: false,
    whereToFind: 'A long random string of your own: give it as the authentication secret (field: Authorization) when you create the event hook.',
    url: 'https://developer.okta.com/docs/concepts/event-hooks/',
  },
];

/** The config `createOkta` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  issuer: z.string().min(1),
  audience: z.string().min(1).optional(),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1).optional(),
  apiToken: z.string().min(1).optional(),
  serviceClientId: z.string().min(1).optional(),
  servicePrivateKey: z.string().min(1).optional(),
  eventHookSecret: z.string().min(1).optional(),
});
export type OktaConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  issuer: 'OKTA_ISSUER',
  audience: 'OKTA_AUDIENCE',
  clientId: 'OKTA_CLIENT_ID',
  clientSecret: 'OKTA_CLIENT_SECRET',
  apiToken: 'OKTA_API_TOKEN',
  serviceClientId: 'OKTA_SERVICE_CLIENT_ID',
  servicePrivateKey: 'OKTA_SERVICE_PRIVATE_KEY',
  eventHookSecret: 'OKTA_EVENT_HOOK_SECRET',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'token.authorizationCode': {
    purpose: "Exchanges a sign-in's authorization code and PKCE verifier for tokens, with the client secret.",
    method: 'POST',
    path: '/oauth2/{authorizationServerId}/v1/token',
    idempotency: 'none',
  },
  'token.refresh': {
    purpose: 'Exchanges a refresh token for a new access token, and a new refresh token when rotation is on.',
    method: 'POST',
    path: '/oauth2/{authorizationServerId}/v1/token',
    idempotency: 'none',
  },
  'token.revoke': {
    purpose: "Revokes a refresh token, so it can't be used again.",
    method: 'POST',
    path: '/oauth2/{authorizationServerId}/v1/revoke',
    idempotency: 'natural',
  },
  'token.clientCredentials': {
    purpose: "Gets the service app's access token for the Management API from the org authorization server, authenticated with a private_key_jwt client assertion.",
    method: 'POST',
    path: '/oauth2/v1/token',
    idempotency: 'natural',
  },
  'users.get': {
    purpose: 'Reads one user by id (or login).',
    method: 'GET',
    path: '/api/v1/users/{id}',
    idempotency: 'natural',
  },
  'users.search': {
    purpose: 'Finds users matching a search expression, such as profile.email eq "ada@example.com".',
    method: 'GET',
    path: '/api/v1/users',
    idempotency: 'natural',
  },
  'users.create': {
    purpose: "Creates a user, activated when it's given a password and staged otherwise.",
    method: 'POST',
    path: '/api/v1/users',
    idempotency: 'none',
  },
  'users.delete': {
    purpose: "Deactivates a user that isn't deactivated yet; deletes one that is. Called twice to delete an active user.",
    method: 'DELETE',
    path: '/api/v1/users/{id}',
    idempotency: 'natural',
  },
} as const;
export type OktaOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  E0000001: {
    category: 'invalid-request',
    reason: 'validation-failed',
  },
  E0000004: {
    category: 'unauthorized',
    reason: 'authentication-failed',
  },
  E0000006: {
    category: 'forbidden',
    reason: 'access-denied',
  },
  E0000007: {
    category: 'not-found',
    reason: 'not-found',
  },
  E0000011: {
    category: 'unauthorized',
    reason: 'invalid-token',
  },
  E0000015: {
    category: 'forbidden',
    reason: 'feature-not-enabled',
  },
  E0000047: {
    category: 'rate-limited',
    reason: 'rate-limited',
  },
  invalid_grant: {
    category: 'invalid-request',
    reason: 'invalid-grant',
  },
  invalid_client: {
    category: 'unauthorized',
    reason: 'invalid-client',
  },
  invalid_scope: {
    category: 'invalid-request',
    reason: 'invalid-scope',
  },
  invalid_dpop_proof: {
    category: 'unauthorized',
    reason: 'dpop-required',
  },
  use_dpop_nonce: {
    category: 'unauthorized',
    reason: 'dpop-required',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'shared-secret',
  header: 'Authorization',
  secretSetting: 'eventHookSecret',
  description: "Okta Event Hooks sign nothing: every request carries the secret you gave when creating the hook, unchanged, as the Authorization header value. Compare it with the setting in constant time. When the hook is created or verified, Okta first sends one GET with the header x-okta-verification-challenge; answer it with 200 and the JSON {\"verification\": \"<that value>\"}. Deliveries are POSTs whose data.events holds one or more events; answer 200 or 204 within 3 seconds. Okta retries at most once, after a 5xx or timeout, and delivers at least once: dedupe on the delivery's eventId, or each event's uuid.",
} as const;
export const webhookEvents = ['user.lifecycle.create', 'user.lifecycle.activate', 'user.lifecycle.deactivate', 'user.lifecycle.suspend', 'user.lifecycle.unsuspend', 'user.lifecycle.reactivate', 'user.lifecycle.delete.initiated', 'user.account.update_profile', 'user.account.lock', 'user.session.end', 'user.session.clear'] as const;
export type OktaWebhookEvent = (typeof webhookEvents)[number];
