---
'@mariachi/billing': minor
---

A usage report whose provider call failed can be sent again. `reportUsage` records usage locally and
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
