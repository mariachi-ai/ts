---
'@mariachi/billing': minor
---

Stale usage can be settled. A usage record the provider never confirmed, and that is too old to
resend, used to sit in `billing_usage_records` with nothing able to clear it.

- `billing.listStaleUsage(ctx, { tenantId?, limit? })` lists them, across tenants unless one is named.
- `billing.settleStaleUsage(ctx, { tenantId, idempotencyKeys, outcome, note? })` records what a
  person found: `provider-has-it` or `written-off` (a note is required). It returns `{ settled,
  skipped }`, and settles only records that are still waiting and past the resend window.
- The usage stays in the totals. `getUsage(ctx, metric, range, { only: 'billed' | 'written-off' })`
  tells the two apart.
- `billing_usage_records` gains `settlement`, `settled_at`, `settled_by` and `settlement_note`
  (all nullable): generate a migration after upgrading. `forwarded_at` still means the provider's
  own confirmation. A custom `BillingStore` can add `settleUsage` and the `tenantId` option of
  `listPendingUsage` to support this.
