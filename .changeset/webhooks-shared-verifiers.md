---
'@mariachi/webhooks': minor
---

Ready-made signature checks, so a webhook endpoint no longer starts with a hand-written HMAC class:

- `GitHubWebhookAuth` (`X-Hub-Signature-256`),
- `StripeWebhookAuth` (the `t=…,v1=…` scheme; deduplicated on the body's `id`, which a header-only
  check couldn't do),
- `StandardWebhookAuth` (Standard Webhooks and Svix: Clerk, Resend and others),
- `HmacWebhookAuth` (one HMAC header: any algorithm, hex or base64, an optional prefix).

Each verifies the exact bytes received, compares in constant time, refuses a timestamp more than
five minutes off where the scheme signs one, accepts several signatures and several secrets (for a
rotation), and fails at construction when no secret is configured.

Dedup only uses signed material: an id the signature covers (Stripe's body `id`, `webhook-id`), or a
digest of the signature where the sender signs only the body (GitHub, plain HMAC), so a captured
delivery resent under a new delivery-id header is still a duplicate. A tenant is authenticated too:
`tenantFromPayload` reads it from the signed body, and `tenantFromRequest` (a path parameter) is
only accepted with a per-tenant `secret` function, so a delivery counts for a tenant only if that
tenant's secret signed it.

The checks are also plain functions in the new dependency-free `@mariachi/webhooks/verify` subpath
(`verifyGitHubWebhook`, `verifyStripeWebhook`, `verifyStandardWebhook`, `verifyHmacSignature`, plus
`signStandardWebhook` and `signStripeWebhook` for tests and senders), throwing
`webhooks/invalid-signature`.
