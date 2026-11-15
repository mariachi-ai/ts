import { and, desc, eq, isNotNull, isNull, lt, or } from 'drizzle-orm';
import { compileTable, type DrizzleDb } from '@mariachi/database-postgres';
import { sessionsTable } from '../schema/sessions';
import type { SessionRecord, SessionStore } from '../sessions';

const sessions = compileTable(sessionsTable);

type Row = typeof sessions.$inferSelect;

function toRecord(r: Row): SessionRecord {
  return {
    id: r.id,
    tokenHash: r.tokenHash,
    userId: r.userId,
    tenantId: r.tenantId,
    scopes: Array.isArray(r.scopes) ? (r.scopes as string[]) : [],
    userAgent: r.userAgent ?? undefined,
    ipAddress: r.ipAddress ?? undefined,
    createdAt: r.createdAt,
    lastActiveAt: r.lastActiveAt,
    expiresAt: r.expiresAt,
    revokedAt: r.revokedAt ?? null,
  };
}

/** `sessions` table store for `SessionManager`. Only token hashes are stored. */
export class DrizzleSessionStore implements SessionStore {
  constructor(private readonly db: DrizzleDb) {}

  async create(record: SessionRecord): Promise<void> {
    await this.db.insert(sessions).values({
      id: record.id,
      tokenHash: record.tokenHash,
      userId: record.userId,
      tenantId: record.tenantId,
      scopes: record.scopes,
      userAgent: record.userAgent ?? null,
      ipAddress: record.ipAddress ?? null,
      createdAt: record.createdAt,
      lastActiveAt: record.lastActiveAt,
      expiresAt: record.expiresAt,
      revokedAt: record.revokedAt ?? null,
    });
  }

  async findByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    const [row] = await this.db.select().from(sessions).where(eq(sessions.tokenHash, tokenHash)).limit(1);
    return row ? toRecord(row) : null;
  }

  async touch(id: string, lastActiveAt: Date, expiresAt: Date): Promise<void> {
    await this.db.update(sessions).set({ lastActiveAt, expiresAt }).where(and(eq(sessions.id, id), isNull(sessions.revokedAt)));
  }

  async revoke(id: string): Promise<void> {
    await this.db.update(sessions).set({ revokedAt: new Date() }).where(and(eq(sessions.id, id), isNull(sessions.revokedAt)));
  }

  async revokeAllForUser(userId: string, tenantId?: string): Promise<number> {
    const rows = await this.db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.userId, userId), tenantId ? eq(sessions.tenantId, tenantId) : undefined, isNull(sessions.revokedAt)))
      .returning({ id: sessions.id });
    return rows.length;
  }

  async listForUser(userId: string, tenantId?: string): Promise<SessionRecord[]> {
    const rows = await this.db
      .select()
      .from(sessions)
      .where(and(eq(sessions.userId, userId), tenantId ? eq(sessions.tenantId, tenantId) : undefined))
      .orderBy(desc(sessions.lastActiveAt));
    return rows.map(toRecord);
  }

  async deleteExpired(olderThan: Date): Promise<number> {
    const rows = await this.db
      .delete(sessions)
      .where(or(lt(sessions.expiresAt, olderThan), and(isNotNull(sessions.revokedAt), lt(sessions.revokedAt, olderThan))))
      .returning({ id: sessions.id });
    return rows.length;
  }
}
