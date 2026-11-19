# @mariachi/rate-limit

Rate limiting on Redis or Postgres (shared across instances, using the server's clock) or in memory,
with sliding window, fixed window and token bucket algorithms, weighted requests and per-tenant tiers.
`@mariachi/api-facade` applies it per route; use `DefaultRateLimiting` for quotas anywhere else.

**Status: beta.** Covered by unit tests, and by one contract of integration tests run against both
Redis and Postgres. The API can change before 1.0.

Guide: [http.md](../core/docs/http.md#rate-limits)

## Public API

| Export | Purpose |
| --- | --- |
| `createRateLimiter(config)` | `RedisRateLimiter`, `PostgresRateLimiter` or `MemoryRateLimiter`: `check(key, rule)`, `reset(key)` |
| `PostgresRateLimiter` | Also `sweep()`: deletes the rows of keys whose windows have passed |
| `DefaultRateLimiting` | `check`, `consume` (throws on excess), `checkTier`, `consumeTier`, with instrumentation |
| `createRateLimitMiddleware`, `defaultRateLimitKey` | Middleware for custom servers |
| `RateLimitRule`, `RateLimitTier`, `TierResolver`, `RateLimitResult` | Types |
| `rateLimitBucketsTable` (`@mariachi/rate-limit/schema`) | The Postgres limiter's table: add it to your schema and migrate |

## Config

| Option | Notes |
| --- | --- |
| `adapter` | `'redis'`, `'postgres'` or `'memory'`. `RATE_LIMIT_ADAPTER` sets `config.rateLimit.adapter` |
| `url` / `client` | Redis: a URL (from `REDIS_URL`), or an existing ioredis client |
| `db` | Postgres: the app's database (`createPostgresDatabase(...).db`), not a transaction |
| `sweepIntervalMs` | Postgres: how often each process deletes expired rows, default 60 000; 0 turns it off |
| `prefix` | Key prefix, default `ratelimit` |

A rule is `{ windowMs, maxRequests, algorithm?, cost? }`, with `algorithm` one of `'sliding-window'`
(default), `'fixed-window'` or `'token-bucket'`. `DefaultRateLimiting` also takes `resolveTier(ctx)`
to pick a tenant's tier. Errors are `RateLimitError`: `rate-limit/exceeded` (429, with
`retryAfterSeconds`), `rate-limit/unknown-tier`, `rate-limit/backend-failed` (503), and at startup
`rate-limit/unknown-adapter` and `rate-limit/database-required` (`postgres` without `db`).

The Postgres limiter runs each check as one `INSERT … ON CONFLICT … DO UPDATE … RETURNING`
statement, so concurrent checks from several processes are serialized on the key's row; see the
guide for how it keeps time and cleans up.
