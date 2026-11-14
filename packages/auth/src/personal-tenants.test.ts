import { describe, expect, it } from 'vitest';
import { claimsReservedTenant, createContext, isPersonalTenant, isReservedTenantId, parsePersonalTenant, personalTenantId } from '@mariachi/core';
import { JWTAdapter } from './adapters/jwt';
import { createAuthMiddleware } from './middleware';
import { withPersonalTenants } from './personal-tenants';
import type { AuthenticationAdapter, ResolvedIdentity } from './types';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child() { return silent; } };
const identity = (over: Partial<ResolvedIdentity> = {}): ResolvedIdentity => ({ userId: 'u1', tenantId: '', scopes: [], identityType: 'session', ...over });

class FakeProvider {
  readonly name = 'fake';
  constructor(private readonly result: ResolvedIdentity) {}
  async verify(token: string): Promise<ResolvedIdentity> {
    if (token !== 'good') throw new Error('bad token');
    return this.result;
  }
  describe(): string {
    return `provider ${this.name}`;
  }
}
const wrap = (result: ResolvedIdentity, namespace = 'main') => withPersonalTenants(new FakeProvider(result), { namespace });

describe('personal tenant ids', () => {
  it('are user:<namespace>:<userId>', () => {
    expect(personalTenantId('main', 'u1')).toBe('user:main:u1');
    expect(parsePersonalTenant('user:main:u1')).toEqual({ namespace: 'main', userId: 'u1' });
    // A user id may hold anything, colons included; the namespace can't, so the split is unambiguous.
    expect(parsePersonalTenant(personalTenantId('auth0', 'google-oauth2|a:b'))).toEqual({ namespace: 'auth0', userId: 'google-oauth2|a:b' });
    expect(isPersonalTenant('user:main:u1')).toBe(true);
  });

  it('are namespaced, so the same user id from two issuers is two tenants', () => {
    expect(personalTenantId('workos', 'u1')).not.toBe(personalTenantId('auth0', 'u1'));
  });

  it('refuse a namespace that could blur the split, and an empty user', () => {
    for (const bad of ['', 'Main', 'a:b', 'has space', '-lead', 'x'.repeat(33)]) {
      expect(() => personalTenantId(bad, 'u1'), bad).toThrow(expect.objectContaining({ code: 'tenancy/invalid-namespace' }));
    }
    expect(() => personalTenantId('main', '')).toThrow(expect.objectContaining({ code: 'tenancy/invalid-user' }));
  });

  it('are told apart from organization ids, while every user: id is reserved', () => {
    for (const other of ['org_1', 'user', '', null, undefined, 'USER:main:u1', ' user:main:u1']) {
      expect(isPersonalTenant(other), String(other)).toBe(false);
      expect(isReservedTenantId(other), String(other)).toBe(false);
    }
    for (const malformed of ['user:', 'user:u1', 'user:main:', 'user:Bad:u1']) {
      expect(isPersonalTenant(malformed), malformed).toBe(false);
      expect(isReservedTenantId(malformed), malformed).toBe(true);
    }
    expect(claimsReservedTenant({ tenantId: 'user:main:u1' })).toBe(true);
    expect(claimsReservedTenant({ tenantId: 'user:main:u1', personalTenant: true })).toBe(false);
    expect(claimsReservedTenant({ tenantId: 'org_1' })).toBe(false);
  });
});

