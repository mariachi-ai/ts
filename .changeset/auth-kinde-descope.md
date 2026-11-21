---
'@mariachi/auth-kinde': minor
'@mariachi/auth-descope': minor
'@mariachi/webhooks': minor
---

Two new auth adapters. `@mariachi/auth-kinde` verifies Kinde tokens against the business's JWKS, signs users in through Kinde's hosted pages (PKCE authorization URL by connection id, code exchange, refresh, revoke, logout URL), reads, creates and deletes users through the Management API with a machine-to-machine token, and verifies Kinde's JWT-signed webhooks (refusing stale timestamps, deduplicating on `event_id`). `@mariachi/auth-descope` verifies Descope session JWTs against the project's JWKS (any of the three issuer forms Descope documents), implements `IdentityClient` on Descope's REST API (password, emailed code and reset-link sign-in, refresh, sign-out, and users with the management key; social sign-in stays in Descope Flows), and verifies its connectors' HMAC-signed webhooks, mapping Audit Webhook batches onto the auth port's events. Both are contracts first, every call one span through `providerRequest`, with fakes and signing helpers under `/testing`. `@mariachi/webhooks` now exports `VerifiedWebhookAuth`, whose `verify` may be async, so a provider package can write an authenticator for a scheme of its own, such as one checked against published keys.
