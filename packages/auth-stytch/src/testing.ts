/**
 * `@mariachi/auth-stytch/testing`: Stytch for an app's tests, held in memory. `fakeStytchIdentity()` has the
 * `StytchIdentityClient`'s shape (the auth port's `IdentityClient`), `fakeStytchAuth(identity)` checks the tokens
 * it issues as `StytchAuthProvider` checks real ones, and `signedStytchWebhook` builds a delivery Stytch would post.
 */
import { randomBytes } from 'node:crypto';
import { AuthError } from '@mariachi/core';
import type { AuthProvider, AuthProviderWebhookConfig, IdentityClient, IdentityUser, ResolvedIdentity, SignInResult, TokenSet } from '@mariachi/auth';
import { signStandardWebhook, parseStandardWebhookSecrets } from '@mariachi/webhooks/verify';
import { StytchWebhookHandler } from './webhooks';

interface FakeUser {
  user: IdentityUser;
  password?: string;
}

export interface FakeStytchIdentity extends IdentityClient {
  users_: Map<string, FakeUser>;
  /** Live sessions, by session id. */
  sessions_: Map<string, { userId: string; sessionToken: string }>;
  /** The last code Stytch "emailed" to each address. */
  sentCodes: Map<string, string>;
  /** The last reset token Stytch "emailed" to each address. */
  sentResets: Map<string, string>;
  /** A code `exchangeCode` accepts, as if this user had just signed in with Google or GitHub. */
  oauthCode(userId: string): string;
}

const id = (prefix: string) => `${prefix}-test-${randomBytes(8).toString('hex')}`;

/** An in-memory Stytch: seed users (with passwords), then hand it to the code under test in place of the client. */
export function fakeStytchIdentity(seed: Array<Partial<IdentityUser> & { email: string; password?: string }> = []): FakeStytchIdentity {
  const users_ = new Map<string, FakeUser>();
  const sessions_ = new Map<string, { userId: string; sessionToken: string }>();
  const sentCodes = new Map<string, string>();
  const sentResets = new Map<string, string>();
  const oauthCodes = new Map<string, string>();

  const add = (u: Partial<IdentityUser> & { email: string; password?: string }): IdentityUser => {
    const user: IdentityUser = { id: u.id ?? id('user'), email: u.email, emailVerified: u.emailVerified ?? false, name: u.name ?? null, avatarUrl: u.avatarUrl ?? null, externalId: u.externalId ?? null };
    users_.set(user.id, { user, password: u.password });
    return user;
  };
  for (const u of seed) add(u);
  const byEmail = (email: string) => [...users_.values()].find((u) => u.user.email.toLowerCase() === email.toLowerCase());
  const start = (userId: string, verify = false): SignInResult => {
    const entry = users_.get(userId)!;
    if (verify) entry.user = { ...entry.user, emailVerified: true };
    const sessionId = id('session');
    const sessionToken = `fake-stytch-session.${sessionId}`;
    sessions_.set(sessionId, { userId, sessionToken });
    return { status: 'signed-in', user: entry.user, tokens: tokensFor(sessionId, sessionToken) };
  };
  const refused = (what: string) => new AuthError('auth/invalid-grant', `Stytch refused the request (${what})`);

  return {
    provider: 'stytch',
    users_,
    sessions_,
    sentCodes,
    sentResets,
    oauthCode(userId) {
      const code = id('oauth');
      oauthCodes.set(code, userId);
      return code;
    },
    async signInWithPassword(input) {
      const u = byEmail(input.email);
      if (!u || u.password === undefined || u.password !== input.password) throw new AuthError('auth/invalid-credentials', 'Stytch refused the request (unauthorized_credentials)');
      return start(u.user.id);
    },
    authorizationUrl(input) {
      const redirect = new URL(input.redirectUri);
      redirect.searchParams.set('state', input.state);
      const url = new URL(`https://test.stytch.com/v1/public/oauth/${input.provider}/start`);
      url.searchParams.set('login_redirect_url', redirect.toString());
      url.searchParams.set('signup_redirect_url', redirect.toString());
      url.searchParams.set('code_challenge', input.codeChallenge);
      return url.toString();
    },
    async exchangeCode(input) {
      const userId = oauthCodes.get(input.code);
      if (!userId) throw refused('oauth_token_not_found');
      oauthCodes.delete(input.code);
      return start(userId, true);
    },
    async refresh(refreshToken) {
      const found = [...sessions_.entries()].find(([, s]) => s.sessionToken === refreshToken);
      if (!found) throw refused('session_not_found');
      return tokensFor(found[0], refreshToken);
    },
    async signOut(input) {
      if (input.sessionId) sessions_.delete(input.sessionId);
      else for (const [sid, s] of sessions_) if (s.sessionToken === input.refreshToken) sessions_.delete(sid);
    },
    async getUser(userId) {
      return users_.get(userId)?.user ?? null;
    },
    async findUserByEmail(email) {
      return byEmail(email)?.user ?? null;
    },
    async createUser(input) {
      if (byEmail(input.email)) throw refused('duplicate_email');
      // As at Stytch, a user starts unverified until they sign in with the address.
      return add({ email: input.email, name: input.name ?? null, externalId: input.externalId ?? null, password: input.password, emailVerified: false });
    },
    async deleteUser(userId) {
      users_.delete(userId);
    },
    async sendPasswordReset(email) {
      if (!byEmail(email)) return { deliveredBy: 'nobody' };
      sentResets.set(email.toLowerCase(), id('reset'));
      return { deliveredBy: 'provider' };
    },
    async resetPassword(input) {
      const email = [...sentResets.entries()].find(([, t]) => t === input.token)?.[0];
      const u = email ? byEmail(email) : undefined;
      if (!email || !u) throw refused('unable_to_auth_password_reset_token');
      sentResets.delete(email);
      u.password = input.password;
      u.user = { ...u.user, emailVerified: true };
      return u.user;
    },
    async setPassword() {
      throw new AuthError('auth/not-supported', "Stytch doesn't set a password by user id: send a password reset instead");
    },
    async startEmailCode(email) {
      if (!byEmail(email)) add({ email });
      sentCodes.set(email.toLowerCase(), String(100000 + (randomBytes(4).readUInt32BE() % 900000)));
      return { deliveredBy: 'provider' };
    },
    async signInWithEmailCode(input) {
      const u = byEmail(input.email);
      if (!u || sentCodes.get(input.email.toLowerCase()) !== input.code) throw refused('unable_to_auth_otp_code');
      sentCodes.delete(input.email.toLowerCase());
      return start(u.user.id, true);
    },
    async pendingVerificationCode() {
      throw new AuthError('auth/not-supported', 'Stytch never holds a sign-in for email verification');
    },
    async verifyEmailAndSignIn() {
      throw new AuthError('auth/not-supported', 'Stytch never holds a sign-in for email verification');
    },
  };
}

