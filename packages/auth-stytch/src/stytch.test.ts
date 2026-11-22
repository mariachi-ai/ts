import { createAuthWebhookDispatcher } from '@mariachi/auth';
import { InMemoryIdempotencyStore } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { type JWK, SignJWT, exportJWK, generateKeyPair } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';
import { settings } from './generated';
import { StytchIdentityClient, readStytchOAuthCallback } from './identity-client';
import { STYTCH_SESSION_CLAIM, StytchAuthProvider } from './provider';
import { fakeStytchAuth, fakeStytchIdentity, signedStytchWebhook, stytchUserEvent } from './testing';
import { StytchWebhookBody, StytchWebhookHandler, stytchEventType, stytchWebhookAuth } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const PROJECT = 'project-test-11111111-2222-3333-4444-555555555555';
const LIVE = 'project-live-11111111-2222-3333-4444-555555555555';
const config = { projectId: PROJECT, secret: 'secret-test-abc', publicToken: 'public-token-test-xyz' };
const basic = `Basic ${Buffer.from(`${PROJECT}:secret-test-abc`).toString('base64')}`;
const noWait = { sleep: async () => {} };
const WHSEC = `whsec_${Buffer.from('a-webhook-signing-key-of-32-bytes').toString('base64')}`;

type PrivateKey = Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];

let privateKey: PrivateKey;
let jwk: JWK;

beforeAll(async () => {
  const pair = await generateKeyPair('RS256');
  privateKey = pair.privateKey;
  jwk = { ...(await exportJWK(pair.publicKey)), kid: 'jwk-test-1', alg: 'RS256', use: 'sig' };
});

async function sessionJwt(overrides: { sub?: string; aud?: string; iss?: string; iat?: number; exp?: number; session?: Record<string, unknown> | null; kid?: string; key?: PrivateKey } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const claims: Record<string, unknown> = { custom: 'claim' };
  if (overrides.session !== null) claims[STYTCH_SESSION_CLAIM] = overrides.session ?? { id: 'session-test-1', roles: ['stytch_user', 'editor'] };
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: overrides.kid ?? 'jwk-test-1' })
    .setSubject(overrides.sub ?? 'user-test-1')
    .setAudience(overrides.aud ?? PROJECT)
    .setIssuer(overrides.iss ?? `stytch.com/${PROJECT}`)
    .setIssuedAt(overrides.iat ?? now)
    .setExpirationTime(overrides.exp ?? now + 300)
    .sign(overrides.key ?? privateKey);
}

const stytchUser = (over: Record<string, unknown> = {}) => ({
  user_id: 'user-test-1',
  emails: [{ email_id: 'email-test-1', email: 'ada@example.com', verified: true }],
  status: 'active',
  name: { first_name: 'Ada', last_name: 'Lovelace' },
  providers: [{ provider_type: 'Google', profile_picture_url: 'https://img.example.com/ada.png' }],
  external_id: 'app-42',
  roles: ['stytch_user'],
  ...over,
});
const session = { session_id: 'session-test-1', user_id: 'user-test-1', roles: ['stytch_user'], authentication_factors: [] };
const authenticated = async (extra: Record<string, unknown> = {}) => ({ status_code: 200, request_id: 'r', user_id: 'user-test-1', user: stytchUser(), session_token: 'st-1', session_jwt: await sessionJwt(), session, ...extra });
const stytchError = (status: number, type: string) => ({ status, json: { status_code: status, request_id: 'r', error_type: type, error_message: `Nope, ada@example.com: ${type}`, error_url: 'https://stytch.com/docs' } });

