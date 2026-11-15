import { defineTable, column, index } from '@mariachi/database';

export const billingUsageRecordsTable = defineTable(
  'billing_usage_records',
  {
    id:             column.uuid().primaryKey().defaultRandom(),
    tenantId:       column.text().notNull(),
    customerId:     column.text().notNull(),
    metricName:     column.text().notNull(),
    quantity:       column.bigint().notNull(),
    timestamp:      column.timestamp().notNull(),
    idempotencyKey: column.text(),
    dimensions:     column.json().$type<Record<string, string>>(),
    /**
     * True from the moment the billing service records the usage until the provider confirms it.
     * False by default, so rows written before this column existed (or by anything else) are never
     * taken for unsent and resent.
     */
    forwardPending: column.boolean().notNull().default(false),
    /** When the provider confirmed it. Only the provider's own answer sets this. */
    forwardedAt:    column.timestamp(),
    /**
     * How a person settled a record the provider never confirmed and that is too old to resend:
     * `provider-has-it` or `written-off`. Null for every other record.
     */
    settlement:     column.text(),
    settledAt:      column.timestamp(),
    /** Who settled it: the user or API key of the request. */
    settledBy:      column.text(),
    /** Their reason. Required to write a record off. */
    settlementNote: column.text(),
    createdAt:      column.timestamp().notNull().defaultNow(),
  },
  {
    indexes: [
      index('billing_usage_metric_idx').on('tenantId', 'metricName', 'timestamp'),
      index('billing_usage_idem_uniq').on('tenantId', 'idempotencyKey').unique().where('idempotency_key IS NOT NULL'),
      index('billing_usage_pending_idx').on('createdAt').where('forward_pending'),
    ],
  },
);
