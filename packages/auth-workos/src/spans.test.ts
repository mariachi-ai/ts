import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { SignJWT, exportJWK, generateKeyPair } from 'jose';
import { describe, expect, it, vi } from 'vitest';
import { WorkOSIdentityClient } from './identity-client';
import { WorkOSAuthProvider } from './provider';
import { fetchThrough } from './provider-fetch';

const CONFIG = { apiKey: 'sk_test_unit', clientId: 'client_01TEST' };
const noWait = { sleep: async () => {} };
const user = { object: 'user', id: 'user_01', email: 'ada@example.org', emailVerified: true, name: 'Ada', firstName: null, lastName: null, profilePictureUrl: null, externalId: null, metadata: {} };
const accessToken = `${Buffer.from('{"alg":"RS256"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sid: 'session_01' })).toString('base64url')}.sig`;
/** An exception as the SDK throws it. */
const sdkError = (name: string, fields: Record<string, unknown>) => Object.assign(new Error(String(fields.message ?? name)), { name, ...fields });

function client(userManagement: Record<string, unknown>, tracer: TestTracer, deps = {}) {
  return new WorkOSIdentityClient(CONFIG, { userManagement } as never, { tracer, ...deps });
}

describe('WorkOSIdentityClient calls', () => {
  it('wraps each SDK call in one CLIENT span named for the operation, with nothing about the user on it', async () => {
    const tracer = new TestTracer();
    const c = client(
      {
        authenticateWithPassword: vi.fn(async () => ({ user, accessToken, refreshToken: 'rt_1' })),
        getUser: vi.fn(async () => user),
        listUsers: vi.fn(async () => ({ data: [user] })),
      },
      tracer,
    );
    await c.signInWithPassword({ email: 'ada@example.org', password: 'pw' });
    await c.getUser('user_01');
    await c.findUserByEmail('ada@example.org');
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['http.request.method'], s.attributes['server.address'], s.status?.status])).toEqual([
      ['workos authenticate.password', 'client', 'POST', 'api.workos.com', 'ok'],
      ['workos users.get', 'client', 'GET', 'api.workos.com', 'ok'],
      ['workos users.list', 'client', 'GET', 'api.workos.com', 'ok'],
    ]);
    for (const span of tracer.spans) expect(JSON.stringify(span)).not.toMatch(/user_01|ada@|rt_1|sk_test/);
    assertProviderSpans(tracer.spans);
  });

  it("keeps a pending sign-in, and records WorkOS's code and the category on the span", async () => {
    const tracer = new TestTracer();
    const pending = sdkError('AuthenticationException', {
      status: 403,
      code: 'email_verification_required',
      pendingAuthenticationToken: 'pat_1',
      rawData: { code: 'email_verification_required', email: 'ada@example.org', email_verification_id: 'email_verification_01' },
    });
    const c = client({ authenticateWithPassword: vi.fn(async () => Promise.reject(pending)) }, tracer);
    expect(await c.signInWithPassword({ email: 'ada@example.org', password: 'pw' })).toMatchObject({
      status: 'pending',
      reason: 'email-verification',
      pendingToken: 'pat_1',
      providerData: { emailVerificationId: 'email_verification_01' },
    });
    expect(tracer.spans[0]!.attributes).toMatchObject({
      'http.response.status_code': 403,
      'error.type': 'email_verification_required',
      'mariachi.integration.error_category': 'forbidden',
      'mariachi.integration.attempts': 1,
    });
    assertProviderSpans(tracer.spans);
  });

  it("fails with the port's AuthError, never a ProviderError, the category in the metadata", async () => {
    const tracer = new TestTracer();
    const refused = sdkError('BadRequestException', { status: 400, code: 'invalid_grant', message: 'The code is invalid' });
    const c = client({ authenticateWithRefreshToken: vi.fn(async () => Promise.reject(refused)) }, tracer);
    const error = await c.refresh('rt_1').catch((e: unknown) => e);
    expect(error).toMatchObject({ name: 'AuthError', code: 'auth/invalid-grant', metadata: { status: 400, code: 'invalid_grant', category: 'invalid-request' } });
    assertProviderSpans(tracer.spans);
  });

  it("retries a read through an outage, a rate-limited POST after WorkOS's Retry-After, and never a POST after an outage", async () => {
    const tracer = new TestTracer();
    const waits: number[] = [];
    const deps = { sleep: async (ms: number) => void waits.push(ms) };
    const down = sdkError('GenericServerException', { status: 503 });
    const getUser = vi.fn().mockRejectedValueOnce(down).mockResolvedValueOnce(user);
    const limited = sdkError('RateLimitExceededException', { status: 429, retryAfter: 2 });
    const authenticateWithPassword = vi.fn().mockRejectedValueOnce(limited).mockResolvedValueOnce({ user, accessToken, refreshToken: 'rt_1' });
    const createUser = vi.fn().mockRejectedValue(down);
    const c = client({ getUser, authenticateWithPassword, createUser }, tracer, deps);

    expect(await c.getUser('user_01')).toMatchObject({ id: 'user_01' });
    expect(await c.signInWithPassword({ email: 'ada@example.org', password: 'pw' })).toMatchObject({ status: 'signed-in' });
    await expect(c.createUser({ email: 'ada@example.org', emailVerified: true })).rejects.toMatchObject({ name: 'AuthError', code: 'auth/identity-provider' });

    expect(createUser).toHaveBeenCalledTimes(1);
    expect(waits.slice(1)).toEqual([2000]);
    expect(tracer.spans.map((s) => [s.name, s.attributes['mariachi.integration.attempts'], s.events.map((e) => e.attributes['http.response.status_code'])])).toEqual([
      ['workos users.get', 2, [503]],
      ['workos authenticate.password', 2, [429]],
      ['workos users.create', 1, []],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('treats a user already gone as deleted, with a not-found span', async () => {
    const tracer = new TestTracer();
    const c = client({ deleteUser: vi.fn(async () => Promise.reject(sdkError('NotFoundException', { status: 404, code: 'entity_not_found' }))) }, tracer, noWait);
    await expect(c.deleteUser('user_01')).resolves.toBeUndefined();
    expect(tracer.spans[0]!.attributes).toMatchObject({ 'error.type': 'entity_not_found', 'mariachi.integration.error_category': 'not-found' });
  });
});

describe('WorkOSAuthProvider calls', () => {
  it('fetches the keys in a workos jwks.get span', async () => {
    const { privateKey, publicKey } = await generateKeyPair('RS256');
    const jwk = { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };
    const fetch = scriptedFetch({ json: { keys: [jwk] } });
    const tracer = new TestTracer();
    const workos = new WorkOSAuthProvider({ clientId: 'client_01TEST' }, undefined, { fetch, tracer });
    const token = await new SignJWT({ sid: 'session_01' })
      .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
      .setIssuer('https://api.workos.com/user_management/client_01TEST')
      .setSubject('user_01')
      .setExpirationTime('5m')
      .sign(privateKey);
    expect(await workos.verify(token)).toMatchObject({ userId: 'user_01', sessionId: 'session_01' });
    expect(fetch.requests.map((r) => r.url.href)).toEqual(['https://api.workos.com/sso/jwks/client_01TEST']);
    expect(tracer.spans.map((s) => [s.name, s.attributes['server.address']])).toEqual([['workos jwks.get', 'api.workos.com']]);
    assertProviderSpans(tracer.spans);
  });
});

describe('the deadline on WorkOS key fetches', () => {
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

describe('WorkOSIdentityClient waits', () => {
  it('fails a rate-limited sign-in at once as auth/rate-limited when WorkOS asks for a long wait', async () => {
    const limited = sdkError('RateLimitExceededException', { status: 429, retryAfter: 5 });
    const authenticateWithPassword = vi.fn().mockRejectedValueOnce(limited).mockResolvedValueOnce({ user, accessToken, refreshToken: 'rt_1' });
    const c = client({ authenticateWithPassword }, new TestTracer());
    const started = Date.now();
    await expect(c.signInWithPassword({ email: 'ada@example.org', password: 'pw' })).rejects.toMatchObject({ code: 'auth/rate-limited' });
    expect(Date.now() - started).toBeLessThan(1_000);
    expect(authenticateWithPassword).toHaveBeenCalledTimes(1);
  });
});
