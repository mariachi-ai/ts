import { describe, expect, it } from 'vitest';
import { MemorySearchAdapter } from './adapters/memory';
import { createContext } from '@mariachi/core';
import { createSearch, DefaultSearch } from './index';
import { MemorySearchAnalytics, RedisListAnalytics } from './analytics';

describe('createSearch', () => {
  it('says how the Postgres adapter is built, since a config object cannot carry the database', () => {
    expect(() => createSearch({ adapter: 'postgres' })).toThrow(/createPostgresSearch\(db\) from '@mariachi\/search\/postgres'/);
    expect(() => createSearch({ adapter: 'elastic' })).toThrow(/Unknown search adapter/);
    expect(createSearch({ adapter: 'memory' })).toBeInstanceOf(MemorySearchAdapter);
  });
});

describe('MemorySearchAdapter', () => {
  it('refuses a query when the schema has no string fields and no queryBy', async () => {
    const search = new MemorySearchAdapter();
    await search.connect();
    await search.createIndex({ name: 'counts', fields: [{ name: 'n', type: 'int' }] });
    await expect(search.search('counts', { query: '1' })).rejects.toMatchObject({ code: 'search/missing-query-fields' });
  });

  it('replaces an index\'s documents on reindex, creating the index when it is new', async () => {
    const search = new MemorySearchAdapter();
    await search.connect();
    await search.reindexAlias('products', { name: 'products', fields: [{ name: 'title', type: 'string' }] }, [{ id: '1', title: 'hat' }]);
    const result = await search.search('products', { query: 'hat' });
    expect(result.total).toBe(1);
    expect(await search.isHealthy()).toBe(true);
    await search.reindexAlias('products', { name: 'products', fields: [{ name: 'title', type: 'string' }] }, [{ id: '2', title: 'scarf' }]);
    expect((await search.search('products', { query: 'hat' })).total).toBe(0);
    expect((await search.search('products', { query: 'scarf' })).total).toBe(1);
  });
});

describe('DefaultSearch with tenantScoped', () => {
  const ctx = (tenantId: string | null) => createContext({ tenantId, logger: silent });
  const silent = { info() {}, warn() {}, error() {}, debug() {}, child: () => silent };
  const index = { name: 'notes', fields: [{ name: 'title', type: 'string' as const }] };

  it('reads and writes only the documents of the tenant in the context', async () => {
    const client = new MemorySearchAdapter();
    await client.createIndex(index);
    const search = new DefaultSearch({ client, tenantScoped: true }, { logger: silent });
    await search.indexDocument(ctx('a'), 'notes', { id: '1', title: 'for a' });
    await search.indexDocument(ctx('b'), 'notes', { id: '1', title: 'for b' });
    expect((await search.search<{ title: string }>(ctx('a'), 'notes', { query: '*' })).hits.map((h) => h.document.title)).toEqual(['for a']);
    // A filter naming another tenant finds nothing: the scope isn't a filter a query can change
    expect((await search.search(ctx('a'), 'notes', { query: 'b' })).total).toBe(0);
    await search.removeDocument(ctx('b'), 'notes', '1');
    expect((await search.search(ctx('a'), 'notes', { query: '*' })).total).toBe(1);
    expect((await search.search(ctx('b'), 'notes', { query: '*' })).total).toBe(0);
  });

  it('refuses a call without a tenant, and a client that cannot keep tenants apart', async () => {
    const client = new MemorySearchAdapter();
    await client.createIndex(index);
    const search = new DefaultSearch({ client, tenantScoped: true }, { logger: silent });
    await expect(search.search(ctx(null), 'notes', { query: '*' })).rejects.toMatchObject({ code: 'search/tenant-required' });
    await expect(search.indexDocument(ctx(null), 'notes', { id: '1', title: 'x' })).rejects.toMatchObject({ code: 'search/tenant-required' });
    await expect(search.removeDocument(ctx(''), 'notes', '1')).rejects.toMatchObject({ code: 'search/tenant-required' });
    // A client with no forTenant, as the Typesense adapter is
    const withoutTenants = { search: client.search.bind(client) };
    expect(() => new DefaultSearch({ client: withoutTenants as never, tenantScoped: true }, { logger: silent })).toThrow(/keeps tenants apart/);
  });

  it('is not tenant-scoped unless asked: one set of documents, as before', async () => {
    const client = new MemorySearchAdapter();
    await client.createIndex(index);
    const search = new DefaultSearch({ client }, { logger: silent });
    await search.indexDocument(ctx('a'), 'notes', { id: '1', title: 'shared' });
    expect((await search.search(ctx('b'), 'notes', { query: '*' })).total).toBe(1);
    expect((await search.search(ctx(null), 'notes', { query: '*' })).total).toBe(1);
  });
});

describe('RedisListAnalytics', () => {
  it('stores entries on the list client', async () => {
    const lines: string[] = [];
    const analytics = new RedisListAnalytics({
      async lpush(_key, value) { lines.unshift(value); },
      async ltrim() {},
      async lrange() { return lines; },
    });
    await analytics.record({ query: 'hat', index: 'products', totalHits: 1, latencyMs: 2, timestamp: new Date('2026-01-01') });
    expect((await analytics.recent('products'))[0]?.query).toBe('hat');
    const memory = new MemorySearchAnalytics();
    await memory.record({ query: 'q', index: 'products', totalHits: 0, latencyMs: 1, timestamp: new Date() });
    expect(memory.entries).toHaveLength(1);
  });
});

describe('buildFilterBy', () => {
  it('quotes string values and rejects unsafe input', async () => {
    const { buildFilterBy } = await import('./adapters/typesense');
    expect(buildFilterBy({ tag: 'a && b', n: 3, on: true })).toBe('tag:=`a && b` && n:=3 && on:=true');
    expect(() => buildFilterBy({ tag: 'x`y' })).toThrow(expect.objectContaining({ code: 'search/invalid-input' }));
    expect(() => buildFilterBy({ 'a || b': 'x' })).toThrow(expect.objectContaining({ code: 'search/invalid-input' }));
  });
});
