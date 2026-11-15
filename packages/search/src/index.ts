import type { SearchConfig, SearchClient } from './types';
import { SearchError } from '@mariachi/core';
import { TypesenseSearchAdapter } from './adapters/typesense';
import { MemorySearchAdapter } from './adapters/memory';

export type {
  SearchConfig,
  SearchDocument,
  SearchQuery,
  SearchResult,
  SearchIndex,
  SearchField,
  SearchFieldType,
  SearchClient,
} from './types';

export function createSearch(config: SearchConfig): SearchClient {
  if (config.adapter === 'typesense') {
    const url = config.url ?? 'http://localhost:8108';
    const apiKey = config.apiKey ?? '';
    return new TypesenseSearchAdapter({ url, apiKey });
  }
  if (config.adapter === 'memory') return new MemorySearchAdapter();
  if (config.adapter === 'postgres') {
    // It needs the app's database handle, which a config object can't carry
    throw new SearchError('search/unknown-adapter', "The Postgres search adapter is built from a database: createPostgresSearch(db) from '@mariachi/search/postgres'");
  }
  throw new SearchError('search/unknown-adapter', `Unknown search adapter: ${config.adapter}`);
}

export { SearchIndexer } from './indexer';
export { TypesenseSearchAdapter } from './adapters/typesense';
export { MemorySearchAdapter } from './adapters/memory';
export { Search, DefaultSearch } from './search';
export { SearchAnalytics, MemorySearchAnalytics, RedisListAnalytics } from './analytics';
export type { SearchAnalyticsEntry, SearchAnalyticsStore, RedisList } from './analytics';
