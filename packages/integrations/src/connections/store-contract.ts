import { IntegrationError, createContext } from '@mariachi/core';
import { describe, expect, it } from 'vitest';
import type { ConnectionStore, NewConnection } from './types';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child: () => silent };
const ctx = createContext({ logger: silent });
const run = () => crypto.randomUUID().slice(0, 8);

/**
 * What `Connections` needs of any `ConnectionStore`. The memory store runs it in the unit tests and the Postgres
 * store in the integration tests. Every test uses its own users, so the tests can share one database.
 */
export function connectionStoreContract(name: string, makeStore: () => ConnectionStore | Promise<ConnectionStore>): void {
  describe(`connection store contract: ${name}`, () => {
    const fresh = (over: Partial<NewConnection> = {}): NewConnection => ({
      tenantId: `t-${run()}`,
      userId: `u-${run()}`,
      provider: 'acme',
      accountId: null,
      scopes: ['read'],
      accessToken: 'mx1:access',
      refreshToken: 'mx1:refresh',
      expiresAt: new Date(Date.now() + 3_600_000),
      ...over,
    });

    it('saves a connection, and saving the same account again updates that row', async () => {
      const store = await makeStore();
      const first = await store.saveConnection(ctx, fresh());
      expect(first).toMatchObject({ provider: 'acme', status: 'active', scopes: ['read'], accessToken: 'mx1:access', refreshToken: 'mx1:refresh' });
      expect(first.id).toMatch(/^[0-9a-f-]{36}$/);

      await store.updateConnection(ctx, first.id, { status: 'needs-reconnect', accessToken: null, refreshToken: null });
      const again = await store.saveConnection(ctx, { ...fresh({ tenantId: first.tenantId, userId: first.userId }), accessToken: 'mx1:access-2', refreshToken: 'mx1:refresh-2' });
      expect(again).toMatchObject({ id: first.id, status: 'active', accessToken: 'mx1:access-2', refreshToken: 'mx1:refresh-2' });
      expect(again.createdAt.getTime()).toBe(first.createdAt.getTime());
    });

    it('keeps the stored refresh token when a save brings none', async () => {
      const store = await makeStore();
      const first = await store.saveConnection(ctx, fresh());
      const { refreshToken: _, ...withoutRefresh } = fresh({ tenantId: first.tenantId, userId: first.userId, accessToken: 'mx1:access-2' });
      const again = await store.saveConnection(ctx, withoutRefresh);
      expect(again).toMatchObject({ id: first.id, accessToken: 'mx1:access-2', refreshToken: 'mx1:refresh' });
      // A new connection without one has none
      const other = await store.saveConnection(ctx, { ...withoutRefresh, userId: `u-${run()}` });
      expect(other.refreshToken).toBeNull();
    });

    it('keeps one connection per account, telling accounts apart only when the account id is known', async () => {
      const store = await makeStore();
      const owner = { tenantId: `t-${run()}`, userId: `u-${run()}` };
      const a = await store.saveConnection(ctx, fresh({ ...owner, accountId: 'acct-a' }));
      const b = await store.saveConnection(ctx, fresh({ ...owner, accountId: 'acct-b' }));
      const unknown = await store.saveConnection(ctx, fresh(owner));
      expect(new Set([a.id, b.id, unknown.id]).size).toBe(3);
      expect((await store.saveConnection(ctx, fresh({ ...owner, accountId: 'acct-a' }))).id).toBe(a.id);
      expect((await store.saveConnection(ctx, fresh(owner))).id).toBe(unknown.id);
      expect(await store.listConnections(ctx, owner.tenantId, owner.userId)).toHaveLength(3);
    });

    it('scopes every read to the tenant, with null for an app without tenants', async () => {
      const store = await makeStore();
      const userId = `u-${run()}`;
      const inTenant = await store.saveConnection(ctx, fresh({ tenantId: `t-${run()}`, userId }));
      const noTenant = await store.saveConnection(ctx, fresh({ tenantId: null, userId }));
      expect(inTenant.id).not.toBe(noTenant.id);
      expect(await store.getConnection(ctx, inTenant.tenantId, inTenant.id)).toMatchObject({ id: inTenant.id });
      expect(await store.getConnection(ctx, `t-${run()}`, inTenant.id)).toBeNull();
      expect(await store.getConnection(ctx, null, inTenant.id)).toBeNull();
      expect(await store.getConnection(ctx, null, noTenant.id)).toMatchObject({ id: noTenant.id, tenantId: null });
      expect((await store.findConnection(ctx, null, userId, 'acme'))?.id).toBe(noTenant.id);
      expect((await store.listConnections(ctx, null, userId)).map((c) => c.id)).toEqual([noTenant.id]);
      expect(await store.getConnection(ctx, null, 'not-a-uuid')).toBeNull();
    });

    it('finds the newest connection that is not revoked, and lists none that are', async () => {
      const store = await makeStore();
      const owner = { tenantId: `t-${run()}`, userId: `u-${run()}` };
      const older = await store.saveConnection(ctx, fresh({ ...owner, accountId: 'one' }));
      const newer = await store.saveConnection(ctx, fresh({ ...owner, accountId: 'two' }));
      expect((await store.findConnection(ctx, owner.tenantId, owner.userId, 'acme'))?.id).toBe(newer.id);
      await store.updateConnection(ctx, newer.id, { status: 'revoked', accessToken: null, refreshToken: null });
      expect((await store.findConnection(ctx, owner.tenantId, owner.userId, 'acme'))?.id).toBe(older.id);
      expect((await store.listConnections(ctx, owner.tenantId, owner.userId)).map((c) => c.id)).toEqual([older.id]);
      expect(await store.findConnection(ctx, owner.tenantId, owner.userId, 'other')).toBeNull();
    });

    it('updates only the fields given', async () => {
      const store = await makeStore();
      const saved = await store.saveConnection(ctx, fresh());
      const expiresAt = new Date(Date.now() + 60_000);
      const updated = await store.updateConnection(ctx, saved.id, { accessToken: 'mx1:new', expiresAt, scopes: ['read', 'write'] });
      expect(updated).toMatchObject({ accessToken: 'mx1:new', refreshToken: 'mx1:refresh', scopes: ['read', 'write'], status: 'active' });
      expect(updated?.expiresAt?.getTime()).toBe(expiresAt.getTime());
      expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(saved.updatedAt.getTime());
      expect(await store.updateConnection(ctx, crypto.randomUUID(), { status: 'revoked' })).toBeNull();
    });

    it('runs one lock holder at a time per connection, each seeing what the one before wrote', async () => {
      const store = await makeStore();
      const saved = await store.saveConnection(ctx, fresh());
      const order: string[] = [];
      const holder = (label: string) =>
        store.lockConnection(ctx, saved.id, async (current) => {
          order.push(`${label} in:${current?.accessToken}`);
          await new Promise((resolve) => setTimeout(resolve, 30));
          await store.updateConnection(ctx, saved.id, { accessToken: `mx1:${label}` });
          order.push(`${label} out`);
          return label;
        });
      const results = await Promise.all([holder('a'), holder('b')]);
      expect(results).toEqual(['a', 'b']);
      const firstIn = order[0]!.startsWith('a') ? 'a' : 'b';
      const second = firstIn === 'a' ? 'b' : 'a';
      expect(order).toEqual([`${firstIn} in:mx1:access`, `${firstIn} out`, `${second} in:mx1:${firstIn}`, `${second} out`]);
      // A failed holder releases the lock
      await expect(store.lockConnection(ctx, saved.id, async () => { throw new IntegrationError('test/boom', 'boom'); })).rejects.toThrow('boom');
      expect(await store.lockConnection(ctx, saved.id, async (current) => current?.id)).toBe(saved.id);
      expect(await store.lockConnection(ctx, crypto.randomUUID(), async (current) => current)).toBeNull();
    });

    it('hands an authorization out once, and drops the expired ones', async () => {
      const store = await makeStore();
      const nonceHash = `${run()}${run()}`;
      const authorization = { nonceHash, tenantId: null, userId: `u-${run()}`, provider: 'acme', codeVerifier: 'mx1:verifier', expiresAt: new Date(Date.now() + 600_000) };
      await store.saveAuthorization(ctx, authorization);
      const takes = await Promise.all([store.takeAuthorization(ctx, nonceHash), store.takeAuthorization(ctx, nonceHash)]);
      expect(takes.filter(Boolean)).toEqual([authorization]);
      expect(await store.takeAuthorization(ctx, nonceHash)).toBeNull();

      const old = { ...authorization, nonceHash: `${run()}${run()}`, expiresAt: new Date(Date.now() - 1_000) };
      const live = { ...authorization, nonceHash: `${run()}${run()}` };
      await store.saveAuthorization(ctx, old);
      await store.saveAuthorization(ctx, live);
      expect(await store.deleteExpiredAuthorizations(ctx, new Date())).toBeGreaterThanOrEqual(1);
      expect(await store.takeAuthorization(ctx, old.nonceHash)).toBeNull();
      expect(await store.takeAuthorization(ctx, live.nonceHash)).toEqual(live);
    });
  });
}
