---
'@mariachi/webhooks': minor
---

Ready-made signature checks, so a webhook endpoint no longer starts with a hand-written HMAC class:

- `GitHubWebhookAuth` (`X-Hub-Signature-256`, deduplicated on `X-GitHub-Delivery`),
- `StripeWebhookAuth` (the `t=…,v1=…` scheme; deduplicated on the body's `id`, which a header-only
  check couldn't do),
- `StandardWebhookAuth` (Standard Webhooks and Svix: Clerk, Resend and others),
- `HmacWebhookAuth` (one HMAC header: any algorithm, hex or base64, an optional prefix).

Each verifies the exact bytes received, compares in constant time, refuses a timestamp more than
five minutes off where the scheme signs one, accepts several signatures and several secrets (for a
rotation), and fails at construction when no secret is configured.

The checks are also plain functions in the new dependency-free `@mariachi/webhooks/verify` subpath
(`verifyGitHubWebhook`, `verifyStripeWebhook`, `verifyStandardWebhook`, `verifyHmacSignature`, plus
`signStandardWebhook` and `signStripeWebhook` for tests and senders), throwing
`webhooks/invalid-signature`.
