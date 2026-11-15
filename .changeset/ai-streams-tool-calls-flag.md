---
'@mariachi/ai': patch
---

Adapters say whether their streams carry tool calls: `adapter.streamsToolCalls`.

It is true on `AISdkAdapter` (so on the OpenAI, Anthropic and Google adapters), and on a
`FallbackAdapter` when every provider in it reports tool calls. `AIAdapter` declares it as an
optional property, so a caller that needs tool calls can stream when it is true and call
`generate` otherwise, without a cast.
