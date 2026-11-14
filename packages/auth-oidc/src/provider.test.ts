import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { exportJWK, generateKeyPair, SignJWT, type JWK } from 'jose';
import { createOidcAuth, type OidcConfig } from './index';

type PrivateKey = Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
type Key = { kid: string; privateKey: PrivateKey; jwk: JWK; alg: string };

async function makeKey(kid: string, alg: 'ES256' | 'RS256' = 'RS256'): Promise<Key> {
  const { privateKey, publicKey } = await generateKeyPair(alg, { extractable: true });
  return { kid, privateKey, alg, jwk: { ...(await exportJWK(publicKey)), kid, alg, use: 'sig' } };
}

// A stand-in identity provider: a discovery document and a JWKS whose contents the tests set.
let server: Server;
let issuer: string;
let published: JWK[] = [];
let discovery: Record<string, unknown> | null = null;
const hits = { discovery: 0, jwks: 0 };

beforeAll(async () => {
  server = createServer((req, res) => {
    const json = (body: unknown) => res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(body));
    if (req.url === '/.well-known/openid-configuration' || req.url === '/internal/discovery') {
      hits.discovery += 1;
      return discovery ? json(discovery) : res.writeHead(404).end();
    }
    if (req.url === '/keys') {
      hits.jwks += 1;
      return json({ keys: published });
    }
    res.writeHead(404).end();
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  issuer = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

let key: Key;
beforeEach(async () => {
  key = await makeKey('k1');
  published = [key.jwk];
  discovery = { issuer, jwks_uri: `${issuer}/keys` };
  hits.discovery = 0;
  hits.jwks = 0;
});

function sign(claims: Record<string, unknown>, opts: { key?: Key; iss?: string; aud?: string | null; exp?: string | number; sub?: string | null } = {}) {
  const signer = opts.key ?? key;
  const jwt = new SignJWT(claims).setProtectedHeader({ alg: signer.alg, kid: signer.kid, typ: 'JWT' }).setIssuer(opts.iss ?? issuer).setIssuedAt().setExpirationTime(opts.exp ?? '10m');
  if (opts.aud !== null) jwt.setAudience(opts.aud ?? 'my-api');
  if (opts.sub !== null) jwt.setSubject(opts.sub ?? 'user-1');
  return jwt.sign(signer.privateKey);
}

const provider = (over: Partial<OidcConfig> = {}) => createOidcAuth({ issuer, audience: 'my-api', ...over });
const invalid = { code: 'auth/invalid-token' };

describe('OidcAuthProvider', () => {
  it('finds the keys through discovery and maps the standard claims', async () => {
    const auth = provider();
    const token = await sign({ org_id: 'org-1', roles: ['admin'], scope: 'read:orders write:orders', sid: 'sess-1', email: 'ada@example.com' });
    expect(await auth.verify(token)).toMatchObject({
      userId: 'user-1',
      tenantId: 'org-1',
      roles: ['admin'],
      scopes: ['read:orders', 'write:orders'],
      identityType: 'session',
      sessionId: 'sess-1',
      claims: { email: 'ada@example.com', iss: issuer, aud: 'my-api' },
    });
    await auth.verify(token);
    expect(hits).toEqual({ discovery: 1, jwks: 1 });
  });

  it('refuses a wrong issuer, audience, signature or expiry, and a token with no subject', async () => {
    const auth = provider();
    await expect(auth.verify(await sign({}, { iss: 'https://evil.example.com' }))).rejects.toMatchObject(invalid);
    await expect(auth.verify(await sign({}, { aud: 'another-api' }))).rejects.toMatchObject(invalid);
    await expect(auth.verify(await sign({}, { aud: null }))).rejects.toMatchObject(invalid);
    await expect(auth.verify(await sign({}, { exp: Math.floor(Date.now() / 1000) - 60 }))).rejects.toMatchObject(invalid);
    await expect(auth.verify(await sign({}, { sub: null }))).rejects.toMatchObject(invalid);
    await expect(auth.verify(await sign({}, { key: await makeKey('k1') }))).rejects.toMatchObject(invalid);
    await expect(auth.verify(await sign({}, { key: await makeKey('unknown') }))).rejects.toMatchObject(invalid);
    await expect(auth.verify('not.a.token')).rejects.toMatchObject(invalid);
    expect((await auth.verify(await sign({}))).userId).toBe('user-1');
  });

  it('refuses an algorithm that is not on the list, and HMAC outright', async () => {
    const es = await makeKey('es', 'ES256');
    published = [key.jwk, es.jwk];
    await expect(provider({ algorithms: ['RS256'] }).verify(await sign({}, { key: es }))).rejects.toMatchObject(invalid);
    expect((await provider().verify(await sign({}, { key: es }))).userId).toBe('user-1');
    expect(() => provider({ algorithms: ['HS256' as never] })).toThrow(/HMAC/);
  });

  it('refuses keys from a discovery document that names another issuer', async () => {
    discovery = { issuer: 'https://someone-else.example.com', jwks_uri: `${issuer}/keys` };
    await expect(provider().verify(await sign({}))).rejects.toMatchObject({ code: 'auth/invalid-token', message: expect.stringContaining('different issuer') });
    discovery = { issuer };
    await expect(provider().verify(await sign({}))).rejects.toMatchObject({ message: expect.stringContaining('no jwks_uri') });
    discovery = null;
    await expect(provider().verify(await sign({}))).rejects.toMatchObject({ message: expect.stringContaining('answered 404') });
  });

  it('retries discovery after a failure, and takes jwksUrl or discoveryUrl in its place', async () => {
    const auth = provider();
    discovery = null;
    await expect(auth.verify(await sign({}))).rejects.toMatchObject(invalid);
    discovery = { issuer, jwks_uri: `${issuer}/keys` };
    expect((await auth.verify(await sign({}))).userId).toBe('user-1');

    hits.discovery = 0;
    expect((await provider({ jwksUrl: `${issuer}/keys` }).verify(await sign({}))).userId).toBe('user-1');
    expect(hits.discovery).toBe(0);
    expect((await provider({ discoveryUrl: `${issuer}/internal/discovery` }).verify(await sign({}))).userId).toBe('user-1');
    expect(hits.discovery).toBe(1);
  });

  it('picks up a rotated key', async () => {
    const auth = provider({ jwksCooldownMs: 0 });
    await auth.verify(await sign({}));
    const next = await makeKey('k2');
    published = [key.jwk, next.jwk];
    expect((await auth.verify(await sign({}, { key: next }))).userId).toBe('user-1');
  });

  it('reads tenant, roles and scopes from the claims a provider actually uses', async () => {
    // Auth0: namespaced custom claims and a permissions array.
    const auth0 = provider({ tenantClaim: 'https://example.com/org', rolesClaim: 'https://example.com/roles' });
    expect(await auth0.verify(await sign({ 'https://example.com/org': 'org_9', 'https://example.com/roles': ['editor'], permissions: ['read:posts'] }))).toMatchObject({
      tenantId: 'org_9',
      roles: ['editor'],
      scopes: ['read:posts'],
    });
    // Keycloak: roles nested under realm_access, read with a function.
    const keycloak = provider({ rolesClaim: [(c) => (c.realm_access as { roles?: string[] } | undefined)?.roles, 'groups'], tenantClaim: (c) => (c.organization as string[] | undefined)?.[0] });
    expect(await keycloak.verify(await sign({ realm_access: { roles: ['realm-admin'] }, groups: ['staff'], organization: ['acme'], scope: 'openid profile' }))).toMatchObject({
      tenantId: 'acme',
      roles: ['realm-admin', 'staff'],
      scopes: ['openid', 'profile'],
    });
    // Roles join the scopes only when asked.
    expect((await provider({ rolesAsScopes: true }).verify(await sign({ roles: ['admin'], scope: 'read' }))).scopes).toEqual(['admin', 'read']);
    // Entra ID: `scp` is space-separated, the tenant is `tid`.
    expect(await provider({ tenantClaim: 'tid' }).verify(await sign({ tid: 't-1', scp: 'Orders.Read Orders.Write' }))).toMatchObject({ tenantId: 't-1', scopes: ['Orders.Read', 'Orders.Write'] });
    // No tenant claim in the token: no tenant.
    expect((await provider().verify(await sign({}))).tenantId).toBe('');
  });

  it('needs an audience, or an explicit null with a check of its own', async () => {
    expect(() => createOidcAuth({ issuer, audience: null })).toThrow(expect.objectContaining({ code: 'auth/invalid-config', message: expect.stringContaining('validate') }));
    expect(() => createOidcAuth({ issuer } as OidcConfig)).toThrow(/audience/);
    expect(() => createOidcAuth({ issuer, audience: '' })).toThrow(/audience/);
    expect(() => createOidcAuth({ issuer: '', audience: 'x' })).toThrow(/issuer/);

    // Amazon Cognito access tokens: no aud, a client_id and token_use instead.
    const cognito = provider({
      audience: null,
      validate: (claims) => {
        if (claims.token_use !== 'access' || claims.client_id !== 'app-client') throw new Error('not an access token for this client');
      },
    });
    expect((await cognito.verify(await sign({ token_use: 'access', client_id: 'app-client' }, { aud: null }))).userId).toBe('user-1');
    await expect(cognito.verify(await sign({ token_use: 'id', client_id: 'app-client' }, { aud: null }))).rejects.toMatchObject({ code: 'auth/invalid-token', message: expect.stringContaining('not an access token') });
    await expect(cognito.verify(await sign({ token_use: 'access', client_id: 'other-client' }, { aud: null }))).rejects.toMatchObject(invalid);
  });

  it('requires https everywhere except on this machine', async () => {
    const config = { message: expect.stringContaining('https://'), code: 'auth/invalid-config' };
    expect(() => createOidcAuth({ issuer: 'http://login.example.com', audience: 'x' })).toThrow(expect.objectContaining(config));
    expect(() => createOidcAuth({ issuer: 'https://login.example.com', audience: 'x', jwksUrl: 'http://keys.example.com/jwks' })).toThrow(expect.objectContaining(config));
    expect(() => createOidcAuth({ issuer: 'https://login.example.com', audience: 'x', discoveryUrl: 'http://10.0.0.5/discovery' })).toThrow(expect.objectContaining(config));
    expect(() => createOidcAuth({ issuer: 'ftp://login.example.com', audience: 'x' })).toThrow(expect.objectContaining(config));
    expect(() => createOidcAuth({ issuer: 'not a url', audience: 'x' })).toThrow(expect.objectContaining({ code: 'auth/invalid-config' }));
    for (const local of ['http://localhost:8080', 'http://127.0.0.1:9000/realms/app', 'http://[::1]:8080', 'https://login.example.com/']) {
      expect(() => createOidcAuth({ issuer: local, audience: 'x' }), local).not.toThrow();
    }
    // The document is the issuer's own, but it points the keys at plain HTTP on another host.
    discovery = { issuer, jwks_uri: 'http://keys.example.com/jwks' };
    await expect(provider().verify(await sign({}))).rejects.toMatchObject({ code: 'auth/invalid-token', message: expect.stringContaining('jwks_uri must be https://') });
  });

  it('can require a token type, to tell an access token from an id token', async () => {
    const typed = (typ: string) => new SignJWT({}).setProtectedHeader({ alg: key.alg, kid: key.kid, typ }).setIssuer(issuer).setAudience('my-api').setSubject('user-1').setIssuedAt().setExpirationTime('10m').sign(key.privateKey);
    const strict = provider({ requireTokenType: 'at+jwt' });
    expect((await strict.verify(await typed('at+jwt'))).userId).toBe('user-1');
    expect((await strict.verify(await typed('application/at+jwt'))).userId).toBe('user-1');
    await expect(strict.verify(await typed('JWT'))).rejects.toMatchObject(invalid);
    // Off by default.
    expect((await provider().verify(await typed('JWT'))).userId).toBe('user-1');
  });

  it("tokenType 'access' refuses an id token, however the provider marks the difference", async () => {
    const withTyp = (typ: string, claims: Record<string, unknown> = {}) =>
      new SignJWT(claims).setProtectedHeader({ alg: key.alg, kid: key.kid, typ }).setIssuer(issuer).setAudience('my-api').setSubject('user-1').setIssuedAt().setExpirationTime('10m').sign(key.privateKey);
    const access = provider({ tokenType: 'access' });
    // RFC 9068, Cognito, Keycloak:
    expect((await access.verify(await withTyp('at+jwt'))).userId).toBe('user-1');
    expect((await access.verify(await withTyp('JWT', { token_use: 'access' }))).userId).toBe('user-1');
    expect((await access.verify(await withTyp('JWT', { typ: 'Bearer' }))).userId).toBe('user-1');
    // An id token, and a token that says nothing either way:
    for (const claims of [{ token_use: 'id' }, { typ: 'ID' }, {}]) {
      await expect(access.verify(await withTyp('JWT', claims))).rejects.toMatchObject({ code: 'auth/invalid-token', message: expect.stringContaining('not an access token') });
    }
  });

  it('checks who the token was issued to, when told who may', async () => {
    const strict = provider({ authorizedParty: ['web-app', 'mobile-app'] });
    expect((await strict.verify(await sign({ azp: 'web-app' }))).userId).toBe('user-1');
    expect((await strict.verify(await sign({ client_id: 'mobile-app' }))).userId).toBe('user-1');
    await expect(strict.verify(await sign({ azp: 'another-app' }))).rejects.toMatchObject({ code: 'auth/invalid-token', message: expect.stringContaining('not allowed') });
    await expect(strict.verify(await sign({ azp: 'another-app', client_id: 'web-app' }))).rejects.toMatchObject(invalid);
    await expect(strict.verify(await sign({}))).rejects.toMatchObject(invalid);
  });

  it('runs validate only on a token that already verified, and takes the user id from another claim', async () => {
    let seen = 0;
    const counted = provider({ validate: () => { seen += 1; } });
    await expect(counted.verify(await sign({}, { aud: 'another-api' }))).rejects.toMatchObject(invalid);
    await expect(counted.verify(await sign({}, { key: await makeKey('k1') }))).rejects.toMatchObject(invalid);
    expect(seen).toBe(0);
    await counted.verify(await sign({}));
    expect(seen).toBe(1);

    // Entra ID: `sub` is per application, `oid` is the person.
    expect((await provider({ userIdClaim: 'oid' }).verify(await sign({ oid: 'person-1' }))).userId).toBe('person-1');
    await expect(provider({ userIdClaim: 'oid' }).verify(await sign({}))).rejects.toMatchObject(invalid);
    // A single role as a string, as some providers send it.
    expect((await provider({ rolesClaim: ['roles', 'role'] }).verify(await sign({ role: 'member' }))).roles).toEqual(['member']);
  });

  it('keeps the keys it has when the discovery document cannot be re-read', async () => {
    const auth = provider({ jwksCacheMaxAgeMs: 20 });
    const token = await sign({});
    await auth.verify(token);
    await new Promise((resolve) => setTimeout(resolve, 40));
    discovery = null;
    expect((await auth.verify(token)).userId).toBe('user-1');
    // And it looks again next time: once the document is back, a moved key set is followed.
    discovery = { issuer, jwks_uri: `${issuer}/keys` };
    await new Promise((resolve) => setTimeout(resolve, 40));
    const before = hits.discovery;
    await auth.verify(token);
    expect(hits.discovery).toBeGreaterThan(before);
    // With no keys in hand at all, a failed discovery is still a refusal.
    discovery = null;
    await expect(provider().verify(token)).rejects.toMatchObject(invalid);
  });

  it('has no webhooks', () => {
    expect(() => provider().createWebhookHandler()).toThrow(expect.objectContaining({ code: 'auth/not-supported' }));
  });
});
