# @mariachi/ai

## 0.1.1

### Patch Changes

- a31310b: Adapters say whether their streams carry tool calls: `adapter.streamsToolCalls`.

  It is true on `AISdkAdapter` (so on the OpenAI, Anthropic and Google adapters), and on a
  `FallbackAdapter` when every provider in it reports tool calls. `AIAdapter` declares it as an
  optional property, so a caller that needs tool calls can stream when it is true and call
  `generate` otherwise, without a cast.

- Updated dependencies [f04e223]
- Updated dependencies [0964659]
- Updated dependencies [8486aa5]
- Updated dependencies [867c6ca]
  - @mariachi/core@0.1.1
  - @mariachi/database@0.1.1

## 0.1.0

### Minor Changes

- 9ec6419: `createAI({ adapter: 'anthropic' })` and `createAI({ adapter: 'google' })` work: they used to need
  `adapter: 'custom'` with an instance (`'anthropic'` threw). `AnthropicAdapter` and the new
  `GoogleAdapter` are exported from `@mariachi/ai` and import their optional peer (`@ai-sdk/anthropic`,
  `@ai-sdk/google`) on the first call, failing with `dependency/missing-peer` when it isn't installed.

  `baseURL` on `createAI` and on every adapter (config `ai.baseUrl`, env `AI_BASE_URL`) points a
  provider at a proxy, a gateway or a local model server. For Anthropic it's the host without `/v1`, as
  in Anthropic's SDK (a URL ending in `/v1` also works); for OpenAI and Google it's the full prefix.
  With a `baseURL`, `OpenAIAdapter` calls Chat Completions (`api: 'responses'` overrides).

  `AnthropicAdapter`: the default model is `claude-sonnet-5-5` (was `claude-sonnet-5`); it no longer
  sends the `anthropic-beta` header that `@ai-sdk/anthropic` adds when tools are passed
  (`allowBetaHeaders: true` restores it); `forwardUserId: true` sends the session's `userId` as
  `metadata.user_id`. The adapter port's call config gains `userId` (`AdapterCallConfig`), and a model
  factory passed to `AISdkAdapter` may be async.

  The built-in cost table now has Anthropic's current Claude models, so they're no longer priced at 0.

- 2fd4011: Every model call is costed and recorded, streams carry tool calls and can be cancelled, and tools
  survive a saved session.
  - **`ai.stream(ctx, session, message, { signal })`** and **`ai.runAgent(ctx, session, message)`**
    join `ai.send`: each model call made through any of them is checked against the budget, costed,
    counted and recorded as telemetry. Before, a stream or an agent run reached the model and
    recorded nothing.
  - **Streams carry tool calls.** The last chunk has `done: true` with the usage, the `model` and
    `toolCalls`, and they are in the session's history. Before, a streamed reply dropped them.
  - **Cancelling.** `signal` on `send`, `stream` and `runAgent`; a stream nobody reads any more
    cancels its provider call. A cancelled call ends with `ai/aborted` (HTTP 499). What the model had
    written is kept in the history, marked `interrupted`, and counted: with the provider's usage when
    it reported any, else with an estimate that counts toward the budget and is marked `estimated`
    in telemetry.
  - **`toSse(chunks)`** turns `ai.stream(...)` into what `sseResponse` takes: `delta` events, a
    `tool-calls` event, and the closing event's usage and model.
  - **Registered tools are used.** A session offers the model the registered tools it names with the
    new `toolNames` (`'*'` for all of them), or its own `tools`. A session that names none offers
    none. Before, registering a tool had no effect at all.
  - **Saved sessions get working tools back.** A session's tools are saved by name and found in the
    registry when it is opened. Before, tools were saved as JSON and came back without their
    handlers. Rows saved that way are read correctly. A named tool that isn't registered is
    `ai/tool-not-found`.
  - **Budgets.** `maxInputTokens` and `maxOutputTokens` are enforced as `maxTotalTokens` is, and each
    call tells the provider how much the model may still write. `maxIterations` on a session is an
    agent run's default (10 when unset).
  - **Telemetry is saved.** With the Postgres session store, `createAI` writes each entry to
    `ai_telemetry`, with the tenant and user of the context. A failed write is a warning in the log,
    not an unhandled rejection.
  - A tool's handler gets the context as its second argument, and a tool with a typed input can be
    registered without a cast.

  **Schema:** `ai_messages` gains `interrupted` and `ai_telemetry` gains `estimated` (default
  false). Run `mariachi db generate` and migrate.

  **Changed:**
  - A call that fails before the model answers no longer leaves the message in the session's history,
    so a retry doesn't say it twice.
  - `runAgent`'s `maxIterations` and `tools` are optional.
  - `AITelemetryTracker` no longer leaves a rejected `persist` unhandled; set `onPersistError` to hear
    of one.
  - `ai.checkTokenBudget` refuses at the limit, as the session already did, not only past it.

