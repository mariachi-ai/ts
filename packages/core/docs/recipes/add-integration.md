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

**An adapter speaks its port's language.** Its methods fail with the port's own errors (an auth
adapter throws the `AuthError` codes `@mariachi/auth` documents, such as `auth/invalid-grant`),
with the category and the provider's code in the error's metadata, so an app's error handling
doesn't change with the provider. The provider's `ProviderError` still names the failure on its
span. Where the port's interface has no `ctx` (the auth port's `IdentityClient`), pass `null` to
`callProvider`; never build a context. A port method the provider can't do fails with the port's
"not supported" error (`auth/not-supported`), never silently.

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
- **Per-user providers:** when each end user connects their own account, `credentials` is `user`
  (or `app-or-user`) with the `oauth` endpoints, scopes and `revokeUrl`, and the OAuth client id
  and secret are settings (`<PROVIDER>_CLIENT_ID`, `<PROVIDER>_CLIENT_SECRET`).

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
- **Per-user providers** take `deps.credentials`, a `CredentialResolver`, and ask it in `call`
  for each operation instead of reading a token from config: `const credential = await
  deps.credentials.resolve(ctx, { provider: provider.id })`, then `Bearer ${credential.accessToken}`
  and `connection: credential.connectionId` on the call, so the span carries
  `mariachi.integration.connection`. On an `unauthorized` failure, call
  `deps.credentials.invalidate?.(ctx, credential)`. The app gives it `Connections`
  ([connections.md](../connections.md)); never store or refresh a user's token in the package.
- **Paging:** `list` returns one page; add an `all` async generator where an app usually wants
  everything.
- **No SDK** unless it carries real weight (signing, streaming). Then it's an optional peer loaded
  with `loadOptionalPeer`.

### Webhooks

Through `WebhookServer` (see [add-webhook-endpoint.md](./add-webhook-endpoint.md)). The package
exports the authenticator for the provider's scheme, built from `@mariachi/webhooks`
(`HmacWebhookAuth`, `StandardWebhookAuth`, `StripeWebhookAuth`, or a `VerifiedWebhookAuth`
subclass for a scheme of its own: implement `verify(rawBody, headers, secret)`, throw on a bad
signature, return the signed delivery id), the body's schema, and how to read its event type:

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
- A per-user provider's tests give it a `CredentialResolver` that returns a fixed token and
  connection id, and check the connection id is on the span.
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
