import { describe, expect, it } from 'vitest';
import { createContext, type Context } from '@mariachi/core';
import type { Repository } from '@mariachi/database';

/** The entity the contract runs on: tenant-scoped (`tenantId`) and soft-deleted (`deletedAt`). */
export interface ContractNote {
  id: string;
  tenantId: string;
  name: string;
  score: number | null;
  deletedAt?: Date | null;
}

export type ContractRepository = Repository<ContractNote> & { crossTenant(): Repository<ContractNote> };

const logger = { info() {}, warn() {}, error() {}, debug() {}, child: () => logger };
const code = async (work: Promise<unknown>): Promise<string | undefined> => {
  try {
    await work;
  } catch (error) {
    return (error as { code?: string }).code;
  }
  return undefined;
};

/**
 * Behaviour every tenant-scoped, soft-deleting `Repository` must share: the Postgres repository and
 * `TestRepository`. A service tested against the double must meet the same refusals it will meet
 * in production, above all a missing tenant.
 */
export function repositoryContract(name: string, create: () => ContractRepository | Promise<ContractRepository>) {
  // Tenants of this run's own, so a table shared between runs doesn't matter
  const run = crypto.randomUUID().slice(0, 8);
  const ctx = (tenant: string | null): Context => createContext({ logger, tenantId: tenant ? `${tenant}-${run}` : null, userId: 'u1' });
  const a = () => ctx(`a-${crypto.randomUUID().slice(0, 6)}`);

  describe(`repository contract: ${name}`, () => {
    it('writes into the caller\'s tenant and reads only from it', async () => {
      const repo = await create();
      const [one, two] = [a(), a()];
      const note = await repo.create(one, { name: 'mine', score: 1 });
      expect(note).toMatchObject({ name: 'mine', score: 1, tenantId: one.tenantId });
      expect(note.id).toBeTruthy();
      await repo.create(two, { name: 'theirs', score: 2 });

      expect((await repo.findMany(one)).map((n) => n.name)).toEqual(['mine']);
      expect(await repo.findById(two, note.id)).toBeNull();
      expect(await repo.count(two, { name: 'mine' })).toBe(0);
      expect(await repo.exists(two, { name: 'mine' })).toBe(false);
      expect(await code(repo.getById(two, note.id))).toBe('not-found');
      expect(await code(repo.update(two, note.id, { name: 'taken' }))).toBe('not-found');
      expect(await code(repo.softDelete(two, note.id))).toBe('not-found');
      expect(await code(repo.hardDelete(two, note.id))).toBe('not-found');
      expect((await repo.getById(one, note.id)).name).toBe('mine');
    });

    it('refuses every operation without a tenant, instead of running it across all of them', async () => {
      const repo = await create();
      const one = a();
      const note = await repo.create(one, { name: 'x', score: 1 });
      const nobody = ctx(null);
      const attempts: Array<Promise<unknown>> = [
        repo.findMany(nobody),
        repo.findById(nobody, note.id),
        repo.findOne(nobody, { name: 'x' }),
        repo.count(nobody),
        repo.exists(nobody, { name: 'x' }),
        repo.paginate(nobody, { page: 1, pageSize: 10 }),
        repo.create(nobody, { name: 'y', score: 1 }),
        repo.update(nobody, note.id, { name: 'z' }),
        repo.softDelete(nobody, note.id),
        repo.hardDelete(nobody, note.id),
        repo.updateWhere(nobody, { name: 'x' }, { score: 9 }),
        repo.deleteWhere(nobody, { name: 'x' }),
      ];
      for (const attempt of attempts) expect(await code(attempt)).toBe('database/tenant-required');
      expect(await repo.getById(one, note.id)).toMatchObject({ name: 'x', score: 1 });
    });

    it('refuses a row written for another tenant, and never moves a row between tenants or changes its id', async () => {
      const repo = await create();
      const [one, two] = [a(), a()];
      expect(await code(repo.create(one, { name: 'x', score: 1, tenantId: two.tenantId as string }))).toBe('database/tenant-mismatch');
      const note = await repo.create(one, { name: 'x', score: 1, tenantId: one.tenantId as string });
      const updated = await repo.update(one, note.id, { name: 'renamed', tenantId: two.tenantId as string, ...({ id: crypto.randomUUID() } as object) });
      expect(updated).toMatchObject({ id: note.id, tenantId: one.tenantId, name: 'renamed' });
      expect(await repo.findMany(two)).toEqual([]);
    });

    it('hides a soft-deleted row from reads and updates, restores it, and removes a hard-deleted one', async () => {
      const repo = await create();
      const one = a();
      const note = await repo.create(one, { name: 'x', score: 1 });
      await repo.softDelete(one, note.id);
      expect(await repo.findById(one, note.id)).toBeNull();
      expect(await repo.findMany(one)).toEqual([]);
      expect(await repo.count(one)).toBe(0);
      expect(await code(repo.update(one, note.id, { name: 'ghost' }))).toBe('not-found');

      expect((await repo.restore(one, note.id)).deletedAt ?? null).toBeNull();
      expect((await repo.getById(one, note.id)).name).toBe('x');

      await repo.hardDelete(one, note.id);
      expect(await repo.findById(one, note.id)).toBeNull();
      expect(await code(repo.restore(one, note.id))).toBe('not-found');
      expect(await code(repo.hardDelete(one, note.id))).toBe('not-found');
    });

    it('applies every filter operator the way SQL does', async () => {
      const repo = await create();
      const one = a();
      await repo.createMany(one, [
        { name: 'alpha', score: 1 },
        { name: 'Beta', score: 2 },
        { name: 'gamma', score: 3 },
        { name: 'delta_x', score: null },
      ]);
      const names = async (filter: Parameters<ContractRepository['findMany']>[1]) => (await repo.findMany(one, filter, { field: 'name', direction: 'asc' })).map((n) => n.name).sort();

      expect(await names([{ field: 'score', op: 'eq', value: 2 }])).toEqual(['Beta']);
      expect(await names([{ field: 'score', op: 'neq', value: 2 }])).toEqual(['alpha', 'gamma']);
      expect(await names([{ field: 'score', op: 'gt', value: 1 }])).toEqual(['Beta', 'gamma']);
      expect(await names([{ field: 'score', op: 'gte', value: 2 }])).toEqual(['Beta', 'gamma']);
      expect(await names([{ field: 'score', op: 'lt', value: 2 }])).toEqual(['alpha']);
      expect(await names([{ field: 'score', op: 'lte', value: 2 }])).toEqual(['Beta', 'alpha']);
      expect(await names([{ field: 'name', op: 'in', value: ['alpha', 'gamma', 'nope'] }])).toEqual(['alpha', 'gamma']);
      // An empty list matches nothing for `in` and everything for `notIn`
      expect(await names([{ field: 'name', op: 'in', value: [] }])).toEqual([]);
      expect(await names([{ field: 'name', op: 'notIn', value: [] }])).toEqual(['Beta', 'alpha', 'delta_x', 'gamma']);
      expect(await names([{ field: 'name', op: 'notIn', value: ['alpha', 'gamma'] }])).toEqual(['Beta', 'delta_x']);
      // % is any run of characters, _ exactly one; like is case-sensitive, ilike isn't
      expect(await names([{ field: 'name', op: 'like', value: '%a' }])).toEqual(['Beta', 'alpha', 'gamma']);
      expect(await names([{ field: 'name', op: 'like', value: 'b%' }])).toEqual([]);
      expect(await names([{ field: 'name', op: 'ilike', value: 'b%' }])).toEqual(['Beta']);
      expect(await names([{ field: 'name', op: 'like', value: '_amma' }])).toEqual(['gamma']);
      expect(await names([{ field: 'name', op: 'like', value: 'delta%' }])).toEqual(['delta_x']);
      expect(await names([{ field: 'score', op: 'isNull' }])).toEqual(['delta_x']);
      expect(await names([{ field: 'score', op: 'isNotNull' }])).toEqual(['Beta', 'alpha', 'gamma']);
      // null means IS NULL, for an operator and in an object filter; undefined is "not asked"
      expect(await names([{ field: 'score', op: 'eq', value: null }])).toEqual(['delta_x']);
      expect(await names([{ field: 'score', op: 'neq', value: null }])).toEqual(['Beta', 'alpha', 'gamma']);
      expect(await names({ score: null })).toEqual(['delta_x']);
      expect(await names({ name: 'alpha', score: undefined })).toEqual(['alpha']);
      // Conditions are ANDed
      expect(await names([{ field: 'score', op: 'gte', value: 2 }, { field: 'name', op: 'like', value: 'g%' }])).toEqual(['gamma']);
    });

    it('refuses an operator it does not know, instead of matching every row', async () => {
      const repo = await create();
      const one = a();
      await repo.create(one, { name: 'x', score: 1 });
      expect(await code(repo.findMany(one, [{ field: 'name', op: 'matches' as never, value: 'x' }]))).toBe('validation/invalid-input');
    });

    it('sorts, pages and counts within the tenant', async () => {
      const repo = await create();
      const one = a();
      await repo.createMany(one, [{ name: 'b', score: 2 }, { name: 'a', score: 3 }, { name: 'c', score: 1 }]);
      expect((await repo.findMany(one, undefined, { field: 'name', direction: 'asc' })).map((n) => n.name)).toEqual(['a', 'b', 'c']);
      expect((await repo.findMany(one, undefined, { field: 'score', direction: 'desc' })).map((n) => n.name)).toEqual(['a', 'b', 'c']);
      const page = await repo.paginate(one, { page: 2, pageSize: 2 }, undefined, { field: 'name', direction: 'asc' });
      expect(page).toMatchObject({ total: 3, page: 2, pageSize: 2, totalPages: 2 });
      expect(page.data.map((n) => n.name)).toEqual(['c']);
      expect(await repo.count(one, [{ field: 'score', op: 'gte', value: 2 }])).toBe(2);
      expect((await repo.findOne(one, { name: 'b' }))?.score).toBe(2);
    });

    it('reads across tenants only through crossTenant()', async () => {
      const repo = await create();
      const [one, two] = [a(), a()];
      await repo.create(one, { name: `shared-${run}`, score: 1 });
      await repo.create(two, { name: `shared-${run}`, score: 2 });
      const all = repo.crossTenant();
      const seen = await all.findMany(ctx(null), { name: `shared-${run}` });
      expect(seen.map((n) => n.tenantId).sort()).toEqual([one.tenantId, two.tenantId].sort());
      // The scoped repository it came from is still scoped
      expect(await code(repo.findMany(ctx(null), { name: `shared-${run}` }))).toBe('database/tenant-required');
    });
  });
}
