import { describe, expect, it } from 'vitest';
import { createTestAuth } from './index';

describe('createTestAuth', () => {
  it('verifies the tokens it issued as the identity they were issued for', async () => {
    const auth = createTestAuth();
    const token = auth.tokenFor({ userId: 'u1', tenantId: 't1', scopes: ['notes:read'], roles: ['admin'], claims: { org_id: 't1' } });
    expect(await auth.verifier.verify(token)).toEqual({ userId: 'u1', tenantId: 't1', scopes: ['notes:read'], identityType: 'session', roles: ['admin'], claims: { org_id: 't1' } });
    expect(await auth.verifier.verify(auth.tokenFor({ userId: 'svc', tenantId: 't2', identityType: 'api-key' }))).toEqual({ userId: 'svc', tenantId: 't2', scopes: [], identityType: 'api-key' });
  });

  it('gives a bearer header, and a new token each time', () => {
    const auth = createTestAuth();
    const one = auth.headersFor({ userId: 'u1', tenantId: 't1' });
    const two = auth.headersFor({ userId: 'u1', tenantId: 't1' });
    expect(one.authorization).toMatch(/^Bearer test-[0-9a-f-]{36}$/);
    expect(one.authorization).not.toBe(two.authorization);
  });

  it('refuses a token it never issued, one from another instance, and one it revoked', async () => {
    const auth = createTestAuth();
    const other = createTestAuth();
    const token = auth.tokenFor({ userId: 'u1', tenantId: 't1' });
    await expect(auth.verifier.verify('made-up')).rejects.toMatchObject({ code: 'auth/invalid-token' });
    await expect(other.verifier.verify(token)).rejects.toMatchObject({ code: 'auth/invalid-token' });
    auth.revoke(token);
    await expect(auth.verifier.verify(token)).rejects.toMatchObject({ code: 'auth/invalid-token' });
  });

  it("hands out copies, so a test can't change an identity after the fact", async () => {
    const auth = createTestAuth();
    const scopes = ['a'];
    const token = auth.tokenFor({ userId: 'u1', tenantId: 't1', scopes });
    scopes.push('b');
    const first = await auth.verifier.verify(token);
    first.scopes.push('c');
    expect((await auth.verifier.verify(token)).scopes).toEqual(['a']);
  });
});
