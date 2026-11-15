import { randomUUID } from 'node:crypto';
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
   * stems, so "running" finds "run", and drops its stop words. Changing it needs no reindex, only the
   * new GIN index, which `connect()` adds.
   */
  language?: string;
  /**
   * `connect()` adds the two GIN indexes search needs if they are missing. Set false when the database
   * role can't create indexes, and create them in a migration (`searchIndexStatements`).
   */
  manageIndexes?: boolean;
}

/** Longest search text kept per document, in characters. Postgres refuses a text-search vector over 1 MB. */
const MAX_TEXT = 250_000;
const MAX_PAGE_SIZE = 250;
const INSERT_BATCH = 500;
const HEADLINE = 'StartSel=<mark>, StopSel=</mark>, MaxFragments=1, MaxWords=30, MinWords=10';

const rows = <T>(result: unknown): T[] => (Array.isArray(result) ? (result as T[]) : (((result as { rows?: T[] } | undefined)?.rows ?? []) as T[]));
const json = <T>(value: unknown): T => (typeof value === 'string' ? JSON.parse(value) : value) as T;

function assertLanguage(language: string): string {
  if (!/^[a-z_]{1,40}$/.test(language)) throw new SearchError('search/invalid-input', `"${language}" is not a text search configuration name`);
  return language;
}

/** The statements `connect()` runs, for a migration when the app's role can't create indexes. */
export function searchIndexStatements(language = 'simple'): string[] {
  const config = assertLanguage(language);
  return [
    `create index if not exists mariachi_search_documents_fts_${config}_idx on mariachi_search_documents using gin (to_tsvector('${config}'::regconfig, text))`,
    'create index if not exists mariachi_search_documents_document_idx on mariachi_search_documents using gin (document jsonb_path_ops)',
  ];
}

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
 * (indexes, typed fields, equality filters, sorting, facet counts, highlights, alias reindexing),
 * plus what only the database can offer: indexing a document inside `withTransaction` commits or
 * rolls back with the business write, and an alias swap is one transaction.
 *
 * Matching is by whole words, with the last word of a query as a prefix (search as you type). There
 * is no typo tolerance. Requires the tables from `@mariachi/search/schema`.
 */
export class PostgresSearchAdapter implements SearchClient {
  private readonly language: string;
  private readonly manageIndexes: boolean;

  constructor(
    private readonly db: DrizzleDb,
    options: PostgresSearchOptions = {},
  ) {
    this.language = assertLanguage(options.language ?? 'simple');
    this.manageIndexes = options.manageIndexes ?? true;
  }

  /** The surrounding transaction when there is one, so a write here commits or rolls back with it. */
  private get conn(): DrizzleDb {
    return (currentTransaction() as DrizzleDb | undefined) ?? this.db;
  }

  private get config(): SQL {
    return sql.raw(`'${this.language}'::regconfig`);
  }

