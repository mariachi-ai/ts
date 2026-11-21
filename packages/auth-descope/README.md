# @mariachi/auth-descope

Descope as the identity provider: session JWTs verified against the project's keys, sign-in, sessions
and users through Descope's REST API, and its connectors' HMAC-signed webhooks.

**Status: alpha.** Covered by unit tests against a scripted Descope and locally signed tokens. The
contract is in [contract.json](./contract.json). Guide:
[auth-and-providers.md](../core/docs/auth-and-providers.md).

**Descope's main sign-in path is its Flows**, run in the browser by Descope's web SDK: the page
signs the user in (social, passkeys, SSO, MFA, whatever the flow holds) and the app's API receives
the session JWT. `DescopeAuthProvider` is all the backend needs for that. `DescopeIdentityClient` is
for an app whose own backend drives sign-in instead.

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `DESCOPE_PROJECT_ID` | The project (public) | Console › Project Settings: Project ID |
| `DESCOPE_MANAGEMENT_KEY` | Reads, creates and deletes users (secret, optional) | Console › Company settings › Management keys › Generate, with access to the project |
| `DESCOPE_WEBHOOK_SECRET` | Checks webhooks (secret, optional) | A long random string of your own, set as the connector's HMAC secret |

Test and live are separate Descope projects, each with its own project ID. Their values look alike,
so there is no check that tells them apart: set the test project's in test.

## Use

```ts
// src/app.ts
import { createDescopeAuth, createDescopeIdentityClient, settings, type DescopeConfig } from '@mariachi/auth-descope';
import { settingsFromEnv } from '@mariachi/integrations';
import { bearerStrategy } from '@mariachi/api-facade';
import { readEnv } from '@mariachi/config';

const descope = settingsFromEnv<DescopeConfig>(settings, readEnv);

// Every request: verify the session JWT
const auth = createDescopeAuth({ projectId: descope.projectId });
api.withAuthStrategy('session', bearerStrategy(auth));

// Only for sign-in driven by the backend, and for users: once, with the container's tracer and metrics
const identity = createDescopeIdentityClient({ ...descope, passwordResetUrl: 'https://app.example.com/reset' }, { tracer, metrics });
```

**Verifying.** `verify(token)` checks the signature against
`https://api.descope.com/<projectId>/.well-known/jwks.json` (RS256) and `exp`. Descope's docs give
three forms of `iss` for a project, and any of them is accepted: `<baseUrl>/v1/apps/<projectId>`
(the default JWT template), `<baseUrl>/<projectId>` (federated apps and older templates), and the
bare `<projectId>`. Pin one with `issuer` if you know which your template uses. A refresh token
(`drn: DSR`) is refused. `aud` is checked only when you set `audience` (a JWT template sets one).
For a regional host or a custom domain, set `baseUrl`.

| `ResolvedIdentity` | From |
| --- | --- |
| `userId` | `sub` |
| `tenantId` | `dct`, the user's current tenant; empty when there is none |
| `roles` | root `roles`, plus the current tenant's in `tenants` |
| `scopes` | root `permissions`, plus the current tenant's in `tenants` |
| `claims` | the whole payload (`amr`, `tenants`, custom claims, …) |

**Signing in from the backend.** What Descope's REST API documents:

```ts
const result = await identity.signInWithPassword({ email, password });
await identity.startEmailCode(email);                          // Descope emails the code; a new address is signed up
const signedIn = await identity.signInWithEmailCode({ email, code });
await identity.sendPasswordReset(email);                       // Descope emails a link to passwordResetUrl
await identity.resetPassword({ token, password });             // the token from that link
const tokens = await identity.refresh(refreshToken);
await identity.signOut({ refreshToken });
```

The project must return refresh tokens in the response body, not manage them in cookies (Project
Settings), or there is no refresh token to hand back and sign-in fails saying so. Sign-ins, codes
and creates are not retried: each spends or starts something a retry would repeat.

**Users** (`getUser`, `findUserByEmail`, `createUser`, `deleteUser`, `setPassword`) use the
management key: `Authorization: Bearer <projectId>:<managementKey>`. A user's login id is their
email. Descope keeps no external id of the app's, so `createUser` refuses one.

**Not supported** (`auth/not-supported`): `authorizationUrl` and `exchangeCode` (Descope's OAuth
starts with a call that returns the provider's URL; run social sign-in in a Flow), and the
email-verification hold (`pendingVerificationCode`, `verifyEmailAndSignIn`): sign in with an email
code instead.

Each call to Descope is one span (`descope password.signIn`, `descope users.load`). Failures are the
auth port's codes (`auth/invalid-credentials`, `auth/invalid-grant`, `auth/rate-limited`,
`auth/identity-provider`), with the `DescopeError` (`descope/<reason>`, a category, Descope's
`errorCode`) as `cause`.

## Webhooks

Descope's Audit Webhook connector (Console › Connectors) posts audit events, up to 100 in one JSON
array, and with an HMAC secret set it signs the body: `x-descope-webhook-s256` is the base64
HMAC-SHA256 of the raw body.

```ts
import { WebhookController } from '@mariachi/webhooks';
import { DescopeWebhookBody, descopeAuthEvents, descopeEventType, descopeWebhookAuth } from '@mariachi/auth-descope';

export class DescopeWebhooks extends WebhookController {
  readonly prefix = 'descope';
  readonly auth = descopeWebhookAuth(config.descope.webhookSecret);
  init() {
    this.post('audit', { mode: 'queue', jobName: 'descope-audit', eventType: descopeEventType },
      async (_ctx, body) => DescopeWebhookBody.parse(body));
  }
}

// The job: one delivery, several events
for (const event of descopeAuthEvents(payload)) {
  // 'user.created', 'user.updated', 'user.deleted', 'session.created' (LoginSucceed),
  // 'organization.created' / 'organization.deleted' (TenantCreated / TenantDeleted); other actions as they are
}
```

**Replays.** Nothing in this scheme signs a timestamp or a delivery id, so a captured delivery stays
valid for ever. Deduplication is the only protection: `WebhookServer` keys each delivery on a digest
of its signature, so give it an idempotency store. Audit events have no id; `descopeAuthEvents`
gives each one a digest of its action, user, actor and time, to dedupe on where they're stored.

`DescopeAuthProvider.createWebhookHandler` throws: one `AuthWebhookEvent` can't hold a batch.

## Test

```ts
import { descopeAuditEvent, descopeTestKeys, fakeDescopeIdentity, signedDescopeWebhook } from '@mariachi/auth-descope/testing';

const keys = await descopeTestKeys('P2Test');
const auth = new DescopeAuthProvider({ projectId: 'P2Test' }, keys.jwks);
const token = await keys.sessionToken({ sub: 'U2ada', dct: 'T2acme', roles: ['admin'] });

const { rawBody, headers } = signedDescopeWebhook([descopeAuditEvent({ action: 'UserCreated' })], secret);   // post it to the controller

const identity = fakeDescopeIdentity({ users: [{ ...user, password: 'pw' }] });
```
