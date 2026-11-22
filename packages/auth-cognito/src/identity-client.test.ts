import { Readable } from 'node:stream';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { describe, expect, it } from 'vitest';
import { type CognitoAdminClient, cognitoSecretHash, createCognitoIdentityClient, settings } from './index';
import { cognitoTestIssuer, fakeCognitoIdentityClient } from './testing';

const pool = { region: 'us-east-1', userPoolId: 'us-east-1_TEST', clientId: 'client123' };
const config = { ...pool, clientSecret: 'secret-of-the-app-client-0123', domain: 'auth.example.com' };
const noWait = { sleep: async () => {} };
const issuerP = cognitoTestIssuer(pool);

async function authResult(sub = 'u-1') {
  const issuer = await issuerP;
  return { AccessToken: await issuer.accessToken({ sub }), IdToken: await issuer.idToken({ sub, email: 'ada@example.com', email_verified: true, name: 'Ada' }), RefreshToken: 'refresh-1', ExpiresIn: 3600, TokenType: 'Bearer' };
}

/** An admin client that answers each command from a script and records what it was sent. */
function scriptedAdmin(...answers: Array<object | { error: string; status?: number }>) {
  const sent: Array<{ command: string; input: Record<string, unknown> }> = [];
  const client: CognitoAdminClient = {
    async send(command) {
      const c = command as { constructor: { name: string }; input: Record<string, unknown> };
      sent.push({ command: c.constructor.name, input: c.input });
      const next = answers.shift();
      if (!next) throw new Error(`unexpected ${c.constructor.name}`);
      if ('error' in next) throw Object.assign(new Error('the provider message, which echoes input'), { name: next.error, $metadata: { httpStatusCode: next.status ?? 400 } });
      return { $metadata: { httpStatusCode: 200 }, ...next };
    },
  };
  return Object.assign(client, { sent });
}

const cognitoUser = (sub: string, email = 'ada@example.com') => ({ Username: sub, Attributes: [{ Name: 'sub', Value: sub }, { Name: 'email', Value: email }, { Name: 'email_verified', Value: 'true' }, { Name: 'given_name', Value: 'Ada' }, { Name: 'family_name', Value: 'Lovelace' }] });

