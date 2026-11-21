/**
 * `@mariachi/auth-descope/testing`: Descope for an app's tests, without Descope. A key to sign session tokens
 * with (handed to `DescopeAuthProvider` in place of the project's), signed Audit Webhook deliveries, and an
 * in-memory `IdentityClient` with `DescopeIdentityClient`'s shape.
 */
import { createHmac, randomUUID } from 'node:crypto';
import { type JWTPayload, type JWTVerifyGetKey, SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';
import { AuthError } from '@mariachi/core';
import type { CreateIdentityUserInput, IdentityClient, IdentityUser, SignInResult, TokenSet } from '@mariachi/auth';
import { DESCOPE_SIGNATURE_HEADER } from './webhooks';
import type { DescopeAuditEvent } from './schemas';

export interface DescopeTestKeys {
  /** The key set: `new DescopeAuthProvider({ projectId }, keys.jwks)`. */
  jwks: JWTVerifyGetKey;
  /** A session token for the project (`drn: DS`), valid for ten minutes unless `claims.exp` says otherwise. */
  sessionToken(claims: JWTPayload & { sub: string }): Promise<string>;
  /** Any payload, signed. */
  sign(claims: JWTPayload): Promise<string>;
}

/** A fresh RS256 key, and session tokens signed by it as the project would issue them. */
export async function descopeTestKeys(projectId = 'P2TestProject', baseUrl = 'https://api.descope.com'): Promise<DescopeTestKeys> {
  const { publicKey, privateKey } = await generateKeyPair('RS256', { extractable: true });
  const jwk = { ...(await exportJWK(publicKey)), kid: 'test', alg: 'RS256', use: 'sig' };
  const sign = (claims: JWTPayload) => new SignJWT(claims).setProtectedHeader({ alg: 'RS256', kid: 'test', typ: 'JWT' }).sign(privateKey);
  const now = () => Math.floor(Date.now() / 1000);
  return {
    jwks: createLocalJWKSet({ keys: [jwk] }),
    sign,
    sessionToken: (claims) => sign({ iss: `${baseUrl.replace(/\/+$/, '')}/v1/apps/${projectId}`, drn: 'DS', amr: ['pwd'], iat: now(), exp: now() + 600, ...claims }),
  };
}

/** An audit event to post in a test webhook. */
export function descopeAuditEvent(overrides: Partial<DescopeAuditEvent> & { action: string }): DescopeAuditEvent {
  return { occurred: Date.now(), userId: `U${randomUUID().replaceAll('-', '').slice(0, 27)}`, actorId: 'self', projectId: 'P2TestProject', loginIds: [], data: {}, ...overrides };
}

/** The body and `x-descope-webhook-s256` header the Audit Webhook connector would send for these events. */
export function signedDescopeWebhook(events: DescopeAuditEvent[], secret: string): { rawBody: string; headers: Record<string, string> } {
  const rawBody = JSON.stringify(events);
  return { rawBody, headers: { 'content-type': 'application/json', [DESCOPE_SIGNATURE_HEADER]: createHmac('sha256', secret).update(rawBody).digest('base64') } };
}

export interface FakeDescopeIdentity extends IdentityClient {
  users_: Map<string, IdentityUser & { password?: string }>;
  /** The last code "emailed" to each address by `startEmailCode`. */
  codes_: Map<string, string>;
  /** The token in the reset link last "emailed" to each address by `sendPasswordReset`. */
  resets_: Map<string, string>;
}

/** An in-memory Descope `IdentityClient`: seed users, then hand it to the code under test. */
export function fakeDescopeIdentity(seed: { users?: Array<IdentityUser & { password?: string }> } = {}): FakeDescopeIdentity {
  const users_ = new Map((seed.users ?? []).map((u) => [u.id, u]));
  const codes_ = new Map<string, string>();
  const resets_ = new Map<string, string>();
  const tokens = (): TokenSet => ({ accessToken: `sess_${randomUUID()}`, refreshToken: `ref_${randomUUID()}`, expiresAt: Date.now() + 600_000 });
  const byEmail = (email: string) => [...users_.values()].find((u) => u.email.toLowerCase() === email.toLowerCase());
  const plain = ({ password: _password, ...user }: IdentityUser & { password?: string }): IdentityUser => user;
  const flows = (): never => {
    throw new AuthError('auth/not-supported', 'Descope: run this in a Descope Flow');
  };
  return {
    provider: 'descope',
    users_,
    codes_,
    resets_,
    async signInWithPassword(input): Promise<SignInResult> {
      const user = byEmail(input.email);
      if (!user?.password || user.password !== input.password) throw new AuthError('auth/invalid-credentials', 'Descope refused the sign-in');
      return { status: 'signed-in', user: plain(user), tokens: tokens() };
    },
    authorizationUrl: flows,
    exchangeCode: async () => flows(),
    async refresh() {
      return tokens();
    },
    async signOut() {},
    async getUser(id) {
      const user = users_.get(id);
      return user ? plain(user) : null;
    },
    async findUserByEmail(email) {
      const user = byEmail(email);
      return user ? plain(user) : null;
    },
    async createUser(input: CreateIdentityUserInput) {
      const user = { id: `U${randomUUID().replaceAll('-', '').slice(0, 27)}`, email: input.email, emailVerified: input.emailVerified, name: input.name ?? null, avatarUrl: null, externalId: null, password: input.password };
      users_.set(user.id, user);
      return plain(user);
    },
    async deleteUser(id) {
      users_.delete(id);
    },
    async sendPasswordReset(email) {
      if (!byEmail(email)) return { deliveredBy: 'nobody' };
      resets_.set(email.toLowerCase(), `reset_${randomUUID()}`);
      return { deliveredBy: 'provider' };
    },
    async resetPassword(input) {
      const email = [...resets_].find(([, token]) => token === input.token)?.[0];
      const user = email ? byEmail(email) : undefined;
      if (!email || !user) throw new AuthError('auth/invalid-grant', 'Descope refused the link');
      resets_.delete(email);
      user.password = input.password;
      return plain(user);
    },
    async setPassword(userId, password) {
      const user = users_.get(userId);
      if (user) user.password = password;
    },
    async startEmailCode(email) {
      codes_.set(email.toLowerCase(), String(Math.floor(100_000 + Math.random() * 900_000)));
      return { deliveredBy: 'provider' };
    },
    async signInWithEmailCode(input): Promise<SignInResult> {
      if (codes_.get(input.email.toLowerCase()) !== input.code) throw new AuthError('auth/invalid-grant', 'Descope refused the sign-in');
      codes_.delete(input.email.toLowerCase());
      let user = byEmail(input.email);
      if (!user) {
        user = { id: `U${randomUUID().replaceAll('-', '').slice(0, 27)}`, email: input.email, emailVerified: true, name: null, avatarUrl: null, externalId: null };
        users_.set(user.id, user);
      }
      user.emailVerified = true;
      return { status: 'signed-in', user: plain(user), tokens: tokens() };
    },
    pendingVerificationCode: async () => flows(),
    verifyEmailAndSignIn: async () => flows(),
  };
}
