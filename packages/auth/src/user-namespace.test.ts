import { describe, expect, it } from 'vitest';
import { isPersonalTenant, parsePersonalTenant } from '@mariachi/core';
import { withPersonalTenants } from './personal-tenants';
import type { ResolvedIdentity } from './types';
import { withUserNamespace } from './user-namespace';

/** A provider fake: the token is `<type>:<subject>[:<tenant>]`. */
const provider = {
  async verify(token: string): Promise<ResolvedIdentity> {
    const [identityType, userId, tenantId] = token.split(':');
    return { userId: userId ?? '', tenantId: tenantId ?? '', scopes: ['read'], identityType: identityType as ResolvedIdentity['identityType'], claims: { sub: userId } };
  },
  describe: () => 'provider fake',
};

describe('withUserNamespace', () => {
  it("puts the namespace in front of a person's id and leaves the rest of the identity alone", async () => {
    const workos = withUserNamespace(provider, 'workos');
    expect(await workos.verify('session:user_01:org_9')).toEqual({ userId: 'workos.user_01', tenantId: 'org_9', scopes: ['read'], identityType: 'session', claims: { sub: 'user_01' } });
    // The same subject from another provider is another user
    expect((await withUserNamespace(provider, 'google').verify('session:user_01')).userId).toBe('google.user_01');
    // Everything else on the verifier is still there
    expect(workos.describe()).toBe('provider fake');
  });

  it('renames people only: an API key, a service and an identity with no subject keep their ids', async () => {
    const wrapped = withUserNamespace(provider, 'main');
    expect((await wrapped.verify('api-key:key-owner:t1')).userId).toBe('key-owner');
    expect((await wrapped.verify('service:billing-worker:t1')).userId).toBe('billing-worker');
    expect((await wrapped.verify('session:')).userId).toBe('');
  });

  it('goes inside withPersonalTenants, so the personal tenant is made from the namespaced id', async () => {
    const verifier = withPersonalTenants(withUserNamespace(provider, 'workos'), { namespace: 'main' });
    const identity = await verifier.verify('session:user_01');
    expect(identity.userId).toBe('workos.user_01');
    expect(isPersonalTenant(identity.tenantId)).toBe(true);
    expect(parsePersonalTenant(identity.tenantId)).toEqual({ namespace: 'main', userId: 'workos.user_01' });
  });

  it('refuses a namespace that could not be told from an id, when it is wired', () => {
    for (const bad of ['', 'Has Space', 'UPPER', 'dot.ted', '-leading', 'x'.repeat(33), 'semi;colon']) {
      expect(() => withUserNamespace(provider, bad), bad).toThrow(/user namespace/);
    }
    expect(() => withUserNamespace(provider, 'auth0_prod-2')).not.toThrow();
  });
});
