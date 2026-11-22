import { AsyncLocalStorage } from 'node:async_hooks';
import { and, desc, eq, isNull, lt, ne, sql } from 'drizzle-orm';
import type { Context } from '@mariachi/core';
import { compileTable, currentTransaction, withTransaction, type DrizzleDb } from '@mariachi/database-postgres';
import type { ConnectionPatch, ConnectionStatus, ConnectionStore, NewConnection, PendingAuthorization, StoredConnection } from '../connections/types';
import { integrationAuthorizationsTable, integrationConnectionsTable } from '../schema/index';

const connections = compileTable(integrationConnectionsTable);
const authorizations = compileTable(integrationAuthorizationsTable);

/** Compiled Drizzle tables, for drizzle-kit schema files and custom queries. */
export const connectionTables = { connections, authorizations };

type ConnectionRow = typeof connections.$inferSelect;
type AuthorizationRow = typeof authorizations.$inferSelect;

const toConnection = (row: ConnectionRow): StoredConnection => ({
  id: row.id,
  tenantId: row.tenantId ?? null,
  userId: row.userId,
  provider: row.provider,
  accountId: row.accountId ?? null,
  scopes: (row.scopes as string[] | null) ?? [],
  accessToken: row.accessToken ?? null,
  refreshToken: row.refreshToken ?? null,
  expiresAt: row.expiresAt ?? null,
  issuedAt: row.issuedAt ?? null,
  status: row.status as ConnectionStatus,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const toAuthorization = (row: AuthorizationRow): PendingAuthorization => ({
  nonceHash: row.nonceHash,
  tenantId: row.tenantId ?? null,
  userId: row.userId,
  provider: row.provider,
  codeVerifier: row.codeVerifier ?? null,
  expiresAt: row.expiresAt,
});

const tenantIs = (tenantId: string | null) => (tenantId === null ? isNull(connections.tenantId) : eq(connections.tenantId, tenantId));

/**
 * Postgres `ConnectionStore`, over the two tables from `@mariachi/integrations/schema`. Add both to your schema
 * file and migrate. Locks are Postgres row locks, so refreshes are serialized across every process that shares
 * the database.
 */
export class DrizzleConnectionStore implements ConnectionStore {
  /** The transaction of the `lockConnection` running now, which its writes use whatever transaction the app has open. */
  private readonly locked = new AsyncLocalStorage<DrizzleDb>();

  constructor(private readonly database: DrizzleDb) {}

  private get db(): DrizzleDb {
    return this.locked.getStore() ?? (currentTransaction() as DrizzleDb | undefined) ?? this.database;
  }

  async saveConnection(ctx: Context, input: NewConnection): Promise<StoredConnection> {
    return withTransaction(this.database, ctx, async () => {
      // One row per tenant, user, provider and account: two callbacks for the same account at once take turns
      const key = JSON.stringify(['integration_connections', input.tenantId ?? '', input.userId, input.provider, input.accountId ?? '']);
      await this.db.execute(sql`select pg_advisory_xact_lock(hashtextextended(${key}, 0))`);
      const [existing] = await this.db
        .select({ id: connections.id })
        .from(connections)
        .where(and(tenantIs(input.tenantId), eq(connections.userId, input.userId), eq(connections.provider, input.provider), input.accountId === null ? isNull(connections.accountId) : eq(connections.accountId, input.accountId)))
        .orderBy(desc(connections.updatedAt))
        .limit(1);
      if (existing) {
        const { refreshToken, ...rest } = input;
        const set = { ...rest, ...(refreshToken === undefined ? {} : { refreshToken }), status: 'active', updatedAt: new Date() };
        const [row] = await this.db.update(connections).set(set).where(eq(connections.id, existing.id)).returning();
        return toConnection(row as ConnectionRow);
      }
      const [row] = await this.db
        .insert(connections)
        .values({ ...input, refreshToken: input.refreshToken ?? null, status: 'active' })
        .returning();
      return toConnection(row as ConnectionRow);
    });
  }

  async getConnection(_ctx: Context, tenantId: string | null, connectionId: string): Promise<StoredConnection | null> {
    if (!isUuid(connectionId)) return null;
    const [row] = await this.db.select().from(connections).where(and(eq(connections.id, connectionId), tenantIs(tenantId))).limit(1);
    return row ? toConnection(row) : null;
  }

  async findConnection(_ctx: Context, tenantId: string | null, userId: string, provider: string): Promise<StoredConnection | null> {
    const [row] = await this.db
      .select()
      .from(connections)
      .where(and(tenantIs(tenantId), eq(connections.userId, userId), eq(connections.provider, provider), ne(connections.status, 'revoked')))
      .orderBy(desc(connections.updatedAt), desc(connections.id))
      .limit(1);
    return row ? toConnection(row) : null;
  }

  async listConnections(_ctx: Context, tenantId: string | null, userId: string): Promise<StoredConnection[]> {
    const rows = await this.db
      .select()
      .from(connections)
      .where(and(tenantIs(tenantId), eq(connections.userId, userId), ne(connections.status, 'revoked')))
      .orderBy(desc(connections.updatedAt), desc(connections.id));
    return rows.map(toConnection);
  }

  async updateConnection(_ctx: Context, connectionId: string, patch: ConnectionPatch): Promise<StoredConnection | null> {
    if (!isUuid(connectionId)) return null;
    const set = { ...Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)), updatedAt: new Date() };
    const [row] = await this.db.update(connections).set(set).where(eq(connections.id, connectionId)).returning();
    return row ? toConnection(row as ConnectionRow) : null;
  }

  async lockConnection<T>(_ctx: Context, connectionId: string, fn: (current: StoredConnection | null) => Promise<T>): Promise<T> {
    if (!isUuid(connectionId)) return fn(null);
    // A transaction of its own, never the app's: a refresh token the provider has just rotated must be stored even
    // if the app's transaction around this call is rolled back, or the connection would be lost
    return this.database.transaction((tx) =>
      this.locked.run(tx as unknown as DrizzleDb, async () => {
        // Held until the transaction ends: a second refresh of this connection waits here, then sees the first's tokens
        const [row] = await this.db.select().from(connections).where(eq(connections.id, connectionId)).for('update').limit(1);
        return fn(row ? toConnection(row) : null);
      }),
    );
  }

  async saveAuthorization(_ctx: Context, authorization: PendingAuthorization): Promise<void> {
    await this.db.insert(authorizations).values(authorization);
  }

  async takeAuthorization(_ctx: Context, nonceHash: string): Promise<PendingAuthorization | null> {
    // One statement: of two callbacks with the same state, only one gets the row
    const [row] = await this.db.delete(authorizations).where(eq(authorizations.nonceHash, nonceHash)).returning();
    return row ? toAuthorization(row as AuthorizationRow) : null;
  }

  async deleteExpiredAuthorizations(_ctx: Context, now: Date): Promise<number> {
    const rows = await this.db.delete(authorizations).where(lt(authorizations.expiresAt, now)).returning({ id: authorizations.id });
    return rows.length;
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** An id that isn't a uuid names no row, rather than failing the query. */
const isUuid = (value: string): boolean => UUID.test(value);
