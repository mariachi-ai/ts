import { createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch, type ScriptedResponse } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { SignJWT, decodeJwt, exportPKCS8, generateKeyPair, jwtVerify } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';
import { FIREBASE_KEYS_URL } from './api';
import { settings } from './generated';
import { createFirebaseAuth, createFirebaseIdentityClient, firebaseWebConfig } from './index';
import { fakeFirebase, firebaseTestKeys, type FirebaseTestKeys } from './testing';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const noWait = { sleep: async () => {} };
const projectId = 'demo-app';
const config = { apiKey: 'AIza-test-key', projectId };

let keys: FirebaseTestKeys;
let serviceAccountJson: string;
let serviceAccountPublicKey: Awaited<ReturnType<typeof generateKeyPair>>['publicKey'];

beforeAll(async () => {
  keys = await firebaseTestKeys(projectId);
  const pair = await generateKeyPair('RS256', { extractable: true });
  serviceAccountPublicKey = pair.publicKey;
  serviceAccountJson = JSON.stringify({
    type: 'service_account',
    project_id: projectId,
    private_key_id: 'key-1',
    private_key: await exportPKCS8(pair.privateKey),
    client_email: 'firebase-adminsdk@demo-app.iam.gserviceaccount.com',
  });
});

const keysAnswer = (maxAge = 3600): ScriptedResponse => ({ json: keys.jwks, headers: { 'cache-control': `public, max-age=${maxAge}, must-revalidate` } });
const accessToken: ScriptedResponse = { json: { access_token: 'ya29.test', expires_in: 3599, token_type: 'Bearer' } };
const firebaseError = (message: string, status = 400): ScriptedResponse => ({ status, json: { error: { code: status, message, errors: [{ message, domain: 'global', reason: 'invalid' }] } } });
/** An ID token as Firebase's sign-in answers carry it. */
const idTokenFor = (sub: string, claims: Record<string, unknown> = {}) => keys.idToken({ sub, ...claims });

