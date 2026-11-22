import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { SignJWT, exportJWK, generateKeyPair } from 'jose';
import { describe, expect, it } from 'vitest';
import { GoTrueAuthProvider } from './provider';
import { fetchThrough } from './provider-fetch';
import { goTrueVerifiedEmail } from './verified-email';

const url = 'https://project.example.co/auth/v1';
const ADA = '5d4c3b2a-1f0e-4d9c-8b7a-6f5e4d3c2b1a';
const noWait = { sleep: async () => {} };

async function gotrueKeys(iss = url) {
  const { privateKey, publicKey } = await generateKeyPair('ES256');
  const jwk = { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'ES256', use: 'sig' };
  const sign = () =>
    new SignJWT({ email: 'ada@example.com', role: 'authenticated' }).setProtectedHeader({ alg: 'ES256', kid: 'k1' }).setIssuer(iss).setAudience('authenticated').setSubject(ADA).setIssuedAt().setExpirationTime('10m').sign(privateKey);
  return { jwk, sign };
}

describe('GoTrueAuthProvider calls', () => {
  it('fetches the keys once, in a CLIENT span with nothing sensitive on it, and checks later tokens against them', async () => {
    const { jwk, sign } = await gotrueKeys();
    const fetch = scriptedFetch({ json: { keys: [jwk] } });
    const tracer = new TestTracer();
    const gotrue = new GoTrueAuthProvider({ url }, undefined, { fetch, tracer });
    expect((await gotrue.verify(await sign())).userId).toBe(ADA);
    expect((await gotrue.verify(await sign())).userId).toBe(ADA);
    expect(fetch.requests.map((r) => r.url.href)).toEqual([`${url}/.well-known/jwks.json`]);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address'], s.attributes['mariachi.integration.attempts']])).toEqual([['gotrue jwks.get', 'client', 'project.example.co', 1]]);
    assertProviderSpans(tracer.spans);
  });

  it('learns the issuer through a discovery.get span, retried while GoTrue is briefly down', async () => {
    const { jwk, sign } = await gotrueKeys('https://auth.example.com/auth/v1');
    const fetch = scriptedFetch({ status: 503 }, { json: { issuer: 'https://auth.example.com/auth/v1' } }, { json: { keys: [jwk] } });
    const tracer = new TestTracer();
    const gotrue = new GoTrueAuthProvider({ url: 'http://127.0.0.1:9999', discoverIssuer: true }, undefined, { fetch, tracer, ...noWait });
    expect((await gotrue.verify(await sign())).userId).toBe(ADA);
    expect(tracer.spans.map((s) => [s.name, s.attributes['mariachi.integration.attempts'], s.events.length])).toEqual([
      ['gotrue discovery.get', 2, 1],
      ['gotrue jwks.get', 1, 0],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('fails with auth/invalid-token, the status and category in its metadata, when the keys are refused', async () => {
    const { sign } = await gotrueKeys();
    const tracer = new TestTracer();
    const gotrue = new GoTrueAuthProvider({ url }, undefined, { fetch: scriptedFetch({ status: 404 }), tracer, ...noWait });
    await expect(gotrue.verify(await sign())).rejects.toMatchObject({ name: 'AuthError', code: 'auth/invalid-token', metadata: { status: 404, category: 'not-found' } });
    expect(tracer.spans[0]!.attributes).toMatchObject({ 'error.type': 'gotrue/not-found', 'mariachi.integration.error_category': 'not-found' });
    assertProviderSpans(tracer.spans);
  });
});

describe('goTrueVerifiedEmail calls', () => {
  const ctx = { identity: { claims: { sub: ADA, email: 'ada@example.com' } } };

  it('reads the settings and the user in one span each, the user id never on them', async () => {
    const fetch = scriptedFetch({ json: { mailer_autoconfirm: false } }, { json: { id: ADA, email: 'ada@example.com', email_confirmed_at: '2026-01-01T00:00:00Z' } });
    const tracer = new TestTracer();
    const read = goTrueVerifiedEmail({ url, serviceKey: 'service-key' }, { fetch, tracer });
    expect(await read(ctx)).toEqual({ email: 'ada@example.com', verified: true });
    expect(tracer.spans.map((s) => [s.name, s.attributes['http.request.method'], s.attributes['http.response.status_code']])).toEqual([
      ['gotrue settings.get', 'GET', 200],
      ['gotrue users.get', 'GET', 200],
    ]);
    for (const span of tracer.spans) expect(Object.values(span.attributes)).not.toContain(ADA);
    assertProviderSpans(tracer.spans);
  });

  it('retries a rate-limited read, and fails a refused one with auth/user-lookup-failed', async () => {
    const fetch = scriptedFetch({ status: 429, headers: { 'retry-after': '0' } }, { json: { mailer_autoconfirm: false } }, { status: 401, json: { msg: 'invalid key' } });
    const tracer = new TestTracer();
    const read = goTrueVerifiedEmail({ url, serviceKey: 'wrong' }, { fetch, tracer, ...noWait });
    await expect(read(ctx)).rejects.toMatchObject({ name: 'AuthError', code: 'auth/user-lookup-failed', metadata: { status: 401 } });
    expect(tracer.spans.map((s) => [s.name, s.attributes['mariachi.integration.attempts'], s.attributes['mariachi.integration.error_category'] ?? null])).toEqual([
      ['gotrue settings.get', 2, null],
      ['gotrue users.get', 1, 'unauthorized'],
    ]);
    assertProviderSpans(tracer.spans);
  });
});

describe('the deadline on GoTrue key fetches', () => {
  it('stops waiting for a retry when the caller\'s signal fires, and fails at once on a long Retry-After', async () => {
    for (const retryAfter of ['5', '120']) {
      const limited = { status: 429, headers: { 'retry-after': retryAfter } };
      const fetch = scriptedFetch(limited, limited);
      const started = Date.now();
      await expect(fetchThrough('jwks.get', 'https://keys.example.com/jwks', { signal: AbortSignal.timeout(50) }, { fetch })).rejects.toMatchObject({ category: 'rate-limited' });
      expect(Date.now() - started).toBeLessThan(1_000);
      expect(fetch.requests).toHaveLength(1);
    }
  });
});
