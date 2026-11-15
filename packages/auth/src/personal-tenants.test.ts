import { describe, expect, it } from 'vitest';
import { claimsReservedTenant, createContext, isPersonalTenant, isReservedTenantId, markPersonalTenant, parsePersonalTenant, personalTenantId } from '@mariachi/core';
import { JWTAdapter } from './adapters/jwt';
import { createAuthMiddleware } from './middleware';
import { withPersonalTenants } from './personal-tenants';
import { InMemorySessionStore, SessionManager } from './sessions';
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
  it('are user.<namespace>.<userId>', () => {
    expect(personalTenantId('main', 'u1')).toBe('user.main.u1');
    expect(parsePersonalTenant('user.main.u1')).toEqual({ namespace: 'main', userId: 'u1' });
    expect(isPersonalTenant('user.main.u1')).toBe(true);
    expect(personalTenantId('main', '6f1d2c3e-0000-4000-8000-000000000001')).toBe('user.main.6f1d2c3e-0000-4000-8000-000000000001');
  });

  it("hold no colon or slash, whatever a provider's user ids look like", () => {
    for (const userId of ['google-oauth2|1234', 'urn:example:user:42', 'a/b', 'name with space', 'dotted.id', 'ünï']) {
      const id = personalTenantId('auth0', userId);
      expect(id, userId).not.toMatch(/[:/\s|]/);
      expect(parsePersonalTenant(id), userId).toEqual({ namespace: 'auth0', userId });
    }
  });

  it('are namespaced, so the same user id from two issuers is two tenants', () => {
    expect(personalTenantId('workos', 'u1')).not.toBe(personalTenantId('auth0', 'u1'));
  });

  it('refuse a namespace that could blur the split, and an empty user', () => {
    for (const bad of ['', 'Main', 'a.b', 'a:b', 'has space', '-lead', 'x'.repeat(33)]) {
      expect(() => personalTenantId(bad, 'u1'), bad).toThrow(expect.objectContaining({ code: 'tenancy/invalid-namespace' }));
    }
    expect(() => personalTenantId('main', '')).toThrow(expect.objectContaining({ code: 'tenancy/invalid-user' }));
  });

  it('are told apart from organization ids, while every user. id is reserved', () => {
    for (const other of ['org_1', 'user', 'users.main.u1', 'user:main:u1', '', null, undefined, 'USER.main.u1', ' user.main.u1']) {
      expect(isPersonalTenant(other), String(other)).toBe(false);
      expect(isReservedTenantId(other), String(other)).toBe(false);
    }
    // Reserved, but not anyone's personal tenant: malformed, or a second spelling of an id.
    for (const malformed of ['user.', 'user.u1', 'user.main.', 'user.Bad.u1', 'user.main.a%3ab', 'user.main.%zz', 'user.main.a:b']) {
      expect(isPersonalTenant(malformed), malformed).toBe(false);
      expect(isReservedTenantId(malformed), malformed).toBe(true);
    }
  });
});

describe('the mark on a given personal tenant', () => {
  it("can't be a plain property, so a verifier that spreads a token's payload doesn't forge it", () => {
    // What a careless custom verifier would return for a token whose payload an attacker wrote:
    const payload = JSON.parse('{"sub":"mallory","tenantId":"user.main.alice","personalTenant":true,"@mariachi/core.personal-tenant":"user.main.alice","Symbol(@mariachi/core.personal-tenant)":"user.main.alice"}');
    const careless = { userId: payload.sub, scopes: [], identityType: 'session', ...payload };
    expect(claimsReservedTenant(careless)).toBe(true);
  });

  it('survives a spread of the identity, and not a change of tenant', () => {
    const given = markPersonalTenant(identity({ tenantId: 'user.main.u1' }));
    expect(claimsReservedTenant(given)).toBe(false);
    const copied = { ...given, scopes: ['read'] };
    expect(claimsReservedTenant(copied)).toBe(false);
    const moved = { ...given, tenantId: 'user.main.alice' };
    expect(claimsReservedTenant(moved)).toBe(true);
    expect(claimsReservedTenant(JSON.parse(JSON.stringify(given)))).toBe(true);
    expect(claimsReservedTenant({ tenantId: 'org_1' })).toBe(false);
    expect(claimsReservedTenant({ tenantId: null })).toBe(false);
  });
});

