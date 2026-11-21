import { type JWK, SignJWT, exportJWK, generateKeyPair } from 'jose';
import { createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { beforeAll, describe, expect, it } from 'vitest';
import { settings } from './generated';
import { EntraIdentityClient } from './identity-client';
import { EntraAuthProvider } from './provider';
import { USER_SUBSCRIPTION_MAX_MINUTES, createEntraSubscriptions } from './subscriptions';
import { entraTestTenant, entraUserNotification, fakeEntraIdentity } from './testing';
import { EntraNotificationBody, entraAuthEvents, entraEventType, entraWebhookAuth } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const noWait = { sleep: async () => {} };

const TENANT = '11111111-2222-3333-4444-555555555555';
const OTHER = '99999999-8888-7777-6666-555555555555';
const CLIENT = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const ISSUER = `https://login.microsoftonline.com/${TENANT}/v2.0`;
const JWKS = `https://login.microsoftonline.com/${TENANT}/discovery/v2.0/keys`;

let privateKey: Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
let jwk: JWK;
beforeAll(async () => {
  const pair = await generateKeyPair('RS256', { extractable: true });
  privateKey = pair.privateKey;
  jwk = { ...(await exportJWK(pair.publicKey)), kid: 'k1', use: 'sig' };
});

function sign(claims: Record<string, unknown>, opts: { iss?: string; aud?: string; kid?: string; alg?: string } = {}) {
  return new SignJWT({ ver: '2.0', tid: TENANT, oid: 'user-oid', scp: 'access_as_user files.read', sid: 'sess-1', ...claims })
    .setProtectedHeader({ alg: 'RS256', kid: opts.kid ?? 'k1' })
    .setIssuer(opts.iss ?? ISSUER)
    .setAudience(opts.aud ?? CLIENT)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);
}

const discovery = (issuer = ISSUER, jwksUri = JWKS) => ({ json: { issuer, jwks_uri: jwksUri, authorization_endpoint: 'https://login.microsoftonline.com/x/oauth2/v2.0/authorize' } });
const keys = (...list: JWK[]) => ({ json: { keys: list } });

