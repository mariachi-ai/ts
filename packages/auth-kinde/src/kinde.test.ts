import { InMemoryIdempotencyStore } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { beforeAll, describe, expect, it } from 'vitest';
import { KindeError } from './errors';
import { type KindeConfig, settings } from './generated';
import { KindeIdentityClient } from './identity-client';
import { KindeAuthProvider } from './provider';
import { type KindeTestKeys, fakeKindeIdentity, kindeTestKeys, signedKindeWebhook } from './testing';
import { KindeWebhookBody, kindeEventType, kindeWebhookAuth } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ISSUER = 'https://acme.kinde.com';
const config: KindeConfig = { issuerUrl: ISSUER, clientId: 'app-client', clientSecret: 'app-secret' };
const m2m = { ...config, m2mClientId: 'm2m-client', m2mClientSecret: 'm2m-secret' };
const noWait = { sleep: async () => {} };

let keys: KindeTestKeys;
beforeAll(async () => {
  keys = await kindeTestKeys(ISSUER);
});

describe('KindeAuthProvider', () => {
  it('verifies an access token and maps it: org_code is the tenant, permissions the scopes, role keys the roles', async () => {
    const auth = new KindeAuthProvider({ issuerUrl: `${ISSUER}/`, clientId: 'app-client', audience: 'https://api.acme.test' }, keys.jwks);
    const token = await keys.accessToken({ sub: 'kp_1', azp: 'app-client', aud: ['https://api.acme.test'], org_code: 'org_9', permissions: ['invoices:read'], roles: [{ id: 'r1', key: 'admin', name: 'Admin' }] });
    const identity = await auth.verify(token);
    expect(identity).toMatchObject({ userId: 'kp_1', tenantId: 'org_9', scopes: ['invoices:read'], roles: ['admin'], identityType: 'session' });
    expect(identity.claims?.azp).toBe('app-client');
  });

  it('refuses another issuer, another application, another audience, and an expired token', async () => {
    const auth = new KindeAuthProvider({ issuerUrl: ISSUER, clientId: 'app-client', audience: 'https://api.acme.test' }, keys.jwks);
    const good = { sub: 'kp_1', azp: 'app-client', aud: ['https://api.acme.test'] };
    const refused = expect.objectContaining({ code: 'auth/invalid-token' });
    await expect(auth.verify(await keys.accessToken({ ...good, iss: 'https://other.kinde.com' }))).rejects.toEqual(refused);
    await expect(auth.verify(await keys.accessToken({ ...good, azp: 'someone-else' }))).rejects.toEqual(refused);
    await expect(auth.verify(await keys.accessToken({ ...good, aud: ['https://other.test'] }))).rejects.toEqual(refused);
    await expect(auth.verify(await keys.accessToken({ ...good, exp: Math.floor(Date.now() / 1000) - 60 }))).rejects.toEqual(refused);
    const other = await kindeTestKeys(ISSUER);
    await expect(auth.verify(await other.accessToken(good))).rejects.toEqual(refused);
  });

  it('verifies an ID token for its claims', async () => {
    const auth = new KindeAuthProvider({ issuerUrl: ISSUER, clientId: 'app-client' }, keys.jwks);
    const idToken = await keys.sign({ iss: ISSUER, sub: 'kp_1', azp: 'app-client', aud: [ISSUER], email: 'ada@acme.test', exp: Math.floor(Date.now() / 1000) + 60 });
    expect(await auth.verifyIdToken(idToken)).toMatchObject({ sub: 'kp_1', email: 'ada@acme.test' });
  });

  it('refuses an issuer that is not https', () => {
    expect(() => new KindeAuthProvider({ issuerUrl: 'http://acme.kinde.com' })).toThrow(expect.objectContaining({ code: 'auth/invalid-config' }));
  });
});

