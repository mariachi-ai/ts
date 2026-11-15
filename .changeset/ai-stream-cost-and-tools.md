---
'@mariachi/ai': minor
'@mariachi/core': patch
---

Every model call is costed and recorded, streams carry tool calls and can be cancelled, and tools
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