- 662ccc5: Finish the domain packages, verified with integration tests against Postgres, Redis, Typesense and MinIO, and contract suites shared by the real adapters and the test doubles. The Phase 6 packages move from alpha to beta.

  Breaking changes:
  - audit: `AuditQuery.find` and `findByResource` take `ctx` first; `RepositoryAuditQuery` no longer takes a context in its constructor. Reads are scoped to `ctx.tenantId`. The canonical hash form now sorts keys and includes `ipAddress` and `userAgent`, so chains written before this release don't verify.
  - notifications: `InAppNotificationStore.markRead(id, userId)` requires the recipient. `NotificationQueue.enqueue(ctx, name, data, { dedupKey })` matches `DefaultJobs.enqueue`. `DeliveryStore` keeps one row per notification and channel (`get`, `updateByExternalId`). Email template values are HTML-escaped; use `{{{name}}}` for raw HTML.
  - ai: `ai_sessions.id` and `ai_messages.session_id` are text, and `ai_messages` gains `position`. Unknown models cost 0 (with a warning) instead of `gpt-4o-mini` rates, and `costTable` merges over the defaults.
  - search: `SearchField.type` is a closed union (arrays allowed). `default_sorting_field` is only set from `SearchIndex.defaultSortingField`.
  - integrations: `IntegrationRegistry.register` throws when a listed function has no handler, or the integration is already registered.
  - rate-limit: an unknown explicit tier name throws `rate-limit/unknown-tier` instead of falling back to `default`. Fixed-window counters move to a hash (existing counters reset once).
  - core: new HTTP mappings for `rate-limit/backend-failed` (503), `rate-limit/unknown-tier` (500), `auth/unknown-role` (400), `storage/invalid-signature` (403), `search/missing-query-fields` (400), `integrations/invalid-signature` (401) and upstream AI and integration failures (502).

  Added: `DrizzleAuditLog` with a database-backed hash chain, `verifyChain`, retention and export; `DrizzleApiKeyStore`, `DrizzleRoleStore.defineRole` and DB-backed RBAC permissions; `AnthropicAdapter` (`@mariachi/ai/anthropic`) and cross-provider fallback for generate and stream; `ai.costTable`, `ai.fallbackModels` and `ai.anthropicApiKey` config; feature flag writes and tenant overrides; billing plan mirroring (`syncPlans`, `price.*` webhooks); `DefaultRateLimiting.consumeTier` and `resolveTier`; `notificationJobSchema`; `resolveTenantCredential(..., { fallbackToGlobal: false })`; `ctx.request.rawBody` in facade handlers for local signed-URL uploads.

  Fixed: concurrent auth webhook deliveries could both claim an event; API key rotation could leave a tenant without a key; notification retries multiplied between the queue and the service and duplicated deliveries; S3 `putStream` failed for streams of unknown length; Typesense index creation failed with a sort field, alias schemas were lost on restart, and reindexing leaked collections; string search filters weren't quoted; `reset` didn't clear fixed-window limits; token-bucket `retryAfterMs` reported the whole window; prompt versions sorted as strings.

- 662ccc5: Complete the domain packages: billing replay and automatic idempotency keys, notification dispatch, AI sessions with budgets and fallback, append-only audit chaining, database-backed RBAC and API key rotation, and the storage, search, rate-limit, and integration gaps.

### Patch Changes

- 8a56f66: Peer dependencies on `@mariachi/database`, `@mariachi/database-postgres` and `@mariachi/explorer` accept any 0.x release (`>=0.0.5 <1`) instead of one exact version. A minor release no longer forces a major one: changesets bumped every peer dependent to major, and the fixed group took every package with it.
- Updated dependencies [2fd4011]
- Updated dependencies [bb7f53a]
- Updated dependencies [44879db]
- Updated dependencies [6ad742b]
- Updated dependencies [92577a6]
- Updated dependencies [47f9687]
- Updated dependencies [da7d762]
- Updated dependencies [662ccc5]
- Updated dependencies [fcdeb4e]
- Updated dependencies [ea2f8fc]
- Updated dependencies [662ccc5]
- Updated dependencies [879b40f]
  - @mariachi/core@0.1.0
  - @mariachi/database@0.1.0
