import { describe, expect, it } from 'vitest';
import type { SearchClient } from '@mariachi/search';

/** Behavior every `SearchClient` must share: Typesense, the memory adapter and the test double. */
export function searchContract(name: string, create: () => SearchClient | Promise<SearchClient>) {
  describe(`search contract: ${name}`, () => {
    const unique = (base: string) => `${base}_${crypto.randomUUID().slice(0, 8)}`;

    it('indexes, queries, filters and removes documents', async () => {
      const client = await create();
      await client.connect();
      expect(await client.isHealthy()).toBe(true);
      const posts = unique('posts');
      await client.createIndex({
        name: posts,
        fields: [{ name: 'title', type: 'string' }, { name: 'tags', type: 'string[]', facet: true }, { name: 'views', type: 'int32' }],
      });
      await client.indexDocuments(posts, [
        { id: '1', title: 'Mariachi band', tags: ['music', 'a&&b'], views: 10 },
        { id: '2', title: 'Brass section', tags: ['music'], views: 5 },
      ]);
      expect((await client.search(posts, { query: 'mariachi' })).hits.map((h) => h.document.id)).toEqual(['1']);
      expect((await client.search(posts, { query: '*', filters: { tags: 'a&&b' } })).hits.map((h) => h.document.id)).toEqual(['1']);
      expect((await client.search(posts, { query: '*' })).total).toBe(2);
      await client.removeDocument(posts, '1');
      expect((await client.search(posts, { query: 'mariachi' })).total).toBe(0);
      await client.deleteIndex(posts);
    });

    it('sorts by a field and counts facet values over everything that matched', async () => {
      const client = await create();
      await client.connect();
      const products = unique('products');
      await client.createIndex({
        name: products,
        fields: [
          { name: 'name', type: 'string' },
          { name: 'category', type: 'string', facet: true },
          { name: 'tags', type: 'string[]', facet: true },
          { name: 'price', type: 'int32' },
        ],
      });
      await client.indexDocuments(products, [
        { id: 'a', name: 'Trumpet', category: 'brass', tags: ['loud', 'shiny'], price: 300 },
        { id: 'b', name: 'Violin', category: 'strings', tags: ['shiny'], price: 900 },
        { id: 'c', name: 'Guitarron', category: 'strings', tags: ['loud', 'big'], price: 600 },
        { id: 'd', name: 'Vihuela', category: 'strings', tags: ['loud'], price: 450 },
      ]);
      const ids = async (sort: string) => (await client.search(products, { query: '*', sort })).hits.map((h) => h.document.id);
      expect(await ids('price:asc')).toEqual(['a', 'd', 'c', 'b']);
      expect(await ids('price:desc')).toEqual(['b', 'c', 'd', 'a']);

      // Counts cover every match, not just the page returned
      const faceted = await client.search(products, { query: '*', facets: ['category', 'tags'], pageSize: 1, sort: 'price:asc' });
      expect(faceted.hits).toHaveLength(1);
      expect(faceted.total).toBe(4);
      const counts = (field: string) => Object.fromEntries((faceted.facetCounts?.[field] ?? []).map((c) => [c.value, c.count]));
      expect(counts('category')).toEqual({ strings: 3, brass: 1 });
      expect(counts('tags')).toEqual({ loud: 3, shiny: 2, big: 1 });
      expect(faceted.facetCounts?.category?.[0]).toEqual({ value: 'strings', count: 3 });

      // And only the matches: a filter narrows the counts
      const strings = await client.search(products, { query: '*', filters: { category: 'strings' }, facets: ['tags'] });
      expect(Object.fromEntries((strings.facetCounts?.tags ?? []).map((c) => [c.value, c.count]))).toEqual({ loud: 2, shiny: 1, big: 1 });
      // No facets asked for, none returned
      expect((await client.search(products, { query: '*' })).facetCounts ?? {}).toEqual({});
      await client.deleteIndex(products);
    });

    it('rejects unknown field types, duplicate and missing indexes', async () => {
      const client = await create();
      await client.connect();
      // @ts-expect-error an unsupported type must fail at runtime too
      await expect(client.createIndex({ name: unique('bad'), fields: [{ name: 't', type: 'mystery' }] })).rejects.toMatchObject({
        code: 'search/invalid-field-type',
      });
      const metrics = unique('metrics');
      await client.createIndex({ name: metrics, fields: [{ name: 'count', type: 'int32' }] });
      await expect(client.createIndex({ name: metrics, fields: [{ name: 'count', type: 'int32' }] })).rejects.toMatchObject({
        code: 'search/index-exists',
      });
      await expect(client.search(metrics, { query: '1' })).rejects.toMatchObject({ code: 'search/missing-query-fields' });
      await expect(client.search(unique('missing'), { query: 'x', queryBy: ['title'] })).rejects.toMatchObject({ code: 'search/index-not-found' });
      await client.deleteIndex(metrics);
    });

    it('keeps tenants apart through forTenant, when the client has it', async () => {
      const client = await create();
      await client.connect();
      if (!client.forTenant) return;
      const notes = unique('notes');
      const index = { name: notes, fields: [{ name: 'title', type: 'string' as const }, { name: 'kind', type: 'string' as const, facet: true }] };
      await client.createIndex(index);
      const a = client.forTenant('tenant-a');
      const b = client.forTenant('tenant-b');
      await a.indexDocuments(notes, [{ id: '1', title: 'alpha plan', kind: 'plan' }, { id: '2', title: 'alpha memo', kind: 'memo' }]);
      await b.indexDocument(notes, { id: '1', title: 'beta plan', kind: 'plan' });
      expect((await a.search(notes, { query: 'plan' })).hits.map((h) => h.document.title)).toEqual(['alpha plan']);
      expect((await b.search(notes, { query: '*', facets: ['kind'] })).facetCounts?.kind).toEqual([{ value: 'plan', count: 1 }]);
      expect((await b.search(notes, { query: 'alpha' })).total).toBe(0);
      // The client that isn't tenant-scoped holds its own documents, not everyone's
      expect((await client.search(notes, { query: '*' })).total).toBe(0);
      await b.removeDocument(notes, '2');
      expect((await a.search(notes, { query: '*' })).total).toBe(2);
      if (b.reindexAlias) {
        await b.reindexAlias(notes, index, []);
        expect((await b.search(notes, { query: '*' })).total).toBe(0);
        expect((await a.search(notes, { query: '*' })).total).toBe(2);
      }
      await expect(a.deleteIndex(notes)).rejects.toMatchObject({ code: 'search/invalid-input' });
      expect(() => client.forTenant?.('')).toThrow();
      await client.deleteIndex(notes);
    });

    it('swaps an alias to a rebuilt index', async () => {
      const client = await create();
      await client.connect();
      if (!client.reindexAlias) return;
      const alias = unique('products');
      const index = { name: alias, fields: [{ name: 'title', type: 'string' as const }] };
      await client.reindexAlias(alias, index, [{ id: '1', title: 'hat' }]);
      await client.reindexAlias(alias, index, [{ id: '2', title: 'scarf' }]);
      expect((await client.search(alias, { query: 'hat' })).total).toBe(0);
      expect((await client.search(alias, { query: 'scarf' })).total).toBe(1);
    });
  });
}
