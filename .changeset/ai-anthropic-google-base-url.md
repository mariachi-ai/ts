---
'@mariachi/ai': minor
'@mariachi/config': minor
---

`createAI({ adapter: 'anthropic' })` and `createAI({ adapter: 'google' })` work: they used to need
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
