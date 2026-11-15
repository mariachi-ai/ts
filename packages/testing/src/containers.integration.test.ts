import { connect } from 'node:net';
import { createPostgresDatabase } from '@mariachi/database-postgres';
import { sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { startPostgres, startRedis, stopContainers } from './index';

afterAll(() => stopContainers());

describe('throwaway containers', () => {
  it('starts a Postgres that takes connections, a new empty one each time', async () => {
    const [one, two] = await Promise.all([startPostgres(), startPostgres()]);
    expect(one).not.toBe(two);
    const first = createPostgresDatabase({ url: one });
    const second = createPostgresDatabase({ url: two });
    await Promise.all([first.connect(), second.connect()]);
    try {
      await first.db.execute(sql`create table only_here (id int)`);
      const seen = await second.db.execute(sql`select count(*)::int as n from information_schema.tables where table_name = 'only_here'`);
      expect((seen as unknown as Array<{ n: number }>)[0]?.n).toBe(0);
    } finally {
      await Promise.all([first.disconnect(), second.disconnect()]);
    }
  }, 180_000);

  it('starts a Redis that answers', async () => {
    const url = new URL(await startRedis());
    const reply = await new Promise<string>((resolve, reject) => {
      const socket = connect(Number(url.port), url.hostname, () => socket.write('PING\r\n'));
      socket.once('data', (data) => {
        resolve(String(data));
        socket.end();
      });
      socket.once('error', reject);
    });
    expect(reply).toBe('+PONG\r\n');
  }, 120_000);
});
