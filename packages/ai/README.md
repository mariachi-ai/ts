# @mariachi/ai

LLM sessions persisted in Postgres, with token budgets, streaming, tools, agent loops, RAG,
provider and model fallback, and per-response cost tracking.

**Status: beta.** Covered by unit tests and Postgres integration tests. The API can change before 1.0.

Guide: [ai.md](../core/docs/ai.md)

## Imports

| Import | Contents |
| --- | --- |
| `@mariachi/ai` | `createAI`, `DefaultAI`, the OpenAI, Anthropic, Google and AI SDK adapters, fallback, tools, prompts, agents, cost |
| `@mariachi/ai/anthropic` | `AnthropicAdapter` again, for existing imports |
| `@mariachi/ai/schema` | `ai_sessions`, `ai_messages`, `ai_telemetry` tables |
| `@mariachi/ai/postgres` | `DrizzleAISessionStore` |

## Public API

| Export | Purpose |
| --- | --- |
| `createAI(config)` | Builds sessions, tools, prompts and telemetry for `DefaultAI` |
| `DefaultAI` | `createSession`, `send`, `checkTokenBudget`, `registerTool`, `registerPrompt` |
| `SessionManager` | `create`, `createPersisted`, `get`, `open` (loads from the store) |
| `OpenAIAdapter`, `AnthropicAdapter`, `GoogleAdapter`, `AISdkAdapter` | Providers. Anthropic and Google import their optional peer (`@ai-sdk/anthropic`, `@ai-sdk/google`) on the first call; `AISdkAdapter` takes any AI SDK model factory |
| `FallbackAdapter` | Ordered providers and models |
| `runAgent`, `createRAGPipeline` | Agent loop (tool errors go back to the model) and retrieval |
| `estimateCost`, `resolveRates`, `DEFAULT_COST_TABLE` | Cost per 1K tokens |

## Config

| Setting | Env | Notes |
| --- | --- | --- |
| `ai.adapter` | `AI_ADAPTER` | `'openai'`, `'anthropic'`, `'google'`, or `'custom'` with `instance` |
| `ai.apiKey` | `AI_API_KEY`, `OPENAI_API_KEY` | Primary provider key |
| `ai.baseUrl` | `AI_BASE_URL` | `createAI`'s `baseURL`: a proxy, gateway or local model server. Anthropic: the host without `/v1`; OpenAI and Google: the full prefix |
| `ai.model` | `AI_MODEL` | Default model |
| `ai.fallbackModels` | `AI_FALLBACK_MODELS` (comma list) | Tried on the primary provider |
| `ai.anthropicApiKey` | `ANTHROPIC_API_KEY` | For `AnthropicAdapter` as a fallback provider |
| `ai.costTable` | `AI_COST_TABLE` (JSON) | USD per 1K tokens, merged over the defaults |

`createAI` also takes `fallbackProviders`, `sessions` (store), `persistTelemetry` and
`onPersistError`. Errors are `AIError`.
