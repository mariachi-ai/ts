/**
 * `@mariachi/auth-entra/testing`: Entra for an app's tests. A tenant with its own signing key, so the app's routes
 * can be called with real access tokens and `EntraAuthProvider` checks them without the network; an in-memory
 * `IdentityClient`; and Graph change notifications to post to the app's endpoint.
 */
import { randomUUID } from 'node:crypto';
import { type JWK, SignJWT, exportJWK, generateKeyPair } from 'jose';
import { AuthError } from '@mariachi/core';
import type { IdentityClient, IdentityUser } from '@mariachi/auth';
import { type EntraAuthConfig, EntraAuthProvider } from './provider';

export interface EntraTestTenant {
  tenantId: string;
  clientId: string;
  issuer: string;
  /** Answers the tenant's OpenID configuration and keys, as many times as asked. Give it to the provider's `deps.fetch`. */
  fetch: typeof fetch;
  /** A v2.0 access token for the app's API, signed by the tenant: `oid`, `tid`, `scp` and an hour's life by default. */
  token(claims?: Record<string, unknown>, options?: { expiresIn?: string; kid?: string }): Promise<string>;
  /** An `EntraAuthProvider` that trusts this tenant. */
  provider(config?: Partial<EntraAuthConfig>): EntraAuthProvider;
}

/** A workforce tenant of your own for tests. */
export async function entraTestTenant(options: { tenantId?: string; clientId?: string } = {}): Promise<EntraTestTenant> {
  const tenantId = options.tenantId ?? randomUUID();
  const clientId = options.clientId ?? randomUUID();
  const issuer = `https://login.microsoftonline.com/${tenantId}/v2.0`;
  const { privateKey, publicKey } = await generateKeyPair('RS256', { extractable: true });
  const kid = 'test-key';
  const jwk: JWK = { ...(await exportJWK(publicKey)), kid, use: 'sig', issuer } as JWK;
  const jwksUri = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;
  const fake = (async (input: string | URL | Request) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.endsWith('/v2.0/.well-known/openid-configuration')) return Response.json({ issuer, jwks_uri: jwksUri });
    if (url === jwksUri) return Response.json({ keys: [jwk] });
    return new Response(null, { status: 404 });
  }) as typeof fetch;
  return {
    tenantId,
    clientId,
    issuer,
    fetch: fake,
    async token(claims = {}, opts = {}) {
      return new SignJWT({ ver: '2.0', tid: tenantId, oid: randomUUID(), scp: 'access_as_user', azp: randomUUID(), ...claims })
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: opts.kid ?? kid })
        .setIssuer(issuer)
        .setAudience(clientId)
        .setIssuedAt()
        .setExpirationTime(opts.expiresIn ?? '1h')
        .sign(privateKey);
    },
    provider(config = {}) {
      return new EntraAuthProvider({ tenantId, clientId, ...config }, { fetch: fake });
    },
  };
}

export interface FakeEntraIdentity extends IdentityClient {
  users_: Map<string, IdentityUser>;
}

/**
 * An in-memory `EntraIdentityClient` for an app's tests: users can be got, found, created and deleted, and the
 * calls Entra doesn't offer fail with `auth/not-supported`, as the real client's do.
 */
export function fakeEntraIdentity(seed: IdentityUser[] = []): FakeEntraIdentity {
  const users_ = new Map(seed.map((u) => [u.id, u]));
  const unsupported = async (): Promise<never> => {
    throw new AuthError('auth/not-supported', "Entra doesn't offer this through its API");
  };
  return {
    provider: 'entra',
    users_,
    authorizationUrl: (input) => `https://login.microsoftonline.com/test/oauth2/v2.0/authorize?state=${encodeURIComponent(input.state)}`,
    async exchangeCode() {
      const user = users_.values().next().value;
      if (!user) throw new AuthError('auth/invalid-grant', 'No user to sign in');
      return { status: 'signed-in', user, tokens: { accessToken: 'test-access', refreshToken: 'test-refresh' } };
    },
    async refresh(refreshToken) {
      return { accessToken: 'test-access', refreshToken };
    },
    async signOut() {},
    async getUser(id) {
      return users_.get(id) ?? null;
    },
    async findUserByEmail(email) {
      return [...users_.values()].find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
    },
    async createUser(input) {
      if (!input.password) throw new AuthError('auth/invalid-grant', 'Entra needs a password for a new user');
      const user: IdentityUser = { id: randomUUID(), email: input.email, emailVerified: false, name: input.name ?? input.email, avatarUrl: null, externalId: null };
      users_.set(user.id, user);
      return user;
    },
    async deleteUser(id) {
      users_.delete(id);
    },
    signInWithPassword: unsupported,
    sendPasswordReset: unsupported,
    resetPassword: unsupported,
    setPassword: unsupported,
    startEmailCode: unsupported,
    signInWithEmailCode: unsupported,
    pendingVerificationCode: unsupported,
    verifyEmailAndSignIn: unsupported,
  };
}

/**
 * The body Microsoft Graph posts for these user changes, with this clientState: post it to the app's endpoint with
 * `content-type: application/json`.
 */
export function entraUserNotification(changes: Array<{ userId: string; changeType: 'updated' | 'deleted' }>, clientState: string, options: { tenantId?: string; subscriptionId?: string } = {}): { rawBody: string; headers: Record<string, string> } {
  const tenantId = options.tenantId ?? randomUUID();
  const subscriptionId = options.subscriptionId ?? randomUUID();
  const value = changes.map((c) => ({
    id: randomUUID(),
    subscriptionId,
    subscriptionExpirationDateTime: new Date(Date.now() + 86_400_000).toISOString(),
    clientState,
    changeType: c.changeType,
    resource: `Users/${c.userId}`,
    tenantId,
    resourceData: { '@odata.type': '#Microsoft.Graph.User', '@odata.id': `Users/${c.userId}`, id: c.userId },
  }));
  return { rawBody: JSON.stringify({ value }), headers: { 'content-type': 'application/json' } };
}