describe('EntraAuthProvider', () => {
  it("verifies a tenant's v2.0 access token with the keys its OpenID configuration names, one span per call", async () => {
    const fetch = scriptedFetch(discovery(), keys(jwk));
    const tracer = new TestTracer();
    const provider = new EntraAuthProvider({ tenantId: TENANT, clientId: CLIENT }, { fetch, tracer });
    const identity = await provider.verify(await sign({ roles: ['Admin'] }));
    expect(identity).toMatchObject({ userId: 'user-oid', tenantId: '', scopes: ['access_as_user', 'files.read'], roles: ['Admin'], identityType: 'session', sessionId: 'sess-1' });
    expect(fetch.requests.map((r) => r.url.href)).toEqual([`https://login.microsoftonline.com/${TENANT}/v2.0/.well-known/openid-configuration`, JWKS]);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([
      ['entra discovery.get', 'client', 'login.microsoftonline.com'],
      ['entra keys.list', 'client', 'login.microsoftonline.com'],
    ]);
    assertProviderSpans(tracer.spans);
    // The keys are kept: a second token needs no call
    await provider.verify(await sign({ oid: 'second' }));
    expect(fetch.requests).toHaveLength(2);
  });

  it('refuses a token for another audience, tenant or issuer, a v1.0 token, and one without oid', async () => {
    const provider = new EntraAuthProvider({ tenantId: TENANT, clientId: CLIENT }, { fetch: scriptedFetch(discovery(), keys(jwk)) });
    await expect(provider.verify(await sign({}, { aud: 'someone-else' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
    await expect(provider.verify(await sign({ tid: OTHER }))).rejects.toThrow(/another tenant/);
    await expect(provider.verify(await sign({}, { iss: `https://login.microsoftonline.com/${OTHER}/v2.0` }))).rejects.toThrow(/another tenant or authority/);
    await expect(provider.verify(await sign({ ver: '1.0' }, { iss: `https://sts.windows.net/${TENANT}/` }))).rejects.toThrow(/requestedAccessTokenVersion/);
    await expect(provider.verify(await sign({ oid: undefined }))).rejects.toThrow(/profile/);
    await expect(provider.verify('not.a.jwt')).rejects.toMatchObject({ code: 'auth/invalid-token' });
  });

  it("is a service identity for an application's own token (no scp), with its app roles", async () => {
    const provider = new EntraAuthProvider({ tenantId: TENANT, clientId: CLIENT }, { fetch: scriptedFetch(discovery(), keys(jwk)) });
    const identity = await provider.verify(await sign({ scp: undefined, sid: undefined, roles: ['Reports.Read.All'] }));
    expect(identity).toMatchObject({ identityType: 'service', scopes: [], roles: ['Reports.Read.All'] });
  });

  it('accepts any tenant for organizations, each by its own issuer, as its tenant, and only those allowed', async () => {
    const template = 'https://login.microsoftonline.com/{tenantid}/v2.0';
    const common = 'https://login.microsoftonline.com/organizations/discovery/v2.0/keys';
    const fetch = scriptedFetch(discovery(template, common), keys({ ...jwk, issuer: template } as JWK));
    const provider = new EntraAuthProvider({ tenantId: 'organizations', clientId: CLIENT, allowedTenants: [OTHER] }, { fetch });
    const identity = await provider.verify(await sign({ tid: OTHER }, { iss: `https://login.microsoftonline.com/${OTHER}/v2.0` }));
    expect(identity.tenantId).toBe(OTHER);
    await expect(provider.verify(await sign({}))).rejects.toThrow(/not allowed/);
    // The issuer must carry the token's own tid
    await expect(provider.verify(await sign({ tid: OTHER }, { iss: ISSUER }))).rejects.toThrow(/another tenant or authority/);
  });

  it("refuses a key whose own issuer is another one's", async () => {
    const template = 'https://login.microsoftonline.com/{tenantid}/v2.0';
    const pinned = { ...jwk, issuer: 'https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0' } as JWK;
    const provider = new EntraAuthProvider({ tenantId: 'common', clientId: CLIENT }, { fetch: scriptedFetch(discovery(template), keys(pinned)) });
    await expect(provider.verify(await sign({}))).rejects.toThrow(/signing key belongs to another issuer/);
  });

  it('reads the keys again for a key id not seen yet', async () => {
    const next = await generateKeyPair('RS256', { extractable: true });
    const k2 = { ...(await exportJWK(next.publicKey)), kid: 'k2' };
    const fetch = scriptedFetch(discovery(), keys(jwk), discovery(), keys(jwk, k2));
    const provider = new EntraAuthProvider({ tenantId: TENANT, clientId: CLIENT, keysCooldownMs: 0 }, { fetch });
    await provider.verify(await sign({}));
    const rotated = await new SignJWT({ ver: '2.0', tid: TENANT, oid: 'o', scp: 'x' }).setProtectedHeader({ alg: 'RS256', kid: 'k2' }).setIssuer(ISSUER).setAudience(CLIENT).setExpirationTime('1h').sign(next.privateKey);
    expect((await provider.verify(rotated)).userId).toBe('o');
    expect(fetch.requests).toHaveLength(4);
  });

  it("finds an External ID tenant's configuration on its ciamlogin.com host", async () => {
    const issuer = `https://${TENANT}.ciamlogin.com/${TENANT}/v2.0`;
    const fetch = scriptedFetch(discovery(issuer, `https://contoso.ciamlogin.com/${TENANT}/discovery/v2.0/keys`), keys(jwk));
    const provider = new EntraAuthProvider({ tenantId: TENANT, clientId: CLIENT, authority: 'https://contoso.ciamlogin.com' }, { fetch });
    expect((await provider.verify(await sign({}, { iss: issuer }))).userId).toBe('user-oid');
    expect(fetch.requests[0]!.url.href).toBe(`https://contoso.ciamlogin.com/${TENANT}/v2.0/.well-known/openid-configuration`);
    expect(() => new EntraAuthProvider({ tenantId: TENANT, clientId: CLIENT, authority: 'https://contoso.ciamlogin.com/x/v2.0' })).toThrow(/sign-in host alone/);
  });

  it('points webhooks at Graph change notifications', () => {
    expect(() => new EntraAuthProvider({ tenantId: TENANT, clientId: CLIENT }).createWebhookHandler()).toThrow(/entraWebhookAuth/);
  });
});

const idToken = (claims: Record<string, unknown>) =>
  `${Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.sig`;
const appToken = { json: { token_type: 'Bearer', expires_in: 3599, access_token: 'app-token' } };
const graphUser = (over: Record<string, unknown> = {}) => ({ json: { id: 'u1', displayName: 'Ada', mail: 'ada@contoso.com', userPrincipalName: 'ada@contoso.com', ...over } });
const config = { tenantId: TENANT, clientId: CLIENT, clientSecret: 'secret-value' };

describe('EntraIdentityClient', () => {
  it('sends the browser to the tenant with PKCE, and the scopes for its own API', () => {
    const url = new URL(new EntraIdentityClient(config).authorizationUrl({ provider: 'google', redirectUri: 'https://app.test/cb', state: 's1', codeChallenge: 'ch', loginHint: 'ada@contoso.com' }));
    expect(`${url.origin}${url.pathname}`).toBe(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize`);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: CLIENT,
      response_type: 'code',
      response_mode: 'query',
      redirect_uri: 'https://app.test/cb',
      scope: `openid profile email offline_access api://${CLIENT}/.default`,
      state: 's1',
      code_challenge: 'ch',
      code_challenge_method: 'S256',
      login_hint: 'ada@contoso.com',
    });
    const external = new URL(new EntraIdentityClient({ ...config, authority: 'https://contoso.ciamlogin.com/' }).authorizationUrl({ provider: 'google', redirectUri: 'https://app.test/cb', state: 's', codeChallenge: 'c' }));
    expect(external.host).toBe('contoso.ciamlogin.com');
  });

  it('redeems the code with its verifier, and reads the user from the ID token', async () => {
    const fetch = scriptedFetch({ json: { access_token: 'at', refresh_token: 'rt', expires_in: 3600, id_token: idToken({ oid: 'u1', sid: 'sess', email: 'ada@contoso.com', name: 'Ada' }) } });
    const tracer = new TestTracer();
    const result = await new EntraIdentityClient(config, { fetch, tracer, now: () => 1_000 }).exchangeCode({ code: 'c1', codeVerifier: 'v1', redirectUri: 'https://app.test/cb' });
    expect(result).toEqual({
      status: 'signed-in',
      user: { id: 'u1', email: 'ada@contoso.com', emailVerified: false, name: 'Ada', avatarUrl: null, externalId: null },
      tokens: { accessToken: 'at', refreshToken: 'rt', sessionId: 'sess', expiresAt: 3_601_000 },
    });
    const [req] = fetch.requests;
    expect(req!.url.href).toBe(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`);
    expect(Object.fromEntries(new URLSearchParams(req!.body))).toMatchObject({ grant_type: 'authorization_code', code: 'c1', code_verifier: 'v1', client_id: CLIENT, client_secret: 'secret-value', redirect_uri: 'https://app.test/cb' });
    expect(tracer.spans.map((s) => s.name)).toEqual(['entra tokens.exchangeCode']);
    assertProviderSpans(tracer.spans);
  });

  it("fails a refused code as auth/invalid-grant with Entra's code, never its description", async () => {
    const fetch = scriptedFetch({ status: 400, json: { error: 'invalid_grant', error_description: 'AADSTS70008: secret detail', error_codes: [70008] } });
    const err = await new EntraIdentityClient(config, { fetch }).exchangeCode({ code: 'used', codeVerifier: 'v', redirectUri: 'https://app.test/cb' }).catch((e) => e);
    expect([err.code, err.metadata.providerCode, err.metadata.category]).toEqual(['auth/invalid-grant', 'invalid_grant', 'invalid-request']);
    expect(err.message).not.toContain('secret detail');
  });

  it('keeps the refresh token when Entra returns no new one', async () => {
    const fetch = scriptedFetch({ json: { access_token: 'at2' } }, { json: { access_token: 'at3', refresh_token: 'rt-new' } });
    const client = new EntraIdentityClient(config, { fetch });
    expect((await client.refresh('rt-old')).refreshToken).toBe('rt-old');
    expect((await client.refresh('rt-old')).refreshToken).toBe('rt-new');
    expect(new URLSearchParams(fetch.requests[0]!.body).get('grant_type')).toBe('refresh_token');
  });

  it("reads users through Graph with the app's own token, got once and kept", async () => {
    const fetch = scriptedFetch(appToken, graphUser(), { status: 404, json: { error: { code: 'Request_ResourceNotFound', message: 'gone' } } });
    const tracer = new TestTracer();
    const client = new EntraIdentityClient(config, { fetch, tracer });
    expect(await client.getUser('u1')).toEqual({ id: 'u1', email: 'ada@contoso.com', emailVerified: false, name: 'Ada', avatarUrl: null, externalId: null });
    expect(await client.getUser('gone')).toBeNull();
    const [token, get] = fetch.requests;
    expect(Object.fromEntries(new URLSearchParams(token!.body))).toMatchObject({ grant_type: 'client_credentials', scope: 'https://graph.microsoft.com/.default' });
    expect(get!.url.origin + get!.url.pathname).toBe('https://graph.microsoft.com/v1.0/users/u1');
    expect(get!.headers.authorization).toBe('Bearer app-token');
    expect(tracer.spans.map((s) => [s.name, s.attributes['server.address']])).toEqual([
      ['entra tokens.appToken', 'login.microsoftonline.com'],
      ['entra users.get', 'graph.microsoft.com'],
      ['entra users.get', 'graph.microsoft.com'],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('finds a user by mail or userPrincipalName, and by email identity in an External ID tenant', async () => {
    const fetch = scriptedFetch(appToken, { json: { value: [graphUser().json] } }, appToken, { json: { value: [] } });
    expect((await new EntraIdentityClient(config, { fetch }).findUserByEmail("o'neil@contoso.com"))?.id).toBe('u1');
    expect(fetch.requests[1]!.url.searchParams.get('$filter')).toBe("mail eq 'o''neil@contoso.com' or userPrincipalName eq 'o''neil@contoso.com'");
    expect(await new EntraIdentityClient({ ...config, authority: 'https://contoso.ciamlogin.com' }, { fetch }).findUserByEmail('a@b.co')).toBeNull();
    expect(fetch.requests[3]!.url.searchParams.get('$filter')).toBe("identities/any(c:c/issuerAssignedId eq 'a@b.co' and c/issuer eq 'contoso.onmicrosoft.com')");
  });

  it('creates a member in a workforce tenant and a customer in an External ID tenant', async () => {
    const fetch = scriptedFetch(appToken, graphUser(), appToken, graphUser({ userPrincipalName: 'u1@contoso.onmicrosoft.com', mail: null, identities: [{ signInType: 'emailAddress', issuer: 'contoso.onmicrosoft.com', issuerAssignedId: 'a@b.co' }] }));
    await new EntraIdentityClient(config, { fetch }).createUser({ email: 'ada.l+x@contoso.com', emailVerified: true, password: 'P@ss-w0rd!', name: 'Ada' });
    expect(fetch.requests[1]!.json).toEqual({
      accountEnabled: true,
      displayName: 'Ada',
      mail: 'ada.l+x@contoso.com',
      mailNickname: 'ada.lx',
      userPrincipalName: 'ada.l+x@contoso.com',
      passwordProfile: { password: 'P@ss-w0rd!', forceChangePasswordNextSignIn: false },
    });
    const customer = await new EntraIdentityClient({ ...config, authority: 'https://contoso.ciamlogin.com' }, { fetch }).createUser({ email: 'a@b.co', emailVerified: false, password: 'P@ss-w0rd!' });
    expect(customer.email).toBe('a@b.co');
    expect(fetch.requests[3]!.json).toMatchObject({ identities: [{ signInType: 'emailAddress', issuer: 'contoso.onmicrosoft.com', issuerAssignedId: 'a@b.co' }], passwordPolicies: 'DisablePasswordExpiration' });
  });

  it('refuses a user without a password, or with an external id, before calling', async () => {
    const client = new EntraIdentityClient(config, { fetch: scriptedFetch() });
    await expect(client.createUser({ email: 'a@contoso.com', emailVerified: false })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(client.createUser({ email: 'a@contoso.com', emailVerified: false, password: 'x', externalId: 'app-1' })).rejects.toMatchObject({ code: 'auth/not-supported' });
  });

  it('deletes a user, one already gone included', async () => {
    const fetch = scriptedFetch(appToken, { status: 204 }, { status: 404, json: { error: { code: 'Request_ResourceNotFound' } } });
    const client = new EntraIdentityClient(config, { fetch });
    await client.deleteUser('u1');
    await client.deleteUser('u1');
    expect(fetch.requests.map((r) => r.method)).toEqual(['POST', 'DELETE', 'DELETE']);
  });

  it("retries Graph's rate limit, then fails as auth/rate-limited; a missing permission says so", async () => {
    const limited = { status: 429, headers: { 'retry-after': '0' } };
    const fetch = scriptedFetch(appToken, limited, limited, limited, { status: 403, json: { error: { code: 'Authorization_RequestDenied' } } });
    const client = new EntraIdentityClient(config, { fetch, ...noWait });
    await expect(client.getUser('u1')).rejects.toMatchObject({ code: 'auth/rate-limited' });
    await expect(client.getUser('u1')).rejects.toMatchObject({ code: 'auth/identity-provider', metadata: { providerCode: 'Authorization_RequestDenied' } });
    expect(fetch.requests).toHaveLength(5);
    const down = (async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;
    await expect(new EntraIdentityClient(config, { fetch: down, ...noWait }).refresh('rt')).rejects.toMatchObject({ code: 'auth/identity-provider', metadata: { category: 'unavailable' } });
  });

  it("fails the headless calls Entra doesn't offer, and builds the sign-out URL", async () => {
    const client = new EntraIdentityClient(config);
    for (const call of [() => client.signInWithPassword(), () => client.sendPasswordReset(), () => client.startEmailCode(), () => client.setPassword()]) {
      await expect(call()).rejects.toMatchObject({ code: 'auth/not-supported' });
    }
    await client.signOut({ sessionId: 's' });
    expect(client.signOutUrl({ postLogoutRedirectUri: 'https://app.test/bye' })).toBe(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/logout?post_logout_redirect_uri=https%3A%2F%2Fapp.test%2Fbye`);
  });
});

describe('createEntraSubscriptions', () => {
  const subConfig = { ...config, webhookClientState: 'cs-secret' };
  const sub = (over: Record<string, unknown> = {}) => ({ id: 'sub1', resource: 'users', changeType: 'updated,deleted', notificationUrl: 'https://app.test/webhooks/entra/users', expirationDateTime: '2026-12-01T00:00:00Z', ...over });

  it('creates the subscription on users when there is none, as long as Graph allows, with the clientState', async () => {
    const fetch = scriptedFetch(appToken, { json: { value: [] } }, { status: 201, json: sub() });
    const tracer = new TestTracer();
    const now = Date.parse('2026-11-21T00:00:00Z');
    await createEntraSubscriptions(subConfig, { fetch, tracer, now: () => now }).ensureUsers(ctx, { notificationUrl: 'https://app.test/webhooks/entra/users' });
    const body = fetch.requests[2]!.json as Record<string, string>;
    expect(body).toMatchObject({ changeType: 'updated,deleted', resource: 'users', clientState: 'cs-secret', notificationUrl: 'https://app.test/webhooks/entra/users' });
    expect((Date.parse(body.expirationDateTime!) - now) / 60_000).toBe(USER_SUBSCRIPTION_MAX_MINUTES - 5);
    expect(tracer.spans.map((s) => s.name)).toEqual(['entra tokens.appToken', 'entra subscriptions.list', 'entra subscriptions.create']);
    assertProviderSpans(tracer.spans);
  });

  it('renews the one already there', async () => {
    const fetch = scriptedFetch(appToken, { json: { value: [sub({ resource: '/users', notificationUrl: 'https://elsewhere.test' }), sub()] } }, { json: sub() });
    await createEntraSubscriptions(subConfig, { fetch }).ensureUsers(ctx, { notificationUrl: 'https://app.test/webhooks/entra/users' });
    expect([fetch.requests[2]!.method, fetch.requests[2]!.url.pathname]).toEqual(['PATCH', '/v1.0/subscriptions/sub1']);
    expect(Object.keys(fetch.requests[2]!.json as object)).toEqual(['expirationDateTime']);
  });

  it('checks its input and config', async () => {
    const subs = createEntraSubscriptions(subConfig, { fetch: scriptedFetch() });
    await expect(subs.create(ctx, { notificationUrl: 'http://app.test/hook' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(subs.create(ctx, { notificationUrl: 'https://app.test/hook', expiresInMinutes: USER_SUBSCRIPTION_MAX_MINUTES + 1 })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    expect(() => createEntraSubscriptions({ ...subConfig, webhookClientState: 'x'.repeat(129) })).toThrow(/128/);
  });
});

describe('webhooks', () => {
  class EntraWebhooks extends WebhookController {
    readonly prefix = 'entra';
    readonly auth = entraWebhookAuth('cs-secret');
    init() {
      this.post('users', { mode: 'direct', procedure: 'directory.userChanged', eventType: entraEventType }, async (_ctx, body) => EntraNotificationBody.parse(body));
    }
  }

  function server() {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_c: unknown, _n: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    return { received, tracer, server: new WebhookServer({ name: 'webhooks', logger }, { communication, tracer }).registerController(new EntraWebhooks()) };
  }

  it("answers Graph's validation handshake with the token as plain text", async () => {
    const { server: s, received } = server();
    const res = await s.inject({ method: 'POST', url: '/entra/users?validationToken=Validation%3A%20Testing%20client%20application', headers: { 'content-type': 'text/plain; charset=utf-8' }, payload: '' });
    expect([res.statusCode, res.headers['content-type'], res.body]).toEqual([200, 'text/plain; charset=utf-8', 'Validation: Testing client application']);
    const markup = await s.inject({ method: 'POST', url: '/entra/users?validationToken=%3Cscript%3E', headers: { 'content-type': 'text/plain' }, payload: '' });
    expect(markup.statusCode).toBe(401);
    expect(received).toHaveLength(0);
  });

  it('receives notifications whose clientState matches, with their span, and reads them as user events', async () => {
    const { server: s, received, tracer } = server();
    const { rawBody, headers } = entraUserNotification([{ userId: 'u1', changeType: 'updated' }, { userId: 'u2', changeType: 'updated' }], 'cs-secret');
    const ok = await s.inject({ method: 'POST', url: '/entra/users', headers, payload: rawBody });
    expect(ok.statusCode).toBe(200);
    const events = entraAuthEvents(received[0] as EntraNotificationBody);
    expect(events.map((e) => [e.type, e.data.id, e.provider])).toEqual([['user.updated', 'u1', 'entra'], ['user.updated', 'u2', 'entra']]);
    expect(tracer.spans.map((sp) => [sp.name, sp.kind, sp.attributes['mariachi.integration.event']])).toEqual([['entra webhook', 'server', 'updated']]);
  });

  it('refuses a delivery when any notification carries another clientState', async () => {
    const { server: s, received } = server();
    const forged = entraUserNotification([{ userId: 'u1', changeType: 'deleted' }], 'guessed');
    expect((await s.inject({ method: 'POST', url: '/entra/users', headers: forged.headers, payload: forged.rawBody })).statusCode).toBe(401);
    const good = JSON.parse(entraUserNotification([{ userId: 'u1', changeType: 'deleted' }], 'cs-secret').rawBody);
    const mixed = JSON.stringify({ value: [...good.value, ...JSON.parse(forged.rawBody).value] });
    expect((await s.inject({ method: 'POST', url: '/entra/users', headers: forged.headers, payload: mixed })).statusCode).toBe(401);
    expect(received).toHaveLength(0);
  });

  it('maps deleted for good to user.deleted and skips other resources', () => {
    const body = EntraNotificationBody.parse({
      value: [
        { subscriptionId: 's', clientState: 'x', changeType: 'deleted', resource: 'Users/u9', resourceData: { '@odata.type': '#Microsoft.Graph.User', id: 'u9' } },
        { subscriptionId: 's', clientState: 'x', changeType: 'updated', resource: 'Groups/g1', resourceData: { '@odata.type': '#Microsoft.Graph.Group', id: 'g1' } },
      ],
    });
    expect(entraAuthEvents(body).map((e) => [e.type, e.data.id])).toEqual([['user.deleted', 'u9']]);
    expect(entraEventType(body)).toBeUndefined();
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ ENTRA_TENANT_ID: TENANT, ENTRA_CLIENT_ID: CLIENT })[n])).toEqual({ tenantId: TENANT, clientId: CLIENT });
    expect(settings.every((s) => s.whereToFind)).toBe(true);
    expect(checkSetting(settings[0]!, 'test', TENANT)).toBeNull();
  });
});

describe('the test helpers', () => {
  it('give a tenant whose tokens the provider verifies without the network', async () => {
    const tenant = await entraTestTenant();
    const identity = await tenant.provider().verify(await tenant.token({ oid: 'me', roles: ['Admin'] }));
    expect([identity.userId, identity.roles]).toEqual(['me', ['Admin']]);
    await expect(tenant.provider().verify(await tenant.token({}, { expiresIn: '-1m' }))).rejects.toMatchObject({ code: 'auth/invalid-token' });
  });

  it('give an in-memory identity client', async () => {
    const fake = fakeEntraIdentity();
    const user = await fake.createUser({ email: 'a@contoso.com', emailVerified: false, password: 'x' });
    expect((await fake.findUserByEmail('A@contoso.com'))?.id).toBe(user.id);
    await expect(fake.signInWithPassword({ email: 'a', password: 'b' })).rejects.toMatchObject({ code: 'auth/not-supported' });
  });
});
