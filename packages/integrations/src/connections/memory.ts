import { randomUUID } from 'node:crypto';
import type { Context } from '@mariachi/core';
import type { ConnectionPatch, ConnectionStore, NewConnection, PendingAuthorization, StoredConnection } from './types';

const copy = <T>(value: T): T => structuredClone(value);
const byNewest = (a: StoredConnection, b: StoredConnection) => b.updatedAt.getTime() - a.updatedAt.getTime();

/**
 * `ConnectionStore` in memory, for tests and for trying connections without a database. It passes the same
 * contract suite as the Postgres store. Its lock is per process: run several processes on Postgres.
 */
export class MemoryConnectionStore implements ConnectionStore {
  private readonly connections = new Map<string, StoredConnection>();
  private readonly authorizations = new Map<string, PendingAuthorization>();
  private readonly locks = new Map<string, Promise<unknown>>();
  /** Ticks once per write, so rows written in the same millisecond still have an order. */
  private clock = 0;

  private stamp(): Date {
    this.clock += 1;
    return new Date(Date.now() + this.clock);
  }

  /** Every row as stored, ciphertext included: for tests that check what is at rest. */
  rows(): StoredConnection[] {
    return [...this.connections.values()].map(copy);
  }

  async saveConnection(_ctx: Context, input: NewConnection): Promise<StoredConnection> {
    const existing = [...this.connections.values()].find(
      (c) => c.tenantId === input.tenantId && c.userId === input.userId && c.provider === input.provider && c.accountId === input.accountId,
    );
    const now = this.stamp();
    const row: StoredConnection = existing
      ? { ...existing, ...input, refreshToken: input.refreshToken === undefined ? existing.refreshToken : input.refreshToken, status: 'active', updatedAt: now }
      : { id: randomUUID(), ...input, refreshToken: input.refreshToken ?? null, status: 'active', createdAt: now, updatedAt: now };
    this.connections.set(row.id, copy(row));
    return copy(row);
  }

  async getConnection(_ctx: Context, tenantId: string | null, connectionId: string): Promise<StoredConnection | null> {
    const row = this.connections.get(connectionId);
    return row && row.tenantId === tenantId ? copy(row) : null;
  }

  async findConnection(_ctx: Context, tenantId: string | null, userId: string, provider: string): Promise<StoredConnection | null> {
    const found = [...this.connections.values()].filter((c) => c.tenantId === tenantId && c.userId === userId && c.provider === provider && c.status !== 'revoked').sort(byNewest);
    return found[0] ? copy(found[0]) : null;
  }

  async listConnections(_ctx: Context, tenantId: string | null, userId: string): Promise<StoredConnection[]> {
    return [...this.connections.values()].filter((c) => c.tenantId === tenantId && c.userId === userId && c.status !== 'revoked').sort(byNewest).map(copy);
  }

  async updateConnection(_ctx: Context, connectionId: string, patch: ConnectionPatch): Promise<StoredConnection | null> {
    const row = this.connections.get(connectionId);
    if (!row) return null;
    const set = Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
    const updated: StoredConnection = { ...row, ...copy(set), updatedAt: this.stamp() };
    this.connections.set(connectionId, updated);
    return copy(updated);
  }

  async lockConnection<T>(_ctx: Context, connectionId: string, fn: (current: StoredConnection | null) => Promise<T>): Promise<T> {
    const before = this.locks.get(connectionId) ?? Promise.resolve();
    const run = before.then(() => fn(this.connections.has(connectionId) ? copy(this.connections.get(connectionId) as StoredConnection) : null));
    const settled = run.catch(() => undefined);
    this.locks.set(connectionId, settled);
    try {
      return await run;
    } finally {
      if (this.locks.get(connectionId) === settled) this.locks.delete(connectionId);
    }
  }

  async saveAuthorization(_ctx: Context, authorization: PendingAuthorization): Promise<void> {
    this.authorizations.set(authorization.nonceHash, copy(authorization));
  }

  async takeAuthorization(_ctx: Context, nonceHash: string): Promise<PendingAuthorization | null> {
    const found = this.authorizations.get(nonceHash);
    this.authorizations.delete(nonceHash);
    return found ? copy(found) : null;
  }

  async deleteExpiredAuthorizations(_ctx: Context, now: Date): Promise<number> {
    let removed = 0;
    for (const [hash, authorization] of this.authorizations) {
      if (authorization.expiresAt.getTime() < now.getTime()) {
        this.authorizations.delete(hash);
        removed += 1;
      }
    }
    return removed;
  }
}
