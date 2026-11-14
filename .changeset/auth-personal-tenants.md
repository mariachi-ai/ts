---
'@mariachi/auth': minor
'@mariachi/core': minor
'@mariachi/api-facade': minor
---

Personal tenants, for apps whose users don't all belong to an organization. Every provider returns
an empty tenant for such a user, and an identity with no tenant is refused, so these apps couldn't
serve them. `withPersonalTenants(verifier, { namespace })` (`@mariachi/auth`) wraps any token
verifier and gives a person with no tenant their own: `user:<namespace>:<userId>`. Tenant-scoped
tables, billing and roles then work as for any tenant. `@mariachi/core` exports
`personalTenantId`, `parsePersonalTenant` and `isPersonalTenant`. Off unless you wrap a verifier.

It applies only to a person (`identityType: 'session'`), only when the verified identity has no
tenant, and the namespace keeps the same user id from two issuers apart.

Ids starting with `user:` are now reserved, with or without personal tenants in use: a token that
names one as its tenant is refused by `JWTAdapter` (which also refuses to sign one), by the API
facade (`tenancy/reserved-tenant`, 403) and by `createAuthMiddleware`, since it would put the bearer
inside someone's personal tenant. `ResolvedIdentity` gains `personalTenant`, set only by
`withPersonalTenants`. Breaking only for an app whose own tenant ids start with `user:`.

`JWTAdapter` takes `requireTenant: false` to accept a token with no tenant (for use under
`withPersonalTenants`); `sign` leaves the tenant claim out when it's empty.
