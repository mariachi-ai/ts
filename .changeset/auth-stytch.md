---
"@mariachi/auth-stytch": minor
---

New: `@mariachi/auth-stytch`, Stytch (Consumer) as the identity provider. `StytchAuthProvider` checks session JWTs locally against the project's JWKS (audience, issuer, expiry and the session claim), with an optional check with Stytch for older tokens (`maxTokenAgeSeconds`); `StytchIdentityClient` implements the auth port's `IdentityClient` for passwords, emailed codes, Google and GitHub, refresh, sign-out, password resets and users, every call through `callProvider`; `stytchWebhookAuth` checks its Svix-signed webhooks for `WebhookServer`, and `StytchWebhookHandler` normalizes users created, updated and deleted to `user.created`, `user.updated` and `user.deleted`. Built from its `contract.json`, with fakes in `/testing`.
