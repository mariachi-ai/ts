// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** PayPal: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'paypal',
  name: 'PayPal',
  category: 'payments',
  server: 'api-m.paypal.com',
  baseUrl: 'https://api-m.paypal.com',
  docs: 'https://developer.paypal.com/api/rest/',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'clientId',
    env: 'PAYPAL_CLIENT_ID',
    label: 'Client ID',
    meaning: "Names the app's REST API app. The server signs in with it, and the browser's PayPal JavaScript SDK loads with it.",
    secret: false,
    required: true,
    whereToFind: "Developer Dashboard › Apps & Credentials, in the app's REST API credentials. Use the Sandbox/Live toggle at the top: test uses the sandbox app's, production the live app's. Nothing in the value tells the two apart.",
    url: 'https://developer.paypal.com/api/rest/',
    public: true,
  },
  {
    key: 'clientSecret',
    env: 'PAYPAL_CLIENT_SECRET',
    label: 'Client secret',
    meaning: 'Authenticates the client ID when the server asks PayPal for an access token (OAuth 2.0 client credentials).',
    secret: true,
    required: true,
    whereToFind: 'Developer Dashboard › Apps & Credentials, next to the client ID of the same app and environment (Sandbox/Live toggle).',
    url: 'https://developer.paypal.com/api/rest/',
  },
  {
    key: 'environment',
    env: 'PAYPAL_ENVIRONMENT',
    label: 'Environment',
    meaning: "Which PayPal the credentials belong to: sandbox calls api-m.sandbox.paypal.com, live calls api-m.paypal.com. PayPal's credentials carry no prefix, so this says it.",
    secret: false,
    required: true,
    whereToFind: 'sandbox or live: the side of the Sandbox/Live toggle the credentials were copied from.',
    url: 'https://developer.paypal.com/api/rest/production/',
    public: true,
    environments: {
      test: {
        startsWith: ['sandbox'],
        because: "Test runs against PayPal's sandbox: set PAYPAL_ENVIRONMENT=sandbox with the sandbox app's credentials",
      },
      production: {
        startsWith: ['live'],
        because: "Production takes real payments: set PAYPAL_ENVIRONMENT=live with the live app's credentials",
      },
    },
  },
  {
    key: 'webhookId',
    env: 'PAYPAL_WEBHOOK_ID',
    label: 'Webhook ID',
    meaning: "The webhook PayPal signs each delivery for. Not a secret, but a delivery only verifies with it, so it's required to receive webhooks.",
    secret: false,
    required: false,
    whereToFind: "Developer Dashboard › Apps & Credentials › the app › Webhooks, after adding the app's webhook URL. Sandbox and live apps each have their own.",
    url: 'https://developer.paypal.com/api/rest/webhooks/rest/',
  },
];

