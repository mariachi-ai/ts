import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { sql } from 'drizzle-orm';
import type { Context } from '@mariachi/core';
import { applySchema, createPostgresDatabase, withTransaction, type PostgresDatabase } from '@mariachi/database-postgres';
import { startPostgres, stopAll } from '../../../../test/setup';
import type { SearchIndex } from '../types';
import { createPostgresSearch, PostgresSearchAdapter, searchDocumentsTable, searchIndexesTable } from './index';

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
    // `index: false` keeps a field out of search. Naming it, a number or an unknown field is refused: none is in
    // the stored vector, so searching it would mean reading every document
    expect(await ids(name, { query: 'zx' })).toEqual([]);
    for (const queryBy of [['code'], ['views'], ['title', 'nowhere']]) {
      await expect(search.search(name, { query: 'zx', queryBy }), queryBy.join()).rejects.toMatchObject({ code: 'search/invalid-input' });
    }
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

  it('replaces an index\'s documents in one transaction, whether or not it was made with createIndex', async () => {
    const name = await seeded();
    const stored = async () => Number(rows<{ n: string }>(await database.db.execute(sql`select count(*) as n from mariachi_search_documents where collection = ${name}`))[0]?.n);
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

    await search.indexDocument(name, { id: 'n3', title: 'Added later' });
    expect((await ids(name, { query: '*' })).sort()).toEqual(['n1', 'n3']);
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

  it('leaves no document behind when writes race a rebuild or the removal of the index', async () => {
    const name = unique('raced');
    const index: SearchIndex = { name, fields: [{ name: 'title', type: 'string' }] };
    await search.reindexAlias(name, index, [{ id: 'seed', title: 'seed' }]);
    const writes = Array.from({ length: 60 }, (_, n) => search.indexDocument(name, { id: `w${n}`, title: `written ${n}` }));
    const rebuilds = Array.from({ length: 6 }, (_, n) => search.reindexAlias(name, index, [{ id: `r${n}`, title: `rebuilt ${n}` }]));
    await Promise.all([...writes, ...rebuilds]);
    const stored = async () => rows(await database.db.execute(sql`select id from mariachi_search_documents where collection = ${name}`)).length;
    // Whatever is stored is what a search finds, and exactly one rebuild's document survived
    const found = await search.search(name, { query: '*', pageSize: 250 });
    expect(found.total).toBe(await stored());
    expect(found.hits.filter((h) => h.document.id.startsWith('r'))).toHaveLength(1);

    // A write that loses to the removal is refused; one that wins is removed with the index
    const outcomes = await Promise.allSettled([
      ...Array.from({ length: 40 }, (_, n) => search.indexDocument(name, { id: `late${n}`, title: 'late' })),
      search.deleteIndex(name),
    ]);
    for (const outcome of outcomes) {
      if (outcome.status === 'rejected') expect(outcome.reason).toMatchObject({ code: 'search/index-not-found' });
    }
    expect(await stored()).toBe(0);
  });

  it('keeps each tenant\'s documents apart through forTenant', async () => {
    const name = unique('tenanted');
    const index: SearchIndex = { name, fields: [{ name: 'title', type: 'string' }, { name: 'kind', type: 'string', facet: true }] };
    await search.createIndex(index);
    const [acme, globex] = [search.forTenant('acme'), search.forTenant('globex')];
    await acme.indexDocuments(name, [{ id: '1', title: 'Acme roadmap', kind: 'plan' }, { id: '2', title: 'Acme budget', kind: 'money' }]);
    await globex.indexDocuments(name, [{ id: '1', title: 'Globex roadmap', kind: 'plan' }]);
    await search.indexDocument(name, { id: 'shared', title: 'Unscoped roadmap', kind: 'plan' });

    // The same id in two tenants is two documents; each tenant finds, counts and facets only its own
    const mine = await acme.search(name, { query: 'roadmap', facets: ['kind'] });
    expect(mine.hits.map((h) => h.document.title)).toEqual(['Acme roadmap']);
    expect((await acme.search(name, { query: '*', facets: ['kind'] })).facetCounts?.kind).toEqual([{ value: 'money', count: 1 }, { value: 'plan', count: 1 }]);
    expect((await globex.search(name, { query: '*' })).total).toBe(1);
    expect((await search.search(name, { query: '*' })).hits.map((h) => h.document.id)).toEqual(['shared']);
    // No query or filter reaches across
    expect((await globex.search(name, { query: 'acme' })).total).toBe(0);
    expect((await globex.search(name, { query: '*', filters: { title: 'Acme budget' } })).total).toBe(0);

    // Removing and replacing touch only the tenant's own
    await globex.removeDocument(name, '2');
    await globex.reindexAlias(name, index, [{ id: '9', title: 'Globex only', kind: 'plan' }]);
    expect((await acme.search(name, { query: '*' })).total).toBe(2);
    expect((await globex.search(name, { query: '*' })).hits.map((h) => h.document.id)).toEqual(['9']);
    await acme.reindexAlias(name, index, []);
    expect((await acme.search(name, { query: '*' })).total).toBe(0);
    expect((await search.search(name, { query: '*' })).total).toBe(1);

    // An index is everyone's: a tenant's client can't remove it
    await expect(acme.deleteIndex(name)).rejects.toMatchObject({ code: 'search/invalid-input' });
    expect(() => search.forTenant('')).toThrow(/tenant id/);
    await search.deleteIndex(name);
    expect(rows(await database.db.execute(sql`select 1 from mariachi_search_documents where collection = ${name}`))).toHaveLength(0);
  });

  it('keeps one tenant\'s rebuild from holding back, or redefining, the others', async () => {
    const name = unique('shared');
    const index: SearchIndex = { name, fields: [{ name: 'title', type: 'string' }, { name: 'kind', type: 'string', facet: true }] };
    const [acme, globex] = [search.forTenant('acme'), search.forTenant('globex')];
    // The first tenant to reindex creates the index
    await acme.reindexAlias(name, index, [{ id: '1', title: 'acme one', kind: 'a' }]);
    await globex.indexDocument(name, { id: '1', title: 'globex one', kind: 'g' });

    // A rebuild in progress: acme's own writes wait for it, globex's don't
    const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    let finish = (): void => {};
    const held = new Promise<void>((resolve) => {
      finish = resolve;
    });
    let started = (): void => {};
    const underway = new Promise<void>((resolve) => {
      started = resolve;
    });
    const rebuild = withTransaction(database.db, ctx, async () => {
      await acme.reindexAlias(name, index, [{ id: '2', title: 'acme two', kind: 'a' }]);
      started();
      await held;
    });
    await underway;
    await globex.indexDocument(name, { id: '2', title: 'globex two', kind: 'g' });
    expect((await globex.search(name, { query: '*' })).total).toBe(2);
    const own = acme.indexDocument(name, { id: '3', title: 'acme three', kind: 'a' }).then(() => 'written');
    expect(await Promise.race([own, pause(300).then(() => 'waiting')])).toBe('waiting');
    finish();
    await rebuild;
    expect(await own).toBe('written');
    expect((await acme.search(name, { query: '*' })).hits.map((h) => h.document.id).sort()).toEqual(['2', '3']);

    // A tenant can't change the fields; the client that isn't tenant-scoped can
    const narrower: SearchIndex = { name, fields: [{ name: 'title', type: 'string' }] };
    await expect(acme.reindexAlias(name, narrower, [])).rejects.toMatchObject({ code: 'search/invalid-input' });
    expect((await acme.search(name, { query: '*', facets: ['kind'] })).total).toBe(2);
    // The same fields in another order are the same fields
    await acme.reindexAlias(name, { name, fields: [...index.fields].reverse() }, [{ id: '4', title: 'acme four', kind: 'a' }]);
    await search.reindexAlias(name, narrower, []);
    await expect(globex.search(name, { query: '*', facets: ['kind'] })).rejects.toMatchObject({ code: 'search/invalid-input' });
    // Other tenants' documents are untouched by it
    expect((await globex.search(name, { query: '*' })).total).toBe(2);
    await search.deleteIndex(name);
  });

  it('returns the most frequent facet values, ten unless told otherwise', async () => {
    const name = unique('faceted');
    await search.createIndex({ name, fields: [{ name: 'title', type: 'string' }, { name: 'tag', type: 'string', facet: true }] });
    // tag-0 once, tag-1 twice, ... tag-24 twenty-five times
    await search.indexDocuments(name, Array.from({ length: 25 }, (_, t) => Array.from({ length: t + 1 }, (_, n) => ({ id: `${t}-${n}`, title: 'x', tag: `tag-${t}` }))).flat());
    const ten = (await search.search(name, { query: '*', facets: ['tag'] })).facetCounts?.tag ?? [];
    expect(ten).toHaveLength(10);
    expect(ten[0]).toEqual({ value: 'tag-24', count: 25 });
    expect(ten[9]).toEqual({ value: 'tag-15', count: 16 });
    const three = createPostgresSearch(database.db, { maxFacetValues: 3 });
    expect((await three.search(name, { query: '*', facets: ['tag'] })).facetCounts?.tag).toHaveLength(3);
    expect(() => createPostgresSearch(database.db, { maxFacetValues: 0 })).toThrow(/maxFacetValues/);
  });

  it('stores large documents in several statements', async () => {
    const name = unique('bulky');
    await search.createIndex({ name, fields: [{ name: 'title', type: 'string' }, { name: 'body', type: 'string' }] });
    // About 12 MB of text: more than one statement's worth, and each body longer than the searchable limit
    const filler = 'lorem ipsum dolor sit amet '.repeat(15_000);
    await search.indexDocuments(name, Array.from({ length: 30 }, (_, n) => ({ id: `b${n}`, title: `volume ${n}`, body: `${filler} tailword${n}` })));
    expect((await search.search(name, { query: 'lorem' })).total).toBe(30);
    expect((await search.search(name, { query: 'volume 7' })).hits.map((h) => h.document.id)).toEqual(['b7']);
    // Past the first 250,000 characters a document's text isn't searchable; the document itself is whole
    expect((await search.search(name, { query: 'tailword7' })).total).toBe(0);
    const [hit] = (await search.search<{ id: string; body: string }>(name, { query: 'volume 7' })).hits;
    expect(hit?.document.body.endsWith('tailword7')).toBe(true);
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

  it('stems with a language configuration', async () => {
    const english = createPostgresSearch(database.db, { language: 'english' });
    await english.connect();
    const name = unique('english');
    await english.createIndex({ name, fields: [{ name: 'title', type: 'string' }] });
    await english.indexDocuments(name, [{ id: '1', title: 'Running with the bulls' }, { id: '2', title: 'A quiet walk' }]);
    expect((await english.search(name, { query: 'run' })).hits.map((h) => h.document.id)).toEqual(['1']);
    expect((await english.search(name, { query: 'bull runs' })).hits.map((h) => h.document.id)).toEqual(['1']);
    // The default configuration does not stem
    expect((await search.search(name, { query: 'bull runs' })).total).toBe(0);

    expect(() => createPostgresSearch(database.db, { language: "simple'; drop table x; --" })).toThrow(/text search configuration/);
  });

  it('has its indexes from the schema, so a migration makes them and startup makes nothing', async () => {
    const names = rows<{ indexname: string; indexdef: string }>(await database.db.execute(sql`select indexname, indexdef from pg_indexes where tablename = 'mariachi_search_documents'`));
    expect(names.map((r) => r.indexname).sort()).toEqual(['mariachi_search_documents_document_idx', 'mariachi_search_documents_tenant_id_collection_id_pk', 'mariachi_search_documents_tsv_idx']);
    expect(names.find((r) => r.indexname.endsWith('tsv_idx'))?.indexdef).toMatch(/USING gin \(tsv\)/);
    await expect(createPostgresSearch(database.db).connect()).resolves.toBeUndefined();
  });

  it('uses its GIN indexes for the text match and for filters', async () => {
    const name = unique('large');
    await search.createIndex({ name, fields: [{ name: 'title', type: 'string' }, { name: 'n', type: 'int32' }] });
    await search.indexDocuments(name, Array.from({ length: 30_000 }, (_, n) => ({ id: `d${n}`, title: `entry ${n} of the ledger`, n })));
    await database.db.execute(sql`analyze mariachi_search_documents`);
    const plan = async (query: Parameters<PostgresSearchAdapter['search']>[1]): Promise<string> => {
      let text = '';
      await database.db.transaction(async (tx) => {
        // With the vector stored, reading 30,000 rows in order is cheap and the planner does that at this size.
        // Turned off, the plan shows the statements can be served by the indexes, which is what a large table needs.
        await tx.execute(sql`set local enable_seqscan = off`);
        text = (await explained(tx as never, name, query)).join('\n');
      });
      return text;
    };
    // The statements exactly as the adapter sends them
    expect(await plan({ query: '1234' })).toContain('mariachi_search_documents_tsv_idx');
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
  const recording: object = new Proxy(tx, {
    get(target, key) {
      if (key === 'execute') {
        return (statement: unknown) => {
          statements.push(statement);
          return target.execute(statement);
        };
      }
      // The adapter opens its own read transaction; here it runs in the one being inspected
      if (key === 'transaction') return (fn: (inner: unknown) => unknown) => fn(recording);
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
