# @mariachi/auth-entra

Microsoft Entra ID (work and school accounts) and Microsoft Entra External ID (an app's customers)
as the auth port's provider: access tokens checked against the tenant's own keys, sign-in on
Entra's pages with PKCE, the directory's users through Microsoft Graph, and Graph's change
notifications when a user changes.

**Status: alpha.** Covered by unit tests against a scripted Entra and Graph; not yet run against a
live tenant. The contract is in [contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `ENTRA_TENANT_ID` | Directory (tenant) ID | Entra admin center › App registrations › your app › Overview |
| `ENTRA_CLIENT_ID` | Application (client) ID | The same page |
| `ENTRA_CLIENT_SECRET` | Client secret (secret) | App registrations › your app › Certificates & secrets › New client secret: copy the **Value** |
| `ENTRA_AUTHORITY` | External ID only: `https://<subdomain>.ciamlogin.com` | `<subdomain>` is the tenant's primary domain before `.onmicrosoft.com` |
| `ENTRA_WEBHOOK_CLIENT_STATE` | Change notification secret (secret, optional) | A random string of your own, at most 128 characters |

Entra has no test mode: use a separate tenant, with its own app registration, for test.

Set up the app registration ([register an app](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)):

- **Authentication:** add a Web platform with the app's callback as a redirect URI.
- **Expose an API:** set the Application ID URI to `api://<client id>` and add a scope. The client
  asks for `api://<client id>/.default` at sign-in, so the access token is for your API (a token
  for Microsoft Graph can't be verified by your app).
- **Manifest:** set `requestedAccessTokenVersion` to `2`. Only v2.0 access tokens are accepted.
- **API permissions:** for the user calls, the Microsoft Graph application permission
  `User.ReadWrite.All` (or `User.Read.All` for reads and change notifications), with admin
  consent.

## Use

```ts
import { type EntraConfig, createEntraAuth, createEntraIdentityClient, settings } from '@mariachi/auth-entra';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const entra = settingsFromEnv<EntraConfig>(settings, readEnv);
const auth = createEntraAuth(entra, { tracer, metrics });                      // an AuthProvider
const identity = createEntraIdentityClient({ ...entra, clientSecret: entra.clientSecret! }, { tracer, metrics });

// Sign-in: the browser goes to Entra, comes back with a code
const url = identity.authorizationUrl({ provider: 'google', redirectUri, state, codeChallenge });
const { user, tokens } = await identity.exchangeCode({ code, codeVerifier, redirectUri });
// Sign-out: drop the tokens, then send the browser to Entra too
const bye = identity.signOutUrl({ postLogoutRedirectUri: 'https://app.example.com/' });
```

- **Identity:** `verify` gives `oid` as `userId` (the id Microsoft Graph uses; `sub` differs per
  app), `scp` as `scopes`, `roles` as `roles`, `sid` as `sessionId`. A token with no `scp` is an
  application's own (client credentials) and its identity type is `service`.
- **Tenants:** with one tenant, `tid` must be it and `tenantId` is left empty, for the app to
  assign (every user shares the Entra tenant). With `ENTRA_TENANT_ID=organizations` (any work or
  school tenant) each token's issuer is checked against its own `tid`, which becomes `tenantId`;
  pass `allowedTenants` to let only some in. Graph user calls need the app's own tenant id.
- **External ID:** set `ENTRA_AUTHORITY`. Sign-in, keys and tokens use the `ciamlogin.com` host;
  new users get an email sign-in identity.
- **Sign-in methods:** Entra's page shows the methods the tenant has set up, so `provider` in
  `authorizationUrl` doesn't pick one. The headless calls (password, email codes, password
  reset) fail with `auth/not-supported`: Entra does them on its own pages.
- **Users:** `emailVerified` is always false, since Graph has no such flag: prove an address
  yourself before linking accounts by it. `createUser` needs a password; in a workforce tenant
  the email becomes the userPrincipalName, so its domain must be verified in the tenant.
- **Errors:** the port's codes, `auth/invalid-grant`, `auth/rate-limited` and
  `auth/identity-provider`, with Entra's code in `metadata.providerCode`, never its message.
  Each call is one span (`entra users.get`), retried only on rate limits and outages.

## Hear when a user changes

Microsoft Graph posts change notifications to a URL of the app. Graph signs nothing: each
notification carries the `clientState` the app gave when it subscribed. `entraWebhookAuth` checks
it, and answers Graph's validation handshake (`?validationToken=`, echoed as plain text) itself.

```ts
import { WebhookController } from '@mariachi/webhooks';
import { EntraNotificationBody, entraAuthEvents, entraEventType, entraWebhookAuth } from '@mariachi/auth-entra';

export class EntraWebhooks extends WebhookController {
  readonly prefix = 'entra';
  readonly auth = entraWebhookAuth(config.entra.webhookClientState);
  init() {
    // queue: Graph wants an answer within 3 seconds
    this.post('users', { mode: 'queue', jobName: 'entra-users', eventType: entraEventType },
      async (_ctx, body) => EntraNotificationBody.parse(body));
  }
}

// The job: notifications carry ids, never the user
for (const event of entraAuthEvents(payload)) {
  const user = await identity.getUser(event.data.id as string);   // null once deleted
}
```

Graph sends a user's creation, change and soft delete all as `updated` (`user.updated`), and a
permanent delete as `deleted` (`user.deleted`); there is no separate `user.created`.

A subscription lasts at most 41,760 minutes (under 29 days) and then stops. Create it, or renew
the one there, from a scheduled job; Graph checks the URL while creating it, so the route must be
live:

```ts
import { createEntraSubscriptions } from '@mariachi/auth-entra';

const subscriptions = createEntraSubscriptions(
  { ...entra, clientSecret: entra.clientSecret!, webhookClientState: entra.webhookClientState! },
  { tracer, metrics },
);
await subscriptions.ensureUsers(ctx, { notificationUrl: 'https://app.example.com/webhooks/entra/users' });
```

## Test

```ts
import { entraTestTenant, entraUserNotification, fakeEntraIdentity } from '@mariachi/auth-entra/testing';

const tenant = await entraTestTenant();                 // its own signing key; no network
const auth = tenant.provider();
const token = await tenant.token({ oid: 'user-1', roles: ['Admin'] });   // call the app's routes with it

const identity = fakeEntraIdentity();                    // an in-memory IdentityClient
const { rawBody, headers } = entraUserNotification([{ userId: 'user-1', changeType: 'updated' }], clientState);
```
