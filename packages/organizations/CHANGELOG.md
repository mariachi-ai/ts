# @mariachi/organizations

## 0.1.1

### Patch Changes

- 0964659: Organizations, part three: invitation emails, and a project that starts with all of it.
  - **`invitationEmail({ email, acceptUrl, appName })`** in `@mariachi/organizations` sends each
    invitation to the address it is for. Give it to `registerOrganizationProcedures` as
    `deliverInvitation` with any email adapter from `@mariachi/notifications`. The token is added to
    your accept page's address as its fragment, `#token=`, which a browser sends to no server, so it
    is in no access log; `compose` writes your own message. It sends in the request that invites,
    never through a queue, so the token is stored nowhere.
  - **`goTrueVerifiedEmail({ url, serviceKey })`** in `@mariachi/auth-gotrue` says whether a GoTrue
    (Supabase Auth) user's email address is verified, for `verifiedEmail`: from a top-level
    `email_verified` claim when your token hook adds one, otherwise from the user's record, and never
    from `user_metadata`, which the user can rewrite. A GoTrue that confirms sign-ups without sending
    mail is answered unverified. `requireClaim` takes only the claim, so an app whose hook sets it
    holds no service key. With no way to know it says so (`auth/verified-email-unavailable`) instead
    of guessing.
  - **`mariachi init --orgs`** (`createProject({ organizations: true })`) generates a project with the
    tables, the wiring in `src/organizations.ts`, the `/api/organizations` routes, the membership check
    on every request, rate limits, and end-to-end tests. It works with `--auth jwt` and `--auth
gotrue`. Projects made without the flag are unchanged.

- 8486aa5: Organizations over HTTP: a request's named organization becomes its tenant once the membership is
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
  - **No tenant is not every tenant.** `isTenantlessCaller(ctx)` in `@mariachi/core` says whether a
    context is someone signed in who is in no tenant. Audit reads, exports, retention and chain checks
    refuse such a caller (`audit/tenant-required`), and API keys can't be rotated or revoked by one.
    Before, those paths read a missing tenant as "all tenants", which only the system ever reached.
  - `rateLimiting.checkTier` counts a signed-in caller who is in no tenant on their own (`user:<id>`
    or `key:<id>`), not in the one counter all anonymous callers share.

  **Changed:**
  - `audit.verifyChain(ctx, tenantId)` and `audit.retain(ctx, …)` cover only the context's own tenant
    when it has one. Before, a tenant's context could name another tenant's chain, and the in-memory
    audit log's `retain` deleted every tenant's entries whatever the context.

- Updated dependencies [f04e223]
- Updated dependencies [0964659]
- Updated dependencies [8486aa5]
- Updated dependencies [867c6ca]
  - @mariachi/core@0.1.1
  - @mariachi/communication@0.1.1
  - @mariachi/database@0.1.1

## 0.1.0

### Minor Changes

- ea2f8fc: New package `@mariachi/organizations`: organizations, memberships and invitations in the app's own
  database, for apps whose identity provider supplies none (plain Supabase Auth, generic OIDC, the
  built-in JWT adapter).
  - An organization is a row of the existing `tenants` table, so its id is the tenant id that
    repositories, billing and RBAC already use. Two new tables, `organization_memberships` and
    `organization_invitations`, in `@mariachi/organizations/schema`.
  - `DefaultOrganizations`: create (the creator becomes owner), rename, suspend, delete; list, change
    role, remove, leave; invite, resend, revoke, accept. Every method authorizes from the caller's own
    membership of the organization named, and answers the same for "not a member" and "no such
    organization".
  - Three roles: `owner`, `admin`, `member`. An admin can't make or change an owner, and the last
    owner can't leave, be removed or be demoted, even when two owners act at once.
  - Invitations are single-use and expire (seven days by default). Only a hash of the token is
    stored. Accepting needs a signed-in person whose verified identity states the invited address
    (`verifiedEmail` in the config says where to read it; the default is the token's `email` and
    `email_verified` claims), unless `emailCheck` says otherwise. The address is never an argument.
  - `DrizzleOrganizationStore` (`@mariachi/organizations/postgres`) and `MemoryOrganizationStore`
    pass the same contract suite. Changes are written to an audit log when one is given.
  - `@mariachi/core` gains `OrganizationsError` and the HTTP statuses of its codes.

  This release is the package. The request check that makes a named organization the tenant, HTTP
  endpoints and invitation emails follow.

### Patch Changes

- Updated dependencies [2fd4011]
- Updated dependencies [bb7f53a]
- Updated dependencies [44879db]
- Updated dependencies [6ad742b]
- Updated dependencies [92577a6]
- Updated dependencies [47f9687]
- Updated dependencies [da7d762]
- Updated dependencies [662ccc5]
- Updated dependencies [fcdeb4e]
- Updated dependencies [ea2f8fc]
- Updated dependencies [662ccc5]
- Updated dependencies [879b40f]
  - @mariachi/core@0.1.0
  - @mariachi/database@0.1.0