/** The config `createPaypal` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  environment: z.string().min(1),
  webhookId: z.string().min(1).optional(),
});
export type PaypalConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  clientId: 'PAYPAL_CLIENT_ID',
  clientSecret: 'PAYPAL_CLIENT_SECRET',
  environment: 'PAYPAL_ENVIRONMENT',
  webhookId: 'PAYPAL_WEBHOOK_ID',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'oauth.token': {
    purpose: 'Exchanges the client ID and secret for an access token (client credentials, HTTP Basic). Cached until shortly before it expires.',
    method: 'POST',
    path: '/v1/oauth2/token',
    idempotency: 'natural',
  },
  'orders.create': {
    purpose: "Creates an order to capture one payment. The buyer approves it on PayPal (the JavaScript SDK, or the order's approve link) before it can be captured.",
    method: 'POST',
    path: '/v2/checkout/orders',
    idempotency: {
      header: 'PayPal-Request-Id',
    },
  },
  'orders.get': {
    purpose: 'Reads an order: its status, purchase unit and any captures and refunds.',
    method: 'GET',
    path: '/v2/checkout/orders/{orderId}',
    idempotency: 'natural',
  },
  'orders.capture': {
    purpose: 'Captures the payment of an order the buyer approved.',
    method: 'POST',
    path: '/v2/checkout/orders/{orderId}/capture',
    idempotency: {
      header: 'PayPal-Request-Id',
    },
  },
  'captures.get': {
    purpose: 'Reads a captured payment, with the order it belongs to.',
    method: 'GET',
    path: '/v2/payments/captures/{captureId}',
    idempotency: 'natural',
  },
  'captures.refund': {
    purpose: 'Refunds a captured payment, in full or in part.',
    method: 'POST',
    path: '/v2/payments/captures/{captureId}/refund',
    idempotency: {
      header: 'PayPal-Request-Id',
    },
  },
  'refunds.get': {
    purpose: 'Reads a refund.',
    method: 'GET',
    path: '/v2/payments/refunds/{refundId}',
    idempotency: 'natural',
  },
  'products.create': {
    purpose: 'Creates a catalog product, which billing plans belong to.',
    method: 'POST',
    path: '/v1/catalogs/products',
    idempotency: {
      header: 'PayPal-Request-Id',
    },
  },
  'products.list': {
    purpose: 'Lists catalog products, a page at a time.',
    method: 'GET',
    path: '/v1/catalogs/products',
    idempotency: 'natural',
  },
  'plans.create': {
    purpose: 'Creates a billing plan for a product: its price and how often it bills.',
    method: 'POST',
    path: '/v1/billing/plans',
    idempotency: {
      header: 'PayPal-Request-Id',
    },
  },
  'plans.list': {
    purpose: 'Lists billing plans, a page at a time, optionally of one product.',
    method: 'GET',
    path: '/v1/billing/plans',
    idempotency: 'natural',
  },
  'plans.get': {
    purpose: 'Reads a billing plan with its billing cycles.',
    method: 'GET',
    path: '/v1/billing/plans/{planId}',
    idempotency: 'natural',
  },
  'subscriptions.create': {
    purpose: 'Creates a subscription to a plan. It waits for the subscriber to approve it on PayPal (its approve link, or the JavaScript SDK) before it becomes active.',
    method: 'POST',
    path: '/v1/billing/subscriptions',
    idempotency: {
      header: 'PayPal-Request-Id',
    },
  },
  'subscriptions.get': {
    purpose: 'Reads a subscription: its status, plan, quantity and billing info.',
    method: 'GET',
    path: '/v1/billing/subscriptions/{subscriptionId}',
    idempotency: 'natural',
  },
  'subscriptions.suspend': {
    purpose: 'Suspends a subscription: it stops billing until it is activated again.',
    method: 'POST',
    path: '/v1/billing/subscriptions/{subscriptionId}/suspend',
    idempotency: 'natural',
  },
  'subscriptions.activate': {
    purpose: 'Activates a suspended subscription.',
    method: 'POST',
    path: '/v1/billing/subscriptions/{subscriptionId}/activate',
    idempotency: 'natural',
  },
  'subscriptions.cancel': {
    purpose: 'Cancels a subscription, at once.',
    method: 'POST',
    path: '/v1/billing/subscriptions/{subscriptionId}/cancel',
    idempotency: 'natural',
  },
  'subscriptions.revise': {
    purpose: "Asks to change a subscription's plan or quantity. The subscriber approves the change on PayPal, through the approve link in the answer.",
    method: 'POST',
    path: '/v1/billing/subscriptions/{subscriptionId}/revise',
    idempotency: 'none',
  },
  'webhookCerts.get': {
    purpose: "Downloads the X.509 certificate a webhook delivery names in PAYPAL-CERT-URL, to check its signature. Only from PayPal's own API host.",
    method: 'GET',
    path: '/v1/notifications/certs/{certId}',
    idempotency: 'natural',
  },
} as const;
export type PaypalOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  INSTRUMENT_DECLINED: {
    category: 'invalid-request',
    reason: 'instrument-declined',
  },
  PAYER_ACTION_REQUIRED: {
    category: 'invalid-request',
    reason: 'payer-action-required',
  },
  ORDER_NOT_APPROVED: {
    category: 'invalid-request',
    reason: 'order-not-approved',
  },
  ORDER_EXPIRED: {
    category: 'invalid-request',
    reason: 'order-expired',
  },
  ORDER_ALREADY_CAPTURED: {
    category: 'conflict',
    reason: 'order-already-captured',
  },
  TRANSACTION_REFUSED: {
    category: 'invalid-request',
    reason: 'transaction-refused',
  },
  PAYER_CANNOT_PAY: {
    category: 'invalid-request',
    reason: 'payer-cannot-pay',
  },
  MAX_NUMBER_OF_PAYMENT_ATTEMPTS_EXCEEDED: {
    category: 'invalid-request',
    reason: 'payment-attempts-exceeded',
  },
  PAYEE_ACCOUNT_RESTRICTED: {
    category: 'forbidden',
    reason: 'payee-account-restricted',
  },
  DUPLICATE_INVOICE_ID: {
    category: 'conflict',
    reason: 'duplicate-invoice-id',
  },
  CAPTURE_FULLY_REFUNDED: {
    category: 'conflict',
    reason: 'capture-fully-refunded',
  },
  REFUND_AMOUNT_EXCEEDED: {
    category: 'invalid-request',
    reason: 'refund-amount-exceeded',
  },
  SUBSCRIPTION_STATUS_INVALID: {
    category: 'conflict',
    reason: 'subscription-status-invalid',
  },
  INVALID_RESOURCE_ID: {
    category: 'not-found',
    reason: 'not-found',
  },
  RESOURCE_NOT_FOUND: {
    category: 'not-found',
    reason: 'not-found',
  },
  UNPROCESSABLE_ENTITY: {
    category: 'invalid-request',
    reason: 'unprocessable',
  },
  INVALID_REQUEST: {
    category: 'invalid-request',
    reason: 'invalid-request',
  },
  AUTHENTICATION_FAILURE: {
    category: 'unauthorized',
    reason: 'unauthorized',
  },
  invalid_client: {
    category: 'unauthorized',
    reason: 'invalid-client',
  },
  NOT_AUTHORIZED: {
    category: 'forbidden',
    reason: 'forbidden',
  },
  PERMISSION_DENIED: {
    category: 'forbidden',
    reason: 'forbidden',
  },
  RESOURCE_CONFLICT: {
    category: 'unavailable',
    reason: 'request-in-progress',
  },
  PREVIOUS_REQUEST_IN_PROGRESS: {
    category: 'unavailable',
    reason: 'request-in-progress',
  },
  RATE_LIMIT_REACHED: {
    category: 'rate-limited',
    reason: 'rate-limited',
  },
  INTERNAL_SERVER_ERROR: {
    category: 'unavailable',
    reason: 'unavailable',
  },
  SERVICE_UNAVAILABLE: {
    category: 'unavailable',
    reason: 'unavailable',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'rsa-sha256-certificate',
  header: 'PAYPAL-TRANSMISSION-SIG',
  secretSetting: 'webhookId',
  description: "PAYPAL-TRANSMISSION-SIG is the base64 RSA signature (PAYPAL-AUTH-ALGO: SHA256withRSA) of the string <PAYPAL-TRANSMISSION-ID>|<PAYPAL-TRANSMISSION-TIME>|<webhook id>|<CRC32 of the raw body, as an unsigned decimal>, made with the key of the X.509 certificate at PAYPAL-CERT-URL. The webhook id is not sent: it is the one the app's webhook was given. Fetch the certificate only from PayPal's API host for the environment (https, /v1/notifications/certs/<id>), and cache it. The body is covered only by its CRC32, so deduplicate on the signed transmission id and re-read state from the API before acting on money. PayPal retries a delivery that isn't answered 2xx, up to 25 times over 3 days.",
} as const;
export const webhookEvents = ['PAYMENT.CAPTURE.COMPLETED', 'PAYMENT.CAPTURE.DECLINED', 'PAYMENT.CAPTURE.DENIED', 'PAYMENT.CAPTURE.REFUNDED', 'BILLING.SUBSCRIPTION.ACTIVATED', 'BILLING.SUBSCRIPTION.UPDATED', 'BILLING.SUBSCRIPTION.SUSPENDED', 'BILLING.SUBSCRIPTION.CANCELLED', 'BILLING.SUBSCRIPTION.EXPIRED', 'BILLING.SUBSCRIPTION.PAYMENT.FAILED'] as const;
export type PaypalWebhookEvent = (typeof webhookEvents)[number];