describe('signInWithPassword', () => {
  it('calls InitiateAuth with USER_PASSWORD_AUTH and the SECRET_HASH, one span, and reads the user from the ID token', async () => {
    const fetch = scriptedFetch({ json: { AuthenticationResult: await authResult() } });
    const tracer = new TestTracer();
    const result = await createCognitoIdentityClient(config, { fetch, tracer }).signInWithPassword({ email: 'ada@example.com', password: 'pw', ipAddress: '192.0.2.1' });

    expect(result).toMatchObject({ status: 'signed-in', user: { id: 'u-1', email: 'ada@example.com', emailVerified: true, name: 'Ada' }, tokens: { refreshToken: 'refresh-1', expiresAt: expect.any(Number) } });
    const [req] = fetch.requests;
    expect([req!.method, req!.url.href, req!.headers['x-amz-target'], req!.headers['content-type']]).toEqual(['POST', 'https://cognito-idp.us-east-1.amazonaws.com/', 'AWSCognitoIdentityProviderService.InitiateAuth', 'application/x-amz-json-1.1']);
    expect(req!.json).toEqual({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: 'client123',
      AuthParameters: { USERNAME: 'ada@example.com', PASSWORD: 'pw', SECRET_HASH: cognitoSecretHash('ada@example.com', 'client123', config.clientSecret) },
      UserContextData: { IpAddress: '192.0.2.1' },
    });
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([['cognito auth.initiate', 'client', 'cognito-idp.us-east-1.amazonaws.com']]);
    assertProviderSpans(tracer.spans);
  });

  it('computes the SECRET_HASH as Cognito documents it', () => {
    // echo -n "ada@example.comclient123" | openssl dgst -sha256 -hmac secret -binary | openssl enc -base64
    expect(cognitoSecretHash('ada@example.com', 'client123', 'secret')).toBe('qPZ7x9u/seUFcaLmHSfYZVuJco2aM1i4tLagALORGYA=');
  });

  it("sends no SECRET_HASH for a public client", async () => {
    const fetch = scriptedFetch({ json: { AuthenticationResult: await authResult() } });
    await createCognitoIdentityClient(pool, { fetch }).signInWithPassword({ email: 'ada@example.com', password: 'pw' });
    expect((fetch.requests[0]!.json as { AuthParameters: object }).AuthParameters).toEqual({ USERNAME: 'ada@example.com', PASSWORD: 'pw' });
  });

  it("refuses a wrong password as auth/invalid-credentials, without Cognito's message, and doesn't retry it", async () => {
    const fetch = scriptedFetch({ status: 400, json: { __type: 'NotAuthorizedException', message: 'Incorrect username or password.' } });
    const tracer = new TestTracer();
    const err = await createCognitoIdentityClient(config, { fetch, tracer }).signInWithPassword({ email: 'ada@example.com', password: 'nope' }).catch((e) => e);
    expect([err.code, err.metadata.providerCode, fetch.requests.length]).toEqual(['auth/invalid-credentials', 'NotAuthorizedException', 1]);
    expect(err.message).not.toContain('Incorrect');
    expect(tracer.spans[0]!.attributes['error.type']).toBe('NotAuthorizedException');
    assertProviderSpans(tracer.spans);
  });

  it('retries a rate limit (Cognito answers 400 TooManyRequestsException), then fails as auth/rate-limited', async () => {
    const limited = { status: 400, json: { __type: 'com.amazonaws.cognito#TooManyRequestsException', message: 'Rate exceeded' } };
    const fetch = scriptedFetch(limited, limited, limited);
    const err = await createCognitoIdentityClient(config, { fetch, ...noWait }).signInWithPassword({ email: 'a@b.co', password: 'pw' }).catch((e) => e);
    expect([err.code, err.metadata.category, fetch.requests.length]).toEqual(['auth/rate-limited', 'rate-limited', 3]);
  });

  it("holds an unconfirmed user at email-verification, and a second factor at mfa with Cognito's session", async () => {
    const fetch = scriptedFetch(
      { status: 400, json: { __type: 'UserNotConfirmedException' } },
      { json: { ChallengeName: 'SOFTWARE_TOKEN_MFA', ChallengeParameters: { USER_ID_FOR_SRP: 'u-1' }, Session: 'session-token-of-twenty-chars' } },
      { json: { ChallengeName: 'NEW_PASSWORD_REQUIRED', Session: 'session-token-of-twenty-chars' } },
    );
    const client = createCognitoIdentityClient(config, { fetch });
    const input = { email: 'ada@example.com', password: 'pw' };
    expect(await client.signInWithPassword(input)).toEqual({ status: 'pending', reason: 'email-verification', email: 'ada@example.com' });
    expect(await client.signInWithPassword(input)).toEqual({ status: 'pending', reason: 'mfa', email: 'ada@example.com', pendingToken: 'session-token-of-twenty-chars', providerData: { challengeName: 'SOFTWARE_TOKEN_MFA', username: 'u-1' } });
    await expect(client.signInWithPassword(input)).rejects.toMatchObject({ code: 'auth/not-supported', metadata: { challengeName: 'NEW_PASSWORD_REQUIRED' } });
  });

  it('checks its input before calling', async () => {
    await expect(createCognitoIdentityClient(config, { fetch: scriptedFetch() }).signInWithPassword({ email: '', password: 'pw' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('managed login', () => {
  it('builds the authorize URL with PKCE and the identity provider', () => {
    const url = new URL(createCognitoIdentityClient(config).authorizationUrl({ provider: 'google', redirectUri: 'https://app.example.com/cb', state: 'st', codeChallenge: 'ch', loginHint: 'ada@example.com' }));
    expect(url.origin + url.pathname).toBe('https://auth.example.com/oauth2/authorize');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      response_type: 'code',
      client_id: 'client123',
      redirect_uri: 'https://app.example.com/cb',
      state: 'st',
      scope: 'openid email profile',
      identity_provider: 'Google',
      code_challenge_method: 'S256',
      code_challenge: 'ch',
      login_hint: 'ada@example.com',
    });
    const github = createCognitoIdentityClient({ ...config, identityProviders: { github: 'GitHub' } }).authorizationUrl({ provider: 'github', redirectUri: 'https://app.example.com/cb', state: 's', codeChallenge: 'c' });
    expect(new URL(github).searchParams.get('identity_provider')).toBe('GitHub');
  });

  it("fails clearly without the pool's domain, or a name for GitHub", () => {
    const input = { provider: 'github' as const, redirectUri: 'https://app.example.com/cb', state: 's', codeChallenge: 'c' };
    expect(() => createCognitoIdentityClient(config).authorizationUrl(input)).toThrow(expect.objectContaining({ code: 'auth/invalid-config' }));
    expect(() => createCognitoIdentityClient(pool).authorizationUrl({ ...input, provider: 'google' })).toThrow(expect.objectContaining({ code: 'auth/invalid-config', message: expect.stringContaining('COGNITO_DOMAIN') }));
  });

  it('exchanges the code at /oauth2/token with the secret as Basic auth', async () => {
    const r = await authResult('u-9');
    const fetch = scriptedFetch({ json: { access_token: r.AccessToken, id_token: r.IdToken, refresh_token: 'refresh-9', token_type: 'Bearer', expires_in: 3600 } });
    const tracer = new TestTracer();
    const result = await createCognitoIdentityClient(config, { fetch, tracer }).exchangeCode({ code: 'the-code', codeVerifier: 'v'.repeat(43), redirectUri: 'https://app.example.com/cb' });
    expect(result).toMatchObject({ status: 'signed-in', user: { id: 'u-9' }, tokens: { refreshToken: 'refresh-9', idToken: r.IdToken } });
    const [req] = fetch.requests;
    expect(req!.url.href).toBe('https://auth.example.com/oauth2/token');
    expect(req!.headers.authorization).toBe(`Basic ${Buffer.from(`client123:${config.clientSecret}`).toString('base64')}`);
    expect(req!.headers['content-type']).toBe('application/x-www-form-urlencoded');
    expect(Object.fromEntries(new URLSearchParams(req!.body))).toEqual({ grant_type: 'authorization_code', code: 'the-code', code_verifier: 'v'.repeat(43), redirect_uri: 'https://app.example.com/cb' });
    expect(tracer.spans.map((s) => [s.name, s.attributes['server.address']])).toEqual([['cognito tokens.exchange', 'auth.example.com']]);
    assertProviderSpans(tracer.spans);
  });

  it('refuses a spent code as auth/invalid-grant', async () => {
    const fetch = scriptedFetch({ status: 400, json: { error: 'invalid_grant' } });
    await expect(createCognitoIdentityClient(config, { fetch }).exchangeCode({ code: 'used', codeVerifier: 'v'.repeat(43), redirectUri: 'https://app.example.com/cb' })).rejects.toMatchObject({ code: 'auth/invalid-grant', metadata: { providerCode: 'invalid_grant' } });
  });

  it('refreshes as a public client (client_id in the body), keeping the refresh token Cognito did not rotate', async () => {
    const r = await authResult();
    const fetch = scriptedFetch({ json: { access_token: r.AccessToken, id_token: r.IdToken, token_type: 'Bearer', expires_in: 3600 } });
    const tokens = await createCognitoIdentityClient({ ...pool, domain: 'https://example.auth.us-east-1.amazoncognito.com/' }, { fetch }).refresh('old-refresh');
    expect(tokens.refreshToken).toBe('old-refresh');
    const [req] = fetch.requests;
    expect(req!.url.href).toBe('https://example.auth.us-east-1.amazoncognito.com/oauth2/token');
    expect(req!.headers.authorization).toBeUndefined();
    expect(Object.fromEntries(new URLSearchParams(req!.body))).toEqual({ grant_type: 'refresh_token', refresh_token: 'old-refresh', client_id: 'client123' });
  });

  it('signs out by revoking the refresh token, and does nothing without one', async () => {
    const fetch = scriptedFetch({ status: 200, text: '' });
    const client = createCognitoIdentityClient(config, { fetch });
    await client.signOut({});
    await client.signOut({ refreshToken: 'refresh-1' });
    expect(fetch.requests.map((r) => [r.url.href, r.body])).toEqual([['https://auth.example.com/oauth2/revoke', 'token=refresh-1']]);
    expect(client.logoutUrl({ logoutUri: 'https://app.example.com/bye' })).toBe('https://auth.example.com/logout?client_id=client123&logout_uri=https%3A%2F%2Fapp.example.com%2Fbye');
  });
});

describe('users, through the admin API', () => {
  it('gets a user by sub with AdminGetUser, one span, and falls back to ListUsers for a federated user', async () => {
    const admin = scriptedAdmin({ ...cognitoUser('u-1'), Attributes: undefined, UserAttributes: cognitoUser('u-1').Attributes }, { error: 'UserNotFoundException' }, { Users: [cognitoUser('u-2', 'g@example.com')] });
    const tracer = new TestTracer();
    const client = createCognitoIdentityClient(config, { adminClient: admin, tracer });
    expect(await client.getUser('u-1')).toEqual({ id: 'u-1', email: 'ada@example.com', emailVerified: true, name: 'Ada Lovelace', avatarUrl: null, externalId: null });
    expect((await client.getUser('u-2'))?.email).toBe('g@example.com');
    expect(admin.sent).toEqual([
      { command: 'AdminGetUserCommand', input: { UserPoolId: 'us-east-1_TEST', Username: 'u-1' } },
      { command: 'AdminGetUserCommand', input: { UserPoolId: 'us-east-1_TEST', Username: 'u-2' } },
      { command: 'ListUsersCommand', input: { UserPoolId: 'us-east-1_TEST', Filter: 'sub = "u-2"', Limit: 1 } },
    ]);
    expect(tracer.spans.map((s) => [s.name, s.attributes['http.request.method'], s.attributes['http.response.status_code']])).toEqual([
      ['cognito users.get', 'POST', 200],
      ['cognito users.get', 'POST', 400],
      ['cognito users.list', 'POST', 200],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('finds a user by email with an exact, escaped filter, or null', async () => {
    const admin = scriptedAdmin({ Users: [cognitoUser('u-1', 'Ada@Example.com')] }, { Users: [] });
    const client = createCognitoIdentityClient(config, { adminClient: admin });
    expect((await client.findUserByEmail('ada@example.com'))?.id).toBe('u-1');
    expect(await client.findUserByEmail('a"b@example.com')).toBeNull();
    expect(admin.sent.map((s) => s.input.Filter)).toEqual(['email = "ada@example.com"', 'email = "a\\"b@example.com"']);
  });

  it('creates a user without the invitation, sets the password permanent, and stores the external id', async () => {
    const created = { User: { ...cognitoUser('u-3'), Attributes: [...cognitoUser('u-3').Attributes, { Name: 'custom:external_id', Value: 'app-3' }] } };
    const admin = scriptedAdmin(created, {});
    const user = await createCognitoIdentityClient({ ...config, externalIdAttribute: 'custom:external_id', trustCustomAttributes: true }, { adminClient: admin }).createUser({ email: 'ada@example.com', emailVerified: true, password: 'Pw-12345678', name: 'Ada', externalId: 'app-3' });
    expect(user).toMatchObject({ id: 'u-3', externalId: 'app-3' });
    expect(admin.sent).toEqual([
      {
        command: 'AdminCreateUserCommand',
        input: {
          UserPoolId: 'us-east-1_TEST',
          Username: 'ada@example.com',
          MessageAction: 'SUPPRESS',
          UserAttributes: [{ Name: 'email', Value: 'ada@example.com' }, { Name: 'email_verified', Value: 'true' }, { Name: 'name', Value: 'Ada' }, { Name: 'custom:external_id', Value: 'app-3' }],
        },
      },
      { command: 'AdminSetUserPasswordCommand', input: { UserPoolId: 'us-east-1_TEST', Username: 'u-3', Password: 'Pw-12345678', Permanent: true } },
    ]);
  });

  it("fails a create for an existing user with Cognito's code, and refuses an external id it has nowhere to keep", async () => {
    const err = await createCognitoIdentityClient(config, { adminClient: scriptedAdmin({ error: 'UsernameExistsException' }) }).createUser({ email: 'ada@example.com', emailVerified: false }).catch((e) => e);
    expect([err.code, err.metadata.providerCode, err.metadata.category]).toEqual(['auth/invalid-grant', 'UsernameExistsException', 'conflict']);
    expect(err.message).not.toContain('echoes');
    await expect(createCognitoIdentityClient(config, { adminClient: scriptedAdmin() }).createUser({ email: 'a@b.co', emailVerified: false, externalId: 'x' })).rejects.toMatchObject({ code: 'auth/invalid-config' });
  });

  it("doesn't retry a create after an outage (Cognito may have made the user), but does retry a read", async () => {
    const down = scriptedAdmin({ error: 'InternalErrorException', status: 500 }, cognitoUser('u-3'));
    await expect(createCognitoIdentityClient(config, { adminClient: down, ...noWait }).createUser({ email: 'ada@example.com', emailVerified: false })).rejects.toBeDefined();
    expect(down.sent.map((s) => s.command)).toEqual(['AdminCreateUserCommand']);

    const sent: string[] = [];
    const unreachable: CognitoAdminClient = {
      async send(command) {
        sent.push((command as { constructor: { name: string } }).constructor.name);
        throw Object.assign(new Error('socket hang up'), { name: 'TimeoutError' });
      },
    };
    await expect(createCognitoIdentityClient(config, { adminClient: unreachable, ...noWait }).createUser({ email: 'ada@example.com', emailVerified: false })).rejects.toBeDefined();
    expect(sent).toEqual(['AdminCreateUserCommand']);

    const flaky = scriptedAdmin({ error: 'InternalErrorException', status: 500 }, cognitoUser('u-1'));
    expect((await createCognitoIdentityClient(config, { adminClient: flaky, ...noWait }).getUser('u-1'))?.id).toBe('u-1');
    expect(flaky.sent.map((s) => s.command)).toEqual(['AdminGetUserCommand', 'AdminGetUserCommand']);
  });

  it('refuses a custom attribute as externalIdAttribute unless the app says users cannot write it', () => {
    expect(() => createCognitoIdentityClient({ ...config, externalIdAttribute: 'custom:external_id' })).toThrow(expect.objectContaining({ name: 'ConfigError', code: 'cognito/user-writable-attribute' }));
    expect(() => createCognitoIdentityClient({ ...config, externalIdAttribute: 'custom:external_id', trustCustomAttributes: false })).toThrow(expect.objectContaining({ code: 'cognito/user-writable-attribute' }));
    expect(() => createCognitoIdentityClient({ ...config, externalIdAttribute: 'custom:external_id', trustCustomAttributes: true })).not.toThrow();
  });

  it('deletes by username, and treats a missing user as deleted', async () => {
    const admin = scriptedAdmin(cognitoUser('u-1'), {}, { error: 'UserNotFoundException' }, { Users: [] });
    const client = createCognitoIdentityClient(config, { adminClient: admin });
    await client.deleteUser('u-1');
    await client.deleteUser('gone');
    expect(admin.sent.map((s) => s.command)).toEqual(['AdminGetUserCommand', 'AdminDeleteUserCommand', 'AdminGetUserCommand', 'ListUsersCommand']);
  });

  it('retries a throttled admin call, and fails an unknown pool as auth/identity-provider', async () => {
    const admin = scriptedAdmin({ error: 'TooManyRequestsException' }, cognitoUser('u-1'), { error: 'ResourceNotFoundException' });
    const client = createCognitoIdentityClient(config, { adminClient: admin, ...noWait });
    expect((await client.getUser('u-1'))?.id).toBe('u-1');
    await expect(client.getUser('u-1')).rejects.toMatchObject({ code: 'auth/identity-provider', metadata: { providerCode: 'ResourceNotFoundException' } });
  });

  it('signs the admin calls with SigV4 through the AWS SDK', async () => {
    const seen: Array<{ headers: Record<string, string> }> = [];
    const requestHandler = {
      async handle(request: { headers: Record<string, string> }) {
        seen.push(request);
        const body = JSON.stringify({ Username: 'u-1', UserAttributes: [{ Name: 'sub', Value: 'u-1' }, { Name: 'email', Value: 'ada@example.com' }] });
        return { response: { statusCode: 200, headers: { 'content-type': 'application/x-amz-json-1.1' }, body: Readable.from([Buffer.from(body)]) } };
      },
    };
    const sdk = new CognitoIdentityProviderClient({ region: 'us-east-1', credentials: { accessKeyId: 'AKIDEXAMPLE', secretAccessKey: 'secret' }, requestHandler, maxAttempts: 1 });
    const tracer = new TestTracer();
    expect((await createCognitoIdentityClient(config, { adminClient: sdk, tracer }).getUser('u-1'))?.email).toBe('ada@example.com');
    const headers = Object.fromEntries(Object.entries(seen[0]!.headers).map(([k, v]) => [k.toLowerCase(), v]));
    expect(headers['x-amz-target']).toBe('AWSCognitoIdentityProviderService.AdminGetUser');
    expect(headers.authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE\/\d{8}\/us-east-1\/cognito-idp\/aws4_request/);
    expect(tracer.spans.map((s) => [s.name, s.attributes['http.response.status_code']])).toEqual([['cognito users.get', 200]]);
    assertProviderSpans(tracer.spans);
  });

  it('wants both AWS key settings or neither', () => {
    expect(() => createCognitoIdentityClient({ ...config, awsAccessKeyId: 'AKID' })).toThrow(expect.objectContaining({ code: 'auth/invalid-config' }));
  });
});

describe('what Cognito does its own way', () => {
  it('fails clearly', async () => {
    const client = createCognitoIdentityClient(config);
    await expect(client.sendPasswordReset('a@b.co')).rejects.toMatchObject({ code: 'auth/not-supported' });
    await expect(client.startEmailCode('a@b.co')).rejects.toMatchObject({ code: 'auth/not-supported' });
    await expect(client.verifyEmailAndSignIn({ pendingToken: 'p', code: '1' })).rejects.toMatchObject({ code: 'auth/not-supported' });
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    const env: Record<string, string> = { COGNITO_REGION: 'us-east-1', COGNITO_USER_POOL_ID: 'us-east-1_TEST', COGNITO_CLIENT_ID: 'client123', COGNITO_DOMAIN: 'auth.example.com' };
    expect(settingsFromEnv(settings, (n) => env[n])).toEqual({ region: 'us-east-1', userPoolId: 'us-east-1_TEST', clientId: 'client123', domain: 'auth.example.com' });
    expect(() => settingsFromEnv(settings, () => undefined)).toThrow(expect.objectContaining({ code: 'integrations/missing-setting' }));
    expect(settings.every((s) => s.whereToFind)).toBe(true);
    expect(checkSetting(settings[1]!, 'test', 'us-east-1_TEST')).toBeNull();
  });
});

describe('the fakes', () => {
  it('stand in for the client and the pool in an app’s tests', async () => {
    const issuer = await issuerP;
    const fake = fakeCognitoIdentityClient({ issuer, users: [{ id: 'u-1', email: 'ada@example.com', emailVerified: true, name: null, avatarUrl: null, externalId: null, password: 'pw' }] });
    const signedIn = await fake.signInWithPassword({ email: 'ada@example.com', password: 'pw' });
    if (signedIn.status !== 'signed-in') throw new Error('expected a sign-in');
    const { createCognitoAuth } = await import('./index');
    expect((await createCognitoAuth(pool, { jwks: issuer.jwks }).verify(signedIn.tokens.accessToken)).userId).toBe('u-1');
    await expect(fake.signInWithPassword({ email: 'ada@example.com', password: 'no' })).rejects.toMatchObject({ code: 'auth/invalid-credentials' });
    fake.codes_.set('code-1', 'u-1');
    expect((await fake.exchangeCode({ code: 'code-1', codeVerifier: 'v', redirectUri: 'https://x.test' })).status).toBe('signed-in');
    await expect(fake.exchangeCode({ code: 'code-1', codeVerifier: 'v', redirectUri: 'https://x.test' })).rejects.toMatchObject({ code: 'auth/invalid-grant' });
    await fake.signOut({ refreshToken: signedIn.tokens.refreshToken });
    await expect(fake.refresh(signedIn.tokens.refreshToken)).rejects.toMatchObject({ code: 'auth/invalid-grant' });
  });
});
