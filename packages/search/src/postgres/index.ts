import { eq, sql, type SQL } from 'drizzle-orm';
import { SearchError } from '@mariachi/core';
import { compileTable, currentTransaction, type DrizzleDb } from '@mariachi/database-postgres';
import { isText, mapFieldType } from '../field-types';
import { searchDocumentsTable, searchIndexesTable } from '../schema';
import type { SearchClient, SearchDocument, SearchField, SearchIndex, SearchQuery, SearchResult } from '../types';

export { searchDocumentsTable, searchIndexesTable } from '../schema';

const indexes = compileTable(searchIndexesTable);
const documents = compileTable(searchDocumentsTable);

/** Compiled Drizzle tables, for drizzle-kit schema files and custom queries. */
export const searchTables = { indexes, documents };

export interface PostgresSearchOptions {
  /**
   * The text search configuration: how words are split and compared. `simple` (the default) lowercases
   * and matches whole words and prefixes in any language. A language (`english`, `spanish`, ...) also
   * stems, so "running" finds "run", and drops its stop words. Documents are stored under the
   * configuration in use when they were indexed: after changing it, reindex.
   */
  language?: string;
  /** How many values a facet returns, most frequent first. Default 10. */
  maxFacetValues?: number;
}

/** Longest search text kept per document, in characters. Postgres refuses a search vector over 1 MB. */
const MAX_TEXT = 250_000;
const MAX_PAGE_SIZE = 250;
/** One insert statement holds at most this many documents, and about this many characters of them. */
const INSERT_ROWS = 500;
const INSERT_CHARS = 8_000_000;
const HEADLINE = 'StartSel=<mark>, StopSel=</mark>, MaxFragments=1, MaxWords=30, MinWords=10';

const rows = <T>(result: unknown): T[] => (Array.isArray(result) ? (result as T[]) : (((result as { rows?: T[] } | undefined)?.rows ?? []) as T[]));
const json = <T>(value: unknown): T => (typeof value === 'string' ? JSON.parse(value) : value) as T;

function toSearchError(error: unknown, code: string, message: string): SearchError {
  if (error instanceof SearchError) return error;
  return new SearchError(code, message, { cause: error instanceof Error ? error.message : String(error) });
}

const scalarOf = (type: string): string => mapFieldType(type).replace('[]', '');
const isList = (type: string): boolean => type.endsWith('[]');

function fits(value: unknown, scalar: string): boolean {
  if (scalar === 'string') return typeof value === 'string';
  if (scalar === 'bool') return typeof value === 'boolean';
  return typeof value === 'number' && Number.isFinite(value);
}

/** A declared field holds its declared type, or is absent. What isn't declared is stored as given. */
function assertDocument(index: SearchIndex, document: SearchDocument): void {
  if (typeof document.id !== 'string' || !document.id) throw new SearchError('search/invalid-input', `A document of ${index.name} has no string id`);
  for (const field of index.fields) {
    const value = document[field.name];
    if (value === undefined || value === null) continue;
    const scalar = scalarOf(field.type);
    const ok = isList(field.type) ? Array.isArray(value) && value.every((one) => fits(one, scalar)) : fits(value, scalar);
    if (!ok) throw new SearchError('search/invalid-input', `Field ${field.name} of document ${document.id} in ${index.name} is not ${field.type}`);
  }
}

function assertDefinition(index: SearchIndex): void {
  for (const field of index.fields) mapFieldType(field.type);
  const sortField = index.defaultSortingField ? index.fields.find((f) => f.name === index.defaultSortingField) : undefined;
  if (index.defaultSortingField && (!sortField || isList(sortField.type) || !['int32', 'int64', 'float'].includes(scalarOf(sortField.type)))) {
    throw new SearchError('search/invalid-input', `defaultSortingField ${index.defaultSortingField} must be a numeric field of ${index.name}`);
  }
}

