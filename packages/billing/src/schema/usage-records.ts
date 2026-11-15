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
    /** When the provider confirmed it. */
    forwardedAt:    column.timestamp(),
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
