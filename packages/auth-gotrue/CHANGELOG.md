# @mariachi/auth-gotrue

## 0.1.0

### Minor Changes

- eff53de: `discoverIssuer: true` reads the issuer from GoTrue's `/.well-known/openid-configuration` (re-read after
  `jwksCacheMaxAgeMs`, like the JWKS) instead of assuming `url`, for an app that reaches GoTrue on an
  internal address and doesn't know its public origin (a sidecar, say: `url: 'http://127.0.0.1:9999'`).
  It fails closed when the document can't be read or names no issuer, and can't be combined with `issuer`.
  Tests now pin the claims `verify` keeps for tenancy and roles: `org_id`, `org_role`, `app_metadata`, `act`.
- 00c7dab: New package `@mariachi/auth-gotrue`: an `AuthProvider` for GoTrue (Supabase Auth). `verify` checks access tokens
  against GoTrue's JWKS (ES256 by default, never HMAC) with issuer and audience, and maps `sub`, `session_id`, the
  org claim and `role`/`roles`/`org_role` onto `ResolvedIdentity`, keeping the whole payload in `claims`.
  `createWebhookHandler` verifies GoTrue's HTTP hooks (Standard Webhooks), fails closed, and normalizes them to
  `AUTH_EVENT_TYPES`.

### Patch Changes

- 27ab7f7: An audit of the four provider packages against two rules: webhook dedup uses only signed material,
  and a tenant is authenticated.

  `@mariachi/auth-clerk`:
  - `ClerkWebhookAuth` returns the Svix id as the event id, so `WebhookServer` deduplicates Clerk
    deliveries. It put the id in `metadata` only, and nothing was deduplicated.
  - `ClerkWebhookHandler` sets `tenantId` from the signed body for organization events.
  - `verify` returns `roles` (`org_role`), `org_permissions` among the scopes, and the verified
    payload in `claims`; `clerkIdentity` exports the mapping.
  - `createClerkMiddleware` is now the framework's `createAuthMiddleware`, so the claims reach
    `ctx.jwtClaims` and tenancy's `jwt-claim` strategy. Its own copy dropped them.

  `@mariachi/auth-workos`: the webhook handler accepts several secrets during a rotation
  (`secret: string | string[]`), and checks the signature over the timestamp exactly as sent.

  `@mariachi/auth-gotrue`: hooks are checked over the timestamp exactly as sent.

  `@mariachi/auth-fusionauth`: `verify` returns the verified payload in `claims`. The `issuer` option's
  comment said it defaulted to the server URL; it isn't checked unless set, and now says so, and the
  provider warns once when built without one (through `logger` if given).

  All four providers' `verify`, and `createAuthWebhookDispatcher`, refuse a tenant in the reserved
  personal-tenant namespace (`user.`).

- Updated dependencies [2fd4011]
- Updated dependencies [03f68ae]
- Updated dependencies [bb7f53a]
- Updated dependencies [b402753]
- Updated dependencies [27ab7f7]
- Updated dependencies [35dc946]
- Updated dependencies [6ad742b]
- Updated dependencies [92577a6]
- Updated dependencies [47f9687]
- Updated dependencies [da7d762]
- Updated dependencies [662ccc5]
- Updated dependencies [fcdeb4e]
- Updated dependencies [37e3d31]
- Updated dependencies [ea2f8fc]
- Updated dependencies [8a56f66]
- Updated dependencies [662ccc5]
- Updated dependencies [662ccc5]
- Updated dependencies [879b40f]
  - @mariachi/core@0.1.0
  - @mariachi/auth@0.1.0
