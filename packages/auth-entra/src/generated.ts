// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Microsoft Entra ID: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'entra',
  name: 'Microsoft Entra ID',
  category: 'auth',
  server: 'login.microsoftonline.com',
  baseUrl: 'https://graph.microsoft.com',
  docs: 'https://learn.microsoft.com/en-us/entra/identity-platform/',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'tenantId',
    env: 'ENTRA_TENANT_ID',
    label: 'Directory (tenant) ID',
    meaning: "The tenant whose users sign in and whose directory the app manages. For an app that accepts any work or school tenant, `organizations` (or `common`, which adds personal Microsoft accounts); Graph user calls then need the app's own tenant instead.",
    secret: false,
    required: true,
    whereToFind: 'Microsoft Entra admin center › App registrations › your app › Overview › Directory (tenant) ID. Entra has no test mode: use a separate tenant for test.',
    url: 'https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app',
    public: true,
  },
  {
    key: 'clientId',
    env: 'ENTRA_CLIENT_ID',
    label: 'Application (client) ID',
    meaning: 'The app registration: the audience of the access tokens the app accepts, and the client that signs users in and calls Microsoft Graph.',
    secret: false,
    required: true,
    whereToFind: 'Microsoft Entra admin center › App registrations › your app › Overview › Application (client) ID. A separate registration in the test tenant.',
    url: 'https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app',
    public: true,
  },
  {
    key: 'clientSecret',
    env: 'ENTRA_CLIENT_SECRET',
    label: 'Client secret',
    meaning: 'Proves the app to Entra when it redeems a sign-in code, refreshes tokens and calls Microsoft Graph. Not needed by an app that only checks tokens.',
    secret: true,
    required: false,
    whereToFind: "Microsoft Entra admin center › App registrations › your app › Certificates & secrets › Client secrets › New client secret: copy the Value (not the Secret ID) when it's shown. Graph user calls need application permissions (User.ReadWrite.All) granted admin consent under API permissions.",
    url: 'https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-credentials',
  },
  {
    key: 'authority',
    env: 'ENTRA_AUTHORITY',
    label: 'Sign-in address',
    meaning: "Only for a Microsoft Entra External ID (customer) tenant: the tenant's own sign-in host, https://<subdomain>.ciamlogin.com. Leave it unset for a workforce tenant (https://login.microsoftonline.com).",
    secret: false,
    required: false,
    whereToFind: "https://<subdomain>.ciamlogin.com, where <subdomain> is the part of the tenant's primary domain before .onmicrosoft.com (Microsoft Entra admin center › Overview › Primary domain).",
    url: 'https://learn.microsoft.com/en-us/entra/external-id/customers/',
    public: true,
  },
  {
    key: 'webhookClientState',
    env: 'ENTRA_WEBHOOK_CLIENT_STATE',
    label: 'Change notification secret',
    meaning: 'The clientState the app gives Microsoft Graph when it subscribes to user changes; every notification carries it back, which is how the app knows Graph sent it.',
    secret: true,
    required: false,
    whereToFind: 'A random string of your own, at most 128 characters: the subscription helper sends it to Graph.',
    url: 'https://learn.microsoft.com/en-us/graph/change-notifications-delivery-webhooks',
  },
];

