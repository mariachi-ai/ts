# Organizations

`@mariachi/organizations` keeps organizations, memberships and invitations in your own database. Use
it when users share workspaces and your identity provider doesn't manage that for you: plain
Supabase Auth, a generic OIDC provider, the built-in JWT adapter.

You don't need it when the provider puts an organization in every token (WorkOS, Clerk, a custom
claim): that organization is already the tenant.

Sending the invitation email, and `mariachi init --orgs`, arrive in the next release; until then you
send the link yourself (see [Invitations](#invitations)).

## The model

- **An organization is a tenant.** It is a row of the existing `tenants` table, and its id is the
  `tenantId` every tenant-scoped table, billing and RBAC already use. Nothing else in your app changes.
- **A membership** joins a user to an organization with a role. A user can be in many organizations.
  The user's id is the one in the verified token; the module keeps no users table. That id is the
  key of every membership, so it must be unique across everything your app accepts sign-ins from:
  with one identity provider it is, and with several, give each provider's verifier a namespace
  (`withUserNamespace`, below).
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

## Put a request in its organization

A token proves who the user is. It doesn't say which of their organizations they are working in. So
the client names one on each request, in the `x-organization-id` header, and the server checks the
membership before that organization becomes the tenant.

```ts
import { createOrganizationAccess, registerOrganizationProcedures } from '@mariachi/organizations';
import { OrganizationsController, organizationStrategy } from '@mariachi/organizations/http';

const access = createOrganizationAccess({ organizations });
registerOrganizationProcedures(communication, organizations, { limiter });

api
  .withAuthStrategy('session', organizationStrategy(bearerStrategy(verifier), access))
  .withAuth('session')
  .registerController(new OrganizationsController(communication));
```

The check sits where the API turns a request into an identity, so every route gets it without doing
anything:

| The request | Runs as |
| --- | --- |
| names an organization the user is in | that organization as `ctx.tenantId`, with the member's role among the identity's roles |
| names one the user isn't in, or that doesn't exist, or anything that isn't an organization's id | refused: `organizations/not-found` (404), the same for all three |
| names a suspended organization | refused: `tenancy/suspended` (403) |
| names none | the identity's own tenant: the user's personal tenant, as its `owner`, when [personal tenants](./auth-and-providers.md#users-with-no-organization-personal-tenants) are on; otherwise none, and routes that need a tenant answer `tenancy/missing-tenant` |
| names one organization while the token names another | refused: `tenancy/mismatch` (403) |

- **It never chooses.** A user in three organizations who names none is placed in none of them.
- **Only the membership gives an organization role.** An `admin` or `owner` among the token's own
  roles is dropped: it says nothing about this organization.
- **Only people are resolved.** An API key or a service stays in the tenant its credential was
  issued for.
- **A removed member is out on their next request,** though their token is still valid. A lookup is
  trusted for five seconds (`cacheTtlMs`), and a change made in the same process clears it at once.
  With several processes, another one sees a removal within those five seconds; to make it
  immediate, publish from `organizations.onChange` and call `access.forget(organizationId)` where
  it arrives.
- Read the organization from somewhere else with `organizationStrategy(strategy, access, {
  organizationFrom: (req) => … })`: a subdomain, a path segment. For realtime, call
  `access.resolve(identity, organizationId)` on the identity before `handleConnect`.

**When the identity provider keeps the memberships** (WorkOS, Clerk, a token hook of your own) and
puts the organization in the token, say so: `createOrganizationAccess({ organizations, source:
'token' })`. The token's organization is then the tenant and this module's tables are never read.
An app has one source of memberships, not both.

### The endpoints

`OrganizationsController` serves these under `/organizations`. Each names its organization in the
path and is decided by the caller's membership of it, so they work from any tenant or none
(`tenant: 'optional'`): that is how a user with no organization creates or joins one, and how an
owner reaches an organization that is suspended.

| Route | Does |
| --- | --- |
| `GET /organizations` | the caller's organizations, with their role in each |
| `POST /organizations` | create one; the caller becomes its owner |
| `GET`, `PATCH`, `DELETE /organizations/:id` | read, rename, delete |
| `POST /organizations/:id/suspend`, `/reactivate`, `/leave` | |
| `GET /organizations/:id/members` | `?page=&pageSize=` |
| `PATCH`, `DELETE /organizations/:id/members/:userId` | change a role, remove |
| `GET`, `POST /organizations/:id/invitations` | list, invite |
| `POST /organizations/:id/invitations/:invitationId/resend`, `DELETE …/:invitationId` | |
| `POST /organizations/invitations/accept` | the signed-in user accepts `{ token }` |

The controller calls procedures (`organizations.create`, `organizations.members.list`, …; the names
are in `ORGANIZATION_PROCEDURES`), so a controller of your own can call them too.

**Limits.** Give `registerOrganizationProcedures` the rate limiter your API uses, and creating,
inviting and accepting are limited: 10 organizations an hour per user; 30 invitations an hour per
user and 200 per organization; 10 accept attempts in ten minutes per user and 30 per address.
`limits` changes the numbers. Without a limiter there are none.

**Several identity providers.** A user's id is the key of their memberships, so two providers must
not be able to issue the same one. Give each verifier a namespace before it reaches the API:
`withUserNamespace(workosProvider, 'workos')` from `@mariachi/auth` makes the id
`workos.<subject>`. With one provider, nothing is needed.

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

`organizations.access(ctx, organizationId)` answers the one question the request check asks: the
organization and the caller's active membership, or `null`. A suspended organization comes back as
it is, to be refused.

## Invitations

```ts
// 1. An owner or admin invites an address. The token is returned this once: put it in the link you send.
const { invitation, token } = await organizations.invite(ctx, organization.id, { email: 'ivy@example.com', role: 'member' });
await sendEmail(invitation.email, `${appUrl}/invitations/accept?token=${token}`);

// Or, with the procedures: say how an invitation is delivered, and the token goes only to the invited address
registerOrganizationProcedures(communication, organizations, {
  deliverInvitation: (ctx, { organization, invitation, token }) =>
    sendEmail(invitation.email, `${appUrl}/invitations/accept?token=${token}`, { organization: organization.name }),
});

// 2. The invitee opens the link, signs in or signs up, and your page calls this as them.
await organizations.acceptInvitation(ctx, { token });
```

**The invitee's email address is not an argument.** Accepting reads it from the user's verified
identity, so nothing a client sends can stand in for it. By default that is the standard claims of
the request's token, `email` and `email_verified`, which the API layer puts on `ctx.identity.claims`.

For a provider whose tokens don't carry `email_verified`, say where the answer is. Ask the provider
for the user's record, server-side:

```ts
new DefaultOrganizations({
  store,
  verifiedEmail: async (ctx) => {
    const user = await identityAdmin.getUser(ctx.userId!);          // your provider's admin API
    return { email: user.email, verified: user.email_confirmed_at != null };
  },
});
```

Two things decide whether "verified" means anything:

- **Read it only from somewhere the user can't write.** A claim the provider or your own token hook
  sets is fine. A profile field the user can edit is not: GoTrue (Supabase Auth) lets a signed-in
  user write their own `user_metadata`, so `user_metadata.email_verified` is the user's word about
  themselves. Use `email_confirmed_at` from the user's record, or `app_metadata`, which only an
  admin can set.
- **It must come from a confirmation that happened.** A provider set to confirm sign-ups without
  sending mail (GoTrue's `MAILER_AUTOCONFIRM`) marks every address confirmed, and then the check
  proves nothing: anyone can sign up as the invited address. Don't run invitations on that setting.

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
- Accepting is a person's own act: it needs a signed-in user (`ctx.identityType === 'session'`). An
  API key, a service or a webhook is refused, whatever user it acts for.

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
- **`onChange(listener)`** tells you after a change is kept, for dropping a cached membership. It
  fires in the process that made the change; to tell other processes at once, publish from it.

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
