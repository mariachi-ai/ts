import { defineTable, column, index } from '@mariachi/database';

export const sessionsTable = defineTable('sessions', {
  id:           column.uuid().primaryKey().defaultRandom(),
  userId:       column.text().notNull(),
  tenantId:     column.text().notNull(),
  /** sha256 of the opaque session token; the token itself is never stored. */
  tokenHash:    column.text().notNull().unique(),
  scopes:       column.json().notNull().default([]),
  userAgent:    column.text(),
  ipAddress:    column.text(),
  metadata:     column.json(),
  expiresAt:    column.timestamp().notNull(),
  revokedAt:    column.timestamp(),
  createdAt:    column.timestamp().notNull().defaultNow(),
  lastActiveAt: column.timestamp().notNull().defaultNow(),
}, {
  // A user's sessions (list, sign out everywhere) and the purge of expired ones.
  indexes: [index('sessions_user_id_idx').on('userId'), index('sessions_expires_at_idx').on('expiresAt')],
});
