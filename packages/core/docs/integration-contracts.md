# Integration contracts

Every `@mariachi/integration-<provider>` package starts from a contract: `contract.json`, a data
file that says everything an implementation needs. It's the source of truth. The package's
`src/generated.ts` is written from it by `pnpm integrations:generate`, and `pnpm docs:check` fails
when the two disagree. An agent writing the same integration in Python, Ruby or Go follows the
contract and needs nothing else.

The JSON Schema is `@mariachi/integrations/contract.schema.json`. Point `$schema` at it.

## The fields

| Field | Holds |
| --- | --- |
| `provider` | `id` (lowercase, dashes), `name`, `category` (`crm`, `payments`, `email`…), `server` (the host called), `baseUrl`, `docs` |
| `settings[]` | What the app sets to connect it. Each has `key` (camelCase, the config key), `env` (the environment variable), `label`, `meaning`, `secret`, `required`, `whereToFind`, `url`, `public` (safe in a browser), and `environments` |
| `settings[].environments` | Declarative checks per environment, `test` and `production`: `startsWith`, `notStartsWith`, and `because`, the sentence a person reads when it fails. Never code |
| `credentials` | `{ "kind": "app" }` for one set of settings for the whole app; `user` when each end user connects their own account (`oauth`: `authorizeUrl`, `tokenUrl`, `scopes`, `pkce`, `refresh`); `app-or-user` for either |
| `operations[]` | `name` (`resource.action`: `contacts.create`), `purpose`, `method`, `path` (a template under `baseUrl`), and `idempotency`: `{ "header": "Idempotency-Key" }`, `"natural"` (a read, or a put of the same thing) or `"none"` |
| `errors[]` | The provider's codes: `providerCode`, the shared `category`, and the `reason` that ends the integration's code (`card-declined` makes `stripe/card-declined`) |
| `webhooks` | `signature` (`scheme`: `standard-webhooks`, `hmac-sha1-hex`, `hmac-sha256-hex`, `hmac-sha256-base64`, `hmac-sha256-timestamped`, `jwt`, `rsa-sha256-certificate`, `basic-auth`, `shared-secret` or `none`; `header`, `secretSetting`, and a `description` exact enough to implement) and `events[]` (`type`, `meaning`) |

### Settings and environments

A setting's checks let a host refuse a value before saving it: a live key in the test
environment, most often. Only write a check the provider documents. When a provider keeps test
and live apart by account (a sandbox, another project, another tenant), its keys look the same,
so write no check and say so in `whereToFind`: "In the sandbox account for test".

`checkSetting(setting, environment, value)` applies them and returns why not, or `null`.
`settingsFromEnv(settings, readEnv)` reads an integration's config from the environment by each
setting's `env` name, and fails naming every required one that's missing.

### Operations

An operation is the provider's own, not one app's workflow: `contacts.create`, never
`syncSignupToCrm`. Its name is the span's operation (`hubspot contacts.create`), so it's stable and
low-cardinality. Flows that combine operations belong in an app, or in a port package
(`@mariachi/billing`'s subscriptions).

### Errors

Every failure has one of seven categories: `unauthorized`, `forbidden`, `not-found`,
`invalid-request`, `conflict`, `rate-limited`, `unavailable`. Only `rate-limited` and
`unavailable` are retried. Map the provider's codes an app would act on differently
(`card_declined`, `contact_exists`); the HTTP status decides the rest.

## What each call emits

Every call goes through `callProvider` (see [integrations.md](./integrations.md)), which makes one
CLIENT span named `<provider> <operation>` with these attributes and no others:

| Attribute | Example |
| --- | --- |
| `mariachi.integration` | `hubspot` |
| `mariachi.integration.operation` | `contacts.create` |
| `mariachi.integration.category` | `crm` |
| `server.address` | `api.hubapi.com` |
| `http.request.method` | `POST` |
| `http.response.status_code` | `429` |
| `error.type` | the provider's code, or `hubspot/rate-limited` |
| `mariachi.integration.error_category` | `rate-limited` |
| `mariachi.integration.attempts` | `2` (each retry is also a span event) |
| `mariachi.integration.connection` | an opaque id of the end user's connection |
| `mariachi.tenant_id` | the app's tenant id, only when the app turns it on |

An inbound webhook makes a SERVER span named `<provider> webhook` with `mariachi.integration` and
`mariachi.integration.event`.

**Never recorded**, anywhere: bodies, credentials, amounts, email addresses or names, a provider's
customer or object ids, and URLs. `assertProviderSpans` in an integration's tests fails on any
attribute outside the table.

## The package

```
packages/integration-<provider>/
  contract.json        the contract
  src/generated.ts     written from it: provider, settings, configSchema, operations, errorMap, webhook events
  src/errors.ts        <Provider>Error extends ProviderError
  src/client.ts        create<Provider>(config, deps?): the operations, (ctx, input) => output, Zod at both ends
  src/webhooks.ts      the signature check over the raw body, and typed events
  src/testing.ts       a fake client for an app's tests
  src/index.ts
```

[recipes/add-integration.md](./recipes/add-integration.md) walks through one.
