# @mariachi/billing

## 0.1.0

### Minor Changes

- 402cc1a: Subscriptions with several prices: `subscribe`, `changePlan` and `createCheckout` accept `items: [{ priceId, quantity? }]` instead of `priceId` (exactly one of the two), a quantity is only sent when given (Stripe rejects one on a metered price), and `changePlan` with `items` replaces the item set by price. `Subscription.items` lists every item (`planId` and `quantity` stay the first item's), and `hasActiveSubscription` matches any item's price. Plans by lookup key: `Plan.lookupKey` and `Plan.productMetadata`, `findPlanByLookupKey(ctx, key)`, and `listPlans(ctx, { lookupKeys })`; price webhooks keep the product fields the mirror has. Allowance resets: `setCreditBalance(ctx, target, options)` appends the one ledger entry that reaches `target` under the ledger lock. The ledger's `currency` is documented as any 3-letter unit code. Dimensions: ledger entries and usage records take optional `dimensions`, summed per key by `summarizeCredits` and `getUsageBreakdown`. `StripeAdapter.listPlans({ activeOnly: false })` now lists every price rather than only inactive ones. `BillingStore` gains `findPlan`, `setCreditLedgerBalance`, `summarizeCreditsByDimension` and `summarizeUsageByDimension`, and `BillingAdapter.listPlans` takes `lookupKeys`.

  New columns: `billing_subscriptions.items`, `billing_plans.lookup_key` (indexed) and `billing_plans.product_metadata`, and `dimensions` on `billing_credit_transactions` and `billing_usage_records`. Run `mariachi db generate` to create the migration. All are nullable; subscriptions mirrored before the upgrade read `items: []` until their next webhook or sync.

- 8175310: `previewPlanChange(ctx, subscriptionId, patch)` reports what `changePlan` would bill without making the change, for a confirmation step. The result has the proration total, the invoice total and when that invoice is billed, the lines, and `prorationDate`. `changePlan` takes `prorationDate`; pass the preview's to bill exactly what was shown. Adapters gain `previewSubscriptionChange`: Stripe's uses `invoices.createPreview` with the same item changes the update sends, and the memory adapter's prorates by the time left in the period.
- 699dff8: `ensureCustomer(ctx, input, { verify: true })` asks the provider whether it still has the stored customer, and replaces one it doesn't have with a new customer. That happens when the customer was deleted at the provider, or was made by another adapter, such as the memory adapter's before a provider was configured. The tenant's credit ledger and usage records move to the new customer, so the balance carries over. The stores have a new `replaceCustomer(oldCustomerId, customer, occurredAt)`, which does this atomically.
- fbafcf6: A usage report whose provider call failed can be sent again. `reportUsage` records usage locally and
  then reports it to the provider; if the second step failed, a retry with the same idempotency key
  found the local record, returned `false` and never reached the provider, so local and provider usage
  drifted apart for good. Now `reportUsage` marks each record as waiting until the provider confirms
  it: a retry of a waiting record sends the recorded usage again, and
  `billing.forwardPendingUsage(ctx)` sends the ones nobody retried (run it on a schedule) and returns
  `{ forwarded, failed, stale }`. Neither resends a record more than a day old, the provider's window
  for recognising a repeated event identifier; `stale` counts those. The Stripe adapter treats
  Stripe's "an event with this identifier exists" as success.

  **Migration:** `billing_usage_records` gains `forward_pending` (false by default), a nullable
  `forwarded_at` and an index (`mariachi db generate`). Existing rows are not pending, so nothing
  recorded before the upgrade is ever resent. A custom `BillingStore` keeps working without the four
  new optional methods (`findUsageRecord`, `markUsageForwarded`, `listPendingUsage`,
  `countPendingUsage`), with the old behaviour.

- 662ccc5: Finish the domain packages, verified with integration tests against Postgres, Redis, Typesense and MinIO, and contract suites shared by the real adapters and the test doubles. The Phase 6 packages move from alpha to beta.

  Breaking changes:
  - audit: `AuditQuery.find` and `findByResource` take `ctx` first; `RepositoryAuditQuery` no longer takes a context in its constructor. Reads are scoped to `ctx.tenantId`. The canonical hash form now sorts keys and includes `ipAddress` and `userAgent`, so chains written before this release don't verify.
  - notifications: `InAppNotificationStore.markRead(id, userId)` requires the recipient. `NotificationQueue.enqueue(ctx, name, data, { dedupKey })` matches `DefaultJobs.enqueue`. `DeliveryStore` keeps one row per notification and channel (`get`, `updateByExternalId`). Email template values are HTML-escaped; use `{{{name}}}` for raw HTML.
  - ai: `ai_sessions.id` and `ai_messages.session_id` are text, and `ai_messages` gains `position`. Unknown models cost 0 (with a warning) instead of `gpt-4o-mini` rates, and `costTable` merges over the defaults.
  - search: `SearchField.type` is a closed union (arrays allowed). `default_sorting_field` is only set from `SearchIndex.defaultSortingField`.
  - integrations: `IntegrationRegistry.register` throws when a listed function has no handler, or the integration is already registered.
  - rate-limit: an unknown explicit tier name throws `rate-limit/unknown-tier` instead of falling back to `default`. Fixed-window counters move to a hash (existing counters reset once).
  - core: new HTTP mappings for `rate-limit/backend-failed` (503), `rate-limit/unknown-tier` (500), `auth/unknown-role` (400), `storage/invalid-signature` (403), `search/missing-query-fields` (400), `integrations/invalid-signature` (401) and upstream AI and integration failures (502).

  Added: `DrizzleAuditLog` with a database-backed hash chain, `verifyChain`, retention and export; `DrizzleApiKeyStore`, `DrizzleRoleStore.defineRole` and DB-backed RBAC permissions; `AnthropicAdapter` (`@mariachi/ai/anthropic`) and cross-provider fallback for generate and stream; `ai.costTable`, `ai.fallbackModels` and `ai.anthropicApiKey` config; feature flag writes and tenant overrides; billing plan mirroring (`syncPlans`, `price.*` webhooks); `DefaultRateLimiting.consumeTier` and `resolveTier`; `notificationJobSchema`; `resolveTenantCredential(..., { fallbackToGlobal: false })`; `ctx.request.rawBody` in facade handlers for local signed-URL uploads.

  Fixed: concurrent auth webhook deliveries could both claim an event; API key rotation could leave a tenant without a key; notification retries multiplied between the queue and the service and duplicated deliveries; S3 `putStream` failed for streams of unknown length; Typesense index creation failed with a sort field, alias schemas were lost on restart, and reindexing leaked collections; string search filters weren't quoted; `reset` didn't clear fixed-window limits; token-bucket `retryAfterMs` reported the whole window; prompt versions sorted as strings.

- 662ccc5: Complete the domain packages: billing replay and automatic idempotency keys, notification dispatch, AI sessions with budgets and fallback, append-only audit chaining, database-backed RBAC and API key rotation, and the storage, search, rate-limit, and integration gaps.

### Patch Changes

- 8a56f66: Peer dependencies on `@mariachi/database`, `@mariachi/database-postgres` and `@mariachi/explorer` accept any 0.x release (`>=0.0.5 <1`) instead of one exact version. A minor release no longer forces a major one: changesets bumped every peer dependent to major, and the fixed group took every package with it.
- Updated dependencies [2fd4011]
- Updated dependencies [bb7f53a]
- Updated dependencies [44879db]
- Updated dependencies [6ad742b]
- Updated dependencies [92577a6]
- Updated dependencies [47f9687]
- Updated dependencies [da7d762]
- Updated dependencies [662ccc5]
- Updated dependencies [fcdeb4e]
- Updated dependencies [ea2f8fc]
- Updated dependencies [662ccc5]
- Updated dependencies [879b40f]
  - @mariachi/core@0.1.0
  - @mariachi/database@0.1.0
