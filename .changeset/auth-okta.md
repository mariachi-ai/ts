---
"@mariachi/auth-okta": minor
---

New: `@mariachi/auth-okta`, Okta as the auth port's provider, built from its `contract.json`. `createOktaAuth` verifies access tokens from a custom authorization server (the user is the token's `uid`, its client must be the app's); `createOktaIdentityClient` signs users in through Okta's hosted page with PKCE, refreshes, revokes, gives the logout URL, and reads, finds, creates and deletes users through the Management API, as a private_key_jwt service app or with an API token; `oktaWebhookAuth` receives Event Hooks through `WebhookServer` and answers Okta's one-time verification in its `handshake`, and `oktaAuthEvents` turns deliveries into the port's events.
