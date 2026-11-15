import { defineTable, column } from '@mariachi/database';

export const aiTelemetryTable = defineTable('ai_telemetry', {
  id:           column.uuid().primaryKey().defaultRandom(),
  sessionId:    column.text(),
  tenantId:     column.text().notNull(),
  model:        column.text().notNull(),
  inputTokens:  column.integer().notNull(),
  outputTokens: column.integer().notNull(),
  latencyMs:    column.integer().notNull(),
  costUsd:      column.numeric().notNull().precision(10, 6),
  /** True when the provider reported no usage (the call was cut short) and the tokens are an estimate. */
  estimated:    column.boolean().notNull().default(false),
  createdAt:    column.timestamp().notNull().defaultNow(),
});
