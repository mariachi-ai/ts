---
'@mariachi/schema': patch
'@mariachi/events': minor
---

`@mariachi/schema` now holds every framework table. It left out `billingInvoicesTable`,
`billingDisputesTable`, `authWebhookDedupTable` and `eventOutboxTable`, so an app that took its tables
from it had no table for invoice and dispute webhooks, auth webhook dedup or the outbox. A project
that exports everything from `@mariachi/schema` gets four new tables from its next
`mariachi db generate`.

`@mariachi/events` gains a dependency-free `./schema` subpath exporting `eventOutboxTable` (still
exported from `./outbox` too). A test now fails if a package's `./schema` table is missing from
`@mariachi/schema`.
