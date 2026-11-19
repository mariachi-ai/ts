import { column, defineTable, index } from '@mariachi/database';

/**
 * The state of `PostgresRateLimiter`: one row per limited key. Each check rewrites its key's row in
 * one statement, so the row holds only what that key's algorithm needs:
 *
 * - `fixed-window`: `windowStart` and `used` (the cost admitted in that window).
 * - `sliding-window`: `hits`, the admitted requests of the last window as `[serverTimeMs, cost]` pairs,
 *   oldest first. At most `maxRequests` entries.
 * - `token-bucket`: `tokens` left as of `updatedMs`.
 *
 * Times are the database server's clock in milliseconds, so every process shares one timeline.
 * Past `expiresAt` a row says nothing a fresh one wouldn't, and the limiter deletes it.
 */
export const rateLimitBucketsTable = defineTable(
  'rate_limit_buckets',
  {
    /** The limiter's prefix and the caller's key, `ratelimit:user:t1:ada`. */
    key:         column.text().primaryKey(),
    /** The algorithm that wrote the row. A check with another algorithm starts the key afresh. */
    algorithm:   column.text().notNull(),
    windowStart: column.bigint(),
    used:        column.double(),
    hits:        column.json().$type<Array<[number, number]>>(),
    tokens:      column.double(),
    /** Whether the last check was admitted: read back by the statement that made it. */
    allowed:     column.boolean().notNull(),
    /** Server time of the last check, in ms. Never moves backwards for a key. */
    updatedMs:   column.bigint().notNull(),
    expiresAt:   column.timestamp().notNull(),
  },
  {
    tenantColumn: false,
    softDeleteColumn: false,
    indexes: [index('rate_limit_buckets_expires_at_idx').on('expiresAt')],
  },
);
