import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { sql } from 'drizzle-orm';
import { createContext } from '@mariachi/core';
import { tenantsTable } from '@mariachi/database/schema';
import { applySchema, createPostgresDatabase, type PostgresDatabase } from '@mariachi/database-postgres';
import { startPostgres, stopAll } from '../../../../test/setup';
import { organizationsContract } from '../contract';
import { DefaultOrganizations } from '../organizations';
import { organizationInvitationsTable, organizationMembershipsTable } from '../schema/index';
import { DrizzleOrganizationStore } from './store';

let database: PostgresDatabase;
const silent = { info() {}, warn() {}, error() {}, debug() {}, child: () => silent };
const as = (userId: string) => createContext({ userId, identityType: 'session', logger: silent });
const rows = <T>(result: unknown): T[] => (Array.isArray(result) ? (result as T[]) : ((result as { rows: T[] }).rows ?? []));

beforeAll(async () => {
  database = createPostgresDatabase({ url: await startPostgres() });
  await database.connect();
  await applySchema(database.db, [tenantsTable, organizationMembershipsTable, organizationInvitationsTable]);
}, 180_000);

afterAll(async () => {
  await database?.disconnect();
  await stopAll();
});

organizationsContract('postgres', () => new DrizzleOrganizationStore(database.db));

describe('DrizzleOrganizationStore', () => {
  it('keeps an organization as a tenants row, and its members and invitations by reference to it', async () => {
    const orgs = new DefaultOrganizations({ store: new DrizzleOrganizationStore(database.db) }, { logger: silent });
    const owner = `owner-${crypto.randomUUID()}`;
    const { organization } = await orgs.create(as(owner), { name: 'Rows' });
    const { token } = await orgs.invite(as(owner), organization.id, { email: 'ivy@example.com' });
    const [tenant] = rows<{ id: string; name: string; slug: string; status: string }>(await database.db.execute(sql`select id, name, slug, status from tenants where id = ${organization.id}::uuid`));
    expect(tenant).toMatchObject({ id: organization.id, name: 'Rows', status: 'active' });
    const [invitation] = rows<{ token_hash: string; email: string }>(await database.db.execute(sql`select token_hash, email from organization_invitations where organization_id = ${organization.id}::uuid`));
    // The hash, never the token
    expect(invitation?.token_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(token).not.toContain(invitation?.token_hash ?? 'x');

    await orgs.delete(as(owner), organization.id);
    const [deleted] = rows<{ status: string; deleted_at: Date | null }>(await database.db.execute(sql`select status, deleted_at from tenants where id = ${organization.id}::uuid`));
    expect(deleted?.status).toBe('deleted');
    expect(deleted?.deleted_at).not.toBeNull();

    // Removing the tenant row takes its memberships and invitations with it
    await database.db.execute(sql`delete from tenants where id = ${organization.id}::uuid`);
    expect(rows(await database.db.execute(sql`select 1 from organization_memberships where organization_id = ${organization.id}::uuid`))).toHaveLength(0);
    expect(rows(await database.db.execute(sql`select 1 from organization_invitations where organization_id = ${organization.id}::uuid`))).toHaveLength(0);
  });

  it('refuses a second open invitation for one address, whatever the service does', async () => {
    const store = new DrizzleOrganizationStore(database.db);
    const ctx = as('someone');
    const organization = await store.createOrganization(ctx, { name: 'Unique', slug: `unique-${crypto.randomUUID().slice(0, 8)}` });
    const invitation = { organizationId: organization.id, email: 'a@example.com', role: 'member' as const, tokenHash: 'a'.repeat(64), invitedBy: 'someone', expiresAt: new Date(Date.now() + 1000) };
    const first = await store.createInvitation(ctx, invitation);
    await expect(store.createInvitation(ctx, invitation)).rejects.toMatchObject({ code: 'organizations/invitation-exists' });
    // Once the first is revoked or accepted, the address can be invited again
    await store.updateInvitation(ctx, first.id, { revokedAt: new Date() });
    const second = await store.createInvitation(ctx, { ...invitation, tokenHash: 'b'.repeat(64) });
    expect(second.id).not.toBe(first.id);
    // A hash belongs to one invitation: a repeat fails at the database, as itself
    await store.updateInvitation(ctx, second.id, { revokedAt: new Date() });
    await expect(store.createInvitation(ctx, { ...invitation, tokenHash: 'a'.repeat(64) })).rejects.not.toMatchObject({ code: 'organizations/invitation-exists' });
  });
});
