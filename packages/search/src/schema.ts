import { column, defineTable } from '@mariachi/database';
import type { SearchDocument, SearchIndex } from './types';

/**
 * The indexes of the Postgres search adapter (`@mariachi/search/postgres`). A row is an index, or an
 * alias: `target` then names the collection of documents it points at, which `reindexAlias` swaps.
 */
export const searchIndexesTable = defineTable(
  'mariachi_search_indexes',
  {
    name:       column.text().primaryKey(),
    /** The fields, as given to `createIndex`. */
    definition: column.json().$type<SearchIndex>().notNull(),
    /** For an alias: the collection its documents are stored under. */
    target:     column.text(),
    createdAt:  column.timestamp().notNull().defaultNow(),
    updatedAt:  column.timestamp().notNull().defaultNow(),
  },
  { tenantColumn: false, softDeleteColumn: false },
);

/**
 * The documents of the Postgres search adapter. `text` is what full-text search runs over: the
 * document's string fields. The adapter adds the two GIN indexes search needs when it connects
 * (the table builder has no expression indexes); see the search doc for the statements.
 */
export const searchDocumentsTable = defineTable(
  'mariachi_search_documents',
  {
    collection: column.text().notNull(),
    id:         column.text().notNull(),
    document:   column.json().$type<SearchDocument>().notNull(),
    text:       column.text().notNull().default(''),
    updatedAt:  column.timestamp().notNull().defaultNow(),
  },
  { primaryKey: ['collection', 'id'], tenantColumn: false, softDeleteColumn: false },
);
