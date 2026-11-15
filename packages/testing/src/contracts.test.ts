import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { MemoryCacheAdapter } from '@mariachi/cache';
import { MemoryInAppStore } from '@mariachi/notifications';
import { MemorySearchAdapter } from '@mariachi/search';
import { LocalStorageAdapter, MemoryStorageAdapter } from '@mariachi/storage';
import { TestCacheClient } from './adapters/cache';
import { TestRepository } from './adapters/database';
import { TestInAppStore } from './adapters/notifications';
import { TestJobQueue } from './adapters/jobs';
import { TestLock } from './adapters/lock';
import { TestSearchClient } from './adapters/search';
import { TestStorageClient } from './adapters/storage';
import { createTestContext } from './factories/context.factory';
import { cacheContract, inboxContract, lockContract, searchContract, storageContract } from './contracts/index';

// Real adapters run the same suites in contracts.integration.test.ts.
storageContract('memory', () => new MemoryStorageAdapter());
storageContract('local', async () => new LocalStorageAdapter({ basePath: await mkdtemp(join(tmpdir(), 'mariachi-')) }));
storageContract('test double', () => new TestStorageClient());
searchContract('memory', () => new MemorySearchAdapter());
searchContract('test double', () => new TestSearchClient());
inboxContract('memory', () => new MemoryInAppStore());
inboxContract('test double', () => new TestInAppStore());
cacheContract('memory', (prefix) => new MemoryCacheAdapter({ adapter: 'memory', prefix }));
cacheContract('test double', (prefix) => new TestCacheClient({ prefix }));
lockContract('test double', () => new TestLock());

describe('job runner contract', () => {
  it('executes a registered handler when drained', async () => {
    const queue = new TestJobQueue();
    const seen: string[] = [];
    queue.registerJob({
      name: 'greet',
      schema: z.object({ name: z.string() }),
      handler: async (_ctx, data) => { seen.push(data.name); },
    });
    await queue.enqueue('greet', { name: 'ada' });
    await queue.drain();
    expect(seen).toEqual(['ada']);
    expect(queue.getEnqueuedJobs()).toEqual([]);
  });
});

describe('TestRepository bulk writes', () => {
  it('refuses an empty filter, as DrizzleRepository does', async () => {
    const repo = new TestRepository<{ id: string; tenantId: string; name: string }>({ tenantColumn: 'tenantId' });
    const ctx = createTestContext({ tenantId: 't1' });
    const row = await repo.create(ctx, { tenantId: 't1', name: 'kept' });
    for (const empty of [{}, [], { name: undefined }]) {
      await expect(repo.updateWhere(ctx, empty, { name: 'overwritten' })).rejects.toMatchObject({ code: 'database/unsafe-operation' });
      await expect(repo.deleteWhere(ctx, empty)).rejects.toMatchObject({ code: 'database/unsafe-operation' });
    }
    expect((await repo.findById(ctx, row.id))?.name).toBe('kept');
    expect(await repo.updateWhere(ctx, { name: 'kept' }, { name: 'renamed' })).toBe(1);
  });
});
