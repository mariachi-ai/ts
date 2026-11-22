---
'@mariachi/auth-clerk': minor
'@mariachi/auth-workos': minor
'@mariachi/auth-fusionauth': minor
'@mariachi/auth-gotrue': minor
'@mariachi/auth-oidc': minor
---

The five existing auth adapters call their providers through `callProvider`: one CLIENT span per call
(`workos authenticate.password`, `fusionauth users.get`, `clerk jwks.get`, `gotrue settings.get`,
`oidc discovery.get`), the calls and duration metrics, and retries of rate limits and outages (a
POST or PATCH only of a rate limit). Nothing an app calls changes.

- Each factory and constructor takes an optional last argument, the container's tracer and metrics
  (`createWorkOSIdentityClient(config, { tracer, metrics })`); without it, spans go through
  `@opentelemetry/api` when it's installed.
- Errors are still the port's `AuthError`s, now with the provider's `status` and `category` in their
  metadata.
- Key fetches done by `jose` go through it too (its `customFetch`); checking a token against keys in
  hand calls nothing. Clerk now fetches the instance's keys itself (`GET /v1/jwks`, cached five
  minutes, an unknown key refetched at most every five seconds) and checks tokens with Clerk's own
  `verifyJwt`; with `jwtKey` it is unchanged and calls nothing.
- The WorkOS SDK's own retries are off (`maxRetries: 0`), so retries are `callProvider`'s and show on
  the span.
- `@mariachi/auth-oidc` takes `{ integration }` in its deps, so an adapter built on it names its key
  fetches (`auth0 jwks.get`).
- Each package has a `contract.json` (also exported as `./contract.json`) and exports the generated
  `settings`, `operations` and `envNames`.
