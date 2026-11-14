import { randomUUID } from 'node:crypto';
import { AuthError } from '@mariachi/core';

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

export interface TestAuth {
  /** Pass this where the app takes its token verifier (`bearerStrategy(auth.verifier)`). */
  verifier: { verify(token: string): Promise<VerifiedTestIdentity> };
  /** A token that verifies as this identity until `revoke`. */
  tokenFor(identity: TestIdentity): string;
  /** `{ authorization: 'Bearer …' }` for this identity. */
  headersFor(identity: TestIdentity): { authorization: string };
  /** The token stops verifying, as an expired or signed-out one would. */
  revoke(token: string): void;
}

/**
 * Sign-in for tests, with no identity provider: tokens are random strings this object remembers.
 * An app built to take its verifier as an option runs its whole HTTP surface (authentication,
 * tenancy, scopes) against it. A token it didn't issue fails as `auth/invalid-token`.
 */
export function createTestAuth(): TestAuth {
  const issued = new Map<string, VerifiedTestIdentity>();
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
        const identity = issued.get(token);
        if (!identity) throw new AuthError('auth/invalid-token', 'Invalid token');
        return { ...identity, scopes: [...identity.scopes] };
      },
    },
    tokenFor,
    headersFor: (identity) => ({ authorization: `Bearer ${tokenFor(identity)}` }),
    revoke: (token) => void issued.delete(token),
  };
}
