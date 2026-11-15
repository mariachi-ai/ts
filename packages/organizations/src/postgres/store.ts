import { and, asc, count, desc, eq, isNull, ne, sql } from 'drizzle-orm';
import type { Context, PaginatedResult, PaginationParams } from '@mariachi/core';
import { OrganizationsError } from '@mariachi/core';
import { tenantsTable } from '@mariachi/database/schema';
import { compileTable, currentTransaction, withTransaction, type DrizzleDb } from '@mariachi/database-postgres';
import { organizationInvitationsTable, organizationMembershipsTable } from '../schema/index';
import type { Membership, Organization, OrganizationStore, StoredInvitation } from '../types';

const tenants = compileTable(tenantsTable);
const memberships = compileTable(organizationMembershipsTable);
const invitations = compileTable(organizationInvitationsTable);

/** Compiled Drizzle tables, for drizzle-kit schema files and custom queries. */
export const organizationTables = { memberships, invitations };

type TenantRow = typeof tenants.$inferSelect;
type MembershipRow = typeof memberships.$inferSelect;
type InvitationRow = typeof invitations.$inferSelect;

const toOrganization = (row: TenantRow): Organization => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  status: row.status as Organization['status'],
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const toMembership = (row: MembershipRow): Membership => ({
  organizationId: row.organizationId,
  userId: row.userId,
  role: row.role as Membership['role'],
  status: row.status as Membership['status'],
  email: row.email ?? null,
  name: row.name ?? null,
  invitedBy: row.invitedBy ?? null,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const toInvitation = (row: InvitationRow): StoredInvitation => ({
  id: row.id,
  organizationId: row.organizationId,
  email: row.email,
  role: row.role as StoredInvitation['role'],
  tokenHash: row.tokenHash,
  invitedBy: row.invitedBy,
  expiresAt: row.expiresAt,
  acceptedAt: row.acceptedAt ?? null,
  acceptedBy: row.acceptedBy ?? null,
  revokedAt: row.revokedAt ?? null,
  createdAt: row.createdAt,
});

/** Postgres says which constraint a duplicate broke; drizzle keeps it on the error or its cause. */
function brokenConstraint(error: unknown): string | undefined {
  for (let e = error as { code?: string; constraint_name?: string; constraint?: string; cause?: unknown } | undefined; e; e = e.cause as typeof e) {
    if (e.code === '23505') return e.constraint_name ?? e.constraint ?? '';
  }
  return undefined;
}

/**
 * Postgres `OrganizationStore`. Organizations are rows of `tenants`; memberships and invitations
 * are the two tables from `@mariachi/organizations/schema`. Add all three to your schema file and
 * migrate.
 */
export class DrizzleOrganizationStore implements OrganizationStore {
  constructor(private readonly database: DrizzleDb) {}

  private get db(): DrizzleDb {
    return (currentTransaction() as DrizzleDb | undefined) ?? this.database;
  }

  transaction<T>(ctx: Context, fn: () => Promise<T>, options?: { lock?: string }): Promise<T> {
    return withTransaction(this.database, ctx, async () => {
      // The organization's own row is the lock: one membership change at a time per organization
      // (`no key update`: rows elsewhere that reference the tenant can still be inserted meanwhile)
      if (options?.lock) await this.db.execute(sql`select 1 from ${tenants} where id = ${options.lock}::uuid for no key update`);
      return fn();
    });
  }

  private slugTaken(error: unknown, slug: string): never {
    const constraint = brokenConstraint(error);
    if (constraint !== undefined && (constraint === '' || constraint.includes('slug'))) {
      throw new OrganizationsError('organizations/slug-taken', `The slug "${slug}" is taken`, { slug });
    }
    throw error;
  }

  async createOrganization(_ctx: Context, input: { name: string; slug: string }): Promise<Organization> {
    try {
      // A savepoint, so a taken slug doesn't end the transaction this may be part of
      const [row] = await this.db.transaction((tx) => tx.insert(tenants).values({ name: input.name, slug: input.slug }).returning());
      return toOrganization(row as TenantRow);
    } catch (error) {
      return this.slugTaken(error, input.slug);
    }
  }

  async getOrganization(_ctx: Context, organizationId: string): Promise<Organization | null> {
    const [row] = await this.db.select().from(tenants).where(eq(tenants.id, organizationId)).limit(1);
    return row ? toOrganization(row) : null;
  }

  async updateOrganization(_ctx: Context, organizationId: string, patch: { name?: string; slug?: string; status?: Organization['status'] }): Promise<Organization | null> {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (patch.name !== undefined) set.name = patch.name;
    if (patch.slug !== undefined) set.slug = patch.slug;
    if (patch.status !== undefined) {
      set.status = patch.status;
      set.deletedAt = patch.status === 'deleted' ? new Date() : null;
    }
    try {
      const [row] = await this.db.transaction((tx) => tx.update(tenants).set(set).where(eq(tenants.id, organizationId)).returning());
      return row ? toOrganization(row as TenantRow) : null;
    } catch (error) {
      return this.slugTaken(error, patch.slug ?? '');
    }
  }

  async listForUser(_ctx: Context, userId: string): Promise<Array<{ organization: Organization; membership: Membership }>> {
    const found = await this.db
      .select({ organization: tenants, membership: memberships })
      .from(memberships)
      .innerJoin(tenants, eq(tenants.id, memberships.organizationId))
      .where(and(eq(memberships.userId, userId), eq(memberships.status, 'active'), ne(tenants.status, 'deleted')))
      .orderBy(asc(memberships.createdAt), asc(memberships.id));
    return found.map((row) => ({ organization: toOrganization(row.organization), membership: toMembership(row.membership) }));
  }

  async getMembership(_ctx: Context, organizationId: string, userId: string): Promise<Membership | null> {
    const [row] = await this.db
      .select()
      .from(memberships)
      .where(and(eq(memberships.organizationId, organizationId), eq(memberships.userId, userId)))
      .limit(1);
    return row ? toMembership(row) : null;
  }

  async findMemberByEmail(_ctx: Context, organizationId: string, email: string): Promise<Membership | null> {
    const [row] = await this.db
      .select()
      .from(memberships)
      .where(and(eq(memberships.organizationId, organizationId), eq(memberships.email, email), eq(memberships.status, 'active')))
      .limit(1);
    return row ? toMembership(row) : null;
  }

  async putMembership(_ctx: Context, input: Pick<Membership, 'organizationId' | 'userId' | 'role' | 'email' | 'name' | 'invitedBy'>): Promise<Membership> {
    const now = new Date();
    const [row] = await this.db
      .insert(memberships)
      .values({ ...input, status: 'active' })
      .onConflictDoUpdate({
        target: [memberships.organizationId, memberships.userId],
        set: {
          role: input.role,
          email: input.email,
          name: input.name,
          invitedBy: input.invitedBy,
          status: 'active',
          updatedAt: now,
          // Someone brought back joined now; someone who never left keeps the day they joined
          createdAt: sql`case when ${memberships.status} = 'active' then ${memberships.createdAt} else now() end`,
        },
      })
      .returning();
    return toMembership(row as MembershipRow);
  }

  async updateMembership(_ctx: Context, organizationId: string, userId: string, patch: { role?: Membership['role']; status?: Membership['status'] }): Promise<Membership | null> {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (patch.role !== undefined) set.role = patch.role;
    if (patch.status !== undefined) set.status = patch.status;
    const [row] = await this.db
      .update(memberships)
      .set(set)
      .where(and(eq(memberships.organizationId, organizationId), eq(memberships.userId, userId)))
      .returning();
    return row ? toMembership(row as MembershipRow) : null;
  }

  async listMembers(_ctx: Context, organizationId: string, pagination: PaginationParams): Promise<PaginatedResult<Membership>> {
    const where = and(eq(memberships.organizationId, organizationId), eq(memberships.status, 'active'));
    const [found, [counted]] = await Promise.all([
      this.db
        .select()
        .from(memberships)
        .where(where)
        .orderBy(sql`case ${memberships.role} when 'owner' then 0 when 'admin' then 1 else 2 end`, asc(memberships.createdAt), asc(memberships.userId))
        .limit(pagination.pageSize)
        .offset((pagination.page - 1) * pagination.pageSize),
      this.db.select({ total: count() }).from(memberships).where(where),
    ]);
    const total = Number(counted?.total ?? 0);
    return { data: found.map(toMembership), total, page: pagination.page, pageSize: pagination.pageSize, totalPages: Math.ceil(total / pagination.pageSize) };
  }

  async countOwners(_ctx: Context, organizationId: string): Promise<number> {
    const [counted] = await this.db
      .select({ total: count() })
      .from(memberships)
      .where(and(eq(memberships.organizationId, organizationId), eq(memberships.status, 'active'), eq(memberships.role, 'owner')));
    return Number(counted?.total ?? 0);
  }

  async createInvitation(_ctx: Context, input: Pick<StoredInvitation, 'organizationId' | 'email' | 'role' | 'tokenHash' | 'invitedBy' | 'expiresAt'>): Promise<StoredInvitation> {
    try {
      const [row] = await this.db.transaction((tx) => tx.insert(invitations).values(input).returning());
      return toInvitation(row as InvitationRow);
    } catch (error) {
      if (brokenConstraint(error)?.includes('pending')) throw new OrganizationsError('organizations/invitation-exists', 'That address already has an open invitation');
      throw error;
    }
  }

  async getInvitation(_ctx: Context, invitationId: string): Promise<StoredInvitation | null> {
    const [row] = await this.db.select().from(invitations).where(eq(invitations.id, invitationId)).limit(1);
    return row ? toInvitation(row) : null;
  }

  async findOpenInvitation(_ctx: Context, organizationId: string, email: string): Promise<StoredInvitation | null> {
    const [row] = await this.db
      .select()
      .from(invitations)
      .where(and(eq(invitations.organizationId, organizationId), eq(invitations.email, email), isNull(invitations.acceptedAt), isNull(invitations.revokedAt)))
      .limit(1);
    return row ? toInvitation(row) : null;
  }

  async updateInvitation(_ctx: Context, invitationId: string, patch: Parameters<OrganizationStore['updateInvitation']>[2]): Promise<StoredInvitation | null> {
    const set = { ...Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)), updatedAt: new Date() };
    const [row] = await this.db.update(invitations).set(set).where(eq(invitations.id, invitationId)).returning();
    return row ? toInvitation(row as InvitationRow) : null;
  }

  async listOpenInvitations(_ctx: Context, organizationId: string): Promise<StoredInvitation[]> {
    const found = await this.db
      .select()
      .from(invitations)
      .where(and(eq(invitations.organizationId, organizationId), isNull(invitations.acceptedAt), isNull(invitations.revokedAt)))
      .orderBy(desc(invitations.createdAt), desc(invitations.id));
    return found.map(toInvitation);
  }
}
