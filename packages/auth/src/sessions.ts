import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { AuthError, NotFoundError } from '@mariachi/core';
import type { AuthenticationAdapter, ResolvedIdentity, SessionInfo } from './types';

export interface SessionRecord extends SessionInfo {
  /** sha256 of the opaque token. The plaintext token is never stored. */
  tokenHash: string;
}

export interface SessionStore {
  create(record: SessionRecord): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  touch(id: string, lastActiveAt: Date, expiresAt: Date): Promise<void>;
  revoke(id: string): Promise<void>;
  revokeAllForUser(userId: string, tenantId?: string): Promise<number>;
  listForUser(userId: string, tenantId?: string): Promise<SessionRecord[]>;
  /** Deletes sessions that expired, or were revoked, before `olderThan`. Returns how many. Optional for a custom store. */
  deleteExpired?(olderThan: Date): Promise<number>;
}

export interface SessionManagerOptions {
  /**
   * How long a session lasts without being used: each use pushes the expiry this far ahead (see
   * `sliding`). With `sliding: false` it's the session's whole lifetime. Default 30 days.
   */
  ttlSeconds?: number;
  /** Extend expiry on activity up to `ttlSeconds` from last use. Default true. */
  sliding?: boolean;
  /**
   * The longest a session can live, counted from when it was issued, however often it's used:
   * after this the user signs in again. Default 90 days. `null` removes the limit, so a session
   * used at least once every `ttlSeconds` never ends.
   */
  maxLifetimeSeconds?: number | null;
  /** Minimum interval between `touch` writes. Default 60s. */
  touchIntervalSeconds?: number;
}

export const hashSessionToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** Opaque, revocable server-side sessions. Tokens are random 256-bit values; only hashes are stored. */
export class SessionManager implements AuthenticationAdapter {
  private readonly ttlMs: number;
  private readonly maxLifetimeMs: number;
  private readonly sliding: boolean;
  private readonly touchIntervalMs: number;

  constructor(
    private readonly store: SessionStore,
    options: SessionManagerOptions = {},
  ) {
    this.ttlMs = (options.ttlSeconds ?? 30 * 24 * 3600) * 1000;
    this.maxLifetimeMs = options.maxLifetimeSeconds === null ? Number.POSITIVE_INFINITY : (options.maxLifetimeSeconds ?? 90 * 24 * 3600) * 1000;
    this.sliding = options.sliding ?? true;
    this.touchIntervalMs = (options.touchIntervalSeconds ?? 60) * 1000;
  }

  async create(input: {
    userId: string;
    tenantId: string;
    scopes?: string[];
    userAgent?: string;
    ipAddress?: string;
  }): Promise<{ token: string; session: SessionInfo }> {
    const token = randomBytes(32).toString('base64url');
    const now = new Date();
    const record: SessionRecord = {
      id: randomUUID(),
      tokenHash: hashSessionToken(token),
      userId: input.userId,
      tenantId: input.tenantId,
      scopes: input.scopes ?? [],
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      createdAt: now,
      lastActiveAt: now,
      expiresAt: new Date(now.getTime() + Math.min(this.ttlMs, this.maxLifetimeMs)),
      revokedAt: null,
    };
    await this.store.create(record);
    const { tokenHash: _omit, ...session } = record;
    return { token, session };
  }

  async verify(token: string): Promise<ResolvedIdentity> {
    const record = await this.store.findByTokenHash(hashSessionToken(token));
    const now = Date.now();
    if (!record || record.revokedAt) throw new AuthError('auth/invalid-session', 'Invalid session');
    // The absolute end counts from issue, so sliding can't keep a session alive for ever.
    const absoluteEnd = record.createdAt.getTime() + this.maxLifetimeMs;
    if (record.expiresAt.getTime() <= now || absoluteEnd <= now) throw new AuthError('auth/session-expired', 'Session expired');
    if (this.sliding && now - record.lastActiveAt.getTime() > this.touchIntervalMs) {
      const expiresAt = new Date(Math.min(Math.max(record.expiresAt.getTime(), now + this.ttlMs), absoluteEnd));
      await this.store.touch(record.id, new Date(now), expiresAt);
    }
    return {
      userId: record.userId,
      tenantId: record.tenantId,
      scopes: record.scopes,
      identityType: 'session',
      sessionId: record.id,
    };
  }

