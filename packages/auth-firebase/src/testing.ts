/**
 * `@mariachi/auth-firebase/testing`: Firebase for an app's tests, in memory. `fakeFirebase()` gives a
 * real `FirebaseAuthProvider` that trusts a test key instead of Google's, ID tokens signed with it,
 * and an `IdentityClient` with the same shape as `FirebaseIdentityClient` that issues those tokens.
 */
import { randomBytes } from 'node:crypto';
import type { EmailDelivery, IdentityClient, IdentityUser, SignInResult, TokenSet } from '@mariachi/auth';
import { AuthError, type Context, IntegrationError } from '@mariachi/core';
import { type JWK, SignJWT, exportJWK, generateKeyPair } from 'jose';
import { FIREBASE_KEYS_URL } from './api';
import type { FirebaseIdentityClient } from './identity-client';
import { type FirebaseAuthConfig, FirebaseAuthProvider } from './provider';

export interface FirebaseTestKeys {
  projectId: string;
  /** The public keys, as Firebase publishes them. */
  jwks: { keys: JWK[] };
  /** A `fetch` that answers the keys endpoint with `jwks`, for `createFirebaseAuth(config, { fetch })`. */
  fetch: typeof fetch;
  /** An ID token for this project, signed with the test key: `sub` is the user's id. */
  idToken(claims: { sub: string; [claim: string]: unknown }, options?: { authTime?: number; expiresIn?: number }): Promise<string>;
}

/** A signing key standing in for Google's, and ID tokens signed with it. */
export async function firebaseTestKeys(projectId = 'demo-test'): Promise<FirebaseTestKeys> {
  const { privateKey, publicKey } = await generateKeyPair('RS256', { extractable: true });
  const kid = randomBytes(10).toString('hex');
  const jwks = { keys: [{ ...(await exportJWK(publicKey)), kid, alg: 'RS256', use: 'sig' }] };
  const fetch = (async (input: string | URL | Request) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url !== FIREBASE_KEYS_URL) throw new IntegrationError('integrations/unexpected-request', 'the Firebase test keys answer only the keys endpoint');
    return new Response(JSON.stringify(jwks), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } });
  }) as typeof globalThis.fetch;
  return {
    projectId,
    jwks,
    fetch,
    async idToken({ sub, ...claims }, options = {}) {
      const now = Math.floor(Date.now() / 1000);
      return new SignJWT({ user_id: sub, auth_time: options.authTime ?? now, firebase: { sign_in_provider: 'password', identities: {} }, ...claims })
        .setProtectedHeader({ alg: 'RS256', kid, typ: 'JWT' })
        .setIssuer(`https://securetoken.google.com/${projectId}`)
        .setAudience(projectId)
        .setSubject(sub)
        .setIssuedAt(now)
        .setExpirationTime(now + (options.expiresIn ?? 3600))
        .sign(privateKey);
    },
  };
}

export interface FakeUser extends IdentityUser {
  password?: string;
  disabled?: boolean;
}

/** An email the fake would have had Firebase send. */
export interface FakeEmail {
  kind: 'password-reset' | 'sign-in-link';
  email: string;
  code: string;
}

export type FakeFirebaseIdentity = Pick<FirebaseIdentityClient, keyof IdentityClient | 'revokeSessions'> & {
  users_: Map<string, FakeUser>;
  /** What Firebase would have emailed, newest last. */
  emails_: FakeEmail[];
};

export interface FakeFirebase {
  projectId: string;
  /** A real `FirebaseAuthProvider`, trusting the fake's key. */
  auth: FirebaseAuthProvider;
  identity: FakeFirebaseIdentity;
  /** An ID token for a user, as the browser's Firebase SDK would send it. */
  idToken(user: Pick<IdentityUser, 'id'> & Partial<IdentityUser>, claims?: Record<string, unknown>): Promise<string>;
}

/**
 * Firebase in memory. Seed users (with a `password` to sign in with), hand `identity` to the code
 * under test in place of the client and `auth` in place of the provider, and post `idToken(user)`
 * as the bearer token.
 */
