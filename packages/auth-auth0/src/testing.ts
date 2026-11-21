/**
 * `@mariachi/auth-auth0/testing`: Auth0 for an app's tests, with nothing sent to Auth0. An `IdentityClient` held in
 * memory, an `Auth0AuthProvider` with a key of its own and a `sign` for its tokens, and event stream deliveries to
 * post to the app's webhook endpoint.
 */
import { randomBytes } from 'node:crypto';
import type { IdentityClient, IdentityUser, SignInResult, TokenSet } from '@mariachi/auth';
import { AuthError } from '@mariachi/core';
import { type JWTPayload, SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';
import { type Auth0AuthConfig, Auth0AuthProvider } from './provider';
import type { Auth0Event, Auth0User } from './schemas';

export interface FakeAuth0User extends IdentityUser {
  password?: string;
}

export interface FakeAuth0IdentityClient extends IdentityClient {
  /** The users, by id. */
  users_: Map<string, FakeAuth0User>;
  /** Codes `exchangeCode` accepts, to the user each signs in. Add one to stand for a finished Universal Login. */
  codes_: Map<string, string>;
  /** Live refresh tokens, to their user. */
  refreshTokens_: Map<string, string>;
  /** The last code `startEmailCode` "emailed" to each address. */
  emailCodes_: Map<string, string>;
  /** Addresses `sendPasswordReset` "emailed" a link to. */
  passwordResets_: string[];
}

const token = (prefix: string) => `${prefix}_${randomBytes(9).toString('base64url')}`;

/** An in-memory Auth0 behind the `IdentityClient` port: seed users, then hand it to the code under test. */
export function fakeAuth0IdentityClient(seed: { users?: FakeAuth0User[] } = {}): FakeAuth0IdentityClient {
  const users_ = new Map((seed.users ?? []).map((u) => [u.id, u]));
  const codes_ = new Map<string, string>();
  const refreshTokens_ = new Map<string, string>();
  const emailCodes_ = new Map<string, string>();
  const passwordResets_: string[] = [];
  const public_ = ({ password: _password, ...user }: FakeAuth0User): IdentityUser => user;
  const byEmail = (email: string) => [...users_.values()].find((u) => u.email.toLowerCase() === email.toLowerCase());
  const tokens = (userId: string): TokenSet => {
    const refreshToken = token('rt');
    refreshTokens_.set(refreshToken, userId);
    return { accessToken: token('at'), refreshToken, sessionId: token('sid'), expiresAt: Date.now() + 86_400_000 };
  };
  const signedIn = (user: FakeAuth0User): SignInResult => ({ status: 'signed-in', user: public_(user), tokens: tokens(user.id) });
  const notSupported = async (): Promise<never> => {
    throw new AuthError('auth/not-supported', 'Auth0 verifies addresses and resets passwords with links it emails');
  };
  return {
    provider: 'auth0',
    users_,
    codes_,
    refreshTokens_,
    emailCodes_,
    passwordResets_,
    async signInWithPassword(input) {
      const user = byEmail(input.email);
      if (!user?.password || user.password !== input.password) throw new AuthError('auth/invalid-credentials', 'Auth0 refused the password sign-in (403, invalid_user_password)');
      return signedIn(user);
    },
    authorizationUrl(input) {
      const url = new URL('https://fake.auth0.test/authorize');
      for (const [k, v] of Object.entries({ connection: input.provider, redirect_uri: input.redirectUri, state: input.state, code_challenge: input.codeChallenge })) url.searchParams.set(k, v);
      return url.toString();
    },
    async exchangeCode(input) {
      const user = users_.get(codes_.get(input.code) ?? '');
      if (!user) throw new AuthError('auth/invalid-grant', 'Auth0 refused the code exchange (403, invalid_grant)');
      codes_.delete(input.code);
      return signedIn(user);
    },
    async refresh(refreshToken) {
      const userId = refreshTokens_.get(refreshToken);
      if (!userId) throw new AuthError('auth/invalid-grant', 'Auth0 refused the refresh (403, invalid_grant)');
      refreshTokens_.delete(refreshToken);
      return tokens(userId);
    },
    async signOut(input) {
      if (input.refreshToken) refreshTokens_.delete(input.refreshToken);
    },
    async getUser(id) {
      const user = users_.get(id);
      return user ? public_(user) : null;
    },
    async findUserByEmail(email) {
      const user = byEmail(email);
      return user ? public_(user) : null;
    },
    async createUser(input) {
      if (byEmail(input.email)) throw new AuthError('auth/invalid-grant', 'Auth0 refused the user creation (409)');
      const user: FakeAuth0User = {
        id: `auth0|${randomBytes(12).toString('hex')}`,
        email: input.email.toLowerCase(),
        emailVerified: input.emailVerified,
        name: input.name ?? null,
        avatarUrl: null,
        externalId: input.externalId ?? null,
        password: input.password,
      };
      users_.set(user.id, user);
      return public_(user);
    },
    async deleteUser(id) {
      users_.delete(id);
    },
    async sendPasswordReset(email) {
      if (byEmail(email)) passwordResets_.push(email.toLowerCase());
      return { deliveredBy: 'provider' };
    },
    resetPassword: notSupported,
    async setPassword(userId, password) {
      const user = users_.get(userId);
      if (!user) throw new AuthError('auth/invalid-grant', 'Auth0 refused the new password (404)');
      user.password = password;
    },
    async startEmailCode(email) {
      emailCodes_.set(email.toLowerCase(), String(100000 + (randomBytes(4).readUInt32BE() % 900000)));
      return { deliveredBy: 'provider' };
    },
    async signInWithEmailCode(input) {
      const address = input.email.toLowerCase();
      if (!input.code || emailCodes_.get(address) !== input.code) throw new AuthError('auth/invalid-grant', 'Auth0 refused the email code sign-in (403, invalid_grant)');
      emailCodes_.delete(address);
      let user = byEmail(address);
      if (!user) {
        // Auth0's email connection signs a new address up.
        user = { id: `email|${randomBytes(12).toString('hex')}`, email: address, emailVerified: true, name: address, avatarUrl: null, externalId: null };
        users_.set(user.id, user);
      }
      user.emailVerified = true;
      return signedIn(user);
    },
    pendingVerificationCode: notSupported,
    verifyEmailAndSignIn: notSupported,
  };
}

export interface TestAuth0Auth {
  provider: Auth0AuthProvider;
  /** A token the provider accepts: issued by the domain, for the audience, signed RS256, an hour long. Claims override. */
  sign(claims?: JWTPayload & Record<string, unknown>, options?: { expiresIn?: string | number }): Promise<string>;
}

/**
 * An `Auth0AuthProvider` that trusts a key made for the test, with `sign` for its tokens: an app's routes can be
 * tested with real verification and no tenant.
 */
export async function testAuth0Auth(config: Partial<Auth0AuthConfig> = {}): Promise<TestAuth0Auth> {
  const full: Auth0AuthConfig = { domain: 'test.auth0.test', audience: 'https://api.test', ...config };
  const { privateKey, publicKey } = await generateKeyPair('RS256', { extractable: true });
  const jwk = { ...(await exportJWK(publicKey)), kid: 'test', alg: 'RS256', use: 'sig' };
  const provider = new Auth0AuthProvider(full, createLocalJWKSet({ keys: [jwk] }));
  const audience = full.audience ?? full.clientId;
  return {
    provider,
    async sign(claims = {}, options = {}) {
      const jwt = new SignJWT({ sub: 'auth0|test-user', iss: provider.issuer, aud: audience, ...claims })
        .setProtectedHeader({ alg: 'RS256', kid: 'test', typ: 'JWT' })
        .setIssuedAt();
      if (claims.exp === undefined) jwt.setExpirationTime(options.expiresIn ?? '1h');
      return jwt.sign(privateKey);
    },
  };
}

/** A user as Auth0 describes them in events and the Management API. */
export function auth0User(overrides: Partial<Auth0User> = {}): Auth0User {
  const id = randomBytes(12).toString('hex');
  return {
    user_id: `auth0|${id}`,
    email: `user-${id.slice(0, 6)}@example.com`,
    email_verified: false,
    name: 'Test User',
    identities: [{ connection: 'Username-Password-Authentication', provider: 'auth0', user_id: id, isSocial: false }],
    created_at: '2026-11-21T10:00:00.000Z',
    updated_at: '2026-11-21T10:00:00.000Z',
    ...overrides,
  };
}

/** An event as a webhook event stream delivers it. */
export function auth0Event(type: 'user.created' | 'user.updated' | 'user.deleted' | (string & {}), user: Auth0User = auth0User(), overrides: Partial<Auth0Event> = {}): Auth0Event {
  return {
    id: `evt_${randomBytes(11).toString('base64url')}`,
    source: 'urn:auth0:test',
    specversion: '1.0',
    type,
    time: '2026-11-21T10:00:01.000Z',
    data: { object: user },
    a0tenant: 'test',
    a0stream: 'est_test',
    ...overrides,
  };
}

/** The body and `Authorization` header an event stream with this bearer token would send. */
export function auth0WebhookDelivery(event: Auth0Event, streamToken: string): { rawBody: string; headers: Record<string, string> } {
  return { rawBody: JSON.stringify(event), headers: { authorization: `Bearer ${streamToken}`, 'content-type': 'application/json' } };
}
