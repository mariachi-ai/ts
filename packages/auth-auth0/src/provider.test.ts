import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAuth0Auth } from './index';
import { Auth0AuthProvider } from './provider';
import { testAuth0Auth } from './testing';

describe('Auth0AuthProvider', () => {
  it('verifies an access token for the API and maps its claims', async () => {
    const { provider, sign } = await testAuth0Auth({ domain: 'acme.us.auth0.com', audience: 'https://api.acme.test', rolesClaim: 'https://acme.test/roles' });
    const token = await sign({
      sub: 'auth0|u1',
      aud: ['https://api.acme.test', 'https://acme.us.auth0.com/userinfo'],
      azp: 'client-1',
      org_id: 'org_123',
      sid: 'sess-1',
      scope: 'openid profile read:things',
      permissions: ['write:things'],
      'https://acme.test/roles': ['admin'],
    });
    const identity = await provider.verify(token);
    expect(provider.name).toBe('auth0');
    expect(provider.issuer).toBe('https://acme.us.auth0.com/');
    expect(identity).toMatchObject({ userId: 'auth0|u1', tenantId: 'org_123', sessionId: 'sess-1', roles: ['admin'], identityType: 'session' });
    expect(identity.scopes.sort()).toEqual(['openid', 'profile', 'read:things', 'write:things']);
    expect(identity.claims?.azp).toBe('client-1');
  });

  it('accepts the app’s ID tokens when there is no API audience, and refuses them when there is', async () => {
    const idTokens = await testAuth0Auth({ domain: 'acme.us.auth0.com', clientId: 'client-1', audience: undefined });
    const idToken = await idTokens.sign({ aud: 'client-1' });
    expect((await idTokens.provider.verify(idToken)).tenantId).toBe('');

    const api = await testAuth0Auth({ domain: 'acme.us.auth0.com', clientId: 'client-1', audience: 'https://api.acme.test' });
    await expect(api.provider.verify(await api.sign({ aud: 'client-1' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
  });

  it('refuses another issuer, an expired token, and a personal-namespace tenant', async () => {
    const { provider, sign } = await testAuth0Auth({ domain: 'acme.us.auth0.com' });
    // Auth0's issuer ends in a slash; without it the token is someone else's.
    await expect(provider.verify(await sign({ iss: 'https://acme.us.auth0.com' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    await expect(provider.verify(await sign({ exp: Math.floor(Date.now() / 1000) - 60 }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    await expect(provider.verify(await sign({ org_id: 'user.someone' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
  });

  it('reads the domain bare or as a URL, and refuses anything else', () => {
    expect(new Auth0AuthProvider({ domain: 'https://acme.us.auth0.com/', audience: 'a' }).issuer).toBe('https://acme.us.auth0.com/');
    expect(new Auth0AuthProvider({ domain: 'login.acme.com', audience: 'a' }).issuer).toBe('https://login.acme.com/');
    for (const domain of ['http://acme.us.auth0.com', 'acme.us.auth0.com/path', '']) {
      expect(() => new Auth0AuthProvider({ domain, audience: 'a' })).toThrow(expect.objectContaining({ code: 'auth/invalid-config' }));
    }
    expect(() => new Auth0AuthProvider({ domain: 'acme.us.auth0.com' })).toThrow(expect.objectContaining({ code: 'auth/invalid-config' }));
    expect(() => new Auth0AuthProvider({ domain: 'acme.us.auth0.com', audience: 'a', algorithms: ['HS256' as never] })).toThrow(expect.objectContaining({ code: 'auth/invalid-config' }));
  });

  it("reads the keys from the tenant's /.well-known/jwks.json", async () => {
    const { privateKey, publicKey } = await generateKeyPair('RS256', { extractable: true });
    const jwk = { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };
    const urls: string[] = [];
    vi.stubGlobal('fetch', async (input: string | URL | Request) => {
      urls.push(String(input instanceof Request ? input.url : input));
      return new Response(JSON.stringify({ keys: [jwk] }), { headers: { 'content-type': 'application/json' } });
    });
    const token = await new SignJWT({ sub: 'auth0|u1' })
      .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
      .setIssuer('https://acme.eu.auth0.com/')
      .setAudience('https://api.acme.test')
      .setExpirationTime('5m')
      .sign(privateKey);
    const identity = await createAuth0Auth({ domain: 'acme.eu.auth0.com', audience: 'https://api.acme.test' }).verify(token);
    expect(identity.userId).toBe('auth0|u1');
    expect(urls).toEqual(['https://acme.eu.auth0.com/.well-known/jwks.json']);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
});
