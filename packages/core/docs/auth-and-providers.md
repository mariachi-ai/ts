# Auth and Provider Packages

How `@mariachi/auth`, `@mariachi/auth-clerk`, `@mariachi/auth-fusionauth`, `@mariachi/auth-gotrue` and `@mariachi/auth-workos` work together for authentication and multi-tenant identity.

## Contract, not tight coupling

They are **loosely coupled** through a shared contract defined in `@mariachi/auth`:

- **`ResolvedIdentity`** — Every provider returns the same shape: `userId`, `tenantId`, `scopes`, `identityType`, and optional `sessionId` / `apiKeyId`.
- **`AuthProvider`** — Third-party providers (Clerk, FusionAuth, GoTrue, WorkOS) implement: `verify(token) → Promise<ResolvedIdentity>` and `createWebhookHandler(config) → AuthWebhookHandler`.
- **`IdentityClient`** (optional) — Providers whose sign-in your backend drives itself implement it too: password sign-in, the social sign-in redirect and code exchange, refresh, sign-out and user lookups. See [Headless sign-in](#headless-sign-in-identityclient).

The core auth package does **not** import or depend on auth-clerk, auth-fusionauth or auth-gotrue. The provider packages depend only on `@mariachi/auth` (and `@mariachi/core`) for types and interfaces. Your app wires the chosen provider into the same middleware and context flow.

## Multi-tenant identity

Multi-tenant auth is consistent because every provider maps its own concepts into the same `ResolvedIdentity`:

| Provider   | Tenant source in token        | Roles/scopes source   |
|-----------|--------------------------------|------------------------|
| **Clerk** | `org_id` → `tenantId`         | `org_role` → `roles`; that plus `org_permissions` → `scopes` |
| **FusionAuth** | `tid`, else `applicationId` → `tenantId` | `roles[]` → `roles` and `scopes` |
| **GoTrue** | `org_id` (configurable, added by a custom access-token hook) → `tenantId` | `role`, `roles[]`, `org_role` → `roles`; those plus `scope` → `scopes` |
| **WorkOS** | `org_id` → `tenantId` | `role`/`roles` → `roles`, `permissions` → `scopes` |
| **JWT** (core) | `tenantId` claim            | Custom claims / `scopes` |

After verification, the rest of the stack (controllers, services, RBAC, tenancy) only sees `ctx.userId`, `ctx.tenantId`, and `ctx.scopes`. Authorization (`AuthorizationAdapter`) is tenant-aware: `grant(userId, role, tenantId)` and `can(identity, action, resource)` use `identity.tenantId` so roles are per-tenant.

### Users with no organization: personal tenants

Every provider above gives a user who belongs to no organization an empty `tenantId`, and the
framework refuses an identity with no tenant (`tenancy/missing-tenant`), because tenant-scoped
tables, billing and roles all key on it. For an app where people sign up on their own (or before
they join a team), wrap the verifier:

```ts
import { withPersonalTenants } from '@mariachi/auth';
import { isPersonalTenant } from '@mariachi/core';

const auth = withPersonalTenants(provider, { namespace: 'main' });   // any provider, JWTAdapter or SessionManager
api.withAuthStrategy('session', bearerStrategy(auth));

// A user with no organization now arrives with ctx.tenantId = 'user.main.<userId>'.
if (isPersonalTenant(ctx.tenantId)) { /* a single person's workspace: hide team features */ }
```

Everything downstream is unchanged: a personal tenant is a tenant with one member, so repositories
scope to it, billing gives it its own customer and credits, and roles are granted in it. A user
who later joins an organization arrives with that organization's tenant; their personal one is
still theirs when the token names no organization.

When the provider has no organizations at all, [`@mariachi/organizations`](./organizations.md) keeps
them, with memberships and invitations, in your own database.

**Several identity providers in one app.** A user id is unique only within the provider that issued
it, and it is the key of everything kept about a user. `withUserNamespace(verifier, 'workos')`
prefixes the ids of the people a verifier verifies (`workos.<subject>`), so two providers can't
issue the same one. Wrap it inside `withPersonalTenants`. Choose a namespace once: changing it makes
every user of that provider a new user.

The rules, which are enforced and tested:

- **Namespaced by issuer.** The id is `user.<namespace>.<userId>`, the user id percent-encoded so
  the id holds no colon or slash. A user id is only unique within its issuer, so each verifier gets
  a `namespace` (two verifiers share one only if they share a user directory). Choose it once:
  changing it moves every user to a new, empty tenant.
- **Only for a person.** `identityType: 'session'` only; an API key or a service with no tenant
  keeps none.
- **Only when the tenant is absent.** An organization's tenant passes through untouched.
- **Never from a claim.** Every tenant id starting with `user.` is reserved (tenant ids only:
  channel names, labels and other strings are unaffected). A token that names one as its tenant is
  refused by the wrapper and by `JWTAdapter`, and the API facade (`tenancy/reserved-tenant`),
  `createAuthMiddleware` and realtime's `handleConnect` refuse any identity that carries one
  without the wrapper's mark, whether or not personal tenants are in use. The mark is a symbol on
  the identity object, which no token payload can contain. Don't use ids starting with `user.` for
  your own tenants.

With `JWTAdapter`, also pass `requireTenant: false` and sign such users' tokens with an empty
`tenantId`; with `SessionManager`, create their sessions with an empty `tenantId`. Neither a token
nor a session ever stores a personal tenant: the wrapper gives it on every verification. For
realtime, pass `handleConnect` the identity object the wrapped verifier returned (or a spread of
it), so the mark comes with it.

## Flow: request → identity → context

1. **HTTP request** — Bearer token (or API key) is sent (e.g. `Authorization: Bearer <token>`).

2. **Who verifies the token**
   - **Built-in adapters** (`@mariachi/auth`): Use `createAuth(config)` with `adapter: 'jwt'` or `adapter: 'api-key'`. You get an `AuthenticationAdapter` used by `createAuthMiddleware(adapter)`.
   - **Third-party providers** (Clerk, FusionAuth, GoTrue): Use the provider as the “verify” implementation. The provider’s `verify(token)` returns `ResolvedIdentity`. You can use:
     - **Provider-specific middleware** — e.g. `createClerkMiddleware(provider)` from `@mariachi/auth-clerk` — which calls `provider.verify(token)` and sets `ctx.userId`, `ctx.tenantId`, `ctx.scopes`, etc.
     - **Core middleware** — `createAuthMiddleware(adapter)` from `@mariachi/auth` expects an `AuthenticationAdapter` (verify + sign). Providers only implement verify; for sign you’d use a small wrapper or a separate JWT signer if you need to issue tokens yourself.

3. **Context** — Middleware (or the API facade’s auth step) sets `ctx.userId`, `ctx.tenantId`, `ctx.scopes`, `ctx.identityType`. Controllers and services use this context; they do not care which provider produced it. The verified token’s claims (`ResolvedIdentity.claims`, filled by `JWTAdapter` and `@mariachi/auth-gotrue`) travel too: `createAuthMiddleware` sets `ctx.jwtClaims`, and the API facade keeps the identity on `ctx.identity` (`ctx.identity.claims`). `@mariachi/tenancy`’s `jwt-claim` strategy reads either, so `createTenancy({ strategy: 'jwt-claim', claimName: 'org_id' })` resolves the tenant from GoTrue’s org claim and refuses a claim that disagrees with `ctx.tenantId` (`tenancy/mismatch`).

4. **Authorization** — `Auth.authorize(ctx, action, resource)` (and RBAC) uses `ctx.userId`, `ctx.tenantId`, and `ctx.scopes` from the same context.

## Package roles

| Package | Role |
|--------|------|
| **`@mariachi/auth`** | Defines `ResolvedIdentity`, `AuthenticationAdapter`, `AuthProvider`, `AuthWebhookHandler`; provides `createAuth` (JWT, API key), `createAuthMiddleware`, `createAuthWebhookDispatcher`, RBAC. No dependency on any specific IdP. |
| **`@mariachi/auth-clerk`** | Implements `AuthProvider`: verifies Clerk JWTs, maps `org_id` → `tenantId`, `org_role` → scopes; provides `createClerkAuth()`, `createClerkMiddleware(provider)`, Clerk webhook handler and controller. |
| **`@mariachi/auth-fusionauth`** | Implements `AuthProvider`: verifies FusionAuth JWTs via JWKS, maps `applicationId` → `tenantId`, `roles` → scopes; provides `createFusionAuthAuth()`, `FusionAuthWebhookHandler` (sync verify with HMAC or PEM). Implements `IdentityClient` (`createFusionAuthIdentityClient()`) on the Login, OAuth and User APIs, with `fusionAuthEmailVouched()` deciding `emailVerified`. |
| **`@mariachi/auth-gotrue`** | Implements `AuthProvider` for GoTrue (Supabase Auth, hosted or your own): verifies access tokens against GoTrue's JWKS (ES256 by default, never HMAC) with issuer and audience (`authenticated`), maps `sub` → `userId`, `session_id` → `sessionId`, the org claim → `tenantId`, `role`/`roles`/`org_role` → `roles` and `scopes`, and keeps the whole payload (`aal`, `amr`, `act`, `is_anonymous`, …) in `claims`; a short JWKS cache (60 s) so a rotated-out key stops verifying. Provides `createGoTrueAuth()` and `GoTrueWebhookHandler` for GoTrue's HTTP hooks (Standard Webhooks: `webhook-id`, `webhook-timestamp`, `webhook-signature`, secret `v1,whsec_…`), normalized to `AUTH_EVENT_TYPES`. Set `GOTRUE_JWT_ISSUER` on GoTrue: it omits `iss` otherwise. An app that reaches GoTrue on an internal address (a sidecar, say: `http://127.0.0.1:9999`) passes `discoverIssuer: true` to read the issuer from GoTrue's `/.well-known/openid-configuration`, re-read with the JWKS. `goTrueVerifiedEmail({ url, serviceKey })` says whether the signed-in user's email address is verified without taking the user's word for it: a top-level `email_verified` claim when a hook of yours adds one, otherwise the user's record (`email_confirmed_at`, read with a service-role key), and never `user_metadata`, which a user can rewrite. A GoTrue that confirms sign-ups without sending mail is answered unverified; `requireClaim` takes only the claim, and `issuer` keeps another provider's tokens out of it. |
| **`@mariachi/auth-workos`** | Implements `AuthProvider`: verifies WorkOS AuthKit JWTs via JWKS (issuer and `client_id` checked; `audience` for tokens AuthKit issues as an OAuth server, e.g. MCP), maps `org_id` → `tenantId`, `permissions` → scopes; `WorkOSWebhookHandler` verifies `WorkOS-Signature`. Implements `IdentityClient` (`createWorkOSIdentityClient()`) on `@workos-inc/node`, an optional peer loaded on first use. |
| **`@mariachi/auth-oidc`** | Implements `AuthProvider` for any standard OpenID Connect issuer (Auth0, Cognito, Keycloak, Entra ID, Okta, Firebase, your own): finds the keys through discovery, verifies signature, issuer and a required audience, never HMAC, over HTTPS only, and maps tenant, roles and scopes from configurable claims (`org_id`, `roles`, `scope`/`scp`/`permissions` by default; roles are not scopes unless `rolesAsScopes`); `validate` for provider-specific checks; provides `createOidcAuth()`. No webhooks and no `IdentityClient`: the provider's own page signs users in. See its [README](../../auth-oidc/README.md). |

## Headless sign-in: `IdentityClient`

`AuthProvider` checks the tokens a provider issues. `IdentityClient` asks the provider for them, for apps whose own pages and backend drive sign-in (no hosted login page):

```ts
import { createWorkOSIdentityClient } from '@mariachi/auth-workos';
// or: import { createFusionAuthIdentityClient } from '@mariachi/auth-fusionauth';

const identity = createWorkOSIdentityClient({ apiKey, clientId });

const result = await identity.signInWithPassword({ email, password, ipAddress, userAgent });
if (result.status === 'pending') {
  // e.g. 'email-verification': send the code yourself (WorkOS: providerData.emailVerificationId)
} else {
  // result.user.emailVerified decides account linking; result.tokens go into an HttpOnly cookie
}

const url = identity.authorizationUrl({ provider: 'google', redirectUri, state, codeChallenge });
const signedIn = await identity.exchangeCode({ code, codeVerifier, redirectUri });
const tokens = await identity.refresh(refreshToken);
await identity.signOut({ sessionId: tokens.sessionId, refreshToken });
```

- **Same shape for every provider**, so an app moves its handlers onto `IdentityClient` on one provider and then switches providers by configuration.
- **`emailVerified` is the provider's own answer** to "does this person control this inbox", never a flag that is true for everyone. Link accounts by email and accept invitations only when it's true.
- **Errors** are `AuthError`s: `auth/invalid-credentials`, `auth/invalid-grant` (a refused code, verifier or refresh token), `auth/rate-limited`, `auth/not-supported`, `auth/identity-provider` (unreachable or unexpected).
- **Server-side only**: the client holds the provider's API key or client secret.
- **Emails**: `startEmailCode`, `pendingVerificationCode` and `sendPasswordReset` return what to email when the app sends its own (`{ deliveredBy: 'app', code | token }`), `{ deliveredBy: 'provider' }` when the provider does, and `{ deliveredBy: 'nobody' }` for an address with no account (answer as if there were one). Verified-first sign-up: `startEmailCode` → `signInWithEmailCode` (the code proves the inbox) → `setPassword`.

## Webhooks

- **Auth webhook flow** — `createAuthWebhookDispatcher` (from `@mariachi/auth`) takes any `AuthWebhookHandler`. Clerk, FusionAuth, GoTrue and WorkOS each provide a handler via `provider.createWebhookHandler({ secret })`. The dispatcher verifies the webhook (using the handler), normalizes the event to `AuthWebhookEvent`, and calls communication procedures (e.g. `auth.user.created`). Same flow for every provider; only the verification and event parsing are provider-specific.

Every provider's handler follows two rules. The event id that dedup uses is one the signature
covers, never a header a replay could change. And the tenant an event runs in comes from the signed
body. An event whose tenant is in the reserved personal-tenant namespace is refused by the dispatcher.

| Provider | Signature | Event id | Tenant |
| --- | --- | --- | --- |
| Clerk | Svix: HMAC over id, timestamp and body | `svix-id` (signed) | The body's organization, for organization events |
| FusionAuth | A signed JWT holding the body's sha256 | The body's event id, else a digest of the body | The body's `tenantId` |
| GoTrue | Standard Webhooks: HMAC over id, timestamp and body | `webhook-id` (signed) | The org claim in the body's claims |
| WorkOS | HMAC over timestamp and body | The body's `id`, else a digest of the body | The body's `organization_id` |

## Authorization (RBAC)

Roles are per tenant. Assignments live in `user_roles`, and each role's permissions live on its
`roles.permissions` row as `{ action, resource }` pairs (`*` matches any action or resource).
`DrizzleRoleStore` provides both, so pass it as the role store and the permission source:

```ts
import { createAuthorization, CachedRoleStore } from '@mariachi/auth';
import { DrizzleRoleStore } from '@mariachi/auth/postgres';

const roles = new DrizzleRoleStore(db);
const rbac = createAuthorization({
  store: new CachedRoleStore(roles, cache, 30),        // assignments cached 30s, dropped on grant/revoke
  permissionSource: roles,                             // permissions loaded on first check, reloaded after permissionTtlMs
  permissionTtlMs: 30_000,
  permissions: [{ role: 'owner', action: '*', resource: '*' }],   // code-defined permissions merge in
  roles: [{ name: 'admin', inherits: ['member'] }],
  superuserScope: 'platform:admin',
});

await roles.defineRole('editor', [{ action: 'update', resource: 'posts' }, { action: 'read', resource: '*' }]);
await rbac.grant(userId, 'editor', tenantId);
await rbac.can(identity, 'update', 'posts');            // checks identity.tenantId's roles plus token roles
```

After `defineRole`, call `rbac.refreshPermissions()` to apply it in this process right away; other
processes reload after `permissionTtlMs`. Granting a role that doesn't exist throws
`auth/unknown-role`.

## Sessions

`SessionManager` issues opaque server-side sessions: a random 256-bit token the client holds, and a
row in `sessions` (via `DrizzleSessionStore`) that holds only the token's sha256. Unlike a JWT, a
session can be revoked at once, listed ("your devices") and signed out everywhere.

```ts
import { SessionManager } from '@mariachi/auth';
import { DrizzleSessionStore } from '@mariachi/auth/postgres';
import { bearerStrategy } from '@mariachi/api-facade';

const sessions = new SessionManager(new DrizzleSessionStore(database.db), {
  ttlSeconds: 30 * 24 * 3600,            // ends after 30 days without use
  maxLifetimeSeconds: 90 * 24 * 3600,    // and 90 days after sign-in, however often it's used
});

// After you've checked who the user is (an IdentityClient sign-in, an OAuth callback, ...):
const { token, session } = await sessions.create({ userId, tenantId, scopes, userAgent, ipAddress });

// Verify it on requests: `Authorization: Bearer <token>`, or the named cookie.
api.withAuthStrategy('session', bearerStrategy(sessions, { cookie: 'session' }));

await sessions.revoke(session.id);                              // sign out this session (the id from ctx.sessionId)
await sessions.revoke(idFromRequest, { userId: ctx.userId! });  // "sign out that device": not-found unless it's this user's
await sessions.revokeAllForUser(userId, tenantId);              // sign out everywhere in this tenant
const devices = await sessions.list(userId, tenantId);          // live sessions, newest activity first
```

`revokeAllForUser` and `list` without a `tenantId` cover the user's sessions in **every** tenant.
When a session id arrives in a request, always revoke with the owner, so one user can't end
another's session.

`verify` fails with `auth/invalid-session` (unknown or revoked) or `auth/session-expired`. Expiry
slides: each use at least `touchIntervalSeconds` (default 60) after the last pushes it `ttlSeconds`
ahead, but never past `maxLifetimeSeconds` from sign-in (default 90 days; `null` for no limit).
Pass `sliding: false` to make `ttlSeconds` the whole lifetime. Add `sessionsTable` from `@mariachi/auth/schema`
to your schema, and delete old rows on a schedule:

```ts
defineJob({ name: 'purge-sessions', schema: z.object({}), handler: async () => void (await sessions.purgeExpired()) });
jobs.schedule({ name: 'purge-sessions', cron: '0 4 * * *', jobName: 'purge-sessions', data: {} });
```

`InMemorySessionStore` is for tests and a single process. A cookie session in a browser also needs
CSRF protection for state-changing requests, which the framework doesn't provide yet: set the
cookie `HttpOnly`, `Secure` and `SameSite=Lax` or `Strict`, and don't change state on `GET`.

## API keys

`ApiKeyService` issues tenant API keys, stores only their hash (`api_keys` table via
`DrizzleApiKeyStore`), and checks scopes and expiry on `verify`.

```ts
const keys = new ApiKeyService(new DrizzleApiKeyStore(db));
const { key, id } = await keys.issue(ctx, { name: 'CI', scopes: ['reports:read'], expiresAt });   // show `key` once
const rotated = await keys.rotate(ctx, id);   // new secret, same scopes; the old key stops working
await keys.revoke(ctx, rotated.id);
```

Rotation writes the new key before revoking the old one, so a failure midway never leaves the
tenant without a working key. Keys belonging to another tenant are reported as not found.

## Webhook dedup

Auth providers retry webhooks. Give `createAuthWebhookDispatcher` an `idempotency` store shared by
every instance, either `RedisIdempotencyStore` from `@mariachi/cache` or `DrizzleWebhookDedup` from
`@mariachi/auth/postgres`. Without one it logs a warning and reprocesses duplicates.
`DrizzleWebhookDedup` claims an event with one conditional upsert, so concurrent deliveries of the
same event can't both process it; an expired claim (a crashed worker) can be taken over.

## Summary

- **Tight coupling is not required.** The coupling is the shared **contract**: `ResolvedIdentity` and `AuthProvider` (and optionally `AuthenticationAdapter` for middleware).
- **Multi-tenant auth** is unified: every provider fills `userId`, `tenantId`, and `scopes` the same way; RBAC and tenancy use that single shape.
- **Wiring:** Use one provider per app (or one “session” provider plus API key). Create the provider (e.g. `createFusionAuthAuth(config)` or `createClerkAuth(config)`), then use its middleware (or a thin adapter) so that after auth, `ctx` is populated with the same identity shape regardless of provider.
