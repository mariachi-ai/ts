---
'@mariachi/organizations': minor
'@mariachi/core': minor
---

New package `@mariachi/organizations`: organizations, memberships and invitations in the app's own
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
