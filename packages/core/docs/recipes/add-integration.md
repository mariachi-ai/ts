# Recipe: add a provider

How to add a third-party provider to Mariachi: one package, written from the provider's public
docs, the same shape as every other. `@mariachi/integration-typeform` is the reference: read it
before writing one.

## 1. Adapter or integration?

If Mariachi has a port for the job, the provider is an **adapter** of that port, in a package
named for both: `auth-auth0`, `billing-paddle`. The ports: email, SMS and push
(`@mariachi/notifications`), storage, billing, search, AI, auth, and key management. An app swaps
the provider by configuration and its code doesn't change.

Otherwise it's an **integration**: `@mariachi/integration-<provider>`, with the provider's own
operations. A CRM, a calendar, a form tool, an analytics API.

Either way the package has a contract, and every call goes through `callProvider`.

## 2. Write the contract

`contract.json` first, from the provider's public API reference and nothing else: never an SDK
whose licence forbids it, never another product's code. The format is in
[integration-contracts.md](../integration-contracts.md).

- **Settings:** each with its `env` name (`<PROVIDER>_<WHAT>`), where to find it in the provider's
  dashboard, and whether it's secret, required and safe in a browser. A per-environment check only
  where the provider documents what tells live from test (Paddle's `pdl_live_apikey_`, Clerk's
  `sk_live_`). Where test is another account or a sandbox, say so in `whereToFind`.
- **Operations:** the provider's own (`contacts.create`), the ones an app needs, not all of them.
  Each with its method, path and idempotency. Never one app's workflow.
- **Errors:** the provider's codes an app would act on differently, mapped to a category.
- **Webhooks:** the signature scheme, exactly, and the events.

Then:

```bash
pnpm integrations:generate      # writes src/generated.ts
```

## 3. The package

```
packages/integration-acme/
  contract.json
  package.json         category "providers", status "alpha", exports ".", "./testing" and "./contract.json"
  README.md            settings, use, webhooks, testing
  src/generated.ts     from the contract: never edit it
  src/errors.ts        class AcmeError extends ProviderError
  src/schemas.ts       Zod for what the app sends and reads; provider objects .passthrough()
  src/client.ts        createAcme(config, deps)
  src/webhooks.ts      acmeWebhookAuth(secret), AcmeWebhookBody, acmeEventType
  src/testing.ts       fakeAcme(), signed deliveries
  src/<helpers>.ts     small, pure helpers that make the provider easy to use correctly
  src/acme.test.ts
```

### The client

```ts
export function createAcme(config: AcmeConfig, deps: AcmeDeps = {}) {
  const cfg = configSchema.parse(config);
  const base = cfg.apiBaseUrl ?? provider.baseUrl;

  function call<T>(ctx: Context, operation: AcmeOperation, request: …, schema: z.ZodType<T, z.ZodTypeDef, unknown>) {
    return providerRequest(ctx, { integration: provider.id, operation, category: provider.category, server: new URL(base).host },
      { ...request, url: `${base}${request.path}`, headers: { authorization: `Bearer ${cfg.apiKey}` } },
      { schema, error: AcmeError, failure, deps });
  }

  return {
    contacts: {
      async create(ctx: Context, input: CreateContactInput) {
        const i = parse(CreateContactInput, input);
        return call(ctx, 'contacts.create', { method: 'POST', path: '/contacts', json: i, idempotencyKey: … }, Contact);
      },
    },
  };
}
export type Acme = ReturnType<typeof createAcme>;
```

- **`ctx` first**, then one input object. Every operation is `async`, so a bad input is a
  rejected promise, not a throw.
- **Zod at both ends:** the input is parsed into a `ValidationError` before anything is sent; the
  answer is checked by `providerRequest`.
- **`failure(status, body)`** reads the provider's error code into `providerCode` and maps it with
  `mappedFailure(errorMap, code)`. Never keep the provider's message: it can echo the input.
- **Idempotency keys** on every create and charge the provider takes them for.
- **Paging:** `list` returns one page; add an `all` async generator where an app usually wants
  everything.
- **No SDK** unless it carries real weight (signing, streaming). Then it's an optional peer loaded
  with `loadOptionalPeer`.

### Webhooks

Through `WebhookServer` (see [add-webhook-endpoint.md](./add-webhook-endpoint.md)). The package
exports the authenticator for the provider's scheme, built from `@mariachi/webhooks`
(`HmacWebhookAuth`, `StandardWebhookAuth`, `StripeWebhookAuth`, or a `VerifiedWebhookAuth`
subclass for a scheme of its own), the body's schema, and how to read its event type:

```ts
this.post('events', { mode: 'queue', jobName: 'acme-event', eventType: acmeEventType }, async (_ctx, body) => AcmeWebhookBody.parse(body));
```

### Helpers

What the app would otherwise get wrong, as small pure functions: Typeform's `answersByRef` reads
answers by field ref instead of position. Keep them about the provider's data, never about one
app's workflow.

### Testing

- `scriptedFetch` from `@mariachi/integrations/testing` answers the client's requests: no test
  calls the provider.
- `assertProviderSpans(tracer.spans)` on every test that makes a call.
- A webhook test posts a signed delivery to a `WebhookServer` with `inject`, and a forged one.
- `src/testing.ts` exports a fake with the client's type, for the app's own tests, and a builder for
  signed deliveries.

## 4. Finish

```bash
pnpm integrations:generate --check
pnpm build && pnpm typecheck && pnpm lint
pnpm docs:catalog && pnpm docs:check
pnpm changeset
```

A package that holds an end user's tokens also needs a credentials review.
