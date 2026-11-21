# @mariachi/auth-kinde

Kinde as the identity provider: its tokens verified against the business's keys, sign-in through
Kinde's hosted pages (PKCE code exchange, refresh, revoke), users through the Management API, and
its JWT-signed webhooks.

**Status: alpha.** Covered by unit tests against a scripted Kinde and locally signed tokens. The
contract is in [contract.json](./contract.json). Guide:
[auth-and-providers.md](../core/docs/auth-and-providers.md).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `KINDE_ISSUER_URL` | The Kinde domain, `https://<subdomain>.kinde.com` or a custom domain (public) | Settings › Applications › your back-end app › View details: Domain |
| `KINDE_CLIENT_ID` | The back-end application's client id (public) | The same page: Client ID |
| `KINDE_CLIENT_SECRET` | Its secret (secret) | The same page: Client secret |
| `KINDE_M2M_CLIENT_ID` | A machine-to-machine app for the Management API (optional) | Settings › Applications › Add application › Machine to machine; authorize it for the Kinde Management API with `read:users`, `read:user_identities`, `create:users`, `delete:users` |
| `KINDE_M2M_CLIENT_SECRET` | Its secret (secret, optional) | That app's View details |

Test and live are separate Kinde environments, each with its own domain and its own applications'
keys. The keys look alike, so there is no check that tells them apart: set the test environment's
values in test.

## Use

```ts
// src/app.ts
import { createKindeAuth, createKindeIdentityClient, settings, type KindeConfig } from '@mariachi/auth-kinde';
import { settingsFromEnv } from '@mariachi/integrations';
import { bearerStrategy } from '@mariachi/api-facade';
import { readEnv } from '@mariachi/config';

const kinde = settingsFromEnv<KindeConfig>(settings, readEnv);

// Every request: verify the access token
const auth = createKindeAuth({ issuerUrl: kinde.issuerUrl, clientId: kinde.clientId, audience: 'https://api.example.com' });
api.withAuthStrategy('session', bearerStrategy(auth));

// Sign-in, refresh, sign-out and users: once, with the container's tracer and metrics
const identity = createKindeIdentityClient({ ...kinde, audience: 'https://api.example.com', connectionIds: { google: 'conn_…' } }, { tracer, metrics });
```

**Verifying.** `verify(token)` checks the signature against `<issuerUrl>/.well-known/jwks` (RS256),
`iss`, `exp`, and `azp` against `clientId`. Set `audience` to your API's audience (registered under
Settings › APIs, and asked for at sign-in): Kinde puts only the audiences a sign-in asked for in
`aud`, so without it a token for another API of the same business passes.

| `ResolvedIdentity` | From |
| --- | --- |
| `userId` | `sub` |
| `tenantId` | `org_code`, the organization the user signed in to; empty when there is none |
| `scopes` | `permissions` |
| `roles` | each role's `key` in `roles`, when the token includes roles |
| `claims` | the whole payload (`feature_flags`, `scp`, `azp`, …) |

Kinde's tokens carry no session id. `verifyIdToken(token)` checks an ID token and returns its claims.

**Signing in.** Kinde signs users in on its hosted pages, so the `IdentityClient` sign-in is the
redirect and the code exchange:

```ts
const url = identity.authorizationUrl({ provider: 'google', redirectUri, state, codeChallenge });
// … Kinde redirects back with ?code=
const result = await identity.exchangeCode({ code, codeVerifier, redirectUri });
const tokens = await identity.refresh(result.tokens.refreshToken);
await identity.signOut({ refreshToken: tokens.refreshToken });   // revokes it
reply.redirect(identity.logoutUrl('https://app.example.com/'));   // ends Kinde's own session in the browser
```

- `authorizationUrl` needs the social connection's id (`conn_…`) in `connectionIds` for the
  provider: Kinde picks a social sign-in by connection.
- The default scopes are `openid profile email offline`; `offline` is what gives a refresh token.
- `logoutUrl`'s redirect must be one of the application's allowed logout redirect URLs.
- Without the Management API settings, the signed-in user comes from the ID token, with
  `emailVerified: false` (Kinde's ID tokens don't say). With them, it's the user's record, verified
  when Kinde has confirmed the email identity.

