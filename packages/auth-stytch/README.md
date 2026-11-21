# @mariachi/auth-stytch

Stytch as the identity provider, for a **Consumer** project: session JWTs checked locally against the
project's keys, sign-in from the app's own backend (passwords, emailed codes, Google and GitHub),
sign-out, password resets and users, and Stytch's webhooks normalized to the auth port's events.

**Status: alpha.** Covered by unit tests against a scripted Stytch. The contract is in
[contract.json](./contract.json). Stytch **B2B** projects (organizations, members) are not covered.

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `STYTCH_PROJECT_ID` | The environment's project id | Dashboard › Project ID & API keys |
| `STYTCH_SECRET` | The API secret (secret) | Dashboard › Project ID & API keys › Secrets |
| `STYTCH_PUBLIC_TOKEN` | For Stytch's frontend SDKs and the OAuth start URL (optional, public) | Dashboard › Project ID & API keys › Public tokens |
| `STYTCH_WEBHOOK_SECRET` | Checks the webhooks, `whsec_…` (secret, optional) | Dashboard › Webhooks › the endpoint › Signing Secret |

Each environment (Test, Live) has its own project id, secret and public token. A Live project id
starts with `project-live-` and calls `https://api.stytch.com`; any other calls
`https://test.stytch.com`, as Stytch's own SDKs decide. `checkSetting` refuses a Live project id in
the test environment, and anything else in production.

## Use

```ts
import { type StytchConfig, createStytchAuth, createStytchIdentityClient, settings } from '@mariachi/auth-stytch';
import { createAuthMiddleware } from '@mariachi/auth';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const stytchConfig = settingsFromEnv<StytchConfig>(settings, readEnv);
const stytch = createStytchAuth(stytchConfig, { tracer, metrics });              // AuthProvider: checks session JWTs
const identity = createStytchIdentityClient(stytchConfig, { tracer, metrics });  // IdentityClient: signs people in
```

**Checking requests.** Send the session JWT (`stytch_session_jwt`, or `tokens.accessToken` below) as
the bearer token. `stytch.verify(token)` checks its signature against the project's JWKS (fetched once
and cached, refetched when Stytch rotates keys), its audience (the project id), its issuer
(`stytch.com/<projectId>`) and expiry, and that it carries a session. The identity's `userId` is the
Stytch user id, `sessionId` the session's, `roles` its roles; `tenantId` is empty, since a Consumer
project has no organizations.

A session JWT lasts five minutes and is checked locally, so a session revoked at Stytch keeps
passing until its JWT expires. To catch that sooner, set `maxTokenAgeSeconds`: a JWT older than that
is also checked with Stytch (`sessions.authenticate`). `0` checks every request.

```ts
const stytch = createStytchAuth({ ...stytchConfig, maxTokenAgeSeconds: 60 }, { tracer, metrics });
```

**Signing in from the app's own pages.** Each sign-in starts a Stytch session
(`sessionDurationMinutes`, default 60) and returns `tokens`: `accessToken` is the session JWT,
`refreshToken` the session token. `identity.refresh(refreshToken)` gets a fresh JWT while the session
lasts; `identity.signOut({ sessionId })` ends it.

```ts
await identity.signInWithPassword({ email, password });

await identity.startEmailCode(email);                       // Stytch emails the code
await identity.signInWithEmailCode({ email, code });

await identity.sendPasswordReset(email);                    // Stytch emails a link to passwordResetRedirectUrl?token=…
await identity.resetPassword({ token, password });
```

Stytch sends the codes and reset links itself, with the Dashboard's email templates. A password
sign-in can fail with `auth/password-reset-required`: Stytch wants a reset first (the password was in
a breach, or the address was first used without a password). Send a reset.

**Google and GitHub.** Stytch's OAuth start has no `state` parameter, so `authorizationUrl` puts
`state` on the redirect URL. Register `https://app.example.com/auth/callback?state={}` as both a
Login and a Signup redirect URL in the Dashboard (Redirect URLs), and set `STYTCH_PUBLIC_TOKEN`.
Stytch comes back with `token` rather than `code`:

```ts
import { readStytchOAuthCallback } from '@mariachi/auth-stytch';

const url = identity.authorizationUrl({ provider: 'google', redirectUri, state, codeChallenge });
// the callback
const callback = readStytchOAuthCallback(request.query);   // { code, state } | null
if (!callback || callback.state !== savedState) throw new AuthError('auth/oauth-state-mismatch', 'Sign-in state mismatch');
const result = await identity.exchangeCode({ code: callback.code, codeVerifier, redirectUri });
```

**Not supported** (`auth/not-supported`): `setPassword` (Stytch sets no password by user id: send a
reset) and the `email-verification` hold, which Stytch never puts a sign-in in. `createUser` can't
mark an email verified: Stytch does that once the person signs in with it.

## Webhooks

Stytch sends its webhooks through Svix, signed with the endpoint's secret. Through `WebhookServer`:

```ts
import { WebhookController } from '@mariachi/webhooks';
import { StytchWebhookBody, stytchEventType, stytchWebhookAuth } from '@mariachi/auth-stytch';

export class StytchWebhooks extends WebhookController {
  readonly prefix = 'stytch';
  readonly auth = stytchWebhookAuth(config.stytch.webhookSecret);
  init() {
    this.post('events', { mode: 'queue', jobName: 'stytch-event', eventType: stytchEventType },
      async (_ctx, body) => StytchWebhookBody.parse(body));
  }
}
```

The event type is `source.object_type.action`: `direct.user.create`, `dashboard.user.delete`. To get
the auth port's events instead (`auth.user.created`, `auth.user.updated`, `auth.user.deleted`, from
the API, an SDK or the Dashboard alike), use the provider's handler with the dispatcher:

```ts
const dispatcher = createAuthWebhookDispatcher({
  handler: stytch.createWebhookHandler({ secret: config.stytch.webhookSecret }),
  communication, idempotency, logger,
});
await dispatcher.handle(rawBody, headers);
```

`data` is the user (Stytch's User object, read it with `stytchIdentityUser`) with `id` set to its
user id; a delete carries only `id`. Stytch doesn't promise order: treat an event as a signal and
read the user (`identity.getUser(id)`) before storing it.

## Test

```ts
import { fakeStytchAuth, fakeStytchIdentity, signedStytchWebhook, stytchUserEvent } from '@mariachi/auth-stytch/testing';

const identity = fakeStytchIdentity([{ email: 'ada@example.com', password: 'pw' }]);
const auth = fakeStytchAuth(identity);                 // accepts the access tokens `identity` issues
await identity.startEmailCode('grace@example.com');
const code = identity.sentCodes.get('grace@example.com');

const { rawBody, headers } = signedStytchWebhook(stytchUserEvent('CREATE', { user_id: 'user-test-1' }), secret);
```