  async connect(): Promise<void> {
    if (!this.manageIndexes) {
      await this.db.execute(sql`select 1`);
      return;
    }
    try {
      await this.db.transaction(async (tx) => {
        // Two processes starting together would both try to create the index
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext('mariachi_search_documents'))`);
        for (const statement of searchIndexStatements(this.language)) await tx.execute(sql.raw(statement));
      });
    } catch (error) {
      throw toSearchError(
        error,
        'search/request-failed',
        'Could not add the search indexes. Are the tables from @mariachi/search/schema migrated? If this role cannot create indexes, pass manageIndexes: false and run searchIndexStatements() in a migration.',
      );
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
    for (const field of index.fields) mapFieldType(field.type);
    const sortField = index.defaultSortingField ? index.fields.find((f) => f.name === index.defaultSortingField) : undefined;
    if (index.defaultSortingField && (!sortField || isList(sortField.type) || !['int32', 'int64', 'float'].includes(scalarOf(sortField.type)))) {
      throw new SearchError('search/invalid-input', `defaultSortingField ${index.defaultSortingField} must be a numeric field of ${index.name}`);
    }
    let created: unknown[];
    try {
      created = await this.conn.insert(indexes).values({ name: index.name, definition: index }).onConflictDoNothing().returning({ name: indexes.name });
    } catch (error) {
      throw toSearchError(error, 'search/request-failed', `Failed to create index ${index.name}`);
    }
    if (created.length === 0) throw new SearchError('search/index-exists', `Index ${index.name} already exists`);
  }

  /** Removes the index (or alias) and its documents. Does nothing when there is no such index. */
  async deleteIndex(name: string): Promise<void> {
    try {
      await this.conn.execute(sql`
        with gone as (delete from ${indexes} where name = ${name} returning coalesce(target, name) as collection)
        delete from ${documents} where collection in (select collection from gone)
      `);
    } catch (error) {
      throw toSearchError(error, 'search/request-failed', `Failed to delete index ${name}`);
    }
  }

  private async lookup(name: string): Promise<{ index: SearchIndex; collection: string; alias: boolean }> {
    const [row] = await this.conn.select().from(indexes).where(eq(indexes.name, name)).limit(1);
    if (!row) throw new SearchError('search/index-not-found', `Index ${name} not found`);
    return { index: json<SearchIndex>(row.definition), collection: row.target ?? row.name, alias: row.target !== null };
  }

  /**
   * Stores documents under `into.collection`, or under whatever collection the index `into.index` points
   * at when the statement runs. That is read with a share lock on the index row, held to the end of the
   * transaction: an alias swap waits for this write and then clears it with the rest of the old
   * collection, so a write can't land in a collection that was just dropped and stay there for good.
   */
  private async write(conn: DrizzleDb, index: SearchIndex, into: { collection: string } | { index: string }, docs: SearchDocument[]): Promise<void> {
    // The same id twice in one statement is refused by Postgres; the later one wins
    const unique = new Map<string, SearchDocument>();
    for (const document of docs) {
      assertDocument(index, document);
      unique.set(document.id, document);
    }
    const collection =
      'collection' in into
        ? sql`select ${into.collection}::text as collection`
        : sql`select coalesce(i.target, i.name) as collection from ${indexes} i where i.name = ${into.index} for share`;
    const all = [...unique.values()];
    for (let i = 0; i < all.length; i += INSERT_BATCH) {
      const values = all.slice(i, i + INSERT_BATCH).map((document) => sql`(${document.id}::text, ${JSON.stringify(document)}::jsonb, ${searchText(index, document)}::text)`);
      await conn.execute(sql`
        insert into ${documents} (collection, id, document, text)
        select c.collection, v.id, v.document, v.text
        from (${collection}) c cross join (values ${sql.join(values, sql`, `)}) as v(id, document, text)
        on conflict (collection, id) do update set document = excluded.document, text = excluded.text, updated_at = now()
      `);
    }
  }

  async indexDocument(indexName: string, document: SearchDocument): Promise<void> {
    await this.indexDocuments(indexName, [document]);
  }

  async indexDocuments(indexName: string, docs: SearchDocument[]): Promise<void> {
    try {
      const { index } = await this.lookup(indexName);
      await this.write(this.conn, index, { index: indexName }, docs);
    } catch (error) {
      throw toSearchError(error, 'search/request-failed', `Failed to index documents in ${indexName}`);
    }
  }

  async removeDocument(indexName: string, documentId: string): Promise<void> {
    try {
      await this.conn.execute(sql`
        delete from ${documents}
        where id = ${documentId} and collection = (select coalesce(target, name) from ${indexes} where name = ${indexName})
      `);
    } catch (error) {
      throw toSearchError(error, 'search/request-failed', `Failed to remove document ${documentId} from ${indexName}`);
    }
  }

  /**
   * Replaces everything `alias` shows with `docs`, in one transaction: a reader sees the old
   * documents until the commit and the new ones after it, never a mix and never nothing. An index
   * created with `createIndex` under the same name becomes the alias.
   */
  async reindexAlias(alias: string, index: SearchIndex, docs: SearchDocument[]): Promise<void> {
    for (const field of index.fields) mapFieldType(field.type);
    const definition = { ...index, name: alias };
    const swap = async (tx: DrizzleDb): Promise<void> => {
      // One rebuild of an alias at a time; a second waits here and then replaces the first's result
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`mariachi_search:${alias}`}::text))`);
      const [previous] = await tx.select().from(indexes).where(eq(indexes.name, alias)).limit(1);
      const collection = `${alias}:${randomUUID()}`;
      await this.write(tx, definition, { collection }, docs);
      await tx
        .insert(indexes)
        .values({ name: alias, definition, target: collection })
        .onConflictDoUpdate({ target: indexes.name, set: { definition, target: collection, updatedAt: sql`now()` } });
      if (previous) await tx.delete(documents).where(eq(documents.collection, previous.target ?? previous.name));
    };
    try {
      const outer = currentTransaction() as DrizzleDb | undefined;
      if (outer) await swap(outer);
      else await this.db.transaction((tx) => swap(tx as unknown as DrizzleDb));
    } catch (error) {
      throw toSearchError(error, 'search/request-failed', `Failed to reindex ${alias}`);
    }
  }

