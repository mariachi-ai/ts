import { describe, expect, it } from 'vitest';
import { JWTAdapter } from './jwt';

const secret = 'jwt-test-secret-at-least-32-characters-long';
const ada = { userId: 'ada', tenantId: 'acme', scopes: ['notes:read'] };

describe('JWTAdapter.sign with claims of your own', () => {
  it('carries them beside the identity, and gives them back on verify', async () => {
    const adapter = new JWTAdapter({ secret });
    const token = await adapter.sign(ada, '5m', { email: 'ada@example.com', email_verified: true, plan: { name: 'pro' } });
    const identity = await adapter.verify(token);
    expect(identity).toMatchObject({ userId: 'ada', tenantId: 'acme', scopes: ['notes:read'] });
    expect(identity.claims).toMatchObject({ email: 'ada@example.com', email_verified: true, plan: { name: 'pro' } });
  });

  it("refuses a claim the adapter writes itself, so nothing given there can change who the token is for", async () => {
    const adapter = new JWTAdapter({ secret, issuer: 'https://app.example.com' });
    for (const claims of [{ sub: 'eve' }, { userId: 'eve' }, { tenantId: 'other' }, { tid: 'other' }, { roles: ['owner'] }, { scope: 'admin' }, { iss: 'https://evil.example' }, { exp: 9_999_999_999 }]) {
      await expect(adapter.sign(ada, '5m', claims)).rejects.toMatchObject({ code: 'auth/jwt-config' });
    }
  });

  it('signs as before when none are given', async () => {
    const adapter = new JWTAdapter({ secret });
    const identity = await adapter.verify(await adapter.sign(ada));
    expect(identity).toMatchObject({ userId: 'ada', tenantId: 'acme' });
    expect(identity.claims).not.toHaveProperty('email');
  });
});
