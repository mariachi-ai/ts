---
"@mariachi/auth-auth0": minor
---

New: `@mariachi/auth-auth0`, Auth0 behind the auth port, built from its `contract.json`. `createAuth0Auth` verifies the tenant's tokens (issuer `https://<domain>/`, its JWKS, the API identifier or client ID as audience) through `@mariachi/auth-oidc`; `createAuth0IdentityClient` is the `IdentityClient` on Universal Login with PKCE, the password-realm and passwordless email-code grants, refresh-token revocation, Auth0's password-reset email and, with a Machine to Machine application, users on the Management API (its token cached until near expiry), every call through `providerRequest`; `auth0LogoutUrl` ends the browser's Auth0 session; `Auth0WebhookController` and `auth0WebhookAuth` receive event streams by their bearer token, normalized to `user.created`, `user.updated` and `user.deleted`; and `/testing` has an in-memory `IdentityClient`, a token signer and event stream deliveries.
