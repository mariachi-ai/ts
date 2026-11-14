---
'@mariachi/auth': patch
'@mariachi/auth-clerk': minor
'@mariachi/auth-fusionauth': patch
'@mariachi/auth-gotrue': patch
'@mariachi/auth-workos': minor
---

An audit of the four provider packages against two rules: webhook dedup uses only signed material,
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
comment said it defaulted to the server URL; it isn't checked unless set, and now says so.

All four providers' `verify`, and `createAuthWebhookDispatcher`, refuse a tenant in the reserved
personal-tenant namespace (`user.`).
