# @mariachi/search

Full-text search in your Postgres database, on Typesense, or in memory for tests, with typed
fields including arrays, safe equality filters, facets, alias-based zero-downtime reindexing and
query analytics.

**Status: beta.** Covered by unit tests, integration tests against Postgres and Typesense, and
the search contract suite, which all three adapters pass. The API can change before 1.0.

Guide: [search.md](../core/docs/search.md)

## Imports

| Import | What |
| --- | --- |
| `@mariachi/search` | `createSearch`, `DefaultSearch`, the Typesense and memory adapters, analytics, types |
| `@mariachi/search/postgres` | `createPostgresSearch(db, options?)`, `PostgresSearchAdapter`, `searchTables` |
| `@mariachi/search/schema` | `searchIndexesTable`, `searchDocumentsTable` |

The Postgres adapter needs `@mariachi/database-postgres` and `drizzle-orm`, which are optional peers.

## Public API

| Export | Purpose |
| --- | --- |
| `createSearch(config)` | `TypesenseSearchAdapter` or `MemorySearchAdapter` |
| `createPostgresSearch(db, { language?, maxFacetValues? })` | Search in the app's database: no search server, documents kept apart per tenant, and indexing joins the surrounding transaction |
| `DefaultSearch` | `search(ctx, index, query)`, `indexDocument`, `removeDocument`, `connect`, `disconnect`, `isHealthy`. `{ tenantScoped: true }` confines every call to `ctx.tenantId`'s documents (Postgres and memory adapters) |
| `SearchIndexer` | `syncDocument`, `removeDocument`, `reindexAll` (through an alias on Typesense, in one transaction on Postgres) |
| `SearchAnalytics`, `MemorySearchAnalytics`, `RedisListAnalytics` | Best-effort query analytics |
| `SearchIndex`, `SearchField`, `SearchFieldType`, `SearchQuery`, `SearchResult` | Types |

## Config

| Option | Env | Notes |
| --- | --- | --- |
| `adapter` | `SEARCH_ADAPTER` | `'typesense'` or `'memory'`. The Postgres adapter is built from the database handle, not from config |
| `url` | `TYPESENSE_URL` | Default `http://localhost:8108` |
| `apiKey` | `TYPESENSE_API_KEY` | Admin key for indexing, a search-only key for read-only processes |

Index options: `fields` (typed; `string`, `int32`, `int64`, `float`, `bool` and their `[]` arrays)
and `defaultSortingField` (numeric). Errors are `SearchError`.
