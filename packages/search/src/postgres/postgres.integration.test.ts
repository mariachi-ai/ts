import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { sql } from 'drizzle-orm';
import type { Context } from '@mariachi/core';
import { applySchema, createPostgresDatabase, withTransaction, type PostgresDatabase } from '@mariachi/database-postgres';
import { startPostgres, stopAll } from '../../../../test/setup';
import type { SearchIndex } from '../types';
import { createPostgresSearch, PostgresSearchAdapter, searchDocumentsTable, searchIndexesTable, searchIndexStatements } from './index';

let database: PostgresDatabase;
let search: PostgresSearchAdapter;
const ctx = {} as Context;
const unique = (base: string) => `${base}_${crypto.randomUUID().slice(0, 8)}`;
const rows = <T>(result: unknown): T[] => (Array.isArray(result) ? (result as T[]) : ((result as { rows: T[] }).rows ?? []));

beforeAll(async () => {
  database = createPostgresDatabase({ url: await startPostgres() });
  await database.connect();
  await applySchema(database.db, [searchIndexesTable, searchDocumentsTable]);
  search = createPostgresSearch(database.db);
  await search.connect();
}, 180_000);

afterAll(async () => {
  await database?.disconnect();
  await stopAll();
});

const articles = (name: string): SearchIndex => ({
  name,
  fields: [
    { name: 'title', type: 'string' },
    { name: 'body', type: 'string' },
    { name: 'tags', type: 'string[]', facet: true },
    { name: 'code', type: 'string', index: false },
    { name: 'views', type: 'int32' },
    { name: 'published', type: 'bool' },
    { name: 'section', type: 'string', facet: true },
  ],
});

async function seeded(): Promise<string> {
  const name = unique('articles');
  await search.createIndex(articles(name));
  await search.indexDocuments(name, [
    { id: '1', title: 'Mariachi band plays downtown', body: 'Trumpets and violins on the plaza.', tags: ['music', 'live'], code: 'ZX-100', views: 40, published: true, section: 'culture' },
    { id: '2', title: 'Brass section rehearsal', body: 'The band tunes its trumpets.', tags: ['music'], code: 'ZX-200', views: 15, published: false, section: 'culture' },
    { id: '3', title: 'City budget vote', body: 'Council members argue about the plaza.', tags: ['politics', "it's"], code: 'QQ-300', views: 90, published: true, section: 'news' },
  ]);
  return name;
}
const ids = async (name: string, query: Parameters<PostgresSearchAdapter['search']>[1]) => (await search.search(name, query)).hits.map((h) => h.document.id);

