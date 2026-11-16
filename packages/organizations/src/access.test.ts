import { describe, expect, it } from 'vitest';
import { createContext, markPersonalTenant, personalTenantId } from '@mariachi/core';
import { createOrganizationAccess, type AccessIdentity } from './access';
import { MemoryOrganizationStore } from './memory';
import { DefaultOrganizations } from './organizations';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child: () => silent };
const as = (userId: string) => createContext({ userId, identityType: 'session', logger: silent });
const person = (userId: string, tenantId = '', extra: Partial<AccessIdentity> = {}): AccessIdentity => ({ userId, tenantId, scopes: [], identityType: 'session', ...extra });
const claims = (userId: string, email: string) => Object.assign(as(userId), { identity: { claims: { email, email_verified: true } } });

/** An organization owned by `ada`, with `ben` a member, and two services on one store: two processes of one app. */
async function setup(config: { source?: 'module' | 'token'; cacheTtlMs?: number } = {}) {
  const store = new MemoryOrganizationStore();
  let reads = 0;
  const counting = new Proxy(store, {
    get(target, key) {
      const value = Reflect.get(target, key);
      if (key === 'getMembership') {
        return (...args: unknown[]) => {
          reads += 1;
          return (value as (...a: unknown[]) => unknown).apply(target, args);
        };
      }
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
  let now = 1_000_000;
  const orgs = new DefaultOrganizations({ store: counting }, { logger: silent });
  const access = createOrganizationAccess({ organizations: orgs, now: () => now, ...config });
  const elsewhere = new DefaultOrganizations({ store: counting }, { logger: silent });
  const { organization } = await orgs.create(as('ada'), { name: 'Acme' });
  const { token } = await orgs.invite(as('ada'), organization.id, { email: 'ben@example.com' });
  await orgs.acceptInvitation(claims('ben', 'ben@example.com'), { token });
  reads = 0;
  const tick = (ms: number): void => {
    now += ms;
  };
  return { orgs, elsewhere, access, id: organization.id, reads: () => reads, tick };
}

describe('OrganizationAccess', () => {
  it('makes the named organization the tenant once the membership is found, and adds the role', async () => {
    const { access, id } = await setup();
    expect(await access.resolve(person('ben'), id)).toEqual({ userId: 'ben', tenantId: id, scopes: [], identityType: 'session', roles: ['member'] });
    expect((await access.resolve(person('ada', '', { roles: ['authenticated'] }), `  ${id} `)).roles).toEqual(['authenticated', 'owner']);
  });

  it('takes no organization role from the token: only the membership says who is an admin or an owner', async () => {
    const { access, id } = await setup();
    // A provider's own "admin" or "owner" role says nothing about this organization
    const resolved = await access.resolve(person('ben', '', { roles: ['owner', 'admin', 'authenticated', 'billing'], scopes: ['admin', 'notes:read', 'owner', 'member'] }), id);
    expect(resolved.roles).toEqual(['authenticated', 'billing', 'member']);
    // Nor as a scope, for a verifier that copies a provider's roles into scopes
    expect(resolved.scopes).toEqual(['notes:read']);
    const personal = await access.resolve(markPersonalTenant(person('ben', personalTenantId('main', 'ben'), { scopes: ['admin', 'notes:read'] })));
    expect(personal.scopes).toEqual(['notes:read']);
  });

  it('gives one refusal to a non-member, an unknown organization and anything that is not an id', async () => {
    const { access, id } = await setup();
    const refusals = new Set<string>();
    for (const [who, requested] of [
      ['mallory', id],
      ['ben', crypto.randomUUID()],
      ['ben', 'not-an-id'],
      ['ben', personalTenantId('main', 'ada')],
      ['ben', "x' or '1'='1"],
    ] as const) {
      const error = await access.resolve(person(who), requested).then(
        () => undefined,
        (e) => e as { code: string; message: string; metadata?: unknown },
      );
      refusals.add(JSON.stringify({ code: error?.code, message: error?.message, metadata: error?.metadata }));
    }
    expect([...refusals]).toEqual([JSON.stringify({ code: 'organizations/not-found', message: 'Organization not found' })]);
  });

  it('never chooses an organization for a request that names none', async () => {
    const { access, orgs, id } = await setup();
    await orgs.create(as('ben'), { name: 'Second' });
    // ben is in two organizations and named neither: he is placed in neither
    expect(await access.resolve(person('ben'))).toEqual(person('ben'));
    expect(await access.resolve(person('ben'), '   ')).toEqual(person('ben'));
    // With personal tenants on, that is where he is, as its owner
    const personal = markPersonalTenant(person('ben', personalTenantId('main', 'ben'), { roles: ['admin'] }));
    const resolved = await access.resolve(personal);
    expect(resolved.tenantId).toBe(personalTenantId('main', 'ben'));
    expect(resolved.roles).toEqual(['owner']);
    // A personal tenant id that came from a token's claim, not from withPersonalTenants, earns nothing
    expect((await access.resolve(person('ben', personalTenantId('main', 'ada')))).roles).toBeUndefined();
    expect(id).toBeTruthy();
  });

  it('refuses a suspended organization, and lets it back in when it is reactivated', async () => {
    const { access, orgs, id } = await setup();
    await orgs.suspend(as('ada'), id);
    await expect(access.resolve(person('ben'), id)).rejects.toMatchObject({ code: 'tenancy/suspended' });
    await expect(access.resolve(person('ada'), id)).rejects.toMatchObject({ code: 'tenancy/suspended' });
    await orgs.reactivate(as('ada'), id);
    expect((await access.resolve(person('ben'), id)).tenantId).toBe(id);
    await orgs.delete(as('ada'), id);
    await expect(access.resolve(person('ada'), id)).rejects.toMatchObject({ code: 'organizations/not-found' });
  });

  it('refuses a request that names a different organization from the token, in either mode', async () => {
    const other = crypto.randomUUID();
    for (const source of ['module', 'token'] as const) {
      const { access, id } = await setup({ source });
      await expect(access.resolve(person('ben', other), id), source).rejects.toMatchObject({ code: 'tenancy/mismatch' });
    }
  });

  it('with the token as the source, takes the token\'s organization and never reads the module', async () => {
    const { access, id, reads } = await setup({ source: 'token' });
    const fromProvider = person('zed', id, { roles: ['admin'] });
    expect(await access.resolve(fromProvider)).toBe(fromProvider);
    expect(await access.resolve(fromProvider, id)).toBe(fromProvider);
    // A request that names an organization the token doesn't is refused: passed through, it would run in the
    // identity's own tenant while the client believed it was in the named one
    await expect(access.resolve(person('zed'), id)).rejects.toMatchObject({ code: 'tenancy/mismatch' });
    const personal = markPersonalTenant(person('zed', personalTenantId('main', 'zed')));
    await expect(access.resolve(personal, id)).rejects.toMatchObject({ code: 'tenancy/mismatch' });
    expect(await access.resolve(personal)).toBe(personal);
    expect(reads()).toBe(0);
  });

  it('with the module as the source, confirms an organization the token names like any other', async () => {
    const { access, id } = await setup();
    expect((await access.resolve(person('ben', id, { roles: ['owner'] }))).roles).toEqual(['member']);
    await expect(access.resolve(person('mallory', id, { roles: ['owner'] }))).rejects.toMatchObject({ code: 'organizations/not-found' });
  });

  it('leaves an API key or a service in the tenant its credential was issued for', async () => {
    const { access, id, reads } = await setup();
    for (const identityType of ['api-key', 'service', 'webhook']) {
      const identity = { ...person('ben', 't-key'), identityType };
      expect(await access.resolve(identity, id), identityType).toBe(identity);
    }
    expect(reads()).toBe(0);
  });

  it('trusts a lookup for five seconds, and forgets it at once when this process changes the membership', async () => {
    const { access, orgs, id, reads, tick } = await setup();
    await access.resolve(person('ben'), id);
    await access.resolve(person('ben'), id);
    expect(reads()).toBe(1);
    tick(4_999);
    await access.resolve(person('ben'), id);
    expect(reads()).toBe(1);
    tick(2);
    await access.resolve(person('ben'), id);
    expect(reads()).toBe(2);

    // Removed here: refused on the very next request
    await orgs.removeMember(as('ada'), id, 'ben');
    await expect(access.resolve(person('ben'), id)).rejects.toMatchObject({ code: 'organizations/not-found' });
    // A role change here shows at once too
    await access.resolve(person('ada'), id);
    const { token } = await orgs.invite(as('ada'), id, { email: 'ben@example.com', role: 'admin' });
    await orgs.acceptInvitation(claims('ben', 'ben@example.com'), { token });
    expect((await access.resolve(person('ben'), id)).roles).toEqual(['admin']);
    await orgs.changeRole(as('ada'), id, 'ben', 'member');
    expect((await access.resolve(person('ben'), id)).roles).toEqual(['member']);
  });

  it('sees a removal made by another process within the five seconds, not at once', async () => {
    const { access, elsewhere, id, tick } = await setup();
    await access.resolve(person('ben'), id);
    await elsewhere.removeMember(as('ada'), id, 'ben');
    // Still let in, on the strength of the lookup a moment ago
    expect((await access.resolve(person('ben'), id)).tenantId).toBe(id);
    tick(5_001);
    await expect(access.resolve(person('ben'), id)).rejects.toMatchObject({ code: 'organizations/not-found' });
  });

  it('looks every time when told to trust nothing, and stops listening when disposed', async () => {
    const { access, id, reads } = await setup({ cacheTtlMs: 0 });
    await access.resolve(person('ben'), id);
    await access.resolve(person('ben'), id);
    expect(reads()).toBe(2);
    access.dispose();
    access.forget();
  });
});
