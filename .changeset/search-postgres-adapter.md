---
'@mariachi/search': minor
'@mariachi/database': minor
'@mariachi/database-postgres': minor
'@mariachi/core': patch
---

Full-text search in Postgres, so search doesn't need a search server.

- `createPostgresSearch(db)` from `@mariachi/search/postgres` is a `SearchClient` on the app's own
  database: the same indexes, typed fields, equality filters, sorting, facet counts, highlights
  and reindexing as the Typesense adapter, and it passes the same contract suite.
- Indexing inside `withTransaction` commits or rolls back with the business write. A reindex
  replaces an index's documents in one transaction, and a search reads its page, total and facet
  counts from one snapshot.
- **Tenant-scoped search.** `new DefaultSearch({ client, tenantScoped: true })` confines every
  call to the documents of `ctx.tenantId` and refuses a call without a tenant
  (`search/tenant-required`). It uses the new optional `SearchClient.forTenant(id)`, which the
  Postgres and memory adapters have. Without the option nothing changes.
- Matching is by whole words in any order, with the last word as a prefix. `{ language:
  'english' }` (or any text search configuration) adds stemming. There is no typo tolerance: use
  Typesense when you need it.
- New tables `mariachi_search_indexes` and `mariachi_search_documents` in
  `@mariachi/search/schema`. Add them to your schema file and migrate to use the adapter; the
  migration creates their GIN indexes. Apps that don't use the adapter need nothing.
- `@mariachi/database`: a `column.tsvector()` type and `index(...).using('gin' | 'gist' | 'brin' |
  'hash')`, which the Postgres compiler turns into the matching DDL.

**Changed:** the memory search adapter's `reindexAlias` now replaces the index's documents in
place; it no longer makes a second collection named `<alias>_<timestamp>`.
