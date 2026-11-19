import { afterAll, beforeAll } from 'vitest';
import { startRedis, stopAll } from '../../../../test/setup';
import { rateLimiterContract } from '../test/contract';
import { RedisRateLimiter } from './redis';

let a: RedisRateLimiter;
let b: RedisRateLimiter;
const run = crypto.randomUUID().slice(0, 8);

beforeAll(async () => {
  const url = await startRedis();
  a = new RedisRateLimiter({ url, prefix: `rl-${run}` });
  b = new RedisRateLimiter({ url, prefix: `rl-${run}` }); // a second instance sharing the budget
  await a.connect();
  await b.connect();
}, 180_000);

afterAll(async () => {
  await a?.disconnect();
  await b?.disconnect();
  await stopAll();
});

rateLimiterContract('redis', () => ({ a, b }));
