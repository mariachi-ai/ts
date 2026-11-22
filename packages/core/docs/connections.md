# Connections

How an end user connects their own account at a provider (their Google Drive, their CRM) and
how a client then calls the provider as them. `Connections`, in `@mariachi/integrations`, does
all of it:

- the OAuth 2.0 authorization-code flow, with PKCE and a signed, single-use, expiring `state`;
- the user's tokens, encrypted with `@mariachi/encryption` in the app's own database;
- a working access token for each call, refreshed before it expires, one refresh at a time per
  connection;
- disconnecting, which revokes the grant at the provider and deletes the tokens.

A credential that belongs to the app (an API key, the OAuth client id and secret) is a setting, as
always ([integration-contracts.md](./integration-contracts.md#settings-and-environments)). Only what
belongs to one end user is a connection.

## Wire it

```ts
import { createEncryption } from '@mariachi/encryption';
import { readEnv } from '@mariachi/config';
import { Connections, oauthProvider, registerConnectionProcedures, settingsFromEnv } from '@mariachi/integrations';
import { DrizzleConnectionStore } from '@mariachi/integrations/postgres';
import { ConnectionsController } from '@mariachi/integrations/http';
import { credentials, provider, settings } from '@mariachi/integration-google-drive';

const drive = settingsFromEnv(settings, readEnv);   // GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET

const connections = new Connections(
  {
    store: new DrizzleConnectionStore(database.db),
    encryption: createEncryption({ adapter: 'aws-kms', awsKmsKeyId: config.encryption.kmsKeyId }),
    stateSecret: readEnv('CONNECTIONS_STATE_SECRET')!,   // a secret setting, 32+ characters
    providers: [
      oauthProvider({ provider, credentials }, {
        clientId: drive.clientId,
        clientSecret: drive.clientSecret,
        redirectUri: `${config.appUrl}/connect/google-drive`,   // registered with the provider exactly so
        authorizeParams: { access_type: 'offline', prompt: 'consent' },   // Google gives refresh tokens only so
      }),
    ],
  },
  { tracer, metrics },
);

registerConnectionProcedures(communication, connections);
api.registerController(new ConnectionsController(communication));
```

Add `integrationConnectionsTable` and `integrationAuthorizationsTable` from
`@mariachi/integrations/schema` to your schema file, then `mariachi db generate` and
`mariachi db migrate`. `MemoryConnectionStore` is the same store in memory, for tests; both pass
one contract suite.

`oauthProvider({ provider, credentials }, settings)` reads the endpoints, scopes, PKCE, refresh and
revocation from the contract's `credentials.oauth` (a provider package's generated `provider` and
`credentials` exports), and fails with `integrations/not-oauth` for a provider whose
credentials are the app's alone. Options: `scopes` (fewer than the contract's), `clientAuth:
'basic'` (the secret in an `Authorization: Basic` header instead of the form body),
`authorizeParams` (extra query parameters on the authorize URL), and `accountId(tokens)`,
which reads the provider's id for the account from the token response so a user can connect two
accounts; without it a user has one connection per provider.

## The flow

| Step | Route | What happens |
| --- | --- | --- |
| 1 | `POST /connections/:provider/authorize` | Returns `{ url }`. The browser goes there |
| 2 | at the provider | The user approves; the provider sends the browser to `redirectUri` with `code` and `state` |
| 3 | `POST /connections/:provider/callback` | The app's page at `redirectUri` posts `{ code, state }`. Returns the connection |
| | `GET /connections` | The user's connections: `active` or `needs-reconnect` |
| | `DELETE /connections/:id` | Disconnects. Returns `{ revokedAtProvider }` |

Every route acts for the signed-in user. The redirect lands on the app's own page, not on the API,
because the callback has to run as the user who started it: a bearer token isn't sent on a
browser redirect, and a callback that trusted `state` alone would let someone link their account
to another user. The page posts what it was given, then drops it from the address bar (serve it
with `Referrer-Policy: no-referrer`, so the code never leaves in a `Referer`):

```ts
const q = new URLSearchParams(location.search);
history.replaceState(null, '', location.pathname);
if (q.get('error')) showDeclined();   // the user said no at the provider
else await api.post('/connections/google-drive/callback', { code: q.get('code'), state: q.get('state') });
```