/** Whether two definitions describe the same fields, whatever order they were written in. */
function sameFields(a: SearchIndex, b: SearchIndex): boolean {
  const shape = (index: SearchIndex): string =>
    JSON.stringify({
      sortBy: index.defaultSortingField ?? null,
      fields: [...index.fields]
        .sort((x, y) => x.name.localeCompare(y.name))
        .map((f) => [f.name, mapFieldType(f.type), f.facet ?? false, f.sort ?? false, f.index ?? true]),
    });
  return shape(a) === shape(b);
}

const textFieldsOf = (index: SearchIndex): string[] => index.fields.filter((f) => isText(f.type) && f.index !== false).map((f) => f.name);

/** What full-text search runs over: the document's string fields, one per line. */
function searchText(index: SearchIndex, document: SearchDocument): string {
  const parts: string[] = [];
  for (const name of textFieldsOf(index)) {
    const value = document[name];
    if (typeof value === 'string') parts.push(value);
    else if (Array.isArray(value)) parts.push(value.join('\n'));
  }
  // Postgres text can't hold a NUL
  return parts.join('\n').replaceAll('\u0000', ' ').slice(0, MAX_TEXT);
}

/** `{ 'a.b': 1 }` as `{ a: { b: 1 } }` or, for a list field, `{ a: { b: [1] } }`: what `document @>` is asked. */
function containment(key: string, value: unknown): string {
  return JSON.stringify(key.split('.').reduceRight<unknown>((inner, part) => ({ [part]: inner }), value));
}

/**
 * Full-text search in Postgres: no search server. The same `SearchClient` as the Typesense adapter
 * (indexes, typed fields, equality filters, sorting, facet counts, highlights, reindexing), plus
 * what only the database can offer:
 *
 * - indexing a document inside `withTransaction` commits or rolls back with the business write;
 * - a reindex replaces an index's documents in one transaction;
 * - `forTenant(id)` gives a client that reads and writes only that tenant's documents.
 *
 * Matching is by whole words, with the last word of a query as a prefix (search as you type). There
 * is no typo tolerance. Requires the tables from `@mariachi/search/schema`.
 */
export class PostgresSearchAdapter implements SearchClient {
  private readonly language: string;
  private readonly maxFacetValues: number;

  constructor(
    private readonly db: DrizzleDb,
    private readonly options: PostgresSearchOptions = {},
    /** The tenant whose documents this client sees; `''` for a client that isn't tenant-scoped. */
    private readonly tenant = '',
  ) {
    this.language = options.language ?? 'simple';
    if (!/^[a-z_]{1,40}$/.test(this.language)) throw new SearchError('search/invalid-input', `"${this.language}" is not a text search configuration name`);
    this.maxFacetValues = options.maxFacetValues ?? 10;
    if (!Number.isInteger(this.maxFacetValues) || this.maxFacetValues < 1) throw new SearchError('search/invalid-input', 'maxFacetValues is a whole number, 1 or more');
  }

  /**
   * A client for one tenant: it stores, finds, counts, removes and replaces only that tenant's
   * documents, whatever the query says. Index definitions are shared by every tenant.
   */
  forTenant(tenantId: string): PostgresSearchAdapter {
    if (typeof tenantId !== 'string' || !tenantId) throw new SearchError('search/tenant-required', 'forTenant needs a tenant id');
    return new PostgresSearchAdapter(this.db, this.options, tenantId);
  }

  private get config(): SQL {
    // Checked in the constructor; a configuration name can't be sent as a parameter and still use the stored vectors' index
    return sql.raw(`'${this.language}'::regconfig`);
  }

  /** Runs `fn` in the surrounding transaction when there is one, else in one of its own. */
  private transaction<T>(fn: (tx: DrizzleDb) => Promise<T>, config?: { isolationLevel: 'repeatable read'; accessMode: 'read only' }): Promise<T> {
    const outer = currentTransaction() as DrizzleDb | undefined;
    if (outer) return fn(outer);
    return this.db.transaction((tx) => fn(tx as unknown as DrizzleDb), config);
  }

