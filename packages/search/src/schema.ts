import { column, defineTable, index } from '@mariachi/database';
import type { SearchDocument, SearchIndex } from './types';

/** The indexes of the Postgres search adapter (`@mariachi/search/postgres`): a name and its fields. */
export const searchIndexesTable = defineTable(
  'mariachi_search_indexes',
  {
    name:       column.text().primaryKey(),
    /** The fields, as given to `createIndex`. */
    definition: column.json().$type<SearchIndex>().notNull(),
    createdAt:  column.timestamp().notNull().defaultNow(),
    updatedAt:  column.timestamp().notNull().defaultNow(),
  },
  { tenantColumn: false, softDeleteColumn: false },
);

/**
 * The documents of the Postgres search adapter. `tsv` is what full-text search runs over: the
 * document's string fields, made into a search vector when the document is stored.
 *
 * `tenantId` is the tenant a document belongs to, or `''` for a client that isn't tenant-scoped.
 * The adapter puts it in every statement itself (`client.forTenant(id)`), which is why the table
 * doesn't use the repository's tenant column: there is no repository here.
 */
export const searchDocumentsTable = defineTable(
  'mariachi_search_documents',
  {
    tenantId:   column.text().notNull().default(''),
    collection: column.text().notNull(),
    id:         column.text().notNull(),
    document:   column.json().$type<SearchDocument>().notNull(),
    tsv:        column.tsvector().notNull(),
    updatedAt:  column.timestamp().notNull().defaultNow(),
  },
  {
    primaryKey: ['tenantId', 'collection', 'id'],
    tenantColumn: false,
    softDeleteColumn: false,
    indexes: [
      index('mariachi_search_documents_tsv_idx').on('tsv').using('gin'),
      // Equality filters are containment tests on the document
      index('mariachi_search_documents_document_idx').on('document').using('gin'),
    ],
  },
);
