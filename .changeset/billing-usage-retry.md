---
'@mariachi/billing': minor
---

A usage report whose provider call failed can be sent again. `reportUsage` records usage locally and
then reports it to the provider; if the second step failed, a retry with the same idempotency key
found the local record, returned `false` and never reached the provider, so local and provider usage
drifted apart for good. Now each record carries `forwardedAt`: a retry of a record the provider
never confirmed sends the recorded usage again, and `billing.forwardPendingUsage(ctx)` sends the
ones nobody retried (run it on a schedule). The Stripe adapter sends the key as the request's
idempotency key as well as the event identifier, and takes Stripe's "an event with this identifier
exists" as success, so resending is safe.

**Migration:** `billing_usage_records` gains a nullable `forwarded_at` column and an index
(`mariachi db generate`). Existing rows have it empty. Nothing more than a day old is ever resent
(the provider's own window for recognising a repeated key), so history is not reported again; rows
from the last day before the upgrade are resent once and deduplicated by the provider. To settle
them by hand: `update billing_usage_records set forwarded_at = created_at where forwarded_at is null`.
A custom `BillingStore` keeps working without the three new optional methods (`findUsageRecord`,
`markUsageForwarded`, `listPendingUsage`), with the old behaviour.
