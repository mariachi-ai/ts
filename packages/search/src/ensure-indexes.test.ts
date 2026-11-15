import { createContext, type Logger } from '@mariachi/core';
import { describe, expect, it } from 'vitest';
import { MemorySearchAdapter } from './adapters/memory';
import { sameFields } from './field-types';
import { DefaultSearch } from './search';
import type { SearchClient, SearchIndex } from './types';

const notes = { name: 'notes', fields: [{ name: 'title', type: 'string' }] } satisfies SearchIndex;
const tasks = { name: 'tasks', fields: [{ name: 'title', type: 'string' }, { name: 'done', type: 'bool' }] } satisfies SearchIndex;

function setup(client: SearchClient = new MemorySearchAdapter()) {
  const warnings: Array<{ fields: Record<string, unknown>; message?: string }> = [];
  const logger: Logger = { info() {}, error() {}, debug() {}, warn: (fields, message) => void warnings.push({ fields, message }), child: () => logger };
  return { client, warnings, search: new DefaultSearch({ client, tenantScoped: true }, { logger }) };
}

const ctx = createContext({ tenantId: 'tenant-a', logger: { info() {}, warn() {}, error() {}, debug() {}, child: () => ctx.logger } as Logger });

describe('Search.ensureIndexes', () => {
  it('creates the indexes that are not there, and the app can use them at once', async () => {
    const { search, warnings } = setup();
    expect(await search.ensureIndexes([notes, tasks])).toEqual({ created: ['notes', 'tasks'], unchanged: [], changed: [] });
    await search.indexDocument(ctx, 'notes', { id: '1', title: 'Wool hat' });
    expect((await search.search(ctx, 'notes', { query: 'wool' })).total).toBe(1);
    expect(warnings).toEqual([]);
  });

  it('leaves an index that exists as it is, with its documents, on every later start', async () => {
    const { search, warnings } = setup();
    await search.ensureIndexes([notes]);
    await search.indexDocument(ctx, 'notes', { id: '1', title: 'Wool hat' });
    expect(await search.ensureIndexes([notes, tasks])).toEqual({ created: ['tasks'], unchanged: ['notes'], changed: [] });
    expect((await search.search(ctx, 'notes', { query: 'wool' })).total).toBe(1);
    expect(warnings).toEqual([]);
  });

  it('reports changed fields and warns, without applying them', async () => {
    const { search, client, warnings } = setup();
    await search.ensureIndexes([notes]);
    const edited = { ...notes, fields: [...notes.fields, { name: 'tags', type: 'string[]', facet: true }] } satisfies SearchIndex;
    expect(await search.ensureIndexes([edited])).toEqual({ created: [], unchanged: [], changed: ['notes'] });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({ fields: { index: 'notes' }, message: expect.stringContaining('until you reindex') });
    // The stored definition is the one the tenants' documents were indexed under
    expect(await client.getIndex?.('notes')).toEqual(notes);
  });

  it('does not call the same fields in another order, or the same type under another name, a change', async () => {
    const { search, warnings } = setup();
    await search.ensureIndexes([tasks]);
    const reordered = { name: 'tasks', fields: [{ name: 'done', type: 'boolean' }, { name: 'title', type: 'string' }] } satisfies SearchIndex;
    expect(await search.ensureIndexes([reordered])).toEqual({ created: [], unchanged: ['tasks'], changed: [] });
    expect(warnings).toEqual([]);
    expect(sameFields(tasks, reordered)).toBe(true);
    expect(sameFields(tasks, { ...tasks, defaultSortingField: 'done' })).toBe(false);
  });

  it('takes an existing index as unchanged when the client cannot say what is stored', async () => {
    // The memory adapter with no way to read a definition back, as a client of your own may be
    const client = Object.create(new MemorySearchAdapter(), { getIndex: { value: undefined } }) as SearchClient;
    const { search, warnings } = setup(client);
    await search.ensureIndexes([notes]);
    const edited = { ...notes, fields: [...notes.fields, { name: 'tags', type: 'string[]' }] } satisfies SearchIndex;
    expect(await search.ensureIndexes([edited])).toEqual({ created: [], unchanged: ['notes'], changed: [] });
    expect(warnings).toEqual([]);
  });

  it('lets any other failure through', async () => {
    const { search } = setup();
    const invalid = { name: 'bad', fields: [{ name: 'title', type: 'text' }] } as unknown as SearchIndex;
    await expect(search.ensureIndexes([invalid])).rejects.toMatchObject({ code: 'search/invalid-field-type' });
  });
});
