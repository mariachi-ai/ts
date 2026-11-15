---
'@mariachi/search': minor
'@mariachi/schema': minor
---

Full-text search in Postgres, so search doesn't need a search server.

- `createPostgresSearch(db)` from `@mariachi/search/postgres` is a `SearchClient` on the app's own
  database: the same indexes, typed fields, equality filters, sorting, facet counts, highlights
  and alias reindexing as the Typesense adapter, and it passes the same contract suite.
- Indexing inside `withTransaction` commits or rolls back with the business write, and
  `reindexAlias` swaps in one transaction: readers see the old documents or the new ones, never
  neither.
- Matching is by whole words in any order, with the last word as a prefix. `{ language:
  'english' }` (or any text search configuration) adds stemming. There is no typo tolerance: use
  Typesense when you need it.
- New tables `mariachi_search_indexes` and `mariachi_search_documents`, exported from
  `@mariachi/search/schema` and `@mariachi/schema`. Add them to your schema file and migrate to
  use the adapter; apps that don't use it need nothing. `connect()` adds the two GIN indexes, or
  run `searchIndexStatements()` in a migration and pass `manageIndexes: false`.
