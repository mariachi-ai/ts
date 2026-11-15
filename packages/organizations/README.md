# @mariachi/organizations

Organizations, memberships and invitations kept in the app's own database, for apps whose identity
provider supplies none. An organization is a row of the `tenants` table, so its id is the tenant id
the rest of the framework already uses.

**Status: alpha.** Covered by unit tests and a contract suite that the memory store and the
Postgres store both pass. This release is the package itself; the request check that makes a named
organization the tenant, the HTTP endpoints and invitation emails follow. The API can change.

Guide: [organizations.md](../core/docs/organizations.md)

## Imports

| Import | Contents |
| --- | --- |
| `@mariachi/organizations` | `DefaultOrganizations`, `MemoryOrganizationStore`, `roleAtLeast`, `ORGANIZATION_ROLES`, types |
| `@mariachi/organizations/schema` | `organizationMembershipsTable`, `organizationInvitationsTable` |
| `@mariachi/organizations/postgres` | `DrizzleOrganizationStore`, `organizationTables` |

The Postgres store needs `@mariachi/database-postgres` and `drizzle-orm`, which are optional peers.

## Public API

| Export | Purpose |
| --- | --- |
| `DefaultOrganizations` | `create`, `get`, `listMine`, `access`, `update`, `suspend`, `reactivate`, `delete`; `listMembers`, `changeRole`, `removeMember`, `leave`; `invite`, `listInvitations`, `resendInvitation`, `revokeInvitation`, `acceptInvitation`; `onChange` |
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
