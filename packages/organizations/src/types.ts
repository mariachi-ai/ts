import type { Context, PaginatedResult, PaginationParams } from '@mariachi/core';

/** Highest first. A role can do everything the roles after it can. */
export const ORGANIZATION_ROLES = ['owner', 'admin', 'member'] as const;
export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export type OrganizationStatus = 'active' | 'suspended' | 'deleted';

/** An organization: a row of the `tenants` table. Its `id` is the tenant id. */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  organizationId: string;
  /** The user's id in the identity provider (the token's subject). */
  userId: string;
  role: OrganizationRole;
  status: 'active' | 'removed';
  /** Copies taken when the user joined, for listing. The identity provider stays the source of truth. */
  email: string | null;
  name: string | null;
  invitedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationRole;
  invitedBy: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  acceptedBy: string | null;
  revokedAt: Date | null;
  createdAt: Date;
}

/** An invitation as the store holds it: with the hash of its secret, which never leaves the service. */
export interface StoredInvitation extends Invitation {
  tokenHash: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

/**
 * Where organizations, memberships and invitations are kept. Two implementations ship: Postgres
 * (`@mariachi/organizations/postgres`) and memory, and both pass the same contract suite.
 *
 * The store does no authorization: `Organizations` decides who may do what, and calls this.
 */
export interface OrganizationStore {
  /**
   * Runs `fn` as one unit: its writes are all kept or all undone. With `lock`, no other transaction
   * that names the same organization runs at the same time, which is what makes "the last owner"
   * checkable. Store calls made inside `fn` take part without being told.
   */
  transaction<T>(ctx: Context, fn: () => Promise<T>, options?: { lock?: string }): Promise<T>;

  /** Throws `organizations/slug-taken` when another tenant has the slug. */
  createOrganization(ctx: Context, input: { name: string; slug: string }): Promise<Organization>;
  getOrganization(ctx: Context, organizationId: string): Promise<Organization | null>;
  /** Throws `organizations/slug-taken` when another tenant has the slug. */
  updateOrganization(ctx: Context, organizationId: string, patch: { name?: string; slug?: string; status?: OrganizationStatus }): Promise<Organization | null>;
  /** The user's active memberships with their organizations, deleted organizations left out, oldest first. */
  listForUser(ctx: Context, userId: string): Promise<Array<{ organization: Organization; membership: Membership }>>;

  getMembership(ctx: Context, organizationId: string, userId: string): Promise<Membership | null>;
  /** An active member with this address (lowercased), if there is one. */
  findMemberByEmail(ctx: Context, organizationId: string, email: string): Promise<Membership | null>;
  /** Creates the membership, or brings a removed one back with the given role and details. */
  putMembership(ctx: Context, membership: Pick<Membership, 'organizationId' | 'userId' | 'role' | 'email' | 'name' | 'invitedBy'>): Promise<Membership>;
  updateMembership(ctx: Context, organizationId: string, userId: string, patch: { role?: OrganizationRole; status?: Membership['status'] }): Promise<Membership | null>;
  /** Active members, owners first, then by when they joined. */
  listMembers(ctx: Context, organizationId: string, pagination: PaginationParams): Promise<PaginatedResult<Membership>>;
  countOwners(ctx: Context, organizationId: string): Promise<number>;

  createInvitation(ctx: Context, invitation: Pick<StoredInvitation, 'organizationId' | 'email' | 'role' | 'tokenHash' | 'invitedBy' | 'expiresAt'>): Promise<StoredInvitation>;
  getInvitation(ctx: Context, invitationId: string): Promise<StoredInvitation | null>;
  /** The invitation for this address that is neither accepted nor revoked, expired or not. */
  findOpenInvitation(ctx: Context, organizationId: string, email: string): Promise<StoredInvitation | null>;
  updateInvitation(
    ctx: Context,
    invitationId: string,
    patch: { tokenHash?: string; expiresAt?: Date; acceptedAt?: Date; acceptedBy?: string; revokedAt?: Date; role?: OrganizationRole; invitedBy?: string },
  ): Promise<StoredInvitation | null>;
  /** Neither accepted nor revoked, newest first. Expired ones are included: they can be resent. */
  listOpenInvitations(ctx: Context, organizationId: string): Promise<StoredInvitation[]>;
}

/** What `Organizations` tells an audit log; `@mariachi/audit`'s logger fits. */
export interface OrganizationAudit {
  log(
    ctx: Context,
    entry: { actor: string; action: string; resource: string; resourceId: string; tenantId?: string | null; metadata?: Record<string, unknown> },
  ): Promise<void>;
}

/** A change other parts of the app may care about, for one, to drop a cached membership. */
export interface OrganizationChange {
  type: 'organization.created' | 'organization.updated' | 'organization.deleted' | 'member.added' | 'member.role-changed' | 'member.removed';
  organizationId: string;
  /** The member the change is about, when it is about one. */
  userId?: string;
}

export interface OrganizationsConfig {
  store: OrganizationStore;
  /** Membership and role changes are written here. A change whose entry can't be written is undone. */
  audit?: OrganizationAudit;
  /** How long an invitation can be accepted. Default seven days. */
  invitationTtlMs?: number;
  /**
   * What accepting an invitation requires of the signed-in user's email address:
   * - `verified` (default): it is the invited address, and the identity provider says it is verified;
   * - `match`: it is the invited address, verified or not. For a provider that doesn't say;
   * - `none`: nothing. Anyone holding the link can join.
   */
  emailCheck?: 'verified' | 'match' | 'none';
  /** Slugs no organization may take, such as the names your routes or subdomains use. */
  reservedSlugs?: string[];
  /** The clock, for tests. */
  now?: () => Date;
}
