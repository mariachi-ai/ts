---
'@mariachi/organizations': minor
'@mariachi/api-facade': minor
'@mariachi/auth': minor
---

Organizations over HTTP: a request's named organization becomes its tenant once the membership is
confirmed.

- `createOrganizationAccess({ organizations })` and `organizationStrategy(strategy, access)`
  (`@mariachi/organizations/http`): the organization a client names in `x-organization-id` becomes
  `ctx.tenantId` only after the signed-in user's membership is found, and the member's role joins
  the identity's roles. A non-member and an unknown organization get the same 404; a suspended
  organization is 403; a request and a token that name different organizations are refused. A
  request that names none keeps the identity's own tenant: nothing is chosen for the user.
  `source: 'token'` is for providers that keep memberships themselves.
- `registerOrganizationProcedures(communication, organizations)` registers the `organizations.*`
  procedures, with rate limits on creating, inviting and accepting when given a limiter, and
  `deliverInvitation` to send the link so the token reaches only the invited address.
- `OrganizationsController`: endpoints under `/organizations` for all of it.
- `@mariachi/api-facade`: a route option `tenant: 'optional'` lets a signed-in user with no tenant
  onto a route, with `ctx.tenantId` null. The default still refuses them.
- `@mariachi/auth`: `withUserNamespace(verifier, namespace)` prefixes the user ids a verifier
  returns, for apps that accept sign-ins from more than one identity provider.