/** The config `createEntra` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  tenantId: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1).optional(),
  authority: z.string().min(1).optional(),
  webhookClientState: z.string().min(1).optional(),
});
export type EntraConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  tenantId: 'ENTRA_TENANT_ID',
  clientId: 'ENTRA_CLIENT_ID',
  clientSecret: 'ENTRA_CLIENT_SECRET',
  authority: 'ENTRA_AUTHORITY',
  webhookClientState: 'ENTRA_WEBHOOK_CLIENT_STATE',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'discovery.get': {
    purpose: "Reads the tenant's OpenID configuration, GET {authority}/{tenant}/v2.0/.well-known/openid-configuration: its issuer and where its signing keys are.",
    method: 'GET',
    idempotency: 'natural',
  },
  'keys.list': {
    purpose: "Reads the tenant's signing keys from the jwks_uri the OpenID configuration names.",
    method: 'GET',
    idempotency: 'natural',
  },
  'tokens.exchangeCode': {
    purpose: 'Redeems an authorization code and its PKCE verifier for tokens, POST {authority}/{tenant}/oauth2/v2.0/token with grant_type=authorization_code.',
    method: 'POST',
    idempotency: 'none',
  },
  'tokens.refresh': {
    purpose: 'Exchanges a refresh token for new tokens, POST {authority}/{tenant}/oauth2/v2.0/token with grant_type=refresh_token. Entra may return a new refresh token; the old one is then discarded.',
    method: 'POST',
    idempotency: 'none',
  },
  'tokens.appToken': {
    purpose: "Gets the app's own token for Microsoft Graph, POST {authority}/{tenant}/oauth2/v2.0/token with grant_type=client_credentials and scope https://graph.microsoft.com/.default.",
    method: 'POST',
    idempotency: 'natural',
  },
  'users.get': {
    purpose: 'Reads one user of the directory by object id.',
    method: 'GET',
    path: '/v1.0/users/{userId}',
    idempotency: 'natural',
  },
  'users.find': {
    purpose: 'Finds users by mail or userPrincipalName with $filter (by their email sign-in identity in an External ID tenant).',
    method: 'GET',
    path: '/v1.0/users',
    idempotency: 'natural',
  },
  'users.create': {
    purpose: 'Creates a user: a member with a userPrincipalName in a workforce tenant, or a customer with an email sign-in identity in an External ID tenant.',
    method: 'POST',
    path: '/v1.0/users',
    idempotency: 'none',
  },
  'users.delete': {
    purpose: 'Deletes a user (Entra keeps it soft-deleted for 30 days).',
    method: 'DELETE',
    path: '/v1.0/users/{userId}',
    idempotency: 'natural',
  },
  'subscriptions.create': {
    purpose: "Subscribes the app's webhook to changes of the directory's users, with the clientState every notification will carry.",
    method: 'POST',
    path: '/v1.0/subscriptions',
    idempotency: 'none',
  },
  'subscriptions.renew': {
    purpose: "Moves a subscription's expiry later. Subscriptions on users last at most 41,760 minutes (under 29 days).",
    method: 'PATCH',
    path: '/v1.0/subscriptions/{subscriptionId}',
    idempotency: 'natural',
  },
  'subscriptions.list': {
    purpose: "Lists the app's active subscriptions.",
    method: 'GET',
    path: '/v1.0/subscriptions',
    idempotency: 'natural',
  },
  'subscriptions.delete': {
    purpose: 'Ends a subscription.',
    method: 'DELETE',
    path: '/v1.0/subscriptions/{subscriptionId}',
    idempotency: 'natural',
  },
} as const;
export type EntraOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  invalid_grant: {
    category: 'invalid-request',
    reason: 'invalid-grant',
  },
  invalid_client: {
    category: 'unauthorized',
    reason: 'invalid-client',
  },
  interaction_required: {
    category: 'invalid-request',
    reason: 'interaction-required',
  },
  consent_required: {
    category: 'forbidden',
    reason: 'consent-required',
  },
  temporarily_unavailable: {
    category: 'unavailable',
    reason: 'temporarily-unavailable',
  },
  Request_ResourceNotFound: {
    category: 'not-found',
    reason: 'not-found',
  },
  Authorization_RequestDenied: {
    category: 'forbidden',
    reason: 'permission-denied',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'shared-secret',
  secretSetting: 'webhookClientState',
  description: "Microsoft Graph signs nothing. The body is {\"value\": [notification, ...]} and each notification's clientState is the value the app gave when it subscribed: compare every one with it in constant time and refuse the delivery if any differs. Before a subscription is made, Graph checks the endpoint with a POST to the notification URL carrying ?validationToken=<token> and an empty body; answer 200 with Content-Type text/plain and the URL-decoded token as the body, within 10 seconds. Answer each delivery with a 2xx within 3 seconds (202 once it's queued), or Graph retries it for up to 4 hours.",
} as const;
export const webhookEvents = ['updated', 'deleted'] as const;
export type EntraWebhookEvent = (typeof webhookEvents)[number];
