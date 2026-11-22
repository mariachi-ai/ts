---
'@mariachi/auth-kinde': minor
'@mariachi/auth-descope': minor
---

Two new auth adapters. `@mariachi/auth-kinde` verifies Kinde tokens against the business's JWKS, signs users in through Kinde's hosted pages (PKCE authorization URL by connection id, code exchange, refresh, revoke, logout URL), reads, creates and deletes users through the Management API with a machine-to-machine token, and verifies Kinde's JWT-signed webhooks (refusing stale timestamps, deduplicating on `event_id`). `@mariachi/auth-descope` verifies Descope session JWTs against the project's JWKS (any of the three issuer forms Descope documents), implements `IdentityClient` on Descope's REST API (password, emailed code and reset-link sign-in, refresh, sign-out, and users with the management key; social sign-in stays in Descope Flows), and verifies its connectors' HMAC-signed webhooks, mapping Audit Webhook batches onto the auth port's events. Both are contracts first, every call one span through `providerRequest`, with fakes and signing helpers under `/testing`.

`@mariachi/auth-kinde` requires `audience` (`KINDE_AUDIENCE`, a new setting): without it, `verify` would accept any token Kinde signs for the business, an ID token or an access token for another API among them. Turning the check off takes `audience: null` with a `validate` function, as in `@mariachi/auth-oidc`.