export async function fakeFirebase(options: { projectId?: string; users?: Array<Partial<FakeUser> & { email: string }>; auth?: Omit<FirebaseAuthConfig, 'projectId'> } = {}): Promise<FakeFirebase> {
  const keys = await firebaseTestKeys(options.projectId);
  const auth = new FirebaseAuthProvider({ ...options.auth, checkRevoked: false, projectId: keys.projectId }, { fetch: keys.fetch });
  const users_ = new Map<string, FakeUser>();
  const refreshTokens = new Map<string, string>();
  const codes = new Map<string, { kind: FakeEmail['kind']; email: string }>();
  const emails_: FakeEmail[] = [];
  const id = () => randomBytes(14).toString('base64url');
  const add = (u: Partial<FakeUser> & { email: string }): FakeUser => {
    const user: FakeUser = { id: id(), emailVerified: false, name: null, avatarUrl: null, externalId: null, ...u };
    users_.set(user.id, user);
    return user;
  };
  for (const u of options.users ?? []) add(u);
  const byEmail = (email: string) => [...users_.values()].find((u) => u.email.toLowerCase() === email.toLowerCase());
  const public_ = ({ password: _p, disabled: _d, ...user }: FakeUser): IdentityUser => user;
  const idToken: FakeFirebase['idToken'] = (user, claims = {}) =>
    keys.idToken({ sub: user.id, ...(user.email ? { email: user.email, email_verified: user.emailVerified === true } : {}), ...(user.name ? { name: user.name } : {}), ...claims });
  const tokens = async (user: FakeUser): Promise<TokenSet> => {
    const refreshToken = id();
    refreshTokens.set(refreshToken, user.id);
    return { accessToken: await idToken(user), refreshToken, expiresAt: Date.now() + 3600_000 };
  };
  const signedIn = async (user: FakeUser): Promise<SignInResult> => ({ status: 'signed-in', user: public_(user), tokens: await tokens(user) });
  const refused = (code: 'auth/invalid-credentials' | 'auth/invalid-grant', providerCode: string) => new AuthError(code, `Firebase refused the request (${providerCode})`, { providerCode });
  const issue = (kind: FakeEmail['kind'], email: string) => {
    const code = id();
    codes.set(code, { kind, email });
    emails_.push({ kind, email, code });
    return code;
  };
  const notSupported = () => {
    throw new AuthError('auth/not-supported', 'Not supported by Firebase server-side');
  };

  const identity: FakeFirebaseIdentity = {
    provider: 'firebase',
    users_,
    emails_,
    async signInWithPassword({ email, password }) {
      const user = byEmail(email);
      if (!user || user.password === undefined || user.password !== password) throw refused('auth/invalid-credentials', 'INVALID_LOGIN_CREDENTIALS');
      if (user.disabled) throw refused('auth/invalid-credentials', 'USER_DISABLED');
      return signedIn(user);
    },
    authorizationUrl: notSupported,
    exchangeCode: async () => notSupported(),
    async refresh(refreshToken) {
      const user = users_.get(refreshTokens.get(refreshToken) ?? '');
      if (!user || user.disabled) throw refused('auth/invalid-grant', 'INVALID_REFRESH_TOKEN');
      refreshTokens.delete(refreshToken);
      return tokens(user);
    },
    async signOut() {},
    async revokeSessions(_ctx: Context, userId: string) {
      for (const [token, owner] of refreshTokens) if (owner === userId) refreshTokens.delete(token);
    },
    async getUser(userId) {
      const user = users_.get(userId);
      return user ? public_(user) : null;
    },
    async findUserByEmail(email) {
      const user = byEmail(email);
      return user ? public_(user) : null;
    },
    async createUser(input) {
      if (input.externalId !== undefined) throw new AuthError('auth/not-supported', 'Firebase stores no external id; keep the mapping in the app');
      if (byEmail(input.email)) throw refused('auth/invalid-grant', 'EMAIL_EXISTS');
      return public_(add({ email: input.email, emailVerified: input.emailVerified, password: input.password, name: input.name ?? null }));
    },
    async deleteUser(userId) {
      users_.delete(userId);
    },
    async sendPasswordReset(email): Promise<EmailDelivery<{ token: string; url?: string; expiresAt?: number }>> {
      if (!byEmail(email)) return { deliveredBy: 'nobody' };
      issue('password-reset', email);
      return { deliveredBy: 'provider' };
    },
    async resetPassword({ token, password }) {
      const pending = codes.get(token);
      const user = pending?.kind === 'password-reset' ? byEmail(pending.email) : undefined;
      if (!user) throw refused('auth/invalid-grant', 'INVALID_OOB_CODE');
      codes.delete(token);
      user.password = password;
      return public_(user);
    },
    async setPassword(userId, password) {
      const user = users_.get(userId);
      if (!user) throw refused('auth/invalid-grant', 'USER_NOT_FOUND');
      user.password = password;
    },
    async startEmailCode(email) {
      issue('sign-in-link', email);
      return { deliveredBy: 'provider' };
    },
    async signInWithEmailCode({ email, code }) {
      const pending = codes.get(code);
      if (pending?.kind !== 'sign-in-link' || pending.email.toLowerCase() !== email.toLowerCase()) throw refused('auth/invalid-grant', 'INVALID_OOB_CODE');
      codes.delete(code);
      const user = byEmail(email) ?? add({ email });
      user.emailVerified = true;
      return signedIn(user);
    },
    pendingVerificationCode: async () => notSupported(),
    verifyEmailAndSignIn: async () => notSupported(),
  };

  return { projectId: keys.projectId, auth, identity, idToken };
}
