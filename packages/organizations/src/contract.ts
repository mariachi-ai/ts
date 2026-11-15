import { describe, expect, it } from 'vitest';
import { createContext, type Context } from '@mariachi/core';
import { DefaultOrganizations } from './organizations';
import { hashInvitationSecret, parseInvitationToken } from './tokens';
import type { OrganizationAudit, OrganizationChange, OrganizationStore, OrganizationsConfig } from './types';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child: () => silent };
const as = (userId: string | null): Context => createContext({ userId, logger: silent });
const run = () => crypto.randomUUID().slice(0, 8);
/** A user id no other test uses, so the tests can share one database. */
const user = (name: string) => `${name}-${run()}`;
const code = (expected: string) => ({ code: expected });

/**
 * What `Organizations` must do on any `OrganizationStore`. The memory store runs it in the unit
 * tests and the Postgres store in the integration tests.
 */
export function organizationsContract(name: string, makeStore: () => OrganizationStore | Promise<OrganizationStore>): void {
  describe(`organizations contract: ${name}`, () => {
    const setup = async (config: Partial<OrganizationsConfig> = {}) => {
      const store = await makeStore();
      return { store, orgs: new DefaultOrganizations({ store, ...config }, { logger: silent }) };
    };
    /** An organization with an owner, an admin and a member, each joined through an invitation. */
    const team = async (config: Partial<OrganizationsConfig> = {}) => {
      const { store, orgs } = await setup(config);
      const [owner, admin, member, outsider] = [user('owner'), user('admin'), user('member'), user('outsider')];
      const { organization } = await orgs.create(as(owner), { name: `Team ${run()}`, owner: { email: `${owner}@example.com`, name: 'Olive Owner' } });
      const join = async (userId: string, role: 'admin' | 'member') => {
        const { token } = await orgs.invite(as(owner), organization.id, { email: `${userId}@example.com`, role });
        await orgs.acceptInvitation(as(userId), { token, email: `${userId}@example.com`, emailVerified: true, name: userId });
      };
      await join(admin, 'admin');
      await join(member, 'member');
      return { store, orgs, id: organization.id, organization, owner, admin, member, outsider };
    };

    it('creates an organization with its creator as owner, and a slug made from the name', async () => {
      const { orgs } = await setup({ reservedSlugs: ['admin'] });
      const ada = user('ada');
      const title = `Café Münster ${run()}`;
      const { organization, membership } = await orgs.create(as(ada), { name: `  ${title}  `, owner: { email: ' Ada@Example.com ', name: 'Ada' } });
      expect(organization).toMatchObject({ name: title, status: 'active' });
      expect(organization.slug).toMatch(/^cafe-munster-[0-9a-f]{8}$/);
      expect(organization.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(membership).toMatchObject({ organizationId: organization.id, userId: ada, role: 'owner', status: 'active', email: 'ada@example.com', name: 'Ada', invitedBy: null });
      expect(await orgs.listMine(as(ada))).toEqual([{ organization, role: 'owner' }]);

      // The same name again is a second organization with its own slug
      const second = await orgs.create(as(ada), { name: title });
      expect(second.organization.id).not.toBe(organization.id);
      expect(second.organization.slug).toMatch(/^cafe-munster-[0-9a-f]{8}-[0-9a-f]{4}$/);
      expect((await orgs.listMine(as(ada))).map((mine) => mine.organization.id)).toEqual([organization.id, second.organization.id]);

      // A chosen slug is taken as given, or refused
      const chosen = `chosen-${run()}`;
      expect((await orgs.create(as(ada), { name: 'Chosen', slug: chosen })).organization.slug).toBe(chosen);
      await expect(orgs.create(as(user('eve')), { name: 'Other', slug: chosen })).rejects.toMatchObject(code('organizations/slug-taken'));
      await expect(orgs.create(as(ada), { name: 'Reserved', slug: 'admin' })).rejects.toMatchObject(code('organizations/slug-taken'));
      // A name that would make a reserved slug gets another one
      expect((await orgs.create(as(ada), { name: 'Admin' })).organization.slug).toMatch(/^admin-[0-9a-f]{4}$/);
      for (const bad of [{ name: '' }, { name: 'x'.repeat(101) }, { name: 'ok', slug: 'No Spaces' }, { name: 'ok', slug: '-edge' }, { name: 'ok', slug: 'ab' }, { name: 'ok', owner: { email: 'not-an-address' } }]) {
        await expect(orgs.create(as(ada), bad), JSON.stringify(bad)).rejects.toMatchObject(code('validation/invalid-input'));
      }
      await expect(orgs.create(as(null), { name: 'Nobody' })).rejects.toMatchObject(code('organizations/user-required'));
    });

    it('gives someone who is not a member the same refusal as for an organization that does not exist', async () => {
      const { orgs, id, outsider, member } = await team();
      const refusals: Array<{ code: string; message: string; metadata: unknown }> = [];
      for (const target of [id, crypto.randomUUID(), 'not-an-id', "'; drop table tenants; --", '']) {
        for (const call of [() => orgs.get(as(outsider), target), () => orgs.listMembers(as(outsider), target), () => orgs.invite(as(outsider), target, { email: 'x@example.com' }), () => orgs.leave(as(outsider), target)]) {
          const error = await call().then(
            () => undefined,
            (e) => e as { code: string; message: string; metadata: unknown },
          );
          expect(error).toBeDefined();
          refusals.push({ code: error?.code ?? '', message: error?.message ?? '', metadata: error?.metadata });
        }
        expect(await orgs.access(as(outsider), target)).toBeNull();
      }
      expect(new Set(refusals.map((r) => JSON.stringify(r)))).toEqual(new Set([JSON.stringify({ code: 'organizations/not-found', message: 'Organization not found' })]));
      expect(await orgs.listMine(as(outsider))).toEqual([]);
      // A member is let in, and told their role
      expect(await orgs.access(as(member), id)).toMatchObject({ organization: { id }, membership: { userId: member, role: 'member' } });
      expect(await orgs.access(as(null), id)).toBeNull();
    });

    it('lets each role do what the role allows and nothing above it', async () => {
      const { orgs, id, owner, admin, member } = await team();
      const forbidden = code('organizations/forbidden');
      // A member: use it, see who is in it, leave
      expect((await orgs.get(as(member), id)).id).toBe(id);
      expect((await orgs.listMembers(as(member), id)).total).toBe(3);
      await expect(orgs.update(as(member), id, { name: 'Renamed' })).rejects.toMatchObject(forbidden);
      await expect(orgs.invite(as(member), id, { email: 'new@example.com' })).rejects.toMatchObject(forbidden);
      await expect(orgs.listInvitations(as(member), id)).rejects.toMatchObject(forbidden);
      await expect(orgs.changeRole(as(member), id, admin, 'member')).rejects.toMatchObject(forbidden);
      await expect(orgs.removeMember(as(member), id, admin)).rejects.toMatchObject(forbidden);
      await expect(orgs.suspend(as(member), id)).rejects.toMatchObject(forbidden);
      await expect(orgs.delete(as(member), id)).rejects.toMatchObject(forbidden);

      // An admin: rename, invite, manage admins and members; never an owner, never the organization's life
      expect((await orgs.update(as(admin), id, { name: 'Renamed by admin' })).name).toBe('Renamed by admin');
      await expect(orgs.invite(as(admin), id, { email: 'boss@example.com', role: 'owner' })).rejects.toMatchObject(forbidden);
      await expect(orgs.changeRole(as(admin), id, member, 'owner')).rejects.toMatchObject(forbidden);
      await expect(orgs.changeRole(as(admin), id, owner, 'admin')).rejects.toMatchObject(forbidden);
      await expect(orgs.removeMember(as(admin), id, owner)).rejects.toMatchObject(forbidden);
      await expect(orgs.suspend(as(admin), id)).rejects.toMatchObject(forbidden);
      await expect(orgs.reactivate(as(admin), id)).rejects.toMatchObject(forbidden);
      await expect(orgs.delete(as(admin), id)).rejects.toMatchObject(forbidden);
      expect((await orgs.changeRole(as(admin), id, member, 'admin')).role).toBe('admin');
      expect((await orgs.changeRole(as(admin), id, member, 'member')).role).toBe('member');
      // Nothing above changed who the owner is
      expect((await orgs.listMembers(as(owner), id)).data.map((m) => [m.userId, m.role])).toEqual([[owner, 'owner'], [admin, 'admin'], [member, 'member']]);

      // An owner: everything
      expect((await orgs.changeRole(as(owner), id, admin, 'owner')).role).toBe('owner');
      expect((await orgs.changeRole(as(owner), id, admin, 'member')).role).toBe('member');
      await expect(orgs.changeRole(as(owner), id, admin, 'superuser' as never)).rejects.toMatchObject(code('validation/invalid-input'));
      await expect(orgs.changeRole(as(owner), id, user('ghost'), 'admin')).rejects.toMatchObject(code('organizations/member-not-found'));
    });

    it('always keeps an owner, also when two owners act at the same moment', async () => {
      const { orgs, id, owner, admin } = await team();
      const lastOwner = code('organizations/last-owner');
      await expect(orgs.leave(as(owner), id)).rejects.toMatchObject(lastOwner);
      await expect(orgs.removeMember(as(owner), id, owner)).rejects.toMatchObject(lastOwner);
      await expect(orgs.changeRole(as(owner), id, owner, 'admin')).rejects.toMatchObject(lastOwner);

      // With a second owner, each could go; both going at once must leave one
      for (let round = 0; round < 8; round++) {
        await orgs.changeRole(as(owner), id, admin, 'owner');
        const moves =
          round % 2
            ? [orgs.leave(as(owner), id), orgs.leave(as(admin), id)]
            : [orgs.changeRole(as(owner), id, admin, 'member'), orgs.changeRole(as(admin), id, owner, 'member')];
        const outcomes = await Promise.allSettled(moves);
        const members = (await orgs.listMembers(as(outsiderOf(outcomes, owner, admin)), id)).data;
        expect(members.filter((m) => m.role === 'owner'), `round ${round}`).toHaveLength(1);
        expect(outcomes.filter((o) => o.status === 'fulfilled'), `round ${round}`).toHaveLength(1);
        const failed = outcomes.find((o) => o.status === 'rejected') as PromiseRejectedResult;
        expect(['organizations/last-owner', 'organizations/forbidden', 'organizations/not-found']).toContain(failed.reason.code);
        // Put both back as they were for the next round
        const remaining = members.find((m) => m.role === 'owner')?.userId as string;
        const other = remaining === owner ? admin : owner;
        if (!members.some((m) => m.userId === other)) {
          const { token } = await orgs.invite(as(remaining), id, { email: `${other}@example.com`, role: 'admin' });
          await orgs.acceptInvitation(as(other), { token, email: `${other}@example.com`, emailVerified: true });
        }
        if (remaining !== owner) {
          await orgs.changeRole(as(remaining), id, owner, 'owner');
          await orgs.changeRole(as(owner), id, admin, 'admin');
        } else {
          await orgs.changeRole(as(owner), id, admin, 'admin');
        }
      }
    });

    it('removes a member at once, lets them leave, and brings them back only by a new invitation', async () => {
      const { orgs, id, owner, admin, member } = await team();
      await orgs.removeMember(as(admin), id, member);
      await expect(orgs.get(as(member), id)).rejects.toMatchObject(code('organizations/not-found'));
      expect(await orgs.access(as(member), id)).toBeNull();
      expect(await orgs.listMine(as(member))).toEqual([]);
      expect((await orgs.listMembers(as(owner), id)).data.map((m) => m.userId)).toEqual([owner, admin]);
      await expect(orgs.removeMember(as(admin), id, member)).rejects.toMatchObject(code('organizations/member-not-found'));
      await expect(orgs.changeRole(as(owner), id, member, 'admin')).rejects.toMatchObject(code('organizations/member-not-found'));

      // Back, by invitation, with the role now invited
      const { token } = await orgs.invite(as(owner), id, { email: `${member}@example.com`, role: 'admin' });
      const back = await orgs.acceptInvitation(as(member), { token, email: `${member}@example.com`, emailVerified: true });
      expect(back.membership).toMatchObject({ userId: member, role: 'admin', status: 'active', invitedBy: owner });
      expect((await orgs.listMine(as(member))).map((mine) => mine.role)).toEqual(['admin']);

      await orgs.leave(as(admin), id);
      expect(await orgs.access(as(admin), id)).toBeNull();
      // An admin can remove another admin, and themselves
      await orgs.removeMember(as(member), id, member);
      expect((await orgs.listMembers(as(owner), id)).data.map((m) => m.userId)).toEqual([owner]);
    });

    it('invites by email with a token shown once, of which only a hash is kept', async () => {
      const { orgs, store, id, owner, admin } = await team();
      const invitee = user('ivy');
      const address = `${invitee}@example.com`;
      const { invitation, token } = await orgs.invite(as(admin), id, { email: `  ${address.toUpperCase()} `, role: 'member' });
      expect(invitation).toMatchObject({ organizationId: id, email: address, role: 'member', invitedBy: admin, acceptedAt: null, revokedAt: null });
      expect(invitation).not.toHaveProperty('tokenHash');
      expect(invitation.expiresAt.getTime() - Date.now()).toBeGreaterThan(6.9 * 24 * 3600 * 1000);
      const parts = parseInvitationToken(token);
      expect(parts?.invitationId).toBe(invitation.id);
      // 32 random bytes; the store holds their hash and nothing the token could be rebuilt from
      expect(Buffer.from(parts?.secret ?? '', 'base64url')).toHaveLength(32);
      const stored = await store.getInvitation(as(owner), invitation.id);
      expect(stored?.tokenHash).toBe(hashInvitationSecret(parts?.secret ?? ''));
      expect(JSON.stringify(stored)).not.toContain(parts?.secret);
      expect((await orgs.listInvitations(as(owner), id)).map((i) => [i.email, i.status])).toEqual([[address, 'pending']]);

      const accepted = await orgs.acceptInvitation(as(invitee), { token, email: address, emailVerified: true, name: 'Ivy' });
      expect(accepted.organization.id).toBe(id);
      expect(accepted.membership).toMatchObject({ userId: invitee, role: 'member', email: address, name: 'Ivy', invitedBy: admin });
      expect(await orgs.listInvitations(as(owner), id)).toEqual([]);
      // Used once
      await expect(orgs.acceptInvitation(as(invitee), { token, email: address, emailVerified: true })).rejects.toMatchObject(code('organizations/invitation-invalid'));
      await expect(orgs.acceptInvitation(as(user('other')), { token, email: address, emailVerified: true })).rejects.toMatchObject(code('organizations/invitation-invalid'));
      // And that address is a member now
      await expect(orgs.invite(as(owner), id, { email: address })).rejects.toMatchObject(code('organizations/already-member'));
      await expect(orgs.invite(as(owner), id, { email: 'not an address' })).rejects.toMatchObject(code('validation/invalid-input'));
    });

    it('accepts only for the invited, verified address, and only with the whole token', async () => {
      const { orgs, id, owner } = await team();
      const invitee = user('ivy');
      const address = `${invitee}@example.com`;
      const { invitation, token } = await orgs.invite(as(owner), id, { email: address });
      const secret = parseInvitationToken(token)?.secret ?? '';
      const invalid = code('organizations/invitation-invalid');

      // A link that was forwarded or leaked is no use to anyone signed in under another address
      await expect(orgs.acceptInvitation(as(user('mallory')), { token, email: 'mallory@example.com', emailVerified: true })).rejects.toMatchObject(code('organizations/email-mismatch'));
      await expect(orgs.acceptInvitation(as(invitee), { token, emailVerified: true })).rejects.toMatchObject(code('organizations/email-mismatch'));
      await expect(orgs.acceptInvitation(as(invitee), { token, email: address, emailVerified: false })).rejects.toMatchObject(code('organizations/email-unverified'));
      await expect(orgs.acceptInvitation(as(invitee), { token, email: address })).rejects.toMatchObject(code('organizations/email-unverified'));
      await expect(orgs.acceptInvitation(as(null), { token, email: address, emailVerified: true })).rejects.toMatchObject(code('organizations/user-required'));

      const flipped = `${secret.slice(0, -1)}${secret.endsWith('A') ? 'B' : 'A'}`;
      for (const bad of [`${invitation.id}.${flipped}`, `${crypto.randomUUID()}.${secret}`, invitation.id, secret, `${invitation.id}.`, '', 'x'.repeat(500), `${invitation.id}.${secret}.extra`]) {
        await expect(orgs.acceptInvitation(as(invitee), { token: bad, email: address, emailVerified: true }), bad.slice(0, 60)).rejects.toMatchObject(invalid);
      }
      // None of that used it up
      expect((await orgs.acceptInvitation(as(invitee), { token, email: address.toUpperCase(), emailVerified: true })).membership.role).toBe('member');
    });

    it('replaces, resends and revokes an invitation, each ending the token sent before', async () => {
      const { orgs, id, owner, admin } = await team();
      const other = await orgs.create(as(admin), { name: `Elsewhere ${run()}` });
      const invitee = user('ivy');
      const address = `${invitee}@example.com`;
      const accept = (token: string) => orgs.acceptInvitation(as(invitee), { token, email: address, emailVerified: true });
      const invalid = code('organizations/invitation-invalid');

      const first = await orgs.invite(as(owner), id, { email: address, role: 'member' });
      const second = await orgs.invite(as(admin), id, { email: address, role: 'admin' });
      expect(second.invitation.id).not.toBe(first.invitation.id);
      expect((await orgs.listInvitations(as(owner), id)).map((i) => i.id)).toEqual([second.invitation.id]);
      await expect(accept(first.token)).rejects.toMatchObject(invalid);

      const resent = await orgs.resendInvitation(as(owner), id, second.invitation.id);
      expect(resent.invitation.id).toBe(second.invitation.id);
      expect(resent.token).not.toBe(second.token);
      await expect(accept(second.token)).rejects.toMatchObject(invalid);

      // An invitation is reached only through its own organization
      const missing = code('organizations/invitation-not-found');
      await expect(orgs.revokeInvitation(as(admin), other.organization.id, second.invitation.id)).rejects.toMatchObject(missing);
      await expect(orgs.resendInvitation(as(admin), other.organization.id, second.invitation.id)).rejects.toMatchObject(missing);
      await expect(orgs.revokeInvitation(as(owner), id, crypto.randomUUID())).rejects.toMatchObject(missing);
      await expect(orgs.revokeInvitation(as(owner), id, 'nonsense')).rejects.toMatchObject(missing);

      await orgs.revokeInvitation(as(admin), id, second.invitation.id);
      await expect(accept(resent.token)).rejects.toMatchObject(invalid);
      await expect(orgs.revokeInvitation(as(admin), id, second.invitation.id)).rejects.toMatchObject(missing);
      await expect(orgs.resendInvitation(as(admin), id, second.invitation.id)).rejects.toMatchObject(missing);
      expect(await orgs.listInvitations(as(owner), id)).toEqual([]);
      expect(await orgs.access(as(invitee), id)).toBeNull();

      // After all that, a fresh one works
      const third = await orgs.invite(as(owner), id, { email: address, role: 'member' });
      expect((await accept(third.token)).membership.role).toBe('member');
    });

    it('stops an invitation working when it expires, until it is resent', async () => {
      let now = new Date('2026-03-01T12:00:00Z');
      const { orgs, id, owner } = await team({ now: () => now, invitationTtlMs: 60 * 60 * 1000 });
      const invitee = user('ivy');
      const address = `${invitee}@example.com`;
      const { invitation, token } = await orgs.invite(as(owner), id, { email: address });
      expect(invitation.expiresAt.toISOString()).toBe('2026-03-01T13:00:00.000Z');
      now = new Date('2026-03-01T13:00:00Z');
      await expect(orgs.acceptInvitation(as(invitee), { token, email: address, emailVerified: true })).rejects.toMatchObject(code('organizations/invitation-expired'));
      expect((await orgs.listInvitations(as(owner), id)).map((i) => i.status)).toEqual(['expired']);
      const resent = await orgs.resendInvitation(as(owner), id, invitation.id);
      expect(resent.invitation.expiresAt.toISOString()).toBe('2026-03-01T14:00:00.000Z');
      expect((await orgs.acceptInvitation(as(invitee), { token: resent.token, email: address, emailVerified: true })).membership.userId).toBe(invitee);
    });

    it('checks the email as strictly as it is told to, and leaves a member who accepts with the role they have', async () => {
      const matching = await team({ emailCheck: 'match' });
      const a = await matching.orgs.invite(as(matching.owner), matching.id, { email: 'a@example.com' });
      await expect(matching.orgs.acceptInvitation(as(user('a')), { token: a.token, email: 'b@example.com' })).rejects.toMatchObject(code('organizations/email-mismatch'));
      expect((await matching.orgs.acceptInvitation(as(user('a')), { token: a.token, email: 'a@example.com' })).membership.role).toBe('member');

      const open = await team({ emailCheck: 'none' });
      const b = await open.orgs.invite(as(open.owner), open.id, { email: 'b@example.com' });
      expect((await open.orgs.acceptInvitation(as(user('anyone')), { token: b.token })).membership.email).toBeNull();

      // The owner, whose membership holds another address, accepts an invitation sent to a second address of theirs
      const { orgs, id, owner } = await team();
      const { token } = await orgs.invite(as(owner), id, { email: 'second@example.com', role: 'member' });
      const accepted = await orgs.acceptInvitation(as(owner), { token, email: 'second@example.com', emailVerified: true });
      expect(accepted.membership).toMatchObject({ userId: owner, role: 'owner', email: `${owner}@example.com` });
      expect(await orgs.listInvitations(as(owner), id)).toEqual([]);
    });

    it('suspends without removing anything, and deletes for good', async () => {
      const { orgs, id, organization, owner, admin, member } = await team();
      const pending = await orgs.invite(as(owner), id, { email: 'late@example.com' });
      expect((await orgs.suspend(as(owner), id)).status).toBe('suspended');
      // Whoever checks requests sees it is suspended and refuses; the owner can still manage it
      expect((await orgs.access(as(member), id))?.organization.status).toBe('suspended');
      const suspended = code('organizations/suspended');
      await expect(orgs.invite(as(admin), id, { email: 'new@example.com' })).rejects.toMatchObject(suspended);
      await expect(orgs.resendInvitation(as(admin), id, pending.invitation.id)).rejects.toMatchObject(suspended);
      await expect(orgs.acceptInvitation(as(user('late')), { token: pending.token, email: 'late@example.com', emailVerified: true })).rejects.toMatchObject(suspended);
      expect((await orgs.listMembers(as(owner), id)).total).toBe(3);
      expect((await orgs.reactivate(as(owner), id)).status).toBe('active');
      expect((await orgs.access(as(member), id))?.organization.status).toBe('active');

      await orgs.delete(as(owner), id);
      for (const who of [owner, admin, member]) {
        await expect(orgs.get(as(who), id)).rejects.toMatchObject(code('organizations/not-found'));
        expect(await orgs.access(as(who), id)).toBeNull();
        expect(await orgs.listMine(as(who))).toEqual([]);
      }
      await expect(orgs.reactivate(as(owner), id)).rejects.toMatchObject(code('organizations/not-found'));
      await expect(orgs.acceptInvitation(as(user('late')), { token: pending.token, email: 'late@example.com', emailVerified: true })).rejects.toMatchObject(code('organizations/invitation-invalid'));
      // Its slug is not handed to someone else
      await expect(orgs.create(as(user('squatter')), { name: 'Squat', slug: organization.slug })).rejects.toMatchObject(code('organizations/slug-taken'));
    });

    it('lists members a page at a time, owners first', async () => {
      const { orgs, id, owner, admin, member } = await team();
      expect((await orgs.listMembers(as(member), id)).data.map((m) => [m.userId, m.role, m.email])).toEqual([
        [owner, 'owner', `${owner}@example.com`],
        [admin, 'admin', `${admin}@example.com`],
        [member, 'member', `${member}@example.com`],
      ]);
      const first = await orgs.listMembers(as(member), id, { page: 1, pageSize: 2 });
      expect(first).toMatchObject({ total: 3, page: 1, pageSize: 2, totalPages: 2 });
      expect(first.data.map((m) => m.userId)).toEqual([owner, admin]);
      expect((await orgs.listMembers(as(member), id, { page: 2, pageSize: 2 })).data.map((m) => m.userId)).toEqual([member]);
      // Nonsense paging is brought into range, not passed to the store
      expect(await orgs.listMembers(as(member), id, { page: 0, pageSize: 100_000 })).toMatchObject({ page: 1, pageSize: 200 });
    });

    it('writes each change to the audit log, and undoes a change it cannot record', async () => {
      const entries: Array<{ actor: string; action: string; resourceId: string; tenantId?: string | null; metadata?: Record<string, unknown> }> = [];
      let failing = false;
      const audit: OrganizationAudit = {
        async log(_ctx, entry) {
          if (failing) throw new Error('audit log is down');
          entries.push(entry);
        },
      };
      const { orgs, id, owner, admin, member } = await team({ audit });
      await orgs.changeRole(as(owner), id, member, 'admin');
      await orgs.removeMember(as(owner), id, admin);
      await orgs.leave(as(member), id);
      expect(entries.map((e) => e.action)).toEqual([
        'organization.created',
        'organization.invitation.created',
        'organization.invitation.accepted',
        'organization.invitation.created',
        'organization.invitation.accepted',
        'organization.member.role-changed',
        'organization.member.removed',
        'organization.member.left',
      ]);
      expect(entries.every((e) => e.resourceId === id && e.tenantId === id)).toBe(true);
      expect(entries[5]).toMatchObject({ actor: owner, metadata: { userId: member, from: 'member', to: 'admin' } });
      // No entry holds an invitation's secret or its hash
      expect(JSON.stringify(entries)).not.toMatch(/tokenHash|secret/);

      const { token } = await orgs.invite(as(owner), id, { email: `${admin}@example.com`, role: 'member' });
      failing = true;
      await expect(orgs.acceptInvitation(as(admin), { token, email: `${admin}@example.com`, emailVerified: true })).rejects.toThrow('audit log is down');
      await expect(orgs.update(as(owner), id, { name: 'Unrecorded' })).rejects.toThrow('audit log is down');
      await expect(orgs.create(as(owner), { name: `Unrecorded ${run()}` })).rejects.toThrow('audit log is down');
      failing = false;
      expect(await orgs.access(as(admin), id)).toBeNull();
      expect((await orgs.get(as(owner), id)).name).not.toBe('Unrecorded');
      expect(await orgs.listMine(as(owner))).toHaveLength(1);
      // The invitation the failed accept tried to use is still good
      expect((await orgs.acceptInvitation(as(admin), { token, email: `${admin}@example.com`, emailVerified: true })).membership.role).toBe('member');
    });

    it('tells listeners about a change after it is kept, and survives a listener that throws', async () => {
      const { orgs } = await setup();
      const seen: OrganizationChange[] = [];
      orgs.onChange(() => {
        throw new Error('a careless listener');
      });
      const stop = orgs.onChange((change) => void seen.push(change));
      const owner = user('owner');
      const { organization } = await orgs.create(as(owner), { name: `Events ${run()}` });
      const id = organization.id;
      const invitee = user('ivy');
      const { token } = await orgs.invite(as(owner), id, { email: 'ivy@example.com' });
      await orgs.acceptInvitation(as(invitee), { token, email: 'ivy@example.com', emailVerified: true });
      await orgs.changeRole(as(owner), id, invitee, 'admin');
      await orgs.removeMember(as(owner), id, invitee);
      await expect(orgs.leave(as(owner), id)).rejects.toMatchObject(code('organizations/last-owner'));
      await orgs.update(as(owner), id, { name: 'Renamed' });
      stop();
      await orgs.delete(as(owner), id);
      expect(seen).toEqual([
        { type: 'organization.created', organizationId: id },
        { type: 'member.added', organizationId: id, userId: owner },
        { type: 'member.added', organizationId: id, userId: invitee },
        { type: 'member.role-changed', organizationId: id, userId: invitee },
        { type: 'member.removed', organizationId: id, userId: invitee },
        { type: 'organization.updated', organizationId: id },
      ]);
    });

    it('keeps all of a transaction or none of it', async () => {
      const { store, orgs } = await setup();
      const owner = user('owner');
      const slug = `kept-or-not-${run()}`;
      await expect(
        store.transaction(as(owner), async () => {
          const organization = await store.createOrganization(as(owner), { name: 'Half made', slug });
          await store.putMembership(as(owner), { organizationId: organization.id, userId: owner, role: 'owner', email: null, name: null, invitedBy: null });
          throw new Error('something failed after both writes');
        }),
      ).rejects.toThrow('something failed after both writes');
      expect(await orgs.listMine(as(owner))).toEqual([]);
      // The slug was never taken
      expect((await orgs.create(as(owner), { name: 'Made', slug })).organization.slug).toBe(slug);
      // A taken slug inside a transaction leaves the transaction usable
      const both = await store.transaction(as(owner), async () => {
        await expect(store.createOrganization(as(owner), { name: 'Clash', slug })).rejects.toMatchObject(code('organizations/slug-taken'));
        return store.createOrganization(as(owner), { name: 'After the clash', slug: `${slug}-2` });
      });
      expect(both.slug).toBe(`${slug}-2`);
    });
  });
}

/** Whichever of the two is still a member after a round in which one of them may have left. */
function outsiderOf(outcomes: PromiseSettledResult<unknown>[], first: string, second: string): string {
  // The first move is `first`'s, the second `second`'s. If first's leaving succeeded, ask as second.
  return outcomes[0]?.status === 'fulfilled' ? second : first;
}
