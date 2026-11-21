// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Supabase: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'supabase',
  name: 'Supabase',
  category: 'backend',
  server: '<project-ref>.supabase.co',
  docs: 'https://supabase.com/docs',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'url',
    env: 'SUPABASE_URL',
    label: 'Project URL',
    meaning: "The project's API address. Auth, Edge Functions and Storage are paths under it.",
    secret: false,
    required: true,
    whereToFind: "The dashboard's Connect dialog: https://<project-ref>.supabase.co. Supabase has no test mode: test is another project, or a Branching branch, each with its own URL and keys.",
    url: 'https://supabase.com/docs/guides/api/api-keys',
    public: true,
  },
  {
    key: 'publishableKey',
    env: 'SUPABASE_PUBLISHABLE_KEY',
    label: 'Publishable key',
    meaning: "Names the project on calls made for a signed-in user, alongside the user's own token. Safe in a browser: what it may do is what Row Level Security allows.",
    secret: false,
    required: false,
    whereToFind: 'Settings › API Keys: the publishable key (sb_publishable_…), or the legacy anon key while it still works.',
    url: 'https://supabase.com/docs/guides/api/api-keys',
    public: true,
  },
  {
    key: 'secretKey',
    env: 'SUPABASE_SECRET_KEY',
    label: 'Secret key',
    meaning: "Calls Auth's admin API and Edge Functions as the app. It bypasses Row Level Security, so it never leaves the server; Supabase refuses it from a browser.",
    secret: true,
    required: true,
    whereToFind: 'Settings › API Keys › Secret keys: a secret key (sb_secret_…), or the legacy service_role key while it still works. Supabase deprecates the legacy keys by the end of 2026.',
    url: 'https://supabase.com/docs/guides/api/api-keys',
  },
  {
    key: 'authHookSecret',
    env: 'SUPABASE_AUTH_HOOK_SECRET',
    label: 'Auth Hook secret',
    meaning: "Checks that an HTTP Auth Hook's request came from Supabase Auth.",
    secret: true,
    required: false,
    whereToFind: 'Authentication › Hooks, on the HTTP hook: its secret, v1,whsec_<base64>. Join two with | while rotating.',
    url: 'https://supabase.com/docs/guides/auth/auth-hooks',
  },
  {
    key: 's3AccessKeyId',
    env: 'SUPABASE_S3_ACCESS_KEY_ID',
    label: 'S3 access key id',
    meaning: "With its secret, reads and writes the project's buckets through Storage's S3 endpoint, for @mariachi/storage.",
    secret: false,
    required: false,
    whereToFind: "The project's Storage settings (dashboard/project/<project-ref>/storage/settings): S3 access keys, a new access key. The S3 connection must be enabled there too.",
    url: 'https://supabase.com/docs/guides/storage/s3/authentication',
  },
  {
    key: 's3SecretAccessKey',
    env: 'SUPABASE_S3_SECRET_ACCESS_KEY',
    label: 'S3 secret access key',
    meaning: "The access key's secret. It reaches every bucket and bypasses Row Level Security, so it never leaves the server.",
    secret: true,
    required: false,
    whereToFind: 'Shown with the access key id when the key is made.',
    url: 'https://supabase.com/docs/guides/storage/s3/authentication',
  },
  {
    key: 's3Region',
    env: 'SUPABASE_S3_REGION',
    label: 'S3 region',
    meaning: "The region Storage's S3 endpoint signs requests for: the project's region.",
    secret: false,
    required: false,
    whereToFind: "The project's Storage S3 page (dashboard/project/<project-ref>/storage/s3): the region shown with the endpoint.",
    url: 'https://supabase.com/docs/guides/storage/s3/authentication',
  },
];

