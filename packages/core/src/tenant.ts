import { ConfigError } from './errors';

/**
 * Personal tenants: the tenant of a person who belongs to no organization. An app for individuals,
 * or one where signing up doesn't start with an organization, still gets one tenant per user, so
 * tenant-scoped tables, billing and roles work unchanged.
 *
 * A personal tenant id is `user:<namespace>:<userId>`. The namespace names where the user id comes
 * from (one identity provider, one issuer), because a user id is only unique within its issuer.
 * Every id starting with `user:` is reserved: a token may never name one as its tenant.
 */
export const PERSONAL_TENANT_PREFIX = 'user:';

const NAMESPACE = /^[a-z0-9][a-z0-9-]{0,31}$/;

/** The personal tenant of a user: `user:<namespace>:<userId>`. */
export function personalTenantId(namespace: string, userId: string): string {
  if (!NAMESPACE.test(namespace)) {
    throw new ConfigError('tenancy/invalid-namespace', 'A personal-tenant namespace is 1 to 32 characters: lowercase letters, digits and hyphens, not starting with a hyphen');
  }
  if (!userId) throw new ConfigError('tenancy/invalid-user', 'A personal tenant needs a user id');
  return `${PERSONAL_TENANT_PREFIX}${namespace}:${userId}`;
}

/** The namespace and user of a personal tenant id; undefined for anything else. */
export function parsePersonalTenant(tenantId: string | null | undefined): { namespace: string; userId: string } | undefined {
  if (typeof tenantId !== 'string' || !tenantId.startsWith(PERSONAL_TENANT_PREFIX)) return undefined;
  const rest = tenantId.slice(PERSONAL_TENANT_PREFIX.length);
  const separator = rest.indexOf(':');
  if (separator === -1) return undefined;
  const namespace = rest.slice(0, separator);
  const userId = rest.slice(separator + 1);
  return NAMESPACE.test(namespace) && userId ? { namespace, userId } : undefined;
}

/** Whether a tenant id is a user's personal tenant. */
export function isPersonalTenant(tenantId: string | null | undefined): boolean {
  return parsePersonalTenant(tenantId) !== undefined;
}

/** Whether a tenant id is in the reserved `user:` namespace, well-formed or not. */
export function isReservedTenantId(tenantId: string | null | undefined): boolean {
  return typeof tenantId === 'string' && tenantId.startsWith(PERSONAL_TENANT_PREFIX);
}

/**
 * Whether an identity carries a reserved tenant id it wasn't given by `withPersonalTenants` (which
 * sets `personalTenant`). Such a tenant came from a token's own claim, and accepting it would put
 * the bearer inside someone's personal tenant.
 */
export function claimsReservedTenant(identity: { tenantId?: string | null; personalTenant?: boolean }): boolean {
  return isReservedTenantId(identity.tenantId) && identity.personalTenant !== true;
}
