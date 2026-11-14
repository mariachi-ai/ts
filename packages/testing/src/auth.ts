import { randomUUID } from 'node:crypto';
import { AuthError, ConfigError } from '@mariachi/core';

/** The kinds of caller `@mariachi/auth` knows. */
export type TestIdentityType = 'session' | 'api-key' | 'service' | 'webhook';

/** Who a test request is made as. */
export interface TestIdentity {
  userId: string;
  tenantId: string;
  scopes?: string[];
  roles?: string[];
  /** Default `session`. */
  identityType?: TestIdentityType;
  /** What a verified token's claims would hold, for code that reads them (tenancy by claim, roles). */
  claims?: Record<string, unknown>;
}

/** What `verify` resolves to: the shape `@mariachi/api-facade`'s auth strategies take. */
export interface VerifiedTestIdentity {
  userId: string;
  tenantId: string;
  scopes: string[];
  identityType: TestIdentityType;
  roles?: string[];
  claims?: Record<string, unknown>;
}

export interface TestAuth<TClaims = Record<string, unknown>> {
  /** Pass this where the app takes its token verifier (`bearerStrategy(auth.verifier)`). */
  verifier: { verify(token: string): Promise<VerifiedTestIdentity> };
  /** A token that verifies as this identity until `revoke`. */
  tokenFor(identity: TestIdentity): string;
  /** `{ authorization: 'Bearer …' }` for this identity. */
  headersFor(identity: TestIdentity): { authorization: string };
  /**
   * A token carrying these claims, as the identity provider's own token would. It verifies as
   * whatever `fromClaims` makes of them, so a test exercises the app's real mapping from claims to
   * identity. Needs the `fromClaims` option.
   */
  tokenForClaims(claims: TClaims): string;
  /** `{ authorization: 'Bearer …' }` for a token carrying these claims. */
  headersForClaims(claims: TClaims): { authorization: string };
  /** The token stops verifying, as an expired or signed-out one would. */
  revoke(token: string): void;
}

export interface TestAuthOptions<TClaims> {
  /**
   * The app's own mapping from a verified token's claims to an identity (for a provider package,
   * its `toIdentity`). Run at verification, so it may read configuration loaded after this call.
   */
  fromClaims?: (claims: TClaims) => VerifiedTestIdentity | Promise<VerifiedTestIdentity>;
}

/**
 * Sign-in for tests, with no identity provider: tokens are random strings this object remembers.
 * An app built to take its verifier as an option runs its whole HTTP surface (authentication,
 * tenancy, scopes) against it. A token it didn't issue fails as `auth/invalid-token`.
 */
export function createTestAuth<TClaims = Record<string, unknown>>(options: TestAuthOptions<TClaims> = {}): TestAuth<TClaims> {
  const issued = new Map<string, VerifiedTestIdentity>();
  const claimed = new Map<string, TClaims>();
  const tokenForClaims = (claims: TClaims): string => {
    if (!options.fromClaims) throw new ConfigError('testing/no-claims-mapping', 'tokenForClaims needs createTestAuth({ fromClaims })');
    const token = `test-${randomUUID()}`;
    claimed.set(token, structuredClone(claims));
    return token;
  };
  const tokenFor = (identity: TestIdentity): string => {
    const token = `test-${randomUUID()}`;
    issued.set(token, {
      userId: identity.userId,
      tenantId: identity.tenantId,
      scopes: [...(identity.scopes ?? [])],
      identityType: identity.identityType ?? 'session',
      ...(identity.roles ? { roles: [...identity.roles] } : {}),
      ...(identity.claims ? { claims: { ...identity.claims } } : {}),
    });
    return token;
  };
  return {
    verifier: {
      async verify(token) {
        const claims = claimed.get(token);
        if (claims !== undefined && options.fromClaims) return options.fromClaims(structuredClone(claims));
        const identity = issued.get(token);
        if (!identity) throw new AuthError('auth/invalid-token', 'Invalid token');
        return { ...identity, scopes: [...identity.scopes] };
      },
    },
    tokenFor,
    headersFor: (identity) => ({ authorization: `Bearer ${tokenFor(identity)}` }),
    tokenForClaims,
    headersForClaims: (claims) => ({ authorization: `Bearer ${tokenForClaims(claims)}` }),
    revoke: (token) => {
      issued.delete(token);
      claimed.delete(token);
    },
  };
}
