// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Clerk: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'clerk',
  name: 'Clerk',
  category: 'auth',
  server: 'api.clerk.com',
  docs: 'https://clerk.com/docs/reference/backend-api',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'secretKey',
    env: 'CLERK_SECRET_KEY',
    label: 'Secret key',
    meaning: "Authenticates the backend to Clerk's Backend API, which serves the instance's signing keys.",
    secret: true,
    required: true,
    whereToFind: 'Dashboard › Configure › API keys › Secret keys. The development instance has its own keys.',
    url: 'https://clerk.com/docs/deployments/clerk-environment-variables',
    environments: {
      test: {
        startsWith: ['sk_test_'],
        because: "A development instance's secret key starts with sk_test_",
      },
      production: {
        startsWith: ['sk_live_'],
        because: "A production instance's secret key starts with sk_live_",
      },
    },
  },
  {
    key: 'publishableKey',
    env: 'CLERK_PUBLISHABLE_KEY',
    label: 'Publishable key',
    meaning: 'Names the instance, for the frontend and the SDK.',
    secret: false,
    required: false,
    whereToFind: 'Dashboard › Configure › API keys › Publishable key.',
    url: 'https://clerk.com/docs/deployments/clerk-environment-variables',
    public: true,
    environments: {
      test: {
        startsWith: ['pk_test_'],
        because: "A development instance's publishable key starts with pk_test_",
      },
      production: {
        startsWith: ['pk_live_'],
        because: "A production instance's publishable key starts with pk_live_",
      },
    },
  },
  {
    key: 'jwtKey',
    env: 'CLERK_JWT_KEY',
    label: 'JWT public key',
    meaning: "The instance's public key as PEM, to verify session tokens with no call to Clerk at all. Without it, the keys are read from the Backend API.",
    secret: false,
    required: false,
    whereToFind: 'Dashboard › Configure › API keys › Show JWT public key › PEM public key.',
    url: 'https://clerk.com/docs/backend-requests/manual-jwt',
    public: true,
  },
  {
    key: 'webhookSigningSecret',
    env: 'CLERK_WEBHOOK_SIGNING_SECRET',
    label: 'Webhook signing secret',
    meaning: 'Checks that a webhook came from Clerk (through Svix).',
    secret: true,
    required: false,
    whereToFind: 'Dashboard › Configure › Webhooks › the endpoint › Signing Secret (whsec_…).',
    url: 'https://clerk.com/docs/webhooks/sync-data',
  },
];

/** The config `createClerk` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  secretKey: z.string().min(1),
  publishableKey: z.string().min(1).optional(),
  jwtKey: z.string().min(1).optional(),
  webhookSigningSecret: z.string().min(1).optional(),
});
export type ClerkConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  secretKey: 'CLERK_SECRET_KEY',
  publishableKey: 'CLERK_PUBLISHABLE_KEY',
  jwtKey: 'CLERK_JWT_KEY',
  webhookSigningSecret: 'CLERK_WEBHOOK_SIGNING_SECRET',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'jwks.get': {
    purpose: "Reads the instance's signing keys from the Backend API, without CLERK_JWT_KEY: when none are cached, every five minutes, and when a token names a key not yet seen (at most once every five seconds).",
    method: 'GET',
    path: '/v1/jwks',
    idempotency: 'natural',
  },
} as const;
export type ClerkOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  clerk_key_invalid: {
    category: 'unauthorized',
    reason: 'key-invalid',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'standard-webhooks',
  header: 'svix-signature',
  secretSetting: 'webhookSigningSecret',
  description: "Svix, which Standard Webhooks follows: svix-id, svix-timestamp (Unix seconds) and svix-signature headers; the signature is v1,<base64 HMAC-SHA256 of '<id>.<timestamp>.<raw body>'> keyed with the base64 after whsec_. Several may be space-separated; one match is enough. Refuse a timestamp more than five minutes away.",
} as const;
export const webhookEvents = ['user.created', 'user.updated', 'user.deleted', 'session.created', 'session.ended', 'session.removed', 'session.revoked', 'organization.created', 'organization.updated', 'organization.deleted', 'organizationMembership.created', 'organizationMembership.updated', 'organizationMembership.deleted', 'email.created'] as const;
export type ClerkWebhookEvent = (typeof webhookEvents)[number];