**Users.** `getUser`, `findUserByEmail`, `createUser` and `deleteUser` use the Management API with a
machine-to-machine token, fetched once and kept until a minute before it expires. Its audience is
`<issuerUrl>/api`; with a custom domain, pass `managementAudience: 'https://<subdomain>.kinde.com/api'`.
`createUser` puts `name` in the given name, takes no password (Kinde sets only hashed ones), and is
not retried, since Kinde takes no idempotency key.

**Not supported** (`auth/not-supported`): password sign-in, email codes, resets and email
verification. They happen on Kinde's hosted pages.

Each call to Kinde is one span (`kinde oauth.exchangeCode`, `kinde users.get`). Failures are the auth
port's codes (`auth/invalid-grant`, `auth/rate-limited`, `auth/identity-provider`), with the
`KindeError` (`kinde/<reason>`, a category, Kinde's own code) as `cause`.

## Webhooks

Kinde posts each event as a JWT (`Content-Type: application/jwt`) signed with the business's keys:
no shared secret. `kindeWebhookAuth` verifies it against `<issuerUrl>/.well-known/jwks` and refuses a
delivery whose `timestamp` is more than five minutes from now (`toleranceSeconds`), so a captured
delivery can't be replayed later. Inside the window, `WebhookServer` deduplicates on the signed
`event_id`: give it an idempotency store.

```ts
import { WebhookController } from '@mariachi/webhooks';
import { KindeWebhookBody, kindeAuthEvent, kindeEventType, kindeWebhookAuth } from '@mariachi/auth-kinde';

export class KindeWebhooks extends WebhookController {
  readonly prefix = 'kinde';
  readonly auth = kindeWebhookAuth({ issuerUrl: config.kinde.issuerUrl });
  init() {
    this.post('events', { mode: 'queue', jobName: 'kinde-event', eventType: kindeEventType },
      async (_ctx, body) => KindeWebhookBody.parse(body));
  }
}

// The job: { type: 'user.created', event_id, timestamp, data: { user: { id, email, … } } }
const event = kindeAuthEvent(payload);   // type 'user.created', 'user.updated', 'user.deleted', 'organization.*'; 'user.authenticated' is 'session.created'
```

| `kindeWebhookAuth` option | Default | What it does |
| --- | --- | --- |
| `issuerUrl` | required | The Kinde domain whose keys must have signed the delivery |
| `toleranceSeconds` | `300` (`KINDE_WEBHOOK_TOLERANCE_SECONDS`) | How far the payload's `timestamp` may be from now, either way, before the delivery is refused as stale |
| `jwks` | the domain's JWKS | A key set in its place, for tests |

Kinde's docs don't say whether a retried delivery carries a new `timestamp` or the first attempt's.
If retries show up in your logs refused as stale, raise `toleranceSeconds` to cover Kinde's retry
schedule (up to 36 hours); deduplication on `event_id` still stops a replay from being processed twice.

`KindeWebhookBody` decodes the JWT the authenticator already verified, so use it only behind
`kindeWebhookAuth`. For `createAuthWebhookDispatcher`,
`createKindeAuth(…).createWebhookHandler()` makes the same checks and needs no secret.

## Test

```ts
import { fakeKindeIdentity, kindeTestKeys, signedKindeWebhook } from '@mariachi/auth-kinde/testing';

const keys = await kindeTestKeys('https://example.kinde.com');
const auth = new KindeAuthProvider({ issuerUrl: 'https://example.kinde.com' }, keys.jwks);
const token = await keys.accessToken({ sub: 'kp_1', org_code: 'org_1', permissions: ['invoices:read'] });

const webhooks = kindeWebhookAuth({ issuerUrl: 'https://example.kinde.com', jwks: keys.jwks });
const { rawBody, headers } = await signedKindeWebhook(keys, { type: 'user.created', data: { user } });   // post it to the controller

const identity = fakeKindeIdentity({ users: [user], codes: { c0de: user.id } });
```
