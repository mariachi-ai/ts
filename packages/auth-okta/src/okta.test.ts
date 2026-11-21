import { settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair, jwtVerify } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';
import { settings } from './generated';
import { createOktaAuth, createOktaIdentityClient } from './index';
import { OktaAuthProvider } from './provider';
import { fakeOktaIdentity, oktaEventHookRequest, oktaLogEvent, oktaVerificationRequest } from './testing';
import { OktaEventHookBody, oktaAuthEvents, oktaEventType, oktaWebhookAuth } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ISSUER = 'https://acme.okta.test/oauth2/default';
const config = { issuer: ISSUER, clientId: '0oa-web', clientSecret: 'web-secret', apiToken: '00-api-token', eventHookSecret: 'hook-secret' };
const noWait = { sleep: async () => {} };
const form = (body: string | undefined) => Object.fromEntries(new URLSearchParams(body ?? ''));
const VERIFIER = 'v'.repeat(43);

let keys: Awaited<ReturnType<typeof generateKeyPair>>;
let jwks: ReturnType<typeof createLocalJWKSet>;
beforeAll(async () => {
  keys = await generateKeyPair('RS256', { extractable: true });
  jwks = createLocalJWKSet({ keys: [{ ...(await exportJWK(keys.publicKey)), kid: 'k1', alg: 'RS256' }] });
});

function accessToken(claims: Record<string, unknown>, opts: { iss?: string; aud?: string } = {}) {
  return new SignJWT({ cid: '0oa-web', uid: '00u123', scp: ['openid', 'orders:read'], ...claims })
    .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
    .setIssuer(opts.iss ?? ISSUER)
    .setAudience(opts.aud ?? 'api://default')
    .setSubject('ada@example.com')
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(keys.privateKey);
}

function idToken(claims: Record<string, unknown>) {
  return new SignJWT(claims).setProtectedHeader({ alg: 'RS256', kid: 'k1' }).setIssuer(ISSUER).setAudience('0oa-web').setIssuedAt().setExpirationTime('10m').sign(keys.privateKey);
}

