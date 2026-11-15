import { DatabaseError, NotFoundError, ValidationError, type Context } from '@mariachi/core';
import type { CursorPaginatedResult, CursorPaginationParams, Entity, FilterCondition, FindOptions, PaginatedResult, PaginationParams, QueryFilter, Repository, SortParams } from '../types';

/** SQL LIKE as a regular expression: `%` is any run of characters, `_` exactly one. */
function likePattern(pattern: string, caseInsensitive: boolean): RegExp {
  const source = [...pattern].map((ch) => (ch === '%' ? '[\\s\\S]*' : ch === '_' ? '[\\s\\S]' : ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('');
  return new RegExp(`^${source}$`, caseInsensitive ? 'i' : '');
}

/**
 * An in-memory `Repository` that refuses what the Postgres one refuses. With `tenantColumn` set it
 * is tenant-scoped the same way: every operation needs `ctx.tenantId` (`database/tenant-required`),
 * a row can't be written for another tenant (`database/tenant-mismatch`), and only `crossTenant()`
 * reads across tenants. Rows with `deletedAt` set are hidden from reads and updates. The shared
 * `repositoryContract` runs against both.
 */
export class TestRepository<T extends Entity> implements Repository<T> {
  private store: T[] = [];
  private readonly tenantColumn?: string;
  private readonly resourceName: string;
  private allowCrossTenant = false;

  constructor(options?: { tenantColumn?: string; resourceName?: string }) {
    this.tenantColumn = options?.tenantColumn;
    this.resourceName = options?.resourceName ?? 'Entity';
  }

  /**
   * A view of this repository, over the same rows, that doesn't scope by tenant. As with the real
   * one, every use should be deliberate (admin tooling, cross-tenant jobs).
   */
  crossTenant(): this {
    const clone = Object.create(Object.getPrototypeOf(this)) as this;
    Object.assign(clone, this, { allowCrossTenant: true });
    return clone;
  }

  private filterByContext(ctx: Context, items: T[]): T[] {
    if (!this.tenantColumn || this.allowCrossTenant) return items;
    // Fails closed: without a tenant the real repository refuses, it doesn't read every tenant's rows
    if (!ctx.tenantId) throw new DatabaseError('database/tenant-required', 'Query on tenant-scoped table requires ctx.tenantId');
    const column = this.tenantColumn;
    return items.filter((item) => (item as Record<string, unknown>)[column] === ctx.tenantId);
  }

  private isFilterConditions(filter: QueryFilter<T>): filter is FilterCondition[] {
    return Array.isArray(filter);
  }

  private matchesFilter(item: T, filter?: QueryFilter<T>): boolean {
    if (!filter) return true;

    if (this.isFilterConditions(filter)) {
      return filter.every((cond) => {
        const val = (item as Record<string, unknown>)[cond.field];
        switch (cond.op) {
          // As in SQL: null is matched with IS NULL, and a comparison with a missing value is never true
          case 'eq': return cond.value === null ? val == null : val != null && val === cond.value;
          case 'neq': return cond.value === null ? val != null : val != null && val !== cond.value;
          case 'gt': return val != null && (val as any) > (cond.value as any);
          case 'gte': return val != null && (val as any) >= (cond.value as any);
          case 'lt': return val != null && (val as any) < (cond.value as any);
          case 'lte': return val != null && (val as any) <= (cond.value as any);
          case 'in': return Array.isArray(cond.value) && cond.value.length > 0 && val != null && cond.value.includes(val);
          case 'notIn': return !Array.isArray(cond.value) || cond.value.length === 0 || (val != null && !cond.value.includes(val));
          case 'like': return typeof val === 'string' && likePattern(String(cond.value), false).test(val);
          case 'ilike': return typeof val === 'string' && likePattern(String(cond.value), true).test(val);
          case 'isNull': return val == null;
          case 'isNotNull': return val != null;
          default: throw new ValidationError(`Unknown filter op ${(cond as FilterCondition).op}`);
        }
      });
    }

    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined) continue;
      const itemVal = (item as Record<string, unknown>)[key];
      if (value === null ? itemVal != null : itemVal !== value) return false;
    }
    return true;
  }

  private excludeDeleted(items: T[]): T[] {
    return items.filter((i) => {
      const deletedAt = (i as Record<string, unknown>).deletedAt;
      return deletedAt === undefined || deletedAt === null;
    });
  }

  private applySort(items: T[], sort?: SortParams): T[] {
    if (!sort) return items;
    const field = sort.field;
    const direction = sort.direction === 'desc' ? -1 : 1;
    return [...items].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[field];
      const bVal = (b as Record<string, unknown>)[field];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return direction;
      if (bVal == null) return -direction;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction * aVal.localeCompare(bVal);
      }
      if (aVal instanceof Date && bVal instanceof Date) {
        return direction * (aVal.getTime() - bVal.getTime());
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction * (aVal - bVal);
      }
      return 0;
    });
  }

  async findById(ctx: Context, id: string): Promise<T | null> {
    const filtered = this.excludeDeleted(this.filterByContext(ctx, this.store));
    const item = filtered.find((i) => i.id === id);
    return item ?? null;
  }

  async findMany(ctx: Context, filter?: QueryFilter<T>, sort?: SortParams | FindOptions): Promise<T[]> {
    let items = this.excludeDeleted(this.filterByContext(ctx, this.store));
    items = items.filter((i) => this.matchesFilter(i, filter));
    const resolved = sort && 'field' in sort ? sort : Array.isArray(sort?.sort) ? sort.sort[0] : sort?.sort;
    return this.applySort(items, resolved);
  }

  async create(ctx: Context, data: Partial<T>): Promise<T> {
    const row = { ...data } as Record<string, unknown>;
    if (this.tenantColumn && !this.allowCrossTenant) {
      if (!ctx.tenantId) throw new DatabaseError('database/tenant-required', 'Insert into tenant-scoped table requires ctx.tenantId');
      if (row[this.tenantColumn] !== undefined && row[this.tenantColumn] !== ctx.tenantId) {
        throw new DatabaseError('database/tenant-mismatch', 'Cannot insert a row for another tenant');
      }
      row[this.tenantColumn] = ctx.tenantId;
    }
    const entity = { ...row, id: crypto.randomUUID() } as T;
    this.store.push(entity);
    return entity;
  }

  async update(ctx: Context, id: string, data: Partial<Omit<T, 'id'>>): Promise<T> {
    const visible = this.excludeDeleted(this.filterByContext(ctx, this.store));
    const idx = this.store.findIndex((i) => i.id === id && visible.includes(i));
    if (idx === -1) throw new NotFoundError(this.resourceName, id);
    // A row never changes its id or its tenant through an update
    const patch = Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'id' && key !== this.tenantColumn));
    const updated = { ...this.store[idx], ...patch } as T;
    this.store[idx] = updated;
    return updated;
  }

  async softDelete(ctx: Context, id: string): Promise<void> {
    const item = this.excludeDeleted(this.filterByContext(ctx, this.store)).find((i) => i.id === id);
    if (!item) throw new NotFoundError(this.resourceName, id);
    (item as Record<string, unknown>).deletedAt = new Date();
  }

  async hardDelete(ctx: Context, id: string): Promise<void> {
    const filtered = this.filterByContext(ctx, this.store);
    const idx = this.store.findIndex((i) => i.id === id && filtered.includes(i));
    if (idx === -1) throw new NotFoundError(this.resourceName, id);
    this.store.splice(idx, 1);
  }

  async paginate(
    ctx: Context,
    params: PaginationParams,
    filter?: QueryFilter<T>,
    sort?: SortParams,
  ): Promise<PaginatedResult<T>> {
    let items = this.excludeDeleted(this.filterByContext(ctx, this.store));
    items = items.filter((i) => this.matchesFilter(i, filter));
    items = this.applySort(items, sort);
    const total = items.length;
    const offset = (params.page - 1) * params.pageSize;
    const data = items.slice(offset, offset + params.pageSize);
    const totalPages = Math.ceil(total / params.pageSize) || 1;
    return {
      data,
      total,
      page: params.page,
      pageSize: params.pageSize,
      totalPages,
    };
  }

  async count(ctx: Context, filter?: QueryFilter<T>): Promise<number> {
    let items = this.excludeDeleted(this.filterByContext(ctx, this.store));
    items = items.filter((i) => this.matchesFilter(i, filter));
    return items.length;
  }

  async getById(ctx: Context, id: string): Promise<T> {
    const item = await this.findById(ctx, id);
    if (!item) throw new NotFoundError(this.resourceName, id);
    return item;
  }

  async findOne(ctx: Context, filter: QueryFilter<T>): Promise<T | null> {
    const [first] = await this.findMany(ctx, filter);
    return first ?? null;
  }

  async exists(ctx: Context, filter: QueryFilter<T>): Promise<boolean> {
    return (await this.count(ctx, filter)) > 0;
  }

  async createMany(ctx: Context, data: Partial<T>[]): Promise<T[]> {
    const created: T[] = [];
    for (const row of data) created.push(await this.create(ctx, row));
    return created;
  }

  async updateWhere(ctx: Context, filter: QueryFilter<T>, data: Partial<Omit<T, 'id'>>): Promise<number> {
    const matches = await this.findMany(ctx, filter);
    for (const item of matches) await this.update(ctx, item.id, data);
    return matches.length;
  }

  async restore(ctx: Context, id: string): Promise<T> {
    const item = this.filterByContext(ctx, this.store).find((i) => i.id === id);
    if (!item) throw new NotFoundError(this.resourceName, id);
    (item as Record<string, unknown>).deletedAt = null;
    return item;
  }

  async paginateCursor(ctx: Context, params: CursorPaginationParams, filter?: QueryFilter<T>, sort?: SortParams): Promise<CursorPaginatedResult<T>> {
    let items = this.excludeDeleted(this.filterByContext(ctx, this.store)).filter((i) => this.matchesFilter(i, filter));
    items = this.applySort(items, sort);
    const start = params.cursor ? Number(Buffer.from(params.cursor, 'base64url').toString('utf8')) : 0;
    const data = items.slice(start, start + params.limit);
    const next = start + data.length;
    return { data, nextCursor: next < items.length ? Buffer.from(String(next)).toString('base64url') : null, hasMore: next < items.length };
  }

  async deleteWhere(ctx: Context, filter: QueryFilter<T>, options?: { hard?: boolean }): Promise<number> {
    const filtered = this.filterByContext(ctx, this.store);
    const toDelete = filtered.filter((i) => this.matchesFilter(i, filter));
    let count = 0;
    for (const item of toDelete) {
      if (options?.hard) {
        const idx = this.store.indexOf(item);
        if (idx !== -1) {
          this.store.splice(idx, 1);
          count++;
        }
      } else {
        (item as Record<string, unknown>).deletedAt = new Date();
        count++;
      }
    }
    return count;
  }
}