function tokensFor(sessionId: string, sessionToken: string): TokenSet {
  return { accessToken: `fake-stytch-jwt.${sessionId}`, refreshToken: sessionToken, sessionId, expiresAt: Date.now() + 5 * 60_000 };
}

/**
 * An `AuthProvider` that accepts the access tokens `identity` issues while their session lives, as
 * `StytchAuthProvider` accepts Stytch's session JWTs. Its webhook handler is the real one.
 */
export function fakeStytchAuth(identity: FakeStytchIdentity): AuthProvider {
  return {
    name: 'stytch',
    async verify(token: string): Promise<ResolvedIdentity> {
      const sessionId = token.startsWith('fake-stytch-jwt.') ? token.slice('fake-stytch-jwt.'.length) : '';
      const session = identity.sessions_.get(sessionId);
      if (!session) throw new AuthError('auth/invalid-token', 'Stytch token verification failed');
      return { userId: session.userId, tenantId: '', scopes: [], roles: [], identityType: 'session', sessionId, claims: { sub: session.userId } };
    },
    createWebhookHandler(config: AuthProviderWebhookConfig) {
      return new StytchWebhookHandler({ secret: config.secret });
    },
  };
}

/** A Stytch event body: a user created (the default), updated or deleted. */
export function stytchUserEvent(action: 'CREATE' | 'UPDATE' | 'DELETE', user: { user_id: string; email?: string } & Record<string, unknown>, source: 'DIRECT' | 'DASHBOARD' = 'DIRECT'): Record<string, unknown> {
  const { email, ...rest } = user;
  return {
    project_id: 'project-test-00000000-0000-0000-0000-000000000000',
    event_id: id('event'),
    action,
    object_type: 'user',
    source,
    id: user.user_id,
    timestamp: new Date().toISOString(),
    ...(action === 'DELETE' ? {} : { user: { status: 'active', emails: email ? [{ email_id: id('email'), email, verified: true }] : [], name: {}, providers: [], roles: [], ...rest } }),
  };
}

/** The body and Svix headers Stytch would send for this event, signed with the endpoint's `whsec_…` secret. */
export function signedStytchWebhook(body: Record<string, unknown>, secret: string, at: Date = new Date()): { rawBody: string; headers: Record<string, string> } {
  const rawBody = JSON.stringify(body);
  const msgId = `msg_${randomBytes(12).toString('hex')}`;
  const timestamp = Math.floor(at.getTime() / 1000);
  const [key] = parseStandardWebhookSecrets(secret);
  return { rawBody, headers: { 'svix-id': msgId, 'svix-timestamp': String(timestamp), 'svix-signature': signStandardWebhook(key!, msgId, timestamp, rawBody) } };
}
