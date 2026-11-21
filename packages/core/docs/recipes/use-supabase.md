# Recipe: use a Supabase project

This recipe is for an app whose backend already lives in Supabase. The app keeps using all of it,
through Mariachi's ports, so its code is the same as any other Mariachi app's:

| Supabase | Mariachi | How |
| --- | --- | --- |
| Database (Postgres) | `@mariachi/database-postgres` | `DATABASE_URL` is one of the project's connection strings |
| Auth (GoTrue) | `@mariachi/auth-gotrue` | Access tokens checked against the project's JWKS |
| Storage | `@mariachi/storage`, S3 adapter | Storage's S3 endpoint, with an S3 access key |
| Edge Functions, Auth's admin API, Auth Hooks | `@mariachi/integration-supabase` | `createSupabase`, `supabaseAuthHookAuth` |
| Realtime, sign-in screens | the browser | `@supabase/supabase-js`, with the publishable key |

Start from `mariachi init --auth gotrue`, then make the changes below in `src/app.ts`.

## 1. In the dashboard, first

- **JWT signing keys.** Mariachi checks access tokens against the project's public keys
  (`https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`), never against a shared
  secret. A project still on the legacy JWT secret has no public key to check against. Move it in
  Settings › JWT Keys: **Migrate JWT secret**, then **Rotate keys**. Tokens already issued stay
  valid, so nobody is signed out
  ([signing keys](https://supabase.com/docs/guides/auth/signing-keys)).
- **API keys.** In Settings › API Keys, make a secret key (`sb_secret_…`) for the server, and copy
  the publishable key (`sb_publishable_…`). The legacy `anon` and `service_role` keys still work,
  and Supabase deprecates them by the end of 2026
  ([API keys](https://supabase.com/docs/guides/api/api-keys)).
- **Storage.** Turn on the S3 connection in the project's Storage settings, and make an S3 access
  key there. The region is on the Storage S3 page
  ([S3 authentication](https://supabase.com/docs/guides/storage/s3/authentication)).
- **The database password.** Copy the connection string you want from the Connect dialog (next
  section).

## 2. The settings

| Variable | What it is | Secret |
| --- | --- | --- |
| `DATABASE_URL` | A connection string (section 3). Mariachi's config, CLI and doctor all read it | yes |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` | no (public) |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` or the legacy `anon` key | no (public) |
| `SUPABASE_SECRET_KEY` | `sb_secret_…` or the legacy `service_role` key. It bypasses Row Level Security. Server only: Supabase refuses it from a browser | yes |
| `SUPABASE_AUTH_HOOK_SECRET` | The HTTP Auth Hook's secret, `v1,whsec_…` (optional) | yes |
| `SUPABASE_S3_ACCESS_KEY_ID`, `SUPABASE_S3_SECRET_ACCESS_KEY`, `SUPABASE_S3_REGION` | Storage's S3 access key and region | the secret, yes |
| `STORAGE_BUCKET` | The bucket the app's files go in | no |

Supabase has no test mode. Test is another project, or a
[Branching](https://supabase.com/docs/guides/deployment/branching) branch. Each has its own URL,
keys and connection strings, and nothing in a key tells you which project it belongs to. So keep
each environment's values apart where the host keeps its secrets.

## 3. Which connection string

| The process | Connection string | Why |
| --- | --- | --- |
| A long-running server (a container, a VM) | **Session pooler**: `postgresql://postgres.<project-ref>:<password>@aws-<n>-<region>.pooler.supabase.com:5432/postgres` | Works from IPv4 and keeps sessions, so everything in Mariachi works |
| The same, where the host has IPv6 or the project has the IPv4 add-on | **Direct**: `postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres` | No pooler in between. It is IPv6-only without the add-on |
| Short-lived processes (serverless, edge) | **Transaction pooler**: the session pooler's host on port `6543` | Many brief connections. No prepared statements and no session state |
| Migrations (`mariachi db migrate`, `MIGRATE_ON_START`) | Session pooler or direct, **never** transaction mode | `runMigrations` holds a session-level advisory lock |

([Connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres).)

`supabaseDatabaseConfig(url)` gives `createPostgresDatabase` the settings each one needs. It
requires TLS on Supabase's hosts. It turns prepared statements off (`prepare: false`) for the shared
pooler on port 6543, which doesn't keep them. The dedicated pooler on
`db.<project-ref>.supabase.co:6543` does keep them, so they stay on there.

In transaction mode, per-connection settings don't hold. That includes the statement timeout
Mariachi sets on each connection. Set the timeout on the role the app connects as instead:
`alter role postgres set statement_timeout = '30s'`
([timeouts](https://supabase.com/docs/guides/database/postgres/timeouts)).

## 4. Wire it in `src/app.ts`

```ts
import { readEnv } from '@mariachi/config';
import { settingsFromEnv } from '@mariachi/integrations';
import { createSupabase, settings as supabaseSettings, supabaseAuthConfig, supabaseDatabaseConfig, supabaseStorageConfig, type SupabaseConfig } from '@mariachi/integration-supabase';
import { createPostgresDatabase } from '@mariachi/database-postgres';
import { createGoTrueAuth, goTrueVerifiedEmail } from '@mariachi/auth-gotrue';
import { createStorage, DefaultStorage } from '@mariachi/storage';

const { config, logger, tracer, metrics, container, lifecycle } = bootstrap(options.bootstrap);
const instrumentation = { logger, tracer, metrics };
// SUPABASE_URL and SUPABASE_SECRET_KEY are required: a missing one stops the boot, naming it
const supabaseConfig = settingsFromEnv<SupabaseConfig>(supabaseSettings, readEnv);

// The database: one of the project's connection strings (section 3)
if (!config.database) throw new ConfigError('app/database-required', 'DATABASE_URL is required');
const database = lifecycle.manage(
  'database',
  createPostgresDatabase({ ...supabaseDatabaseConfig(config.database.url), poolMax: config.database.poolMax }),
  { priority: 10 },
);

// Sign-in: Supabase Auth's tokens, checked against the project's JWKS (ES256 or RS256), its issuer
// (<SUPABASE_URL>/auth/v1) and the audience `authenticated`
const provider = options.verifier ?? createGoTrueAuth({ ...supabaseAuthConfig(supabaseConfig), orgClaim: app.auth.orgClaim, orgRoleClaim: app.auth.orgRoleClaim });

// With organizations: whether an invitee's email is verified, read from Auth's admin API
const verifiedEmail = goTrueVerifiedEmail({ url: supabaseAuthConfig(supabaseConfig).url, serviceKey: supabaseConfig.secretKey });

// Files: one bucket, through Storage's S3 endpoint
const storage = new DefaultStorage(
  { client: createStorage(supabaseStorageConfig(supabaseConfig, { bucket: config.storage?.bucket ?? 'uploads' })), requireTenant: true },
  instrumentation,
);

// Edge Functions and Auth's admin API, for services
const supabase = createSupabase(supabaseConfig, instrumentation);
registerServices(communication, { db: database.db, jobs, storage, supabase });
```

A project made with `mariachi init --auth gotrue` reads `AUTH_URL` for the same thing as
`supabaseAuthConfig`. Its sign-in page reads `AUTH_URL` and `AUTH_ANON_KEY` too. Set them to
`<SUPABASE_URL>/auth/v1` and the publishable key, and `AUTH_SERVICE_KEY` to the secret key.

Services take `supabase` as a dependency, like the database. Controllers never see it:

```ts
// src/services/media.service.ts
async resize(ctx: Context, input: { key: string }) {
  return this.deps.supabase.functions.invoke(ctx, { name: 'resize-image', body: { key: input.key } }, ResizeResult);
}
```

## 5. Row Level Security

What Row Level Security applies to depends on who makes the call.

- **The app's own database connection** is the `postgres` role, which bypasses RLS. Tenants are
  kept apart by `DrizzleRepository` (`tenantId` on every query), as in any Mariachi app, not by
  policies.
- **The secret key** bypasses RLS on everything it calls: Auth's admin API, Edge Functions it
  invokes, and Storage through S3. So the procedure checks who may do what before it calls.
- **A call made for a user** carries their token, and RLS applies to them. For an Edge Function:
  `functions.invoke(ctx, { name, accessToken })`. The function sees the user's JWT, with the
  publishable key on `apikey`. A secret key with a user's token doesn't bypass RLS either.
- **Tables in `public`** are open through Supabase's Data API to anyone with the publishable key,
  unless RLS is on. Turn RLS on for every table Mariachi creates:
  `alter table public.<table> enable row level security`. With no policies the Data API sees
  nothing, and the app's own connection is unaffected. Supabase's event trigger can turn it on for
  each new table
  ([Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)).
  Write policies only for a table the browser reads directly (Realtime, below).

An Edge Function the app calls with the secret key must check that key itself. Set
`verify_jwt = false` for it and use `withSupabase({ auth: 'secret' })` in it: Supabase's own JWT
check doesn't understand the new keys
([securing functions](https://supabase.com/docs/guides/functions/auth)).

## 6. What stays in the browser

- **Sign-in.** The browser signs in with `@supabase/supabase-js` and the publishable key, or with
  the generated sign-in page. It sends the session's access token to the app's API as
  `Authorization: Bearer …`, which `auth-gotrue` checks.
- **Realtime** (Postgres Changes, Broadcast, Presence) stays on `supabase-js` in the browser, with
  the user's session. Its subscriptions follow RLS, so give the tables it watches a policy for
  `authenticated`. There is no Mariachi adapter for Supabase Realtime. The app's own realtime
  channels (`@mariachi/realtime`) are separate from it.
- **The secret key, the S3 key and the database URL never go to the browser.** Supabase refuses a
  secret key sent from a browser, but anything else holding it can still use it.

## 7. Auth Hooks and Database Webhooks

Supabase Auth's HTTP hooks are signed with Standard Webhooks. Give each hook its own route in
`src/webhooks/`:

```ts
import { type StandardWebhookAuth, WebhookController } from '@mariachi/webhooks';
import { SendEmailHookBody, supabaseAuthHookAuth, supabaseAuthHookType } from '@mariachi/integration-supabase';

export class SupabaseHooks extends WebhookController {
  readonly prefix = 'supabase';
  readonly auth: StandardWebhookAuth;

  constructor(secret: string) {
    super();
    this.auth = supabaseAuthHookAuth(secret);
  }

  init(): void {
    // The email holds a sign-in token: keep it out of the webhook log
    this.post('send-email', { mode: 'queue', jobName: 'auth-email', eventType: supabaseAuthHookType, logPayload: false },
      async (_ctx, body) => SendEmailHookBody.parse(body));
  }
}

// src/webhooks/index.ts
...(await signed('SUPABASE_AUTH_HOOK_SECRET', (secret) => new SupabaseHooks(secret))),
```

- **Send Email and Send SMS need no answer.** They are queued, and Supabase takes the `202` and
  goes on. The URL to give Supabase is `<webhook origin>/webhooks/supabase/send-email`.
- **Custom Access Token, Before User Created, and MFA and Password Verification Attempt** need an
  answer that Supabase reads, such as the token's claims or a decision. `WebhookServer` answers with
  its own acknowledgement, so write these hooks as Postgres functions in the project instead. The
  organization claim `auth-gotrue` reads (`org_id`) is added by a Custom Access Token hook.
- **Database Webhooks (`pg_net`) are not signed.** Anyone who learns the URL can post to it. Don't
  use one for anything that must be trusted. If you do receive one, take it only as a hint, and
  have the job read the row it names back from the database.

## 8. Test

The app's tests use the fakes. Nothing calls Supabase:

```ts
import { fakeSupabase, signedSupabaseAuthHook, supabaseUser } from '@mariachi/integration-supabase/testing';

const supabase = fakeSupabase({ functions: { 'resize-image': () => ({ width: 640 }) }, users: [supabaseUser({ email: 'ada@example.com' })] });
```

Use the local Postgres and GoTrue that `mariachi init --auth gotrue` sets up for development. Point
the settings at a test project, or a branch, only for a check by hand.
