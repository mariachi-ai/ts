// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** RevenueCat: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'revenuecat',
  name: 'RevenueCat',
  category: 'subscriptions',
  server: 'api.revenuecat.com',
  baseUrl: 'https://api.revenuecat.com/v2',
  docs: 'https://www.revenuecat.com/docs/api-v2',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'secretKey',
    env: 'REVENUECAT_SECRET_KEY',
    label: 'Secret API key (v2)',
    meaning: "Reads the project's customers, their entitlements, subscriptions and purchases, and its offerings and products; grants and revokes promotional entitlements; deletes customers. Server only.",
    secret: true,
    required: true,
    whereToFind: 'Project settings › API keys › + New secret API key, version V2. Give it customer_information:customers:read_write, customer_information:subscriptions:read, customer_information:purchases:read, and project_configuration:entitlements:read, offerings:read, packages:read and products:read. Keys start with sk_. RevenueCat has no test keys: sandbox purchases are marked sandbox in the same project.',
    url: 'https://www.revenuecat.com/docs/projects/authentication',
  },
  {
    key: 'projectId',
    env: 'REVENUECAT_PROJECT_ID',
    label: 'Project ID',
    meaning: 'The project every v2 call is made in. The secret key must belong to it.',
    secret: false,
    required: true,
    whereToFind: 'Project settings › General › Project ID (it looks like proj1ab2c3d4).',
    url: 'https://www.revenuecat.com/docs/projects/overview',
  },
  {
    key: 'publicKeyIos',
    env: 'REVENUECAT_PUBLIC_KEY_IOS',
    label: 'Public SDK key (Apple)',
    meaning: "Configures the RevenueCat SDK in the app's iOS and macOS clients. The server never uses it; it's here so a host hands it to the clients.",
    secret: false,
    required: false,
    whereToFind: "Project settings › API keys, the App Store app's public SDK key (also under Apps › the app). In debug builds you may use the Test Store key instead; never ship it in a release build.",
    url: 'https://www.revenuecat.com/docs/projects/authentication',
    public: true,
  },
  {
    key: 'publicKeyAndroid',
    env: 'REVENUECAT_PUBLIC_KEY_ANDROID',
    label: 'Public SDK key (Android)',
    meaning: "Configures the RevenueCat SDK in the app's Android client. The server never uses it.",
    secret: false,
    required: false,
    whereToFind: "Project settings › API keys, the Play Store app's public SDK key (also under Apps › the app). In debug builds you may use the Test Store key instead; never ship it in a release build.",
    url: 'https://www.revenuecat.com/docs/projects/authentication',
    public: true,
  },
  {
    key: 'publicKeyWeb',
    env: 'REVENUECAT_PUBLIC_KEY_WEB',
    label: 'Public SDK key (web)',
    meaning: "Configures the RevenueCat web SDK in the app's browser client. The server never uses it.",
    secret: false,
    required: false,
    whereToFind: "Project settings › API keys, the web app's public SDK key (also under Apps › the app).",
    url: 'https://www.revenuecat.com/docs/projects/authentication',
    public: true,
  },
  {
    key: 'webhookAuthorization',
    env: 'REVENUECAT_WEBHOOK_AUTH',
    label: 'Webhook authorization header',
    meaning: 'The Authorization header value RevenueCat sends with every webhook, checked on each delivery. You choose it.',
    secret: true,
    required: false,
    whereToFind: "A long random string of your own, entered as the authorization header in Integrations › Webhooks › the webhook's configuration.",
    url: 'https://www.revenuecat.com/docs/integrations/webhooks',
  },
  {
    key: 'webhookSigningSecret',
    env: 'REVENUECAT_WEBHOOK_SIGNING_SECRET',
    label: 'Webhook signing secret',
    meaning: 'Checks the HMAC signature RevenueCat puts on each webhook, when HMAC signing is turned on. Preferred over the header alone: it covers the body and a timestamp.',
    secret: true,
    required: false,
    whereToFind: "Integrations › Webhooks › the webhook › turn on HMAC webhook signing, and copy the secret: it's shown once. Rotate secret replaces it at once.",
    url: 'https://www.revenuecat.com/docs/integrations/webhooks',
  },
];

