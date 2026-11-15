import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type { Context, PaginatedResult, PaginationParams } from '@mariachi/core';
import { OrganizationsError } from '@mariachi/core';
import { ORGANIZATION_ROLES, type Membership, type Organization, type OrganizationStore, type StoredInvitation } from './types';

interface State {
  organizations: Map<string, Organization>;
  memberships: Map<string, Membership>;
  invitations: Map<string, StoredInvitation>;
}

const key = (organizationId: string, userId: string): string => `${organizationId}\u0000${userId}`;
const copy = <T>(value: T): T => structuredClone(value);

/**
 * `OrganizationStore` in memory, for tests and for trying the module without a database. It passes
 * the same contract suite as the Postgres store, transactions included: a failed one leaves nothing
 * behind, and they run one at a time.
 */
export class MemoryOrganizationStore implements OrganizationStore {
  private state: State = { organizations: new Map(), memberships: new Map(), invitations: new Map() };
  private queue: Promise<unknown> = Promise.resolve();
  private readonly inside = new AsyncLocalStorage<true>();
  /** Ticks once per write, so rows made in the same millisecond still have an order. */
  private clock = 0;

  private stamp(): Date {
    this.clock += 1;
    return new Date(Date.now() + this.clock);
  }

  async transaction<T>(_ctx: Context, fn: () => Promise<T>): Promise<T> {
    if (this.inside.getStore()) return fn();
    const run = async (): Promise<T> => {
      const before = copy(this.state);
      try {
        return await this.inside.run(true, fn);
      } catch (error) {
        this.state = before;
        throw error;
      }
    };
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => undefined);
    return result;
  }

  private assertSlugFree(slug: string, except?: string): void {
    for (const organization of this.state.organizations.values()) {
      if (organization.slug === slug && organization.id !== except) throw new OrganizationsError('organizations/slug-taken', `The slug "${slug}" is taken`, { slug });
    }
  }

  async createOrganization(_ctx: Context, input: { name: string; slug: string }): Promise<Organization> {
    this.assertSlugFree(input.slug);
    const now = this.stamp();
    const organization: Organization = { id: randomUUID(), name: input.name, slug: input.slug, status: 'active', createdAt: now, updatedAt: now };
    this.state.organizations.set(organization.id, organization);
    return copy(organization);
  }

  async getOrganization(_ctx: Context, organizationId: string): Promise<Organization | null> {
    const organization = this.state.organizations.get(organizationId);
    return organization ? copy(organization) : null;
  }

  async updateOrganization(_ctx: Context, organizationId: string, patch: { name?: string; slug?: string; status?: Organization['status'] }): Promise<Organization | null> {
    const organization = this.state.organizations.get(organizationId);
    if (!organization) return null;
    if (patch.slug !== undefined) this.assertSlugFree(patch.slug, organizationId);
    Object.assign(organization, Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)), { updatedAt: this.stamp() });
    return copy(organization);
  }

  async listForUser(_ctx: Context, userId: string): Promise<Array<{ organization: Organization; membership: Membership }>> {
    const mine: Array<{ organization: Organization; membership: Membership }> = [];
    for (const membership of this.state.memberships.values()) {
      if (membership.userId !== userId || membership.status !== 'active') continue;
      const organization = this.state.organizations.get(membership.organizationId);
      if (organization && organization.status !== 'deleted') mine.push({ organization: copy(organization), membership: copy(membership) });
    }
    return mine.sort((a, b) => a.membership.createdAt.getTime() - b.membership.createdAt.getTime());
  }

  async getMembership(_ctx: Context, organizationId: string, userId: string): Promise<Membership | null> {
    const membership = this.state.memberships.get(key(organizationId, userId));
    return membership ? copy(membership) : null;
  }

  async findMemberByEmail(_ctx: Context, organizationId: string, email: string): Promise<Membership | null> {
    for (const membership of this.state.memberships.values()) {
      if (membership.organizationId === organizationId && membership.status === 'active' && membership.email === email) return copy(membership);
    }
    return null;
  }

  async putMembership(_ctx: Context, input: Pick<Membership, 'organizationId' | 'userId' | 'role' | 'email' | 'name' | 'invitedBy'>): Promise<Membership> {
    const now = this.stamp();
    const existing = this.state.memberships.get(key(input.organizationId, input.userId));
    const membership: Membership = { ...input, status: 'active', createdAt: existing?.status === 'active' ? existing.createdAt : now, updatedAt: now };
    this.state.memberships.set(key(input.organizationId, input.userId), membership);
    return copy(membership);
  }

  async updateMembership(_ctx: Context, organizationId: string, userId: string, patch: { role?: Membership['role']; status?: Membership['status'] }): Promise<Membership | null> {
    const membership = this.state.memberships.get(key(organizationId, userId));
    if (!membership) return null;
    if (patch.role !== undefined) membership.role = patch.role;
    if (patch.status !== undefined) membership.status = patch.status;
    membership.updatedAt = this.stamp();
    return copy(membership);
  }

  async listMembers(_ctx: Context, organizationId: string, pagination: PaginationParams): Promise<PaginatedResult<Membership>> {
    const members = [...this.state.memberships.values()]
      .filter((membership) => membership.organizationId === organizationId && membership.status === 'active')
      .sort((a, b) => ORGANIZATION_ROLES.indexOf(a.role) - ORGANIZATION_ROLES.indexOf(b.role) || a.createdAt.getTime() - b.createdAt.getTime() || a.userId.localeCompare(b.userId));
    const start = (pagination.page - 1) * pagination.pageSize;
    return {
      data: members.slice(start, start + pagination.pageSize).map(copy),
      total: members.length,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(members.length / pagination.pageSize),
    };
  }

  async countOwners(_ctx: Context, organizationId: string): Promise<number> {
    let owners = 0;
    for (const membership of this.state.memberships.values()) {
      if (membership.organizationId === organizationId && membership.status === 'active' && membership.role === 'owner') owners += 1;
    }
    return owners;
  }

  async createInvitation(_ctx: Context, input: Pick<StoredInvitation, 'organizationId' | 'email' | 'role' | 'tokenHash' | 'invitedBy' | 'expiresAt'>): Promise<StoredInvitation> {
    for (const other of this.state.invitations.values()) {
      if (other.organizationId === input.organizationId && other.email === input.email && !other.acceptedAt && !other.revokedAt) {
        throw new OrganizationsError('organizations/invitation-exists', 'That address already has an open invitation');
      }
    }
    const invitation: StoredInvitation = { ...input, id: randomUUID(), acceptedAt: null, acceptedBy: null, revokedAt: null, createdAt: this.stamp() };
    this.state.invitations.set(invitation.id, invitation);
    return copy(invitation);
  }

  async getInvitation(_ctx: Context, invitationId: string): Promise<StoredInvitation | null> {
    const invitation = this.state.invitations.get(invitationId);
    return invitation ? copy(invitation) : null;
  }

  async findOpenInvitation(_ctx: Context, organizationId: string, email: string): Promise<StoredInvitation | null> {
    for (const invitation of this.state.invitations.values()) {
      if (invitation.organizationId === organizationId && invitation.email === email && !invitation.acceptedAt && !invitation.revokedAt) return copy(invitation);
    }
    return null;
  }

  async updateInvitation(_ctx: Context, invitationId: string, patch: Parameters<OrganizationStore['updateInvitation']>[2]): Promise<StoredInvitation | null> {
    const invitation = this.state.invitations.get(invitationId);
    if (!invitation) return null;
    Object.assign(invitation, Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)));
    return copy(invitation);
  }

  async listOpenInvitations(_ctx: Context, organizationId: string): Promise<StoredInvitation[]> {
    return [...this.state.invitations.values()]
      .filter((invitation) => invitation.organizationId === organizationId && !invitation.acceptedAt && !invitation.revokedAt)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(copy);
  }
}
