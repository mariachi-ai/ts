// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Paddle Billing: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'paddle',
  name: 'Paddle Billing',
  category: 'payments',
  server: 'api.paddle.com',
  baseUrl: 'https://api.paddle.com',
  docs: 'https://developer.paddle.com/api-reference/overview',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'apiKey',
    env: 'PADDLE_API_KEY',
    label: 'API key',
    meaning: 'Authenticates the backend to the Paddle API (Bearer). Its prefix says which environment it is for: pdl_live_apikey_ calls https://api.paddle.com, pdl_sdbx_apikey_ calls https://sandbox-api.paddle.com, and a key only works in its own environment.',
    secret: true,
    required: true,
    whereToFind: 'Paddle › My account › Settings › Authentication › API keys › New API key, with the customer, price, product, subscription, transaction, adjustment, customer portal session and usage event permissions the app uses. Test is a separate sandbox account (sandbox-vendors.paddle.com) with its own keys. Keys expire: 90 days by default, a year at most.',
    url: 'https://developer.paddle.com/api-reference/about/api-keys',
    environments: {
      test: {
        notStartsWith: ['pdl_live_apikey_'],
        because: 'This is a live Paddle API key; the test environment uses a sandbox key (pdl_sdbx_apikey_…).',
      },
      production: {
        notStartsWith: ['pdl_sdbx_apikey_'],
        because: 'This is a sandbox Paddle API key; production needs a live key (pdl_live_apikey_…).',
      },
    },
  },
  {
    key: 'clientToken',
    env: 'PADDLE_CLIENT_TOKEN',
    label: 'Client-side token',
    meaning: "Initializes Paddle.js in the browser, which opens the checkout. Safe to publish; it can't call the API. test_ tokens are for the sandbox, live_ tokens for live.",
    secret: false,
    required: false,
    whereToFind: 'Paddle › My account › Settings › Authentication › Client-side tokens › New client-side token, in the sandbox account for test.',
    url: 'https://developer.paddle.com/paddle-js/about/client-side-tokens',
    public: true,
    environments: {
      test: {
        notStartsWith: ['live_'],
        because: 'This is a live client-side token; the test environment uses a sandbox token (test_…).',
      },
      production: {
        notStartsWith: ['test_'],
        because: 'This is a sandbox client-side token; production needs a live token (live_…).',
      },
    },
  },
  {
    key: 'webhookSecret',
    env: 'PADDLE_WEBHOOK_SECRET',
    label: 'Webhook secret key',
    meaning: "The notification destination's secret key, which signs every webhook Paddle sends to it. Each destination has its own.",
    secret: true,
    required: false,
    whereToFind: "Paddle › Events › Notifications › (your destination) › Edit destination › Secret key. The sandbox account's destination has its own key.",
    url: 'https://developer.paddle.com/webhooks/signature-verification',
  },
  {
    key: 'environment',
    env: 'PADDLE_ENVIRONMENT',
    label: 'Environment',
    meaning: 'sandbox or production. Only needed for an API key made before 6 May 2025, which has no pdl_ prefix to tell; with a prefixed key it must agree with the prefix.',
    secret: false,
    required: false,
    whereToFind: 'sandbox for a key from the sandbox account, production for a live one. Leave it unset for a pdl_ key.',
    url: 'https://developer.paddle.com/api-reference/about/api-keys',
    public: true,
  },
  {
    key: 'checkoutUrl',
    env: 'PADDLE_CHECKOUT_URL',
    label: 'Payment page',
    meaning: "The app's page that loads Paddle.js, on a domain Paddle approved. A checkout's url is this page with ?_ptxn=<transaction id>, and Paddle.js opens the checkout there. Unset: the account's default payment link.",
    secret: false,
    required: false,
    whereToFind: 'Paddle › Checkout › Checkout configuration › Default payment link, or another page on a website approved under Paddle › My account › Settings › Website approval.',
    url: 'https://developer.paddle.com/build/transactions/default-payment-link',
    public: true,
  },
];