describe('KindeIdentityClient', () => {
  const idToken = (claims: Record<string, unknown>) => keys.sign({ iss: ISSUER, sub: 'kp_1', azp: 'app-client', ...claims });
  const user = { id: 'kp_1', preferred_email: 'ada@acme.test', first_name: 'Ada', last_name: 'Lovelace', picture: 'https://img.test/a.png', provided_id: 'u_42' };
  const identities = { identities: [{ type: 'email', email: 'ada@acme.test', name: 'ada@acme.test', is_confirmed: true }] };

  it('builds the hosted sign-in URL with PKCE and the connection, and refuses a provider without one', () => {
    const client = new KindeIdentityClient({ ...config, connectionIds: { google: 'conn_g' }, audience: 'https://api.acme.test' });
    const url = new URL(client.authorizationUrl({ provider: 'google', redirectUri: 'https://app.test/cb', state: 'state-123', codeChallenge: 'chal', loginHint: 'ada@acme.test' }));
    expect(`${url.origin}${url.pathname}`).toBe(`${ISSUER}/oauth2/auth`);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      response_type: 'code',
      client_id: 'app-client',
      redirect_uri: 'https://app.test/cb',
      scope: 'openid profile email offline',
      state: 'state-123',
      code_challenge: 'chal',
      code_challenge_method: 'S256',
      connection_id: 'conn_g',
      audience: 'https://api.acme.test',
      login_hint: 'ada@acme.test',
    });
    expect(() => client.authorizationUrl({ provider: 'github', redirectUri: 'https://app.test/cb', state: 'state-123', codeChallenge: 'c' })).toThrow(expect.objectContaining({ code: 'auth/invalid-config' }));
    expect(client.logoutUrl('https://app.test/bye')).toBe(`${ISSUER}/logout?redirect=https%3A%2F%2Fapp.test%2Fbye`);
  });

  it('exchanges a code with the verifier and secret, one span, and reads the user from the ID token (unverified without the Management API)', async () => {
    const fetch = scriptedFetch({ json: { access_token: 'at', refresh_token: 'rt', expires_in: 3600, id_token: await idToken({ email: 'ada@acme.test', given_name: 'Ada', family_name: 'Lovelace' }) } });
    const tracer = new TestTracer();
    const result = await new KindeIdentityClient(config, { fetch, tracer, now: () => 1_000 }).exchangeCode({ code: 'c0de', codeVerifier: 'v3rifier', redirectUri: 'https://app.test/cb' });
    expect(result).toEqual({
      status: 'signed-in',
      user: { id: 'kp_1', email: 'ada@acme.test', emailVerified: false, name: 'Ada Lovelace', avatarUrl: null, externalId: null },
      tokens: { accessToken: 'at', refreshToken: 'rt', expiresAt: 3_601_000 },
    });
    const [req] = fetch.requests;
    expect(req!.url.href).toBe(`${ISSUER}/oauth2/token`);
    expect(Object.fromEntries(new URLSearchParams(req!.body))).toEqual({ grant_type: 'authorization_code', code: 'c0de', code_verifier: 'v3rifier', redirect_uri: 'https://app.test/cb', client_id: 'app-client', client_secret: 'app-secret' });
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([['kinde oauth.exchangeCode', 'client', 'acme.kinde.com']]);
    assertProviderSpans(tracer.spans);
  });

  it('with the Management API, reads the signed-in user’s record, verified when Kinde confirmed the email', async () => {
    const fetch = scriptedFetch(
      { json: { access_token: 'at', refresh_token: 'rt', id_token: await idToken({}) } },
      { json: { access_token: 'm2m-token', expires_in: 86399 } },
      { json: user },
      { json: identities },
    );
    const tracer = new TestTracer();
    const result = await new KindeIdentityClient(m2m, { fetch, tracer }).exchangeCode({ code: 'c', codeVerifier: 'v', redirectUri: 'https://app.test/cb' });
    expect(result.status === 'signed-in' && result.user).toEqual({ id: 'kp_1', email: 'ada@acme.test', emailVerified: true, name: 'Ada Lovelace', avatarUrl: 'https://img.test/a.png', externalId: 'u_42' });
    expect(Object.fromEntries(new URLSearchParams(fetch.requests[1]!.body))).toEqual({ grant_type: 'client_credentials', client_id: 'm2m-client', client_secret: 'm2m-secret', audience: `${ISSUER}/api` });
    expect(fetch.requests[2]!.url.href).toBe(`${ISSUER}/api/v1/user?id=kp_1`);
    expect(fetch.requests[2]!.headers.authorization).toBe('Bearer m2m-token');
    expect(fetch.requests[3]!.url.pathname).toBe('/api/v1/users/kp_1/identities');
    expect(tracer.spans.map((s) => s.name)).toEqual(['kinde oauth.exchangeCode', 'kinde oauth.clientCredentials', 'kinde users.get', 'kinde users.identities']);
    assertProviderSpans(tracer.spans);
  });

  it('keeps the Management API token until it expires', async () => {
    const fetch = scriptedFetch({ json: { access_token: 'm2m-token', expires_in: 86399 } }, { json: { users: [] } }, { json: { users: [] } });
    const client = new KindeIdentityClient(m2m, { fetch });
    expect(await client.findUserByEmail('nobody@acme.test')).toBeNull();
    expect(await client.findUserByEmail('nobody@acme.test')).toBeNull();
    expect(fetch.requests.map((r) => r.url.pathname)).toEqual(['/oauth2/token', '/api/v1/users', '/api/v1/users']);
    expect(fetch.requests[1]!.url.searchParams.get('email')).toBe('nobody@acme.test');
  });

  it('a refused code is auth/invalid-grant, with KindeError as the cause and none of Kinde’s message', async () => {
    const fetch = scriptedFetch({ status: 400, json: { error: 'invalid_grant', error_description: 'code c0de for ada@acme.test is spent' } });
    const err = await new KindeIdentityClient(config, { fetch }).exchangeCode({ code: 'c0de', codeVerifier: 'v', redirectUri: 'https://app.test/cb' }).catch((e) => e);
    expect([err.code, err.metadata.providerCode, err.metadata.kindeCode]).toEqual(['auth/invalid-grant', 'invalid_grant', 'kinde/invalid-grant']);
    expect(err.cause).toBeInstanceOf(KindeError);
    expect(err.message).not.toContain('ada@');
  });

  it('refreshes, retrying a rate limit, and keeps the refresh token when Kinde sends none back', async () => {
    const fetch = scriptedFetch({ status: 429, headers: { 'retry-after': '0' } }, { json: { access_token: 'at2' } });
    const tracer = new TestTracer();
    const tokens = await new KindeIdentityClient(config, { fetch, tracer, ...noWait }).refresh('rt1');
    expect([tokens.accessToken, tokens.refreshToken]).toEqual(['at2', 'rt1']);
    expect(Object.fromEntries(new URLSearchParams(fetch.requests[1]!.body))).toMatchObject({ grant_type: 'refresh_token', refresh_token: 'rt1' });
    expect(tracer.spans[0]!.attributes['mariachi.integration.attempts']).toBe(2);
    assertProviderSpans(tracer.spans);
  });

  it('signs out by revoking the refresh token, and does nothing without one', async () => {
    const fetch = scriptedFetch({ status: 200 });
    const client = new KindeIdentityClient(config, { fetch });
    await client.signOut({});
    await client.signOut({ refreshToken: 'rt1' });
    expect(fetch.requests).toHaveLength(1);
    expect(fetch.requests[0]!.url.pathname).toBe('/oauth2/revoke');
    expect(Object.fromEntries(new URLSearchParams(fetch.requests[0]!.body))).toEqual({ token: 'rt1', token_type_hint: 'refresh_token', client_id: 'app-client', client_secret: 'app-secret' });
  });

  it('reads, creates and deletes users; an unknown one is null, and a create is never retried', async () => {
    const token = { json: { access_token: 'm2m-token', expires_in: 86399 } };
    const fetch = scriptedFetch(token, { status: 404, json: { errors: [{ code: 'USER_NOT_FOUND', message: 'nope' }] } }, { status: 503 }, { json: { id: 'kp_2', created: true } }, { status: 404 });
    const client = new KindeIdentityClient(m2m, { fetch, ...noWait });
    expect(await client.getUser('kp_gone')).toBeNull();
    await expect(client.createUser({ email: 'grace@acme.test', emailVerified: true, name: 'Grace Hopper', externalId: 'u_7' })).rejects.toMatchObject({ code: 'auth/identity-provider' });
    expect(await client.createUser({ email: 'grace@acme.test', emailVerified: true, name: 'Grace Hopper' })).toEqual({ id: 'kp_2', email: 'grace@acme.test', emailVerified: true, name: 'Grace Hopper', avatarUrl: null, externalId: null });
    expect(fetch.requests[2]!.json).toEqual({ profile: { given_name: 'Grace Hopper' }, provided_id: 'u_7', identities: [{ type: 'email', is_verified: true, details: { email: 'grace@acme.test' } }] });
    await client.deleteUser('kp_gone');
    expect(fetch.requests.map((r) => `${r.method} ${r.url.pathname}`)).toEqual(['POST /oauth2/token', 'GET /api/v1/user', 'POST /api/v1/user', 'POST /api/v1/user', 'DELETE /api/v1/user']);
    await expect(client.createUser({ email: 'a@acme.test', emailVerified: false, password: 'pw' })).rejects.toMatchObject({ code: 'auth/not-supported' });
  });

  it('needs the machine-to-machine app for users, and says which settings', async () => {
    await expect(new KindeIdentityClient(config, { fetch: scriptedFetch() }).getUser('kp_1')).rejects.toMatchObject({ code: 'auth/invalid-config', message: expect.stringContaining('KINDE_M2M_CLIENT_ID') });
  });

  it("refuses what happens on Kinde's hosted pages", async () => {
    const client = new KindeIdentityClient(config);
    for (const call of [client.signInWithPassword(), client.startEmailCode(), client.sendPasswordReset(), client.setPassword()]) {
      await expect(call).rejects.toMatchObject({ code: 'auth/not-supported' });
    }
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    const env: Record<string, string> = { KINDE_ISSUER_URL: ISSUER, KINDE_CLIENT_ID: 'c', KINDE_CLIENT_SECRET: 's' };
    expect(settingsFromEnv(settings, (n) => env[n])).toEqual({ issuerUrl: ISSUER, clientId: 'c', clientSecret: 's' });
    expect(settings.every((s) => s.whereToFind)).toBe(true);
    expect(settings.every((s) => !s.environments)).toBe(true);
    expect(checkSetting(settings[0]!, 'test', ISSUER)).toBeNull();
  });
});

