import { describe, expect, it } from 'vitest';
import { FusionAuthIdentityClient, fusionAuthEmailVouched, type FusionAuthIdentityClientConfig, type FusionAuthUser } from './identity-client';
import { createFusionAuthIdentityClient } from './index';

const CONFIG = {
  serverUrl: 'https://auth.example.org/',
  apiKey: 'fa-api-key',
  applicationId: 'app-1',
  clientId: 'client-1',
  clientSecret: 'secret-1',
  identityProviderIds: { google: 'idp-google', github: 'idp-github' },
};

const jwt = (claims: Record<string, unknown>) =>
  `${Buffer.from('{"alg":"RS256"}').toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.sig`;
const ACCESS = jwt({ sub: 'fa-user-1', sid: 'rt-id-1', exp: 1_792_656_827 });

const faUser = (over: Partial<FusionAuthUser> = {}): FusionAuthUser => ({
  id: 'fa-user-1',
  email: 'ada@example.org',
  fullName: 'Ada Lovelace',
  imageUrl: 'https://img.example.org/ada.png',
  verified: true,
  data: { externalId: 'app-uuid-1' },
  identities: [{ type: 'email', value: 'ada@example.org', verified: true, verifiedReason: 'Completed' }],
  ...over,
});

type Call = { method: string; url: string; headers: Record<string, string>; body?: string };

function fakeFetch(respond: (call: Call) => { status: number; body?: unknown }, config: Partial<FusionAuthIdentityClientConfig> = {}) {
  const calls: Call[] = [];
  const impl = (async (url: string, init: RequestInit) => {
    const call = { method: init.method ?? 'GET', url, headers: init.headers as Record<string, string>, body: init.body as string | undefined };
    calls.push(call);
    const { status, body } = respond(call);
    return new Response(body === undefined ? '' : JSON.stringify(body), { status });
  }) as unknown as typeof fetch;
  return { calls, client: new FusionAuthIdentityClient({ ...CONFIG, ...config, fetch: impl }) };
}

describe('fusionAuthEmailVouched (ID0 F1)', () => {
  it.each([
    ['a completed verification', faUser(), true],
    ['an admin-created user (Skipped)', faUser({ identities: [{ type: 'email', value: 'ada@example.org', verified: false, verifiedReason: 'Skipped' }] }), true],
    ['a self-registered address (Disabled), whatever the legacy flag says', faUser({ verified: true, identities: [{ type: 'email', value: 'ada@example.org', verified: false, verifiedReason: 'Disabled' }] }), false],
    ['a pending verification', faUser({ identities: [{ type: 'email', value: 'ada@example.org', verified: false, verifiedReason: 'Pending' }] }), false],
    ["another address's identity", faUser({ identities: [{ type: 'email', value: 'other@example.org', verified: true }] }), false],
    ['an older FusionAuth without identities: the legacy flag', faUser({ identities: undefined, verified: true }), true],
  ])('%s', (_name, user, expected) => {
    expect(fusionAuthEmailVouched(user)).toBe(expected);
  });
});

