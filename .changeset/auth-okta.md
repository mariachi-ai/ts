---
"@mariachi/auth-okta": minor
"@mariachi/webhooks": minor
---

New: `@mariachi/auth-okta`, Okta as the auth port's provider, built from its `contract.json`. `createOktaAuth` verifies access tokens from a custom authorization server (the user is the token's `uid`, its client must be the app's); `createOktaIdentityClient` signs users in through Okta's hosted page with PKCE, refreshes, revokes, gives the logout URL, and reads, finds, creates and deletes users through the Management API, as a private_key_jwt service app or with an API token; `oktaWebhookAuth`, `oktaVerification` and `oktaAuthEvents` receive Event Hooks through `WebhookServer`, answer Okta's one-time verification and turn deliveries into the port's events. `@mariachi/webhooks`: a `VerifiedWebhookAuth` subclass can accept a request with no body (`acceptsEmptyBody`) and is told the request's method, and a new `reply` route mode answers with the handler's result and dispatches nothing, for a sender's endpoint check.
