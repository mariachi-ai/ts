import type { Context } from '@mariachi/core';
import type { SQL } from 'drizzle-orm';
import type Redis from 'ioredis';

/** Runs one SQL statement: the app's Drizzle database (`createPostgresDatabase(...).db`) is one. */
export interface SqlExecutor {
  execute(query: SQL): PromiseLike<unknown>;
}

export interface RateLimitConfig {
  adapter: 'redis' | 'postgres' | 'memory' | (string & {});
  /** Redis URL, for `adapter: 'redis'`. */
  url?: string;
  /** Reuse an existing ioredis client, for `adapter: 'redis'`. */
  client?: Redis;
  /** The app's database, for `adapter: 'postgres'`. Its schema needs `rateLimitBucketsTable` (`@mariachi/rate-limit/schema`). */
  db?: SqlExecutor;
  /**
   * `adapter: 'postgres'`: how often each process deletes rows whose windows have passed, in ms.
   * Default 60 000; 0 turns it off (call `sweep()` yourself).
   */
  sweepIntervalMs?: number;
  /** Key prefix, default `ratelimit`. */
  prefix?: string;
}

export interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
  /**
   * `sliding-window` (exact), `fixed-window` (one counter, up to 2x at boundaries),
   * or `token-bucket` (smooth refill of `maxRequests` over `windowMs`). Default `sliding-window`.
   */
  algorithm?: 'sliding-window' | 'fixed-window' | 'token-bucket';
  /** Weight of this request. Default 1. */
  cost?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfterMs: number;
}

/** Named allowance. Resolve a tenant's tier, then pass `rule` to `check`. */
export interface RateLimitTier {
  name: string;
  rule: RateLimitRule;
}

/** Returns the tier name for a tenant context (e.g. from its billing plan), or undefined for `default`. */
export type TierResolver = (ctx: Context) => string | undefined | Promise<string | undefined>;

export interface RateLimiter {
  check(key: string, rule: RateLimitRule): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isHealthy(): Promise<boolean>;
}