describe('FirebaseAuthProvider', () => {
  it("verifies an ID token against Google's keys, kept for their max-age, with one span", async () => {
    const fetch = scriptedFetch(keysAnswer());
    const tracer = new TestTracer();
    const auth = createFirebaseAuth(config, { fetch, tracer });
    const token = await idTokenFor('uid-1', { email: 'ada@example.com', email_verified: true, roles: ['admin'] });
    expect(await auth.verify(token)).toMatchObject({
      userId: 'uid-1',
      tenantId: '',
      roles: ['admin'],
      scopes: [],
      identityType: 'session',
      claims: { email: 'ada@example.com', email_verified: true, aud: projectId, iss: `https://securetoken.google.com/${projectId}` },
    });
    await auth.verify(token);
    expect(fetch.requests.map((r) => r.url.href)).toEqual([FIREBASE_KEYS_URL]);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([['firebase keys.get', 'client', 'www.googleapis.com']]);
    assertProviderSpans(tracer.spans);
  });

  it('refuses a token for another project, expired, from the future, unsigned or signed by someone else', async () => {
    const auth = createFirebaseAuth(config, { fetch: keys.fetch });
    const invalid = { code: 'auth/invalid-token' };
    const other = await firebaseTestKeys('other-project');
    const now = Math.floor(Date.now() / 1000);
    await expect(auth.verify(await other.idToken({ sub: 'u' }))).rejects.toMatchObject(invalid);
    // Signed with a key Google publishes, but for another project: aud and iss don't match.
    await expect(createFirebaseAuth({ ...config, projectId: 'other-project' }, { fetch: keys.fetch }).verify(await keys.idToken({ sub: 'u' }))).rejects.toMatchObject({ code: 'auth/invalid-token', message: expect.stringMatching(/iss|aud/) });
    await expect(auth.verify(await keys.idToken({ sub: 'u' }, { expiresIn: -60 }))).rejects.toMatchObject(invalid);
    await expect(auth.verify(await keys.idToken({ sub: 'u' }, { authTime: now + 600 }))).rejects.toMatchObject({ message: expect.stringContaining('auth_time') });
    await expect(auth.verify(await keys.idToken({ sub: 'u', auth_time: undefined }))).rejects.toMatchObject(invalid);
    const kid = keys.jwks.keys[0]!.kid!;
    const forged = await new SignJWT({ auth_time: now })
      .setProtectedHeader({ alg: 'RS256', kid })
      .setIssuer(`https://securetoken.google.com/${projectId}`)
      .setAudience(projectId)
      .setSubject('u')
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign((await generateKeyPair('RS256')).privateKey);
    await expect(auth.verify(forged)).rejects.toMatchObject(invalid);
    const hmac = await new SignJWT({ auth_time: now }).setProtectedHeader({ alg: 'HS256', kid }).setIssuer(`https://securetoken.google.com/${projectId}`).setAudience(projectId).setSubject('u').setIssuedAt().setExpirationTime('1h').sign(new TextEncoder().encode('x'.repeat(32)));
    await expect(auth.verify(hmac)).rejects.toMatchObject({ message: expect.stringContaining('RS256') });
    await expect(auth.verify('not.a.token')).rejects.toMatchObject(invalid);
    expect((await auth.verify(await keys.idToken({ sub: 'u' }))).userId).toBe('u');
  });

  it('fetches the keys again for an unknown kid, and keeps the old ones when Google is down', async () => {
    const next = await firebaseTestKeys(projectId);
    const fetch = scriptedFetch({ ...keysAnswer(0) }, { status: 503 }, { status: 503 }, { status: 503 }, { json: { keys: [...keys.jwks.keys, ...next.jwks.keys] }, headers: { 'cache-control': 'max-age=60' } });
    const auth = createFirebaseAuth({ ...config, keysCooldownMs: 0 }, { fetch, ...noWait });
    expect((await auth.verify(await keys.idToken({ sub: 'u' }))).userId).toBe('u');
    // Expired (max-age=0) and Google answers 503 three times: the keys in hand still verify.
    expect((await auth.verify(await keys.idToken({ sub: 'u' }))).userId).toBe('u');
    // A rotated-in key is found by fetching again.
    expect((await auth.verify(await next.idToken({ sub: 'u2' }))).userId).toBe('u2');
    expect(fetch.requests).toHaveLength(5);
  });

  it("fails as the identity provider's fault when the keys can't be read at all", async () => {
    const auth = createFirebaseAuth(config, { fetch: scriptedFetch({ status: 500 }, { status: 500 }, { status: 500 }), ...noWait });
    await expect(auth.verify(await keys.idToken({ sub: 'u' }))).rejects.toMatchObject({ code: 'auth/identity-provider' });
  });

  it('checks revocation, a disabled user and a deleted one with the service account when asked', async () => {
    const authTime = Math.floor(Date.now() / 1000) - 120;
    const token = await keys.idToken({ sub: 'u1' }, { authTime });
    const lookup = (user: Record<string, unknown> | null): ScriptedResponse => ({ json: user ? { kind: 'identitytoolkit#GetAccountInfoResponse', users: [{ localId: 'u1', ...user }] } : { kind: 'identitytoolkit#GetAccountInfoResponse' } });
    const tracer = new TestTracer();
    const fetch = scriptedFetch(keysAnswer(), accessToken, lookup({ validSince: String(authTime - 10) }), lookup({ validSince: String(authTime + 10) }), lookup({ disabled: true }), lookup(null));
    const auth = createFirebaseAuth({ ...config, serviceAccountJson, checkRevoked: true }, { fetch, tracer });
    expect((await auth.verify(token)).userId).toBe('u1');
    await expect(auth.verify(token)).rejects.toMatchObject({ code: 'auth/invalid-token', message: expect.stringContaining('revoked') });
    await expect(auth.verify(token)).rejects.toMatchObject({ message: expect.stringContaining('disabled') });
    await expect(auth.verify(token)).rejects.toMatchObject({ message: expect.stringContaining('no longer exists') });
    const [, , first] = fetch.requests;
    expect([first!.url.href, first!.headers.authorization, first!.json]).toEqual([`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`, 'Bearer ya29.test', { localId: ['u1'] }]);
    expect(tracer.spans.map((s) => s.name)).toEqual(['firebase keys.get', 'firebase serviceAccount.token', ...Array(4).fill('firebase projects.accounts.lookup')]);
    assertProviderSpans(tracer.spans);
  });

  it('refuses a config that would check nothing, or the wrong project', async () => {
    expect(() => createFirebaseAuth({ ...config, checkRevoked: true })).toThrow(expect.objectContaining({ code: 'auth/invalid-config' }));
    expect(() => createFirebaseAuth({ ...config, projectId: '' })).toThrow(/projectId/);
    const elsewhere = JSON.stringify({ ...JSON.parse(serviceAccountJson), project_id: 'prod-app' });
    expect(() => createFirebaseAuth({ ...config, serviceAccountJson: elsewhere, checkRevoked: true })).toThrow(/another project/);
    expect(() => createFirebaseAuth({ ...config, serviceAccountJson: '{"type":"service_account"', checkRevoked: true })).toThrow(/not JSON/);
    expect(() => createFirebaseAuth(config).createWebhookHandler()).toThrow(expect.objectContaining({ code: 'auth/not-supported' }));
  });
});

