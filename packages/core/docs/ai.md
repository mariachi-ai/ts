# AI

`@mariachi/ai` wraps language models behind sessions. A session keeps its history, enforces a token
budget, persists to Postgres and records cost for every response. Tools, agent loops and RAG build on
the same sessions.

## Wire it

```ts
import { AnthropicAdapter, createAI, DefaultAI } from '@mariachi/ai';   // AnthropicAdapter needs the optional peer @ai-sdk/anthropic
import { DrizzleAISessionStore } from '@mariachi/ai/postgres';

const ai = new DefaultAI(createAI({
  adapter: 'openai',
  apiKey: config.ai.apiKey,
  defaultModel: config.ai.model,                     // default gpt-4o-mini
  fallbackModels: config.ai.fallbackModels,          // tried on OpenAI when the model fails
  fallbackProviders: [{ id: 'anthropic', adapter: new AnthropicAdapter({ apiKey: config.ai.anthropicApiKey }), models: ['claude-sonnet-5-5'] }],
  sessions: new DrizzleAISessionStore(db),
  costTable: config.ai.costTable,
  onPersistError: (error, sessionId) => logger.error({ sessionId, error: error.message }, 'AI session save failed'),
}), instrumentation);
```

Add the tables from `@mariachi/ai/schema`.

## Providers

| `adapter` | Package | Default model | `baseURL` means |
| --- | --- | --- | --- |
| `'openai'` | `@ai-sdk/openai` (installed with `@mariachi/ai`) | `gpt-4o-mini` | The full prefix, `/v1` included (`https://api.openai.com/v1`) |
| `'anthropic'` | `@ai-sdk/anthropic` (optional peer) | `claude-sonnet-5-5` | The host, without `/v1` (`https://api.anthropic.com`); a URL ending in `/v1` also works |
| `'google'` | `@ai-sdk/google` (optional peer, Node 22+) | none: set `defaultModel` | The full prefix (`https://generativelanguage.googleapis.com/v1beta`) |
| `'custom'` | yours | yours | Pass `instance`: any `AIAdapter`, or an `AISdkAdapter` over another AI SDK provider's model factory |

An optional peer is imported on the first call; if it isn't installed the call fails with
`dependency/missing-peer` and the command to install it.

```ts
// Claude as the primary model, from config (AI_ADAPTER=anthropic, AI_API_KEY, AI_BASE_URL, AI_MODEL):
createAI({ adapter: config.ai.adapter, apiKey: config.ai.apiKey, baseURL: config.ai.baseUrl, defaultModel: config.ai.model });

// A local or OpenAI-compatible server. With a baseURL the OpenAI adapter calls Chat Completions,
// which is what those servers implement; pass `api: 'responses'` to new OpenAIAdapter() to change that.
createAI({ adapter: 'openai', apiKey: 'unused', baseURL: 'http://localhost:11434/v1', defaultModel: 'my-local-model' });
```

`baseURL` (env `AI_BASE_URL`) points an adapter at a proxy, a gateway or a local model server. The
key still goes where the provider's own SDK puts it (`x-api-key` for Anthropic, `Authorization:
Bearer` for OpenAI). Only set it to a host you trust with the key.

`AnthropicAdapter` has two options of its own, both off by default:

- `forwardUserId: true` sends the session's `userId` as `metadata.user_id`, which a provider or
  gateway can use for per-user limits. Only for opaque ids, never an email address or a name.
- `allowBetaHeaders: true` lets `anthropic-beta` headers through. `@ai-sdk/anthropic` adds one
  whenever tools are passed; the adapter removes it because its calls work without it and a gateway
  may refuse beta headers.

## Sessions

```ts
const session = await ai.createSession(ctx, `support:${ticket.id}`, {
  systemPrompt: 'You are a support agent.',
  tenantId: ctx.tenantId, userId: ctx.userId,
  budget: { maxTotalTokens: 50_000, warningThresholdPercent: 80 },
});
const reply = await ai.send(ctx, session, 'Where is my order?');

// Another request or process: load the stored session and continue it.
const again = await ai.sessions.open(`support:${ticket.id}`);
for await (const chunk of ai.stream(ctx, again!, 'And when will it arrive?')) res.write(chunk.content);
```

Make model calls through `ai.send`, `ai.stream` and `ai.runAgent`. Each call made that way is costed,
checked against the session's budget, counted in metrics and recorded as telemetry. `session.send`
and `session.stream` reach the model too, and record nothing.

- Session ids are any string you choose. `createSession` waits for the store to save the session
  and throws `ai/session-persist-failed` if it can't.
- Messages are stored with their position, and each save appends only the new ones in one
  transaction.
- `sessions.get(id)` returns only sessions in this process's memory; `sessions.open(id)` also loads
  from the store.

## Streaming

```ts
// The procedure: the model's reply as events
import { toSse } from '@mariachi/ai';

async function reply(ctx: Context, input: { sessionId: string; message: string }) {
  const session = await ai.sessions.open(input.sessionId);
  return toSse(ai.stream(ctx, session!, input.message));
}

// The controller: send them
import { sseResponse } from '@mariachi/api-facade';
import type { AIStreamEvents } from '@mariachi/ai';

