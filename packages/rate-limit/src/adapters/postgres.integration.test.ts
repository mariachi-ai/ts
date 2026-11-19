import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { sql } from 'drizzle-orm';
import { applySchema, createPostgresDatabase, type PostgresDatabase } from '@mariachi/database-postgres';
import { startPostgres, stopAll } from '../../../../test/setup';
import { createRateLimiter } from '../index';
import { rateLimitBucketsTable } from '../schema/index';
import { rateLimiterContract } from '../test/contract';
import type { RateLimitRule } from '../types';
import { PostgresRateLimiter } from './postgres';

// Two databases on one server: two connection pools, as two processes of one app would have
let first: PostgresDatabase;
let second: PostgresDatabase;
let a: PostgresRateLimiter;
let b: PostgresRateLimiter;
const run = crypto.randomUUID().slice(0, 8);
const prefix = `rl-${run}`;
const rows = <T>(result: unknown): T[] => (Array.isArray(result) ? (result as T[]) : ((result as { rows: T[] }).rows ?? []));
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeAll(async () => {
  const url = await startPostgres();
  first = createPostgresDatabase({ url, poolMax: 10 });
  second = createPostgresDatabase({ url, poolMax: 10 });
  await first.connect();
  await second.connect();
  await applySchema(first.db, [rateLimitBucketsTable]);
  a = new PostgresRateLimiter({ db: first.db, prefix });
  b = new PostgresRateLimiter({ db: second.db, prefix });
}, 180_000);

afterAll(async () => {
  await a?.disconnect();
  await b?.disconnect();
  await first?.disconnect();
  await second?.disconnect();
  await stopAll();
});

rateLimiterContract('postgres', () => ({ a, b }));

const stored = async (key: string) =>
  rows<{ key: string; algorithm: string; expires_ms: number }>(
    await first.db.execute(sql`select key, algorithm, (extract(epoch from expires_at) * 1000)::float8 as expires_ms from rate_limit_buckets where key = ${`${prefix}:${key}`}`),
  );

