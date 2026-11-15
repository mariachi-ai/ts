import { ConfigError } from './errors';

/**
 * Personal tenants: the tenant of a person who belongs to no organization. An app for individuals,
 * or one where signing up doesn't start with an organization, still gets one tenant per user, so
 * tenant-scoped tables, billing and roles work unchanged.
 *
 * A personal tenant id is `user.<namespace>.<userId>`. The namespace names where the user id comes
 * from (one identity provider, one issuer), because a user id is only unique within its issuer.
 * The user id is percent-encoded, so the id holds no colon or slash whatever the provider's ids
 * look like: tenant ids end up inside colon-separated keys and channel names, and paths.
 *
 * Every id starting with `user.` is reserved: a token may never name one as its tenant.
 */
export const PERSONAL_TENANT_PREFIX = 'user.';

const NAMESPACE = /^[a-z0-9][a-z0-9-]{0,31}$/;

/**
 * Carried by an identity that `withPersonalTenants` gave a personal tenant, with that tenant id as
 * its value. A symbol, so it can't arrive in a token's payload or any other JSON, and registered,
 * so the ESM and CommonJS builds of this package agree on it.
 */
const PERSONAL_TENANT_MARK = Symbol.for('@mariachi/core.personal-tenant');

/** The personal tenant of a user: `user.<namespace>.<userId>`, the user id percent-encoded. */
export function personalTenantId(namespace: string, userId: string): string {
  if (!NAMESPACE.test(namespace)) {
    throw new ConfigError('tenancy/invalid-namespace', 'A personal-tenant namespace is 1 to 32 characters: lowercase letters, digits and hyphens, not starting with a hyphen');
  }
  if (!userId) throw new ConfigError('tenancy/invalid-user', 'A personal tenant needs a user id');
  return `${PERSONAL_TENANT_PREFIX}${namespace}.${encodeURIComponent(userId)}`;
}

/** The namespace and user of a personal tenant id; undefined for anything else. */
export function parsePersonalTenant(tenantId: string | null | undefined): { namespace: string; userId: string } | undefined {
  if (typeof tenantId !== 'string' || !tenantId.startsWith(PERSONAL_TENANT_PREFIX)) return undefined;
  const rest = tenantId.slice(PERSONAL_TENANT_PREFIX.length);
  const separator = rest.indexOf('.');
  if (separator === -1) return undefined;
  const namespace = rest.slice(0, separator);
  const encoded = rest.slice(separator + 1);
  if (!NAMESPACE.test(namespace) || !encoded) return undefined;
  try {
    const userId = decodeURIComponent(encoded);
    // Only the canonical spelling is a personal tenant: one user must not have two ids.
    return userId && encodeURIComponent(userId) === encoded ? { namespace, userId } : undefined;
  } catch {
    return undefined;
  }
}

/** Whether a tenant id is a user's personal tenant. */
export function isPersonalTenant(tenantId: string | null | undefined): boolean {
  return parsePersonalTenant(tenantId) !== undefined;
}

/** Whether a tenant id is in the reserved `user.` namespace, well-formed or not. */
export function isReservedTenantId(tenantId: string | null | undefined): boolean {
  return typeof tenantId === 'string' && tenantId.startsWith(PERSONAL_TENANT_PREFIX);
}

/**
 * A copy of the identity with the mark that says its tenant is a personal one this framework gave
 * it. For `withPersonalTenants` only: marking an identity whose tenant came from anywhere else
 * defeats the check below.
 */
export function markPersonalTenant<T extends { tenantId: string }>(identity: T): T {
  return { ...identity, [PERSONAL_TENANT_MARK]: identity.tenantId };
}

/**
 * Whether an identity carries a reserved tenant id it wasn't given by `withPersonalTenants`. Such
 * a tenant came from a token's own claim, and accepting it would put the bearer inside someone's
 * personal tenant. The mark holds the tenant id it was made for, so it doesn't survive a change
 * of tenant, and a plain property named anything at all can't stand in for it.
 */
export function claimsReservedTenant(identity: { tenantId?: string | null }): boolean {
  if (!isReservedTenantId(identity.tenantId)) return false;
  return (identity as Record<symbol, unknown>)[PERSONAL_TENANT_MARK] !== identity.tenantId;
}
