---
'@mariachi/create': minor
---

`mariachi init --orgs` projects keep their rate limits in their own database, so every process that
serves the API shares them, with no Redis.

- `src/schema/organizations.ts` exports `rateLimitBucketsTable` from `@mariachi/rate-limit/schema`, so
  the first migration creates `rate_limit_buckets`.
- `src/app.ts` builds the limiter for creating organizations, inviting and accepting with
  `createRateLimiter({ adapter: config.rateLimit?.adapter ?? (config.redis ? 'redis' : 'postgres'), url: config.redis?.url, db: database.db, prefix })`.
  With `REDIS_URL` set the counts stay in Redis, as before; `RATE_LIMIT_ADAPTER` (`postgres`, `redis`
  or `memory`) chooses for itself, and `RATE_LIMIT_ADAPTER=redis` without `REDIS_URL` stops the boot
  with `app/rate-limit-redis-url-required`. The production warning that `REDIS_URL` was needed to
  share the limits is gone.
- `.env.example` lists `RATE_LIMIT_ADAPTER` (commented), and the README and AGENTS.md say where the
  counts are kept.