describe('OktaAuthProvider', () => {
  const okta = () => new OktaAuthProvider(config, {}, jwks);

  it("takes the user from uid (not sub, a login), the scopes from scp and the roles from groups", async () => {
    const identity = await okta().verify(await accessToken({ groups: ['admins'] }));
    expect([identity.userId, identity.scopes, identity.roles, identity.tenantId]).toEqual(['00u123', ['openid', 'orders:read'], ['admins'], '']);
    expect(identity.claims?.sub).toBe('ada@example.com');
  });

  it('refuses a token for another client, without a user, for another audience, or from another server', async () => {
    await expect(okta().verify(await accessToken({ cid: '0oa-other' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    await expect(okta().verify(await accessToken({ uid: undefined }))).rejects.toMatchObject({ code: 'auth/invalid-token', message: expect.stringContaining('no user') });
    await expect(okta().verify(await accessToken({}, { aud: '0oa-web' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    await expect(okta().verify(await accessToken({}, { iss: 'https://acme.okta.test/oauth2/other' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    const mobile = new OktaAuthProvider(config, { clientIds: ['0oa-web', '0oa-mobile'] }, jwks);
    expect((await mobile.verify(await accessToken({ cid: '0oa-mobile' }))).userId).toBe('00u123');
  });

  it("refuses the org authorization server, and another server without its audience", () => {
    expect(() => createOktaAuth({ ...config, issuer: 'https://acme.okta.test' })).toThrow(/custom authorization server/);
    expect(() => createOktaAuth({ ...config, issuer: 'https://acme.okta.test/oauth2/aus123' })).toThrow(/OKTA_AUDIENCE/);
    expect(() => createOktaAuth({ ...config, issuer: 'http://acme.okta.test/oauth2/default' })).toThrow(/https/);
    expect(createOktaAuth({ ...config, issuer: 'https://acme.okta.test/oauth2/aus123', audience: 'https://api.example.com' }).name).toBe('okta');
  });

  it('sends Event Hooks to WebhookServer instead of the port handler', () => {
    expect(() => okta().createWebhookHandler()).toThrow(expect.objectContaining({ code: 'auth/not-supported' }));
  });
});

describe('OktaIdentityClient: sign-in', () => {
  it('builds the authorize URL with PKCE, the scopes and the identity provider', () => {
    const identity = createOktaIdentityClient(config, { identityProviderIds: { google: '0oa-google' } });
    const url = new URL(identity.authorizationUrl({ provider: 'google', redirectUri: 'https://app.test/callback', state: 'st', codeChallenge: 'c'.repeat(43), loginHint: 'ada@example.com' }));
    expect(url.origin + url.pathname).toBe(`${ISSUER}/v1/authorize`);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: '0oa-web',
      response_type: 'code',
      scope: 'openid email profile offline_access',
      redirect_uri: 'https://app.test/callback',
      state: 'st',
      code_challenge: 'c'.repeat(43),
      code_challenge_method: 'S256',
      login_hint: 'ada@example.com',
      idp: '0oa-google',
    });
    expect(() => identity.authorizationUrl({ provider: 'github', redirectUri: 'https://app.test/callback', state: 'st', codeChallenge: 'c'.repeat(43) })).toThrow(/identityProviderIds.github/);
    expect(new URL(identity.signInUrl({ redirectUri: 'https://app.test/callback', state: 'st', codeChallenge: 'c'.repeat(43) })).searchParams.has('idp')).toBe(false);
  });

  it('exchanges the code with the client secret, reads the user from the ID token, one span and nothing sensitive on it', async () => {
    const id = await idToken({ sub: '00u123', email: 'ada@example.com', email_verified: true, name: 'Ada Lovelace' });
    const fetch = scriptedFetch({ json: { access_token: await accessToken({}), token_type: 'Bearer', expires_in: 3600, refresh_token: 'rt1', id_token: id, scope: 'openid' } });
    const tracer = new TestTracer();
    const result = await createOktaIdentityClient(config, { fetch, tracer }).exchangeCode({ code: 'code1', codeVerifier: VERIFIER, redirectUri: 'https://app.test/callback' });
    expect(result.user).toEqual({ id: '00u123', email: 'ada@example.com', emailVerified: true, name: 'Ada Lovelace', avatarUrl: null, externalId: null });
    expect([result.tokens.refreshToken, result.tokens.idToken, typeof result.tokens.expiresAt]).toEqual(['rt1', id, 'number']);
    const [req] = fetch.requests;
    expect(req!.url.href).toBe(`${ISSUER}/v1/token`);
    expect(req!.headers.authorization).toBe(`Basic ${Buffer.from('0oa-web:web-secret').toString('base64')}`);
    expect(form(req!.body)).toEqual({ grant_type: 'authorization_code', code: 'code1', code_verifier: VERIFIER, redirect_uri: 'https://app.test/callback' });
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([['okta token.authorizationCode', 'client', 'acme.okta.test']]);
    assertProviderSpans(tracer.spans);
  });

  it("fails a refused code as auth/invalid-grant, keeping Okta's code but not its message, and never retries it", async () => {
    const fetch = scriptedFetch({ status: 400, json: { error: 'invalid_grant', error_description: 'The authorization code is invalid: code1' } });
    const err = await createOktaIdentityClient(config, { fetch, ...noWait }).exchangeCode({ code: 'code1', codeVerifier: VERIFIER, redirectUri: 'https://app.test/callback' }).catch((e) => e);
    expect([err.code, err.metadata.providerCode, err.cause.code, fetch.requests.length]).toEqual(['auth/invalid-grant', 'invalid_grant', 'okta/invalid-grant', 1]);
    expect(err.message).not.toContain('code1');
  });

  it('refreshes, keeping the refresh token when Okta returns none, and revokes it to sign out', async () => {
    const fetch = scriptedFetch({ json: { access_token: 'opaque', token_type: 'Bearer', expires_in: 60 } }, { status: 200 });
    const identity = createOktaIdentityClient(config, { fetch });
    expect((await identity.refresh('rt1')).refreshToken).toBe('rt1');
    await identity.signOut({ refreshToken: 'rt1', sessionId: 'ignored' });
    await identity.signOut({});
    expect(fetch.requests.map((r) => [r.url.pathname, form(r.body)])).toEqual([
      ['/oauth2/default/v1/token', { grant_type: 'refresh_token', refresh_token: 'rt1' }],
      ['/oauth2/default/v1/revoke', { token: 'rt1', token_type_hint: 'refresh_token' }],
    ]);
  });

  it("builds the logout URL that ends the browser's Okta session", () => {
    const url = new URL(createOktaIdentityClient(config).logoutUrl({ idToken: 'id1', postLogoutRedirectUri: 'https://app.test/', state: 's' }));
    expect([url.pathname, url.searchParams.get('id_token_hint'), url.searchParams.get('post_logout_redirect_uri')]).toEqual(['/oauth2/default/v1/logout', 'id1', 'https://app.test/']);
  });

  it('fails what Okta signs in on its own page with auth/not-supported, and calls nothing', async () => {
    const identity = createOktaIdentityClient(config, { fetch: scriptedFetch() });
    await expect(identity.signInWithPassword()).rejects.toMatchObject({ code: 'auth/not-supported' });
    await expect(identity.startEmailCode()).rejects.toMatchObject({ code: 'auth/not-supported' });
    await expect(identity.sendPasswordReset()).rejects.toMatchObject({ code: 'auth/not-supported' });
  });
});

describe('OktaIdentityClient: users', () => {
  const oktaUser = (over: Record<string, unknown> = {}) => ({ id: '00u123', status: 'ACTIVE', profile: { login: 'ada@example.com', email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace', employeeNumber: 'app-1' }, ...over });

  it('reads a user with the API token, null when Okta has none, and never claims the email verified', async () => {
    const fetch = scriptedFetch({ json: oktaUser() }, { status: 404, json: { errorCode: 'E0000007', errorSummary: 'Not found: Resource not found: 00u999 (User)' } });
    const tracer = new TestTracer();
    const identity = createOktaIdentityClient(config, { fetch, tracer, externalIdProperty: 'employeeNumber' });
    expect(await identity.getUser('00u123')).toEqual({ id: '00u123', email: 'ada@example.com', emailVerified: false, name: 'Ada Lovelace', avatarUrl: null, externalId: 'app-1' });
    expect(await identity.getUser('00u999')).toBeNull();
    expect([fetch.requests[0]!.url.href, fetch.requests[0]!.headers.authorization]).toEqual(['https://acme.okta.test/api/v1/users/00u123', 'SSWS 00-api-token']);
    assertProviderSpans(tracer.spans);
  });

  it('finds a user by email or login through search, and refuses a value that could break out of the quotes', async () => {
    const fetch = scriptedFetch({ json: [oktaUser()] }, { json: [] });
    const identity = createOktaIdentityClient(config, { fetch });
    expect((await identity.findUserByEmail('ADA@example.com'))?.id).toBe('00u123');
    expect(await identity.findUserByLogin('nobody')).toBeNull();
    expect(fetch.requests.map((r) => r.url.searchParams.get('search'))).toEqual(['profile.email eq "ADA@example.com"', 'profile.login eq "nobody"']);
    await expect(identity.findUserByLogin('x" or profile.login sw "')).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });

  it('creates an active user with a password, a staged one without, and never retries a create', async () => {
    const fetch = scriptedFetch({ json: oktaUser() }, { json: oktaUser({ status: 'STAGED' }) }, { status: 503 });
    const identity = createOktaIdentityClient(config, { fetch, ...noWait });
    await identity.createUser({ email: 'ada@example.com', emailVerified: true, password: 'pw', name: 'Ada King Lovelace' });
    await identity.createUser({ email: 'ada@example.com', emailVerified: false });
    expect(fetch.requests.map((r) => [r.url.search, r.json])).toEqual([
      ['?activate=true', { profile: { email: 'ada@example.com', login: 'ada@example.com', firstName: 'Ada', lastName: 'King Lovelace' }, credentials: { password: { value: 'pw' } } }],
      ['?activate=false', { profile: { email: 'ada@example.com', login: 'ada@example.com' } }],
    ]);
    await expect(identity.createUser({ email: 'x@example.com', emailVerified: false })).rejects.toMatchObject({ code: 'auth/identity-provider' });
    expect(fetch.requests).toHaveLength(3);
    await expect(identity.createUser({ email: 'x@example.com', emailVerified: false, externalId: 'a' })).rejects.toMatchObject({ code: 'auth/invalid-config' });
  });

  it('deletes by deactivating and then deleting, and a user already gone is fine', async () => {
    const fetch = scriptedFetch({ status: 204 }, { status: 204 }, { status: 404, json: { errorCode: 'E0000007' } });
    const identity = createOktaIdentityClient(config, { fetch });
    await identity.deleteUser('00u123');
    await identity.deleteUser('00u123');
    expect(fetch.requests.map((r) => `${r.method} ${r.url.pathname}`)).toEqual(Array(3).fill('DELETE /api/v1/users/00u123'));
  });

  it('retries a rate limit, then fails as auth/rate-limited', async () => {
    const limited = { status: 429, headers: { 'retry-after': '0' }, json: { errorCode: 'E0000047' } };
    const fetch = scriptedFetch(limited, limited, limited);
    const err = await createOktaIdentityClient(config, { fetch, ...noWait }).getUser('00u123').catch((e) => e);
    expect([err.code, fetch.requests.length]).toEqual(['auth/rate-limited', 3]);
  });

  it('prefers the service app: a private_key_jwt assertion for a token it keeps, sent as Bearer', async () => {
    const service = await generateKeyPair('RS256', { extractable: true });
    const jwk = { ...(await exportJWK(service.privateKey)), kid: 'svc1', alg: 'RS256' };
    const fetch = scriptedFetch({ json: { access_token: 'svc-token', token_type: 'Bearer', expires_in: 3600, scope: 'okta.users.read okta.users.manage' } }, { json: oktaUser() }, { json: [oktaUser()] });
    const tracer = new TestTracer();
    const identity = createOktaIdentityClient({ ...config, serviceClientId: '0oa-svc', servicePrivateKey: JSON.stringify(jwk) }, { fetch, tracer });
    await identity.getUser('00u123');
    await identity.findUserByEmail('ada@example.com');
    const [token, get, search] = fetch.requests;
    expect(token!.url.href).toBe('https://acme.okta.test/oauth2/v1/token');
    const body = form(token!.body);
    expect([body.grant_type, body.scope, body.client_assertion_type]).toEqual(['client_credentials', 'okta.users.read okta.users.manage', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer']);
    const { payload, protectedHeader } = await jwtVerify(body.client_assertion!, service.publicKey, { issuer: '0oa-svc', subject: '0oa-svc', audience: 'https://acme.okta.test/oauth2/v1/token' });
    expect([protectedHeader.kid, typeof payload.jti, (payload.exp ?? 0) - (payload.iat ?? 0)]).toEqual(['svc1', 'string', 300]);
    expect([get!.headers.authorization, search!.headers.authorization]).toEqual(['Bearer svc-token', 'Bearer svc-token']);
    expect(tracer.spans.map((s) => s.name)).toEqual(['okta token.clientCredentials', 'okta users.get', 'okta users.search']);
    assertProviderSpans(tracer.spans);
  });

  it('says to turn DPoP off when the service app requires it', async () => {
    const service = await generateKeyPair('RS256', { extractable: true });
    const fetch = scriptedFetch({ status: 400, json: { error: 'invalid_dpop_proof', error_description: 'The DPoP proof JWT header is missing.' } });
    const identity = createOktaIdentityClient({ ...config, serviceClientId: '0oa-svc', servicePrivateKey: JSON.stringify(await exportJWK(service.privateKey)) }, { fetch });
    await expect(identity.getUser('00u123')).rejects.toMatchObject({ code: 'auth/invalid-config', message: expect.stringContaining('DPoP') });
  });

  it('needs a way to call the Management API', async () => {
    await expect(createOktaIdentityClient({ issuer: ISSUER, clientId: '0oa-web' }).getUser('00u1')).rejects.toMatchObject({ code: 'auth/invalid-config' });
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ OKTA_ISSUER: ISSUER, OKTA_CLIENT_ID: '0oa-web' })[n])).toEqual({ issuer: ISSUER, clientId: '0oa-web' });
    expect(() => settingsFromEnv(settings, () => undefined)).toThrow(/OKTA_ISSUER, OKTA_CLIENT_ID/);
    expect(settings.filter((s) => s.secret).map((s) => s.env)).toEqual(['OKTA_CLIENT_SECRET', 'OKTA_API_TOKEN', 'OKTA_SERVICE_PRIVATE_KEY', 'OKTA_EVENT_HOOK_SECRET']);
  });
});

describe('Event Hooks', () => {
  class OktaWebhooks extends WebhookController {
    readonly prefix = 'okta';
    readonly auth = oktaWebhookAuth('hook-secret');
    init() {
      const route = { mode: 'direct', procedure: 'okta.events', eventType: oktaEventType } as const;
      const handler = async (_c: unknown, body: unknown) => OktaEventHookBody.parse(body);
      this.get('events', route, handler);
      this.post('events', route, handler);
    }
  }

  function server() {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_c: unknown, _n: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    return { received, tracer, server: new WebhookServer({ name: 'webhooks', logger }, { communication, tracer }).registerController(new OktaWebhooks()) };
  }

  it("answers Okta's one-time verification with its challenge, only when the secret matches, and never reaches the route", async () => {
    const { server: s, received, tracer } = server();
    const { headers, challenge } = oktaVerificationRequest('hook-secret');
    const ok = await s.inject({ method: 'GET', url: '/okta/events', headers });
    expect([ok.statusCode, ok.json()]).toEqual([200, { verification: challenge }]);
    expect(tracer.spans.map((sp) => [sp.name, sp.attributes['mariachi.integration.event']])).toEqual([['okta webhook', 'handshake']]);
    const rotating = new WebhookServer({ name: 'webhooks', logger }, { communication: { call: async () => ({}) } as never }).registerController(
      new (class extends OktaWebhooks {
        override readonly auth = oktaWebhookAuth(['new-secret', 'hook-secret']);
      })(),
    );
    expect((await rotating.inject({ method: 'GET', url: '/okta/events', headers })).json()).toEqual({ verification: challenge });
    expect((await s.inject({ method: 'GET', url: '/okta/events', headers: oktaVerificationRequest('guess').headers })).statusCode).toBe(401);
    expect((await s.inject({ method: 'GET', url: '/okta/events', headers: { authorization: 'hook-secret' } })).statusCode).toBe(401);
    expect(received).toEqual([]);
  });

  it('receives a delivery with the secret through WebhookServer, refuses a forged one, and reads it as the auth port\'s events', async () => {
    const { server: s, received, tracer } = server();
    const created = oktaLogEvent('user.lifecycle.create', { id: '00u123', login: 'ada@example.com', displayName: 'Ada Lovelace' });
    const { rawBody, headers } = oktaEventHookRequest([created], 'hook-secret');
    expect((await s.inject({ method: 'POST', url: '/okta/events', headers, payload: rawBody })).statusCode).toBe(200);
    expect(tracer.spans.map((sp) => [sp.name, sp.kind, sp.attributes['mariachi.integration.event']])).toEqual([['okta webhook', 'server', 'user.lifecycle.create']]);
    const forged = oktaEventHookRequest([created], 'someone-else');
    expect((await s.inject({ method: 'POST', url: '/okta/events', headers: forged.headers, payload: forged.rawBody })).statusCode).toBe(401);
    expect((await s.inject({ method: 'POST', url: '/okta/events', headers: { 'content-type': 'application/json' }, payload: rawBody })).statusCode).toBe(401);
    expect(received).toHaveLength(1);

    const [event] = oktaAuthEvents(received[0] as ReturnType<typeof OktaEventHookBody.parse>);
    expect(event).toMatchObject({ id: created.uuid, type: 'user.created', provider: 'okta', data: { userId: '00u123', login: 'ada@example.com', oktaEventType: 'user.lifecycle.create' } });
    expect(event!.timestamp).toBe(Date.parse(created.published));
  });

  it('normalizes lifecycle, profile and session events, and keeps the rest as Okta names them', () => {
    const user = { id: '00u1' };
    const signOut = oktaLogEvent('user.session.end', user, { target: [], actor: { id: '00u1', type: 'User', alternateId: 'ada@example.com' } });
    const { delivery } = oktaEventHookRequest(
      [oktaLogEvent('user.account.update_profile', user), oktaLogEvent('user.lifecycle.delete.initiated', user), oktaLogEvent('user.lifecycle.suspend', user), signOut, oktaLogEvent('user.session.clear', user)],
      'hook-secret',
    );
    const events = oktaAuthEvents(delivery);
    expect(events.map((e) => e.type)).toEqual(['user.updated', 'user.deleted', 'user.lifecycle.suspend', 'session.ended', 'session.revoked']);
    expect(events[3]!.data.userId).toBe('00u1');
    expect(oktaEventType(delivery)).toBe('com.okta.event_hook');
  });
});

describe('the fake', () => {
  it("stands in for the identity client in an app's tests", async () => {
    const okta = fakeOktaIdentity({ users: [{ id: '00u1', email: 'ada@example.com', emailVerified: true, name: 'Ada', avatarUrl: null, externalId: null }] });
    okta.codes_.set('code1', '00u1');
    const signedIn = await okta.exchangeCode({ code: 'code1', codeVerifier: VERIFIER, redirectUri: 'https://app.test/cb' });
    expect(signedIn.user.id).toBe('00u1');
    await expect(okta.exchangeCode({ code: 'code1', codeVerifier: VERIFIER, redirectUri: 'https://app.test/cb' })).rejects.toMatchObject({ code: 'auth/invalid-grant' });
    await okta.signOut({ refreshToken: signedIn.tokens.refreshToken });
    await expect(okta.refresh(signedIn.tokens.refreshToken)).rejects.toMatchObject({ code: 'auth/invalid-grant' });
    expect((await okta.findUserByEmail('ADA@example.com'))?.id).toBe('00u1');
  });
});
