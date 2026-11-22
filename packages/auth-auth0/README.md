# @mariachi/auth-auth0

Auth0 behind Mariachi's auth port: `Auth0AuthProvider` verifies the tokens the tenant issues,
`Auth0IdentityClient` is the port's `IdentityClient` (Universal Login, headless sign-in, users), and
`Auth0WebhookController` receives the tenant's event stream.

**Status: alpha.** Covered by unit tests against a scripted Auth0; no test calls a tenant. The
contract is in [contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `AUTH0_DOMAIN` | The tenant's domain, `acme.us.auth0.com`, or its custom domain | Applications › [app] › Settings › Domain |
| `AUTH0_CLIENT_ID` | The application users sign in to | Applications › [app] › Settings › Client ID |
| `AUTH0_CLIENT_SECRET` | Its secret, for sign-in from the backend (secret) | Applications › [app] › Settings › Client Secret |
| `AUTH0_AUDIENCE` | The app's API identifier (optional) | Applications › APIs › [API] › Settings › Identifier |
| `AUTH0_M2M_CLIENT_ID` | A Machine to Machine application for user management (optional) | Applications › [M2M app] › Settings, authorized for the Auth0 Management API with `read:users`, `create:users`, `update:users`, `delete:users` |
| `AUTH0_M2M_CLIENT_SECRET` | Its secret (secret, optional) | Applications › [M2M app] › Settings › Client Secret |
| `AUTH0_TENANT_DOMAIN` | Only with a custom domain: the tenant's own `*.auth0.com` domain | The domain before the custom one was added |
| `AUTH0_DATABASE_CONNECTION` | Where users are created and sign in with a password. Default `Username-Password-Authentication` | Authentication › Database |
| `AUTH0_EVENT_STREAM_TOKEN` | The event stream's bearer token (secret, optional) | A long random string of your own, entered when the stream is made |

Auth0 has no test keys: test is another tenant, with its own domain and applications.

`settings` (exported, generated from the contract) holds the same table as data.

## Verify tokens

```ts
import { createAuth0Auth, settings } from '@mariachi/auth-auth0';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts
const auth0Config = settingsFromEnv(settings, readEnv);
const auth0 = createAuth0Auth({ ...auth0Config, rolesClaim: 'https://app.example.com/roles' });
// pass `auth0` to bearerStrategy or createAuthMiddleware
```

- Issuer `https://<domain>/` (with the slash), keys from `https://<domain>/.well-known/jwks.json`,
  RS256 only, never HMAC.
- **Audience.** With `AUTH0_AUDIENCE`, only access tokens for that API pass; an ID token (whose
  `aud` is the client ID) doesn't. Without it, the app's ID tokens are what's accepted.
- `sub` → `userId`; `org_id` (Auth0 Organizations) → `tenantId`; `permissions` (the API's RBAC
  setting "Add Permissions in the Access Token") and `scope` → `scopes`; `sid` → `sessionId`.
- **Roles** aren't in Auth0's tokens until an Action adds them, as a namespaced claim. Name it in
  `rolesClaim`. `tenantClaim`, `scopesClaim`, `authorizedParty` and `validate` work as in
  `@mariachi/auth-oidc`, which does the verifying.

## Sign users in: `IdentityClient`

```ts
import { createAuth0IdentityClient, auth0LogoutUrl } from '@mariachi/auth-auth0';

const identity = createAuth0IdentityClient(auth0Config, { tracer, metrics });

// Universal Login, through a social connection, with PKCE
const url = identity.authorizationUrl({ provider: 'google', redirectUri, state, codeChallenge });
const result = await identity.exchangeCode({ code, codeVerifier, redirectUri });
const tokens = await identity.refresh(refreshToken);

// Sign out: revoke the refresh token, then end the browser's Auth0 session
await identity.signOut({ refreshToken });
redirect(auth0LogoutUrl(auth0Config, { returnTo: 'https://app.example.com/', idTokenHint }));
```

| Method | On Auth0 | Needs |
| --- | --- | --- |
| `authorizationUrl`, `exchangeCode` | `/authorize` with `connection` (`google-oauth2`, `github`; `connections` to rename), `/oauth/token` | The connection on the application; Allowed Callback URLs |
| `refresh`, `signOut` | `/oauth/token` (refresh grant), `/oauth/revoke` | `offline_access` (asked by default) and the API's "Allow Offline Access" |
| `signInWithPassword` | The password-realm grant on the database connection | The Password grant on the application; MFA answers `pending` with `reason: 'mfa'` and Auth0's `mfa_token` |
| `startEmailCode`, `signInWithEmailCode` | `/passwordless/start` (Auth0 emails a code), the passwordless OTP grant | The Email passwordless connection and the Passwordless OTP grant |
| `sendPasswordReset` | `/dbconnections/change_password`: Auth0 emails a link to its own reset page | |
| `getUser`, `findUserByEmail`, `createUser`, `deleteUser`, `setPassword` | The Management API, with a `client_credentials` token kept until shortly before it expires (about 24 hours) | `AUTH0_M2M_CLIENT_ID` / `_SECRET` |
| `resetPassword`, `pendingVerificationCode`, `verifyEmailAndSignIn` | Not offered: Auth0 resets passwords and verifies addresses on its own pages | Fail with `auth/not-supported` |

- **The user** of a sign-in is read from the ID token Auth0 returns to the backend. `emailVerified`
  is Auth0's `email_verified`.
- **Emails** are Auth0's own: `sendPasswordReset` and `startEmailCode` answer
  `{ deliveredBy: 'provider' }` whether or not the address has an account.
- **`createUser`** without a password gives the user a long random one, and keeps `externalId` in
  `app_metadata.external_id`. With `emailVerified: false`, Auth0 sends its verification email.
- **`findUserByEmail`**: Auth0 has one user per connection, so an address can belong to several; the
  database connection's is preferred.
- **The user's IP** (`ipAddress`) goes to Auth0 as `auth0-forwarded-for` on password and email-code
  sign-ins. Turn on "Trust Token Endpoint IP Header" (the application's Advanced Settings › OAuth),
  or Auth0's brute-force protection counts every user as the server.
- **Errors** are the port's `AuthError`s: `auth/invalid-credentials`, `auth/invalid-grant`,
  `auth/rate-limited` (after retries), `auth/not-supported`, `auth/identity-provider`, and
  `auth/invalid-config` for missing settings. Auth0's error code is in `metadata.providerCode`;
  its description never is.
- Every call makes one span (`auth0 tokens.exchangeCode`, `auth0 users.get`). The port's methods
  carry no context, so the spans have no tenant.

## Receive the event stream

Make a webhook event stream (Event Streams › Create Event Stream › Webhook) with Bearer Token
authentication and the token in `AUTH0_EVENT_STREAM_TOKEN`, subscribed to `user.created`,
`user.updated` and `user.deleted`, and point it at `/auth0/events`:

```ts
import { Auth0WebhookController } from '@mariachi/auth-auth0';

webhookServer.registerController(new Auth0WebhookController({ token: auth0Config.eventStreamToken! }));
// each event arrives at the `auth.auth0.webhook` procedure as an AuthWebhookEvent:
// { id: 'evt_…', type: 'user.created', provider: 'auth0', data: { user_id, email, … }, raw, timestamp }
```

Or route each type to its own procedure (`auth.user.created`, …) with `@mariachi/auth`'s
dispatcher: `createAuthWebhookDispatcher({ handler: auth0.createWebhookHandler({ secret: token }), … })`.

Auth0 signs nothing: the bearer token is the whole check, compared in constant time. Anyone who
has it can post any event, so keep it secret, and pass two tokens (`token: [next, current]`) while
changing it. Auth0 retries failed deliveries with the same event `id`, which is what deliveries are
deduplicated on. For your own controller: `auth0WebhookAuth(token)`, `Auth0WebhookBody` and
`auth0EventType`.

## Test

```ts
import { auth0Event, auth0User, auth0WebhookDelivery, fakeAuth0IdentityClient, testAuth0Auth } from '@mariachi/auth-auth0/testing';

const { provider, sign } = await testAuth0Auth({ audience: 'https://api.test' });
const token = await sign({ sub: 'auth0|u1', org_id: 'org_1', permissions: ['read:things'] });   // a bearer token `provider` accepts

const identity = fakeAuth0IdentityClient({ users: [{ id: 'auth0|u1', email: 'a@b.co', emailVerified: true, name: null, avatarUrl: null, externalId: null, password: 'pw' }] });
identity.codes_.set('code-1', 'auth0|u1');   // a finished Universal Login

const { rawBody, headers } = auth0WebhookDelivery(auth0Event('user.created', auth0User()), streamToken);   // post it to the controller
```
