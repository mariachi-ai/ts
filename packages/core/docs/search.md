# Search

`@mariachi/search` indexes your data and queries it with typed fields, filters, facets and query
analytics. The index lives in your Postgres database, in Typesense, or in memory for tests; the
API is the same for all three.

| Adapter | Needs | Matching | Choose it when |
| --- | --- | --- | --- |
| Postgres (`@mariachi/search/postgres`) | the database you already have | whole words, the last word as a prefix; stemming with a language | you want search without another server, or indexing in the same transaction as the write |
| Typesense | a Typesense server | prefixes and typo tolerance | you need typo tolerance, or search load off the database |
| memory | nothing | substring | tests |

## Wire it

```ts
import { DefaultSearch, SearchAnalytics, SearchIndexer, RedisListAnalytics, createSearch, type SearchIndex } from '@mariachi/search';

const client = createSearch({ adapter: 'typesense', url: config.search.url, apiKey: config.search.apiKey });
const search = new DefaultSearch({ client, analytics: new SearchAnalytics({ store: new RedisListAnalytics(redis) }) }, instrumentation);
lifecycle.manage('search', search);   // connect loads every collection and alias from Typesense
```

On Postgres the client is built from the database handle, and the rest is the same:

```ts
import { createPostgresSearch } from '@mariachi/search/postgres';

const client = createPostgresSearch(database.db);                 // or { language: 'english' } to stem
const search = new DefaultSearch({ client }, instrumentation);
lifecycle.manage('search', search);   // connect adds the two GIN indexes if they are missing
```

Add `searchIndexesTable` and `searchDocumentsTable` (from `@mariachi/search/schema`, or
`@mariachi/schema`) to your schema file and migrate. See [Postgres](#postgres) below.

## Define an index

```ts
const products = {
  name: 'products',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'tags', type: 'string[]', facet: true },
    { name: 'tenantId', type: 'string', facet: true },
    { name: 'price', type: 'float' },
    { name: 'popularity', type: 'int32' },
  ],
  defaultSortingField: 'popularity',   // optional; numeric, and every document must have it
} satisfies SearchIndex;
```

Field types are `string`, `int32`, `int64`, `float`, `bool` (aliases: `int`, `number`, `boolean`)
and array forms such as `string[]`. Any other type is a compile error and a runtime
`search/invalid-field-type`. Fields are optional unless they're the default sorting field.

## Query

```ts
const result = await search.search<Product>(ctx, 'products', {
  query: 'wool hat',
  queryBy: ['title'],                               // default: every string field of the index
  filters: { tenantId: ctx.tenantId!, tags: 'winter' },
  facets: ['tags'],
  sort: 'price:asc',
  page: 1, pageSize: 20,
});
```

- Without `queryBy`, the index's string fields are searched. An index with no string fields
  requires `queryBy` (`search/missing-query-fields`); there's no `'.*'` wildcard default.
- Filters are equality filters joined with `&&`. On an array field, a filter matches when the
  array contains the value. String values are quoted, so a value containing `&&` or `,` stays one
  value; a value containing a backtick is rejected (`search/invalid-input`).
- Search isn't tenant-scoped by itself. Put `tenantId` in your documents and filter on it (or use
  one index per tenant).
- Schemas come from Typesense (or the database), so a process that never created an index can
  still query it or its alias.

## Reindex without downtime

```ts
await new SearchIndexer(client).reindexAll('products', products, allProducts);
```

With Typesense, `reindexAll` builds a new collection (`products_<timestamp>`), fills it, points the
`products` alias at it, and then deletes the collection the alias used before. Readers query the
alias throughout. An existing *collection* named `products` blocks this (`search/alias-conflict`):
delete or rename it once, then reindex.

On Postgres the swap is one transaction: readers see the old documents until it commits and the new
ones after, and an index created with `createIndex` under the same name simply becomes the alias
(no `search/alias-conflict`).

## Postgres

- **Matching.** Every word of the query must be in the document, in any order and case; the last word
  may be the start of a word, so results narrow as someone types. Nothing typed is an operator. There
  is no typo tolerance: "mariachi" does not find "mariaci".
- **Language.** The default configuration, `simple`, compares words as written, in any language.
  `createPostgresSearch(db, { language: 'english' })` stems ("runs" finds "running") and drops stop
  words; any configuration your Postgres has works. One configuration per client.
- **In the transaction.** Inside `withTransaction`, `indexDocument` and `removeDocument` commit or
  roll back with your write, so the index can't disagree with the table it describes:

  ```ts
  await withTransaction(db, ctx, async () => {
    const product = await products.create(ctx, input);
    await search.indexDocument(ctx, 'products', { id: product.id, title: product.title, tenantId: product.tenantId });
  });
  ```

- **Documents are checked.** A declared field must hold its declared type or be absent
  (`search/invalid-input`). Fields you don't declare are stored and can be filtered on, including
  nested ones (`filters: { 'owner.team': 'red' }`).
- **Order.** Relevance first, then `defaultSortingField` (highest first), then id. `sort` takes any
  declared field that isn't a list.
- **Highlights.** `hit.highlights[field]` wraps the matched words of each searched string field in
  `<mark>`. The rest of the text is your document's, unescaped: escape it before putting it in a page.
- **Limits.** `pageSize` up to 250. The first 250,000 characters of a document's string fields are
  searchable. Past a few million documents, or when search traffic competes with your writes, move
  that index to Typesense: the calls don't change.
- **Indexes.** `connect()` runs `searchIndexStatements(language)`: a GIN index on the text for that
  language and one on the document for filters. If the app's role can't create indexes, pass
  `manageIndexes: false` and put those statements in a migration.

## Analytics

`SearchAnalytics` records query, index, hit count and latency for every search, in memory or in
a capped Redis list (`RedisListAnalytics`, 10,000 entries by default). Recording is best-effort: an
analytics failure is logged and the search still returns.

## Errors

`SearchError`: `search/invalid-field-type`, `search/invalid-input` (400),
`search/missing-query-fields` (400), `search/index-not-found` (404), `search/index-exists` and
`search/alias-conflict` (409), `search/query-failed` and `search/request-failed`.
