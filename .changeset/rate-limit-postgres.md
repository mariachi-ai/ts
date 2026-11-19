---
'@mariachi/rate-limit': minor
'@mariachi/config': minor
---

Rate limits can be kept in Postgres, so an app whose processes share one database shares its limits
without Redis.

- `createRateLimiter({ adapter: 'postgres', db })` (or `new PostgresRateLimiter({ db })`) keeps one
  row per key in `rate_limit_buckets`, from `@mariachi/rate-limit/schema`: add
  `rateLimitBucketsTable` to your schema and generate a migration. It gives the same answers as the
  Redis limiter for all three algorithms, weighted requests and `reset`.
- Each check is one `INSERT … ON CONFLICT … DO UPDATE … RETURNING` statement on the database
  server's clock, so concurrent checks from any number of processes never lose a count, with no
  transaction or advisory lock.
- Rows of keys whose windows have passed are deleted by `sweep()`, which each process starts in the
  background from a check at most once per `sweepIntervalMs` (default a minute; 0 turns it off).
- `RATE_LIMIT_ADAPTER` (`memory`, `redis` or `postgres`) is read into `config.rateLimit.adapter`; an
  unknown name fails the boot with `config/invalid`.
- `@mariachi/rate-limit` now depends on `@mariachi/database`, and takes `drizzle-orm` as an optional
  peer, loaded only by the Postgres limiter.
