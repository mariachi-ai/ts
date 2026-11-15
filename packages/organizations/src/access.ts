import { OrganizationsError, TenancyError, claimsReservedTenant, createContext, isPersonalTenant, isReservedTenantId } from '@mariachi/core';
import type { Organizations } from './organizations';
import { isUuid } from './tokens';
import { ORGANIZATION_ROLES, type OrganizationRole, type OrganizationStatus } from './types';

/** A verified identity, as the API layer and realtime hold it. */
export interface AccessIdentity {
  userId: string;
  tenantId: string;
  scopes: string[];
  identityType: string;
  roles?: string[];
  claims?: Record<string, unknown>;
}

export interface OrganizationAccessConfig {
  organizations: Organizations;
  /**
   * Where memberships are kept, which is one place per app:
   * - `'module'` (default): in this module's tables. A request names an organization, and it becomes
   *   the tenant only after the membership is found here.
   * - `'token'`: the identity provider keeps them and puts the organization in the token. The token's
   *   organization is the tenant, and this module's tables are never read.
   */
  source?: 'module' | 'token';
  /**
   * How long a membership that was looked up is trusted, in milliseconds. Default 5000; 0 looks it up
   * on every request. A change made in this process clears it at once. Another process sees a
   * removal within this long.
   */
  cacheTtlMs?: number;
  /** The clock, for tests. */
  now?: () => number;
}

interface Cached {
  until: number;
  found: { role: OrganizationRole; status: OrganizationStatus } | null;
}

/** The one refusal for an organization that doesn't exist and one the caller isn't in. */
const notFound = (): OrganizationsError => new OrganizationsError('organizations/not-found', 'Organization not found');

/**
 * Decides which tenant a signed-in person's request runs in. A client names the organization it
 * wants; nothing here takes its word for it. With memberships in this module, the organization
 * becomes the tenant only once the membership is found, and the member's role joins the identity's
 * roles. A request that names none keeps the identity's own tenant (a personal one, or none):
 * this never picks one of a user's organizations for them.
 *
 * Only people are resolved (`identityType: 'session'`). An API key or a service keeps the tenant its
 * credential was issued for.
 */
export class OrganizationAccess {
  private readonly organizations: Organizations;
  private readonly source: 'module' | 'token';
  private readonly ttl: number;
  private readonly now: () => number;
  private readonly cache = new Map<string, Cached>();
  private readonly stop: () => void;

  constructor(config: OrganizationAccessConfig) {
    this.organizations = config.organizations;
    this.source = config.source ?? 'module';
    this.ttl = config.cacheTtlMs ?? 5000;
    this.now = config.now ?? Date.now;
    // A removal, a role change, a suspension: what was looked up for that organization is no longer true
    this.stop = this.organizations.onChange((change) => this.forget(change.organizationId));
  }

  /** Stops listening for changes. Call when the app shuts down. */
  dispose(): void {
    this.stop();
    this.cache.clear();
  }

  /** Forgets what was looked up, for one organization or for all. */
  forget(organizationId?: string): void {
    if (organizationId === undefined) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) if (key.endsWith(`\n${organizationId}`)) this.cache.delete(key);
  }

  private async lookup(identity: AccessIdentity, organizationId: string): Promise<Cached['found']> {
    const key = `${identity.userId}\n${organizationId}`;
    const now = this.now();
    const cached = this.cache.get(key);
    if (cached && cached.until > now) return cached.found;
    const ctx = createContext({ userId: identity.userId, identityType: identity.identityType, logger: this.organizations.logger });
    const access = await this.organizations.access(ctx, organizationId);
    const found = access ? { role: access.membership.role, status: access.organization.status } : null;
    if (this.ttl > 0) {
      // Bounded: one entry per person and organization seen in the last few seconds
      if (this.cache.size >= 10_000) this.cache.clear();
      this.cache.set(key, { until: now + this.ttl, found });
    }
    return found;
  }

  /**
   * The identity the request runs as. `requested` is the organization the client named (the
   * `x-organization-id` header, a subdomain, a path segment), or undefined when it named none.
   *
   * Throws `organizations/not-found` for an organization that doesn't exist or that the caller isn't
   * in (the same answer for both), `tenancy/suspended` for a suspended one, and `tenancy/mismatch`
   * when the request and the token name different organizations.
   */
  async resolve<I extends AccessIdentity>(identity: I, requested?: string | null): Promise<I> {
    if (identity.identityType !== 'session') return identity;
    const named = typeof requested === 'string' && requested.trim() ? requested.trim() : undefined;
    // The identity's own tenant, when it is an organization the token named (not a personal tenant, not none)
    const fromToken = identity.tenantId && !isReservedTenantId(identity.tenantId) ? identity.tenantId : undefined;
    if (named && fromToken && named !== fromToken) {
      // Refused, not ignored: a silent ignore would hide a client writing into the wrong tenant
      throw new TenancyError('tenancy/mismatch', 'The request names a different organization from the one in the token');
    }

    if (this.source === 'token') return identity;

    const organizationId = named ?? fromToken;
    if (!organizationId) {
      // No organization named: the personal tenant, where the one person is the owner, or no tenant at all
      if (isPersonalTenant(identity.tenantId) && !claimsReservedTenant(identity)) return { ...identity, roles: withRole(identity.roles, 'owner') };
      return identity;
    }
    // A personal tenant's id, or anything else that isn't an organization's id, is not an organization
    if (!isUuid(organizationId)) throw notFound();
    const found = await this.lookup(identity, organizationId);
    if (!found) throw notFound();
    if (found.status !== 'active') throw new TenancyError('tenancy/suspended', 'This organization is suspended');
    return { ...identity, tenantId: organizationId, roles: withRole(identity.roles, found.role) };
  }
}

/**
 * The identity's roles with the member's organization role, and no other organization role: an
 * `admin` or `owner` that came in with the token says nothing about this organization, and must not
 * pass a check that the membership wouldn't.
 */
function withRole(roles: string[] | undefined, role: OrganizationRole): string[] {
  return [...(roles ?? []).filter((existing) => !(ORGANIZATION_ROLES as readonly string[]).includes(existing)), role];
}

export function createOrganizationAccess(config: OrganizationAccessConfig): OrganizationAccess {
  return new OrganizationAccess(config);
}
