# @mariachi/integration-supabase

Supabase for a Mariachi app. Most of a Supabase project is reached through Mariachi's own ports:

- the database through `@mariachi/database-postgres`;
- sign-in through `@mariachi/auth-gotrue` (Supabase Auth is GoTrue);
- files through `@mariachi/storage`'s S3 adapter.

This package gives those ports their config (`supabaseDatabaseConfig`, `supabaseAuthConfig`,
`supabaseStorageConfig`). It also covers what no port does: Edge Functions, Auth's admin API, and
Auth Hooks, signed with Standard Webhooks.

The whole walkthrough, with which connection string to use and how Row Level Security applies, is
the recipe [use-supabase.md](../core/docs/recipes/use-supabase.md).

**Status: alpha.** Covered by unit tests against a scripted Supabase. The contract is in
[contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `SUPABASE_URL` | The project URL, `https://<project-ref>.supabase.co` (public) | The dashboard's Connect dialog |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…`, or the legacy `anon` key (public, optional) | Settings › API Keys |
| `SUPABASE_SECRET_KEY` | `sb_secret_…`, or the legacy `service_role` key (secret, server only; bypasses RLS) | Settings › API Keys › Secret keys |
| `SUPABASE_AUTH_HOOK_SECRET` | `v1,whsec_…`, for Auth Hooks (secret, optional) | Authentication › Hooks, on the HTTP hook |
| `SUPABASE_S3_ACCESS_KEY_ID`, `SUPABASE_S3_SECRET_ACCESS_KEY`, `SUPABASE_S3_REGION` | Storage's S3 access key and region (optional; the secret bypasses RLS) | Storage settings › S3 access keys, and the Storage S3 page |

The database is Mariachi's own `DATABASE_URL`, set to one of the project's connection strings.

Supabase has no test mode. Test is another project, or a
[Branching](https://supabase.com/docs/guides/deployment/branching) branch, with its own values for
each of these. The legacy `anon` and `service_role` keys still work, and Supabase deprecates them by
the end of 2026. The new keys go on the `apikey` header only, and the client sends each kind the way
Supabase takes it.

## Use

```ts
import { readEnv } from '@mariachi/config';
import { settingsFromEnv } from '@mariachi/integrations';
import { createSupabase, settings, type SupabaseConfig } from '@mariachi/integration-supabase';

// src/app.ts: once, with the container's tracer and metrics
const supabaseConfig = settingsFromEnv<SupabaseConfig>(settings, readEnv);
const supabase = createSupabase(supabaseConfig, { tracer, metrics });

// An Edge Function, as the app (the secret key)...
const result = await supabase.functions.invoke(ctx, { name: 'resize-image', body: { path } }, ResizeResult);
// ...or for the signed-in user, under their Row Level Security
await supabase.functions.invoke(ctx, { name: 'my-orders', accessToken });

// Auth's admin API
const user = await supabase.admin.users.get(ctx, ctx.userId!);
await supabase.admin.users.invite(ctx, { email, redirectTo: 'https://app.example.com/welcome' });
for await (const u of supabase.admin.users.all(ctx)) { /* ... */ }
```

Every operation takes `ctx` first and makes one span (`supabase functions.invoke`). A failure is a
`SupabaseError` with a category, and with Auth's own code in `providerCode` (`supabase/email-exists`
from `email_exists`). Only `rate-limited` and `unavailable` are retried, and creating or inviting a
user only on `rate-limited`, since an outage may come after the user was made. `functions.invoke`
tries once unless you pass `safeToRetry: true`, because a function that failed may already have
done its work.

A function called with the secret key must check that key itself: set `verify_jwt = false` and use
`withSupabase({ auth: 'secret' })` in it. Supabase's own JWT check doesn't understand the new keys.

## The ports

```ts
const database = createPostgresDatabase(supabaseDatabaseConfig(config.database.url));   // TLS; no prepared statements on :6543
const auth = createGoTrueAuth(supabaseAuthConfig(supabaseConfig));                       // <url>/auth/v1, ES256 or RS256 via JWKS
const files = createStorage(supabaseStorageConfig(supabaseConfig, { bucket: 'uploads' })); // the S3 endpoint, path-style
```

Tokens are checked against the project's JWKS. A project still on the legacy JWT secret must move
to JWT signing keys first (dashboard › JWT Keys), which Supabase does without signing anyone out.

## Auth Hooks

```ts
import { WebhookController } from '@mariachi/webhooks';
import { SendEmailHookBody, supabaseAuthHookAuth, supabaseAuthHookType } from '@mariachi/integration-supabase';

export class SupabaseHooks extends WebhookController {
  readonly prefix = 'supabase';
  readonly auth = supabaseAuthHookAuth(supabaseConfig.authHookSecret!);
  init() {
    this.post('send-email', { mode: 'queue', jobName: 'auth-email', eventType: supabaseAuthHookType, logPayload: false },
      async (_ctx, body) => SendEmailHookBody.parse(body));
  }
}
```

- Each hook has its own URL. Send Email and Send SMS need no answer and fit `WebhookServer`.
- The hooks whose answer Supabase reads (Custom Access Token, Before User Created, MFA and Password
  Verification Attempt) don't fit, because `WebhookServer` sends its own acknowledgement. Write
  those as Postgres function hooks.
- **Database Webhooks are not signed.** Never trust one as proof of anything. Have the job read
  the row back.

## Realtime

Realtime isn't in this package. Use `@supabase/supabase-js` in the browser, with the publishable key
and the user's session. Its subscriptions follow Row Level Security, so the tables it watches need
policies.

## Test

```ts
import { fakeSupabase, signedSupabaseAuthHook, supabaseUser } from '@mariachi/integration-supabase/testing';

const supabase = fakeSupabase({ functions: { 'resize-image': (body) => ({ ok: true }) }, users: [supabaseUser({ email: 'ada@example.com' })] });
const { rawBody, headers } = signedSupabaseAuthHook(sendEmailBody, secret);   // post it to the controller
```
