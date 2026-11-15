# Organizations

`@mariachi/organizations` keeps organizations, memberships and invitations in your own database. Use
it when users share workspaces and your identity provider doesn't manage that for you: plain
Supabase Auth, a generic OIDC provider, the built-in JWT adapter.

You don't need it when the provider puts an organization in every token (WorkOS, Clerk, a custom
claim): that organization is already the tenant.

**This page covers the package: the tables, the service and its rules.** Turning a request's named
organization into its tenant, the HTTP endpoints and the invitation email arrive in the next
releases; until then you call the service from your own procedures.

## The model

- **An organization is a tenant.** It is a row of the existing `tenants` table, and its id is the
  `tenantId` every tenant-scoped table, billing and RBAC already use. Nothing else in your app changes.
- **A membership** joins a user to an organization with a role. A user can be in many organizations.
  The user's id is the one in the verified token; the module keeps no users table.
- **An invitation** is a single-use link for one email address, good for seven days.

Three roles, highest first:

| Role | Can do |
| --- | --- |
| `owner` | Everything an admin can; change anyone's role, including other owners; suspend, reactivate and delete the organization |
| `admin` | Invite; remove admins and members; move members between `admin` and `member`; rename the organization |
| `member` | Use the organization; see its members; leave |

An organization always has an owner: the last one can't leave, be removed or be demoted, even when
two owners act at the same moment.

## Wire it

```ts
import { DefaultOrganizations } from '@mariachi/organizations';
import { DrizzleOrganizationStore } from '@mariachi/organizations/postgres';

const organizations = new DefaultOrganizations(
  { store: new DrizzleOrganizationStore(database.db), audit: auditLog },   // audit is optional
  instrumentation,
);
```

Add `tenantsTable` (from `@mariachi/database/schema`) and `organizationMembershipsTable` and
`organizationInvitationsTable` (from `@mariachi/organizations/schema`) to your schema file, and
migrate. `MemoryOrganizationStore` is the same store in memory, for tests; both pass one contract
suite.

## Use it

`ctx` comes first, as everywhere. Every method works out for itself whether the caller may do what
is asked, from the caller's membership of the organization you name. `ctx.tenantId` plays no part,
so a client can't reach an organization by claiming to be in it.

```ts
// Create: the caller becomes the owner. The slug is made from the name unless you give one.
const { organization } = await organizations.create(ctx, { name: 'Acme Rockets', owner: { email, name } });

await organizations.listMine(ctx);                                  // [{ organization, role }]
await organizations.listMembers(ctx, organization.id, { page: 1, pageSize: 50 });
await organizations.changeRole(ctx, organization.id, userId, 'admin');
await organizations.removeMember(ctx, organization.id, userId);
await organizations.leave(ctx, organization.id);
await organizations.update(ctx, organization.id, { name: 'Acme Space' });
await organizations.suspend(ctx, organization.id);                  // reactivate() undoes it
await organizations.delete(ctx, organization.id);
```

`organizations.access(ctx, organizationId)` answers the one question a request check asks: the
organization and the caller's active membership, or `null`. A suspended organization comes back as
it is, for you to refuse.

## Invitations

```ts
// 1. An owner or admin invites an address. The token is returned this once: put it in the link you send.
const { invitation, token } = await organizations.invite(ctx, organization.id, { email: 'ivy@example.com', role: 'member' });
await sendEmail(invitation.email, `${appUrl}/invitations/accept?token=${token}`);

// 2. The invitee opens the link, signs in or signs up, and your page calls this as them.
await organizations.acceptInvitation(ctx, {
  token,
  email: identity.claims.email,                   // from the verified token, never from the request body
  emailVerified: identity.claims.email_verified === true,
});
```

- Inviting an address that already belongs to a member is refused. Inviting one that already has
  an invitation replaces it; `resendInvitation` gives the same invitation a new token and expiry. In
  both cases the token sent before stops working. `revokeInvitation` cancels one.
- Only an owner can invite an owner.
- **The email check is the main protection.** By default accepting requires that the signed-in
  user's address is the one invited and that the identity provider says it is verified, so a
  forwarded or leaked link is no use to anyone else. `emailCheck: 'match'` drops the verified
  requirement, for a provider that doesn't state it; `emailCheck: 'none'` lets anyone holding the
  link join. Choose either on purpose.
- Someone who is already a member and accepts keeps the role they have.

## What it guarantees

- **One refusal for "not a member" and "no such organization"** (`organizations/not-found`, same
  message), so the API doesn't reveal which organizations exist.
- **Invitation tokens** are an id and 32 random bytes. Only a SHA-256 hash is stored; the secret is
  compared in constant time; a token works once and expires.
- **Role changes go one way down.** An admin can neither make an owner nor change one.
- **Ids are generated, never chosen,** so an organization can't take the reserved personal-tenant
  prefix. `reservedSlugs` keeps slugs your routes or subdomains use from being taken.
- **Changes are audited** when you pass `audit` (`@mariachi/audit`'s logger fits): created, renamed,
  suspended, deleted, member added, role changed, removed, left, and every invitation step. A change
  whose audit entry can't be written is undone.
- **`onChange(listener)`** tells you after a change is kept, for dropping a cached membership.

## Things to know

- **Deleting** marks the organization deleted: nobody can reach it and its slug stays taken. Its
  rows in your own tenant-scoped tables are yours to remove.
- **A removed member** loses access to every method here at once. Their row stays, marked `removed`,
  and they come back only through a new invitation, with the role then invited.
- **Personal tenants** (`withPersonalTenants`) and organizations sit side by side: a user who
  creates an organization starts it empty and keeps their personal tenant. Moving a personal
  tenant's data into an organization is not part of this module.
- **Not in this version:** custom role names per organization, joining by email domain, single
  sign-on per organization, SCIM, teams inside an organization, billing by seat, and copying
  organizations from a provider that has its own.

## Errors

`OrganizationsError`: `organizations/not-found` and `organizations/member-not-found` and
`organizations/invitation-not-found` (404), `organizations/user-required` (401),
`organizations/forbidden`, `organizations/suspended`, `organizations/email-mismatch` and
`organizations/email-unverified` (403), `organizations/last-owner`, `organizations/already-member`
and `organizations/slug-taken` (409), `organizations/invitation-invalid` (400) and
`organizations/invitation-expired` (410). Bad input is `validation/invalid-input`.
