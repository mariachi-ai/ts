import type { Logger } from '@mariachi/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { defineJob } from '../define';
import { MemoryJobAdapter } from './memory';

const errors: unknown[] = [];
const logger: Logger = { info() {}, warn() {}, debug() {}, error: (fields) => void errors.push(fields), child: () => logger };
const MINUTE = 60_000;

function setup() {
  const ran: Array<{ at: string; data: unknown }> = [];
  const queue = new MemoryJobAdapter({}, logger);
  queue.registerJob(
    defineJob({
      name: 'digest.send',
      schema: z.object({ list: z.string().optional() }),
      handler: async (_ctx, data) => {
        ran.push({ at: new Date().toISOString(), data });
      },
    }),
  );
  return { queue, ran };
}

describe('cron schedules in the in-memory queue', () => {
  beforeEach(() => {
    errors.length = 0;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-15T10:00:30Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs a schedule at each of its times while the queue is started', async () => {
    const { queue, ran } = setup();
    queue.register({ name: 'every-minute', cron: '* * * * *', jobName: 'digest.send', data: { list: 'weekly' } });
    await queue.start();
    expect(ran).toEqual([]);
    await vi.advanceTimersByTimeAsync(30_000 + 50);
    expect(ran).toEqual([{ at: expect.stringMatching(/^2026-11-15T10:01:00/), data: { list: 'weekly' } }]);
    await vi.advanceTimersByTimeAsync(2 * MINUTE);
    expect(ran.map((run) => run.at.slice(11, 16))).toEqual(['10:01', '10:02', '10:03']);
    await queue.stop();
    expect(errors).toEqual([]);
  });

  it('runs nothing before it is started or after it is stopped, and does not make up what it missed', async () => {
    const { queue, ran } = setup();
    queue.register({ name: 'every-minute', cron: '* * * * *', jobName: 'digest.send' });
    await vi.advanceTimersByTimeAsync(3 * MINUTE);
    expect(ran).toEqual([]);
    await queue.start();
    await vi.advanceTimersByTimeAsync(MINUTE);
    expect(ran).toHaveLength(1);
    await queue.stop();
    await vi.advanceTimersByTimeAsync(5 * MINUTE);
    expect(ran).toHaveLength(1);
    // Started again, it picks up at the next time, not the five it was stopped for
    await queue.start();
    await vi.advanceTimersByTimeAsync(MINUTE);
    expect(ran).toHaveLength(2);
    await queue.stop();
  });

  it('follows a schedule that is replaced or removed while running', async () => {
    const { queue, ran } = setup();
    await queue.start();
    queue.register({ name: 'digest', cron: '* * * * *', jobName: 'digest.send', data: { list: 'first' } });
    await vi.advanceTimersByTimeAsync(MINUTE);
    // The same name again is the same schedule, changed: every five minutes now
    queue.register({ name: 'digest', cron: '*/5 * * * *', jobName: 'digest.send', data: { list: 'second' } });
    await vi.advanceTimersByTimeAsync(5 * MINUTE);
    expect(ran.map((run) => [run.at.slice(11, 16), (run.data as { list: string }).list])).toEqual([
      ['10:01', 'first'],
      ['10:05', 'second'],
    ]);
    await queue.unregister('digest');
    await vi.advanceTimersByTimeAsync(10 * MINUTE);
    expect(ran).toHaveLength(2);
    await queue.stop();
  });

  it('reads the times in the schedule\'s own timezone', async () => {
    const { queue, ran } = setup();
    // 07:00 in New York is 12:00 UTC in November
    queue.register({ name: 'morning', cron: '0 7 * * *', jobName: 'digest.send', timezone: 'America/New_York' });
    await queue.start();
    await vi.advanceTimersByTimeAsync(90 * MINUTE);
    expect(ran).toEqual([]);
    await vi.advanceTimersByTimeAsync(30 * MINUTE);
    expect(ran.map((run) => run.at.slice(11, 16))).toEqual(['12:00']);
    await queue.stop();
  });

  it('refuses a cron expression it cannot read, where it is registered', () => {
    const { queue } = setup();
    expect(() => queue.register({ name: 'bad', cron: 'every tuesday', jobName: 'digest.send' })).toThrowError(expect.objectContaining({ code: 'jobs/invalid-schedule' }));
  });
});