describe('withPersonalTenants', () => {
  it('gives a person with no organization their own tenant, and leaves the rest of the identity alone', async () => {
    const verifier = wrap(identity({ scopes: ['read'], roles: ['authenticated'], sessionId: 's1', claims: { email: 'a@b.c' } }));
    expect(await verifier.verify('good')).toEqual({
      userId: 'u1',
      tenantId: 'user:main:u1',
      personalTenant: true,
      scopes: ['read'],
      roles: ['authenticated'],
      identityType: 'session',
      sessionId: 's1',
      claims: { email: 'a@b.c' },
    });
  });

  it("only when the tenant is absent: an organization's tenant passes through unchanged", async () => {
    const result = await wrap(identity({ tenantId: 'org_1' })).verify('good');
    expect(result).toEqual(identity({ tenantId: 'org_1' }));
    expect(result.personalTenant).toBeUndefined();
  });

  it('only for a person: an API key, a service or a webhook with no tenant keeps none', async () => {
    for (const identityType of ['api-key', 'service', 'webhook'] as const) {
      const result = await wrap(identity({ identityType })).verify('good');
      expect(result.tenantId, identityType).toBe('');
      expect(result.personalTenant, identityType).toBeUndefined();
    }
  });

  it('by issuer as well as user: the same user id under two namespaces is two tenants', async () => {
    const a = await wrap(identity(), 'workos').verify('good');
    const b = await wrap(identity(), 'auth0').verify('good');
    expect(a.tenantId).toBe('user:workos:u1');
    expect(b.tenantId).toBe('user:auth0:u1');
  });

  it("never from a claim: a tenant that already starts with user: is refused", async () => {
    for (const forged of ['user:main:alice', 'user:other:alice', 'user:alice', 'user:']) {
      await expect(wrap(identity({ userId: 'mallory', tenantId: forged })).verify('good'), forged).rejects.toMatchObject({ code: 'auth/invalid-token', message: expect.stringContaining('reserved') });
    }
    // Not even a verifier that sets the flag itself gets one through the wrapper.
    await expect(wrap(identity({ userId: 'mallory', tenantId: 'user:main:alice', personalTenant: true })).verify('good')).rejects.toMatchObject({ code: 'auth/invalid-token' });
  });

  it("still fails when the token does, and keeps the verifier's other members", async () => {
    const verifier = wrap(identity());
    await expect(verifier.verify('bad')).rejects.toThrow('bad token');
    expect(verifier.name).toBe('fake');
    expect(verifier.describe()).toBe('provider fake');
    expect(verifier).toBeInstanceOf(FakeProvider);
    await expect(wrap(identity({ userId: '' })).verify('good')).rejects.toMatchObject({ code: 'auth/invalid-token' });
  });

  it('refuses a bad namespace when it is wired, not at the first sign-in', () => {
    expect(() => withPersonalTenants(new FakeProvider(identity()), { namespace: 'Not Valid' })).toThrow(expect.objectContaining({ code: 'tenancy/invalid-namespace' }));
  });
});

describe('a reserved tenant in a token, with the mode off', () => {
  const secret = 'x'.repeat(40);

  it('JWTAdapter refuses to verify or sign one', async () => {
    const adapter = new JWTAdapter({ secret });
    await expect(adapter.sign({ userId: 'mallory', tenantId: 'user:main:alice', scopes: [] })).rejects.toMatchObject({ code: 'auth/reserved-tenant' });
    // A token signed elsewhere with the same secret:
    const jwt = (await import('jsonwebtoken')).default;
    const forged = jwt.sign({ userId: 'mallory', tenantId: 'user:main:alice', scopes: [] }, secret, { algorithm: 'HS256', expiresIn: '5m' });
    await expect(adapter.verify(forged)).rejects.toMatchObject({ code: 'auth/invalid-token', message: expect.stringContaining('reserved') });
  });

  it('the auth middleware refuses one from any verifier, and lets a given personal tenant through', async () => {
    const verifier = (result: ResolvedIdentity) => ({ verify: async () => result, sign: async () => '' }) as AuthenticationAdapter;
    const run = async (result: ResolvedIdentity) => {
      const ctx = createContext({ logger: silent });
      (ctx as { token?: string }).token = 't';
      await createAuthMiddleware(verifier(result))(ctx, async () => undefined);
      return ctx;
    };
    await expect(run(identity({ userId: 'mallory', tenantId: 'user:main:alice' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    expect((await run(identity({ tenantId: 'user:main:u1', personalTenant: true }))).tenantId).toBe('user:main:u1');
    expect((await run(identity({ tenantId: 'org_1' }))).tenantId).toBe('org_1');
  });
});

describe('JWTAdapter without a tenant', () => {
  const secret = 'x'.repeat(40);

  it('refuses a token with no tenant unless told otherwise', async () => {
    const strict = new JWTAdapter({ secret });
    const lenient = new JWTAdapter({ secret, requireTenant: false });
    const token = await lenient.sign({ userId: 'u1', tenantId: '', scopes: ['read'] });
    await expect(strict.verify(token)).rejects.toMatchObject({ code: 'auth/invalid-token' });
    expect(await lenient.verify(token)).toMatchObject({ userId: 'u1', tenantId: '', scopes: ['read'] });
    expect(await withPersonalTenants(lenient, { namespace: 'main' }).verify(token)).toMatchObject({ userId: 'u1', tenantId: 'user:main:u1', personalTenant: true });
  });

  it('keeps an organization tenant, and still signs through the wrapper', async () => {
    const adapter = withPersonalTenants(new JWTAdapter({ secret, requireTenant: false }), { namespace: 'main' });
    const token = await adapter.sign({ userId: 'u1', tenantId: 'org_1', scopes: [] });
    expect((await adapter.verify(token)).tenantId).toBe('org_1');
  });
});