describe('FusionAuthIdentityClient', () => {
  it('signs in with a password through the Login API', async () => {
    const { client, calls } = fakeFetch(() => ({ status: 200, body: { token: ACCESS, refreshToken: 'rt-1', user: faUser() } }));
    const out = await client.signInWithPassword({ email: 'ada@example.org', password: 'pw', ipAddress: '203.0.113.7' });
    expect(out).toEqual({
      status: 'signed-in',
      user: { id: 'fa-user-1', email: 'ada@example.org', emailVerified: true, name: 'Ada Lovelace', avatarUrl: 'https://img.example.org/ada.png', externalId: 'app-uuid-1' },
      tokens: { accessToken: ACCESS, refreshToken: 'rt-1', sessionId: 'rt-id-1', expiresAt: 1_792_656_827_000 },
    });
    expect(calls[0]).toMatchObject({ method: 'POST', url: 'https://auth.example.org/api/login', headers: { Authorization: 'fa-api-key', 'X-Forwarded-For': '203.0.113.7' } });
    expect(JSON.parse(calls[0]!.body!)).toEqual({ loginId: 'ada@example.org', password: 'pw', applicationId: 'app-1', ipAddress: '203.0.113.7' });
  });

  it('reports an unvouched email as unverified even when FusionAuth signs the user in', async () => {
    const self = faUser({ identities: [{ type: 'email', value: 'ada@example.org', verified: false, verifiedReason: 'Disabled' }] });
    const { client } = fakeFetch(() => ({ status: 200, body: { token: ACCESS, refreshToken: 'rt-1', user: self } }));
    const out = await client.signInWithPassword({ email: 'ada@example.org', password: 'pw' });
    expect(out.status === 'signed-in' && out.user.emailVerified).toBe(false);
  });

  it.each([
    [212, { user: faUser() }, { status: 'pending', reason: 'email-verification', email: 'ada@example.org' }],
    [242, { twoFactorId: 'tf-1' }, { status: 'pending', reason: 'mfa', pendingToken: 'tf-1' }],
  ])('turns %s into a pending sign-in', async (status, body, expected) => {
    const { client } = fakeFetch(() => ({ status, body }));
    expect(await client.signInWithPassword({ email: 'ada@example.org', password: 'pw' })).toMatchObject(expected);
  });

  it.each([
    [404, 'auth/invalid-credentials'],
    [409, 'auth/invalid-credentials'],
    [429, 'auth/rate-limited'],
    [500, 'auth/identity-provider'],
  ])('throws for a %s login', async (status, code) => {
    const { client } = fakeFetch(() => ({ status }));
    await expect(client.signInWithPassword({ email: 'a@example.org', password: 'pw' })).rejects.toMatchObject({ code });
  });

  it('builds the authorize URL with PKCE and the identity provider hint', () => {
    const { client } = fakeFetch(() => ({ status: 500 }));
    const url = new URL(client.authorizationUrl({ provider: 'google', redirectUri: 'https://app.example.org/cb', state: 's', codeChallenge: 'cc' }));
    expect(`${url.origin}${url.pathname}`).toBe('https://auth.example.org/oauth2/authorize');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: 'client-1',
      response_type: 'code',
      redirect_uri: 'https://app.example.org/cb',
      scope: 'openid email profile offline_access',
      state: 's',
      code_challenge: 'cc',
      code_challenge_method: 'S256',
      idp_hint: 'idp-google',
    });
  });

  it('exchanges a code with the verifier, then reads the user from the User API', async () => {
    const { client, calls } = fakeFetch((c) =>
      c.url.endsWith('/oauth2/token')
        ? { status: 200, body: { access_token: ACCESS, refresh_token: 'rt-1', userId: 'fa-user-1' } }
        : { status: 200, body: { user: faUser() } },
    );
    const out = await client.exchangeCode({ code: 'c', codeVerifier: 'v', redirectUri: 'https://app.example.org/cb' });
    expect(out).toMatchObject({ status: 'signed-in', user: { id: 'fa-user-1', emailVerified: true }, tokens: { refreshToken: 'rt-1', sessionId: 'rt-id-1' } });
    expect(Object.fromEntries(new URLSearchParams(calls[0]!.body))).toEqual({
      client_id: 'client-1',
      client_secret: 'secret-1',
      grant_type: 'authorization_code',
      code: 'c',
      code_verifier: 'v',
      redirect_uri: 'https://app.example.org/cb',
    });
    expect(calls[0]!.headers.Authorization).toBeUndefined();
    expect(calls[1]!.url).toBe('https://auth.example.org/api/user/fa-user-1');
  });

  it('refreshes (keeping the refresh token FusionAuth reuses), and refuses a revoked one', async () => {
    const ok = fakeFetch(() => ({ status: 200, body: { access_token: ACCESS } }));
    expect(await ok.client.refresh('rt-1')).toMatchObject({ accessToken: ACCESS, refreshToken: 'rt-1', sessionId: 'rt-id-1' });
    const revoked = fakeFetch(() => ({ status: 400, body: { error: 'invalid_grant' } }));
    await expect(revoked.client.refresh('rt-old')).rejects.toMatchObject({ code: 'auth/invalid-grant' });
  });

  it('signs out by refresh token or session id; an unknown token is already signed out', async () => {
    const { client, calls } = fakeFetch((c) => ({ status: c.url.includes('gone') ? 404 : 200 }));
    await client.signOut({ refreshToken: 'rt 1' });
    await client.signOut({ sessionId: 'rt-id-1' });
    await client.signOut({ refreshToken: 'gone' });
    await client.signOut({});
    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      'DELETE https://auth.example.org/api/jwt/refresh?token=rt%201',
      'DELETE https://auth.example.org/api/jwt/refresh/rt-id-1',
      'DELETE https://auth.example.org/api/jwt/refresh?token=gone',
    ]);
  });

  it('looks users up (null when missing), creates them with a registration, deletes them', async () => {
    const { client, calls } = fakeFetch((c) => {
      if (c.method === 'GET') return c.url.includes('missing') ? { status: 404 } : { status: 200, body: { user: faUser() } };
      if (c.method === 'POST') return { status: 200, body: { user: faUser({ email: 'new@example.org', identities: [{ type: 'email', value: 'new@example.org', verified: false, verifiedReason: 'Skipped' }] }) } };
      return { status: 200 };
    });
    expect((await client.getUser('fa-user-1'))?.externalId).toBe('app-uuid-1');
    expect(await client.getUser('missing')).toBeNull();
    expect((await client.findUserByEmail('ada@example.org'))?.id).toBe('fa-user-1');

    const created = await client.createUser({ email: 'new@example.org', emailVerified: true, externalId: 'app-uuid-2', name: 'New' });
    expect(created).toMatchObject({ email: 'new@example.org', emailVerified: true });
    const post = calls.find((c) => c.method === 'POST')!;
    expect(post.url).toBe('https://auth.example.org/api/user/registration');
    const sent = JSON.parse(post.body!);
    expect(sent).toMatchObject({
      user: { email: 'new@example.org', fullName: 'New', data: { externalId: 'app-uuid-2' } },
      registration: { applicationId: 'app-1' },
      skipVerification: true,
      sendSetPasswordEmail: false,
    });
    expect(sent.user.password.length).toBeGreaterThan(30);

    await client.deleteUser('fa-user-1');
    expect(calls.at(-1)).toMatchObject({ method: 'DELETE', url: 'https://auth.example.org/api/user/fa-user-1?hardDelete=true' });
  });

  it('starts a password reset (FusionAuth sends it) and says nothing for an unknown address', async () => {
    const { client, calls } = fakeFetch(() => ({ status: 404 }));
    expect(await client.sendPasswordReset('nobody@example.org')).toEqual({ deliveredBy: 'nobody' });
    expect(JSON.parse(calls[0]!.body!)).toEqual({ loginId: 'nobody@example.org', applicationId: 'app-1', sendForgotPasswordEmail: true });
    expect(await fakeFetch(() => ({ status: 200 })).client.sendPasswordReset('ada@example.org')).toEqual({ deliveredBy: 'provider' });
    const unset = fakeFetch(() => ({ status: 403 }));
    await expect(unset.client.sendPasswordReset('ada@example.org')).rejects.toMatchObject({ code: 'auth/not-supported' });
  });

  it('passwordless: the app gets the code, and the code signs in through the Login API', async () => {
    const { client, calls } = fakeFetch((c) => (c.url.endsWith('/api/passwordless/start') ? { status: 200, body: { code: 'pl-code' } } : { status: 200, body: { token: ACCESS, refreshToken: 'rt-1', user: faUser() } }));
    expect(await client.startEmailCode('ada@example.org')).toEqual({ deliveredBy: 'app', code: 'pl-code' });
    expect(JSON.parse(calls[0]!.body!)).toEqual({ loginId: 'ada@example.org', applicationId: 'app-1' });
    const out = await client.signInWithEmailCode({ email: 'ada@example.org', code: 'pl-code' });
    expect(out).toMatchObject({ status: 'signed-in', user: { id: 'fa-user-1' } });
    expect(calls[1]!.url).toBe('https://auth.example.org/api/passwordless/login');
    const wrong = fakeFetch(() => ({ status: 404 }));
    await expect(wrong.client.signInWithEmailCode({ email: 'a@x', code: 'nope' })).rejects.toMatchObject({ code: 'auth/invalid-grant' });
  });

  it('sets a password through the User API', async () => {
    const { client, calls } = fakeFetch(() => ({ status: 200, body: { user: faUser() } }));
    await client.setPassword('fa-user-1', 'pw-2');
    expect(calls[0]).toMatchObject({ method: 'PATCH', url: 'https://auth.example.org/api/user/fa-user-1' });
    expect(JSON.parse(calls[0]!.body!)).toEqual({ user: { password: 'pw-2' } });
  });

  it("returns the reset token for the app to send with emailsSentBy 'app'", async () => {
    const { client, calls } = fakeFetch(() => ({ status: 200, body: { changePasswordId: 'cp-1' } }), { emailsSentBy: 'app' });
    expect(await client.sendPasswordReset('ada@example.org')).toEqual({ deliveredBy: 'app', token: 'cp-1' });
    expect(JSON.parse(calls[0]!.body!)).toEqual({ loginId: 'ada@example.org', applicationId: 'app-1', sendForgotPasswordEmail: false });
    const missing = fakeFetch(() => ({ status: 200, body: {} }), { emailsSentBy: 'app' });
    await expect(missing.client.sendPasswordReset('ada@example.org')).rejects.toMatchObject({ code: 'auth/identity-provider' });
  });

  describe('resetPassword', () => {
    it('changes the password with the changePasswordId, then names the user with a token-less one-time-password login', async () => {
      const { client, calls } = fakeFetch((c) =>
        c.url.endsWith('/api/user/change-password') ? { status: 200, body: { oneTimePassword: 'otp-1' } } : { status: 200, body: { user: faUser() } },
      );
      const user = await client.resetPassword({ token: 'cp-1', password: 'new-long-password' });
      expect(user).toMatchObject({ id: 'fa-user-1', email: 'ada@example.org', emailVerified: true });
      expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual(['POST https://auth.example.org/api/user/change-password', 'POST https://auth.example.org/api/login']);
      expect(JSON.parse(calls[0]!.body!)).toEqual({ changePasswordId: 'cp-1', password: 'new-long-password' });
      expect(JSON.parse(calls[1]!.body!)).toEqual({ oneTimePassword: 'otp-1', applicationId: 'app-1', noJWT: true });
    });

    it('names the user when the login is held for email verification (212)', async () => {
      const unverified = faUser({ identities: [{ type: 'email', value: 'ada@example.org', verified: false, verifiedReason: 'Pending' }] });
      const { client } = fakeFetch((c) =>
        c.url.endsWith('/api/user/change-password') ? { status: 200, body: { oneTimePassword: 'otp-1' } } : { status: 212, body: { user: unverified, emailVerificationId: 'ev-1' } },
      );
      expect(await client.resetPassword({ token: 'cp-1', password: 'pw' })).toMatchObject({ id: 'fa-user-1', emailVerified: false });
    });

    it.each([
      ['a used, expired or unknown token', 404, undefined, 'auth/invalid-grant'],
      ['a password the tenant refuses', 400, { fieldErrors: { password: [{ code: '[tooShort]password', message: 'The [password] property is shorter than the minimum of [8] characters.' }] } }, 'auth/invalid-grant'],
      ['a user with two-factor', 400, { generalErrors: [{ code: '[TrustTokenRequired]', message: 'This request requires a Trust Token.' }] }, 'auth/not-supported'],
      ['the rate limit', 429, undefined, 'auth/rate-limited'],
      ['a FusionAuth failure', 500, undefined, 'auth/identity-provider'],
    ])('maps %s (%s) to %s', async (_name, status, body, code) => {
      const { client, calls } = fakeFetch(() => ({ status, body }));
      await expect(client.resetPassword({ token: 'cp-1', password: 'pw' })).rejects.toMatchObject({ code });
      expect(calls).toHaveLength(1);
    });

    it("says what FusionAuth refused about the password, with its error codes", async () => {
      const body = { fieldErrors: { password: [{ code: '[tooShort]password', message: 'The [password] property is shorter than the minimum of [8] characters.' }] } };
      const { client } = fakeFetch(() => ({ status: 400, body }));
      await expect(client.resetPassword({ token: 'cp-1', password: 'pw' })).rejects.toMatchObject({
        message: expect.stringContaining('shorter than the minimum'),
        metadata: { status: 400, errors: ['[tooShort]password'] },
      });
    });

    it('fails as the provider when the one-time-password login names nobody', async () => {
      for (const [status, code] of [[404, 'auth/identity-provider'], [242, 'auth/identity-provider'], [429, 'auth/rate-limited']] as const) {
        const { client } = fakeFetch((c) => (c.url.endsWith('/api/user/change-password') ? { status: 200, body: { oneTimePassword: 'otp-1' } } : { status, body: {} }));
        await expect(client.resetPassword({ token: 'cp-1', password: 'pw' })).rejects.toMatchObject({ code });
      }
    });
  });

  describe('email verification with a code', () => {
    const held = { user: faUser({ identities: [{ type: 'email', value: 'ada@example.org', verified: false, verifiedReason: 'Pending' }] }), emailVerificationId: 'ev-current' };

    /** FusionAuth for a held sign-in: the login, a new verification, the Verify Email API and the passwordless sign-in. */
    function fusionAuth(over: (c: Call) => { status: number; body?: unknown } | undefined = () => undefined, config: Partial<FusionAuthIdentityClientConfig> = {}) {
      return fakeFetch((c) => {
        const answer = over(c);
        if (answer) return answer;
        if (c.url.endsWith('/api/login')) return { status: 212, body: held };
        if (c.method === 'PUT' && c.url.includes('/api/user/verify-email')) return { status: 200, body: { verificationId: 'ev-new', oneTimeCode: 'K7Q2ZD' } };
        if (c.url.endsWith('/api/user/verify-email')) return { status: 200 };
        if (c.url.endsWith('/api/passwordless/start')) return { status: 200, body: { code: 'pl-code' } };
        if (c.url.endsWith('/api/passwordless/login')) return { status: 200, body: { token: ACCESS, refreshToken: 'rt-1', user: faUser() } };
        return { status: 500 };
      }, config);
    }

    async function pendingFrom(client: FusionAuthIdentityClient) {
      const out = await client.signInWithPassword({ email: 'ada@example.org', password: 'pw' });
      if (out.status !== 'pending') throw new Error('expected a held sign-in');
      return out;
    }

    it("app sends the email: the sign-in starts a verification without FusionAuth's email, and its code is sealed in the pending token", async () => {
      const { client, calls } = fusionAuth(undefined, { emailsSentBy: 'app' });
      const pending = await pendingFrom(client);
      expect(pending).toMatchObject({ status: 'pending', reason: 'email-verification', email: 'ada@example.org', user: { id: 'fa-user-1', emailVerified: false } });
      expect(calls[1]).toMatchObject({ method: 'PUT', url: 'https://auth.example.org/api/user/verify-email?email=ada%40example.org&applicationId=app-1&sendVerifyEmail=false', headers: { Authorization: 'fa-api-key' } });
      // Neither the code nor FusionAuth's ids are readable in the token.
      expect(pending.pendingToken).toMatch(/^fa1\./);
      for (const secret of ['K7Q2ZD', 'ev-new', 'fa-user-1']) {
        expect(pending.pendingToken).not.toContain(secret);
        expect(Buffer.from(pending.pendingToken!.split('.')[2]!, 'base64url').toString('latin1')).not.toContain(secret);
      }
      expect(await client.pendingVerificationCode(pending)).toBe('K7Q2ZD');
      expect(calls).toHaveLength(2);

      const out = await client.verifyEmailAndSignIn({ pendingToken: pending.pendingToken!, code: 'K7Q2ZD', ipAddress: '203.0.113.7' });
      expect(out).toMatchObject({ status: 'signed-in', user: { id: 'fa-user-1' }, tokens: { accessToken: ACCESS, refreshToken: 'rt-1' } });
      expect(calls.slice(2).map((c) => `${c.method} ${c.url}`)).toEqual([
        'POST https://auth.example.org/api/user/verify-email',
        'POST https://auth.example.org/api/passwordless/start',
        'POST https://auth.example.org/api/passwordless/login',
      ]);
      expect(JSON.parse(calls[2]!.body!)).toEqual({ verificationId: 'ev-new', oneTimeCode: 'K7Q2ZD' });
      expect(calls[2]!.headers['X-Forwarded-For']).toBe('203.0.113.7');
      expect(JSON.parse(calls[3]!.body!)).toEqual({ loginId: 'ada@example.org', applicationId: 'app-1' });
      expect(JSON.parse(calls[4]!.body!)).toEqual({ code: 'pl-code', ipAddress: '203.0.113.7' });
    });

    it("reads the code under the documented name (verificationOneTimeCode) too", async () => {
      const { client } = fusionAuth((c) => (c.method === 'PUT' ? { status: 200, body: { verificationId: 'ev-new', verificationOneTimeCode: 'AB12CD' } } : undefined), { emailsSentBy: 'app' });
      expect(await client.pendingVerificationCode(await pendingFrom(client))).toBe('AB12CD');
    });

    it('FusionAuth sends the email: the pending token names its current verification, and there is no code for the app', async () => {
      const { client, calls } = fusionAuth();
      const pending = await pendingFrom(client);
      expect(calls).toHaveLength(1);
      await expect(client.pendingVerificationCode(pending)).rejects.toMatchObject({ code: 'auth/not-supported' });
      expect((await client.verifyEmailAndSignIn({ pendingToken: pending.pendingToken!, code: 'FROMFA' })).status).toBe('signed-in');
      expect(JSON.parse(calls[1]!.body!)).toEqual({ verificationId: 'ev-current', oneTimeCode: 'FROMFA' });
    });

    it('holds a sign-in without a pending token when FusionAuth verifies by link (no verification id)', async () => {
      const { client, calls } = fusionAuth((c) => (c.url.endsWith('/api/login') ? { status: 212, body: { user: held.user } } : undefined), { emailsSentBy: 'app' });
      const pending = await pendingFrom(client);
      expect(pending.pendingToken).toBeUndefined();
      expect(calls).toHaveLength(1);
      await expect(client.pendingVerificationCode(pending)).rejects.toMatchObject({ code: 'auth/not-supported' });
      await expect(client.pendingVerificationCode({ status: 'pending', reason: 'mfa', pendingToken: 'tf-1' })).rejects.toMatchObject({ code: 'auth/not-supported' });
    });

    it('refuses a pending token it did not seal, or sealed with another client secret, before calling FusionAuth', async () => {
      const { client, calls } = fusionAuth(undefined, { emailsSentBy: 'app' });
      const pending = await pendingFrom(client);
      const other = fusionAuth(undefined, { emailsSentBy: 'app', clientSecret: 'another-secret' });
      const [prefix, iv, data] = pending.pendingToken!.split('.');
      const flipped = Buffer.from(data!, 'base64url');
      flipped[0] = flipped[0]! ^ 1;
      for (const pendingToken of ['ev-new', 'fa1.', `${prefix}.${iv}.${flipped.toString('base64url')}`]) {
        await expect(client.verifyEmailAndSignIn({ pendingToken, code: 'K7Q2ZD' })).rejects.toMatchObject({ code: 'auth/invalid-grant' });
        await expect(client.pendingVerificationCode({ ...pending, pendingToken })).rejects.toMatchObject({ code: 'auth/invalid-grant' });
      }
      await expect(other.client.verifyEmailAndSignIn({ pendingToken: pending.pendingToken!, code: 'K7Q2ZD' })).rejects.toMatchObject({ code: 'auth/invalid-grant' });
      expect(calls).toHaveLength(2);
      expect(other.calls).toHaveLength(0);
    });

    it.each([
      ['a wrong code', 400, { fieldErrors: { verificationId: [{ code: '[invalid]verificationId', message: 'The [verificationId] property is invalid.' }] } }, 'auth/invalid-grant'],
      ['a used, replaced or expired verification', 404, undefined, 'auth/invalid-grant'],
      ["a tenant that doesn't verify emails", 403, undefined, 'auth/not-supported'],
      ['the rate limit', 429, undefined, 'auth/rate-limited'],
      ['a FusionAuth failure', 503, undefined, 'auth/identity-provider'],
    ])('maps %s (%s) from the Verify Email API to %s, and signs nobody in', async (_name, status, body, code) => {
      const { client, calls } = fusionAuth((c) => (c.method === 'POST' && c.url.endsWith('/api/user/verify-email') ? { status, body } : undefined), { emailsSentBy: 'app' });
      const pending = await pendingFrom(client);
      await expect(client.verifyEmailAndSignIn({ pendingToken: pending.pendingToken!, code: 'K7Q2ZD' })).rejects.toMatchObject({ code });
      expect(calls.some((c) => c.url.includes('/api/passwordless/'))).toBe(false);
    });

    it.each([
      ['passwordless login off for the application', 400, { fieldErrors: { applicationId: [{ code: '[disabled]applicationId', message: 'The Application for the Id provided has passwordless login disabled.' }] } }, 'auth/not-supported'],
      ['a user deleted since', 404, undefined, 'auth/invalid-grant'],
      ['a FusionAuth failure', 500, undefined, 'auth/identity-provider'],
    ])('maps %s (%s) from the sign-in after verifying to %s', async (_name, status, body, code) => {
      const { client } = fusionAuth((c) => (c.url.endsWith('/api/passwordless/start') ? { status, body } : undefined), { emailsSentBy: 'app' });
      const pending = await pendingFrom(client);
      await expect(client.verifyEmailAndSignIn({ pendingToken: pending.pendingToken!, code: 'K7Q2ZD' })).rejects.toMatchObject({ code });
    });

    it('refuses to hand out tokens for a different user than the one verified', async () => {
      const { client } = fusionAuth((c) => (c.url.endsWith('/api/passwordless/login') ? { status: 200, body: { token: ACCESS, refreshToken: 'rt-1', user: faUser({ id: 'someone-else' }) } } : undefined), { emailsSentBy: 'app' });
      const pending = await pendingFrom(client);
      await expect(client.verifyEmailAndSignIn({ pendingToken: pending.pendingToken!, code: 'K7Q2ZD' })).rejects.toMatchObject({ code: 'auth/identity-provider' });
    });

    it('a failed start of the verification fails the sign-in', async () => {
      const { client } = fusionAuth((c) => (c.method === 'PUT' ? { status: 429 } : undefined), { emailsSentBy: 'app' });
      await expect(client.signInWithPassword({ email: 'ada@example.org', password: 'pw' })).rejects.toMatchObject({ code: 'auth/rate-limited' });
    });
  });

  it('reports an unreachable FusionAuth as an identity-provider error', async () => {
    const client = new FusionAuthIdentityClient({
      ...CONFIG,
      fetch: (async () => {
        throw new TypeError('fetch failed');
      }) as unknown as typeof fetch,
    });
    await expect(client.getUser('x')).rejects.toMatchObject({ code: 'auth/identity-provider' });
  });

  it('requires its configuration', () => {
    expect(() => createFusionAuthIdentityClient({ ...CONFIG, clientSecret: '' })).toThrow(/clientSecret/);
    expect(createFusionAuthIdentityClient(CONFIG).provider).toBe('fusionauth');
  });
});
