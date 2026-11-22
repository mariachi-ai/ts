import { PROVIDER_METRICS } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestMetrics, TestTracer } from '@mariachi/testing';
import { SignJWT, exportJWK, generateKeyPair } from 'jose';
import { describe, expect, it } from 'vitest';
import { OidcAuthProvider } from './provider';
import { fetchThrough } from './provider-fetch';

const issuer = 'https://login.example.com/';
const noWait = { sleep: async () => {} };

async function issuerKeys() {
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const jwk = { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };
  const sign = (claims: Record<string, unknown> = {}) =>
    new SignJWT({ email: 'ada@example.com', ...claims }).setProtectedHeader({ alg: 'RS256', kid: 'k1' }).setIssuer(issuer).setAudience('my-api').setSubject('user-1').setIssuedAt().setExpirationTime('10m').sign(privateKey);
  return { jwk, sign };
}

const discovery = { json: { issuer, jwks_uri: 'https://keys.example.com/jwks' } };

describe('the calls to the issuer', () => {
  it('makes one CLIENT span for the discovery document and one for the keys, and none for a token checked against keys in hand', async () => {
    const { jwk, sign } = await issuerKeys();
    const fetch = scriptedFetch(discovery, { json: { keys: [jwk] } });
    const tracer = new TestTracer();
    const metrics = new TestMetrics();
    const oidc = new OidcAuthProvider({ issuer, audience: 'my-api' }, undefined, { fetch, tracer, metrics });

    expect((await oidc.verify(await sign())).userId).toBe('user-1');
    expect((await oidc.verify(await sign({ sid: 's2' }))).sessionId).toBe('s2');

    expect(fetch.requests.map((r) => `${r.method} ${r.url.href}`)).toEqual(['GET https://login.example.com/.well-known/openid-configuration', 'GET https://keys.example.com/jwks']);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address'], s.attributes['http.response.status_code'], s.status?.status])).toEqual([
      ['oidc discovery.get', 'client', 'login.example.com', 200, 'ok'],
      ['oidc jwks.get', 'client', 'keys.example.com', 200, 'ok'],
    ]);
    expect(tracer.spans[0]!.attributes).toMatchObject({ 'mariachi.integration': 'oidc', 'mariachi.integration.category': 'auth', 'http.request.method': 'GET', 'mariachi.integration.attempts': 1 });
    assertProviderSpans(tracer.spans);
    expect(metrics.count(PROVIDER_METRICS.calls, { integration: 'oidc', outcome: 'ok' })).toBe(2);
  });

  it('retries an issuer that is briefly unavailable, in the same span', async () => {
    const { jwk, sign } = await issuerKeys();
    const fetch = scriptedFetch({ status: 503 }, discovery, { status: 429, headers: { 'retry-after': '0' } }, { json: { keys: [jwk] } });
    const tracer = new TestTracer();
    const oidc = new OidcAuthProvider({ issuer, audience: 'my-api' }, undefined, { fetch, tracer, ...noWait });

    expect((await oidc.verify(await sign())).userId).toBe('user-1');
    expect(tracer.spans.map((s) => [s.name, s.attributes['mariachi.integration.attempts'], s.events.map((e) => e.attributes['http.response.status_code'])])).toEqual([
      ['oidc discovery.get', 2, [503]],
      ['oidc jwks.get', 2, [429]],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('fails a discovery the issuer refuses with auth/invalid-token, the status and category in its metadata, and no retry', async () => {
    const fetch = scriptedFetch({ status: 404 });
    const tracer = new TestTracer();
    const oidc = new OidcAuthProvider({ issuer, audience: 'my-api' }, undefined, { fetch, tracer, ...noWait });

    const error = await oidc.verify('a.b.c').catch((e: unknown) => e);
    expect(error).toMatchObject({ name: 'AuthError', code: 'auth/invalid-token', metadata: { status: 404, category: 'not-found' } });
    expect(fetch.requests).toHaveLength(1);
    expect(tracer.spans[0]!.attributes).toMatchObject({ 'error.type': 'oidc/not-found', 'mariachi.integration.error_category': 'not-found', 'http.response.status_code': 404 });
    expect(tracer.spans[0]!.status?.status).toBe('error');
    assertProviderSpans(tracer.spans);
  });

  it('fails with auth/invalid-token, never a ProviderError, when the keys stay unavailable', async () => {
    const { sign } = await issuerKeys();
    const fetch = scriptedFetch({ status: 502 }, { status: 502 }, { status: 502 });
    const tracer = new TestTracer();
    const oidc = new OidcAuthProvider({ issuer, audience: 'my-api', jwksUrl: 'https://keys.example.com/jwks' }, undefined, { fetch, tracer, ...noWait });

    const error = await oidc.verify(await sign()).catch((e: unknown) => e);
    expect(error).toMatchObject({ name: 'AuthError', code: 'auth/invalid-token', metadata: { status: 502, category: 'unavailable' } });
    expect(tracer.spans.map((s) => [s.name, s.attributes['mariachi.integration.attempts'], s.attributes['mariachi.integration.error_category']])).toEqual([['oidc jwks.get', 3, 'unavailable']]);
    assertProviderSpans(tracer.spans);
  });

  it("names the spans after the adapter that verifies through it", async () => {
    const { jwk, sign } = await issuerKeys();
    const fetch = scriptedFetch({ json: { keys: [jwk] } });
    const tracer = new TestTracer();
    await new OidcAuthProvider({ issuer, audience: 'my-api', jwksUrl: 'https://keys.example.com/jwks' }, undefined, { fetch, tracer, integration: 'acme' }).verify(await sign());
    expect(tracer.spans.map((s) => [s.name, s.attributes['mariachi.integration']])).toEqual([['acme jwks.get', 'acme']]);
  });

  it('fails at once, without retrying, once the deadline has passed', async () => {
    const tracer = new TestTracer();
    const timedOut = (async () => {
      throw new DOMException('The operation timed out.', 'TimeoutError');
    }) as unknown as typeof fetch;
    const signal = AbortSignal.abort(new DOMException('The operation timed out.', 'TimeoutError'));
    const error = await fetchThrough('discovery.get', `${issuer}.well-known/openid-configuration`, { signal }, { fetch: timedOut, tracer, ...noWait }).catch((e: unknown) => e);
    expect(error).toMatchObject({ code: 'oidc/timeout' });
    expect(tracer.spans[0]!.attributes).toMatchObject({ 'error.type': 'oidc/timeout', 'mariachi.integration.attempts': 1 });
    assertProviderSpans(tracer.spans);
  });
});

describe('the deadline on OIDC key fetches', () => {
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
