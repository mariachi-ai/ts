import { createHash } from 'node:crypto';
import { PROVIDER_METRICS } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestMetrics, TestTracer } from '@mariachi/testing';
import { SignJWT, exportJWK, generateKeyPair } from 'jose';
import { describe, expect, it } from 'vitest';
import { FusionAuthIdentityClient } from './identity-client';
import { FusionAuthAuthProvider } from './provider';
import { FusionAuthWebhookHandler } from './webhooks/handler';

const CONFIG = { serverUrl: 'https://auth.example.org', apiKey: 'fa-api-key', applicationId: 'app-1', clientId: 'client-1', clientSecret: 'secret-1' };
const noWait = { sleep: async () => {} };
const USER = { id: 'fa-user-1', email: 'ada@example.org', fullName: 'Ada Lovelace', identities: [{ type: 'email', value: 'ada@example.org', verified: true }] };
const jwt = (claims: Record<string, unknown>) => `${Buffer.from('{"alg":"RS256"}').toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.sig`;

describe('FusionAuthIdentityClient calls', () => {
  it('makes one CLIENT span per call, named for the operation, with no ids, emails or tokens on it', async () => {
    const fetch = scriptedFetch({ json: { token: jwt({ sub: 'fa-user-1', sid: 'rt-1' }), refreshToken: 'rt-1', user: USER } }, { json: { user: USER } });
    const tracer = new TestTracer();
    const metrics = new TestMetrics();
    const client = new FusionAuthIdentityClient(CONFIG, { fetch, tracer, metrics });

    expect(await client.signInWithPassword({ email: 'ada@example.org', password: 'pw' })).toMatchObject({ status: 'signed-in' });
    expect(await client.getUser('fa-user-1')).toMatchObject({ id: 'fa-user-1' });

    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['http.request.method'], s.attributes['server.address'], s.attributes['http.response.status_code']])).toEqual([
      ['fusionauth users.login', 'client', 'POST', 'auth.example.org', 200],
      ['fusionauth users.get', 'client', 'GET', 'auth.example.org', 200],
    ]);
    for (const span of tracer.spans) expect(JSON.stringify(span)).not.toMatch(/fa-user-1|ada@|rt-1|fa-api-key/);
    assertProviderSpans(tracer.spans);
    expect(metrics.count(PROVIDER_METRICS.calls, { integration: 'fusionauth', outcome: 'ok' })).toBe(2);
  });

  it("still reads FusionAuth's own statuses: a pending sign-in is a success, a user it doesn't have is null with a not-found span", async () => {
    const fetch = scriptedFetch({ status: 242, json: { twoFactorId: 'tf-1' } }, { status: 404 });
    const tracer = new TestTracer();
    const client = new FusionAuthIdentityClient(CONFIG, { fetch, tracer });

    expect(await client.signInWithPassword({ email: 'ada@example.org', password: 'pw' })).toEqual({ status: 'pending', reason: 'mfa', pendingToken: 'tf-1' });
    expect(await client.getUser('gone')).toBeNull();
    expect(tracer.spans.map((s) => [s.name, s.status?.status, s.attributes['error.type'] ?? null])).toEqual([
      ['fusionauth users.login', 'ok', null],
      ['fusionauth users.get', 'error', 'fusionauth/not-found'],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it("fails with the port's AuthError, never a ProviderError, with FusionAuth's code on the span and the category in the metadata", async () => {
    const body = { fieldErrors: { password: [{ code: '[tooShort]password', message: 'The [password] property is shorter than the minimum of [8] characters.' }] } };
    const tracer = new TestTracer();
    const client = new FusionAuthIdentityClient(CONFIG, { fetch: scriptedFetch({ status: 400, json: body }), tracer });

    const error = await client.setPassword('fa-user-1', 'short').catch((e: unknown) => e);
    expect(error).toMatchObject({ name: 'AuthError', code: 'auth/invalid-grant', metadata: { status: 400, category: 'invalid-request' } });
    expect(tracer.spans[0]!.attributes).toMatchObject({ 'error.type': '[tooShort]password', 'mariachi.integration.error_category': 'invalid-request' });
    assertProviderSpans(tracer.spans);
  });

  it('retries a read through an outage, but a POST only when it was rate limited', async () => {
    const tracer = new TestTracer();
    const reads = scriptedFetch({ status: 503 }, { json: { user: USER } });
    expect(await new FusionAuthIdentityClient(CONFIG, { fetch: reads, tracer, ...noWait }).findUserByEmail('ada@example.org')).toMatchObject({ id: 'fa-user-1' });

    const outage = scriptedFetch({ status: 503 });
    await expect(new FusionAuthIdentityClient(CONFIG, { fetch: outage, tracer, ...noWait }).signInWithPassword({ email: 'ada@example.org', password: 'pw' })).rejects.toMatchObject({ code: 'auth/identity-provider' });
    expect(outage.requests).toHaveLength(1);

    const limited = scriptedFetch({ status: 429, headers: { 'retry-after': '1' } }, { json: { token: jwt({ sub: 'fa-user-1' }), user: USER } });
    const waits: number[] = [];
    const client = new FusionAuthIdentityClient(CONFIG, { fetch: limited, tracer, sleep: async (ms) => void waits.push(ms) });
    expect(await client.signInWithPassword({ email: 'ada@example.org', password: 'pw' })).toMatchObject({ status: 'signed-in' });
    expect(waits).toEqual([1000]);

    expect(tracer.spans.map((s) => [s.name, s.attributes['mariachi.integration.attempts'], s.status?.status])).toEqual([
      ['fusionauth users.byEmail', 2, 'ok'],
      ['fusionauth users.login', 1, 'error'],
      ['fusionauth users.login', 2, 'ok'],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('fails a FusionAuth that cannot be reached with auth/identity-provider', async () => {
    const down = (async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;
    const tracer = new TestTracer();
    await expect(new FusionAuthIdentityClient(CONFIG, { fetch: down, tracer, ...noWait }).getUser('fa-user-1')).rejects.toMatchObject({
      name: 'AuthError',
      code: 'auth/identity-provider',
      metadata: { category: 'unavailable' },
    });
    expect(tracer.spans[0]!.attributes).toMatchObject({ 'mariachi.integration.attempts': 3, 'mariachi.integration.error_category': 'unavailable' });
  });
});

describe('the key fetches', () => {
  async function keys() {
    const { privateKey, publicKey } = await generateKeyPair('RS256');
    return { privateKey, jwk: { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' } };
  }

  it('verifies a token against keys fetched in a fusionauth jwks.get span', async () => {
    const { privateKey, jwk } = await keys();
    const fetch = scriptedFetch({ json: { keys: [jwk] } });
    const tracer = new TestTracer();
    const fa = new FusionAuthAuthProvider({ serverUrl: 'https://auth.example.org', clientId: 'client-1', issuer: 'acme.com' }, { fetch, tracer });
    const token = await new SignJWT({ roles: ['admin'] }).setProtectedHeader({ alg: 'RS256', kid: 'k1' }).setIssuer('acme.com').setAudience('client-1').setSubject('fa-user-1').setExpirationTime('5m').sign(privateKey);
    expect(await fa.verify(token)).toMatchObject({ userId: 'fa-user-1', roles: ['admin'] });
    expect(fetch.requests.map((r) => r.url.href)).toEqual(['https://auth.example.org/.well-known/jwks.json']);
    expect(tracer.spans.map((s) => s.name)).toEqual(['fusionauth jwks.get']);
    assertProviderSpans(tracer.spans);
  });

  it('checks an asymmetrically signed webhook against keys fetched the same way, from the handler the provider makes', async () => {
    const { privateKey, jwk } = await keys();
    const fetch = scriptedFetch({ json: { keys: [jwk] } });
    const tracer = new TestTracer();
    const handler = new FusionAuthAuthProvider({ serverUrl: 'https://auth.example.org', clientId: 'client-1', issuer: 'acme.com' }, { fetch, tracer }).createWebhookHandler({ secret: '' });
    expect(handler).toBeInstanceOf(FusionAuthWebhookHandler);
    const raw = JSON.stringify({ event: { id: 'ev-1', type: 'user.create', user: { id: 'fa-user-1' } } });
    const signature = await new SignJWT({ request_body_sha256: createHash('sha256').update(raw).digest('base64') }).setProtectedHeader({ alg: 'RS256', kid: 'k1' }).setIssuedAt().setExpirationTime('1m').sign(privateKey);
    expect(await handler.verify(raw, { 'x-fusionauth-signature-jwt': signature })).toMatchObject({ id: 'ev-1', type: 'user.created' });
    expect(tracer.spans.map((s) => s.name)).toEqual(['fusionauth jwks.get']);
    assertProviderSpans(tracer.spans);
  });
});
