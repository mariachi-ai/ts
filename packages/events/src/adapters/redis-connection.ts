import { loadOptionalPeer } from '@mariachi/core';
import type Redis from 'ioredis';

type RedisConstructor = typeof import('ioredis').default;

/** ioredis, loaded when a client is first made: an app that uses Redis has it installed (`pnpm add ioredis`). */
function redisConstructor(feature: string): RedisConstructor {
  const loaded = loadOptionalPeer<RedisConstructor & { default?: RedisConstructor }>('ioredis', feature, import.meta.url);
  return loaded.default ?? loaded;
}

export function openRedis(url: string | undefined, existing?: Redis): { client: Redis; owned: boolean } {
  if (existing) return { client: existing, owned: false };
  return { client: new (redisConstructor('The Redis event bus'))(url ?? 'redis://localhost:6379', { lazyConnect: true }), owned: true };
}

export async function ensureConnected(client: Redis): Promise<void> {
  if (client.status === 'wait' || client.status === 'end') await client.connect();
}

export async function closeRedis(client: Redis): Promise<void> {
  if (client.status === 'end') return;
  await client.quit().catch(() => client.disconnect());
}

export async function pingRedis(client: Redis): Promise<boolean> {
  try {
    return (await client.ping()) === 'PONG';
  } catch {
    return false;
  }
}