/** The config `createRevenuecat` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  secretKey: z.string().min(1),
  projectId: z.string().min(1),
  publicKeyIos: z.string().min(1).optional(),
  publicKeyAndroid: z.string().min(1).optional(),
  publicKeyWeb: z.string().min(1).optional(),
  webhookAuthorization: z.string().min(1).optional(),
  webhookSigningSecret: z.string().min(1).optional(),
});
export type RevenuecatConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  secretKey: 'REVENUECAT_SECRET_KEY',
  projectId: 'REVENUECAT_PROJECT_ID',
  publicKeyIos: 'REVENUECAT_PUBLIC_KEY_IOS',
  publicKeyAndroid: 'REVENUECAT_PUBLIC_KEY_ANDROID',
  publicKeyWeb: 'REVENUECAT_PUBLIC_KEY_WEB',
  webhookAuthorization: 'REVENUECAT_WEBHOOK_AUTH',
  webhookSigningSecret: 'REVENUECAT_WEBHOOK_SIGNING_SECRET',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'customers.get': {
    purpose: 'Reads a customer by its App User ID, with its active entitlements.',
    method: 'GET',
    path: '/projects/{projectId}/customers/{customerId}',
    idempotency: 'natural',
  },
  'customers.delete': {
    purpose: "Permanently deletes a customer. RevenueCat queues the deletion; a later get answers 404 once it's done.",
    method: 'DELETE',
    path: '/projects/{projectId}/customers/{customerId}',
    idempotency: 'natural',
  },
  'customers.grantEntitlement': {
    purpose: "Grants a promotional entitlement until a time. A grant whose expiry is within two hours of an existing grant's is ignored, so a retry is harmless.",
    method: 'POST',
    path: '/projects/{projectId}/customers/{customerId}/actions/grant_entitlement',
    idempotency: 'natural',
  },
  'customers.revokeGrantedEntitlement': {
    purpose: 'Revokes every active promotional grant of an entitlement; access ends at once. Store purchases are untouched.',
    method: 'POST',
    path: '/projects/{projectId}/customers/{customerId}/actions/revoke_granted_entitlement',
    idempotency: 'natural',
  },
  'activeEntitlements.list': {
    purpose: "Lists a customer's active entitlements, a page at a time.",
    method: 'GET',
    path: '/projects/{projectId}/customers/{customerId}/active_entitlements',
    idempotency: 'natural',
  },
  'subscriptions.list': {
    purpose: "Lists a customer's subscriptions in every store, a page at a time, optionally only sandbox or production.",
    method: 'GET',
    path: '/projects/{projectId}/customers/{customerId}/subscriptions',
    idempotency: 'natural',
  },
  'purchases.list': {
    purpose: "Lists a customer's one-time purchases, a page at a time, optionally only sandbox or production.",
    method: 'GET',
    path: '/projects/{projectId}/customers/{customerId}/purchases',
    idempotency: 'natural',
  },
  'entitlements.list': {
    purpose: "Lists the project's entitlements, each with its id (entl…) and its lookup key.",
    method: 'GET',
    path: '/projects/{projectId}/entitlements',
    idempotency: 'natural',
  },
  'offerings.list': {
    purpose: "Lists the project's offerings, with their packages and products, for a paywall.",
    method: 'GET',
    path: '/projects/{projectId}/offerings',
    idempotency: 'natural',
  },
  'products.list': {
    purpose: "Lists the project's products, optionally of one app.",
    method: 'GET',
    path: '/projects/{projectId}/products',
    idempotency: 'natural',
  },
} as const;
export type RevenuecatOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  authentication_error: {
    category: 'unauthorized',
    reason: 'unauthorized',
  },
  authorization_error: {
    category: 'forbidden',
    reason: 'forbidden',
  },
  resource_missing: {
    category: 'not-found',
    reason: 'not-found',
  },
  parameter_error: {
    category: 'invalid-request',
    reason: 'invalid-parameter',
  },
  invalid_request: {
    category: 'invalid-request',
    reason: 'invalid-request',
  },
  unprocessable_entity_error: {
    category: 'invalid-request',
    reason: 'unprocessable',
  },
  entity_references_archived_entities: {
    category: 'invalid-request',
    reason: 'archived-entity',
  },
  resource_already_exists: {
    category: 'conflict',
    reason: 'already-exists',
  },
  resource_locked_error: {
    category: 'conflict',
    reason: 'locked',
  },
  rate_limit_error: {
    category: 'rate-limited',
    reason: 'rate-limited',
  },
  store_error: {
    category: 'unavailable',
    reason: 'store-error',
  },
  server_error: {
    category: 'unavailable',
    reason: 'unavailable',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'hmac-sha256-timestamped',
  header: 'X-RevenueCat-Webhook-Signature',
  secretSetting: 'webhookSigningSecret',
  description: 'With HMAC signing on, the header is t=<Unix seconds>,v1=<hex>, where v1 is the hex HMAC-SHA256 of "<t>.<raw body>" keyed with the signing secret, compared in constant time; reject a t more than five minutes from now. RevenueCat recomputes t and v1 on every retry. Without it (or as well), the Authorization header carries the value set in the dashboard (webhookAuthorization), compared in constant time. The body is { api_version, event }; event.id is the same on every retry: dedupe on it.',
} as const;
export const webhookEvents = ['TEST', 'INITIAL_PURCHASE', 'RENEWAL', 'CANCELLATION', 'UNCANCELLATION', 'NON_RENEWING_PURCHASE', 'SUBSCRIPTION_PAUSED', 'EXPIRATION', 'BILLING_ISSUE', 'PRODUCT_CHANGE', 'SUBSCRIPTION_EXTENDED', 'REFUND_REVERSED', 'INVOICE_ISSUANCE', 'TRANSFER', 'TEMPORARY_ENTITLEMENT_GRANT', 'VIRTUAL_CURRENCY_TRANSACTION', 'EXPERIMENT_ENROLLMENT', 'PURCHASE_REDEEMED', 'PRICE_INCREASE_CONSENT_REQUIRED', 'PRICE_INCREASE_CONSENT_APPROVED', 'SUBSCRIBER_ALIAS'] as const;
export type RevenuecatWebhookEvent = (typeof webhookEvents)[number];
