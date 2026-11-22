import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { type RecordedRequest, assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { SignJWT } from 'jose';
import { describe, expect, it } from 'vitest';
import { settings } from './generated';
import { Auth0IdentityClient } from './identity-client';
import { auth0LogoutUrl } from './logout';
import { auth0User, fakeAuth0IdentityClient } from './testing';

const config = {
  domain: 'acme.us.auth0.com',
  clientId: 'client-1',
  clientSecret: 'secret-1',
  audience: 'https://api.acme.test',
  m2mClientId: 'm2m-1',
  m2mClientSecret: 'm2m-secret',
};
const noWait = { sleep: async () => {} };
const form = (req: RecordedRequest | undefined) => Object.fromEntries(new URLSearchParams(req?.body ?? ''));

/** An ID token as Auth0's token endpoint returns it (read, not verified, by the client). */
function idToken(claims: Record<string, unknown> = {}): Promise<string> {
  return new SignJWT({ sub: 'auth0|u1', email: 'ada@example.com', email_verified: true, name: 'Ada', picture: 'https://cdn.test/ada.png', sid: 'sess-1', ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(new TextEncoder().encode('not-checked'));
}
const managementToken = { json: { access_token: 'mgmt-token', expires_in: 86400, token_type: 'Bearer' } };

describe('Universal Login', () => {
  it('sends the browser to /authorize for the social connection, with PKCE and the API audience', () => {
    const url = new URL(new Auth0IdentityClient(config).authorizationUrl({ provider: 'google', redirectUri: 'https://app.test/callback', state: 'st', codeChallenge: 'ch', loginHint: 'ada@example.com' }));
    expect(url.origin + url.pathname).toBe('https://acme.us.auth0.com/authorize');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      response_type: 'code',
      client_id: 'client-1',
      redirect_uri: 'https://app.test/callback',
      scope: 'openid profile email offline_access',
      state: 'st',
      code_challenge: 'ch',
      code_challenge_method: 'S256',
      connection: 'google-oauth2',
      audience: 'https://api.acme.test',
      login_hint: 'ada@example.com',
    });
    const github = new URL(new Auth0IdentityClient({ ...config, connections: { github: 'gh-corp' } }).authorizationUrl({ provider: 'github', redirectUri: 'https://app.test/cb', state: 's', codeChallenge: 'c' }));
    expect(github.searchParams.get('connection')).toBe('gh-corp');
  });

  it('exchanges the code for tokens and the user in the ID token, in one span with nothing sensitive on it', async () => {
    const fetch = scriptedFetch({ json: { access_token: 'at-1', refresh_token: 'rt-1', id_token: await idToken(), token_type: 'Bearer', expires_in: 86400 } });
    const tracer = new TestTracer();
    const result = await new Auth0IdentityClient(config, { fetch, tracer, now: () => 1_000 }).exchangeCode({ code: 'code-1', codeVerifier: 'v'.repeat(43), redirectUri: 'https://app.test/callback' });
    expect(result).toEqual({
      status: 'signed-in',
      user: { id: 'auth0|u1', email: 'ada@example.com', emailVerified: true, name: 'Ada', avatarUrl: 'https://cdn.test/ada.png', externalId: null },
      tokens: { accessToken: 'at-1', refreshToken: 'rt-1', sessionId: 'sess-1', expiresAt: 1_000 + 86_400_000 },
    });
    const [req] = fetch.requests;
    expect(`${req!.method} ${req!.url.href}`).toBe('POST https://acme.us.auth0.com/oauth/token');
    expect(form(req)).toEqual({ client_id: 'client-1', client_secret: 'secret-1', grant_type: 'authorization_code', code: 'code-1', code_verifier: 'v'.repeat(43), redirect_uri: 'https://app.test/callback' });
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([['auth0 tokens.exchangeCode', 'client', 'acme.us.auth0.com']]);
    assertProviderSpans(tracer.spans);
  });

  it("fails a refused code as auth/invalid-grant with Auth0's code and not its description", async () => {
    const fetch = scriptedFetch({ status: 403, json: { error: 'invalid_grant', error_description: 'Invalid authorization code for ada@example.com' } });
    const tracer = new TestTracer();
    const err = await new Auth0IdentityClient(config, { fetch, tracer }).exchangeCode({ code: 'used', codeVerifier: 'v', redirectUri: 'https://app.test/cb' }).catch((e) => e);
    expect([err.code, err.metadata.providerCode, err.metadata.status]).toEqual(['auth/invalid-grant', 'invalid_grant', 403]);
    expect(err.message).not.toContain('ada@');
    expect(tracer.spans[0]!.attributes['error.type']).toBe('invalid_grant');
    assertProviderSpans(tracer.spans);
  });

  it('refreshes, keeping the refresh token when rotation is off', async () => {
    const fetch = scriptedFetch({ json: { access_token: 'at-2', expires_in: 60 } }, { json: { access_token: 'at-3', refresh_token: 'rt-new', expires_in: 60 } });
    const client = new Auth0IdentityClient(config, { fetch });
    expect((await client.refresh('rt-1')).refreshToken).toBe('rt-1');
    expect((await client.refresh('rt-1')).refreshToken).toBe('rt-new');
    expect(form(fetch.requests[0])).toMatchObject({ grant_type: 'refresh_token', refresh_token: 'rt-1', client_secret: 'secret-1' });
  });

  it('signs out by revoking the refresh token, and does nothing without one', async () => {
    const fetch = scriptedFetch({ text: 'OK' });
    const client = new Auth0IdentityClient(config, { fetch });
    await client.signOut({ sessionId: 'sess-1' });
    await client.signOut({ refreshToken: 'rt-1' });
    expect(fetch.requests.map((r) => r.url.pathname)).toEqual(['/oauth/revoke']);
    expect(form(fetch.requests[0])).toEqual({ client_id: 'client-1', client_secret: 'secret-1', token: 'rt-1' });
  });

  it('builds the OIDC logout URL that ends the browser’s Auth0 session', () => {
    const url = new URL(auth0LogoutUrl(config, { returnTo: 'https://app.test/', idTokenHint: 'id.tok.en', federated: true }));
    expect(url.origin + url.pathname).toBe('https://acme.us.auth0.com/oidc/logout');
    expect(Object.fromEntries(url.searchParams)).toEqual({ client_id: 'client-1', post_logout_redirect_uri: 'https://app.test/', id_token_hint: 'id.tok.en', federated: '' });
  });
});

describe('headless sign-in', () => {
  it('signs in with a password through the database connection, passing the user’s IP for attack protection', async () => {
    const fetch = scriptedFetch({ json: { access_token: 'at', refresh_token: 'rt', id_token: await idToken(), expires_in: 60 } });
    const result = await new Auth0IdentityClient({ ...config, databaseConnection: 'members' }, { fetch }).signInWithPassword({ email: 'ada@example.com', password: 'pw', ipAddress: '203.0.113.9' });
    expect(result.status).toBe('signed-in');
    expect(form(fetch.requests[0])).toMatchObject({ grant_type: 'http://auth0.com/oauth/grant-type/password-realm', realm: 'members', username: 'ada@example.com', password: 'pw', audience: 'https://api.acme.test', scope: 'openid profile email offline_access' });
    expect(fetch.requests[0]!.headers['auth0-forwarded-for']).toBe('203.0.113.9');
  });

  it('answers a wrong password with auth/invalid-credentials, and MFA with a pending sign-in', async () => {
    const fetch = scriptedFetch({ status: 403, json: { error: 'invalid_user_password', error_description: 'Wrong email or password.' } }, { status: 403, json: { error: 'mfa_required', error_description: 'Multifactor authentication required', mfa_token: 'Fe26.mfa' } });
    const client = new Auth0IdentityClient(config, { fetch });
    await expect(client.signInWithPassword({ email: 'ada@example.com', password: 'nope' })).rejects.toMatchObject({ code: 'auth/invalid-credentials' });
    expect(await client.signInWithPassword({ email: 'ada@example.com', password: 'pw' })).toEqual({ status: 'pending', reason: 'mfa', pendingToken: 'Fe26.mfa', email: 'ada@example.com' });
  });

  it('starts and finishes a passwordless email code', async () => {
    const fetch = scriptedFetch({ json: { _id: 'x', email: 'ada@example.com', email_verified: false } }, { json: { access_token: 'at', id_token: await idToken({ sub: 'email|1' }), expires_in: 60 } });
    const client = new Auth0IdentityClient(config, { fetch });
    expect(await client.startEmailCode('ada@example.com')).toEqual({ deliveredBy: 'provider' });
    expect(fetch.requests[0]!.json).toEqual({ client_id: 'client-1', client_secret: 'secret-1', connection: 'email', email: 'ada@example.com', send: 'code' });
    const result = await client.signInWithEmailCode({ email: 'ada@example.com', code: '123456' });
    expect(result.status === 'signed-in' && result.user.id).toBe('email|1');
    expect(form(fetch.requests[1])).toMatchObject({ grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp', realm: 'email', username: 'ada@example.com', otp: '123456' });
  });

  it('asks Auth0 to email the password reset, whoever the address belongs to', async () => {
    const fetch = scriptedFetch({ text: "We've just sent you an email to reset your password." });
    expect(await new Auth0IdentityClient(config, { fetch }).sendPasswordReset('ada@example.com')).toEqual({ deliveredBy: 'provider' });
    expect(`${fetch.requests[0]!.url.pathname} ${JSON.stringify(fetch.requests[0]!.json)}`).toBe('/dbconnections/change_password {"client_id":"client-1","email":"ada@example.com","connection":"Username-Password-Authentication"}');
  });

  it('says clearly what Auth0 does on its own pages', async () => {
    const client = new Auth0IdentityClient(config, { fetch: scriptedFetch() });
    await expect(client.resetPassword({ token: 't', password: 'p' })).rejects.toMatchObject({ code: 'auth/not-supported' });
    await expect(client.pendingVerificationCode({ status: 'pending', reason: 'email-verification' })).rejects.toMatchObject({ code: 'auth/not-supported' });
    await expect(client.verifyEmailAndSignIn({ pendingToken: 'p', code: 'c' })).rejects.toMatchObject({ code: 'auth/not-supported' });
  });
});

describe('users, on the Management API', () => {
  it('gets a Management API token once for the tenant’s audience, and reuses it until near its expiry', async () => {
    let now = 0;
    const user = auth0User({ user_id: 'auth0|u1', email: 'ada@example.com', email_verified: true, app_metadata: { external_id: 'app-7' } });
    const fetch = scriptedFetch(managementToken, { json: user }, { status: 404, json: { statusCode: 404 } }, managementToken, { json: user });
    const tracer = new TestTracer();
    const client = new Auth0IdentityClient({ ...config, domain: 'login.acme.test', tenantDomain: 'acme.us.auth0.com' }, { fetch, tracer, now: () => now });
    expect(await client.getUser('auth0|u1')).toMatchObject({ id: 'auth0|u1', email: 'ada@example.com', emailVerified: true, externalId: 'app-7' });
    expect(await client.getUser('auth0|gone')).toBeNull();
    now = 86_400_000 - 299_000; // inside the last five minutes: renewed
    await client.getUser('auth0|u1');
    expect(fetch.requests.map((r) => `${r.method} ${r.url.host}${r.url.pathname}`)).toEqual([
      'POST login.acme.test/oauth/token',
      'GET login.acme.test/api/v2/users/auth0%7Cu1',
      'GET login.acme.test/api/v2/users/auth0%7Cgone',
      'POST login.acme.test/oauth/token',
      'GET login.acme.test/api/v2/users/auth0%7Cu1',
    ]);
    expect(form(fetch.requests[0])).toEqual({ grant_type: 'client_credentials', client_id: 'm2m-1', client_secret: 'm2m-secret', audience: 'https://acme.us.auth0.com/api/v2/' });
    expect(fetch.requests[1]!.headers.authorization).toBe('Bearer mgmt-token');
    expect(tracer.spans.map((s) => s.name)).toEqual(['auth0 tokens.clientCredentials', 'auth0 users.get', 'auth0 users.get', 'auth0 tokens.clientCredentials', 'auth0 users.get']);
    assertProviderSpans(tracer.spans);
  });

  it("finds a user by email, preferring the database connection's", async () => {
    const social = auth0User({ user_id: 'google-oauth2|1', email: 'ada@example.com', identities: [{ connection: 'google-oauth2', provider: 'google-oauth2', user_id: '1', isSocial: true }] });
    const db = auth0User({ user_id: 'auth0|2', email: 'ada@example.com' });
    const fetch = scriptedFetch(managementToken, { json: [social, db] }, { json: [] });
    const client = new Auth0IdentityClient(config, { fetch });
    expect((await client.findUserByEmail('Ada@Example.com'))?.id).toBe('auth0|2');
    expect(await client.findUserByEmail('nobody@example.com')).toBeNull();
    expect(fetch.requests[1]!.url.searchParams.get('email')).toBe('ada@example.com');
  });

  it('creates a user in the database connection, with a random password when none is given', async () => {
    const fetch = scriptedFetch(managementToken, { status: 201, json: auth0User({ user_id: 'auth0|new', email: 'bo@example.com', app_metadata: { external_id: 'app-9' } }) });
    const user = await new Auth0IdentityClient(config, { fetch }).createUser({ email: 'bo@example.com', emailVerified: true, externalId: 'app-9', name: 'Bo' });
    expect(user).toMatchObject({ id: 'auth0|new', externalId: 'app-9' });
    const body = fetch.requests[1]!.json as Record<string, unknown>;
    expect(body).toMatchObject({ connection: 'Username-Password-Authentication', email: 'bo@example.com', email_verified: true, name: 'Bo', app_metadata: { external_id: 'app-9' } });
    expect(String(body.password)).toMatch(/^.{48}$/);
  });

  it('deletes a user (already gone is fine) and sets a password', async () => {
    const fetch = scriptedFetch(managementToken, { status: 204 }, { status: 404, json: {} }, { json: auth0User() });
    const client = new Auth0IdentityClient(config, { fetch });
    await client.deleteUser('auth0|u1');
    await client.deleteUser('auth0|u1');
    await client.setPassword('auth0|u1', 'n3w-Passw0rd!');
    expect(fetch.requests.slice(1).map((r) => r.method)).toEqual(['DELETE', 'DELETE', 'PATCH']);
    expect(fetch.requests[3]!.json).toEqual({ password: 'n3w-Passw0rd!', connection: 'Username-Password-Authentication' });
  });

  it('needs the Machine to Machine application, and says when the Management API refuses it', async () => {
    const { m2mClientId: _id, m2mClientSecret: _secret, ...withoutM2m } = config;
    await expect(new Auth0IdentityClient(withoutM2m, { fetch: scriptedFetch() }).getUser('auth0|u1')).rejects.toMatchObject({ code: 'auth/invalid-config' });
    const fetch = scriptedFetch(managementToken, { status: 403, json: { statusCode: 403, message: 'Insufficient scope' } });
    const err = await new Auth0IdentityClient(config, { fetch }).getUser('auth0|u1').catch((e) => e);
    expect([err.code, err.metadata.status]).toEqual(['auth/identity-provider', 403]);
  });

  it('retries a rate limit, then fails as auth/rate-limited', async () => {
    const limited = { status: 429, headers: { 'retry-after': '0' }, json: { error: 'too_many_requests' } };
    const fetch = scriptedFetch(managementToken, limited, limited, limited);
    const tracer = new TestTracer();
    await expect(new Auth0IdentityClient(config, { fetch, tracer, ...noWait }).getUser('auth0|u1')).rejects.toMatchObject({ code: 'auth/rate-limited' });
    expect(fetch.requests).toHaveLength(4);
    expect(tracer.spans[1]!.attributes['mariachi.integration.attempts']).toBe(3);
  });
});

describe('configuration', () => {
  it('needs the client secret, and checks its input before calling', async () => {
    const { clientSecret: _s, ...noSecret } = config;
    expect(() => new Auth0IdentityClient(noSecret)).toThrow(expect.objectContaining({ code: 'auth/invalid-config' }));
    await expect(new Auth0IdentityClient(config, { fetch: scriptedFetch() }).signInWithPassword({ email: '', password: '' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });

  it('reads its settings from the environment by name, with no per-environment checks (test is another tenant)', () => {
    const env: Record<string, string> = { AUTH0_DOMAIN: 'acme.us.auth0.com', AUTH0_CLIENT_ID: 'c', AUTH0_CLIENT_SECRET: 's' };
    expect(settingsFromEnv(settings, (n) => env[n])).toEqual({ domain: 'acme.us.auth0.com', clientId: 'c', clientSecret: 's' });
    expect(() => settingsFromEnv(settings, () => undefined)).toThrow(/AUTH0_DOMAIN, AUTH0_CLIENT_ID/);
    expect(settings.every((s) => s.whereToFind && !s.environments)).toBe(true);
    expect(checkSetting(settings[0]!, 'production', 'acme.us.auth0.com')).toBeNull();
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests', async () => {
    const fake = fakeAuth0IdentityClient({ users: [{ id: 'auth0|1', email: 'ada@example.com', emailVerified: true, name: 'Ada', avatarUrl: null, externalId: null, password: 'pw' }] });
    const signedIn = await fake.signInWithPassword({ email: 'ada@example.com', password: 'pw' });
    expect(signedIn.status).toBe('signed-in');
    await expect(fake.signInWithPassword({ email: 'ada@example.com', password: 'x' })).rejects.toMatchObject({ code: 'auth/invalid-credentials' });
    fake.codes_.set('code-1', 'auth0|1');
    const exchanged = await fake.exchangeCode({ code: 'code-1', codeVerifier: 'v', redirectUri: 'https://app.test/cb' });
    if (exchanged.status !== 'signed-in') throw new Error('expected a sign-in');
    const refreshed = await fake.refresh(exchanged.tokens.refreshToken);
    await expect(fake.refresh(exchanged.tokens.refreshToken)).rejects.toMatchObject({ code: 'auth/invalid-grant' });
    await fake.signOut({ refreshToken: refreshed.refreshToken });
    expect(fake.refreshTokens_.has(refreshed.refreshToken)).toBe(false);
    await fake.startEmailCode('new@example.com');
    const byCode = await fake.signInWithEmailCode({ email: 'new@example.com', code: fake.emailCodes_.get('new@example.com')! });
    expect(byCode.status === 'signed-in' && byCode.user.emailVerified).toBe(true);
    await expect(fake.resetPassword({ token: 't', password: 'p' })).rejects.toMatchObject({ code: 'auth/not-supported' });
  });
});
