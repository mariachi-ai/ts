---
"@mariachi/integrations": minor
"@mariachi/core": minor
"@mariachi/observability": minor
"@mariachi/testing": minor
---

Integrations: one way to call a provider. `callProvider` and `providerRequest` give every call one CLIENT span with a fixed set of attributes, the calls and duration metrics, and retries of rate limits and outages that honour `Retry-After`. `ProviderError` carries one of seven categories. `receiveProviderWebhook` gives inbound webhooks a SERVER span, with `verifyStandardWebhook` and HMAC helpers for the signature schemes providers use. `@mariachi/integrations/testing` has `scriptedFetch` and `assertProviderSpans`.

Core: `TracerAdapter.startSpan` takes an optional `{ kind }`, and `Span` an optional `addEvent`. The OpenTelemetry and test tracers support both.
