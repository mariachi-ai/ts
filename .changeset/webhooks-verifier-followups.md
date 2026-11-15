---
'@mariachi/webhooks': patch
---

Webhook verifiers: a Stripe-style delivery whose signed body has no `id` is deduplicated on a
digest of the signature that matched (it had no dedup key at all, leaving only the timestamp
tolerance against a replay); and the Stripe-style and Standard Webhooks checks compute the MAC over
the timestamp exactly as sent, so a sender that writes it with a leading zero is no longer refused.