this.post('/chat', { schema: { body: chatInput } }, async (ctx, body) => {
  const { events, done } = await this.call<AIStreamEvents>(ctx, 'chat.reply', body);
  return sseResponse(events, { done });
});
```

- The browser gets a `delta` event per piece of text, a `tool-calls` event if the model asks for
  tools, and a closing `done` event with the usage and the model.
- The last chunk of `ai.stream` has `done: true`, the `usage`, the `model`, and `toolCalls` when the
  model asked for any. They are in the session's history, as they are after `send`.
- Calling an adapter directly? `adapter.streamsToolCalls` is true when its stream ends that way. The
  built-in adapters do, and a `FallbackAdapter` does when every provider in it does. Stream when it
  is true, and use `generate` when it isn't.
- **Cancelling.** When the client goes away the transport stops reading, and a stream nobody reads
  cancels its provider call: you stop paying for a reply no one will see. Nothing needs wiring for
  that. To cancel for a reason of your own, pass `{ signal }` to `send`, `stream` or `runAgent`; a
  call cancelled that way ends with `ai/aborted`.
- **A reply that was cut short still counts.** What the model had written stays in the history,
  marked `interrupted: true`, so a UI can tell it from a finished answer. The provider charges for
  the prompt and for what it wrote, but reports usage only at the end, so the session estimates
  (four characters a token), counts the estimate toward the budget, and marks the telemetry entry
  `estimated`. Starting and cancelling streams is not a way past a budget.
- A call that fails before the model answers leaves no trace in the history, so sending the message
  again doesn't say it twice.
- One call at a time per session: a session's history is one conversation, and two calls at once
  would interleave it. Use a session per conversation.

## Budgets and cost

A session's `budget` limits what it may use in all: `maxTotalTokens`, `maxInputTokens` and
`maxOutputTokens`. Once any of them is spent, the next `send`, `stream` or agent step is refused
(`ai/token-budget-exceeded`, HTTP 402). Another provider wouldn't help, so the fallback chain
doesn't try one. Each call also tells the provider how much the model may still write, so one long
reply can't run far past the limit.

Cost is `tokens / 1000 × rate` from the cost table. `config.ai.costTable` (env `AI_COST_TABLE` as
JSON) is merged over the built-in rates (OpenAI's `gpt-4*` models and Anthropic's current Claude
models, at list price as of 2026-11), and dated ids (`gpt-4o-2024-08-06`) use the entry that prefixes
them. A model with no entry costs 0, and `DefaultAI` logs a warning once per model, so add rates for
every other model you use, and override the built-in ones when prices change or yours differ.

```bash
AI_COST_TABLE='{"my-local-model":{"input":0,"output":0},"claude-sonnet-5-5":{"input":0.002,"output":0.01}}'
```

## Fallback

`FallbackAdapter` tries providers in order, and within a provider its `models` in order. A model
requested by the session only goes to the first provider, because model ids are
provider-specific. A stream falls through only if the provider fails before its first chunk. After
that the error reaches the caller, so you never get half of one answer and half of another. When
everything fails, the error is `ai/providers-exhausted` with each attempt's message.

## Tools and agents

```ts
ai.registerTool({
  name: 'order_status',
  description: 'The status of an order',
  schema: z.object({ orderId: z.string() }),
  handler: async ({ orderId }, ctx) => orders.status(ctx!, orderId),   // ctx: the caller's, so the lookup is tenant-scoped
});

const session = await ai.createSession(ctx, id, { tenantId: ctx.tenantId, userId: ctx.userId, toolNames: ['order_status'] });
const answer = await ai.runAgent(ctx, session, 'Where is order A-1?');
```

- **Register tools once, at startup; name them per session.** Registering a tool makes it available.
  A session offers the model only the tools it names: `toolNames: ['order_status']`, `toolNames: '*'`
  for every registered tool, or tools of its own (`tools: [...]`). A session that names none offers
  none, so a tool registered for an admin flow is never in front of an end user's chat by accident.
- **Tools are saved by name.** A tool is a function, which a database can't hold. A session opened
  later, or in another process, gets the registered tool of each saved name back, working. If one
  isn't registered there, the call fails with `ai/tool-not-found` naming it, before anything is paid
  for.
- `ai.runAgent` loops model → tool calls → results until the model answers, for at most
  `maxIterations` model calls (the run's, else the session's, else 10; past that,
  `ai/max-iterations-exceeded`). Every model call in the run is costed and recorded, and the run
  stops at the session's budget.
- A tool that throws doesn't end the loop: its error goes back to the model as a tool result
  (`isError: true`) so the model can retry or explain.
- The exported `runAgent(session, message)` is the bare loop: it records nothing. Use it only if you
  record the calls yourself.

## Telemetry

Every model call made through `ai` is an entry: session, model, tokens, latency, cost, the tenant
and user of the context, and `estimated` when the tokens are the session's estimate for a reply cut
short. With the Postgres session store, `createAI` writes each entry to
`ai_telemetry`; pass `persistTelemetry` to send them elsewhere. An entry is written without holding
the call up, and one that can't be written is a warning in the log and an
`ai.telemetry.persist_error` count, never a failed call.

## Prompts

```ts
ai.registerPrompt({ name: 'summary', version: '2', template: 'Summarize for {{audience}}: {{text}}' });
ai.prompts.render('summary', { audience: 'executives', text });   // highest version wins, numerically
```

Values are inserted literally (a `$&` in user text stays `$&`). Unknown placeholders are left in
place, and a missing prompt throws `ai/prompt-not-found`.

## Errors

`AIError`: `ai/request-failed` (provider error, with `provider` and `model` in the metadata),
`ai/providers-exhausted`, `ai/token-budget-exceeded`, `ai/aborted` (the call was cancelled),
`ai/tool-not-found`, `ai/tool-invalid-input`, `ai/max-iterations-exceeded`, `ai/session-not-found`,
`ai/session-persist-failed`, `ai/prompt-not-found`, `ai/not-supported` and `ai/config`.
