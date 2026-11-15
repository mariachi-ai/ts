import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { BaseController, bearerStrategy, createApiServer } from '@mariachi/api-facade';
import { withPersonalTenants, withUserNamespace, type ResolvedIdentity } from '@mariachi/auth';
import { createCommunication } from '@mariachi/communication';
import { AuthError, isPersonalTenant } from '@mariachi/core';
import { MemoryRateLimiter } from '@mariachi/rate-limit';
import { createOrganizationAccess } from '../access';
import { MemoryOrganizationStore } from '../memory';
import { DefaultOrganizations } from '../organizations';
import { ORGANIZATION_PROCEDURES, registerOrganizationProcedures, type OrganizationProcedureOptions } from '../procedures';
import type { Invitation } from '../types';
import { OrganizationsController, organizationStrategy } from './index';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child: () => silent };

/** A token is `<kind>:<user>[:<token's own organization>]`; the verifier answers with claims as a provider would. */
const verifier = {
  async verify(token: string): Promise<ResolvedIdentity> {
    const [kind, userId, organization] = token.split(':');
    if (kind === 'user' && userId) {
      return { userId, tenantId: organization ?? '', scopes: [], identityType: 'session', roles: ['authenticated'], claims: { email: `${userId}@example.com`, email_verified: true, name: userId.toUpperCase() } };
    }
    if (kind === 'unverified' && userId) return { userId, tenantId: '', scopes: [], identityType: 'session', claims: { email: `${userId}@example.com`, email_verified: false } };
    if (kind === 'key' && userId) return { userId, tenantId: 't-key', scopes: [], identityType: 'api-key', claims: { email: `${userId}@example.com`, email_verified: true } };
    throw new AuthError('auth/invalid-token', 'bad token');
  },
};

/** A route of the app's own, in whatever tenant the request ends up in. */
class NotesController extends BaseController {
  readonly prefix = 'notes';
  init() {
    this.get('', { schema: { response: z.object({ tenantId: z.string().nullable(), userId: z.string().nullable(), roles: z.array(z.string()) }) } }, async (ctx) => ({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      roles: ctx.identity?.roles ?? [],
    }));
  }
}

function app(options: { personalTenants?: boolean; source?: 'module' | 'token'; procedures?: OrganizationProcedureOptions; namespace?: string } = {}) {
  const organizations = new DefaultOrganizations({ store: new MemoryOrganizationStore() }, { logger: silent });
  const access = createOrganizationAccess({ organizations, source: options.source });
  const communication = createCommunication({}, { logger: silent });
  registerOrganizationProcedures(communication, organizations, options.procedures);
  let verify: typeof verifier = verifier;
  if (options.namespace) verify = withUserNamespace(verify, options.namespace);
  if (options.personalTenants) verify = withPersonalTenants(verify, { namespace: 'main' });
  const api = createApiServer({ name: 'test', logger: silent, prefix: '/api' })
    .withAuthStrategy('session', organizationStrategy(bearerStrategy(verify), access))
    .withAuth('session')
    .registerController(new OrganizationsController(communication))
    .registerController(new NotesController(communication));
  const call = async (token: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', url: string, payload?: unknown, headers: Record<string, string> = {}) => {
    const response = await api.inject({ method, url: `/api${url}`, headers: { authorization: `Bearer ${token}`, ...headers }, ...(payload === undefined ? {} : { payload }) });
    return { status: response.statusCode, body: response.json<Record<string, any>>() };
  };
  return { api, call, organizations, communication };
}

