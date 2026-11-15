import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { exportJWK, generateKeyPair, SignJWT, type JWK } from 'jose';
import { createFusionAuthAuth } from './index';

type PrivateKey = Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];

// A stand-in for FusionAuth's /.well-known/jwks.json.
let server: Server;
let serverUrl: string;
let privateKey: PrivateKey;
let jwk: JWK;

beforeAll(async () => {
  const pair = await generateKeyPair('RS256', { extractable: true });
  privateKey = pair.privateKey;
  jwk = { ...(await exportJWK(pair.publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };
  server = createServer((req, res) => {
    if (req.url === '/.well-known/jwks.json') res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ keys: [jwk] }));
    else res.writeHead(404).end();
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  serverUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

const sign = (claims: Record<string, unknown>, aud = 'app-1', iss = 'acme.com') =>
  new SignJWT(claims).setProtectedHeader({ alg: 'RS256', kid: 'k1' }).setSubject('user-1').setAudience(aud).setIssuer(iss).setIssuedAt().setExpirationTime('5m').sign(privateKey);

describe('FusionAuthAuthProvider.verify', () => {
  it('maps tid, roles and sid, and keeps the verified payload in claims', async () => {
    const provider = createFusionAuthAuth({ serverUrl, clientId: 'app-1', issuer: 'acme.com' });
    const identity = await provider.verify(await sign({ tid: 'tenant-1', applicationId: 'app-1', roles: ['admin'], sid: 'sess-1', email: 'ada@example.org' }));
    expect(identity).toMatchObject({ userId: 'user-1', tenantId: 'tenant-1', roles: ['admin'], scopes: ['admin'], identityType: 'session', sessionId: 'sess-1' });
    expect(identity.claims).toMatchObject({ email: 'ada@example.org', iss: 'acme.com', aud: 'app-1' });
  });

  it('refuses another audience, another issuer when one is set, and a reserved tenant', async () => {
    const provider = createFusionAuthAuth({ serverUrl, clientId: 'app-1', issuer: 'acme.com' });
    await expect(provider.verify(await sign({ tid: 't' }, 'app-2'))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    await expect(provider.verify(await sign({ tid: 't' }, 'app-1', 'someone-else.com'))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    await expect(provider.verify(await sign({ tid: 'user.app.alice' }))).rejects.toMatchObject({ code: 'auth/invalid-token', message: expect.stringContaining('reserved') });
  });

  it('does not check the issuer unless one is configured, and says so once when it is built', async () => {
    const warnings: string[] = [];
    const logger = { warn: (_context: Record<string, unknown>, message: string) => void warnings.push(message) };
    createFusionAuthAuth({ serverUrl, clientId: 'app-1', issuer: 'acme.com', logger });
    expect(warnings).toEqual([]);
    const lenient = createFusionAuthAuth({ serverUrl, clientId: 'app-1', logger });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('`iss` is not checked');
    expect((await lenient.verify(await sign({ tid: 't' }, 'app-1', 'anything.example'))).tenantId).toBe('t');
  });
});
