import { createSign, generateKeyPairSync } from 'node:crypto';
import { PROVIDER_METRICS } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestMetrics, TestTracer } from '@mariachi/testing';
import { describe, expect, it } from 'vitest';
import { ClerkAuthProvider } from './provider';

const noWait = { sleep: async () => {} };
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'ins_key_1', alg: 'RS256', use: 'sig' };
const config = { secretKey: 'sk_test_unit' };

/** A session token as Clerk signs it: RS256, its instance key's kid. */
function sessionToken(claims: Record<string, unknown> = {}, kid = 'ins_key_1'): string {
  const now = Math.floor(Date.now() / 1000);
  const part = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${part({ alg: 'RS256', typ: 'JWT', kid })}.${part({ sub: 'user_1', sid: 'sess_1', iat: now, nbf: now - 5, exp: now + 60, ...claims })}`;
  return `${unsigned}.${createSign('RSA-SHA256').update(unsigned).sign(privateKey).toString('base64url')}`;
}

describe('ClerkAuthProvider key fetches', () => {
  it('reads the instance keys once in a clerk jwks.get CLIENT span, and checks later tokens without calling Clerk', async () => {
    const fetch = scriptedFetch({ json: { keys: [jwk] } });
    const tracer = new TestTracer();
    const metrics = new TestMetrics();
    const clerk = new ClerkAuthProvider(config, { fetch, tracer, metrics });

    expect(await clerk.verify(sessionToken({ org_id: 'org_1', org_role: 'org:admin' }))).toMatchObject({ userId: 'user_1', tenantId: 'org_1', sessionId: 'sess_1', roles: ['org:admin'] });
    expect((await clerk.verify(sessionToken())).userId).toBe('user_1');

    expect(fetch.requests.map((r) => [r.method, r.url.href, r.headers.authorization])).toEqual([['GET', 'https://api.clerk.com/v1/jwks', 'Bearer sk_test_unit']]);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address'], s.attributes['http.response.status_code'], s.status?.status])).toEqual([
      ['clerk jwks.get', 'client', 'api.clerk.com', 200, 'ok'],
    ]);
    expect(JSON.stringify(tracer.spans)).not.toMatch(/sk_test|user_1|sess_1/);
    assertProviderSpans(tracer.spans);
    expect(metrics.count(PROVIDER_METRICS.calls, { integration: 'clerk', operation: 'jwks.get', outcome: 'ok' })).toBe(1);
  });

  it("still checks the token's claims as Clerk does: an expired token or another party's is refused", async () => {
    const clerk = new ClerkAuthProvider({ ...config, authorizedParties: ['https://app.example.com'] }, { fetch: scriptedFetch({ json: { keys: [jwk] } }) });
    await expect(clerk.verify(sessionToken({ azp: 'https://evil.example.com' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    await expect(clerk.verify(sessionToken({ azp: 'https://app.example.com', exp: Math.floor(Date.now() / 1000) - 3600 }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    expect((await clerk.verify(sessionToken({ azp: 'https://app.example.com' }))).userId).toBe('user_1');
  });

  it('retries the key fetch through an outage, in the same span', async () => {
    const fetch = scriptedFetch({ status: 503 }, { json: { keys: [jwk] } });
    const tracer = new TestTracer();
    expect((await new ClerkAuthProvider(config, { fetch, tracer, ...noWait }).verify(sessionToken())).userId).toBe('user_1');
    expect(tracer.spans.map((s) => [s.name, s.attributes['mariachi.integration.attempts'], s.events.map((e) => e.attributes['http.response.status_code'])])).toEqual([['clerk jwks.get', 2, [503]]]);
    assertProviderSpans(tracer.spans);
  });

  it("fails a refused secret key with auth/invalid-token, never a ProviderError, Clerk's code on the span and in the metadata", async () => {
    const fetch = scriptedFetch({ status: 401, json: { errors: [{ code: 'clerk_key_invalid', message: 'The provided Clerk Secret Key is invalid.' }] } });
    const tracer = new TestTracer();
    const error = await new ClerkAuthProvider(config, { fetch, tracer, ...noWait }).verify(sessionToken()).catch((e: unknown) => e);
    expect(error).toMatchObject({ name: 'AuthError', code: 'auth/invalid-token', metadata: { status: 401, category: 'unauthorized', providerCode: 'clerk_key_invalid' } });
    expect(fetch.requests).toHaveLength(1);
    expect(tracer.spans[0]!.attributes).toMatchObject({ 'error.type': 'clerk_key_invalid', 'mariachi.integration.error_category': 'unauthorized' });
    assertProviderSpans(tracer.spans);
  });

  it('refetches for a key it has not seen, at most once per cooldown', async () => {
    const fetch = scriptedFetch({ json: { keys: [jwk] } }, { json: { keys: [jwk] } });
    const tracer = new TestTracer();
    const clerk = new ClerkAuthProvider(config, { fetch, tracer });
    await clerk.verify(sessionToken());
    await expect(clerk.verify(sessionToken({}, 'ins_key_unknown'))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    await expect(clerk.verify(sessionToken({}, 'ins_key_unknown'))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    expect(fetch.requests).toHaveLength(1);
  });

  it('calls nothing with a local JWT key', async () => {
    const pem = publicKey.export({ format: 'pem', type: 'spki' }).toString();
    const tracer = new TestTracer();
    const fetch = scriptedFetch();
    expect((await new ClerkAuthProvider({ ...config, jwtKey: pem }, { fetch, tracer }).verify(sessionToken())).userId).toBe('user_1');
    expect(fetch.requests).toHaveLength(0);
    expect(tracer.spans).toHaveLength(0);
  });
});