/** The config `createSupabase` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  url: z.string().min(1),
  publishableKey: z.string().min(1).optional(),
  secretKey: z.string().min(1),
  authHookSecret: z.string().min(1).optional(),
  s3AccessKeyId: z.string().min(1).optional(),
  s3SecretAccessKey: z.string().min(1).optional(),
  s3Region: z.string().min(1).optional(),
});
export type SupabaseConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  url: 'SUPABASE_URL',
  publishableKey: 'SUPABASE_PUBLISHABLE_KEY',
  secretKey: 'SUPABASE_SECRET_KEY',
  authHookSecret: 'SUPABASE_AUTH_HOOK_SECRET',
  s3AccessKeyId: 'SUPABASE_S3_ACCESS_KEY_ID',
  s3SecretAccessKey: 'SUPABASE_S3_SECRET_ACCESS_KEY',
  s3Region: 'SUPABASE_S3_REGION',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'functions.invoke': {
    purpose: 'Calls an Edge Function by name with a JSON body: as the app (the secret key), or for a signed-in user (their token, with the publishable key).',
    method: 'POST',
    path: '/functions/v1/{name}',
    idempotency: 'none',
  },
  'admin.users.list': {
    purpose: "Lists the project's users, a page at a time.",
    method: 'GET',
    path: '/auth/v1/admin/users',
    idempotency: 'natural',
  },
  'admin.users.get': {
    purpose: 'Reads one user by id.',
    method: 'GET',
    path: '/auth/v1/admin/users/{userId}',
    idempotency: 'natural',
  },
  'admin.users.create': {
    purpose: 'Creates a user with an email address (and optionally a password), confirmed or not. Sends no email.',
    method: 'POST',
    path: '/auth/v1/admin/users',
    idempotency: 'none',
  },
  'admin.users.invite': {
    purpose: 'Invites a user by email: Supabase Auth sends the invitation, whose link signs them in.',
    method: 'POST',
    path: '/auth/v1/invite',
    idempotency: 'none',
  },
  'admin.users.delete': {
    purpose: 'Deletes a user, or soft-deletes them.',
    method: 'DELETE',
    path: '/auth/v1/admin/users/{userId}',
    idempotency: 'natural',
  },
} as const;
export type SupabaseOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  email_exists: {
    category: 'conflict',
    reason: 'email-exists',
  },
  phone_exists: {
    category: 'conflict',
    reason: 'phone-exists',
  },
  user_already_exists: {
    category: 'conflict',
    reason: 'user-exists',
  },
  user_not_found: {
    category: 'not-found',
    reason: 'user-not-found',
  },
  weak_password: {
    category: 'invalid-request',
    reason: 'weak-password',
  },
  email_address_invalid: {
    category: 'invalid-request',
    reason: 'email-invalid',
  },
  validation_failed: {
    category: 'invalid-request',
    reason: 'invalid-request',
  },
  over_request_rate_limit: {
    category: 'rate-limited',
    reason: 'rate-limited',
  },
  over_email_send_rate_limit: {
    category: 'rate-limited',
    reason: 'email-rate-limited',
  },
  not_admin: {
    category: 'forbidden',
    reason: 'not-admin',
  },
  bad_jwt: {
    category: 'unauthorized',
    reason: 'bad-jwt',
  },
  no_authorization: {
    category: 'unauthorized',
    reason: 'unauthorized',
  },
  request_timeout: {
    category: 'unavailable',
    reason: 'timeout',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'standard-webhooks',
  header: 'webhook-signature',
  secretSetting: 'authHookSecret',
  description: 'Standard Webhooks: webhook-id, webhook-timestamp (Unix seconds) and webhook-signature, a space-separated list of v1,<base64 HMAC-SHA256 of "<webhook-id>.<webhook-timestamp>.<raw body>">, keyed with the base64-decoded part of the secret after v1,whsec_. Each hook is configured with its own URL, so the route names the hook.',
} as const;
export const webhookEvents = ['send-email', 'send-sms', 'before-user-created', 'custom-access-token', 'mfa-verification-attempt', 'password-verification-attempt'] as const;
export type SupabaseWebhookEvent = (typeof webhookEvents)[number];
