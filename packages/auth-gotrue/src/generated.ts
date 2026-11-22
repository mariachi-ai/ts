// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** GoTrue (Supabase Auth): who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'gotrue',
  name: 'GoTrue (Supabase Auth)',
  category: 'auth',
  server: '{url}',
  docs: 'https://github.com/supabase/auth',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'url',
    env: 'GOTRUE_URL',
    label: 'GoTrue URL',
    meaning: "GoTrue's base URL as this server reaches it, path prefix included: https://<project>.supabase.co/auth/v1, or http://127.0.0.1:9999 for a sidecar. Its keys are at <url>/.well-known/jwks.json.",
    secret: false,
    required: true,
    whereToFind: 'Supabase: Project Settings › API › Project URL, plus /auth/v1. Self-hosted: the address GoTrue listens on (API_EXTERNAL_URL). Test is another project or instance, with its own URL and keys.',
    url: 'https://supabase.com/docs/guides/auth/jwts',
    public: true,
  },
  {
    key: 'jwksUrl',
    env: 'GOTRUE_JWKS_URL',
    label: 'JWKS URL',
    meaning: "Where the signing keys are, when it isn't <url>/.well-known/jwks.json (an internal address).",
    secret: false,
    required: false,
    whereToFind: 'Usually not needed: <url>/.well-known/jwks.json.',
    url: 'https://supabase.com/docs/guides/auth/signing-keys',
    public: true,
  },
  {
    key: 'issuer',
    env: 'GOTRUE_JWT_ISSUER',
    label: 'Issuer',
    meaning: 'The iss every token must carry. Default the URL. GoTrue sets iss only when its own GOTRUE_JWT_ISSUER is configured, so set both to the same value.',
    secret: false,
    required: false,
    whereToFind: "GoTrue's GOTRUE_JWT_ISSUER; on Supabase, the project URL with /auth/v1.",
    url: 'https://supabase.com/docs/guides/auth/jwts',
    public: true,
  },
  {
    key: 'audience',
    env: 'GOTRUE_JWT_AUD',
    label: 'Audience',
    meaning: 'The aud every token must carry. Default authenticated.',
    secret: false,
    required: false,
    whereToFind: "GoTrue's GOTRUE_JWT_AUD (authenticated unless changed).",
    url: 'https://supabase.com/docs/guides/auth/jwt-fields',
    public: true,
  },
  {
    key: 'serviceKey',
    env: 'GOTRUE_SERVICE_KEY',
    label: 'Service key',
    meaning: "Reads a user's record through GoTrue's admin API, to say whether their email is verified (goTrueVerifiedEmail). Never sent to a browser.",
    secret: true,
    required: false,
    whereToFind: "Supabase: Project Settings › API Keys › the secret (service_role) key. Self-hosted: a JWT signed with GoTrue's key whose role is service_role.",
    url: 'https://supabase.com/docs/guides/api/api-keys',
  },
  {
    key: 'hookSecret',
    env: 'GOTRUE_HOOK_SECRET',
    label: 'Hook secret',
    meaning: 'Checks that an HTTP hook came from GoTrue: v1,whsec_<base64>, several separated by | while one is being rotated.',
    secret: true,
    required: false,
    whereToFind: 'Supabase: Authentication › Hooks › the hook › Secret. Self-hosted: GOTRUE_HOOK_<NAME>_SECRETS.',
    url: 'https://supabase.com/docs/guides/auth/auth-hooks',
  },
];

/** The config `createGotrue` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  url: z.string().min(1),
  jwksUrl: z.string().min(1).optional(),
  issuer: z.string().min(1).optional(),
  audience: z.string().min(1).optional(),
  serviceKey: z.string().min(1).optional(),
  hookSecret: z.string().min(1).optional(),
});
export type GotrueConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  url: 'GOTRUE_URL',
  jwksUrl: 'GOTRUE_JWKS_URL',
  issuer: 'GOTRUE_JWT_ISSUER',
  audience: 'GOTRUE_JWT_AUD',
  serviceKey: 'GOTRUE_SERVICE_KEY',
  hookSecret: 'GOTRUE_HOOK_SECRET',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'discovery.get': {
    purpose: "Reads GoTrue's discovery document for its issuer. Only with discoverIssuer.",
    method: 'GET',
    path: '/.well-known/openid-configuration',
    idempotency: 'natural',
  },
  'jwks.get': {
    purpose: "Reads GoTrue's signing keys: when none are cached, when the cache expires, and when a token names a key not yet seen (at most once per cooldown).",
    method: 'GET',
    path: '/.well-known/jwks.json',
    idempotency: 'natural',
  },
  'settings.get': {
    purpose: "Reads GoTrue's public settings, for whether it confirms sign-ups without sending mail (mailer_autoconfirm).",
    method: 'GET',
    path: '/settings',
    idempotency: 'natural',
  },
  'users.get': {
    purpose: "Reads one user's record through the admin API, for its email and email_confirmed_at.",
    method: 'GET',
    path: '/admin/users/{id}',
    idempotency: 'natural',
  },
} as const;
export type GotrueOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'standard-webhooks',
  header: 'webhook-signature',
  secretSetting: 'hookSecret',
  description: "Standard Webhooks: webhook-id, webhook-timestamp (Unix seconds) and webhook-signature headers; the signature is v1,<base64 HMAC-SHA256 of '<id>.<timestamp>.<raw body>'> keyed with the base64 after whsec_. Several signatures may be space-separated; one match is enough. Refuse a timestamp more than five minutes away.",
} as const;
export const webhookEvents = ['customize-access-token', 'send-email', 'send-sms', 'before-user-created', 'after-user-created', 'mfa-verification', 'password-verification'] as const;
export type GotrueWebhookEvent = (typeof webhookEvents)[number];