describe('FirebaseIdentityClient: with the web API key', () => {
  it('signs in with a password: the key in the query, the user from the ID token, one span, made once', async () => {
    const idToken = await idTokenFor('uid-1', { email: 'ada@example.com', email_verified: true });
    const fetch = scriptedFetch({ json: { kind: 'identitytoolkit#VerifyPasswordResponse', localId: 'uid-1', email: 'ada@example.com', displayName: 'Ada', idToken, refreshToken: 'rt-1', expiresIn: '3600', registered: true } });
    const tracer = new TestTracer();
    const result = await createFirebaseIdentityClient(config, { fetch, tracer }).signInWithPassword({ email: 'ada@example.com', password: 'pw' });
    expect(result).toMatchObject({ status: 'signed-in', user: { id: 'uid-1', email: 'ada@example.com', emailVerified: true, name: 'Ada', externalId: null }, tokens: { accessToken: idToken, refreshToken: 'rt-1' } });
    const [req] = fetch.requests;
    expect(req!.url.href).toBe('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIza-test-key');
    expect(req!.json).toEqual({ email: 'ada@example.com', password: 'pw', returnSecureToken: true });
    expect(tracer.spans.map((s) => [s.name, s.attributes['server.address']])).toEqual([['firebase accounts.signInWithPassword', 'identitytoolkit.googleapis.com']]);
    assertProviderSpans(tracer.spans);
  });

  it("turns Firebase's codes into the port's, keeping the code and never the sentence", async () => {
    const client = (...r: ScriptedResponse[]) => createFirebaseIdentityClient(config, { fetch: scriptedFetch(...r), ...noWait });
    const wrong = await client(firebaseError('INVALID_LOGIN_CREDENTIALS')).signInWithPassword({ email: 'a@b.co', password: 'x' }).catch((e) => e);
    expect([wrong.code, wrong.metadata.providerCode, wrong.metadata.code]).toEqual(['auth/invalid-credentials', 'INVALID_LOGIN_CREDENTIALS', 'firebase/invalid-login-credentials']);
    // Rate limited, and not retried: each retry would be another failed attempt.
    const locked = await client(firebaseError('TOO_MANY_ATTEMPTS_TRY_LATER : Access to this account has been temporarily disabled for a@b.co')).signInWithPassword({ email: 'a@b.co', password: 'x' }).catch((e) => e);
    expect([locked.code, locked.metadata.providerCode]).toEqual(['auth/rate-limited', 'TOO_MANY_ATTEMPTS_TRY_LATER']);
    expect(locked.message).not.toContain('a@b.co');
    const badKey = await client(firebaseError('API key not valid. Please pass a valid API key.')).signInWithPassword({ email: 'a@b.co', password: 'x' }).catch((e) => e);
    expect([badKey.code, badKey.metadata.category]).toEqual(['auth/identity-provider', 'unauthorized']);
    await expect(client().signInWithPassword({ email: 'not an email', password: 'x' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });

  it('holds a sign-in at mfa when Firebase wants a second factor', async () => {
    const fetch = scriptedFetch({ json: { localId: 'uid-1', email: 'ada@example.com', mfaPendingCredential: 'mfa-cred', mfaInfo: [{ mfaEnrollmentId: 'e1' }] } });
    expect(await createFirebaseIdentityClient(config, { fetch }).signInWithPassword({ email: 'ada@example.com', password: 'pw' })).toEqual({ status: 'pending', reason: 'mfa', pendingToken: 'mfa-cred', email: 'ada@example.com' });
  });

  it('refreshes at securetoken.googleapis.com, retrying an outage, and refuses a revoked token', async () => {
    const fetch = scriptedFetch({ status: 503 }, { json: { id_token: 'id-2', refresh_token: 'rt-2', expires_in: '3600', token_type: 'Bearer', user_id: 'uid-1', project_id: '123' } }, firebaseError('TOKEN_EXPIRED'));
    const tracer = new TestTracer();
    const client = createFirebaseIdentityClient(config, { fetch, tracer, ...noWait });
    expect(await client.refresh('rt-1')).toMatchObject({ accessToken: 'id-2', refreshToken: 'rt-2', expiresAt: expect.any(Number) });
    expect(fetch.requests[1]!.url.href).toBe('https://securetoken.googleapis.com/v1/token?key=AIza-test-key');
    expect(fetch.requests[1]!.body).toBe('grant_type=refresh_token&refresh_token=rt-1');
    await expect(client.refresh('rt-old')).rejects.toMatchObject({ code: 'auth/invalid-grant', metadata: { providerCode: 'TOKEN_EXPIRED' } });
    expect(tracer.spans[0]!.attributes['mariachi.integration.attempts']).toBe(2);
    assertProviderSpans(tracer.spans);
  });

  it('has Firebase email a password reset, answering nobody for an unknown address', async () => {
    const fetch = scriptedFetch({ json: { email: 'ada@example.com' } }, firebaseError('EMAIL_NOT_FOUND'));
    const client = createFirebaseIdentityClient(config, { fetch });
    expect(await client.sendPasswordReset('ada@example.com')).toEqual({ deliveredBy: 'provider' });
    expect(fetch.requests[0]!.json).toEqual({ requestType: 'PASSWORD_RESET', email: 'ada@example.com' });
    expect(await client.sendPasswordReset('nobody@example.com')).toEqual({ deliveredBy: 'nobody' });
  });

  it('resets the password with the code, and finds the user by signing in when there is no service account', async () => {
    const idToken = await idTokenFor('uid-1', { email: 'ada@example.com', email_verified: true });
    const fetch = scriptedFetch({ json: { email: 'ada@example.com', requestType: 'PASSWORD_RESET' } }, { json: { localId: 'uid-1', email: 'ada@example.com', idToken, refreshToken: 'rt', expiresIn: '3600' } }, firebaseError('EXPIRED_OOB_CODE'));
    const client = createFirebaseIdentityClient(config, { fetch });
    expect(await client.resetPassword({ token: 'oob-1', password: 'new-pw' })).toMatchObject({ id: 'uid-1', emailVerified: true });
    expect(fetch.requests[0]!.json).toEqual({ oobCode: 'oob-1', newPassword: 'new-pw' });
    expect(fetch.requests[1]!.json).toEqual({ email: 'ada@example.com', password: 'new-pw', returnSecureToken: true });
    await expect(client.resetPassword({ token: 'old', password: 'x' })).rejects.toMatchObject({ code: 'auth/invalid-grant' });
  });

  it('signs in with an email link when emailLinkUrl is set, and says it cannot otherwise', async () => {
    await expect(createFirebaseIdentityClient(config).startEmailCode('ada@example.com')).rejects.toMatchObject({ code: 'auth/not-supported' });
    const idToken = await idTokenFor('uid-9', { email: 'new@example.com', email_verified: true });
    const fetch = scriptedFetch({ json: { email: 'new@example.com' } }, { json: { localId: 'uid-9', email: 'new@example.com', idToken, refreshToken: 'rt', expiresIn: '3600', isNewUser: true } });
    const client = createFirebaseIdentityClient({ ...config, emailLinkUrl: 'https://app.example.com/sign-in/link' }, { fetch });
    expect(await client.startEmailCode('new@example.com')).toEqual({ deliveredBy: 'provider' });
    expect(fetch.requests[0]!.json).toEqual({ requestType: 'EMAIL_SIGNIN', email: 'new@example.com', continueUrl: 'https://app.example.com/sign-in/link', canHandleCodeInApp: true });
    expect(await client.signInWithEmailCode({ email: 'new@example.com', code: 'oob-9' })).toMatchObject({ status: 'signed-in', user: { id: 'uid-9', emailVerified: true } });
    expect(fetch.requests[1]!.url.pathname).toBe('/v1/accounts:signInWithEmailLink');
    expect(fetch.requests[1]!.json).toEqual({ email: 'new@example.com', oobCode: 'oob-9' });
  });

  it('signs a user up without the service account, and refuses what only an admin can do', async () => {
    const idToken = await idTokenFor('uid-3', { email: 'new@example.com', email_verified: false });
    const fetch = scriptedFetch({ json: { localId: 'uid-3', email: 'new@example.com', idToken, refreshToken: 'rt', expiresIn: '3600' } });
    const client = createFirebaseIdentityClient(config, { fetch });
    expect(await client.createUser({ email: 'new@example.com', password: 'pw', emailVerified: false, name: 'New' })).toMatchObject({ id: 'uid-3', emailVerified: false });
    expect([fetch.requests[0]!.url.pathname, fetch.requests[0]!.json]).toEqual(['/v1/accounts:signUp', { email: 'new@example.com', password: 'pw', displayName: 'New', returnSecureToken: true }]);
    await expect(client.createUser({ email: 'v@example.com', emailVerified: true })).rejects.toMatchObject({ code: 'auth/invalid-config' });
    await expect(client.createUser({ email: 'v@example.com', emailVerified: false, password: 'pw', externalId: 'app-1' })).rejects.toMatchObject({ code: 'auth/not-supported' });
    await expect(client.getUser('uid-3')).rejects.toMatchObject({ code: 'auth/invalid-config', message: expect.stringContaining('FIREBASE_SERVICE_ACCOUNT_JSON') });
    expect(fetch.requests).toHaveLength(1);
  });

  it("says what isn't done server-side", async () => {
    const client = createFirebaseIdentityClient(config);
    expect(() => client.authorizationUrl()).toThrow(expect.objectContaining({ code: 'auth/not-supported', message: expect.stringContaining('client SDK') }));
    await expect(client.exchangeCode()).rejects.toMatchObject({ code: 'auth/not-supported' });
    await expect(client.pendingVerificationCode()).rejects.toMatchObject({ code: 'auth/not-supported' });
    await expect(client.verifyEmailAndSignIn()).rejects.toMatchObject({ code: 'auth/not-supported' });
    await expect(client.signOut({ refreshToken: 'rt' })).resolves.toBeUndefined();
    expect(() => createFirebaseIdentityClient({ ...config, apiKey: '' })).toThrow(/apiKey/);
    expect(() => createFirebaseIdentityClient({ ...config, emailsSentBy: 'app' })).toThrow(/service account/);
  });
});

describe('FirebaseIdentityClient: with the service account', () => {
  const user = { localId: 'uid-1', email: 'ada@example.com', emailVerified: true, displayName: 'Ada', photoUrl: 'https://example.com/a.png', validSince: '1700000000' };

  it('signs a Google OAuth assertion with the key, exchanges it once, and reuses the token', async () => {
    const fetch = scriptedFetch(accessToken, { json: { kind: 'k', users: [user] } }, { json: { kind: 'k' } });
    const tracer = new TestTracer();
    const client = createFirebaseIdentityClient({ ...config, serviceAccountJson }, { fetch, tracer });
    expect(await client.getUser('uid-1')).toEqual({ id: 'uid-1', email: 'ada@example.com', emailVerified: true, name: 'Ada', avatarUrl: 'https://example.com/a.png', externalId: null });
    expect(await client.findUserByEmail('nobody@example.com')).toBeNull();

    const [exchange, lookup, byEmail] = fetch.requests;
    expect(exchange!.url.href).toBe('https://oauth2.googleapis.com/token');
    const form = new URLSearchParams(exchange!.body);
    expect(form.get('grant_type')).toBe('urn:ietf:params:oauth:grant-type:jwt-bearer');
    const { payload, protectedHeader } = await jwtVerify(form.get('assertion')!, serviceAccountPublicKey, { algorithms: ['RS256'] });
    expect(protectedHeader).toMatchObject({ alg: 'RS256', typ: 'JWT', kid: 'key-1' });
    expect(payload).toMatchObject({ iss: 'firebase-adminsdk@demo-app.iam.gserviceaccount.com', aud: 'https://oauth2.googleapis.com/token', scope: 'https://www.googleapis.com/auth/identitytoolkit' });
    expect(payload.exp! - payload.iat!).toBe(3600);

    expect([lookup!.url.href, lookup!.headers.authorization, lookup!.json]).toEqual([`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`, 'Bearer ya29.test', { localId: ['uid-1'] }]);
    expect([byEmail!.headers.authorization, byEmail!.json]).toEqual(['Bearer ya29.test', { email: ['nobody@example.com'] }]);
    expect(tracer.spans.map((s) => s.name)).toEqual(['firebase serviceAccount.token', 'firebase projects.accounts.lookup', 'firebase projects.accounts.lookup']);
    assertProviderSpans(tracer.spans);
  });

  it("fails clearly when Google refuses the service account", async () => {
    const fetch = scriptedFetch({ status: 400, json: { error: 'invalid_grant', error_description: 'Invalid JWT Signature.' } });
    const err = await createFirebaseIdentityClient({ ...config, serviceAccountJson }, { fetch }).getUser('u').catch((e) => e);
    expect([err.code, err.metadata.code, err.metadata.category]).toEqual(['auth/identity-provider', 'firebase/service-account-refused', 'unauthorized']);
  });

  it('creates a user with a verified email, once, and reports an address already taken', async () => {
    const fetch = scriptedFetch(accessToken, { json: { localId: 'uid-7', email: 'ada@example.com', displayName: 'Ada' } }, firebaseError('EMAIL_EXISTS'));
    const client = createFirebaseIdentityClient({ ...config, serviceAccountJson }, { fetch });
    expect(await client.createUser({ email: 'ada@example.com', emailVerified: true, name: 'Ada' })).toEqual({ id: 'uid-7', email: 'ada@example.com', emailVerified: true, name: 'Ada', avatarUrl: null, externalId: null });
    expect([fetch.requests[1]!.url.pathname, fetch.requests[1]!.json]).toEqual([`/v1/projects/${projectId}/accounts`, { email: 'ada@example.com', emailVerified: true, displayName: 'Ada' }]);
    await expect(client.createUser({ email: 'ada@example.com', emailVerified: true })).rejects.toMatchObject({ code: 'auth/invalid-grant', metadata: { providerCode: 'EMAIL_EXISTS', category: 'conflict' } });
  });

  it('sets a password, revokes sessions, and deletes a user (already gone is fine)', async () => {
    const fetch = scriptedFetch(accessToken, { json: { localId: 'uid-1' } }, { json: { localId: 'uid-1' } }, { json: {} }, firebaseError('USER_NOT_FOUND'));
    const client = createFirebaseIdentityClient({ ...config, serviceAccountJson }, { fetch });
    await client.setPassword('uid-1', 'new-pw');
    await client.revokeSessions(ctx, 'uid-1');
    await client.deleteUser('uid-1');
    await client.deleteUser('uid-1');
    const [, set, revoke, del] = fetch.requests;
    expect(set!.json).toEqual({ localId: 'uid-1', password: 'new-pw' });
    expect(revoke!.url.pathname).toBe(`/v1/projects/${projectId}/accounts:update`);
    expect(Number((revoke!.json as { validSince: string }).validSince)).toBeCloseTo(Date.now() / 1000, -1);
    expect([del!.url.pathname, del!.json]).toEqual([`/v1/projects/${projectId}/accounts:delete`, { localId: 'uid-1' }]);
  });

  it('returns the reset code and link for the app to email, without Firebase sending one', async () => {
    const fetch = scriptedFetch(accessToken, { json: { oobCode: 'oob-1', oobLink: 'https://demo-app.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=oob-1' } });
    const client = createFirebaseIdentityClient({ ...config, serviceAccountJson, emailsSentBy: 'app' }, { fetch });
    expect(await client.sendPasswordReset('ada@example.com')).toEqual({ deliveredBy: 'app', token: 'oob-1', url: expect.stringContaining('oobCode=oob-1') });
    expect([fetch.requests[1]!.url.pathname, fetch.requests[1]!.json]).toEqual([`/v1/projects/${projectId}/accounts:sendOobCode`, { requestType: 'PASSWORD_RESET', email: 'ada@example.com', returnOobLink: true }]);
  });
});

describe('settings', () => {
  it('reads from the environment by name, with no environment check (test is another project)', () => {
    const env: Record<string, string> = { FIREBASE_API_KEY: 'AIza-1', FIREBASE_PROJECT_ID: 'demo-app' };
    expect(settingsFromEnv(settings, (n) => env[n])).toEqual({ apiKey: 'AIza-1', projectId: 'demo-app' });
    expect(() => settingsFromEnv(settings, () => undefined)).toThrow(/FIREBASE_API_KEY, FIREBASE_PROJECT_ID/);
    expect(settings.every((s) => s.whereToFind && !s.environments)).toBe(true);
    expect(settings.filter((s) => s.secret).map((s) => s.env)).toEqual(['FIREBASE_SERVICE_ACCOUNT_JSON']);
    expect(checkSetting(settings[0]!, 'production', 'AIza-1')).toBeNull();
  });

  it('gives the browser only the public settings', () => {
    expect(firebaseWebConfig({ ...config, serviceAccountJson: '{"secret":true}' } as never)).toEqual({ apiKey: 'AIza-test-key', authDomain: 'demo-app.firebaseapp.com', projectId });
  });
});

describe('the fake', () => {
  it('signs a seeded user in with tokens its auth provider accepts, and runs a reset', async () => {
    const firebase = await fakeFirebase({ projectId: 'demo-test', users: [{ id: 'u1', email: 'ada@example.com', password: 'pw', emailVerified: true }] });
    const signedIn = await firebase.identity.signInWithPassword({ email: 'ada@example.com', password: 'pw' });
    if (signedIn.status !== 'signed-in') throw new Error('expected a sign-in');
    expect(await firebase.auth.verify(signedIn.tokens.accessToken)).toMatchObject({ userId: 'u1', claims: { email: 'ada@example.com', email_verified: true } });
    expect(decodeJwt(await firebase.idToken({ id: 'u2' })).sub).toBe('u2');
    await expect(firebase.identity.signInWithPassword({ email: 'ada@example.com', password: 'nope' })).rejects.toMatchObject({ code: 'auth/invalid-credentials' });

    expect(await firebase.identity.sendPasswordReset('ada@example.com')).toEqual({ deliveredBy: 'provider' });
    const [email] = firebase.identity.emails_;
    await firebase.identity.resetPassword({ token: email!.code, password: 'pw2' });
    expect((await firebase.identity.signInWithPassword({ email: 'ada@example.com', password: 'pw2' })).status).toBe('signed-in');
    expect(await firebase.identity.sendPasswordReset('nobody@example.com')).toEqual({ deliveredBy: 'nobody' });
  });
});
