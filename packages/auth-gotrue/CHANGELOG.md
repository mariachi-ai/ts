# @mariachi/auth-gotrue

## 0.2.0

### Patch Changes

- Updated dependencies [fb0b344]
  - @mariachi/core@0.2.0
  - @mariachi/auth@0.2.0

## 0.1.1

### Patch Changes

- 0964659: Organizations, part three: invitation emails, and a project that starts with all of it.
  - **`invitationEmail({ email, acceptUrl, appName })`** in `@mariachi/organizations` sends each
    invitation to the address it is for. Give it to `registerOrganizationProcedures` as
    `deliverInvitation` with any email adapter from `@mariachi/notifications`. The token is added to
    your accept page's address as its fragment, `#token=`, which a browser sends to no server, so it
    is in no access log; `compose` writes your own message. It sends in the request that invites,
    never through a queue, so the token is stored nowhere.
  - **`goTrueVerifiedEmail({ url, serviceKey })`** in `@mariachi/auth-gotrue` says whether a GoTrue
    (Supabase Auth) user's email address is verified, for `verifiedEmail`: from a top-level
    `email_verified` claim when your token hook adds one, otherwise from the user's record, and never
    from `user_metadata`, which the user can rewrite. A GoTrue that confirms sign-ups without sending
    mail is answered unverified. `requireClaim` takes only the claim, so an app whose hook sets it
    holds no service key. With no way to know it says so (`auth/verified-email-unavailable`) instead
    of guessing.
  - **`mariachi init --orgs`** (`createProject({ organizations: true })`) generates a project with the
    tables, the wiring in `src/organizations.ts`, the `/api/organizations` routes, the membership check
    on every request, rate limits, and end-to-end tests. It works with `--auth jwt` and `--auth
gotrue`. Projects made without the flag are unchanged.

- Updated dependencies [df09ec1]
- Updated dependencies [f04e223]
- Updated dependencies [0964659]
- Updated dependencies [8486aa5]
- Updated dependencies [867c6ca]
  - @mariachi/auth@0.1.1
  - @mariachi/core@0.1.1

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
