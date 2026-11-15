import { connect as tcp, type Socket } from 'node:net';
import { connect as tls } from 'node:tls';
import { MariachiError } from '@mariachi/core';
import { PostgresAdapter } from '@mariachi/database-postgres';

const unreachable = (message: string) => new MariachiError('cli/unreachable', message);

function within<T>(work: Promise<T>, ms: number, what: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(unreachable(`${what} did not answer in ${ms} ms`)), ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** The root cause's message: database errors wrap the driver's. */
export function reason(error: unknown): string {
  type Wrapped = { message?: string; cause?: unknown; code?: string; metadata?: { cause?: unknown } };
  let e = error as Wrapped | undefined;
  // Node's errors carry the cause as `cause`; the framework's carry it in their metadata
  for (let next = e?.cause ?? e?.metadata?.cause; next && typeof next === 'object'; next = e?.cause ?? e?.metadata?.cause) e = next as Wrapped;
  if (!e?.message) return String(error);
  return e.code && !e.message.includes(e.code) && !e.code.startsWith('cli/') ? `${e.message} (${e.code})` : e.message;
}

export interface DatabaseProbe {
  version: string;
  /** `created_at` of the newest applied migration (a journal entry's `when`), or null when none ran. */
  lastMigration: number | null;
}

/** Connects, asks the server who it is, and reads what `runMigrations` recorded. */
export async function probeDatabase(url: string, ms = 5000): Promise<DatabaseProbe> {
  const adapter = new PostgresAdapter({ adapter: 'postgres', url, poolMax: 1, applicationName: 'mariachi-doctor' });
  try {
    await within(adapter.connect(), ms, 'Postgres');
    const raw = adapter.raw;
    const [server] = await within(raw`select current_setting('server_version') as version`, ms, 'Postgres');
    let lastMigration: number | null = null;
    const [table] = await raw`select to_regclass('drizzle.__drizzle_migrations') as name`;
    if (table?.name) {
      const [row] = await raw`select max(created_at) as last from drizzle.__drizzle_migrations`;
      lastMigration = row?.last === null || row?.last === undefined ? null : Number(row.last);
    }
    return { version: String(server?.version ?? 'unknown'), lastMigration };
  } finally {
    await adapter.disconnect().catch(() => undefined);
  }
}

const command = (...parts: string[]) => `*${parts.length}\r\n${parts.map((p) => `$${Buffer.byteLength(p)}\r\n${p}\r\n`).join('')}`;

/** Sends PING (after AUTH when the URL has a password) and waits for PONG. */
export function probeRedis(url: string, ms = 5000): Promise<void> {
  const target = new URL(url);
  const port = Number(target.port || 6379);
  const secure = target.protocol === 'rediss:';
  return new Promise<void>((resolve, reject) => {
    const socket: Socket = secure ? tls({ host: target.hostname, port, servername: target.hostname }) : tcp(port, target.hostname);
    const timer = setTimeout(() => done(unreachable(`Redis did not answer in ${ms} ms`)), ms);
    function done(error?: Error) {
      clearTimeout(timer);
      socket.destroy();
      if (error) reject(error);
      else resolve();
    }
    socket.once(secure ? 'secureConnect' : 'connect', () => {
      const password = decodeURIComponent(target.password);
      const user = decodeURIComponent(target.username);
      if (password) socket.write(user ? command('AUTH', user, password) : command('AUTH', password));
      socket.write(command('PING'));
    });
    let seen = '';
    socket.on('data', (chunk) => {
      seen += chunk.toString('utf8');
      if (seen.includes('+PONG')) done();
      else {
        const refused = /(?:^|\r\n)-([^\r\n]*)/.exec(seen);
        if (refused) done(unreachable(refused[1] || 'Redis refused the connection'));
      }
    });
    socket.once('error', (error) => done(error));
  });
}