  async search<T = SearchDocument>(indexName: string, query: SearchQuery): Promise<SearchResult<T>> {
    const started = performance.now();
    const found = await this.lookup(indexName);
    const result = await this.searchIn<T>(indexName, found.index, found.collection, query, started);
    if (result.total > 0 || !found.alias) return result;
    // Nothing found through an alias: it may have been swapped after it was read, which empties the old
    // collection. Read it again, and search once more if it moved.
    const now = await this.lookup(indexName);
    return now.collection === found.collection ? result : this.searchIn<T>(indexName, now.index, now.collection, query, started);
  }

  private async searchIn<T>(indexName: string, index: SearchIndex, collection: string, query: SearchQuery, started: number): Promise<SearchResult<T>> {
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

    // Given as a value, not looked up in the statement: the planner then knows how large this collection is
    const conditions: SQL[] = [sql`d.collection = ${collection}`];
    let score: SQL = sql`0::real`;
    let match: SQL | undefined;
    if (!everything) {
      match = this.tsquery(text);
      const stored = sql`to_tsvector(${this.config}, d.text)`;
      const covered = queryFields.every((field) => textFields.includes(field));
      const all = covered && queryFields.length === textFields.length;
      // Only some of the fields: the stored text narrows the rows through its index, the chosen fields decide
      const chosen = sql`to_tsvector(${this.config}, concat_ws(' ', ${sql.join(queryFields.map((field) => sql`d.document->>${field}::text`), sql`, `)}))`;
      if (covered) conditions.push(sql`${stored} @@ ${match}`);
      if (!all) conditions.push(sql`${chosen} @@ ${match}`);
      score = sql`ts_rank(${all ? stored : chosen}, ${match})`;
    }
    for (const [key, value] of Object.entries(query.filters ?? {})) conditions.push(this.filter(index, key, value));
    const where = sql.join(conditions, sql` and `);

    const order: SQL[] = [...this.sort(indexName, index, query.sort), sql`score desc`];
    if (index.defaultSortingField) order.push(sql`(d.document->>${index.defaultSortingField}::text)::double precision desc nulls last`);
    order.push(sql`d.id asc`);

    // Highlights are made for the page's rows only, after the limit
    const highlighted = match ? queryFields.filter((name) => index.fields.some((f) => f.name === name && mapFieldType(f.type) === 'string')).slice(0, 5) : [];
    const headlines = highlighted.map((field, n) => sql`, ts_headline(${this.config}, p.document->>${field}::text, ${match}, ${HEADLINE}::text) as ${sql.raw(`h${n}`)}`);

    try {
      const pageRows = rows<{ document: unknown; score: number | string; total: number | string } & Record<string, string | null>>(
        await this.conn.execute(sql`
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
        const [counted] = rows<{ total: number | string }>(await this.conn.execute(sql`select count(*) as total from ${documents} d where ${where}`));
        total = Number(counted?.total ?? 0);
      }
      const facetCounts = query.facets?.length ? await this.facets(indexName, index, where, query.facets) : undefined;
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
    } catch (error) {
      throw toSearchError(error, 'search/query-failed', `Search on ${indexName} failed`);
    }
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
      const value = scalar === 'string' ? sql`d.document->>${name}::text` : scalar === 'bool' ? sql`(d.document->>${name}::text)::boolean` : sql`(d.document->>${name}::text)::double precision`;
      return sql`${value} ${sql.raw(direction)} nulls last`;
    });
  }

  /** How many of the matching documents have each value of each facet field, most frequent first. */
  private async facets(indexName: string, index: SearchIndex, where: SQL, fields: string[]): Promise<NonNullable<SearchResult['facetCounts']>> {
    const out: NonNullable<SearchResult['facetCounts']> = {};
    for (const field of fields) {
      if (!index.fields.some((f) => f.name === field && f.facet)) {
        throw new SearchError('search/invalid-input', `Field ${field} of ${indexName} is not a facet (declare it with facet: true)`);
      }
      const counted = rows<{ value: string; count: number | string }>(
        await this.conn.execute(sql`
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
        `),
      );
      out[field] = counted.map((row) => ({ value: row.value, count: Number(row.count) }));
    }
    return out;
  }
}

/** A search client on the app's own database. Call `connect()` once at startup: it adds the GIN indexes. */
export function createPostgresSearch(db: DrizzleDb, options?: PostgresSearchOptions): PostgresSearchAdapter {
  return new PostgresSearchAdapter(db, options);
}