  /** One change to an index's definition, or removal of it, at a time; held to the end of the transaction. */
  private lockIndex(tx: DrizzleDb, name: string): Promise<unknown> {
    return tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`mariachi_search:${name}`}::text))`);
  }

  /**
   * This tenant's documents in one index: writes share the lock, a reindex takes it alone. So a tenant's
   * rebuild waits for, and holds back, that tenant's writes only. Held to the end of the transaction.
   */
  private lockDocuments(tx: DrizzleDb, name: string, mode: 'shared' | 'exclusive'): Promise<unknown> {
    const key = sql`hashtext(${`mariachi_search:${name}:${this.tenant}`}::text)`;
    return tx.execute(mode === 'shared' ? sql`select pg_advisory_xact_lock_shared(${key})` : sql`select pg_advisory_xact_lock(${key})`);
  }

  async connect(): Promise<void> {
    try {
      await this.db.execute(sql`select 1 from ${documents} limit 0`);
    } catch (error) {
      throw toSearchError(error, 'search/request-failed', 'The search tables are not there. Add the tables from @mariachi/search/schema to your schema and migrate.');
    }
  }

  async disconnect(): Promise<void> {}

  async isHealthy(): Promise<boolean> {
    try {
      await this.db.execute(sql`select 1`);
      return true;
    } catch {
      return false;
    }
  }

  async createIndex(index: SearchIndex): Promise<void> {
    assertDefinition(index);
    let created: unknown[];
    try {
      const conn = (currentTransaction() as DrizzleDb | undefined) ?? this.db;
      created = await conn.insert(indexes).values({ name: index.name, definition: index }).onConflictDoNothing().returning({ name: indexes.name });
    } catch (error) {
      throw toSearchError(error, 'search/request-failed', `Failed to create index ${index.name}`);
    }
    if (created.length === 0) throw new SearchError('search/index-exists', `Index ${index.name} already exists`);
  }

  /** Removes the index and every tenant's documents in it. Does nothing when there is no such index. */
  async deleteIndex(name: string): Promise<void> {
    if (this.tenant) {
      throw new SearchError('search/invalid-input', `An index belongs to every tenant: delete ${name} through the client that isn't tenant-scoped. To clear one tenant's documents, reindex with none.`);
    }
    try {
      await this.transaction(async (tx) => {
        await this.lockIndex(tx, name);
        // The index first: this waits for writes in flight (they hold a share lock on the row), and any that
        // come after find no index. Then the documents, those writes' included.
        await tx.delete(indexes).where(eq(indexes.name, name));
        await tx.delete(documents).where(eq(documents.collection, name));
      });
    } catch (error) {
      throw toSearchError(error, 'search/request-failed', `Failed to delete index ${name}`);
    }
  }

  private async find(conn: DrizzleDb, name: string, lock = false): Promise<SearchIndex | undefined> {
    // With `for share`, the definition can't be replaced or removed until this transaction ends
    const found = rows<{ definition: unknown }>(await conn.execute(sql`select definition from ${indexes} where name = ${name} ${lock ? sql`for share` : sql``}`));
    return found[0] ? json<SearchIndex>(found[0].definition) : undefined;
  }

  private async definition(conn: DrizzleDb, name: string, lock = false): Promise<SearchIndex> {
    const found = await this.find(conn, name, lock);
    if (!found) throw new SearchError('search/index-not-found', `Index ${name} not found`);
    return found;
  }

  private async insert(tx: DrizzleDb, index: SearchIndex, collection: string, docs: SearchDocument[]): Promise<void> {
    // The same id twice in one statement is refused by Postgres; the later one wins
    const unique = new Map<string, SearchDocument>();
    for (const document of docs) {
      assertDocument(index, document);
      unique.set(document.id, document);
    }
    let batch: SQL[] = [];
    let size = 0;
    const flush = async (): Promise<void> => {
      if (!batch.length) return;
      await tx.execute(sql`
        insert into ${documents} (tenant_id, collection, id, document, tsv)
        values ${sql.join(batch, sql`, `)}
        on conflict (tenant_id, collection, id) do update set document = excluded.document, tsv = excluded.tsv, updated_at = now()
      `);
      batch = [];
      size = 0;
    };
    for (const document of unique.values()) {
      const body = JSON.stringify(document);
      const text = searchText(index, document);
      if (batch.length && (batch.length >= INSERT_ROWS || size + body.length + text.length > INSERT_CHARS)) await flush();
      batch.push(sql`(${this.tenant}, ${collection}, ${document.id}, ${body}::jsonb, to_tsvector(${this.config}, ${text}::text))`);
      size += body.length + text.length;
    }
    await flush();
  }

  async indexDocument(indexName: string, document: SearchDocument): Promise<void> {
    await this.indexDocuments(indexName, [document]);
  }

  async indexDocuments(indexName: string, docs: SearchDocument[]): Promise<void> {
    try {
      await this.transaction(async (tx) => {
        await this.lockDocuments(tx, indexName, 'shared');
        await this.insert(tx, await this.definition(tx, indexName, true), indexName, docs);
      });
    } catch (error) {
      throw toSearchError(error, 'search/request-failed', `Failed to index documents in ${indexName}`);
    }
  }

  async removeDocument(indexName: string, documentId: string): Promise<void> {
    try {
      const conn = (currentTransaction() as DrizzleDb | undefined) ?? this.db;
      await conn.execute(sql`delete from ${documents} where tenant_id = ${this.tenant} and collection = ${indexName} and id = ${documentId}`);
    } catch (error) {
      throw toSearchError(error, 'search/request-failed', `Failed to remove document ${documentId} from ${indexName}`);
    }
  }

  /**
   * Replaces everything the index holds (for this client's tenant) with `docs`, in one transaction: a
   * reader sees the old documents until the commit and the new ones after it, never a mix and never
   * nothing. Creates the index if it isn't there.
   *
   * An index's fields are everyone's. The client that isn't tenant-scoped may change them here, which
   * holds back every tenant's writes until it commits and leaves the other tenants' documents to be
   * reindexed. A tenant's client can't: a definition that differs is refused, and its rebuild waits for
   * and holds back that tenant's writes only.
   */
  async reindexAlias(alias: string, index: SearchIndex, docs: SearchDocument[]): Promise<void> {
    const definition = { ...index, name: alias };
    assertDefinition(definition);
    try {
      await this.transaction(async (tx) => {
        // Before any other lock, so two definition changes can't wait on each other
        if (!this.tenant) await this.lockIndex(tx, alias);
        await this.lockDocuments(tx, alias, 'exclusive');
        await tx.insert(indexes).values({ name: alias, definition }).onConflictDoNothing();
        const current = await this.definition(tx, alias, true);
        if (!sameFields(current, definition)) {
          if (this.tenant) {
            throw new SearchError('search/invalid-input', `The fields of ${alias} belong to every tenant: change them through the client that isn't tenant-scoped, then reindex each tenant`);
          }
          await tx.update(indexes).set({ definition, updatedAt: sql`now()` }).where(eq(indexes.name, alias));
        }
        await tx.execute(sql`delete from ${documents} where tenant_id = ${this.tenant} and collection = ${alias}`);
        await this.insert(tx, definition, alias, docs);
      });
    } catch (error) {
      throw toSearchError(error, 'search/request-failed', `Failed to reindex ${alias}`);
    }
  }

  /**
   * The lookup, the page, the count and the facets read one snapshot, so a reindex committing halfway
   * can't give hits from before it and counts from after. Inside a surrounding transaction they read
   * as that transaction does.
   */
  async search<T = SearchDocument>(indexName: string, query: SearchQuery): Promise<SearchResult<T>> {
    const started = performance.now();
    try {
      return await this.transaction((tx) => this.searchIn<T>(tx, indexName, query, started), { isolationLevel: 'repeatable read', accessMode: 'read only' });
    } catch (error) {
      throw toSearchError(error, 'search/query-failed', `Search on ${indexName} failed`);
    }
  }

  private async searchIn<T>(conn: DrizzleDb, indexName: string, query: SearchQuery, started: number): Promise<SearchResult<T>> {
    const index = await this.definition(conn, indexName);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    if (!Number.isInteger(page) || page < 1) throw new SearchError('search/invalid-input', 'page is a whole number, 1 or more');
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
      throw new SearchError('search/invalid-input', `pageSize is a whole number from 1 to ${MAX_PAGE_SIZE}`);
    }

    const textFields = textFieldsOf(index);
    const queryFields = query.queryBy?.length ? query.queryBy : textFields;
    const text = query.query.trim();
    const everything = text === '' || text === '*';
    if (queryFields.length === 0 && query.query !== '*') {
      throw new SearchError('search/missing-query-fields', `Index ${indexName} has no string fields to query. Pass query.queryBy.`);
    }
    // Only what is in the stored vector can be searched through its index; anything else would read every document
    const unsearchable = queryFields.filter((field) => !textFields.includes(field));
    if (unsearchable.length) {
      throw new SearchError('search/invalid-input', `queryBy names ${unsearchable.join(', ')}, which ${unsearchable.length > 1 ? 'are' : 'is'} not an indexed string field of ${indexName}`);
    }

    // Given as values: the planner then knows how many documents this tenant and index hold
    const conditions: SQL[] = [sql`d.tenant_id = ${this.tenant}`, sql`d.collection = ${indexName}`];
    let score: SQL = sql`0::real`;
    let match: SQL | undefined;
    if (!everything) {
      match = this.tsquery(text);
      conditions.push(sql`d.tsv @@ ${match}`);
      // Only some of the fields: the stored vector narrows the rows through its index, the chosen fields decide
      if (queryFields.length < textFields.length) {
        conditions.push(sql`to_tsvector(${this.config}, concat_ws(' ', ${sql.join(queryFields.map((field) => sql`d.document->>${field}::text`), sql`, `)})) @@ ${match}`);
      }
      score = sql`ts_rank(d.tsv, ${match})`;
    }
    for (const [key, value] of Object.entries(query.filters ?? {})) conditions.push(this.filter(index, key, value));
    const where = sql.join(conditions, sql` and `);

    const order: SQL[] = [...this.sort(indexName, index, query.sort), sql`score desc`];
    if (index.defaultSortingField) order.push(sql`(d.document->>${index.defaultSortingField}::text)::double precision desc nulls last`);
    order.push(sql`d.id asc`);

    // Highlights are made for the page's rows only, after the limit
    const highlighted = match ? queryFields.filter((name) => index.fields.some((f) => f.name === name && mapFieldType(f.type) === 'string')).slice(0, 5) : [];
    const headlines = highlighted.map((field, n) => sql`, ts_headline(${this.config}, p.document->>${field}::text, ${match}, ${HEADLINE}::text) as ${sql.raw(`h${n}`)}`);

    const pageRows = rows<{ document: unknown; score: number | string; total: number | string } & Record<string, string | null>>(
      await conn.execute(sql`
        select p.document, p.score, p.total${sql.join(headlines, sql``)}
        from (
          select d.id, d.document, ${score} as score, count(*) over () as total
          from ${documents} d
          where ${where}
          order by ${sql.join(order, sql`, `)}
          limit ${pageSize} offset ${(page - 1) * pageSize}
        ) p
      `),
    );
    let total = pageRows.length ? Number(pageRows[0]?.total) : 0;
    // A page past the end has no row to carry the count
    if (!pageRows.length && page > 1) {
      const [counted] = rows<{ total: number | string }>(await conn.execute(sql`select count(*) as total from ${documents} d where ${where}`));
      total = Number(counted?.total ?? 0);
    }
    const facetCounts = query.facets?.length ? await this.facets(conn, indexName, index, where, query.facets) : undefined;
    return {
      hits: pageRows.map((row) => {
        const highlights: Record<string, string> = {};
        highlighted.forEach((field, n) => {
          const snippet = row[`h${n}`];
          if (typeof snippet === 'string' && snippet.includes('<mark>')) highlights[field] = snippet;
        });
        return { document: json<T>(row.document), score: Number(row.score), ...(Object.keys(highlights).length ? { highlights } : {}) };
      }),
      total,
      page,
      pageSize,
      ...(facetCounts ? { facetCounts } : {}),
      queryTimeMs: Math.round(performance.now() - started),
    };
  }

  /**
   * Every word must be present; the last one may be the start of a word, so results narrow as someone
   * types. Postgres does the splitting, the same way it split the documents. Nothing in the text is an
   * operator.
   */
  private tsquery(text: string): SQL {
    const cut = text.search(/\S+$/);
    const head = text.slice(0, cut).trim();
    const last = `'${text.slice(cut).replaceAll('\\', '\\\\').replaceAll("'", "''")}':*`;
    const prefix = sql`to_tsquery(${this.config}, ${last}::text)`;
    return head ? sql`(plainto_tsquery(${this.config}, ${head}::text) && ${prefix})` : prefix;
  }

  /** Equality, as the other adapters: on a list field, the list contains the value. */
  private filter(index: SearchIndex, key: string, value: string | number | boolean): SQL {
    if (!/^[A-Za-z0-9_.]+$/.test(key)) throw new SearchError('search/invalid-input', `Invalid filter field "${key}"`);
    const field = index.fields.find((f) => f.name === key);
    const scalar = sql`d.document @> ${containment(key, value)}::jsonb`;
    const list = sql`d.document @> ${containment(key, [value])}::jsonb`;
    if (!field) return sql`(${scalar} or ${list})`;
    return isList(field.type) ? list : scalar;
  }

  /** `sort` as the other adapters take it: `field:asc` or `field:desc`, several separated by commas. */
  private sort(indexName: string, index: SearchIndex, sort: string | undefined): SQL[] {
    if (!sort) return [];
    return sort.split(',').map((part) => {
      const [name, direction] = part.trim().split(':');
      if (!name || (direction !== 'asc' && direction !== 'desc')) {
        throw new SearchError('search/invalid-input', `sort "${part.trim()}" is not field:asc or field:desc`);
      }
      const field: SearchField | undefined = index.fields.find((f) => f.name === name);
      if (!field) throw new SearchError('search/invalid-input', `Index ${indexName} has no field ${name} to sort by`);
      if (isList(field.type)) throw new SearchError('search/invalid-input', `Field ${name} of ${indexName} is a list and can't be sorted by`);
      const scalar = scalarOf(field.type);
      const value =
        scalar === 'string' ? sql`d.document->>${name}::text` : scalar === 'bool' ? sql`(d.document->>${name}::text)::boolean` : sql`(d.document->>${name}::text)::double precision`;
      return sql`${value} ${sql.raw(direction)} nulls last`;
    });
  }

  /** How many of the matching documents have each value of each facet field, most frequent first. */
  private async facets(conn: DrizzleDb, indexName: string, index: SearchIndex, where: SQL, fields: string[]): Promise<NonNullable<SearchResult['facetCounts']>> {
    const out: NonNullable<SearchResult['facetCounts']> = {};
    for (const field of fields) {
      if (!index.fields.some((f) => f.name === field && f.facet)) {
        throw new SearchError('search/invalid-input', `Field ${field} of ${indexName} is not a facet (declare it with facet: true)`);
      }
      const counted = rows<{ value: string; count: number | string }>(
        await conn.execute(sql`
          select v.value, count(*) as count
          from ${documents} d
          cross join lateral jsonb_array_elements_text(
            case jsonb_typeof(d.document->${field}::text)
              when 'array' then d.document->${field}::text
              when 'null' then '[]'::jsonb
              else jsonb_build_array(d.document->${field}::text)
            end
          ) as v(value)
          where ${where} and d.document ? ${field}::text
          group by v.value
          order by count(*) desc, v.value asc
          limit ${this.maxFacetValues}
        `),
      );
      out[field] = counted.map((row) => ({ value: row.value, count: Number(row.count) }));
    }
    return out;
  }
}

/** A search client on the app's own database. */
export function createPostgresSearch(db: DrizzleDb, options?: PostgresSearchOptions): PostgresSearchAdapter {
  return new PostgresSearchAdapter(db, options);
}
