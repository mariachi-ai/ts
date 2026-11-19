import { RateLimitError } from '@mariachi/core';
import type { RateLimitConfig, RateLimiter, SqlExecutor } from './types';
import { RedisRateLimiter } from './adapters/redis';
import { MemoryRateLimiter } from './adapters/memory';
import { PostgresRateLimiter } from './adapters/postgres';

export { createRateLimitMiddleware, defaultRateLimitKey } from './middleware';
export type { RateLimitConfig, RateLimitRule, RateLimitResult, RateLimitTier, RateLimiter, SqlExecutor, TierResolver } from './types';
export { RedisRateLimiter } from './adapters/redis';
export { MemoryRateLimiter } from './adapters/memory';
export { PostgresRateLimiter, type PostgresRateLimiterOptions } from './adapters/postgres';
export { RateLimiting, DefaultRateLimiting } from './rate-limiting';

export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  if (config.adapter === 'redis') return new RedisRateLimiter(config);
  // The constructor refuses a missing `db` (rate-limit/database-required)
  if (config.adapter === 'postgres') return new PostgresRateLimiter({ ...config, db: config.db as SqlExecutor });
  if (config.adapter === 'memory') return new MemoryRateLimiter();
  throw new RateLimitError('rate-limit/unknown-adapter', `Unknown rate limit adapter: ${config.adapter}`);
}