  async sign(): Promise<string> {
    throw new AuthError('auth/not-supported', 'Use SessionManager.create() to issue sessions');
  }

  /**
   * Revokes one session. Pass `owner` when the id comes from a request ("sign out that device"):
   * the session must then be that user's (and in that tenant, if given), or it's `not-found`, the
   * same answer as for an id that doesn't exist.
   */
  async revoke(sessionId: string, owner?: { userId: string; tenantId?: string }): Promise<void> {
    if (owner) {
      const theirs = await this.store.listForUser(owner.userId, owner.tenantId);
      if (!theirs.some((session) => session.id === sessionId)) throw new NotFoundError('session', sessionId);
    }
    await this.store.revoke(sessionId);
  }

  /** Revokes every session of a user: in one tenant, or in every tenant when `tenantId` is left out. */
  revokeAllForUser(userId: string, tenantId?: string): Promise<number> {
    return this.store.revokeAllForUser(userId, tenantId);
  }

  /** A user's live sessions (not revoked, not expired): in one tenant, or in every tenant when `tenantId` is left out. */
  async list(userId: string, tenantId?: string): Promise<SessionInfo[]> {
    const records = await this.store.listForUser(userId, tenantId);
    const now = Date.now();
    return records.filter((r) => !r.revokedAt && r.expiresAt.getTime() > now).map(({ tokenHash: _omit, ...rest }) => rest);
  }

  /**
   * Deletes sessions that expired or were revoked more than `graceSeconds` ago (default one day,
   * so a recent sign-out can still be audited). Run it from a scheduled job. Returns how many rows
   * went; 0 when the store has no `deleteExpired`.
   */
  async purgeExpired(graceSeconds = 24 * 3600): Promise<number> {
    return (await this.store.deleteExpired?.(new Date(Date.now() - graceSeconds * 1000))) ?? 0;
  }
}

export class InMemorySessionStore implements SessionStore {
  private readonly byId = new Map<string, SessionRecord>();

  async create(record: SessionRecord): Promise<void> {
    this.byId.set(record.id, { ...record });
  }
  async findByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    for (const r of this.byId.values()) if (r.tokenHash === tokenHash) return { ...r };
    return null;
  }
  async touch(id: string, lastActiveAt: Date, expiresAt: Date): Promise<void> {
    const r = this.byId.get(id);
    if (r && !r.revokedAt) Object.assign(r, { lastActiveAt, expiresAt });
  }
  async revoke(id: string): Promise<void> {
    const r = this.byId.get(id);
    if (r && !r.revokedAt) r.revokedAt = new Date();
  }
  async revokeAllForUser(userId: string, tenantId?: string): Promise<number> {
    let n = 0;
    for (const r of this.byId.values()) {
      if (r.userId === userId && (!tenantId || r.tenantId === tenantId) && !r.revokedAt) {
        r.revokedAt = new Date();
        n++;
      }
    }
    return n;
  }
  async listForUser(userId: string, tenantId?: string): Promise<SessionRecord[]> {
    return [...this.byId.values()]
      .filter((r) => r.userId === userId && (!tenantId || r.tenantId === tenantId))
      .sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime())
      .map((r) => ({ ...r }));
  }
  async deleteExpired(olderThan: Date): Promise<number> {
    let n = 0;
    for (const r of this.byId.values()) {
      if (r.expiresAt < olderThan || (r.revokedAt && r.revokedAt < olderThan)) {
        this.byId.delete(r.id);
        n++;
      }
    }
    return n;
  }
}
