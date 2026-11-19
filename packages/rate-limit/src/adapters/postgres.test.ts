import { describe, expect, it } from 'vitest';
import { sql, type SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { createRateLimiter } from '../index';
import type { RateLimitRule } from '../types';
import { type BucketRow, checkStatement, PostgresRateLimiter, toResult } from './postgres';

const dialect = new PgDialect();
const render = (query: SQL) => dialect.sqlToQuery(query);

const row = (overrides: Partial<BucketRow>): BucketRow => ({
  allowed: true,
  now: 1_000_000,
  window_start: null,
  used: null,
  tokens: null,
  hit_cost: null,
  oldest_hit: null,
  ...overrides,
});

/** A database that answers each statement with `answer(text)` and records what it ran. */
function fakeDb(answer: (text: string) => unknown = () => [row({})]) {
  const ran: string[] = [];
  return {
    ran,
    db: {
      execute: async (query: SQL) => {
        const { sql: text } = render(query);
        ran.push(text);
        return answer(text);
      },
    },
  };
}
const isSweep = (text: string) => text.includes('DELETE') && text.includes('SKIP LOCKED');

describe('toResult', () => {
  it('fixed-window: remaining is what is left of the window, which resets at its end', () => {
    const rule: RateLimitRule = { algorithm: 'fixed-window', maxRequests: 5, windowMs: 1_000 };
    expect(toResult('fixed-window', rule, row({ now: 10_400, window_start: 10_000, used: 3 }))).toEqual({
      allowed: true,
      limit: 5,
      remaining: 2,
      resetAt: new Date(11_000),
      retryAfterMs: 0,
    });
    expect(toResult('fixed-window', rule, row({ allowed: false, now: 10_400, window_start: 10_000, used: 5 }))).toMatchObject({
      allowed: false,
      remaining: 0,
      retryAfterMs: 600,
    });
  });

  it('sliding-window: resets when the oldest request leaves the window', () => {
    const rule: RateLimitRule = { algorithm: 'sliding-window', maxRequests: 3, windowMs: 1_000, cost: 2 };
    expect(toResult('sliding-window', rule, row({ now: 5_000, hit_cost: 2, oldest_hit: 5_000 }))).toMatchObject({
      allowed: true,
      remaining: 1,
      resetAt: new Date(6_000),
    });
    expect(toResult('sliding-window', rule, row({ allowed: false, now: 5_300, hit_cost: 2, oldest_hit: 5_000 }))).toMatchObject({
      allowed: false,
      remaining: 1,
      retryAfterMs: 700,
    });
    // A cost above the limit, on a key with nothing in its window
    expect(toResult('sliding-window', { ...rule, cost: 9 }, row({ allowed: false, now: 5_000 }))).toMatchObject({
      remaining: 3,
      resetAt: new Date(6_000),
      retryAfterMs: 1_000,
    });
  });

  it('token-bucket: admitted resets when the bucket is full, refused when the cost is there', () => {
    const rule: RateLimitRule = { algorithm: 'token-bucket', maxRequests: 4, windowMs: 1_000 };
    // 1.5 of 4 tokens left: 2.5 tokens to full at 4 per second
    expect(toResult('token-bucket', rule, row({ now: 2_000, tokens: 1.5 }))).toMatchObject({
      allowed: true,
      remaining: 1,
      resetAt: new Date(2_625),
      retryAfterMs: 0,
    });
    // 0.5 tokens, cost 1: half a token away
    expect(toResult('token-bucket', rule, row({ allowed: false, now: 2_000, tokens: 0.5 }))).toMatchObject({
      allowed: false,
      remaining: 0,
      resetAt: new Date(2_125),
      retryAfterMs: 125,
    });
  });
});

describe('checkStatement', () => {
  it('is one upsert that reads the server clock and returns the outcome', () => {
    for (const algorithm of ['sliding-window', 'fixed-window', 'token-bucket'] as const) {
      const { sql: text, params } = render(checkStatement(sql, 'ratelimit:user:ada', algorithm, { algorithm, maxRequests: 3, windowMs: 1_000 }));
      expect(text).toContain('INSERT INTO "rate_limit_buckets" AS b');
      expect(text).toContain('ON CONFLICT (key) DO UPDATE SET');
      expect(text).toContain('clock_timestamp()');
      expect(text).toContain('RETURNING allowed');
      expect(params).toContain('ratelimit:user:ada');
      expect(params).toContain(algorithm);
    }
  });
});

describe('PostgresRateLimiter', () => {
  it('runs one statement per check, with the prefix, and sliding window by default', async () => {
    const { db, ran } = fakeDb();
    const limiter = new PostgresRateLimiter({ db, prefix: 'app', sweepIntervalMs: 0 });
    const result = await limiter.check('user:ada', { maxRequests: 2, windowMs: 1_000 });
    expect(result).toMatchObject({ allowed: true, limit: 2, remaining: 2 });
    expect(ran).toHaveLength(1);
    expect(ran[0]).toContain('INSERT INTO "rate_limit_buckets"');
  });

  it('reset deletes the prefixed key', async () => {
    const statements: Array<{ sql: string; params: unknown[] }> = [];
    const limiter = new PostgresRateLimiter({
      db: { execute: async (query: SQL) => void statements.push(render(query)) },
      prefix: 'app',
    });
    await limiter.reset('user:ada');
    expect(statements[0]?.sql).toContain('DELETE FROM "rate_limit_buckets" WHERE key =');
    expect(statements[0]?.params).toEqual(['app:user:ada']);
  });

  it('reports a failing or silent database as rate-limit/backend-failed', async () => {
    const failing = new PostgresRateLimiter({ db: { execute: () => Promise.reject(new TypeError('connection refused')) } });
    await expect(failing.check('k', { maxRequests: 1, windowMs: 1_000 })).rejects.toMatchObject({ code: 'rate-limit/backend-failed' });
    await expect(failing.reset('k')).rejects.toMatchObject({ code: 'rate-limit/backend-failed' });
    expect(await failing.isHealthy()).toBe(false);
    const silent = new PostgresRateLimiter({ db: fakeDb(() => []).db });
    await expect(silent.check('k', { maxRequests: 1, windowMs: 1_000 })).rejects.toMatchObject({ code: 'rate-limit/backend-failed' });
  });

  it('needs a database', () => {
    expect(() => createRateLimiter({ adapter: 'postgres' })).toThrow(expect.objectContaining({ code: 'rate-limit/database-required' }));
    expect(createRateLimiter({ adapter: 'postgres', db: fakeDb().db })).toBeInstanceOf(PostgresRateLimiter);
  });

  it('sweeps from check at most once per interval, one sweep at a time', async () => {
    let clock = 0;
    let release: (() => void) | undefined;
    const { db, ran } = fakeDb((text) => {
      if (!isSweep(text)) return [row({})];
      return new Promise((resolve) => {
        release = () => resolve([{ deleted: 0 }]);
      });
    });
    const limiter = new PostgresRateLimiter({ db, sweepIntervalMs: 1_000, now: () => clock });
    const rule: RateLimitRule = { maxRequests: 9, windowMs: 1_000 };
    const sweeps = () => ran.filter(isSweep).length;

    await limiter.check('k', rule);
    expect(sweeps()).toBe(1); // the first check sweeps
    clock = 2_000;
    await limiter.check('k', rule);
    expect(sweeps()).toBe(1); // the first is still running: no second one alongside it
    release?.();
    await limiter.disconnect();
    await limiter.check('k', rule);
    expect(sweeps()).toBe(2); // due, and nothing running
    release?.();
    await limiter.disconnect();
    clock = 2_500;
    await limiter.check('k', rule);
    expect(sweeps()).toBe(2); // within the interval
    clock = 3_000;
    await limiter.check('k', rule);
    expect(sweeps()).toBe(3);
    release?.();
    await limiter.disconnect();
  });

  it('a failed sweep is not the check’s failure, and is tried again next interval', async () => {
    let clock = 0;
    const { db, ran } = fakeDb((text) => (isSweep(text) ? Promise.reject(new TypeError('lock timeout')) : [row({})]));
    const limiter = new PostgresRateLimiter({ db, sweepIntervalMs: 1_000, now: () => clock });
    expect((await limiter.check('k', { maxRequests: 1, windowMs: 1_000 })).allowed).toBe(true);
    await limiter.disconnect();
    clock = 1_000;
    await limiter.check('k', { maxRequests: 1, windowMs: 1_000 });
    await limiter.disconnect();
    expect(ran.filter(isSweep)).toHaveLength(2);
  });

  it('never sweeps on its own with sweepIntervalMs 0, and sweep() deletes batch after batch', async () => {
    const batches = [1_000, 1_000, 7];
    const { db, ran } = fakeDb((text) => (isSweep(text) ? [{ deleted: batches.shift() }] : [row({})]));
    const limiter = new PostgresRateLimiter({ db, sweepIntervalMs: 0 });
    await limiter.check('k', { maxRequests: 1, windowMs: 1_000 });
    expect(ran.filter(isSweep)).toHaveLength(0);
    expect(await limiter.sweep()).toBe(2_007);
    expect(ran.filter(isSweep)).toHaveLength(3);
  });
});
