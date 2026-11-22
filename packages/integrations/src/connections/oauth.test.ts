import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { authorizeUrl, checkProvider, createPkce, grantedScopes, oauthProvider, pkceChallenge, signState, verifyState } from './oauth';
import type { OAuthProvider } from './types';

const secret = 's'.repeat(40);
const ada = { provider: 'acme', tenantId: 't-1', userId: 'ada' };
const now = 1_800_000_000_000;

describe('PKCE', () => {
  it('makes a 43-character verifier and its S256 challenge', () => {
    const { verifier, challenge, method } = createPkce();
    expect(verifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(method).toBe('S256');
    expect(challenge).toBe(createHash('sha256').update(verifier).digest('base64url'));
    expect(challenge).toBe(pkceChallenge(verifier));
    expect(createPkce().verifier).not.toBe(verifier);
  });
});

describe('state', () => {
  it('verifies for the user, tenant and provider it was signed for, until it expires', () => {
    const { state, nonce } = signState(secret, ada, now + 600_000);
    expect(state.split('.')).toHaveLength(3);
    // The user's id never travels in it
    expect(state).not.toContain('ada');
    expect(verifyState(secret, state, ada, now)).toEqual({ nonce, expiresAt: now + 600_000 });
    expect(verifyState(secret, state, ada, now + 600_000)).toBeNull();
  });

  it('fails for anyone or anything else, and when tampered with', () => {
    const { state } = signState(secret, ada, now + 600_000);
    expect(verifyState(secret, state, { ...ada, userId: 'eve' }, now)).toBeNull();
    expect(verifyState(secret, state, { ...ada, provider: 'other' }, now)).toBeNull();
    expect(verifyState(secret, state, { ...ada, tenantId: 't-2' }, now)).toBeNull();
    expect(verifyState(secret, state, { ...ada, tenantId: null }, now)).toBeNull();
    expect(verifyState('x'.repeat(40), state, ada, now)).toBeNull();
    const [nonce, exp, mac] = state.split('.') as [string, string, string];
    // A later expiry, another nonce, another signature, extra parts, junk
    expect(verifyState(secret, `${nonce}.${(now + 9_999_999).toString(36)}.${mac}`, ada, now)).toBeNull();
    expect(verifyState(secret, `${createPkce().verifier}.${exp}.${mac}`, ada, now)).toBeNull();
    expect(verifyState(secret, `${nonce}.${exp}.${mac.slice(0, -2)}AA`, ada, now)).toBeNull();
    expect(verifyState(secret, `${state}.x`, ada, now)).toBeNull();
    expect(verifyState(secret, '', ada, now)).toBeNull();
    expect(verifyState(secret, 'a.b.c', ada, now)).toBeNull();
    expect(verifyState(secret, 'x'.repeat(500), ada, now)).toBeNull();
  });
});

const provider: OAuthProvider = {
  id: 'acme',
  category: 'crm',
  oauth: { authorizeUrl: 'https://auth.acme.test/authorize?prompt=consent', tokenUrl: 'https://auth.acme.test/token', scopes: ['contacts.read', 'contacts.write'], refresh: true },
  clientId: 'client-123',
  clientSecret: 'secret',
  redirectUri: 'https://app.example.test/connect/acme',
  authorizeParams: { access_type: 'offline' },
};

describe('the authorize URL', () => {
  it('carries the exact redirect URI, the scopes, the state and the challenge, and keeps the URL’s own parameters', () => {
    const url = new URL(authorizeUrl(provider, { state: 'st', challenge: 'ch' }));
    expect(url.origin + url.pathname).toBe('https://auth.acme.test/authorize');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      prompt: 'consent',
      access_type: 'offline',
      response_type: 'code',
      client_id: 'client-123',
      redirect_uri: 'https://app.example.test/connect/acme',
      scope: 'contacts.read contacts.write',
      state: 'st',
      code_challenge: 'ch',
      code_challenge_method: 'S256',
    });
    expect(new URL(authorizeUrl(provider, { state: 'st' })).searchParams.has('code_challenge')).toBe(false);
  });
});

describe('provider config', () => {
  const contract = {
    provider: { id: 'acme', name: 'Acme', category: 'crm', server: 'api.acme.test', docs: 'https://acme.test/docs' },
    credentials: { kind: 'user' as const, oauth: provider.oauth },
  };

  it('is built from the contract and the app settings', () => {
    const built = oauthProvider(contract, { clientId: 'id', clientSecret: 'sec', redirectUri: 'https://app.example.test/cb', scopes: ['contacts.read'] });
    expect(built).toMatchObject({ id: 'acme', category: 'crm', clientId: 'id', oauth: { tokenUrl: 'https://auth.acme.test/token', scopes: ['contacts.read'] } });
    // A provider package's generated, readonly `provider` and `credentials` fit as they are
    const generated = { provider: { id: 'acme', category: 'crm' }, credentials: { kind: 'app-or-user', oauth: { authorizeUrl: 'https://a.test/auth', tokenUrl: 'https://a.test/token', scopes: ['a'], refresh: true } } } as const;
    expect(oauthProvider(generated, { clientId: 'id', redirectUri: 'https://app.example.test/cb' }).oauth.scopes).toEqual(['a']);
    expect(() => oauthProvider({ ...contract, credentials: { kind: 'app' } }, { clientId: 'id', redirectUri: 'https://app.example.test/cb' })).toThrow(
      expect.objectContaining({ code: 'integrations/not-oauth' }),
    );
  });

  it('refuses what would be unsafe', () => {
    const bad = (over: Partial<OAuthProvider>) => () => checkProvider({ ...provider, ...over });
    expect(bad({})).not.toThrow();
    expect(bad({ redirectUri: 'http://app.example.test/cb' })).toThrow(expect.objectContaining({ code: 'integrations/invalid-oauth-provider' }));
    expect(bad({ redirectUri: 'https://app.example.test/cb#x' })).toThrow(expect.objectContaining({ code: 'integrations/invalid-oauth-provider' }));
    expect(bad({ redirectUri: 'http://localhost:5173/cb' })).not.toThrow();
    expect(bad({ oauth: { ...provider.oauth, tokenUrl: 'http://auth.acme.test/token' } })).toThrow(expect.objectContaining({ code: 'integrations/invalid-oauth-provider' }));
    expect(bad({ clientId: '' })).toThrow(expect.objectContaining({ code: 'integrations/invalid-oauth-provider' }));
    expect(bad({ clientSecret: undefined, oauth: { ...provider.oauth, pkce: false } })).toThrow(expect.objectContaining({ code: 'integrations/invalid-oauth-provider' }));
    expect(bad({ clientSecret: undefined, clientAuth: 'basic' })).toThrow(expect.objectContaining({ code: 'integrations/invalid-oauth-provider' }));
  });
});

describe('granted scopes', () => {
  it('reads what the provider reports, spaces or commas, else what was asked for', () => {
    expect(grantedScopes({ access_token: 'a', scope: 'a b  c' }, ['x'])).toEqual(['a', 'b', 'c']);
    expect(grantedScopes({ access_token: 'a', scope: 'a,b' }, ['x'])).toEqual(['a', 'b']);
    expect(grantedScopes({ access_token: 'a' }, ['x', 'y'])).toEqual(['x', 'y']);
  });
});
