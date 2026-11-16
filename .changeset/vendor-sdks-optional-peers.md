---
'@mariachi/cache': minor
'@mariachi/rate-limit': minor
'@mariachi/realtime': minor
'@mariachi/events': minor
'@mariachi/jobs': minor
'@mariachi/search': minor
'@mariachi/storage': minor
'@mariachi/billing': minor
'@mariachi/notifications': minor
'@mariachi/ai': minor
'@mariachi/create': patch
---

**Breaking for installs:** vendor SDKs are optional peer dependencies. A Mariachi package no longer
installs the SDK of an adapter you may not use; add the ones you do use to your app.

| If you use | Add |
| --- | --- |
| Redis for cache, rate limits, realtime across instances, or the Redis event bus | `ioredis` |
| The NATS event bus | `nats` |
| The BullMQ job queue | `bullmq` |
| Typesense search | `typesense` |
| S3 storage | `@aws-sdk/client-s3 @aws-sdk/lib-storage @aws-sdk/s3-request-presigner` |
| Stripe billing | `stripe` |
| The Resend email adapter | `resend` |
| The OpenAI adapter | `@ai-sdk/openai` |

Nothing in the API changed. An adapter whose SDK is missing throws `dependency/missing-peer` when it
is first made or used, naming the package to add. The Postgres and in-memory adapters need none of
them, so an app on the Postgres job queue and Postgres search installs no Redis or Typesense client.

The OpenAI adapter now loads its SDK on the first call, as the Anthropic and Google adapters do.

The packages' type declarations still name the SDKs' types (a Redis client you pass in, a Stripe
object). With `skipLibCheck` on, as generated projects have it, a missing SDK is no type error.
