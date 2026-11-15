import { SearchError } from '@mariachi/core';
import { mapFieldType } from '../field-types';
import type { SearchClient, SearchDocument, SearchIndex, SearchQuery, SearchResult } from '../types';

interface Collection {
  index: SearchIndex;
  /** Documents by tenant (`''` for a client that isn't tenant-scoped), then by id. */
  documents: Map<string, Map<string, SearchDocument>>;
}

const fieldsOf = (index: SearchIndex): string =>
  JSON.stringify([index.defaultSortingField ?? null, [...index.fields].sort((a, b) => a.name.localeCompare(b.name)).map((f) => [f.name, mapFieldType(f.type), f.facet ?? false, f.sort ?? null, f.index ?? true])]);

interface State {
  collections: Map<string, Collection>;
  connected: boolean;
}

/** In-process search used by tests and by the contract suite next to the real adapters. */
export class MemorySearchAdapter implements SearchClient {
  private readonly state: State;
  private readonly tenant: string;

  /** @internal The arguments are for `forTenant`; build one with `new MemorySearchAdapter()`. */
  constructor(state?: State, tenant = '') {
    this.state = state ?? { collections: new Map(), connected: false };
    this.tenant = tenant;
  }

  /** A client that sees only `tenantId`'s documents. Index definitions are shared. */
  forTenant(tenantId: string): MemorySearchAdapter {
    if (typeof tenantId !== 'string' || !tenantId) throw new SearchError('search/tenant-required', 'forTenant needs a tenant id');
    return new MemorySearchAdapter(this.state, tenantId);
  }

  async connect(): Promise<void> {
    this.state.connected = true;
  }

  async disconnect(): Promise<void> {
    this.state.connected = false;
  }

  async isHealthy(): Promise<boolean> {
    return this.state.connected;
  }

  async createIndex(index: SearchIndex): Promise<void> {
    for (const field of index.fields) mapFieldType(field.type);
    if (this.state.collections.has(index.name)) throw new SearchError('search/index-exists', `Collection ${index.name} already exists`);
    this.state.collections.set(index.name, { index, documents: new Map() });
  }

  async deleteIndex(name: string): Promise<void> {
    if (this.tenant) throw new SearchError('search/invalid-input', `An index belongs to every tenant: delete ${name} through the client that isn't tenant-scoped`);
    this.state.collections.delete(name);
  }

  /** This client's documents in a collection. */
  private mine(collection: Collection): Map<string, SearchDocument> {
    let mine = collection.documents.get(this.tenant);
    if (!mine) {
      mine = new Map();
      collection.documents.set(this.tenant, mine);
    }
    return mine;
  }

  async indexDocument(indexName: string, document: SearchDocument): Promise<void> {
    this.mine(this.collection(indexName)).set(document.id, document);
  }

  async indexDocuments(indexName: string, documents: SearchDocument[]): Promise<void> {
    for (const document of documents) await this.indexDocument(indexName, document);
  }

  async removeDocument(indexName: string, documentId: string): Promise<void> {
    this.mine(this.collection(indexName)).delete(documentId);
  }

  async search<T = SearchDocument>(indexName: string, query: SearchQuery): Promise<SearchResult<T>> {
    const collection = this.collection(indexName);
    const fields = query.queryBy?.length
      ? query.queryBy
      : collection.index.fields.filter((f) => f.type === 'string' || f.type === 'string[]').map((f) => f.name);
    if (fields.length === 0 && query.query !== '*') {
      throw new SearchError('search/missing-query-fields', `Collection ${indexName} has no string fields to query. Pass query.queryBy.`);
    }
    const needle = query.query.toLowerCase();
    const hits = [...this.mine(collection).values()].filter((doc) => {
      if (query.filters) {
        for (const [key, value] of Object.entries(query.filters)) {
          const actual = doc[key];
          // Like Typesense, `field:=value` on an array field matches when the array contains it.
          if (Array.isArray(actual) ? !actual.includes(value) : actual !== value) return false;
        }
      }
      if (!needle || needle === '*') return true;
      return fields.some((field) => String(doc[field] ?? '').toLowerCase().includes(needle));
    });
    const sorted = this.sorted(indexName, collection.index, hits, query.sort);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    return {
      hits: sorted.slice(start, start + pageSize).map((document) => ({ document: document as T, score: 1 })),
      total: sorted.length,
      page,
      pageSize,
      ...(query.facets?.length ? { facetCounts: this.facetCounts(indexName, collection.index, sorted, query.facets) } : {}),
      queryTimeMs: 0,
    };
  }

  /** `sort` as Typesense takes it: `field:asc` or `field:desc`, several separated by commas. */
  private sorted(indexName: string, index: SearchIndex, hits: SearchDocument[], sort: string | undefined): SearchDocument[] {
    if (!sort) return hits;
    const keys = sort.split(',').map((part) => {
      const [field, direction] = part.trim().split(':');
      if (!field || (direction !== 'asc' && direction !== 'desc')) {
        throw new SearchError('search/invalid-input', `sort "${part.trim()}" is not field:asc or field:desc`);
      }
      if (!index.fields.some((f) => f.name === field)) throw new SearchError('search/invalid-input', `Collection ${indexName} has no field ${field} to sort by`);
      return { field, factor: direction === 'desc' ? -1 : 1 };
    });
    return [...hits].sort((a, b) => {
      for (const { field, factor } of keys) {
        const [x, y] = [a[field], b[field]];
        if (x === y) continue;
        if (x === undefined || x === null) return 1;
        if (y === undefined || y === null) return -1;
        return (x < y ? -1 : 1) * factor;
      }
      return 0;
    });
  }

  /** How many of the matching documents have each value of each facet field, most frequent first. */
  private facetCounts(indexName: string, index: SearchIndex, hits: SearchDocument[], facets: string[]): NonNullable<SearchResult['facetCounts']> {
    const out: NonNullable<SearchResult['facetCounts']> = {};
    for (const field of facets) {
      if (!index.fields.some((f) => f.name === field && f.facet)) {
        throw new SearchError('search/invalid-input', `Field ${field} of ${indexName} is not a facet (declare it with facet: true)`);
      }
      const counts = new Map<string, number>();
      for (const doc of hits) {
        const value = doc[field];
        for (const one of Array.isArray(value) ? value : value === undefined || value === null ? [] : [value]) {
          counts.set(String(one), (counts.get(String(one)) ?? 0) + 1);
        }
      }
      out[field] = [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
    }
    return out;
  }

  /** Replaces this client's documents in the index, creating it or updating its fields as needed. */
  async reindexAlias(alias: string, index: SearchIndex, documents: SearchDocument[]): Promise<void> {
    for (const field of index.fields) mapFieldType(field.type);
    const existing = this.state.collections.get(alias);
    const collection: Collection = existing ?? { index: { ...index, name: alias }, documents: new Map() };
    if (existing && this.tenant && fieldsOf(existing.index) !== fieldsOf(index)) {
      throw new SearchError('search/invalid-input', `The fields of ${alias} belong to every tenant: change them through the client that isn't tenant-scoped`);
    }
    collection.index = { ...index, name: alias };
    this.state.collections.set(alias, collection);
    collection.documents.set(this.tenant, new Map(documents.map((document) => [document.id, document])));
  }

  private collection(name: string): Collection {
    const collection = this.state.collections.get(name);
    if (!collection) throw new SearchError('search/index-not-found', `Collection ${name} not found`);
    return collection;
  }
}
