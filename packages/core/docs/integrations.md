# Integrations

How Mariachi calls a third-party provider. There is one way: every call goes through
`callProvider`, which gives it one span, its metrics and its retries, and fails with an error whose
category says what to do. Inbound webhooks go through `WebhookServer`, like every webhook.

## Calling a provider

`providerRequest` makes one HTTP call through `callProvider`. An integration's operations are
built from it:

```ts
import { providerRequest, ProviderError } from '@mariachi/integrations';
import { z } from 'zod';

export class AcmeError extends ProviderError {}

const Contact = z.object({ id: z.string(), email: z.string() });

export function createContact(ctx: Context, input: { email: string }, deps: AcmeDeps) {
  return providerRequest(ctx, { integration: 'acme', operation: 'contacts.create', category: 'crm', server: 'api.acme.com' }, {
    method: 'POST',
    url: 'https://api.acme.com/v1/contacts',
    headers: { authorization: `Bearer ${deps.apiKey}` },
    json: input,
    idempotencyKey: { header: 'Idempotency-Key', value: deps.idempotencyKey },
  }, { schema: Contact, error: AcmeError, deps });
}
```

- **The span:** one CLIENT span named `<integration> <operation>` (`acme contacts.create`). It
  carries only the attributes in `PROVIDER_SPAN_ATTRIBUTES`: the integration, the operation, its
  category, the host, the method, the status, the error's type and category, and the attempts.
  Never a URL, a body, a key, an amount, an address or a provider's id. `deps.tracer` comes from the
  container; without one, spans go through `@opentelemetry/api` when it's installed.
- **Metrics:** `mariachi.integration.calls` and `mariachi.integration.duration` (ms), labelled with
  the integration, operation, category and outcome, when `deps.metrics` is given.
- **Errors:** a failed answer becomes the integration's `ProviderError` subclass, with the code
  `<integration>/<reason>` and one of seven categories: `unauthorized`, `forbidden`, `not-found`,
  `invalid-request`, `conflict`, `rate-limited`, `unavailable`. The HTTP status decides the category
  unless `failure(status, body)` reads the provider's own code; that code goes in `providerCode` and
  the span's `error.type`, never the provider's message.
- **Retries:** only `rate-limited` and `unavailable` (and a provider that can't be reached), three
  attempts by default, waiting as long as `Retry-After` asks (or `X-RateLimit-Reset`, for providers that send that instead). Each retry is an event on the span.
  Give an idempotency key wherever the provider takes one, so a retried create happens once. A POST or
  PATCH without one is retried only after a rate limit, never after an outage (the provider may have
  acted before it failed).
- **A failure inside a 2xx answer** (a batch, a composite call, GraphQL's `errors`) is read by
  `failureInBody(body)`, which names its category; the call then fails as any other.
- **The answer** is checked against `schema`. A provider that changed its response fails with
  `<integration>/invalid-response` at the boundary.

For a provider that isn't HTTP and JSON, wrap the call in `callProvider(ctx, call, fn, deps)`
directly and report the status with `attempt.setStatusCode`.

## Receiving a provider's webhooks

Through `@mariachi/webhooks`' `WebhookServer`, as every webhook is
([recipes/add-webhook-endpoint.md](./recipes/add-webhook-endpoint.md)): it checks the signature over
the raw body, dedupes, logs with secrets redacted, and hands the delivery to a job. An integration
package exports the authenticator for its provider's scheme (`typeformWebhookAuth(secret)`) and the
Zod schema of its payloads, so a controller is a few lines.

## Testing an integration

`@mariachi/integrations/testing` has `scriptedFetch(...responses)`, a `fetch` that answers from a
script and records each request, so no test calls a provider; and `assertProviderSpans(spans)`,
which fails on any span attribute outside the table. Use it with `@mariachi/testing`'s
`TestTracer`.

## Functions, the registry and credentials

The older pieces, below, still work: validated functions with retries, credentials resolved per
tenant, and a registry you can call by name. `integrations/slack/` uses them.

## Define a function

```ts
import { defineIntegrationFn, resolveTenantCredential, type IntegrationContext } from '@mariachi/integrations';

export const createIssue = defineIntegrationFn({
  name: 'tracker.createIssue',
  input: CreateIssueInput,            // Zod
  output: CreateIssueOutput,          // Zod
  retry: { attempts: 3, backoff: 'exponential' },
  handler: async (input, ctx: IntegrationContext) => {
    const token = await resolveTenantCredential(ctx, 'tracker.apiToken', ctx.secrets!, ctx.decrypt, { fallbackToGlobal: false });
    return trackerClient(token).issues.create(input);
  },
});
```

- Input is validated once, before the first attempt. Invalid input fails with
  `integrations/invalid-input` and is never retried.
- The handler is retried with `retry` from `@mariachi/core` (100 ms base delay). A missing
  credential isn't retried; other errors are.
- Output is validated after the call (`integrations/invalid-output`, HTTP 502), so a changed
  upstream response is caught at the boundary.
- Errors that aren't already `IntegrationError` become `integrations/call-failed` with the function
  name.

## Credentials

`resolveTenantCredential(ctx, key, secrets, decryptor?, options?)` reads the tenant's secret
(`secrets.get(key, tenantId)`) and decrypts it with `@mariachi/encryption` when a decryptor is
given. Store per-tenant credentials encrypted, never in plain config.

By default a tenant without its own secret falls back to the global one (`secrets.get(key)`). That
suits integrations your platform owns (one Slack workspace for alerts). For credentials that must
be the tenant's own (their Slack workspace, their CRM account), pass
`{ fallbackToGlobal: false }`, so a missing tenant secret fails instead of silently using yours.

## Register and call

```ts
const registry = new IntegrationRegistry();
registry.register({
  name: 'tracker',
  description: 'Issue tracker',
  credentialSchema: TrackerCredentials,
  functions: ['tracker.createIssue'],
  handlers: { createIssue },
});

await registry.call('tracker.createIssue', input, integrationCtx);
```

- Every name in `functions` must have a handler, or `register` throws
  `integrations/missing-handler`. The registry never lists something it can't call.
- Registering the same integration twice throws `integrations/duplicate`.
- `call` accepts `integration.fn`, or the bare `fn` when only one integration defines it. A bare
  name used by several integrations throws `integrations/ambiguous-function`; an unknown one throws
  `integrations/unknown-function`.

## Inbound webhooks

`defineWebhookHandler({ verify, parse, handle })` checks the request before parsing it. For Slack,
verify with the signing secret over the raw body:

```ts
import { assertSlackSignature } from '@mariachi/integrations';

assertSlackSignature(config.slack.signingSecret, headers, rawBody);   // throws integrations/invalid-signature
```

`verifySlackSignature` returns a boolean instead, and both reject requests more than five minutes
old. Always pass the raw bytes (`ctx.request.rawBody` in a facade handler); re-serialized JSON won't
match the signature. For a full webhook endpoint with dedup, see
[recipes/add-webhook-endpoint.md](./recipes/add-webhook-endpoint.md).

## Step-by-step recipe

For a full walkthrough with credentials, client, types and tests, see
[recipes/add-integration.md](./recipes/add-integration.md).
