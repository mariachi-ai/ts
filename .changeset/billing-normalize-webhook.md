---
"@mariachi/billing": minor
---

`BillingAdapter.normalizeWebhook(event, store)`: an adapter whose provider's events aren't Stripe's reads them itself into the normalized billing events, so the webhook handler, the mirror and replay work the same for any provider. A port method a provider can't do fails with `billing/not-supported`.
