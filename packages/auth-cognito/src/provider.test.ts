import { SignJWT } from 'jose';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { describe, expect, it } from 'vitest';
import { createCognitoAuth } from './index';
import { cognitoTestIssuer } from './testing';

const pool = { region: 'us-east-1', userPoolId: 'us-east-1_TEST', clientId: 'client123' };
const noWait = { sleep: async () => {} };

describe('CognitoAuthProvider', () => {
  it("fetches the pool's keys through callProvider and maps an access token", async () => {
    const issuer = await cognitoTestIssuer(pool);
    const fetch = scriptedFetch({ json: issuer.jwksJson });
    const tracer = new TestTracer();
    const auth = createCognitoAuth(pool, { fetch, tracer });
    const token = await issuer.accessToken({ sub: 'u-1', 'cognito:groups': ['admins', 'admins'], scope: 'openid orders/read' });

    const identity = await auth.verify(token);
    expect(identity).toMatchObject({ userId: 'u-1', tenantId: '', roles: ['admins'], scopes: ['openid', 'orders/read'], identityType: 'session' });
    expect(identity.claims?.token_use).toBe('access');
    expect(fetch.requests[0]!.url.href).toBe('https://cognito-idp.us-east-1.amazonaws.com/us-east-1_TEST/.well-known/jwks.json');
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([['cognito jwks.get', 'client', 'cognito-idp.us-east-1.amazonaws.com']]);
    assertProviderSpans(tracer.spans);

    await auth.verify(await issuer.accessToken());
    expect(fetch.requests).toHaveLength(1); // the keys are cached
  });

  it('retries the keys when Cognito answers 5xx', async () => {
    const issuer = await cognitoTestIssuer(pool);
    const fetch = scriptedFetch({ status: 503 }, { json: issuer.jwksJson });
    const tracer = new TestTracer();
    await expect(createCognitoAuth(pool, { fetch, tracer, ...noWait }).verify(await issuer.accessToken())).resolves.toMatchObject({ userId: expect.any(String) });
    expect([fetch.requests.length, tracer.spans[0]!.attributes['mariachi.integration.attempts']]).toEqual([2, 2]);
  });

  it('refuses the other kind of token, another client, another pool and an HMAC token', async () => {
    const issuer = await cognitoTestIssuer(pool);
    const auth = createCognitoAuth(pool, { jwks: issuer.jwks });
    await expect(auth.verify(await issuer.idToken())).rejects.toMatchObject({ code: 'auth/invalid-token' });
    await expect(auth.verify(await issuer.accessToken({ client_id: 'other' }))).rejects.toMatchObject({ code: 'auth/invalid-token', message: expect.stringContaining('another app client') });
    const elsewhere = await cognitoTestIssuer({ ...pool, userPoolId: 'us-east-1_OTHER' });
    await expect(createCognitoAuth(pool, { jwks: elsewhere.jwks }).verify(await elsewhere.accessToken())).rejects.toMatchObject({ code: 'auth/invalid-token' });
    const hmac = await new SignJWT({ token_use: 'access', client_id: pool.clientId }).setProtectedHeader({ alg: 'HS256' }).setIssuer(issuer.issuer).setSubject('u').setExpirationTime('1h').sign(new TextEncoder().encode('x'.repeat(32)));
    await expect(auth.verify(hmac)).rejects.toMatchObject({ code: 'auth/invalid-token' });
  });

  it('accepts ID tokens for this client when told to, checking aud', async () => {
    const issuer = await cognitoTestIssuer(pool);
    const auth = createCognitoAuth({ ...pool, tokenUse: 'id' }, { jwks: issuer.jwks });
    expect((await auth.verify(await issuer.idToken({ sub: 'u-2', email: 'a@b.co' }))).claims?.email).toBe('a@b.co');
    await expect(auth.verify(await issuer.accessToken())).rejects.toMatchObject({ code: 'auth/invalid-token' });
    const other = await cognitoTestIssuer({ ...pool, clientId: 'other' });
    await expect(createCognitoAuth({ ...pool, tokenUse: 'id' }, { jwks: other.jwks }).verify(await other.idToken())).rejects.toMatchObject({ code: 'auth/invalid-token' });
  });

  it('reads the tenant from the claim it is told, never a reserved one', async () => {
    const issuer = await cognitoTestIssuer(pool);
    const auth = createCognitoAuth({ ...pool, tenantClaim: 'tenant_id' }, { jwks: issuer.jwks });
    expect((await auth.verify(await issuer.accessToken({ tenant_id: 't-1' }))).tenantId).toBe('t-1');
    await expect(auth.verify(await issuer.accessToken({ tenant_id: 'user.cognito.u-1' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
  });

  it('refuses a custom attribute as tenantClaim unless the app says users cannot write it', async () => {
    expect(() => createCognitoAuth({ ...pool, tenantClaim: 'custom:tenant_id' })).toThrow(expect.objectContaining({ name: 'ConfigError', code: 'cognito/user-writable-attribute' }));
    const issuer = await cognitoTestIssuer(pool);
    const auth = createCognitoAuth({ ...pool, tenantClaim: 'custom:tenant_id', trustCustomAttributes: true }, { jwks: issuer.jwks });
    expect((await auth.verify(await issuer.accessToken({ 'custom:tenant_id': 't-1' }))).tenantId).toBe('t-1');
  });

  it('checks its configuration, and has no webhooks', () => {
    expect(() => createCognitoAuth({ ...pool, userPoolId: 'nope' })).toThrow(expect.objectContaining({ code: 'auth/invalid-config' }));
    expect(() => createCognitoAuth({ ...pool, region: 'https://x' })).toThrow(expect.objectContaining({ code: 'auth/invalid-config' }));
    expect(() => createCognitoAuth(pool).createWebhookHandler()).toThrow(expect.objectContaining({ code: 'auth/not-supported' }));
  });
});
