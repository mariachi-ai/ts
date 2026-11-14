import { describe, expect, it } from 'vitest';
import { hashSessionToken, SessionManager, type SessionStore } from './sessions';

/** What every `SessionStore` must do. Run by the in-memory store's unit test and the Postgres store's integration test. */
export function sessionStoreContract(name: string, makeStore: () => SessionStore | Promise<SessionStore>): void {
  describe(`SessionStore contract: ${name}`, () => {
    const run = crypto.randomUUID().slice(0, 8);
    const user = (n: string) => `user-${n}-${run}`;

    it('issues a session, verifies its token, and stores only the hash', async () => {
      const store = await makeStore();
      const sessions = new SessionManager(store);
      const { token, session } = await sessions.create({ userId: user('a'), tenantId: 't1', scopes: ['read'], userAgent: 'test', ipAddress: '203.0.113.9' });
      expect(await sessions.verify(token)).toEqual({ userId: user('a'), tenantId: 't1', scopes: ['read'], identityType: 'session', sessionId: session.id });

      const stored = await store.findByTokenHash(hashSessionToken(token));
      expect(stored).toMatchObject({ id: session.id, userId: user('a'), tenantId: 't1', scopes: ['read'], userAgent: 'test', ipAddress: '203.0.113.9', revokedAt: null });
      expect(JSON.stringify(stored)).not.toContain(token);
      expect(await store.findByTokenHash(hashSessionToken('not-a-token'))).toBeNull();
      await expect(sessions.verify('not-a-token')).rejects.toMatchObject({ code: 'auth/invalid-session' });
    });

    it('refuses a revoked session and an expired one', async () => {
      const store = await makeStore();
      const sessions = new SessionManager(store);
      const revoked = await sessions.create({ userId: user('b'), tenantId: 't1' });
      await sessions.revoke(revoked.session.id);
      await expect(sessions.verify(revoked.token)).rejects.toMatchObject({ code: 'auth/invalid-session' });

      const expired = await new SessionManager(store, { ttlSeconds: -1 }).create({ userId: user('b'), tenantId: 't1' });
      await expect(sessions.verify(expired.token)).rejects.toMatchObject({ code: 'auth/session-expired' });
      expect(await sessions.list(user('b'))).toEqual([]);
    });

    it('slides the expiry on use, and not for a revoked session', async () => {
      const store = await makeStore();
      const sliding = new SessionManager(store, { ttlSeconds: 3600, touchIntervalSeconds: -1 });
      const { token, session } = await sliding.create({ userId: user('c'), tenantId: 't1' });
      await new Promise((resolve) => setTimeout(resolve, 5));
      await sliding.verify(token);
      const touched = await store.findByTokenHash(hashSessionToken(token));
      expect(touched?.lastActiveAt.getTime()).toBeGreaterThan(session.lastActiveAt.getTime());
      expect(touched?.expiresAt.getTime()).toBeGreaterThan(session.expiresAt.getTime());

      await store.revoke(session.id);
      const before = await store.findByTokenHash(hashSessionToken(token));
      await store.touch(session.id, new Date(Date.now() + 60_000), new Date(Date.now() + 7_200_000));
      expect(await store.findByTokenHash(hashSessionToken(token))).toEqual(before);
    });

    it('ends a session at its absolute lifetime, however often it is used', async () => {
      const store = await makeStore();
      // The slide wants an hour more on every use; the absolute lifetime allows ten seconds in all.
      const capped = new SessionManager(store, { ttlSeconds: 3600, maxLifetimeSeconds: 10, touchIntervalSeconds: -1 });
      const { token, session } = await capped.create({ userId: user('g'), tenantId: 't1' });
      const end = session.createdAt.getTime() + 10_000;
      expect(session.expiresAt.getTime()).toBe(end);
      await new Promise((resolve) => setTimeout(resolve, 5));
      await capped.verify(token);
      await capped.verify(token);
      expect((await store.findByTokenHash(hashSessionToken(token)))?.expiresAt.getTime()).toBe(end);

      // A session issued without a limit is still refused once the limit in force has passed.
      const unlimited = await new SessionManager(store, { maxLifetimeSeconds: null }).create({ userId: user('g'), tenantId: 't1' });
      await new Promise((resolve) => setTimeout(resolve, 30));
      await expect(new SessionManager(store, { maxLifetimeSeconds: 0.01 }).verify(unlimited.token)).rejects.toMatchObject({ code: 'auth/session-expired' });
      expect((await new SessionManager(store, { maxLifetimeSeconds: null }).verify(unlimited.token)).sessionId).toBe(unlimited.session.id);
    });

    it('revokes a session for its owner only', async () => {
      const store = await makeStore();
      const sessions = new SessionManager(store);
      const mine = await sessions.create({ userId: user('h'), tenantId: 't1' });
      const theirs = await sessions.create({ userId: user('i'), tenantId: 't1' });

      await expect(sessions.revoke(theirs.session.id, { userId: user('h') })).rejects.toMatchObject({ code: 'not-found' });
      await expect(sessions.revoke(mine.session.id, { userId: user('h'), tenantId: 't2' })).rejects.toMatchObject({ code: 'not-found' });
      await expect(sessions.revoke(crypto.randomUUID(), { userId: user('h') })).rejects.toMatchObject({ code: 'not-found' });
      expect((await sessions.verify(theirs.token)).userId).toBe(user('i'));

      await sessions.revoke(mine.session.id, { userId: user('h'), tenantId: 't1' });
      await expect(sessions.verify(mine.token)).rejects.toMatchObject({ code: 'auth/invalid-session' });
    });

    it("lists and revokes one user's sessions, by tenant when asked", async () => {
      const store = await makeStore();
      const sessions = new SessionManager(store);
      const first = await sessions.create({ userId: user('d'), tenantId: 't1' });
      const second = await sessions.create({ userId: user('d'), tenantId: 't2' });
      const other = await sessions.create({ userId: user('e'), tenantId: 't1' });

      expect((await sessions.list(user('d'))).map((s) => s.id).sort()).toEqual([first.session.id, second.session.id].sort());
      expect((await sessions.list(user('d'), 't2')).map((s) => s.id)).toEqual([second.session.id]);

      expect(await sessions.revokeAllForUser(user('d'), 't1')).toBe(1);
      await expect(sessions.verify(first.token)).rejects.toMatchObject({ code: 'auth/invalid-session' });
      expect((await sessions.verify(second.token)).sessionId).toBe(second.session.id);
      expect(await sessions.revokeAllForUser(user('d'))).toBe(1);
      expect(await sessions.revokeAllForUser(user('d'))).toBe(0);
      expect((await sessions.verify(other.token)).userId).toBe(user('e'));
    });

    it('purges sessions that expired or were revoked before the cutoff, and keeps the rest', async () => {
      const store = await makeStore();
      const sessions = new SessionManager(store);
      const live = await sessions.create({ userId: user('f'), tenantId: 't1' });
      const expired = await new SessionManager(store, { ttlSeconds: -3600 }).create({ userId: user('f'), tenantId: 't1' });
      const revoked = await sessions.create({ userId: user('f'), tenantId: 't1' });
      await sessions.revoke(revoked.session.id);

      // A grace of 30 minutes: the session that expired an hour ago goes, the one revoked just now stays.
      expect(await sessions.purgeExpired(1800)).toBeGreaterThanOrEqual(1);
      expect(await store.findByTokenHash(hashSessionToken(expired.token))).toBeNull();
      expect(await store.findByTokenHash(hashSessionToken(revoked.token))).not.toBeNull();
      expect((await sessions.verify(live.token)).sessionId).toBe(live.session.id);

      // No grace: the revoked one goes too.
      await new Promise((resolve) => setTimeout(resolve, 5));
      await sessions.purgeExpired(0);
      expect(await store.findByTokenHash(hashSessionToken(revoked.token))).toBeNull();
      expect(await store.findByTokenHash(hashSessionToken(live.token))).not.toBeNull();
    });
  });
}