describe('StytchAuthProvider', () => {
  it('verifies a session JWT against the JWKS, fetched once through its span', async () => {
    const fetch = scriptedFetch({ json: { keys: [jwk], request_id: 'r', status_code: 200 } });
    const tracer = new TestTracer();
    const auth = new StytchAuthProvider({ projectId: PROJECT }, { fetch, tracer });
    const identity = await auth.verify(await sessionJwt());
    expect(identity).toMatchObject({ userId: 'user-test-1', tenantId: '', sessionId: 'session-test-1', roles: ['stytch_user', 'editor'], identityType: 'session', claims: { custom: 'claim' } });
    await auth.verify(await sessionJwt({ sub: 'user-test-2' }));
    expect(fetch.requests.map((r) => [r.method, r.url.href, r.headers.authorization])).toEqual([['GET', `https://test.stytch.com/v1/sessions/jwks/${PROJECT}`, undefined]]);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([['stytch sessions.jwks', 'client', 'test.stytch.com']]);
    assertProviderSpans(tracer.spans);
  });

  it("refuses another project's token, a foreign issuer, a token with no session, and an expired one", async () => {
    const auth = new StytchAuthProvider({ projectId: PROJECT }, { fetch: scriptedFetch({ json: { keys: [jwk] } }) });
    await expect(auth.verify(await sessionJwt({ aud: 'project-test-other' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    await expect(auth.verify(await sessionJwt({ iss: 'stytch.com/project-test-other' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    await expect(auth.verify(await sessionJwt({ session: null }))).rejects.toMatchObject({ code: 'auth/invalid-token', message: expect.stringContaining('not a session JWT') });
    const past = Math.floor(Date.now() / 1000) - 3600;
    await expect(auth.verify(await sessionJwt({ iat: past, exp: past + 300 }))).rejects.toMatchObject({ code: 'auth/token-expired' });
    // The issuer Stytch uses when called at the API's base URL
    await expect(auth.verify(await sessionJwt({ iss: 'https://test.stytch.com' }))).resolves.toMatchObject({ userId: 'user-test-1' });
  });

  it('refuses a token signed with a key that is not in the JWKS, fetching the JWKS again only after the cooldown', async () => {
    const other = await generateKeyPair('RS256');
    let now = Date.now();
    const fetch = scriptedFetch({ json: { keys: [jwk] } }, { json: { keys: [jwk] } });
    const auth = new StytchAuthProvider({ projectId: PROJECT }, { fetch, now: () => now });
    await expect(auth.verify(await sessionJwt({ kid: 'jwk-test-2', key: other.privateKey }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    await expect(auth.verify(await sessionJwt({ kid: 'jwk-test-2', key: other.privateKey }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    expect(fetch.requests).toHaveLength(1);
    now += 31_000;
    await expect(auth.verify(await sessionJwt({ kid: 'jwk-test-2', key: other.privateKey }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    expect(fetch.requests).toHaveLength(2);
  });

  it('checks an older token with Stytch when asked, so a revoked session fails at once', async () => {
    const fetch = scriptedFetch({ json: { keys: [jwk] } }, { json: { session: { ...session, roles: ['admin'] }, session_token: 'st', session_jwt: 'jwt', user: stytchUser() } }, stytchError(404, 'session_not_found'));
    const tracer = new TestTracer();
    const auth = new StytchAuthProvider({ projectId: PROJECT, secret: 'secret-test-abc', maxTokenAgeSeconds: 0 }, { fetch, tracer });
    const token = await sessionJwt();
    await expect(auth.verify(token)).resolves.toMatchObject({ roles: ['admin'] });
    expect([fetch.requests[1]!.url.pathname, fetch.requests[1]!.headers.authorization, fetch.requests[1]!.json]).toEqual(['/v1/sessions/authenticate', basic, { session_jwt: token }]);
    await expect(auth.verify(token)).rejects.toMatchObject({ code: 'auth/invalid-session' });
    expect(tracer.spans.map((s) => s.name)).toEqual(['stytch sessions.jwks', 'stytch sessions.authenticate', 'stytch sessions.authenticate']);
    assertProviderSpans(tracer.spans);
    expect(() => new StytchAuthProvider({ projectId: PROJECT, maxTokenAgeSeconds: 60 })).toThrow(/needs `secret`/);
  });

  it('reads a Live project from api.stytch.com', async () => {
    const fetch = scriptedFetch({ json: { keys: [jwk] } });
    await new StytchAuthProvider({ projectId: LIVE }, { fetch }).verify(await sessionJwt({ aud: LIVE, iss: `stytch.com/${LIVE}` }));
    expect(fetch.requests[0]!.url.host).toBe('api.stytch.com');
  });
});

describe('StytchIdentityClient', () => {
  const client = (fetch: ReturnType<typeof scriptedFetch>, tracer?: TestTracer, extra: Record<string, unknown> = {}) => new StytchIdentityClient({ ...config, ...extra }, { fetch, tracer, ...noWait });

  it('signs in with a password: Basic auth, a session, the tokens and the user', async () => {
    const fetch = scriptedFetch({ json: await authenticated() });
    const tracer = new TestTracer();
    const result = await client(fetch, tracer).signInWithPassword({ email: 'ada@example.com', password: 'pw' });
    const [req] = fetch.requests;
    expect([req!.method, req!.url.href, req!.headers.authorization]).toEqual(['POST', 'https://test.stytch.com/v1/passwords/authenticate', basic]);
    expect(req!.json).toEqual({ email: 'ada@example.com', password: 'pw', session_duration_minutes: 60 });
    expect(result).toMatchObject({
      status: 'signed-in',
      user: { id: 'user-test-1', email: 'ada@example.com', emailVerified: true, name: 'Ada Lovelace', avatarUrl: 'https://img.example.com/ada.png', externalId: 'app-42' },
      tokens: { refreshToken: 'st-1', sessionId: 'session-test-1', expiresAt: expect.any(Number) },
    });
    expect(tracer.spans.map((s) => [s.name, s.kind])).toEqual([['stytch passwords.authenticate', 'client']]);
    assertProviderSpans(tracer.spans);
  });

  it("turns Stytch's refusals into the port's AuthErrors, without Stytch's message", async () => {
    const fetch = scriptedFetch(
      stytchError(401, 'unauthorized_credentials'),
      stytchError(400, 'reset_password'),
      stytchError(429, 'user_lock_limit_reached'),
      { status: 429, headers: { 'retry-after': '0' }, json: { error_type: 'too_many_requests' } },
      { status: 429, headers: { 'retry-after': '0' }, json: { error_type: 'too_many_requests' } },
      { status: 429, headers: { 'retry-after': '0' }, json: { error_type: 'too_many_requests' } },
      stytchError(400, 'wrong_stack_test'),
    );
    const c = client(fetch);
    const signIn = () => c.signInWithPassword({ email: 'ada@example.com', password: 'pw' }).catch((e) => e);
    const wrong = await signIn();
    expect([wrong.code, wrong.metadata.providerCode]).toEqual(['auth/invalid-credentials', 'unauthorized_credentials']);
    expect(wrong.message).not.toContain('ada@example.com');
    expect((await signIn()).code).toBe('auth/password-reset-required');
    expect((await signIn()).code).toBe('auth/account-locked');
    expect(fetch.requests).toHaveLength(3); // a locked user isn't retried
    expect((await signIn()).code).toBe('auth/rate-limited');
    expect(fetch.requests).toHaveLength(6); // a rate limit is, three times
    expect((await signIn()).code).toBe('auth/identity-provider');
  });

  it('starts social sign-in with the public token, PKCE and the state on the redirect URL', () => {
    const url = new URL(client(scriptedFetch()).authorizationUrl({ provider: 'github', redirectUri: 'https://app.example.com/auth/callback', state: 's1', codeChallenge: 'cc', loginHint: 'ada@example.com' }));
    expect(url.origin + url.pathname).toBe('https://test.stytch.com/v1/public/oauth/github/start');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      public_token: 'public-token-test-xyz',
      login_redirect_url: 'https://app.example.com/auth/callback?state=s1',
      signup_redirect_url: 'https://app.example.com/auth/callback?state=s1',
      code_challenge: 'cc',
      provider_login_hint: 'ada@example.com',
    });
    expect(readStytchOAuthCallback(new URLSearchParams('state=s1&stytch_token_type=oauth&token=tok'))).toEqual({ code: 'tok', state: 's1' });
    expect(readStytchOAuthCallback({ stytch_token_type: 'magic_links', token: 'tok', state: 's1' })).toBeNull();
    expect(() => new StytchIdentityClient({ projectId: PROJECT, secret: 's' }).authorizationUrl({ provider: 'google', redirectUri: 'https://a.b/c', state: 's', codeChallenge: 'c' })).toThrow(/publicToken/);
  });

  it('exchanges the OAuth token with the verifier', async () => {
    const res = await authenticated({ session: undefined, user_session: { ...session, session_id: 'session-test-oauth' }, provider_values: { access_token: 'google-secret' } });
    const fetch = scriptedFetch({ json: res });
    const result = await client(fetch).exchangeCode({ code: 'tok', codeVerifier: 'cv', redirectUri: 'https://app.example.com/auth/callback' });
    expect(fetch.requests[0]!.json).toEqual({ token: 'tok', code_verifier: 'cv', session_duration_minutes: 60 });
    expect(result).toMatchObject({ status: 'signed-in', tokens: { sessionId: 'session-test-oauth' } });
    expect(JSON.stringify(result)).not.toContain('google-secret');
  });

  it('signs in with an emailed code, by the email id', async () => {
    const fetch = scriptedFetch(
      { json: { user_id: 'user-test-1', email_id: 'email-test-1', user_created: false } },
      { json: { results: [stytchUser()], results_metadata: { total: 1, next_cursor: null } } },
      { json: await authenticated({ method_id: 'email-test-1' }) },
    );
    const c = client(fetch, undefined, { emailCodeExpirationMinutes: 10, sessionDurationMinutes: 120 });
    expect(await c.startEmailCode('ada@example.com', { ipAddress: '10.0.0.1' })).toEqual({ deliveredBy: 'provider' });
    expect(fetch.requests[0]!.json).toEqual({ email: 'ada@example.com', expiration_minutes: 10, attributes: { ip_address: '10.0.0.1' } });
    expect((await c.signInWithEmailCode({ email: 'ADA@example.com', code: '123456' })).status).toBe('signed-in');
    expect(fetch.requests[1]!.json).toEqual({ limit: 1, query: { operator: 'AND', operands: [{ filter_name: 'email_address', filter_value: ['ADA@example.com'] }] } });
    expect([fetch.requests[2]!.url.pathname, fetch.requests[2]!.json]).toEqual(['/v1/otps/authenticate', { method_id: 'email-test-1', code: '123456', session_duration_minutes: 120 }]);
  });

  it('refuses a code for an address with no user, and a wrong code', async () => {
    const fetch = scriptedFetch({ json: { results: [], results_metadata: {} } }, { json: { results: [stytchUser()], results_metadata: {} } }, stytchError(401, 'unable_to_auth_otp_code'));
    const c = client(fetch);
    await expect(c.signInWithEmailCode({ email: 'nobody@example.com', code: '1' })).rejects.toMatchObject({ code: 'auth/invalid-grant' });
    await expect(c.signInWithEmailCode({ email: 'ada@example.com', code: '1' })).rejects.toMatchObject({ code: 'auth/invalid-grant', metadata: { providerCode: 'unable_to_auth_otp_code' } });
  });

  it('refreshes with the session token and signs out by session id, a gone session being fine', async () => {
    const fetch = scriptedFetch({ json: { session, session_token: 'st-1', session_jwt: await sessionJwt(), user: stytchUser() } }, { json: { status_code: 200 } }, stytchError(404, 'session_not_found'), stytchError(401, 'unauthorized_credentials'));
    const c = client(fetch);
    expect(await c.refresh('st-1')).toMatchObject({ refreshToken: 'st-1', sessionId: 'session-test-1' });
    expect(fetch.requests[0]!.json).toEqual({ session_token: 'st-1' });
    await c.signOut({ sessionId: 'session-test-1' });
    await c.signOut({ refreshToken: 'st-1' });
    expect([fetch.requests[1]!.json, fetch.requests[2]!.json]).toEqual([{ session_id: 'session-test-1' }, { session_token: 'st-1' }]);
    await c.signOut({});
    expect(fetch.requests).toHaveLength(3);
    await expect(c.refresh('st-gone')).rejects.toMatchObject({ code: 'auth/invalid-grant' });
  });

  it('reads, finds, creates and deletes users', async () => {
    const fetch = scriptedFetch(
      { json: { ...stytchUser(), request_id: 'r', status_code: 200 } },
      stytchError(404, 'user_not_found'),
      { json: { results: [], results_metadata: {} } },
      { json: { user_id: 'user-test-9', email_id: 'e', session_token: '', session_jwt: '', user: stytchUser({ user_id: 'user-test-9', emails: [{ email_id: 'e', email: 'new@example.com', verified: false }] }) } },
      { json: { user_id: 'user-test-9', user: stytchUser({ user_id: 'user-test-9', external_id: 'app-9' }) } },
      { json: { user_id: 'user-test-9', status_code: 200 } },
      stytchError(404, 'user_not_found'),
    );
    const c = client(fetch);
    expect(await c.getUser('user-test-1')).toMatchObject({ id: 'user-test-1', email: 'ada@example.com' });
    expect(await c.getUser('user-test-gone')).toBeNull();
    expect(await c.findUserByEmail('nobody@example.com')).toBeNull();
    expect(await c.createUser({ email: 'new@example.com', emailVerified: true, password: 'long-password', name: 'Grace Brewster Hopper', externalId: 'app-9' })).toMatchObject({ id: 'user-test-9', externalId: 'app-9' });
    expect([fetch.requests[3]!.url.pathname, fetch.requests[3]!.json]).toEqual(['/v1/passwords', { email: 'new@example.com', password: 'long-password', name: { first_name: 'Grace', last_name: 'Brewster Hopper' } }]);
    expect([fetch.requests[4]!.method, fetch.requests[4]!.url.pathname, fetch.requests[4]!.json]).toEqual(['PUT', '/v1/users/user-test-9', { external_id: 'app-9' }]);
    await c.deleteUser('user-test-9');
    await c.deleteUser('user-test-9');
    expect(fetch.requests.at(-1)!.method).toBe('DELETE');
  });

  it('starts and finishes a password reset, which Stytch emails', async () => {
    const fetch = scriptedFetch({ json: { user_id: 'user-test-1', email_id: 'e' } }, stytchError(404, 'email_not_found'), { json: await authenticated() }, stytchError(401, 'unable_to_auth_password_reset_token'));
    const c = client(fetch, undefined, { passwordResetRedirectUrl: 'https://app.example.com/reset' });
    expect(await c.sendPasswordReset('ada@example.com')).toEqual({ deliveredBy: 'provider' });
    expect(fetch.requests[0]!.json).toEqual({ email: 'ada@example.com', reset_password_redirect_url: 'https://app.example.com/reset' });
    expect(await c.sendPasswordReset('nobody@example.com')).toEqual({ deliveredBy: 'nobody' });
    expect(await c.resetPassword({ token: 't', password: 'new-pw' })).toMatchObject({ id: 'user-test-1' });
    await expect(c.resetPassword({ token: 'used', password: 'new-pw' })).rejects.toMatchObject({ code: 'auth/invalid-grant' });
    await expect(c.setPassword('user-test-1', 'x')).rejects.toMatchObject({ code: 'auth/not-supported' });
  });

  it('needs the project id and secret', () => {
    expect(() => new StytchIdentityClient({ projectId: PROJECT } as never)).toThrow(/required/);
    expect(() => new StytchIdentityClient({ ...config, sessionDurationMinutes: 1 })).toThrow(/sessionDurationMinutes/);
  });
});

describe('settings', () => {
  it('reads from the environment by name, and tells a Live project id from a Test one', () => {
    expect(settingsFromEnv(settings, (n) => ({ STYTCH_PROJECT_ID: PROJECT, STYTCH_SECRET: 's' })[n])).toEqual({ projectId: PROJECT, secret: 's' });
    const projectId = settings.find((s) => s.key === 'projectId')!;
    expect(checkSetting(projectId, 'test', PROJECT)).toBeNull();
    expect(checkSetting(projectId, 'test', LIVE)).toMatch(/Live project id/);
    expect(checkSetting(projectId, 'production', LIVE)).toBeNull();
    expect(checkSetting(projectId, 'production', PROJECT)).toMatch(/project-live-/);
  });
});

describe('webhooks', () => {
  class StytchWebhooks extends WebhookController {
    readonly prefix = 'stytch';
    readonly auth = stytchWebhookAuth(WHSEC);
    init() {
      this.post('events', { mode: 'direct', procedure: 'users.fromStytch', eventType: stytchEventType }, async (_ctx, body) => StytchWebhookBody.parse(body));
    }
  }

  it('receives a signed delivery through WebhookServer, with its span, and refuses a forged one', async () => {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    const server = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer }).registerController(new StytchWebhooks());
    const { rawBody, headers } = signedStytchWebhook(stytchUserEvent('CREATE', { user_id: 'user-test-1', email: 'ada@example.com' }), WHSEC);
    const ok = await server.inject({ method: 'POST', url: '/stytch/events', headers: { 'content-type': 'application/json', ...headers }, payload: rawBody });
    expect(ok.statusCode).toBe(200);
    expect(received).toMatchObject([{ action: 'CREATE', object_type: 'user', id: 'user-test-1', user: { user_id: 'user-test-1' } }]);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])).toEqual([['stytch webhook', 'server', 'direct.user.create']]);

    const forged = signedStytchWebhook(stytchUserEvent('CREATE', { user_id: 'user-test-1' }), `whsec_${Buffer.from('someone-elses-key-of-enough-bytes').toString('base64')}`);
    expect((await server.inject({ method: 'POST', url: '/stytch/events', headers: { 'content-type': 'application/json', ...forged.headers }, payload: forged.rawBody })).statusCode).toBe(401);
    expect((await server.inject({ method: 'POST', url: '/stytch/events', headers: { 'content-type': 'application/json', ...headers }, payload: `${rawBody} ` })).statusCode).toBe(401);
    expect(received).toHaveLength(1);
  });

  it("normalizes users created, updated and deleted to the auth port's events", async () => {
    const calls: Array<{ name: string; input: unknown }> = [];
    const communication = { has: () => true, call: async (_ctx: unknown, name: string, input: unknown) => { calls.push({ name, input }); } } as never;
    const handler = new StytchAuthProvider({ projectId: PROJECT }).createWebhookHandler({ secret: WHSEC });
    const dispatcher = createAuthWebhookDispatcher({ handler, communication, logger, idempotency: new InMemoryIdempotencyStore() });
    for (const event of [stytchUserEvent('CREATE', { user_id: 'u1', email: 'a@b.co' }), stytchUserEvent('UPDATE', { user_id: 'u1' }, 'DASHBOARD'), stytchUserEvent('DELETE', { user_id: 'u1' })]) {
      const { rawBody, headers } = signedStytchWebhook(event, WHSEC);
      await dispatcher.handle(rawBody, headers);
    }
    expect(calls.map((c) => c.name)).toEqual(['auth.user.created', 'auth.user.updated', 'auth.user.deleted']);
    expect(calls[0]!.input).toMatchObject({ id: 'u1', user_id: 'u1', emails: [{ email: 'a@b.co' }] });
    expect(calls[2]!.input).toEqual({ id: 'u1' });

    const old = signedStytchWebhook(stytchUserEvent('CREATE', { user_id: 'u1' }), WHSEC, new Date(Date.now() - 3600_000));
    expect(() => new StytchWebhookHandler({ secret: WHSEC }).verify(old.rawBody, old.headers)).toThrow(expect.objectContaining({ code: 'auth/webhook-verification-failed' }));
    expect(() => new StytchWebhookHandler({ secret: '' })).toThrow(/secret/);
  });
});

describe('the fakes', () => {
  it('stand in for the identity client and the provider in an app’s tests', async () => {
    const identity = fakeStytchIdentity([{ email: 'ada@example.com', password: 'pw' }]);
    const auth = fakeStytchAuth(identity);
    const signedIn = await identity.signInWithPassword({ email: 'ada@example.com', password: 'pw' });
    if (signedIn.status !== 'signed-in') throw new Error('expected a sign-in');
    await expect(auth.verify(signedIn.tokens.accessToken)).resolves.toMatchObject({ userId: signedIn.user.id });
    await identity.signOut({ sessionId: signedIn.tokens.sessionId });
    await expect(auth.verify(signedIn.tokens.accessToken)).rejects.toMatchObject({ code: 'auth/invalid-token' });

    await identity.startEmailCode('grace@example.com');
    const code = identity.sentCodes.get('grace@example.com')!;
    await expect(identity.signInWithEmailCode({ email: 'grace@example.com', code })).resolves.toMatchObject({ status: 'signed-in', user: { emailVerified: true } });
    await expect(identity.signInWithPassword({ email: 'ada@example.com', password: 'wrong' })).rejects.toMatchObject({ code: 'auth/invalid-credentials' });
  });
});
