import { AuthError, isReservedTenantId, markPersonalTenant, personalTenantId } from '@mariachi/core';
import type { ResolvedIdentity } from './types';

export interface PersonalTenantOptions {
  /**
   * Names where this verifier's user ids come from: one identity provider, one issuer (`workos`,
   * `main`, ...). It's part of every personal tenant id (`user.<namespace>.<userId>`), because a
   * user id is only unique within its issuer. Give two verifiers the same namespace only if they
   * share one user directory. Choose it once: changing it moves every user to a new, empty tenant.
   */
  namespace: string;
}

/**
 * Wraps a token verifier (a provider, `JWTAdapter`, `SessionManager`) so that a verified person who
 * belongs to no organization gets a personal tenant in place of none. Without it, such a user is
 * refused wherever a tenant is required (`tenancy/missing-tenant`). This is the one place a
 * personal tenant is given, and only from what the verifier returned:
 *
 * - only to a person (`identityType: 'session'`): an API key or a service with no tenant keeps none;
 * - only when the verified identity has no tenant: an organization's tenant passes through unchanged;
 * - never from a claim: an identity whose tenant already starts with the reserved `user.` prefix
 *   is refused, since it would put the bearer inside someone's personal tenant.
 *
 * The identity it returns carries a mark (a symbol, which no token payload can hold) that the API
 * facade, the auth middleware and realtime look for before they accept a `user.` tenant.
 */
export function withPersonalTenants<T extends { verify(token: string): Promise<ResolvedIdentity> }>(verifier: T, options: PersonalTenantOptions): T {
  // Fail at wiring time on a bad namespace, not on the first sign-in.
  personalTenantId(options.namespace, 'check');
  const verify = async (token: string): Promise<ResolvedIdentity> => {
    const identity = await verifier.verify(token);
    if (isReservedTenantId(identity.tenantId)) {
      throw new AuthError('auth/invalid-token', 'Token names a tenant in the reserved personal-tenant namespace');
    }
    if (identity.tenantId || identity.identityType !== 'session') return identity;
    if (!identity.userId) throw new AuthError('auth/invalid-token', 'Token has no subject to give a personal tenant to');
    return markPersonalTenant({ ...identity, tenantId: personalTenantId(options.namespace, identity.userId) });
  };
  // Everything else on the verifier (createWebhookHandler, sign, revoke, ...) stays reachable.
  return Object.create(verifier, { verify: { value: verify, enumerable: true } }) as T;
}
