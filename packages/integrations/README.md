# @mariachi/integrations

Building blocks for third-party integrations: functions with validated input and output and
retries, per-tenant credentials (optionally encrypted), end users' OAuth connections (encrypted,
refreshed and revoked), a registry that can call functions by name, and webhook signature checks. `integrations/slack/` in this repository is the reference
implementation.

**Status: beta.** Covered by unit tests. The API can change before 1.0.

Guide: [integrations.md](../core/docs/integrations.md), [connections.md](../core/docs/connections.md), recipe: [add-integration.md](../core/docs/recipes/add-integration.md)

## Public API

| Export | Purpose |
| --- | --- |
| `defineIntegrationFn(def)` | `{ name, input, output, handler, retry? }` → a callable function; input is validated once, and missing credentials and invalid input aren't retried |
| `defineWebhookHandler(def)` | `{ verify, parse, handle }`, verified before parsing |
| `IntegrationRegistry` | `register` (every listed function needs a handler), `get`, `getAll`, `call(name, input, ctx)` |
| `resolveTenantCredential(ctx, key, secrets, decryptor?, options?)` | Tenant secret, then global unless `fallbackToGlobal: false`; decrypted when a decryptor is given |
| `verifySlackSignature`, `assertSlackSignature` | Slack `v0` signatures with a five-minute replay window |
| `Connections` | End users' OAuth connections: `authorize`, `complete`, `list`, `revoke`, and `resolve(ctx, { provider, connectionId? })` for a fresh access token. A `CredentialResolver` |
| `oauthProvider({ provider, credentials }, settings)` | A provider users connect to, from its contract and the client id, secret and redirect URI |
| `CredentialResolver` | `resolve(ctx, request)` → `{ accessToken, connectionId? }`, and `invalidate?`: what a per-user client takes as `deps.credentials` |
| `MemoryConnectionStore`, `DrizzleConnectionStore` (`/postgres`) | Where connections are kept: tokens as `@mariachi/encryption` ciphertext |
| `integrationConnectionsTable`, `integrationAuthorizationsTable` (`/schema`) | The two tables to add to your schema and migrate |
| `registerConnectionProcedures`, `ConnectionsController` (`/http`) | `GET /connections`, `POST /connections/:provider/authorize`, `POST /connections/:provider/callback`, `DELETE /connections/:id` |

## Config

Integrations read credentials from `@mariachi/config` secrets (per tenant where needed); nothing
is read from the environment directly. `retry` is `{ attempts, backoff: 'exponential' | 'linear' }`.
Errors are `IntegrationError`: `integrations/invalid-input`, `integrations/invalid-output`,
`integrations/missing-credential`, `integrations/call-failed`, `integrations/invalid-signature`,
`integrations/missing-handler`, `integrations/duplicate`, `integrations/unknown-function` and
`integrations/ambiguous-function`. A connection fails with `ConnectionError`:
`integrations/connection-not-found`, `integrations/reconnect-required`, `integrations/invalid-state`,
`integrations/provider-not-found` and `integrations/user-required`.