describe('PostgresRateLimiter', () => {
  it('is what createRateLimiter builds for adapter postgres', async () => {
    const limiter = createRateLimiter({ adapter: 'postgres', db: first.db, prefix });
    expect(limiter).toBeInstanceOf(PostgresRateLimiter);
    expect(await limiter.isHealthy()).toBe(true);
    const rule: RateLimitRule = { algorithm: 'token-bucket', maxRequests: 1, windowMs: 60_000 };
    expect((await limiter.check('factory', rule)).allowed).toBe(true);
    expect((await a.check('factory', rule)).allowed).toBe(false); // the same row, through another pool
  });

  it('holds the limit when many clients on two pools hammer one key', async () => {
    for (const algorithm of ['sliding-window', 'fixed-window', 'token-bucket'] as const) {
      const rule: RateLimitRule = { algorithm, maxRequests: 40, windowMs: 60_000, cost: 2 };
      const clients = Array.from({ length: 6 }, (_, i) => new PostgresRateLimiter({ db: i % 2 ? first.db : second.db, prefix, sweepIntervalMs: 0 }));
      // A fixed window can straddle a minute boundary; try another key if it did
      for (let attempt = 0; ; attempt++) {
        const key = `hammer:${algorithm}:${attempt}`;
        const results = await Promise.all(Array.from({ length: 300 }, (_, i) => clients[i % clients.length]!.check(key, rule)));
        if (algorithm === 'fixed-window' && new Set(results.map((r) => r.resetAt.getTime())).size > 1 && attempt < 4) continue;
        expect(results.filter((r) => r.allowed)).toHaveLength(20);
        // Every admitted request saw a distinct count: none was lost to a race
        expect(new Set(results.filter((r) => r.allowed).map((r) => r.remaining)).size).toBe(20);
        break;
      }
    }
  });

  it('a key used with another algorithm starts afresh', async () => {
    const fixed: RateLimitRule = { algorithm: 'fixed-window', maxRequests: 1, windowMs: 60_000 };
    const bucket: RateLimitRule = { algorithm: 'token-bucket', maxRequests: 1, windowMs: 60_000 };
    expect((await a.check('switch', bucket)).allowed).toBe(true);
    expect((await a.check('switch', bucket)).allowed).toBe(false);
    expect((await b.check('switch', fixed)).allowed).toBe(true);
    expect((await b.check('switch', fixed)).allowed).toBe(false);
    expect((await stored('switch'))[0]?.algorithm).toBe('fixed-window');
  });

  it('sweeps the rows of windows that have passed, and keeps the rest', async () => {
    const limiter = new PostgresRateLimiter({ db: first.db, prefix, sweepIntervalMs: 0 });
    const short: RateLimitRule = { algorithm: 'fixed-window', maxRequests: 5, windowMs: 100 };
    for (const algorithm of ['sliding-window', 'fixed-window', 'token-bucket'] as const) {
      await limiter.check(`old:${algorithm}`, { ...short, algorithm });
    }
    await limiter.check('current', { algorithm: 'sliding-window', maxRequests: 5, windowMs: 60_000 });
    await pause(250);
    expect(await limiter.sweep()).toBeGreaterThanOrEqual(3);
    for (const algorithm of ['sliding-window', 'fixed-window', 'token-bucket']) expect(await stored(`old:${algorithm}`)).toHaveLength(0);
    expect(await stored('current')).toHaveLength(1);
    // A swept key starts from a fresh state
    expect(await limiter.check('old:sliding-window', { ...short, algorithm: 'sliding-window' })).toMatchObject({ allowed: true, remaining: 4 });
  });

  it('deletes expired rows in the background while checking, at most once per interval', async () => {
    const short: RateLimitRule = { algorithm: 'fixed-window', maxRequests: 5, windowMs: 50 };
    const writer = new PostgresRateLimiter({ db: first.db, prefix, sweepIntervalMs: 0 });
    for (let i = 0; i < 25; i++) await writer.check(`stale:${i}`, short);
    await pause(150);
    let clock = 1_000_000;
    const limiter = new PostgresRateLimiter({ db: second.db, prefix, sweepIntervalMs: 60_000, now: () => clock });
    await limiter.check('trigger', short); // the first check sweeps
    await limiter.disconnect(); // waits for the sweep
    for (let i = 0; i < 25; i++) expect(await stored(`stale:${i}`)).toHaveLength(0);

    for (let i = 0; i < 5; i++) await writer.check(`stale-again:${i}`, short);
    await pause(150);
    clock += 30_000; // within the interval: no sweep
    await limiter.check('trigger', short);
    await limiter.disconnect();
    expect(await stored('stale-again:0')).toHaveLength(1);
    clock += 30_000; // the interval has passed
    await limiter.check('trigger', short);
    await limiter.disconnect();
    for (let i = 0; i < 5; i++) expect(await stored(`stale-again:${i}`)).toHaveLength(0);
  });

  it('a sweep running alongside checks neither loses counts nor blocks them', async () => {
    const rule: RateLimitRule = { algorithm: 'sliding-window', maxRequests: 30, windowMs: 60_000 };
    const writer = new PostgresRateLimiter({ db: first.db, prefix, sweepIntervalMs: 0 });
    for (let i = 0; i < 50; i++) await writer.check(`litter:${i}`, { ...rule, windowMs: 20 });
    await pause(100);
    const [results] = await Promise.all([
      Promise.all(Array.from({ length: 80 }, (_, i) => (i % 2 ? a : b).check('busy', rule))),
      writer.sweep(),
      writer.sweep(),
    ]);
    expect(results.filter((r) => r.allowed)).toHaveLength(30);
    expect(await stored('busy')).toHaveLength(1);
  });

  it('uses the database clock, and keeps a row only as long as it matters', async () => {
    const [clock] = rows<{ now: number }>(await first.db.execute(sql`select (extract(epoch from clock_timestamp()) * 1000)::float8 as now`));
    const result = await a.check('clock', { algorithm: 'fixed-window', maxRequests: 1, windowMs: 1_000 });
    const serverNow = clock!.now;
    expect(result.resetAt.getTime()).toBeGreaterThan(serverNow);
    expect(result.resetAt.getTime()).toBeLessThanOrEqual(serverNow + 1_000 + 500);
    const [row] = await stored('clock');
    expect(row!.expires_ms).toBe(result.resetAt.getTime());
  });

  it('reports an unreachable database as rate-limit/backend-failed', async () => {
    const broken = new PostgresRateLimiter({ db: { execute: () => Promise.reject(new Error('connection refused')) }, prefix });
    await expect(broken.check('x', { maxRequests: 1, windowMs: 1_000 })).rejects.toMatchObject({ code: 'rate-limit/backend-failed' });
    expect(await broken.isHealthy()).toBe(false);
  });
});
