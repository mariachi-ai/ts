# @mariachi/auth-okta

Okta as the auth port's provider, for Workforce Identity and Customer Identity alike (one platform, one API):

- `createOktaAuth`: an `AuthProvider` that verifies access tokens from a **custom authorization server**;
- `createOktaIdentityClient`: an `IdentityClient` for Okta's hosted sign-in (PKCE), refresh, sign-out,
  and users through the Management API;
- `oktaWebhookAuth`: Okta Event Hooks through `WebhookServer`, including the one-time verification
  request (answered in its `handshake`), and `oktaAuthEvents` to read them as the auth port's events.

`@mariachi/auth-oidc` verifies any OIDC issuer, Okta's included. Use this package when the app also
signs users in through Okta, manages its users, or receives its events.

**Status: alpha.** Covered by unit tests against a scripted Okta. The contract is in
[contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `OKTA_ISSUER` | The custom authorization server (public) | Security › API › Authorization Servers: `https://{yourOktaDomain}/oauth2/default`, or `/oauth2/{authorizationServerId}` |
| `OKTA_AUDIENCE` | Its audience (public, optional) | The server's Settings. Unset means `api://default`, the default server's |
| `OKTA_CLIENT_ID` | The OIDC app users sign in through (public) | Applications › your OIDC web app |
| `OKTA_CLIENT_SECRET` | That app's secret (secret, optional) | The same app. Needed to exchange, refresh and revoke tokens, not to verify them |
| `OKTA_SERVICE_CLIENT_ID` | A service app for the Management API (public, optional) | An API service app with public key / private key authentication, `okta.users.read` and `okta.users.manage` granted, an admin role, and DPoP turned off |
| `OKTA_SERVICE_PRIVATE_KEY` | Its private key (secret, optional) | A private JWK as JSON (with its `kid`), or a PKCS#8 PEM |
| `OKTA_API_TOKEN` | An API token, instead of a service app (secret, optional) | Security › API › Tokens |
| `OKTA_EVENT_HOOK_SECRET` | Checks Event Hook requests (secret, optional) | A long random string of your own, given to Okta as the hook's `Authorization` value |

Okta has no test mode: test against a separate org. New ones are Integrator Free Plan orgs, from
[developer.okta.com](https://developer.okta.com/signup/); they replaced Developer Edition orgs in 2025
and come with the `default` authorization server.

**Only custom authorization servers.** `OKTA_ISSUER` must be `https://{yourOktaDomain}/oauth2/{id}`.
The org authorization server (`https://{yourOktaDomain}` alone) issues access tokens for Okta's own
APIs, and Okta says they [aren't meant for your API to validate](https://developer.okta.com/docs/concepts/auth-servers/).
Custom authorization servers are part of API Access Management, which Integrator Free Plan orgs have.

**The Management API.** Okta recommends an OAuth service app over an API token: its access tokens are
scoped and last an hour. The client signs a `private_key_jwt` assertion with
`OKTA_SERVICE_PRIVATE_KEY`, gets a token from the org authorization server and keeps it until a minute
before it expires. New service apps require DPoP, which this package doesn't support yet: turn off
*Require Demonstrating Proof of Possession (DPoP) header in token requests* in the app's General
Settings, or Okta's refusal fails with `auth/invalid-config` saying so. An API token
(`Authorization: SSWS <token>`) takes the privileges of the admin who made it and expires after 30
days unused; make it as a service account with only the privileges the app needs.

## Use

```ts
import { createOktaAuth, createOktaIdentityClient, settings } from '@mariachi/auth-okta';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once
const oktaConfig = settingsFromEnv(settings, readEnv);
const okta = createOktaAuth(oktaConfig);                                       // bearerStrategy(okta), createAuthMiddleware
const identity = createOktaIdentityClient(oktaConfig, { tracer, metrics });    // each call has its span
```

**Verifying tokens.** `okta.verify(token)` checks the signature, issuer, audience, expiry, and that the
token's `cid` is `OKTA_CLIENT_ID` (pass `clientIds` to accept other apps' tokens). The user is the
token's `uid`, Okta's id for them (`00u…`): an access token's `sub` is usually their login, which can
change. A token with no `uid` (a service app's) is refused. `scp` gives the scopes, and the `groups`
claim, when the authorization server adds one, gives the roles. Okta has no tenant claim of its own;
pass `tenantClaim` for a custom one only an admin can set.

**Signing in.** Okta's hosted page does the sign-in, with PKCE:

```ts
// Okta's own page; or authorizationUrl({ provider: 'google', … }) with identityProviderIds: { google: '0oa…' }
const url = identity.signInUrl({ redirectUri, state, codeChallenge });
// The callback
const { user, tokens } = await identity.exchangeCode({ code, codeVerifier, redirectUri });
// user.id is Okta's id (the ID token's sub, the access token's uid); user.emailVerified is Okta's email_verified
const fresh = await identity.refresh(tokens.refreshToken);
```

Sign-in asks for `openid email profile offline_access`; `offline_access` is what gives a refresh token.

**Signing out.** `identity.signOut({ refreshToken })` revokes the refresh token. The browser's Okta
session (single sign-on) ends when it visits `identity.logoutUrl({ idToken: tokens.idToken, postLogoutRedirectUri })`.

**Users.** `getUser`, `findUserByEmail`, `findUserByLogin`, `createUser` and `deleteUser` go through
the Management API. `createUser` makes the email the login, activates the user when it's given a
password and leaves them staged otherwise. `deleteUser` deactivates and then deletes. The Users API
says nothing about whether an email was verified, so users read from it have `emailVerified: false`;
the ID token at sign-in is where Okta says so. To keep the app's own id on the user, add a custom
profile attribute and pass its name as `externalIdProperty`.

**What's not supported.** Password, email-code and password-reset sign-ins are Okta's hosted page's:
`signInWithPassword`, `startEmailCode`, `signInWithEmailCode`, `sendPasswordReset`, `resetPassword`,
`setPassword`, `pendingVerificationCode` and `verifyEmailAndSignIn` fail with `auth/not-supported`.
So does DPoP.

Failures are the auth port's `AuthError`s: `auth/invalid-grant` for a code or refresh token Okta
refused, `auth/rate-limited`, `auth/identity-provider` for anything else, each with the `OktaError`
(`okta/<reason>`, its category and Okta's code) as its `cause`. Rate limits and outages are retried;
code exchanges, refreshes and creates aren't, so nothing is done twice.

## Receive Event Hooks

Okta signs nothing: every request carries the secret you gave the hook as its `Authorization`
header. Before the first delivery, Okta sends one `GET` with `x-okta-verification-challenge`, which
must be echoed back. The authenticator does that in its `handshake`, before any route, and only when
the request carries the secret. Register the path for `GET` as well as `POST`, so the check arrives:

```ts
import { WebhookController } from '@mariachi/webhooks';
import { OktaEventHookBody, oktaAuthEvents, oktaEventType, oktaWebhookAuth } from '@mariachi/auth-okta';

export class OktaWebhooks extends WebhookController {
  readonly prefix = 'okta';
  readonly auth = oktaWebhookAuth(config.okta.eventHookSecret);
  init() {
    const route = { mode: 'queue', jobName: 'okta-events', eventType: oktaEventType } as const;
    const handler = async (_ctx: unknown, body: unknown) => OktaEventHookBody.parse(body);
    this.get('events', route, handler);     // Okta's verification: answered { verification: '…' } by the authenticator
    this.post('events', route, handler);
  }
}

// The job
for (const event of oktaAuthEvents(payload)) {
  // event.type: 'user.created', 'user.updated', 'user.deleted', 'session.ended', 'session.revoked',
  // or Okta's own name for the rest ('user.lifecycle.suspend'); event.data.userId is Okta's id
  await communication.call(ctx, `auth.${event.type}`, event.data);
}
```

A delivery holds one or more events, so `createOktaAuth(...).createWebhookHandler()` (the port's
one-event handler) fails with `auth/not-supported`; use the controller above. Okta waits three
seconds for an answer and retries once, so queue the work. It delivers at least once: the delivery's
`eventId` dedupes it in `WebhookServer` (with an idempotency store), and each event's `uuid` is the
`id` of its `AuthWebhookEvent`. Choose the events in Okta when creating the hook:
`user.lifecycle.create`, `user.account.update_profile` and `user.lifecycle.delete.initiated` are the
ones that become `user.*` (Okta doesn't send `user.lifecycle.delete.completed` to hooks).

## Test

```ts
import { fakeOktaIdentity, oktaEventHookRequest, oktaLogEvent, oktaVerificationRequest } from '@mariachi/auth-okta/testing';

const identity = fakeOktaIdentity({ users: [user] });
identity.codes_.set('code-1', user.id);                     // what Okta's redirect would bring back
const { rawBody, headers } = oktaEventHookRequest([oktaLogEvent('user.lifecycle.create', { id: user.id })], secret);
```