describe('webhooks', () => {
  class KindeWebhooks extends WebhookController {
    readonly prefix = 'kinde';
    readonly auth = kindeWebhookAuth({ issuerUrl: ISSUER, jwks: keys.jwks });
    init() {
      this.post('events', { mode: 'direct', procedure: 'users.fromKinde', eventType: kindeEventType }, async (_ctx, body) => KindeWebhookBody.parse(body));
    }
  }

  function server() {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    const s = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer, idempotency: new InMemoryIdempotencyStore() }).registerController(new KindeWebhooks());
    const post = (d: { rawBody: string; headers: Record<string, string> }) => s.inject({ method: 'POST', url: '/kinde/events', headers: d.headers, payload: d.rawBody });
    return { received, tracer, post };
  }

  const data = { user: { id: 'kp_1', email: 'ada@acme.test', first_name: 'Ada' } };

  it('receives a signed delivery through WebhookServer, with its span, and dedupes a replay on event_id', async () => {
    const { received, tracer, post } = server();
    const delivery = await signedKindeWebhook(keys, { type: 'user.created', event_id: 'event_1', data });
    expect((await post(delivery)).statusCode).toBe(200);
    expect(received[0]).toMatchObject({ type: 'user.created', event_id: 'event_1', data });
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])).toEqual([['kinde webhook', 'server', 'user.created']]);
    expect((await post(delivery)).json()).toMatchObject({ duplicate: true });
    expect(received).toHaveLength(1);
  });

  it('refuses a forged delivery, a stale one, and one that is not a JWT', async () => {
    const { received, post } = server();
    const forger = await kindeTestKeys(ISSUER);
    expect((await post(await signedKindeWebhook(forger, { type: 'user.created', data }))).statusCode).toBe(401);
    const stale = new Date(Date.now() - 10 * 60_000).toISOString();
    expect((await post(await signedKindeWebhook(keys, { type: 'user.created', timestamp: stale, data }))).statusCode).toBe(401);
    expect((await post({ rawBody: JSON.stringify({ type: 'user.created', event_id: 'e', timestamp: new Date().toISOString() }), headers: { 'content-type': 'application/json' } })).statusCode).toBe(401);
    expect(received).toHaveLength(0);
  });

  it('takes a wider timestamp window when told to', async () => {
    const handler = new KindeAuthProvider({ issuerUrl: ISSUER }, keys.jwks).createWebhookHandler({ toleranceSeconds: 3600 });
    const retried = await signedKindeWebhook(keys, { type: 'user.updated', timestamp: new Date(Date.now() - 30 * 60_000).toISOString(), data });
    expect((await handler.verify(retried.rawBody, retried.headers)).type).toBe('user.updated');
    const tooOld = await signedKindeWebhook(keys, { type: 'user.updated', timestamp: new Date(Date.now() - 2 * 3600_000).toISOString(), data });
    await expect(handler.verify(tooOld.rawBody, tooOld.headers)).rejects.toMatchObject({ code: 'auth/webhook-verification-failed' });
  });

  it('normalizes events for createAuthWebhookDispatcher', async () => {
    const handler = new KindeAuthProvider({ issuerUrl: ISSUER }, keys.jwks).createWebhookHandler();
    const signedIn = await signedKindeWebhook(keys, { type: 'user.authenticated', event_id: 'event_2', event_timestamp: '2026-11-21T10:00:00.000Z', data });
    expect(await handler.verify(signedIn.rawBody, signedIn.headers)).toMatchObject({ id: 'event_2', type: 'session.created', provider: 'kinde', data, timestamp: Date.parse('2026-11-21T10:00:00.000Z') });
    const deleted = await signedKindeWebhook(keys, { type: 'user.deleted', data });
    expect((await handler.verify(deleted.rawBody, deleted.headers)).type).toBe('user.deleted');
    const forged = await signedKindeWebhook(await kindeTestKeys(ISSUER), { type: 'user.deleted', data });
    await expect(handler.verify(forged.rawBody, forged.headers)).rejects.toMatchObject({ code: 'auth/webhook-verification-failed' });
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests', async () => {
    const ada = { id: 'kp_1', email: 'ada@acme.test', emailVerified: true, name: 'Ada', avatarUrl: null, externalId: null };
    const fake = fakeKindeIdentity({ users: [ada], codes: { c0de: 'kp_1' } });
    expect(await fake.exchangeCode({ code: 'c0de', codeVerifier: 'v', redirectUri: 'https://app.test/cb' })).toMatchObject({ status: 'signed-in', user: ada });
    await expect(fake.exchangeCode({ code: 'c0de', codeVerifier: 'v', redirectUri: 'https://app.test/cb' })).rejects.toMatchObject({ code: 'auth/invalid-grant' });
    expect(await fake.findUserByEmail('ADA@acme.test')).toEqual(ada);
    await expect(fake.signInWithPassword({ email: 'ada@acme.test', password: 'pw' })).rejects.toMatchObject({ code: 'auth/not-supported' });
  });
});
