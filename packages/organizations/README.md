# @mariachi/organizations

Organizations, memberships and invitations kept in the app's own database, for apps whose identity
provider supplies none. An organization is a row of the `tenants` table, so its id is the tenant id
the rest of the framework already uses.

**Status: alpha.** Covered by unit tests, a contract suite that the memory store and the Postgres
store both pass, and end-to-end tests through the API layer and through a project generated with
`mariachi init --orgs`. The API can change.

Guide: [organizations.md](../core/docs/organizations.md)

## Imports

| Import | Contents |
| --- | --- |
| `@mariachi/organizations` | `DefaultOrganizations`, `MemoryOrganizationStore`, `createOrganizationAccess`, `registerOrganizationProcedures`, `invitationEmail`, `roleAtLeast`, `ORGANIZATION_ROLES`, types |
| `@mariachi/organizations/schema` | `organizationMembershipsTable`, `organizationInvitationsTable` |
| `@mariachi/organizations/postgres` | `DrizzleOrganizationStore`, `organizationTables` |
| `@mariachi/organizations/http` | `organizationStrategy`, `OrganizationsController` (needs `@mariachi/api-facade`) |

The Postgres store needs `@mariachi/database-postgres` and `drizzle-orm`, which are optional peers.

## Public API

| Export | Purpose |
| --- | --- |
| `DefaultOrganizations` | `create`, `get`, `listMine`, `access`, `update`, `suspend`, `reactivate`, `delete`; `listMembers`, `changeRole`, `removeMember`, `leave`; `invite`, `listInvitations`, `resendInvitation`, `revokeInvitation`, `acceptInvitation`; `onChange` |
| `createOrganizationAccess({ organizations, source?, cacheTtlMs? })` | Decides a request's tenant: `resolve(identity, requestedOrganizationId)` confirms the membership before the named organization becomes the tenant |
| `organizationStrategy(strategy, access)` | Wraps an API auth strategy with that check, reading `x-organization-id` |
| `registerOrganizationProcedures(communication, organizations, { deliverInvitation?, limiter?, limits? })` | The `organizations.*` procedures, with rate limits and invitation delivery |
| `invitationEmail({ email, acceptUrl, appName?, from?, compose? })` | A `deliverInvitation` that emails the link to the invited address through any email adapter (`@mariachi/notifications`), in the request, storing the token nowhere |
| `OrganizationsController` | Endpoints under `/organizations` that call those procedures |
| `DrizzleOrganizationStore` | Postgres `OrganizationStore` on `tenants` and the two tables above |
| `MemoryOrganizationStore` | The same store in memory, for tests |
| `OrganizationStore` | The port, for a store of your own |
| `roleAtLeast(role, minimum)` | Whether a role can do what another can: `owner` over `admin` over `member` |

## Config

| Option | Default | Notes |
| --- | --- | --- |
| `store` | required | Where organizations are kept |
| `audit` | none | Membership and role changes are written to it; a change it can't record is undone |
| `invitationTtlMs` | seven days | How long an invitation can be accepted |
| `emailCheck` | `'verified'` | What accepting requires of the user's address: `'verified'`, `'match'` or `'none'` |
| `reservedSlugs` | `[]` | Slugs no organization may take |

Errors are `OrganizationsError`, with codes under `organizations/`.
