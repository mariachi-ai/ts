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
    /** When the provider confirmed it. Null: recorded here, not yet known to have reached the provider. */
    forwardedAt:    column.timestamp(),
    createdAt:      column.timestamp().notNull().defaultNow(),
  },
  {
    indexes: [
      index('billing_usage_metric_idx').on('tenantId', 'metricName', 'timestamp'),
      index('billing_usage_idem_uniq').on('tenantId', 'idempotencyKey').unique().where('idempotency_key IS NOT NULL'),
      index('billing_usage_pending_idx').on('createdAt').where('forwarded_at IS NULL'),
    ],
  },
);