describe('organizations over HTTP', () => {
  it('registers every procedure the controller calls', () => {
    const { communication } = app();
    expect(ORGANIZATION_PROCEDURES.filter((name) => !communication.has(name))).toEqual([]);
  });

  it('takes a user with no tenant from nothing to a working organization', async () => {
    const { call } = app();
    // In no tenant, the app's own routes are closed and the organization routes are open
    expect((await call('user:ada', 'GET', '/notes')).body.error.code).toBe('tenancy/missing-tenant');
    expect((await call('user:ada', 'GET', '/organizations')).body).toEqual([]);

    const created = await call('user:ada', 'POST', '/organizations', { name: 'Acme Rockets' });
    expect(created.status).toBe(201);
    const id = created.body.organization.id as string;
    // The owner's address and name are the ones the verified token states
    expect(created.body).toMatchObject({ organization: { name: 'Acme Rockets', slug: 'acme-rockets', status: 'active' }, membership: { userId: 'ada', role: 'owner', email: 'ada@example.com', name: 'ADA' } });
    expect((await call('user:ada', 'GET', '/organizations')).body).toMatchObject([{ organization: { id }, role: 'owner' }]);

    // Naming it makes it the tenant, with the role on the identity
    const inside = await call('user:ada', 'GET', '/notes', undefined, { 'x-organization-id': id });
    expect(inside).toEqual({ status: 200, body: { tenantId: id, userId: 'ada', roles: ['authenticated', 'owner'] } });
    // Naming none still chooses none
    expect((await call('user:ada', 'GET', '/notes')).status).toBe(400);
  });

  it('lets nobody into an organization they are not in, whatever they send', async () => {
    const { call } = app();
    const id = (await call('user:ada', 'POST', '/organizations', { name: 'Acme' })).body.organization.id as string;
    const refused = { status: 404, code: 'organizations/not-found', message: 'Organization not found' };
    const answers: unknown[] = [];
    for (const requested of [id, crypto.randomUUID(), 'not-an-id', 'user.main.ada']) {
      const response = await call('user:mallory', 'GET', '/notes', undefined, { 'x-organization-id': requested });
      answers.push({ status: response.status, code: response.body.error.code, message: response.body.error.message });
    }
    expect(answers).toEqual([refused, refused, refused, refused]);
    // The organization's own routes say the same of one that exists and one that doesn't
    expect((await call('user:mallory', 'GET', `/organizations/${id}`)).body.error).toMatchObject({ code: 'organizations/not-found' });
    expect((await call('user:mallory', 'GET', `/organizations/${crypto.randomUUID()}`)).body.error).toMatchObject({ code: 'organizations/not-found' });
    expect((await call('user:mallory', 'GET', `/organizations/${id}/members`)).status).toBe(404);
    // The tenant header is no way round it
    expect((await call('user:mallory', 'GET', '/notes', undefined, { 'x-tenant-id': id })).status).toBe(400);
    // A token that names one organization and a request that names another is refused, not quietly resolved
    const other = (await call('user:mallory', 'POST', '/organizations', { name: 'Other' })).body.organization.id as string;
    expect((await call(`user:mallory:${other}`, 'GET', '/notes', undefined, { 'x-organization-id': id })).body.error.code).toBe('tenancy/mismatch');
  });

  it('invites, accepts, changes roles and removes, through the endpoints', async () => {
    const { call } = app();
    const id = (await call('user:ada', 'POST', '/organizations', { name: 'Acme' })).body.organization.id as string;
    const invited = await call('user:ada', 'POST', `/organizations/${id}/invitations`, { email: 'ben@example.com', role: 'admin' });
    expect(invited.status).toBe(201);
    expect(invited.body.invitation).toMatchObject({ email: 'ben@example.com', role: 'admin', invitedBy: 'ada' });
    const token = invited.body.token as string;
    expect((await call('user:ada', 'GET', `/organizations/${id}/invitations`)).body).toMatchObject([{ email: 'ben@example.com', status: 'pending' }]);

    // The invitee is in no tenant when they accept
    const accepted = await call('user:ben', 'POST', '/organizations/invitations/accept', { token, name: 'Ben' });
    expect(accepted).toMatchObject({ status: 200, body: { organization: { id }, membership: { userId: 'ben', role: 'admin', email: 'ben@example.com', name: 'Ben' } } });
    expect((await call('user:ben', 'GET', '/notes', undefined, { 'x-organization-id': id })).body.roles).toEqual(['authenticated', 'admin']);
    expect((await call('user:ben', 'GET', `/organizations/${id}/members?pageSize=1`)).body).toMatchObject({ total: 2, pageSize: 1, data: [{ userId: 'ada', role: 'owner' }] });

    // An admin can't touch the owner; the owner can do both
    expect((await call('user:ben', 'PATCH', `/organizations/${id}/members/ada`, { role: 'member' })).body.error.code).toBe('organizations/forbidden');
    expect((await call('user:ada', 'PATCH', `/organizations/${id}/members/ben`, { role: 'member' })).body.role).toBe('member');
    expect((await call('user:ben', 'GET', '/notes', undefined, { 'x-organization-id': id })).body.roles).toEqual(['authenticated', 'member']);
    expect((await call('user:ben', 'POST', `/organizations/${id}/invitations`, { email: 'cy@example.com' })).status).toBe(403);
    expect((await call('user:ada', 'PATCH', `/organizations/${id}/members/ben`, { role: 'emperor' })).status).toBe(400);

    // Removed: out on the next request, though the token is as valid as before
    expect((await call('user:ada', 'DELETE', `/organizations/${id}/members/ben`)).body).toEqual({ ok: true });
    expect((await call('user:ben', 'GET', '/notes', undefined, { 'x-organization-id': id })).status).toBe(404);
    expect((await call('user:ada', 'POST', `/organizations/${id}/leave`)).body.error.code).toBe('organizations/last-owner');
  });

  it('reads the invitee\'s address from their verified identity: a body cannot supply it', async () => {
    const { call } = app();
    const id = (await call('user:ada', 'POST', '/organizations', { name: 'Acme' })).body.organization.id as string;
    const token = (await call('user:ada', 'POST', `/organizations/${id}/invitations`, { email: 'ben@example.com' })).body.token as string;
    // Mallory holds the link and says she is ben: the body has no such field to say it in
    const smuggled = await call('user:mallory', 'POST', '/organizations/invitations/accept', { token, email: 'ben@example.com', emailVerified: true });
    expect(smuggled.status).toBe(400);
    expect((await call('user:mallory', 'POST', '/organizations/invitations/accept', { token })).body.error.code).toBe('organizations/email-mismatch');
    // ben himself, before his address is verified, and through an API key issued to him
    expect((await call('unverified:ben', 'POST', '/organizations/invitations/accept', { token })).body.error.code).toBe('organizations/email-unverified');
    expect((await call('key:ben', 'POST', '/organizations/invitations/accept', { token })).body.error.code).toBe('organizations/user-required');
    expect((await call('user:mallory', 'GET', '/notes', undefined, { 'x-organization-id': id })).status).toBe(404);
    expect((await call('user:ben', 'POST', '/organizations/invitations/accept', { token })).status).toBe(200);
  });

  it('closes a suspended organization to everyone, and leaves its owner able to open it again', async () => {
    const { call } = app();
    const id = (await call('user:ada', 'POST', '/organizations', { name: 'Acme' })).body.organization.id as string;
    const token = (await call('user:ada', 'POST', `/organizations/${id}/invitations`, { email: 'ben@example.com' })).body.token as string;
    await call('user:ben', 'POST', '/organizations/invitations/accept', { token });
    expect((await call('user:ada', 'POST', `/organizations/${id}/suspend`)).body.status).toBe('suspended');

    for (const who of ['user:ada', 'user:ben']) {
      const inside = await call(who, 'GET', '/notes', undefined, { 'x-organization-id': id });
      expect([inside.status, inside.body.error.code], who).toEqual([403, 'tenancy/suspended']);
    }
    // The owner still reaches it by its own routes, which don't run inside it
    expect((await call('user:ada', 'GET', `/organizations/${id}`)).body.status).toBe('suspended');
    expect((await call('user:ben', 'POST', `/organizations/${id}/reactivate`)).status).toBe(403);
    expect((await call('user:ada', 'POST', `/organizations/${id}/reactivate`)).body.status).toBe('active');
    expect((await call('user:ben', 'GET', '/notes', undefined, { 'x-organization-id': id })).status).toBe(200);

    expect((await call('user:ada', 'DELETE', `/organizations/${id}`)).body).toEqual({ ok: true });
    expect((await call('user:ada', 'GET', `/organizations/${id}`)).status).toBe(404);
    expect((await call('user:ada', 'GET', '/organizations')).body).toEqual([]);
  });

  it('puts someone who names no organization in their personal tenant, as its owner, when personal tenants are on', async () => {
    const { call } = app({ personalTenants: true });
    const mine = await call('user:ada', 'GET', '/notes');
    expect(mine.status).toBe(200);
    expect(isPersonalTenant(mine.body.tenantId)).toBe(true);
    expect(mine.body.roles).toEqual(['authenticated', 'owner']);
    const id = (await call('user:ada', 'POST', '/organizations', { name: 'Acme' })).body.organization.id as string;
    expect((await call('user:ada', 'GET', '/notes', undefined, { 'x-organization-id': id })).body.tenantId).toBe(id);
    // The organization did not replace the personal tenant
    expect((await call('user:ada', 'GET', '/notes')).body.tenantId).toBe(mine.body.tenantId);
    // Someone else's personal tenant is not an organization to be named
    expect((await call('user:mallory', 'GET', '/notes', undefined, { 'x-organization-id': mine.body.tenantId })).status).toBe(404);
  });

  it('keeps users of two identity providers apart when each verifier has a namespace', async () => {
    const { call } = app({ namespace: 'workos' });
    const created = await call('user:ada', 'POST', '/organizations', { name: 'Acme' });
    expect(created.body.membership.userId).toBe('workos.ada');
    expect((await call('user:ada', 'GET', '/notes', undefined, { 'x-organization-id': created.body.organization.id })).body.userId).toBe('workos.ada');
  });

  it('with the token as the source of memberships, runs in the token\'s organization and reads nothing here', async () => {
    const { call } = app({ source: 'token' });
    const fromProvider = crypto.randomUUID();
    expect((await call(`user:ada:${fromProvider}`, 'GET', '/notes')).body).toEqual({ tenantId: fromProvider, userId: 'ada', roles: ['authenticated'] });
    expect((await call(`user:ada:${fromProvider}`, 'GET', '/notes', undefined, { 'x-organization-id': fromProvider })).status).toBe(200);
    expect((await call(`user:ada:${fromProvider}`, 'GET', '/notes', undefined, { 'x-organization-id': crypto.randomUUID() })).body.error.code).toBe('tenancy/mismatch');
    // A header that names an organization the token doesn't is refused, not run somewhere else
    expect((await call('user:ada', 'GET', '/notes', undefined, { 'x-organization-id': fromProvider })).body.error.code).toBe('tenancy/mismatch');
  });

  it('sends an invitation through the app\'s delivery when there is one, and then keeps the token from the inviter', async () => {
    const sent: Array<{ to: string; token: string; organization: string }> = [];
    const { call } = app({
      procedures: {
        deliverInvitation: async (_ctx, { organization, invitation, token }: { organization: { name: string }; invitation: Invitation; token: string }) => {
          sent.push({ to: invitation.email, token, organization: organization.name });
        },
      },
    });
    const id = (await call('user:ada', 'POST', '/organizations', { name: 'Acme' })).body.organization.id as string;
    const invited = await call('user:ada', 'POST', `/organizations/${id}/invitations`, { email: 'ben@example.com' });
    expect(invited.body.token).toBeUndefined();
    expect(sent).toMatchObject([{ to: 'ben@example.com', organization: 'Acme' }]);
    const resent = await call('user:ada', 'POST', `/organizations/${id}/invitations/${invited.body.invitation.id}/resend`);
    expect(resent.body.token).toBeUndefined();
    expect(sent).toHaveLength(2);
    // The first link died with the resend; the second works
    expect((await call('user:ben', 'POST', '/organizations/invitations/accept', { token: sent[0]?.token })).body.error.code).toBe('organizations/invitation-invalid');
    expect((await call('user:ben', 'POST', '/organizations/invitations/accept', { token: sent[1]?.token })).status).toBe(200);
    expect((await call('user:ada', 'DELETE', `/organizations/${id}/invitations/${invited.body.invitation.id}`)).body.error.code).toBe('organizations/invitation-not-found');
  });

  it('limits creating, inviting and accepting when given a limiter', async () => {
    const minute = 60_000;
    const { call } = app({
      procedures: {
        limiter: new MemoryRateLimiter(),
        limits: {
          create: { windowMs: minute, maxRequests: 2 },
          invitePerUser: { windowMs: minute, maxRequests: 3 },
          invitePerOrganization: { windowMs: minute, maxRequests: 4 },
          acceptPerUser: { windowMs: minute, maxRequests: 2 },
          acceptPerIp: { windowMs: minute, maxRequests: 4 },
        },
      },
    });
    const id = (await call('user:ada', 'POST', '/organizations', { name: 'One' })).body.organization.id as string;
    expect((await call('user:ada', 'POST', '/organizations', { name: 'Two' })).status).toBe(201);
    const third = await call('user:ada', 'POST', '/organizations', { name: 'Three' });
    expect([third.status, third.body.error.code]).toEqual([429, 'rate-limit/exceeded']);
    // Another user has their own allowance
    expect((await call('user:zoe', 'POST', '/organizations', { name: 'Zoe' })).status).toBe(201);

    // Three invitations from one user, then refused
    const tokens: string[] = [];
    for (const n of [1, 2, 3]) tokens.push((await call('user:ada', 'POST', `/organizations/${id}/invitations`, { email: `invitee${n}@example.com`, role: 'admin' })).body.token);
    expect((await call('user:ada', 'POST', `/organizations/${id}/invitations`, { email: 'invitee4@example.com' })).status).toBe(429);
    // A second admin's own allowance is three, and the organization's is four in all
    expect((await call('user:invitee1', 'POST', '/organizations/invitations/accept', { token: tokens[0] })).status).toBe(200);
    expect((await call('user:invitee1', 'POST', `/organizations/${id}/invitations`, { email: 'more1@example.com' })).status).toBe(201);
    expect((await call('user:invitee1', 'POST', `/organizations/${id}/invitations`, { email: 'more2@example.com' })).status).toBe(429);

    // Guessing at tokens: two tries a user, four from one address (the accepted invitation above was the first)
    const guess = `${crypto.randomUUID()}.${'a'.repeat(43)}`;
    expect((await call('user:mallory', 'POST', '/organizations/invitations/accept', { token: guess })).body.error.code).toBe('organizations/invitation-invalid');
    expect((await call('user:mallory', 'POST', '/organizations/invitations/accept', { token: guess })).status).toBe(400);
    expect((await call('user:mallory', 'POST', '/organizations/invitations/accept', { token: guess })).status).toBe(429);
    // Other accounts from the same address run into the address's limit
    expect((await call('user:m2', 'POST', '/organizations/invitations/accept', { token: guess })).status).toBe(400);
    expect((await call('user:m3', 'POST', '/organizations/invitations/accept', { token: guess })).status).toBe(429);
  });
});
