/**
 * `@mariachi/auth-kinde/testing`: Kinde for an app's tests, without Kinde. Keys to sign tokens and webhooks with
 * (handed to `KindeAuthProvider` and `kindeWebhookAuth` in place of the business's), and an in-memory
 * `IdentityClient` with `KindeIdentityClient`'s shape.
 */
import { randomUUID } from 'node:crypto';
import { type JWTPayload, type JWTVerifyGetKey, SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';
import { AuthError } from '@mariachi/core';
import type { CreateIdentityUserInput, IdentityClient, IdentityUser, SignInResult, TokenSet } from '@mariachi/auth';
import type { KindeWebhookPayload } from './schemas';

export interface KindeTestKeys {
  /** The key set: `new KindeAuthProvider(config, keys.jwks)`, `kindeWebhookAuth({ issuerUrl, jwks: keys.jwks })`. */
  jwks: JWTVerifyGetKey;
  /** An access token for `issuerUrl`, valid for an hour unless `claims.exp` says otherwise. */
  accessToken(claims: JWTPayload & { sub: string }): Promise<string>;
  /** Any payload, signed: an ID token, or a webhook (`signedKindeWebhook` does that). */
  sign(claims: JWTPayload): Promise<string>;
}

/** A fresh RS256 key, as Kinde signs with, and tokens signed by it as `issuerUrl` would issue them. */
export async function kindeTestKeys(issuerUrl = 'https://example.kinde.com'): Promise<KindeTestKeys> {
  const { publicKey, privateKey } = await generateKeyPair('RS256', { extractable: true });
  const jwk = { ...(await exportJWK(publicKey)), kid: 'test', alg: 'RS256', use: 'sig' };
  const sign = (claims: JWTPayload) => new SignJWT(claims).setProtectedHeader({ alg: 'RS256', kid: 'test', typ: 'JWT' }).sign(privateKey);
  const now = () => Math.floor(Date.now() / 1000);
  return {
    jwks: createLocalJWKSet({ keys: [jwk] }),
    sign,
    accessToken: (claims) => sign({ iss: issuerUrl.replace(/\/+$/, ''), iat: now(), exp: now() + 3600, aud: [], scp: ['openid', 'profile', 'email', 'offline'], ...claims }),
  };
}

/** The body and headers Kinde would post for this event, signed with `keys`. */
export async function signedKindeWebhook(
  keys: Pick<KindeTestKeys, 'sign'>,
  event: Partial<KindeWebhookPayload> & { type: string },
): Promise<{ rawBody: string; headers: Record<string, string> }> {
  const now = new Date().toISOString();
  const payload = { event_id: `event_${randomUUID().replaceAll('-', '')}`, timestamp: now, event_timestamp: now, source: 'admin', data: {}, ...event };
  return { rawBody: await keys.sign(payload as JWTPayload), headers: { 'content-type': 'application/jwt', 'webhook-id': `webhook_request_${payload.event_id}` } };
}

export interface FakeKindeIdentity extends IdentityClient {
  users_: Map<string, IdentityUser>;
  /** Authorization codes `exchangeCode` accepts, to the user each signs in. */
  codes_: Map<string, string>;
  logoutUrl(redirect: string): string;
}

/** An in-memory Kinde `IdentityClient`: seed users and codes, then hand it to the code under test. */
export function fakeKindeIdentity(seed: { users?: IdentityUser[]; codes?: Record<string, string> } = {}): FakeKindeIdentity {
  const users_ = new Map((seed.users ?? []).map((u) => [u.id, u]));
  const codes_ = new Map(Object.entries(seed.codes ?? {}));
  const tokens = (): TokenSet => ({ accessToken: `at_${randomUUID()}`, refreshToken: `rt_${randomUUID()}`, expiresAt: Date.now() + 3_600_000 });
  const hosted = async (): Promise<never> => {
    throw new AuthError('auth/not-supported', "Kinde: this happens on Kinde's hosted pages");
  };
  return {
    provider: 'kinde',
    users_,
    codes_,
    authorizationUrl: (input) => `https://example.kinde.com/oauth2/auth?state=${encodeURIComponent(input.state)}`,
    logoutUrl: (redirect) => `https://example.kinde.com/logout?redirect=${encodeURIComponent(redirect)}`,
    async exchangeCode(input): Promise<SignInResult> {
      const user = users_.get(codes_.get(input.code) ?? '');
      if (!user) throw new AuthError('auth/invalid-grant', 'Kinde refused the grant');
      codes_.delete(input.code);
      return { status: 'signed-in', user, tokens: tokens() };
    },
    async refresh() {
      return tokens();
    },
    async signOut() {},
    async getUser(id) {
      return users_.get(id) ?? null;
    },
    async findUserByEmail(email) {
      return [...users_.values()].find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
    },
    async createUser(input: CreateIdentityUserInput) {
      const user: IdentityUser = { id: `kp_${randomUUID().replaceAll('-', '')}`, email: input.email, emailVerified: input.emailVerified, name: input.name ?? null, avatarUrl: null, externalId: input.externalId ?? null };
      users_.set(user.id, user);
      return user;
    },
    async deleteUser(id) {
      users_.delete(id);
    },
    signInWithPassword: hosted,
    sendPasswordReset: hosted,
    resetPassword: hosted,
    setPassword: hosted,
    startEmailCode: hosted,
    signInWithEmailCode: hosted,
    pendingVerificationCode: hosted,
    verifyEmailAndSignIn: hosted,
  };
}
