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
for await (const chunk of again!.stream!('And when will it arrive?')) res.write(chunk.content);
```

- Session ids are any string you choose. `createSession` waits for the store to save the session
  and throws `ai/session-persist-failed` if it can't.
- Messages are stored with their position, and each save appends only the new ones in one
  transaction.
- `sessions.get(id)` returns only sessions in this process's memory; `sessions.open(id)` also loads
  from the store.

## Budgets and cost

A session with `budget.maxTotalTokens` refuses the next `send` once it has used the budget
(`ai/token-budget-exceeded`, HTTP 402). Another provider wouldn't help, so the fallback chain
doesn't try one.

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

`runAgent` loops model → tool calls → results until the model answers. A tool that throws doesn't
end the loop: its error goes back to the model as a tool result (`isError: true`) so the model can
retry or explain.

## Prompts

```ts
ai.registerPrompt({ name: 'summary', version: '2', template: 'Summarize for {{audience}}: {{text}}' });
ai.prompts.render('summary', { audience: 'executives', text });   // highest version wins, numerically
```

Values are inserted literally (a `$&` in user text stays `$&`). Unknown placeholders are left in
place, and a missing prompt throws `ai/prompt-not-found`.

## Errors

`AIError`: `ai/request-failed` (provider error, with `provider` and `model` in the metadata),
`ai/providers-exhausted`, `ai/token-budget-exceeded`, `ai/session-not-found`,
`ai/session-persist-failed`, `ai/prompt-not-found` and `ai/config`.
