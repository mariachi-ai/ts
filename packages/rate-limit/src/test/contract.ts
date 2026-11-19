import { describe, expect, it } from 'vitest';
import type { RateLimiter, RateLimitResult, RateLimitRule } from '../types';

const algorithms: Array<NonNullable<RateLimitRule['algorithm']>> = ['sliding-window', 'fixed-window', 'token-bucket'];
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs `checks` against a key of its own and returns the results with that key. A fixed window is
 * aligned to the clock, so now and then the checks land on both sides of a boundary and each side
 * gets the full limit. That is the algorithm working, not what these tests are about, so when the
 * results name more than one window the checks run again on a fresh key.
 */
async function inOneWindow(
  base: string,
  checks: (key: string) => Promise<RateLimitResult[]>,
): Promise<{ key: string; results: RateLimitResult[] }> {
  for (let attempt = 0; ; attempt++) {
    const key = `${base}:${attempt}`;
    const results = await checks(key);
    const windows = new Set(results.map((r) => r.resetAt.getTime()));
    if (windows.size === 1 || attempt === 4) return { key, results };
  }
}

/** Fixed-window checks are retried on a fresh key when they straddle a boundary; the others run once. */
const once = (algorithm: string, base: string, checks: (key: string) => Promise<RateLimitResult[]>) =>
  algorithm === 'fixed-window' ? inOneWindow(base, checks) : checks(`${base}:0`).then((results) => ({ key: `${base}:0`, results }));

/**
 * What every shared limiter must do: the Redis and the Postgres adapters both run it against a real
 * server, so they give the same answers. `limiters()` returns two limiters on one store that share
 * one budget (two processes, as far as the store can tell); keys are unique per run.
 */
export function rateLimiterContract(name: string, limiters: () => { a: RateLimiter; b: RateLimiter }): void {
  describe(`rate limiter contract: ${name}`, () => {
    const run = crypto.randomUUID().slice(0, 8);
    const key = (base: string) => `${run}:${base}`;

    for (const algorithm of algorithms) {
      it(`${algorithm}: admits exactly the limit across instances under concurrency`, async () => {
        const { a, b } = limiters();
        const rule: RateLimitRule = { algorithm, maxRequests: 25, windowMs: 10_000 };
        const burst = (k: string) => Promise.all(Array.from({ length: 120 }, (_, i) => (i % 2 ? a : b).check(k, rule)));
        const { key: used, results } = await once(algorithm, key(`burst:${algorithm}`), burst);
        expect(results.filter((r) => r.allowed)).toHaveLength(25);
        const denied = results.find((r) => !r.allowed)!;
        expect(denied.remaining).toBe(0);
        expect(denied.retryAfterMs).toBeGreaterThan(0);
        await a.reset(used);
        expect((await b.check(used, rule)).allowed).toBe(true);
      });

      it(`${algorithm}: gives the same counts for the same sequence`, async () => {
        const { a, b } = limiters();
        const rule = (cost: number): RateLimitRule => ({ algorithm, maxRequests: 3, windowMs: 10_000, cost });
        const { results } = await once(algorithm, key(`sequence:${algorithm}`), async (k) => [
          await a.check(k, rule(1)),
          await b.check(k, rule(2)),
          await a.check(k, rule(1)),
          await b.check(k, rule(5)),
        ]);
        expect(results.map((r) => [r.allowed, r.remaining, r.limit])).toEqual([
          [true, 2, 3],
          [true, 0, 3],
          [false, 0, 3],
          [false, 0, 3],
        ]);
        expect(results[0]!.retryAfterMs).toBe(0);
        for (const denied of results.slice(2)) {
          expect(denied.retryAfterMs).toBeGreaterThan(0);
          // A token bucket refuses a cost of 5 until 5 tokens have come back: 5/3 of the window
          expect(denied.retryAfterMs).toBeLessThanOrEqual(algorithm === 'token-bucket' ? Math.ceil((10_000 * 5) / 3) : 10_000);
        }
      });

      it(`${algorithm}: keeps keys apart`, async () => {
        const { a } = limiters();
        const rule: RateLimitRule = { algorithm, maxRequests: 1, windowMs: 10_000 };
        expect((await a.check(key(`apart:${algorithm}:x`), rule)).allowed).toBe(true);
        expect((await a.check(key(`apart:${algorithm}:x`), rule)).allowed).toBe(false);
        expect((await a.check(key(`apart:${algorithm}:y`), rule)).allowed).toBe(true);
      });
    }

    it('fixed-window: a new window starts from zero', async () => {
      const { a, b } = limiters();
      const rule: RateLimitRule = { algorithm: 'fixed-window', maxRequests: 2, windowMs: 400 };
      const { key: used, results } = await inOneWindow(key('fixed-reset'), async (k) => [await a.check(k, rule), await b.check(k, rule), await a.check(k, rule)]);
      expect(results.map((r) => r.allowed)).toEqual([true, true, false]);
      await pause(results[2]!.retryAfterMs + 20);
      const next = await b.check(used, rule);
      expect(next).toMatchObject({ allowed: true, remaining: 1 });
      expect(next.resetAt.getTime()).toBeGreaterThanOrEqual(results[0]!.resetAt.getTime() + 400);
    });

    it('sliding-window: admits again once the oldest request leaves the window', async () => {
      const { a, b } = limiters();
      const rule: RateLimitRule = { algorithm: 'sliding-window', maxRequests: 2, windowMs: 500 };
      const k = key('sliding-reset');
      expect((await a.check(k, rule)).allowed).toBe(true);
      await pause(200);
      expect((await b.check(k, rule)).allowed).toBe(true);
      const denied = await a.check(k, rule);
      expect(denied.allowed).toBe(false);
      // The first request leaves the window ~300ms from now, the second ~200ms after that
      expect(denied.retryAfterMs).toBeLessThanOrEqual(310);
      await pause(denied.retryAfterMs + 20);
      expect((await b.check(k, rule)).allowed).toBe(true);
      expect((await a.check(k, rule)).allowed).toBe(false);
    });

    it('token-bucket refills gradually', async () => {
      const { a } = limiters();
      const rule: RateLimitRule = { algorithm: 'token-bucket', maxRequests: 2, windowMs: 400 };
      const k = key('refill');
      expect((await a.check(k, rule)).allowed).toBe(true);
      expect((await a.check(k, rule)).allowed).toBe(true);
      const denied = await a.check(k, rule);
      expect(denied.allowed).toBe(false);
      expect(denied.retryAfterMs).toBeLessThanOrEqual(200); // one token, not the whole window
      await pause(250); // > one token's worth (200ms)
      expect((await a.check(k, rule)).allowed).toBe(true);
      expect((await a.check(k, rule)).allowed).toBe(false);
    });

    it('counts weighted requests', async () => {
      const { a } = limiters();
      const rule: RateLimitRule = { algorithm: 'fixed-window', maxRequests: 10, windowMs: 10_000, cost: 4 };
      const { results } = await inOneWindow(key('weighted'), async (k) => {
        const made: RateLimitResult[] = [];
        for (let i = 0; i < 3; i++) made.push(await a.check(k, rule));
        return made;
      });
      expect(results.map((r) => r.allowed)).toEqual([true, true, false]);
    });
  });
}