/** The config `createPaddle` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  apiKey: z.string().min(1),
  clientToken: z.string().min(1).optional(),
  webhookSecret: z.string().min(1).optional(),
  environment: z.string().min(1).optional(),
  checkoutUrl: z.string().min(1).optional(),
});
export type PaddleConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  apiKey: 'PADDLE_API_KEY',
  clientToken: 'PADDLE_CLIENT_TOKEN',
  webhookSecret: 'PADDLE_WEBHOOK_SECRET',
  environment: 'PADDLE_ENVIRONMENT',
  checkoutUrl: 'PADDLE_CHECKOUT_URL',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'customers.create': {
    purpose: 'Creates a customer. Paddle keeps one customer per email address and takes no idempotency key: a repeat answers customer_already_exists.',
    method: 'POST',
    path: '/customers',
    idempotency: 'none',
  },
  'customers.get': {
    purpose: 'Reads a customer.',
    method: 'GET',
    path: '/customers/{customerId}',
    idempotency: 'natural',
  },
  'customers.update': {
    purpose: "Changes a customer's email, name, status or custom data.",
    method: 'PATCH',
    path: '/customers/{customerId}',
    idempotency: 'natural',
  },
  'customers.list': {
    purpose: 'Lists customers, here by exact email address and status.',
    method: 'GET',
    path: '/customers',
    idempotency: 'natural',
  },
  'customers.creditBalances': {
    purpose: "A customer's credit balance in each currency: available, reserved and used.",
    method: 'GET',
    path: '/customers/{customerId}/credit-balances',
    idempotency: 'natural',
  },
  'customerPortalSessions.create': {
    purpose: 'Signed-in links to the Paddle-hosted customer portal for a customer, optionally deep links for some of their subscriptions. Temporary: never stored.',
    method: 'POST',
    path: '/customers/{customerId}/portal-sessions',
    idempotency: 'none',
  },
  'prices.list': {
    purpose: "Lists the catalog's prices, with their products, a page at a time.",
    method: 'GET',
    path: '/prices',
    idempotency: 'natural',
  },
  'subscriptions.list': {
    purpose: "Lists a customer's subscriptions, a page at a time.",
    method: 'GET',
    path: '/subscriptions',
    idempotency: 'natural',
  },
  'subscriptions.get': {
    purpose: 'Reads a subscription, with its temporary management links.',
    method: 'GET',
    path: '/subscriptions/{subscriptionId}',
    idempotency: 'natural',
  },
  'subscriptions.update': {
    purpose: "Replaces a subscription's items (the complete list) with a proration billing mode, changes its custom data, or removes a scheduled change.",
    method: 'PATCH',
    path: '/subscriptions/{subscriptionId}',
    idempotency: 'natural',
  },
  'subscriptions.previewUpdate': {
    purpose: 'What an update would bill, now and at the next renewal, without making it.',
    method: 'PATCH',
    path: '/subscriptions/{subscriptionId}/preview',
    idempotency: 'natural',
  },
  'subscriptions.cancel': {
    purpose: 'Cancels a subscription at the end of the billing period (a scheduled change) or immediately.',
    method: 'POST',
    path: '/subscriptions/{subscriptionId}/cancel',
    idempotency: 'natural',
  },
  'subscriptions.pause': {
    purpose: 'Pauses a subscription at the end of the billing period or immediately.',
    method: 'POST',
    path: '/subscriptions/{subscriptionId}/pause',
    idempotency: 'natural',
  },
  'subscriptions.resume': {
    purpose: 'Resumes a paused subscription, immediately or on a date.',
    method: 'POST',
    path: '/subscriptions/{subscriptionId}/resume',
    idempotency: 'natural',
  },
  'transactions.create': {
    purpose: 'Creates an automatically-collected transaction for a checkout. Its checkout.url is the payment page with ?_ptxn=<id>; completing it creates the subscription for recurring items. No idempotency key: a repeat makes another unpaid transaction.',
    method: 'POST',
    path: '/transactions',
    idempotency: 'none',
  },
  'transactions.list': {
    purpose: "Lists a customer's transactions (Paddle's invoices and payments), 30 a page.",
    method: 'GET',
    path: '/transactions',
    idempotency: 'natural',
  },
  'transactions.get': {
    purpose: 'Reads a transaction, optionally with the totals of its adjustments.',
    method: 'GET',
    path: '/transactions/{transactionId}',
    idempotency: 'natural',
  },
  'transactions.invoice': {
    purpose: "A link to the transaction's invoice PDF, for billed or completed transactions. The link expires after an hour.",
    method: 'GET',
    path: '/transactions/{transactionId}/invoice',
    idempotency: 'natural',
  },
  'adjustments.create': {
    purpose: "Refunds all of a completed transaction or some of its items. Most live refunds wait for Paddle's approval. No idempotency key, so it is retried only when rate-limited.",
    method: 'POST',
    path: '/adjustments',
    idempotency: 'none',
  },
  'usageEvents.create': {
    purpose: 'Records metered usage (early access). Paddle counts each event once per customer and action by its event_key and occurred_at, so a resend with both unchanged is safe.',
    method: 'POST',
    path: '/usage-events',
    idempotency: 'natural',
  },
  'eventTypes.list': {
    purpose: 'Lists the event types: an authenticated call that changes nothing, for a health check.',
    method: 'GET',
    path: '/event-types',
    idempotency: 'natural',
  },
} as const;
export type PaddleOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  authentication_missing: {
    category: 'unauthorized',
    reason: 'unauthorized',
  },
  authentication_malformed: {
    category: 'unauthorized',
    reason: 'unauthorized',
  },
  invalid_token: {
    category: 'unauthorized',
    reason: 'unauthorized',
  },
  forbidden: {
    category: 'forbidden',
    reason: 'forbidden',
  },
  not_found: {
    category: 'not-found',
    reason: 'not-found',
  },
  customer_already_exists: {
    category: 'conflict',
    reason: 'customer-exists',
  },
  concurrent_modification: {
    category: 'conflict',
    reason: 'conflict',
  },
  subscription_locked_processing: {
    category: 'conflict',
    reason: 'subscription-locked',
  },
  subscription_locked_renewal: {
    category: 'conflict',
    reason: 'subscription-locked',
  },
  subscription_locked_pending_changes: {
    category: 'conflict',
    reason: 'subscription-locked',
  },
  subscription_update_when_past_due: {
    category: 'invalid-request',
    reason: 'subscription-past-due',
  },
  subscription_payment_declined: {
    category: 'invalid-request',
    reason: 'payment-declined',
  },
  adjustment_pending_refund_request: {
    category: 'conflict',
    reason: 'refund-pending',
  },
  transaction_default_checkout_url_not_set: {
    category: 'invalid-request',
    reason: 'no-payment-link',
  },
  transaction_checkout_url_domain_is_not_approved: {
    category: 'invalid-request',
    reason: 'domain-not-approved',
  },
  too_many_requests: {
    category: 'rate-limited',
    reason: 'rate-limited',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'hmac-sha256-timestamped',
  header: 'Paddle-Signature',
  secretSetting: 'webhookSecret',
  description: "The header is ts=<Unix seconds>;h1=<hex>, with more than one h1 while a secret is rotated. Each h1 is the hex HMAC-SHA256, keyed with the destination's secret key as-is, of the ts value, a colon and the raw request body. Reject a ts more than five seconds from now (Paddle's own tolerance), and deduplicate on the body's event_id.",
} as const;
export const webhookEvents = ['customer.created', 'customer.updated', 'subscription.created', 'subscription.activated', 'subscription.trialing', 'subscription.updated', 'subscription.past_due', 'subscription.paused', 'subscription.resumed', 'subscription.canceled', 'transaction.completed', 'transaction.payment_failed', 'adjustment.created', 'adjustment.updated', 'price.created', 'price.updated'] as const;
export type PaddleWebhookEvent = (typeof webhookEvents)[number];