The `state` is signed with `stateSecret` over the user, the tenant, the provider and its expiry
(ten minutes, `authorizationTtlMs`), and only a hash of its nonce is stored. It works once: the
callback deletes it before it calls the provider. A state that is forged, expired, used, or made for
another user or provider fails with `integrations/invalid-state` (400).

## Call a provider as the user

`Connections` is a `CredentialResolver`. A client that calls a provider as an end user takes one as
`deps.credentials` and asks it for each call:

```ts
const credential = await deps.credentials.resolve(ctx, { provider: provider.id });
return providerRequest(
  ctx,
  { integration: provider.id, operation, category: provider.category, server, connection: credential.connectionId },
  { ...request, headers: { authorization: `Bearer ${credential.accessToken}` } },
  { schema, error: AcmeError, failure, deps },
);
```

- **Which connection:** the signed-in user's (`ctx.userId`) to that provider, or
  `{ provider, connectionId }` for one by its id. A job that acts for a user carries their `ctx`,
  or the connection id it was given. A connection id is looked up in the caller's tenant only; never
  take one from a request without checking it is the caller's.
- **The span:** `connection` becomes `mariachi.integration.connection`, the opaque connection id.
  Never the provider's account id.
- **Refresh:** a token that expires within `refreshMarginMs` (five minutes) is refreshed first,
  once however many calls ask at the same moment, in this process (one shared promise) and across
  processes (a row lock in Postgres; the second finds the first's token). A provider that rotates
  refresh tokens hands out a new one each time, and it's stored before the lock is released, in a
  transaction of its own, so an app's rolled-back work can't lose it. The refresh is a call of its
  own: span `<provider> oauth.refresh`.
- **A refused token:** when the provider answers `unauthorized` to a token that hadn't expired, call
  `deps.credentials.invalidate?.(ctx, credential)`; the next `resolve` refreshes it.

An app that keeps end users' credentials somewhere else implements `CredentialResolver` itself:
`resolve(ctx, { provider, connectionId? })` returns `{ accessToken, connectionId? }`.

## When a connection stops working

| Code | Status | What the app does |
| --- | --- | --- |
| `integrations/connection-not-found` | 404 | The user hasn't connected the provider (or disconnected it): offer to connect |
| `integrations/reconnect-required` | 409 | The provider refused the refresh token (`invalid_grant`), or the token expired with none. The connection is `needs-reconnect` and its tokens are deleted: ask the user to connect again, which brings the same connection back |
| `integrations/invalid-state` | 400 | Start connecting again |
| `integrations/provider-not-found` | 404 | No provider with that id is configured |
| `integrations/user-required` | 401 | Connecting needs a signed-in user |

None is an `auth/*` code, so a dead connection never signs the user out of the app. A refresh that
fails for a reason that passes (`unavailable`, `rate-limited`) leaves the connection as it is and
fails the call with the provider's error. A token call is a POST that can't be repeated safely, so
it's retried only when the provider rate-limited it.

## Disconnect

`DELETE /connections/:id` (or `connections.revoke(ctx, id)`) sends the refresh token (else the
access token) to the contract's `revokeUrl` (RFC 7009), then deletes both tokens and marks the
connection `revoked`. The tokens are deleted even when the provider can't be reached;
`revokedAtProvider: false` says so, and the user can remove the app at the provider. A provider
without a `revokeUrl` only has its tokens deleted here.

## What is never recorded

Tokens, codes, PKCE verifiers, `state` values and the client secret never appear in a span, a log
line, an error message or an API response. At rest the tokens are `@mariachi/encryption`
ciphertext, each bound (associated data) to its tenant, user, provider, account and column, so a
ciphertext copied into another row doesn't decrypt. A provider's `error_description` is dropped:
only its error code (`invalid_grant`) is kept, as the span's `error.type`.

## Test

`MemoryConnectionStore` and a `fetch` that plays the provider (`scriptedFetch` from
`@mariachi/integrations/testing`). A client's own tests don't need connections at all: give it a
`CredentialResolver` that returns a fixed token, and check that `mariachi.integration.connection`
is on its spans with `assertProviderSpans`.
