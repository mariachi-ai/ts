---
'@mariachi/auth-oidc': minor
---

New package: `@mariachi/auth-oidc`, an `AuthProvider` for any identity provider that issues standard
OpenID Connect tokens (Auth0, Amazon Cognito, Keycloak, Microsoft Entra ID, Okta, Firebase Auth, or
your own). `createOidcAuth({ issuer, audience })` finds the signing keys through the issuer's
discovery document (which must name the same issuer), verifies the signature, `iss`, `aud`, `exp` and
`nbf` with asymmetric algorithms only, and maps `sub`, a tenant claim, role claims and scope claims
onto `ResolvedIdentity`. Claims are configurable by name or function; `audience` is required (`null`
only for tokens that carry none, and then `validate` is required too). Every URL involved must be
`https://` except on the local machine; `requireTokenType` can demand a `typ` such as `at+jwt`;
roles join the scopes only with `rolesAsScopes`.
