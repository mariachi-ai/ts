# Plan: integrations

**Approved 2026-11-17. In progress, in open pull requests:** the foundation (`callProvider` in #123,
contracts in #124, the webhook span in #125, connections in #152), the reference integration (Typeform,
#126) and the provider packages stacked on it (#127 to #153). Until they merge, none of it is on main:
don't generate code that uses `@mariachi/integration-*`, `callProvider` or `contract.json` from main.
The open PRs cover more providers than [The list](#the-list) below; the list is brought up to date as
they merge.

Every third-party integration in Mariachi becomes a part of the same shape:

- settings by name;
- typed errors;
- one OpenTelemetry span per call to the provider, so an app can show what each integration did;
- a contract that can be read and followed without the code.

A provider Mariachi doesn't have is added the same way, written fresh from the provider's public
documentation.

## Decisions

1. **One package per provider:** `@mariachi/integration-<provider>`, so an app installs only what it
   uses.
2. **Port adapters stay adapters.** Where Mariachi has a port (email, SMS, push, storage, billing,
   search, AI, auth, key management), providers remain swappable adapters of that port, and each one
   gains the same per-call span. A provider with no port (a CRM, a calendar, a chat tool) is an
   integration package.
3. **The contract comes first.** Each part's contract is a data file, `contract.json`, readable by an
   agent writing Python, Ruby or Go. The TypeScript is generated from it and checked against it.
4. **The span's names** are the ones under [What each call emits](#what-each-call-emits).
5. **`mariachi.tenant_id` on spans** is optional and off by default. When it is on, it carries the
   app's own tenant id as an opaque value, never a provider's id.
6. **Credentials.**
   - A credential that belongs to an end user (an OAuth token for their own account) lives in the
     app's own database, encrypted, and is refreshed by Mariachi.
   - A credential that belongs to the app (an API key, an OAuth client id and secret) is a named
     setting, read through `@mariachi/config`, per environment. Mariachi doesn't care where the host
     keeps it.
7. **The first list** is under [The list](#the-list): the 20 providers Mariachi already calls gain the
   span, and 15 new parts are added. Providers that apps ask for are added to the list as they come.

## The part

```
packages/integration-hubspot/
  contract.json          the contract (the source of truth)
  src/index.ts           createHubSpot(config, deps?) and the types
  src/client.ts          the operations: (ctx, input) => output, Zod at both ends
  src/generated.ts       settings, config schema, error map and span constants, from contract.json
  src/errors.ts          HubSpotError extends IntegrationError, codes hubspot/<reason>
  src/webhooks.ts        signature check over the raw body and typed events, where the provider sends any
  src/testing.ts         a fake client for an app's tests
  src/*.test.ts          unit tests
  src/*.integration.test.ts   HTTP-level tests against a local stand-in for the provider
```

- **Entry point:** `create<Provider>(config, deps?)` returns a typed client. In a Mariachi app,
  `deps` is the tracer, metrics, logger and credential resolver from the container. In a plain Node
  project it can be left out: the client spans through `@opentelemetry/api` when that is installed
  and is silent otherwise.
- **Operations** take `ctx` first and validate input and output with Zod. They are the provider's
  operations (`contacts.create`), not one app's workflow.
- **Settings** are exported as `settings`, generated from the contract. For each field it gives the
  name, label, meaning, whether it is secret, where to find it, and checks per environment. A host
  can build the form for connecting the provider from it alone.
- **Errors** subclass `IntegrationError` with codes `<provider>/<reason>`. Each also carries a
  shared category: `unauthorized`, `forbidden`, `not-found`, `invalid-request`, `conflict`,
  `rate-limited` or `unavailable`. The provider's own code goes in `details.providerCode`.
  - Only `rate-limited` and `unavailable` are retried, honouring `Retry-After`.
  - Idempotency keys are sent wherever the provider accepts them.
- **Transport:** plain `fetch` by default. A vendor SDK only where it carries real weight (signing,
  streaming, pagination), as an optional peer dependency loaded lazily.
- **Tests never use live accounts in CI.** A one-off check against each provider's sandbox is done by
  hand, with accounts the maintainer creates.

### The contract

`contract.json` holds everything an implementation in any language needs:

| Field | Holds | Example |
| --- | --- | --- |
| `provider` | id, name, category, `server.address` | `stripe`, Stripe, `payments`, `api.stripe.com` |
| `settings[]` | name, label, meaning, secret or not, where to find it | `stripe.secretKey`, "the account's secret API key", secret, "Dashboard, Developers, API keys" |
| `settings[].environments` | declarative checks per environment, never code | `test`: starts with `sk_test_`; `production`: starts with `sk_live_` |
| `credentials` | app-wide (named settings) or per end user (OAuth: scopes, token and refresh endpoints) | HubSpot: per user, scopes `crm.objects.contacts.write` |
| `operations[]` | name, purpose, HTTP method and path template, idempotency | `paymentIntents.create`, `POST /v1/payment_intents`, idempotency key |
| `errors[]` | the provider's codes mapped to the shared categories, and whether each retries | `rate_limit` is `rate-limited`, retried; `card_declined` is `invalid-request`, not retried |
| `webhooks` | event types and the signature scheme | `invoice.paid`; HMAC-SHA256 over the timestamp and raw body |

The span shape is the same for every part and is defined once (next section). Each contract names
only its provider id, category and operation names.

The contract is published:

- in the package, as `@mariachi/integration-<provider>/contract.json`;
- as a rendered docs page, `mariachi docs integrations/<provider>`;
- in `llms.txt`.

One shared docs page defines the format and the span rules.

## What each call emits

Every call to a provider emits one OpenTelemetry span:

- **kind:** CLIENT;
- **name:** `<integration> <operation>` (`stripe paymentIntents.create`);
- **from:** the shared wrapper, `callProvider(ctx, { integration, operation, category, server }, fn)`.
  No package sets span attributes of its own.

| Attribute | Example | Set |
| --- | --- | --- |
| `mariachi.integration` | `stripe`, `hubspot`, `s3` | always: a stable, low-cardinality id |
| `mariachi.integration.operation` | `paymentIntents.create` | always: the provider's call name, never a URL |
| `mariachi.integration.category` | `payments`, `email`, `crm` | always |
| `server.address` | `api.stripe.com` | always |
| `http.request.method` | `POST` | for HTTP providers |
| `http.response.status_code` | `402` | when there was a response |
| `error.type` | `card_declined`, or `hubspot/rate-limited` when the provider gives no code | on failure, with span status `ERROR` |
| `mariachi.integration.error_category` | `rate-limited` | on failure |
| `mariachi.integration.attempts` | `2` | always; each retry is also a span event with its status code |
| `mariachi.integration.connection` | an opaque connection id | when an end user's connection was used |
| `mariachi.tenant_id` | an opaque tenant id | only when the app turns it on |

**Metrics**, labelled with integration, operation, category and outcome:

- `mariachi.integration.calls`, a counter;
- `mariachi.integration.duration`, a histogram in milliseconds.

**Inbound webhooks** emit a SERVER span named `<integration> webhook`. It carries
`mariachi.integration` and `mariachi.integration.event` (`invoice.paid`), and its status says
whether the signature passed.

**Never recorded** in a span, span event, metric label or log line:

- request or response bodies;
- credentials or tokens;
- amounts;
- email addresses or names;
- provider customer or object ids;
- URLs with ids or query strings.

A test runs every package's fake through the wrapper and fails on any attribute outside the table.

## The list

**Already in Mariachi, gaining the span (20):**

| Kind | Providers |
| --- | --- |
| Payments | Stripe |
| Email | Resend, Postmark, SendGrid, SMTP |
| SMS and push | Twilio, FCM |
| Storage | S3 (also R2 and MinIO, which speak S3) |
| Search | Typesense |
| AI | OpenAI, Anthropic, Google |
| Auth providers | Clerk, WorkOS, FusionAuth, GoTrue, OIDC |
| Key management | AWS KMS, GCP KMS |
| Messaging | Slack, rebuilt to this shape |

Redis, NATS, BullMQ and Postgres are the app's own infrastructure, not third parties, and are not
in this plan.

**New before launch (15):**

| Kind | New | Credentials |
| --- | --- | --- |
| Payments | Paddle | app-wide |
| Email | Amazon SES | app-wide |
| Push | APNs | app-wide |
| Auth providers | Auth0 | app-wide |
| Messaging | Discord, Microsoft Teams | per end user (or app-wide for a bot) |
| Automation | Zapier, Make and n8n, through one part (below) | the app's own API keys |
| Analytics | PostHog, Segment | app-wide |
| Storage | Google Cloud Storage | app-wide |
| CRMs | HubSpot | per end user |
| Calendars | Google Calendar, Microsoft 365 Calendar | per end user |
| Developer tools | GitHub | per end user |
| Spreadsheets | Google Sheets | per end user |

**Automation is inbound.** Zapier, Make and n8n call the app rather than being called. The part gives
an app:

- subscribe and unsubscribe endpoints for triggers (the REST hooks pattern all three support);
- trigger delivery with retries;
- action endpoints;
- API-key auth.

Each delivery and each action emits the span.

**Later, as apps ask:**

| Kind | Providers |
| --- | --- |
| Payments | PayPal, Lemon Squeezy |
| Email | Mailgun, Loops, Mailchimp |
| SMS | Vonage, MessageBird |
| Auth | Okta beyond OIDC, Cognito |
| Messaging | Telegram, WhatsApp Business |
| Automation | IFTTT |
| Analytics | Mixpanel, Amplitude, Google Analytics 4 |
| Storage | Azure Blob, Google Drive, Dropbox |
| CRMs | Salesforce, Pipedrive, Attio |
| Calendars | Cal.com, Calendly |
| Search and AI | Algolia, Meilisearch, Mistral |
| Developer tools | Linear, Jira, GitLab |
| Docs | Airtable, Notion |
| Support | Intercom, Zendesk |

## Adding a provider Mariachi doesn't have

1. **The request carries a need, not code:**
   - the provider;
   - the operations ("create a contact, list deals");
   - whether each end user connects their own account.

   An app's own code is never sent, read or copied.
2. **The contract first.** Written from the provider's public API reference and published schema
   files, and reviewed before any code. Never from an SDK whose licence forbids it, or from another
   product's code.
3. **Generic operations:** the provider's operations, not one app's workflow.
4. **Generated, then filled in.** `mariachi generate integration <provider>` writes the package from
   the contract. The author writes the operations and their tests.
5. **Reviewed like any package:**
   - the convention lint and the span attribute test;
   - a credentials review for anything that holds an end user's tokens;
   - a changeset.

## Steps

Each step is a set of draft PRs, reviewed and merged before the next step builds on it.

1. **Foundation.**
   - `TracerAdapter.startSpan` takes a span kind (core, observability's two adapters).
   - `callProvider` in `@mariachi/integrations`, with the error categories, retries on `Retry-After`,
     the metrics and the attribute test.
   - `IntegrationContext` takes `ctx` first, as every operation does.
   - Connections: an encrypted token store per end user in the app's database (a table in
     `@mariachi/integrations/schema`), OAuth connect and callback routes, refresh before expiry, and
     revoke. A credential resolver interface, so an app can supply credentials another way.
   - The contract format: its JSON Schema, the shared docs page, and the generator that writes
     `src/generated.ts` and checks it against the contract.
   - `mariachi generate integration <provider>`.
   - The spans of existing services that record an amount (`billing.charge`), a user id
     (`auth.sign`) or a cache key (`cache.get`) stop recording them.
   - The integrations doc and the add-integration recipe rewritten.
2. **The 20 existing providers gain the span,** one port per PR. No change to an app's API. Slack is
   rebuilt as `@mariachi/integration-slack`, and the private `integrations/` workspace is removed.
3. **The 15 new parts,** in the order of the table. The ones that connect an end user's account come
   after connections. Each starts with its contract.
4. **After launch:** the "later" list as apps ask, through the steps under
   [Adding a provider](#adding-a-provider-mariachi-doesnt-have).

## Not decided yet

- Sandbox accounts for the one-off checks: the maintainer creates them per provider.
- Providers that apps ask for before launch join the "new" list when that list settles.
