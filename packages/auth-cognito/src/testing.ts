/**
 * `@mariachi/auth-cognito/testing`: Cognito for an app's tests, with no user pool. `cognitoTestIssuer` signs ID and
 * access tokens the way a pool does, for `createCognitoAuth(config, { jwks: issuer.jwks })`; `fakeCognitoIdentityClient`
 * is an in-memory `IdentityClient` with the same shape as `createCognitoIdentityClient`'s.
 */
import { randomUUID } from 'node:crypto';
import { type JSONWebKeySet, type JWTVerifyGetKey, SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';
import { AuthError } from '@mariachi/core';
import type { IdentityClient, IdentityUser, SignInResult } from '@mariachi/auth';
import type { CognitoTokenSet } from './identity-client';

export interface CognitoTestIssuer {
  /** The issuer's keys: pass as `deps.jwks` to `createCognitoAuth`. */
  jwks: JWTVerifyGetKey;
  /** The same keys as the pool's `jwks.json` serves them, for a scripted fetch. */
  jwksJson: JSONWebKeySet;
  issuer: string;
  /** An access token (`token_use: access`, `client_id`), for `sub` (random unless given), valid for an hour. */
  accessToken(claims?: Record<string, unknown> & { sub?: string }): Promise<string>;
  /** An ID token (`token_use: id`, `aud`), with the user's email verified unless the claims say otherwise. */
  idToken(claims?: Record<string, unknown> & { sub?: string }): Promise<string>;
}

/** A user pool's token issuer for tests: its own RSA key, the pool's issuer, and tokens signed as Cognito signs them. */
export async function cognitoTestIssuer(pool: { region: string; userPoolId: string; clientId: string }): Promise<CognitoTestIssuer> {
  const { publicKey, privateKey } = await generateKeyPair('RS256', { extractable: true });
  const kid = randomUUID();
  const jwksJson: JSONWebKeySet = { keys: [{ ...(await exportJWK(publicKey)), kid, alg: 'RS256', use: 'sig' }] };
  const issuer = `https://cognito-idp.${pool.region}.amazonaws.com/${pool.userPoolId}`;
  const sign = (claims: Record<string, unknown>, sub: string, audience?: string) => {
    const jwt = new SignJWT(claims).setProtectedHeader({ alg: 'RS256', kid }).setIssuer(issuer).setSubject(sub).setIssuedAt().setExpirationTime('1h');
    return (audience ? jwt.setAudience(audience) : jwt).sign(privateKey);
  };
  return {
    jwks: createLocalJWKSet(jwksJson),
    jwksJson,
    issuer,
    accessToken: ({ sub = randomUUID(), ...claims } = {}) => sign({ token_use: 'access', client_id: pool.clientId, scope: 'openid email profile', username: sub, ...claims }, sub),
    idToken: ({ sub = randomUUID(), ...claims } = {}) => sign({ token_use: 'id', email_verified: true, 'cognito:username': sub, ...claims }, sub, pool.clientId),
  };
}

export interface FakeCognitoIdentityClient extends IdentityClient {
  /** The users, by `sub`. */
  users_: Map<string, IdentityUser>;
  /** Their passwords, by `sub`. */
  passwords_: Map<string, string>;
  /** Authorization codes `exchangeCode` accepts, to the `sub` each signs in. */
  codes_: Map<string, string>;
  /** Refresh tokens outstanding, to their `sub`; `signOut` revokes one. */
  refreshTokens_: Map<string, string>;
  logoutUrl(input: { logoutUri: string }): string;
}

/**
 * An in-memory Cognito: seed users (with passwords), then hand it to the code under test in place of the client.
 * Tokens are signed by `issuer` when one is given, so the app's `createCognitoAuth` can verify them; otherwise opaque.
 * Password resets and email codes fail with `auth/not-supported`, as they do on the real client.
 */
export function fakeCognitoIdentityClient(seed: { users?: Array<IdentityUser & { password?: string }>; issuer?: CognitoTestIssuer; domain?: string } = {}): FakeCognitoIdentityClient {
  const users_ = new Map<string, IdentityUser>();
  const passwords_ = new Map<string, string>();
  const codes_ = new Map<string, string>();
  const refreshTokens_ = new Map<string, string>();
  for (const { password, ...user } of seed.users ?? []) {
    users_.set(user.id, user);
    if (password) passwords_.set(user.id, password);
  }
  const origin = `https://${seed.domain ?? 'auth.example.test'}`;
  const byEmail = (email: string) => [...users_.values()].find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  const tokens = async (user: IdentityUser, refreshToken = `fake-refresh-${randomUUID()}`): Promise<CognitoTokenSet> => {
    refreshTokens_.set(refreshToken, user.id);
    const expiresAt = Date.now() + 3_600_000;
    if (!seed.issuer) return { accessToken: `fake-access-${randomUUID()}`, refreshToken, expiresAt };
    return {
      accessToken: await seed.issuer.accessToken({ sub: user.id }),
      idToken: await seed.issuer.idToken({ sub: user.id, email: user.email, email_verified: user.emailVerified }),
      refreshToken,
      expiresAt,
    };
  };
  const signedIn = async (user: IdentityUser): Promise<SignInResult> => ({ status: 'signed-in', user, tokens: await tokens(user) });
  const refused = () => new AuthError('auth/invalid-grant', 'Cognito refused the code or token');
  const unsupported = async (): Promise<never> => {
    throw new AuthError('auth/not-supported', "CognitoIdentityClient doesn't offer this");
  };

  return {
    provider: 'cognito',
    users_,
    passwords_,
    codes_,
    refreshTokens_,
    async signInWithPassword({ email, password }) {
      const user = byEmail(email);
      if (!user || passwords_.get(user.id) !== password) throw new AuthError('auth/invalid-credentials', 'Invalid email or password');
      return signedIn(user);
    },
    authorizationUrl({ provider, redirectUri, state, codeChallenge }) {
      const url = new URL('/oauth2/authorize', origin);
      const params = { response_type: 'code', client_id: 'fake-client', redirect_uri: redirectUri, state, identity_provider: provider === 'google' ? 'Google' : provider, code_challenge_method: 'S256', code_challenge: codeChallenge };
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
      return url.toString();
    },
    async exchangeCode({ code }) {
      const user = users_.get(codes_.get(code) ?? '');
      codes_.delete(code);
      if (!user) throw refused();
      return signedIn(user);
    },
    async refresh(refreshToken) {
      const user = users_.get(refreshTokens_.get(refreshToken) ?? '');
      if (!user) throw refused();
      return tokens(user, refreshToken); // no rotation: the same refresh token stays good
    },
    async signOut({ refreshToken }) {
      if (refreshToken) refreshTokens_.delete(refreshToken);
    },
    logoutUrl({ logoutUri }) {
      return `${origin}/logout?client_id=fake-client&logout_uri=${encodeURIComponent(logoutUri)}`;
    },
    async getUser(id) {
      return users_.get(id) ?? null;
    },
    async findUserByEmail(email) {
      return byEmail(email);
    },
    async createUser(input) {
      if (byEmail(input.email)) throw new AuthError('auth/invalid-grant', 'Cognito refused the request (UsernameExistsException)', { providerCode: 'UsernameExistsException' });
      const user: IdentityUser = { id: randomUUID(), email: input.email, emailVerified: input.emailVerified, name: input.name ?? null, avatarUrl: null, externalId: input.externalId ?? null };
      users_.set(user.id, user);
      if (input.password) passwords_.set(user.id, input.password);
      return user;
    },
    async deleteUser(id) {
      users_.delete(id);
      passwords_.delete(id);
    },
    async setPassword(userId, password) {
      if (!users_.has(userId)) throw new AuthError('auth/invalid-grant', 'Cognito has no user with this id');
      passwords_.set(userId, password);
    },
    sendPasswordReset: unsupported,
    resetPassword: unsupported,
    startEmailCode: unsupported,
    signInWithEmailCode: unsupported,
    pendingVerificationCode: unsupported,
    verifyEmailAndSignIn: unsupported,
  };
}
