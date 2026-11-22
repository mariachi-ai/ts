# @mariachi/integrations

Building blocks for third-party integrations: functions with validated input and output and
retries, per-tenant credentials (optionally encrypted), a registry that can call functions by name,
and webhook signature checks. `integrations/slack/` in this repository is the reference
implementation.

**Status: beta.** Covered by unit tests. The API can change before 1.0.

Guide: [integrations.md](../core/docs/integrations.md), recipe: [add-integration.md](../core/docs/recipes/add-integration.md)

## Public API

| Export | Purpose |
| --- | --- |
| `defineIntegrationFn(def)` | `{ name, input, output, handler, retry? }` → a callable function; input is validated once, and missing credentials and invalid input aren't retried |
| `defineWebhookHandler(def)` | `{ verify, parse, handle }`, verified before parsing |
| `IntegrationRegistry` | `register` (every listed function needs a handler), `get`, `getAll`, `call(name, input, ctx)` |
| `resolveTenantCredential(ctx, key, secrets, decryptor?, options?)` | Tenant secret, then global unless `fallbackToGlobal: false`; decrypted when a decryptor is given |
| `verifySlackSignature`, `assertSlackSignature` | Slack `v0` signatures with a five-minute replay window |
| `callProvider(ctx, call, fn, deps?)` | Runs one call to a provider: one CLIENT span named `<integration> <operation>`, the calls and duration metrics, and retries (below) |
| `providerRequest(ctx, call, request, options)` | One HTTP call through `callProvider`: JSON or form body, query, idempotency key, the answer checked with Zod, a failed answer turned into the integration's error |
| `ProviderError`, `ERROR_CATEGORIES`, `categoryForStatus`, `parseRetryAfter`, `parseRateLimitReset` | The error every provider call fails with: a code `<integration>/<reason>`, one of seven categories, the provider's own code in `providerCode` (never its message), `status` and `retryAfterMs` |
| `PROVIDER_SPAN_ATTRIBUTES`, `PROVIDER_METRICS` | Every attribute a provider call's span may carry, and the two metric names |
| `@mariachi/integrations/testing`: `scriptedFetch`, `assertProviderSpans` | A `fetch` that answers from a script and records requests; a check that spans carry only the allowed attributes |

## Calling a provider

Every call an integration makes to its provider goes through `callProvider`, usually by way of
`providerRequest`. No package sets span attributes of its own.

- **The span:** kind CLIENT, named `<integration> <operation>` (`hubspot contacts.create`), with only
  the attributes in `PROVIDER_SPAN_ATTRIBUTES`. `mariachi.tenant_id` is recorded only with
  `deps.tenantAttribute: true`. Without `deps.tracer` the span goes through `@opentelemetry/api`'s
  global provider when that package is installed, and nothing is recorded when it isn't.
- **Metrics:** `mariachi.integration.calls` and `mariachi.integration.duration`, labelled with the
  integration, operation, category and outcome, when `deps.metrics` is given.
- **Retries:** up to three attempts, of `rate-limited` and `unavailable` failures and a provider that
  can't be reached. Each retry is a span event.
  - The wait is the provider's `Retry-After` (or, after a rate limit only, its `X-RateLimit-Reset`),
    else exponential backoff.
  - No wait is longer than `deps.retry.maxDelayMs` (10 seconds by default). A provider that asks for
    longer fails at once with `retryAfterMs` on the error, so the app can reschedule the work.
  - No wait runs past `deps.signal`: when the caller's deadline fires, the last failure is thrown.
  - A POST or PATCH without an idempotency key is retried only after a rate limit, never after an
    outage (the provider may have acted). An answer in the wrong shape (`<integration>/invalid-response`)
    isn't retried.
- **Headers:** a caller's `Accept` or `Content-Type` replaces the default, in any case.

## Config

Integrations read credentials from `@mariachi/config` secrets (per tenant where needed); nothing
is read from the environment directly. `retry` is `{ attempts, backoff: 'exponential' | 'linear' }`.
Errors are `IntegrationError`: `integrations/invalid-input`, `integrations/invalid-output`,
`integrations/missing-credential`, `integrations/call-failed`, `integrations/invalid-signature`,
`integrations/missing-handler`, `integrations/duplicate`, `integrations/unknown-function` and
`integrations/ambiguous-function`.