describe('PostgresSearchAdapter', () => {
  it('matches whole words in any order and case, with the last word as a prefix', async () => {
    const name = await seeded();
    expect(await ids(name, { query: 'mariachi' })).toEqual(['1']);
    expect(await ids(name, { query: 'MARIACHI' })).toEqual(['1']);
    // Search as you type: the word being typed is a prefix
    expect(await ids(name, { query: 'maria' })).toEqual(['1']);
    expect(await ids(name, { query: 'downtown band mari' })).toEqual(['1']);
    // A finished word is a whole word: "ban" before another word is not "band"
    expect(await ids(name, { query: 'ban mariachi' })).toEqual([]);
    // Every word must be there
    expect((await ids(name, { query: 'band' })).sort()).toEqual(['1', '2']);
    expect(await ids(name, { query: 'band budget' })).toEqual([]);
    // Across fields, and into a list field
    expect(await ids(name, { query: 'plaza council' })).toEqual(['3']);
    expect(await ids(name, { query: 'politics' })).toEqual(['3']);
    expect((await search.search(name, { query: '' })).total).toBe(3);
  });

  it('treats everything typed as words: no operator, quote or SQL in a query does anything', async () => {
    const name = await seeded();
    for (const query of ["mariachi & !band | (", "'; drop table mariachi_search_documents; --", 'band:* <-> "x', '\\', "''", '!!!', 'a\\\'b', '%', '   ']) {
      await expect(search.search(name, { query }), query).resolves.toBeDefined();
    }
    expect((await search.search(name, { query: '!!!' })).total).toBe(0);
    // Punctuation between words is a separator, as it was when the document was stored
    expect(await ids(name, { query: 'mariachi, band!' })).toEqual(['1']);
    expect(await ids(name, { query: "it's" })).toEqual(['3']);
    expect((await search.search(name, { query: '*' })).total).toBe(3);
  });

  it('searches only the fields asked for, including one kept out of the stored text', async () => {
    const name = await seeded();
    expect((await ids(name, { query: 'trumpets' })).sort()).toEqual(['1', '2']);
    expect(await ids(name, { query: 'trumpets', queryBy: ['title'] })).toEqual([]);
    expect((await ids(name, { query: 'trumpets', queryBy: ['body'] })).sort()).toEqual(['1', '2']);
    expect(await ids(name, { query: 'plaza', queryBy: ['title', 'body'] })).toEqual(expect.arrayContaining(['1', '3']));
    // `index: false` keeps a field out of the default search; naming it searches it
    expect(await ids(name, { query: 'zx' })).toEqual([]);
    expect((await ids(name, { query: 'zx', queryBy: ['code'] })).sort()).toEqual(['1', '2']);
  });

  it('filters by equality on text, numbers, booleans and list membership', async () => {
    const name = await seeded();
    expect((await ids(name, { query: '*', filters: { section: 'culture' } })).sort()).toEqual(['1', '2']);
    expect(await ids(name, { query: '*', filters: { views: 90 } })).toEqual(['3']);
    expect(await ids(name, { query: '*', filters: { published: false } })).toEqual(['2']);
    expect((await ids(name, { query: '*', filters: { tags: 'music' } })).sort()).toEqual(['1', '2']);
    expect(await ids(name, { query: '*', filters: { tags: "it's" } })).toEqual(['3']);
    expect(await ids(name, { query: 'band', filters: { tags: 'live', published: true } })).toEqual(['1']);
    // A string that looks like a number is not that number
    expect(await ids(name, { query: '*', filters: { views: '90' } })).toEqual([]);
    expect(await ids(name, { query: '*', filters: { section: '" or 1=1 --' } })).toEqual([]);
    await expect(search.search(name, { query: '*', filters: { 'section; drop': 'x' } })).rejects.toMatchObject({ code: 'search/invalid-input' });
  });

  it('filters on a field the index does not declare, nested or not', async () => {
    const name = unique('events');
    await search.createIndex({ name, fields: [{ name: 'title', type: 'string' }] });
    await search.indexDocuments(name, [
      { id: 'a', title: 'one', tenantId: 't1', owner: { team: 'red' }, labels: ['x', 'y'] },
      { id: 'b', title: 'two', tenantId: 't2', owner: { team: 'blue' }, labels: ['y'] },
    ]);
    expect(await ids(name, { query: '*', filters: { tenantId: 't1' } })).toEqual(['a']);
    expect(await ids(name, { query: '*', filters: { 'owner.team': 'blue' } })).toEqual(['b']);
    expect(await ids(name, { query: '*', filters: { labels: 'x' } })).toEqual(['a']);
  });

  it('orders by relevance, then the default sorting field, and by any declared field on request', async () => {
    const name = unique('ranked');
    await search.createIndex({
      name,
      fields: [{ name: 'title', type: 'string' }, { name: 'rank', type: 'int32' }, { name: 'live', type: 'bool' }, { name: 'tags', type: 'string[]' }],
      defaultSortingField: 'rank',
    });
    await search.indexDocuments(name, [
      { id: 'low', title: 'guitar', rank: 1, live: true },
      { id: 'high', title: 'guitar', rank: 9, live: false },
      { id: 'twice', title: 'guitar guitar guitar', rank: 5, live: true },
      { id: 'none', title: 'guitar' },
    ]);
    // More mentions rank first; equal relevance falls to the default sorting field, highest first, absent last
    expect(await ids(name, { query: 'guitar' })).toEqual(['twice', 'high', 'low', 'none']);
    expect(await ids(name, { query: '*' })).toEqual(['high', 'twice', 'low', 'none']);
    expect(await ids(name, { query: '*', sort: 'rank:asc' })).toEqual(['low', 'twice', 'high', 'none']);
    expect(await ids(name, { query: '*', sort: 'live:desc,rank:desc' })).toEqual(['twice', 'low', 'high', 'none']);
    expect(await ids(name, { query: '*', sort: 'title:desc, rank:asc' })).toEqual(['twice', 'low', 'high', 'none']);
    for (const sort of ['rank', 'rank:up', 'missing:asc', 'tags:asc', 'rank:asc; drop table x']) {
      await expect(search.search(name, { query: '*', sort }), sort).rejects.toMatchObject({ code: 'search/invalid-input' });
    }
    await expect(search.createIndex({ name: unique('bad'), fields: [{ name: 'title', type: 'string' }], defaultSortingField: 'title' })).rejects.toMatchObject({
      code: 'search/invalid-input',
    });
  });

  it('marks the matched words in the fields searched', async () => {
    const name = await seeded();
    const [hit] = (await search.search(name, { query: 'downtown maria' })).hits;
    expect(hit?.highlights?.title).toBe('<mark>Mariachi</mark> band plays <mark>downtown</mark>');
    expect(hit?.highlights?.body).toBeUndefined();
    expect(hit?.score).toBeGreaterThan(0);
    expect((await search.search(name, { query: '*' })).hits[0]?.highlights).toBeUndefined();
  });

  it('pages, and still counts on a page past the end', async () => {
    const name = unique('many');
    await search.createIndex({ name, fields: [{ name: 'title', type: 'string' }, { name: 'n', type: 'int32' }, { name: 'parity', type: 'string', facet: true }] });
    // More than one insert batch
    await search.indexDocuments(name, Array.from({ length: 1203 }, (_, n) => ({ id: `d${n}`, title: `item number ${n}`, n, parity: n % 2 ? 'odd' : 'even' })));
    const first = await search.search(name, { query: 'item', sort: 'n:asc', pageSize: 50, facets: ['parity'] });
    expect(first.total).toBe(1203);
    expect(first.hits).toHaveLength(50);
    expect(first.hits[0]?.document.id).toBe('d0');
    expect(first.facetCounts?.parity).toEqual([{ value: 'even', count: 602 }, { value: 'odd', count: 601 }]);
    const last = await search.search(name, { query: 'item', sort: 'n:asc', pageSize: 50, page: 25 });
    expect(last.hits.map((h) => h.document.id)).toEqual(['d1200', 'd1201', 'd1202']);
    const past = await search.search(name, { query: 'item', pageSize: 50, page: 40 });
    expect(past).toMatchObject({ hits: [], total: 1203, page: 40, pageSize: 50 });
    for (const bad of [{ pageSize: 0 }, { pageSize: 251 }, { page: 0 }, { page: 1.5 }]) {
      await expect(search.search(name, { query: '*', ...bad })).rejects.toMatchObject({ code: 'search/invalid-input' });
    }
    await expect(search.search(name, { query: '*', facets: ['title'] })).rejects.toMatchObject({ code: 'search/invalid-input' });
  });

  it('replaces a document indexed again, and refuses one that does not fit the index', async () => {
    const name = await seeded();
    await search.indexDocument(name, { id: '1', title: 'Renamed entirely', body: '', tags: [], views: 1, published: true, section: 'culture' });
    expect(await ids(name, { query: 'mariachi' })).toEqual([]);
    expect(await ids(name, { query: 'renamed' })).toEqual(['1']);
    // The same id twice in one call: the later one is kept
    await search.indexDocuments(name, [
      { id: '9', title: 'first draft' },
      { id: '9', title: 'final copy' },
    ]);
    expect(await ids(name, { query: 'draft' })).toEqual([]);
    expect(await ids(name, { query: 'final' })).toEqual(['9']);
    for (const bad of [{ id: 'x', title: 5 }, { id: 'x', tags: 'music' }, { id: 'x', views: 'many' }, { id: 'x', published: 'yes' }, { id: '', title: 'no id' }]) {
      await expect(search.indexDocument(name, bad as never), JSON.stringify(bad)).rejects.toMatchObject({ code: 'search/invalid-input' });
    }
    await expect(search.indexDocument(unique('missing'), { id: '1' })).rejects.toMatchObject({ code: 'search/index-not-found' });
    await search.removeDocument(name, '9');
    await search.removeDocument(name, 'never-there');
    expect((await search.search(name, { query: '*' })).total).toBe(3);
  });

  it('commits or rolls back an indexed document with the transaction around it', async () => {
    const name = await seeded();
    await expect(
      withTransaction(database.db, ctx, async () => {
        await search.indexDocument(name, { id: 'tx', title: 'Unsaved story' });
        await search.removeDocument(name, '1');
        // Inside the transaction its own writes are visible
        expect(await ids(name, { query: 'unsaved' })).toEqual(['tx']);
        expect(await ids(name, { query: 'mariachi' })).toEqual([]);
        throw new Error('the business write failed');
      }),
    ).rejects.toThrow('the business write failed');
    expect(await ids(name, { query: 'unsaved' })).toEqual([]);
    expect(await ids(name, { query: 'mariachi' })).toEqual(['1']);

    await withTransaction(database.db, ctx, () => search.indexDocument(name, { id: 'tx', title: 'Saved story' }));
    expect(await ids(name, { query: 'saved' })).toEqual(['tx']);
  });

  it('swaps an alias in one transaction, and turns an index of the same name into the alias', async () => {
    const name = await seeded();
    const stored = async () => Number(rows<{ n: string }>(await database.db.execute(sql`select count(*) as n from mariachi_search_documents where collection like ${`${name}%`}`))[0]?.n);
    expect(await stored()).toBe(3);

    await search.reindexAlias(name, articles(name), [{ id: 'n1', title: 'Rebuilt index' }]);
    expect(await ids(name, { query: '*' })).toEqual(['n1']);
    // The replaced documents are gone, not left behind
    expect(await stored()).toBe(1);

    // A rebuild that fails leaves what readers had
    await expect(search.reindexAlias(name, articles(name), [{ id: 'ok', title: 'fine' }, { id: 'bad', title: 42 } as never])).rejects.toMatchObject({ code: 'search/invalid-input' });
    await expect(
      withTransaction(database.db, ctx, async () => {
        await search.reindexAlias(name, articles(name), [{ id: 'n2', title: 'Never committed' }]);
        throw new Error('rolled back');
      }),
    ).rejects.toThrow('rolled back');
    expect(await ids(name, { query: '*' })).toEqual(['n1']);
    expect(await stored()).toBe(1);

    // Writes through the alias land in the collection it points at
    await search.indexDocument(name, { id: 'n3', title: 'Added later' });
    await search.reindexAlias(name, articles(name), []);
    expect((await search.search(name, { query: '*' })).total).toBe(0);
    expect(await stored()).toBe(0);

    await search.deleteIndex(name);
    await expect(search.search(name, { query: '*' })).rejects.toMatchObject({ code: 'search/index-not-found' });
    await search.deleteIndex(name);
  });

  it('never shows a reader nothing, or a mix, while an alias is being rebuilt', async () => {
    const name = unique('live');
    const index: SearchIndex = { name, fields: [{ name: 'title', type: 'string' }, { name: 'generation', type: 'int32' }] };
    const generation = (g: number) => Array.from({ length: 40 }, (_, n) => ({ id: `g${g}-${n}`, title: 'catalogue entry', generation: g }));
    await search.reindexAlias(name, index, generation(0));
    let rebuilding = true;
    const seen: Array<{ total: number; generations: number }> = [];
    const reader = (async () => {
      while (rebuilding) {
        const result = await search.search<{ id: string; generation: number }>(name, { query: 'catalogue', pageSize: 100 });
        seen.push({ total: result.total, generations: new Set(result.hits.map((h) => h.document.generation)).size });
      }
    })();
    for (let g = 1; g <= 12; g++) await search.reindexAlias(name, index, generation(g));
    rebuilding = false;
    await reader;
    expect(seen.length).toBeGreaterThan(5);
    expect(seen.filter((s) => s.total !== 40 || s.generations !== 1)).toEqual([]);
  });

  it('leaves no document behind in a dropped collection when writes race a rebuild', async () => {
    const name = unique('raced');
    const index: SearchIndex = { name, fields: [{ name: 'title', type: 'string' }] };
    await search.reindexAlias(name, index, [{ id: 'seed', title: 'seed' }]);
    const writes = Array.from({ length: 60 }, (_, n) => search.indexDocument(name, { id: `w${n}`, title: `written ${n}` }));
    const rebuilds = Array.from({ length: 6 }, (_, n) => search.reindexAlias(name, index, [{ id: `r${n}`, title: `rebuilt ${n}` }]));
    await Promise.all([...writes, ...rebuilds]);
    const [{ target }] = rows<{ target: string }>(await database.db.execute(sql`select target from mariachi_search_indexes where name = ${name}`)) as [{ target: string }];
    const stray = rows(await database.db.execute(sql`select id from mariachi_search_documents where collection like ${`${name}:%`} and collection <> ${target}`));
    expect(stray).toEqual([]);
    // Whatever is stored is what a search finds
    const stored = rows(await database.db.execute(sql`select id from mariachi_search_documents where collection = ${target}`));
    expect((await search.search(name, { query: '*', pageSize: 250 })).total).toBe(stored.length);
  });

  it('removes an index with its documents', async () => {
    const name = await seeded();
    await search.deleteIndex(name);
    expect(rows(await database.db.execute(sql`select 1 from mariachi_search_documents where collection = ${name}`))).toHaveLength(0);
    // The name is free again
    await search.createIndex(articles(name));
    expect((await search.search(name, { query: '*' })).total).toBe(0);
  });

  it('is one search for every process on the database', async () => {
    const name = await seeded();
    const other = createPostgresSearch(database.db);
    expect(await other.isHealthy()).toBe(true);
    expect((await other.search(name, { query: 'mariachi' })).total).toBe(1);
    await search.reindexAlias(name, articles(name), [{ id: 'z', title: 'After the swap' }]);
    expect((await other.search(name, { query: 'swap' })).hits.map((h) => h.document.id)).toEqual(['z']);
  });

  it('stems with a language configuration, and adds that configuration\'s index on connect', async () => {
    const english = createPostgresSearch(database.db, { language: 'english' });
    await english.connect();
    const name = unique('english');
    await english.createIndex({ name, fields: [{ name: 'title', type: 'string' }] });
    await english.indexDocuments(name, [{ id: '1', title: 'Running with the bulls' }, { id: '2', title: 'A quiet walk' }]);
    expect((await english.search(name, { query: 'run' })).hits.map((h) => h.document.id)).toEqual(['1']);
    expect((await english.search(name, { query: 'bull runs' })).hits.map((h) => h.document.id)).toEqual(['1']);
    // The default configuration does not stem
    expect((await search.search(name, { query: 'bull runs' })).total).toBe(0);

    const names = rows<{ indexname: string }>(await database.db.execute(sql`select indexname from pg_indexes where tablename = 'mariachi_search_documents'`)).map((r) => r.indexname);
    expect(names).toEqual(expect.arrayContaining(['mariachi_search_documents_fts_simple_idx', 'mariachi_search_documents_fts_english_idx', 'mariachi_search_documents_document_idx']));
    expect(() => createPostgresSearch(database.db, { language: "simple'; drop table x; --" })).toThrow(/text search configuration/);
    expect(searchIndexStatements('spanish')[0]).toContain("to_tsvector('spanish'::regconfig, text)");
  });

  it('uses its GIN indexes for the text match and for filters', async () => {
    const name = unique('large');
    await search.createIndex({ name, fields: [{ name: 'title', type: 'string' }, { name: 'n', type: 'int32' }] });
    await search.indexDocuments(name, Array.from({ length: 30_000 }, (_, n) => ({ id: `d${n}`, title: `entry ${n} of the ledger`, n })));
    await database.db.execute(sql`analyze mariachi_search_documents`);
    const plan = async (query: Parameters<PostgresSearchAdapter['search']>[1]): Promise<string> => {
      let text = '';
      await database.db.transaction(async (tx) => {
        text = (await explained(tx as never, name, query)).join('\n');
      });
      return text;
    };
    // The statements exactly as the adapter sends them, and the planner's own choice at this size. (On a few
    // thousand rows it reads the table instead, which is faster there.)
    expect(await plan({ query: '1234' })).toContain('mariachi_search_documents_fts_simple_idx');
    expect(await plan({ query: '*', filters: { n: 1234 } })).toContain('mariachi_search_documents_document_idx');
    // "1234" as a prefix: entry 1234 and entries 12340 to 12349
    const found = await search.search(name, { query: '1234', sort: 'n:asc' });
    expect(found.total).toBe(11);
    expect(found.hits[0]?.document.id).toBe('d1234');
    expect(found.queryTimeMs).toBeLessThan(500);
  });
});

/** The plan of the statement the adapter runs for `query`, by running it inside `tx` under EXPLAIN. */
async function explained(tx: { execute(query: unknown): Promise<unknown> }, name: string, query: Parameters<PostgresSearchAdapter['search']>[1]): Promise<string[]> {
  const statements: unknown[] = [];
  const recording = new Proxy(tx, {
    get(target, key) {
      if (key === 'execute') {
        return (statement: unknown) => {
          statements.push(statement);
          return target.execute(statement);
        };
      }
      const value = Reflect.get(target, key);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
  await new PostgresSearchAdapter(recording as never).search(name, query);
  const lines: string[] = [];
  for (const statement of statements) {
    const plan = await tx.execute(sql`explain ${statement as ReturnType<typeof sql>}`);
    for (const row of rows<Record<string, string>>(plan)) lines.push(String(Object.values(row)[0]));
  }
  return lines;
}