describe('withPersonalTenants', () => {
  it('gives a person with no organization their own tenant, and leaves the rest of the identity alone', async () => {
    const verifier = wrap(identity({ scopes: ['read'], roles: ['authenticated'], sessionId: 's1', claims: { email: 'a@b.c' } }));
    const result = await verifier.verify('good');
    expect(result).toMatchObject({ userId: 'u1', tenantId: 'user.main.u1', scopes: ['read'], roles: ['authenticated'], identityType: 'session', sessionId: 's1', claims: { email: 'a@b.c' } });
    expect(Object.keys(result).sort()).toEqual(['claims', 'identityType', 'roles', 'scopes', 'sessionId', 'tenantId', 'userId']);
    expect(claimsReservedTenant(result)).toBe(false);
  });

  it("only when the tenant is absent: an organization's tenant passes through unchanged", async () => {
    const original = identity({ tenantId: 'org_1' });
    expect(await wrap(original).verify('good')).toBe(original);
  });

  it('only for a person: an API key, a service or a webhook with no tenant keeps none', async () => {
    for (const identityType of ['api-key', 'service', 'webhook'] as const) {
      expect((await wrap(identity({ identityType })).verify('good')).tenantId, identityType).toBe('');
    }
  });

  it('by issuer as well as user: the same user id under two namespaces is two tenants', async () => {
    expect((await wrap(identity(), 'workos').verify('good')).tenantId).toBe('user.workos.u1');
    expect((await wrap(identity(), 'auth0').verify('good')).tenantId).toBe('user.auth0.u1');
  });

  it('never from a claim: a tenant that already starts with user. is refused', async () => {
    for (const forged of ['user.main.alice', 'user.other.alice', 'user.alice', 'user.']) {
      await expect(wrap(identity({ userId: 'mallory', tenantId: forged })).verify('good'), forged).rejects.toMatchObject({ code: 'auth/invalid-token', message: expect.stringContaining('reserved') });
    }
    // Not even an identity that already carries the mark gets one through the wrapper.
    const marked = markPersonalTenant(identity({ userId: 'mallory', tenantId: 'user.main.alice' }));
    await expect(wrap(marked).verify('good')).rejects.toMatchObject({ code: 'auth/invalid-token' });
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
    await expect(adapter.sign({ userId: 'mallory', tenantId: 'user.main.alice', scopes: [] })).rejects.toMatchObject({ code: 'auth/reserved-tenant' });
    // A token signed elsewhere with the same secret:
    const jwt = (await import('jsonwebtoken')).default;
    const forged = jwt.sign({ userId: 'mallory', tenantId: 'user.main.alice', scopes: [] }, secret, { algorithm: 'HS256', expiresIn: '5m' });
    await expect(adapter.verify(forged)).rejects.toMatchObject({ code: 'auth/invalid-token', message: expect.stringContaining('reserved') });
  });

  it('SessionManager refuses to store one', async () => {
    const sessions = new SessionManager(new InMemorySessionStore());
    await expect(sessions.create({ userId: 'u1', tenantId: 'user.main.u1' })).rejects.toMatchObject({ code: 'auth/reserved-tenant' });
    // The way to do it: no tenant in the session, and the wrapper gives the personal one on verify.
    const { token } = await sessions.create({ userId: 'u1', tenantId: '' });
    const result = await withPersonalTenants(sessions, { namespace: 'main' }).verify(token);
    expect(result.tenantId).toBe('user.main.u1');
    expect(claimsReservedTenant(result)).toBe(false);
  });

  it('the auth middleware refuses one from any verifier, and lets a given personal tenant through', async () => {
    const verifier = (result: ResolvedIdentity) => ({ verify: async () => result, sign: async () => '' }) as AuthenticationAdapter;
    const run = async (result: ResolvedIdentity) => {
      const ctx = createContext({ logger: silent });
      (ctx as { token?: string }).token = 't';
      await createAuthMiddleware(verifier(result))(ctx, async () => undefined);
      return ctx;
    };
    await expect(run(identity({ userId: 'mallory', tenantId: 'user.main.alice' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    await expect(run({ ...identity({ userId: 'mallory', tenantId: 'user.main.alice' }), personalTenant: true } as ResolvedIdentity)).rejects.toMatchObject({ code: 'auth/invalid-token' });
    expect((await run(markPersonalTenant(identity({ tenantId: 'user.main.u1' })))).tenantId).toBe('user.main.u1');
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
    expect(await withPersonalTenants(lenient, { namespace: 'main' }).verify(token)).toMatchObject({ userId: 'u1', tenantId: 'user.main.u1' });
  });

  it('keeps an organization tenant, and still signs through the wrapper', async () => {
    const adapter = withPersonalTenants(new JWTAdapter({ secret, requireTenant: false }), { namespace: 'main' });
    const token = await adapter.sign({ userId: 'u1', tenantId: 'org_1', scopes: [] });
    expect((await adapter.verify(token)).tenantId).toBe('org_1');
  });
});
