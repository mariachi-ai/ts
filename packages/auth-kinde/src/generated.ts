// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Kinde: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'kinde',
  name: 'Kinde',
  category: 'auth',
  server: '<subdomain>.kinde.com',
  docs: 'https://docs.kinde.com',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'issuerUrl',
    env: 'KINDE_ISSUER_URL',
    label: 'Domain',
    meaning: 'The Kinde domain the app signs users in with: tokens carry it as their issuer, and its keys are at <domain>/.well-known/jwks.',
    secret: false,
    required: true,
    whereToFind: 'Settings › Applications › your back-end app › View details: Domain, such as https://<subdomain>.kinde.com (or your custom domain). Each environment has its own domain: for test, switch to a non-production environment and copy its own.',
    url: 'https://docs.kinde.com/build/environments/environments/',
    public: true,
  },
  {
    key: 'clientId',
    env: 'KINDE_CLIENT_ID',
    label: 'Client ID',
    meaning: 'The back-end application the app signs users in through. Tokens issued to it name it in azp.',
    secret: false,
    required: true,
    whereToFind: "Settings › Applications › your back-end app › View details: Client ID. A non-production environment's application has its own.",
    url: 'https://docs.kinde.com/developer-tools/about/using-kinde-without-an-sdk/',
    public: true,
  },
  {
    key: 'clientSecret',
    env: 'KINDE_CLIENT_SECRET',
    label: 'Client secret',
    meaning: 'Authenticates the back-end application when it exchanges a sign-in code, refreshes or revokes tokens.',
    secret: true,
    required: true,
    whereToFind: "Settings › Applications › your back-end app › View details: Client secret. A non-production environment's application has its own.",
    url: 'https://docs.kinde.com/developer-tools/about/using-kinde-without-an-sdk/',
  },
  {
    key: 'm2mClientId',
    env: 'KINDE_M2M_CLIENT_ID',
    label: 'Management API client ID',
    meaning: 'A machine-to-machine application authorized for the Kinde Management API, for reading, creating and deleting users. Only needed for those calls.',
    secret: false,
    required: false,
    whereToFind: 'Settings › Applications › Add application › Machine to machine, then APIs › Kinde Management API › Authorize, with the scopes read:users, read:user_identities, create:users and delete:users. Its Client ID is on View details.',
    url: 'https://docs.kinde.com/developer-tools/kinde-api/connect-to-kinde-api/',
  },
  {
    key: 'm2mClientSecret',
    env: 'KINDE_M2M_CLIENT_SECRET',
    label: 'Management API client secret',
    meaning: "The machine-to-machine application's secret, sent with a client_credentials grant for a Management API token.",
    secret: true,
    required: false,
    whereToFind: "The machine-to-machine application's View details: Client secret.",
    url: 'https://docs.kinde.com/developer-tools/kinde-api/connect-to-kinde-api/',
  },
];

/** The config `createKinde` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  issuerUrl: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  m2mClientId: z.string().min(1).optional(),
  m2mClientSecret: z.string().min(1).optional(),
});
export type KindeConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  issuerUrl: 'KINDE_ISSUER_URL',
  clientId: 'KINDE_CLIENT_ID',
  clientSecret: 'KINDE_CLIENT_SECRET',
  m2mClientId: 'KINDE_M2M_CLIENT_ID',
  m2mClientSecret: 'KINDE_M2M_CLIENT_SECRET',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'oauth.exchangeCode': {
    purpose: "Exchanges a sign-in's authorization code and PKCE verifier for tokens (grant_type=authorization_code).",
    method: 'POST',
    path: '/oauth2/token',
    idempotency: 'none',
  },
  'oauth.refresh': {
    purpose: 'Exchanges a refresh token for new tokens (grant_type=refresh_token; the offline scope gives one).',
    method: 'POST',
    path: '/oauth2/token',
    idempotency: 'none',
  },
  'oauth.revoke': {
    purpose: 'Revokes a refresh or access token.',
    method: 'POST',
    path: '/oauth2/revoke',
    idempotency: 'natural',
  },
  'oauth.clientCredentials': {
    purpose: 'Gets a Management API token for the machine-to-machine application (grant_type=client_credentials, audience https://<subdomain>.kinde.com/api).',
    method: 'POST',
    path: '/oauth2/token',
    idempotency: 'natural',
  },
  'users.get': {
    purpose: 'Reads one user by id.',
    method: 'GET',
    path: '/api/v1/user',
    idempotency: 'natural',
  },
  'users.list': {
    purpose: 'Lists users, filtered by email address.',
    method: 'GET',
    path: '/api/v1/users',
    idempotency: 'natural',
  },
  'users.identities': {
    purpose: "Lists a user's identities, each with whether it is confirmed: how a user's email is known to be verified.",
    method: 'GET',
    path: '/api/v1/users/{userId}/identities',
    idempotency: 'natural',
  },
  'users.create': {
    purpose: 'Creates a user with an email identity, verified or not.',
    method: 'POST',
    path: '/api/v1/user',
    idempotency: 'none',
  },
  'users.delete': {
    purpose: 'Deletes a user.',
    method: 'DELETE',
    path: '/api/v1/user',
    idempotency: 'natural',
  },
} as const;
export type KindeOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  invalid_grant: {
    category: 'invalid-request',
    reason: 'invalid-grant',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'jwt',
  description: "The body is a JWT (Content-Type application/jwt) signed by Kinde with a key from https://<subdomain>.kinde.com/.well-known/jwks (RS256). Verify the signature against that key set, then check the payload's timestamp (ISO 8601) is recent to refuse a replay; event_id identifies the event.",
} as const;
export const webhookEvents = ['user.created', 'user.updated', 'user.deleted', 'user.authenticated', 'organization.created', 'organization.updated', 'organization.deleted'] as const;
export type KindeWebhookEvent = (typeof webhookEvents)[number];
