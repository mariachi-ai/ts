import { InMemoryIdempotencyStore } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { beforeAll, describe, expect, it } from 'vitest';
import { DescopeError } from './errors';
import { settings } from './generated';
import { DescopeIdentityClient } from './identity-client';
import { DescopeAuthProvider } from './provider';
import { type DescopeTestKeys, descopeAuditEvent, descopeTestKeys, fakeDescopeIdentity, signedDescopeWebhook } from './testing';
import { DescopeWebhookBody, descopeAuthEvents, descopeEventType, descopeWebhookAuth } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const PROJECT = 'P2abcProject';
const config = { projectId: PROJECT, managementKey: 'K2mgmt' };
const noWait = { sleep: async () => {} };

let keys: DescopeTestKeys;
beforeAll(async () => {
  keys = await descopeTestKeys(PROJECT);
});

const user = { userId: 'U2ada', loginIds: ['ada@acme.test'], email: 'ada@acme.test', verifiedEmail: true, name: 'Ada Lovelace', picture: 'https://img.test/a.png' };
const adaIdentity = { id: 'U2ada', email: 'ada@acme.test', emailVerified: true, name: 'Ada Lovelace', avatarUrl: 'https://img.test/a.png', externalId: null };

describe('DescopeAuthProvider', () => {
  it('verifies a session token and maps the current tenant’s roles and permissions', async () => {
    const auth = new DescopeAuthProvider({ projectId: PROJECT }, keys.jwks);
    const token = await keys.sessionToken({ sub: 'U2ada', roles: ['member'], permissions: ['read'], dct: 'T2acme', tenants: { T2acme: { roles: ['admin'], permissions: ['invoices:write'] }, T2other: { roles: ['owner'] } } });
    expect(await auth.verify(token)).toMatchObject({ userId: 'U2ada', tenantId: 'T2acme', roles: ['member', 'admin'], scopes: ['read', 'invoices:write'], identityType: 'session' });
  });

  it('accepts each issuer form Descope documents for the project, and no other', async () => {
    const auth = new DescopeAuthProvider({ projectId: PROJECT }, keys.jwks);
    for (const iss of [`https://api.descope.com/v1/apps/${PROJECT}`, `https://api.descope.com/${PROJECT}`, PROJECT]) {
      expect((await auth.verify(await keys.sessionToken({ sub: 'U2ada', iss }))).userId).toBe('U2ada');
    }
    await expect(auth.verify(await keys.sessionToken({ sub: 'U2ada', iss: 'https://api.descope.com/P2someoneElse' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
  });

  it('refuses a refresh token, another key, and an expired token', async () => {
    const auth = new DescopeAuthProvider({ projectId: PROJECT }, keys.jwks);
    const refused = expect.objectContaining({ code: 'auth/invalid-token' });
    await expect(auth.verify(await keys.sessionToken({ sub: 'U2ada', drn: 'DSR' }))).rejects.toEqual(refused);
    await expect(auth.verify(await (await descopeTestKeys(PROJECT)).sessionToken({ sub: 'U2ada' }))).rejects.toEqual(refused);
    await expect(auth.verify(await keys.sessionToken({ sub: 'U2ada', exp: Math.floor(Date.now() / 1000) - 60 }))).rejects.toEqual(refused);
  });

  it('checks the audience when a JWT template sets one', async () => {
    const auth = new DescopeAuthProvider({ projectId: PROJECT, audience: PROJECT }, keys.jwks);
    expect((await auth.verify(await keys.sessionToken({ sub: 'U2ada', aud: PROJECT }))).userId).toBe('U2ada');
    await expect(auth.verify(await keys.sessionToken({ sub: 'U2ada' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
  });

  it('says where its webhooks go instead of making a handler', () => {
    expect(() => new DescopeAuthProvider({ projectId: PROJECT }, keys.jwks).createWebhookHandler()).toThrow(expect.objectContaining({ code: 'auth/not-supported' }));
  });
});

describe('DescopeIdentityClient', () => {
  it('signs in with a password as the project, one span, and nothing sensitive on it', async () => {
    const sessionJwt = await keys.sessionToken({ sub: 'U2ada', exp: 2_000_000_000 });
    const fetch = scriptedFetch({ json: { sessionJwt, refreshJwt: 'ref.jwt', user } });
    const tracer = new TestTracer();
    const result = await new DescopeIdentityClient(config, { fetch, tracer }).signInWithPassword({ email: 'ada@acme.test', password: 'hunter22' });
    expect(result).toEqual({ status: 'signed-in', user: adaIdentity, tokens: { accessToken: sessionJwt, refreshToken: 'ref.jwt', expiresAt: 2_000_000_000_000 } });
    const [req] = fetch.requests;
    expect(req!.url.href).toBe('https://api.descope.com/v1/auth/password/signin');
    expect(req!.headers.authorization).toBe(`Bearer ${PROJECT}`);
    expect(req!.json).toEqual({ loginId: 'ada@acme.test', password: 'hunter22' });
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([['descope password.signIn', 'client', 'api.descope.com']]);
    assertProviderSpans(tracer.spans);
  });

  it('a refused sign-in is auth/invalid-credentials, with DescopeError as the cause and none of Descope’s message', async () => {
    const fetch = scriptedFetch({ status: 401, json: { errorCode: 'E062108', errorDescription: 'User not found', errorMessage: 'ada@acme.test' } });
    const err = await new DescopeIdentityClient(config, { fetch }).signInWithPassword({ email: 'ada@acme.test', password: 'x' }).catch((e) => e);
    expect([err.code, err.metadata.providerCode, err.metadata.descopeCode]).toEqual(['auth/invalid-credentials', 'E062108', 'descope/user-not-found']);
    expect(err.cause).toBeInstanceOf(DescopeError);
    expect(err.message).not.toContain('ada@');
  });

  it('needs refresh tokens in the response body, and says so', async () => {
    const fetch = scriptedFetch({ json: { sessionJwt: 'a.b.c', user } });
    await expect(new DescopeIdentityClient(config, { fetch }).signInWithPassword({ email: 'ada@acme.test', password: 'x' })).rejects.toMatchObject({ code: 'auth/identity-provider', message: expect.stringContaining('response body') });
  });

  it('refreshes and signs out with the refresh JWT, retrying a rate limit', async () => {
    const fetch = scriptedFetch({ status: 429, headers: { 'retry-after': '0' } }, { json: { sessionJwt: 'next.session.jwt' } }, { json: {} });
    const tracer = new TestTracer();
    const client = new DescopeIdentityClient(config, { fetch, tracer, ...noWait });
    expect(await client.refresh('ref.jwt')).toMatchObject({ accessToken: 'next.session.jwt', refreshToken: 'ref.jwt' });
    await client.signOut({ refreshToken: 'ref.jwt' });
    await client.signOut({});
    expect(fetch.requests.map((r) => [r.url.pathname, r.headers.authorization])).toEqual([
      ['/v1/auth/refresh', `Bearer ${PROJECT}:ref.jwt`],
      ['/v1/auth/refresh', `Bearer ${PROJECT}:ref.jwt`],
      ['/v1/auth/logout', `Bearer ${PROJECT}:ref.jwt`],
    ]);
    expect(tracer.spans.map((s) => [s.name, s.attributes['mariachi.integration.attempts']])).toEqual([['descope sessions.refresh', 2], ['descope sessions.logout', 1]]);
    assertProviderSpans(tracer.spans);
  });

  it('reads, finds, creates and deletes users with the management key; an unknown one is null', async () => {
    const fetch = scriptedFetch(
      { json: { user } },
      { status: 400, json: { errorCode: 'E062108' } },
      { json: { users: [user], total: 1 } },
      { json: { user: { ...user, userId: 'U2grace', email: 'grace@acme.test', verifiedEmail: false, name: 'Grace' } } },
      { json: {} },
    );
    const client = new DescopeIdentityClient(config, { fetch });
    expect(await client.getUser('U2ada')).toEqual(adaIdentity);
    expect(await client.getUser('U2gone')).toBeNull();
    expect(await client.findUserByEmail('ADA@acme.test')).toEqual(adaIdentity);
    expect(await client.createUser({ email: 'grace@acme.test', emailVerified: false, name: 'Grace', password: 'pw-123456' })).toMatchObject({ id: 'U2grace', emailVerified: false });
    await client.deleteUser('U2gone');
    expect(fetch.requests.map((r) => `${r.method} ${r.url.pathname}${r.url.search}`)).toEqual([
      'GET /v1/mgmt/user?userId=U2ada',
      'GET /v1/mgmt/user?userId=U2gone',
      'POST /v2/mgmt/user/search',
      'POST /v1/mgmt/user/create',
      'POST /v1/mgmt/user/delete',
    ]);
    expect(fetch.requests.every((r) => r.headers.authorization === `Bearer ${PROJECT}:K2mgmt`)).toBe(true);
    expect(fetch.requests[2]!.json).toEqual({ emails: ['ADA@acme.test'], limit: 10 });
    expect(fetch.requests[3]!.json).toEqual({ loginId: 'grace@acme.test', email: 'grace@acme.test', verifiedEmail: false, name: 'Grace', password: 'pw-123456' });
    expect(fetch.requests[4]!.json).toEqual({ userId: 'U2gone' });
  });

  it('never retries a create, and refuses an external id it has nowhere to keep', async () => {
    const fetch = scriptedFetch({ status: 503 });
    const client = new DescopeIdentityClient(config, { fetch, ...noWait });
    await expect(client.createUser({ email: 'a@acme.test', emailVerified: true })).rejects.toMatchObject({ code: 'auth/identity-provider' });
    expect(fetch.requests).toHaveLength(1);
    await expect(client.createUser({ email: 'a@acme.test', emailVerified: true, externalId: 'u_1' })).rejects.toMatchObject({ code: 'auth/not-supported' });
  });

  it('needs the management key for users, and says which setting', async () => {
    await expect(new DescopeIdentityClient({ projectId: PROJECT }, { fetch: scriptedFetch() }).getUser('U2ada')).rejects.toMatchObject({ code: 'auth/invalid-config', message: expect.stringContaining('DESCOPE_MANAGEMENT_KEY') });
  });

  it('signs in with an emailed code: Descope sends it, signing a new address up', async () => {
    const fetch = scriptedFetch({ json: { maskedEmail: 'a***@acme.test' } }, { json: { sessionJwt: 's.j.w', refreshJwt: 'r', user } }, { status: 401, json: { errorCode: 'E061102' } });
    const client = new DescopeIdentityClient(config, { fetch });
    expect(await client.startEmailCode('ada@acme.test')).toEqual({ deliveredBy: 'provider' });
    expect(await client.signInWithEmailCode({ email: 'ada@acme.test', code: '123456' })).toMatchObject({ status: 'signed-in', user: adaIdentity });
    await expect(client.signInWithEmailCode({ email: 'ada@acme.test', code: '000000' })).rejects.toMatchObject({ code: 'auth/invalid-grant' });
    expect(fetch.requests.map((r) => [r.url.pathname, r.json])).toEqual([
      ['/v1/auth/otp/signup-in/email', { loginId: 'ada@acme.test' }],
      ['/v1/auth/otp/verify/email', { loginId: 'ada@acme.test', code: '123456' }],
      ['/v1/auth/otp/verify/email', { loginId: 'ada@acme.test', code: '000000' }],
    ]);
  });

  it('resets a password: the link is sent by Descope, its token verified as a magic link, the password updated with that session', async () => {
    const fetch = scriptedFetch({ json: {} }, { status: 400, json: { errorCode: 'E062108' } }, { json: { sessionJwt: 's.j.w', refreshJwt: 'reset.ref', user } }, { json: {} }, { json: {} });
    const client = new DescopeIdentityClient({ ...config, passwordResetUrl: 'https://app.test/reset' }, { fetch });
    expect(await client.sendPasswordReset('ada@acme.test')).toEqual({ deliveredBy: 'provider' });
    expect(await client.sendPasswordReset('nobody@acme.test')).toEqual({ deliveredBy: 'nobody' });
    expect(await client.resetPassword({ token: 'link-token', password: 'new-pw-123' })).toEqual(adaIdentity);
    expect(fetch.requests.map((r) => [r.url.pathname, r.headers.authorization, r.json])).toEqual([
      ['/v1/auth/password/reset', `Bearer ${PROJECT}`, { loginId: 'ada@acme.test', redirectUrl: 'https://app.test/reset' }],
      ['/v1/auth/password/reset', `Bearer ${PROJECT}`, { loginId: 'nobody@acme.test', redirectUrl: 'https://app.test/reset' }],
      ['/v1/auth/magiclink/verify', `Bearer ${PROJECT}`, { token: 'link-token' }],
      ['/v1/auth/password/update', `Bearer ${PROJECT}:reset.ref`, { loginId: 'ada@acme.test', newPassword: 'new-pw-123' }],
      ['/v1/auth/logout', `Bearer ${PROJECT}:reset.ref`, {}],
    ]);
  });

  it('sets a password by the user’s login id', async () => {
    const fetch = scriptedFetch({ json: { user } }, { json: {} });
    await new DescopeIdentityClient(config, { fetch }).setPassword('U2ada', 'pw-123456');
    expect(fetch.requests[1]!.url.pathname).toBe('/v1/mgmt/user/password/set/active');
    expect(fetch.requests[1]!.json).toEqual({ loginId: 'ada@acme.test', password: 'pw-123456' });
  });

  it('sends social sign-in to Descope Flows', async () => {
    const client = new DescopeIdentityClient(config);
    expect(() => client.authorizationUrl()).toThrow(expect.objectContaining({ code: 'auth/not-supported', message: expect.stringContaining('Flows') }));
    await expect(client.exchangeCode()).rejects.toMatchObject({ code: 'auth/not-supported' });
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ DESCOPE_PROJECT_ID: PROJECT })[n])).toEqual({ projectId: PROJECT });
    expect(settings.every((s) => s.whereToFind && !s.environments)).toBe(true);
    expect(checkSetting(settings[0]!, 'production', PROJECT)).toBeNull();
  });
});

describe('webhooks', () => {
  class DescopeWebhooks extends WebhookController {
    readonly prefix = 'descope';
    readonly auth = descopeWebhookAuth('whsec-descope');
    init() {
      this.post('audit', { mode: 'direct', procedure: 'audit.fromDescope', eventType: descopeEventType }, async (_ctx, body) => DescopeWebhookBody.parse(body));
    }
  }

  it('receives a signed batch through WebhookServer, with its span; a replay is a duplicate and a forgery a 401', async () => {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    const server = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer, idempotency: new InMemoryIdempotencyStore() }).registerController(new DescopeWebhooks());
    const post = (d: { rawBody: string; headers: Record<string, string> }) => server.inject({ method: 'POST', url: '/descope/audit', headers: d.headers, payload: d.rawBody });

    const events = [descopeAuditEvent({ action: 'UserCreated', userId: 'U2ada', loginIds: ['ada@acme.test'] }), descopeAuditEvent({ action: 'UserCreated', userId: 'U2grace' })];
    const delivery = signedDescopeWebhook(events, 'whsec-descope');
    expect((await post(delivery)).statusCode).toBe(200);
    expect(received[0]).toHaveLength(2);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])).toEqual([['descope webhook', 'server', 'UserCreated']]);
    expect((await post(delivery)).json()).toMatchObject({ duplicate: true });
    expect((await post(signedDescopeWebhook(events, 'someone-else'))).statusCode).toBe(401);
    expect((await post({ ...delivery, rawBody: `${delivery.rawBody} ` })).statusCode).toBe(401);
    expect(received).toHaveLength(1);
  });

  it('maps audit actions onto the auth port’s events, with stable ids', () => {
    const body = DescopeWebhookBody.parse([
      descopeAuditEvent({ action: 'UserModified', userId: 'U2ada', occurred: 1_780_000_000_000 }),
      descopeAuditEvent({ action: 'LoginSucceed', userId: 'U2ada', occurred: 1_780_000_000_001 }),
      descopeAuditEvent({ action: 'Change Password', userId: 'U2ada', occurred: 1_780_000_000_002 }),
    ]);
    const events = descopeAuthEvents(body);
    expect(events.map((e) => [e.type, e.provider, e.timestamp])).toEqual([
      ['user.updated', 'descope', 1_780_000_000_000],
      ['session.created', 'descope', 1_780_000_000_001],
      ['Change Password', 'descope', 1_780_000_000_002],
    ]);
    expect(descopeAuthEvents(body)[0]!.id).toBe(events[0]!.id);
    expect(descopeEventType(body)).toBe('batch');
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests', async () => {
    const fake = fakeDescopeIdentity({ users: [{ ...adaIdentity, password: 'pw' }] });
    expect(await fake.signInWithPassword({ email: 'ada@acme.test', password: 'pw' })).toMatchObject({ status: 'signed-in', user: adaIdentity });
    await fake.startEmailCode('new@acme.test');
    const result = await fake.signInWithEmailCode({ email: 'new@acme.test', code: fake.codes_.get('new@acme.test')! });
    expect(result.status === 'signed-in' && result.user.emailVerified).toBe(true);
    await fake.sendPasswordReset('ada@acme.test');
    await fake.resetPassword({ token: fake.resets_.get('ada@acme.test')!, password: 'pw2' });
    await expect(fake.signInWithPassword({ email: 'ada@acme.test', password: 'pw' })).rejects.toMatchObject({ code: 'auth/invalid-credentials' });
  });
});
