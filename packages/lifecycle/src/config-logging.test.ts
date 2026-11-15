import { Writable } from 'node:stream';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadConfig, REDACTED, resetConfig } from '@mariachi/config';
import { ConsoleLoggerAdapter, PinoLoggerAdapter } from '@mariachi/observability';
import { inspect } from 'node:util';

const env = {
  DATABASE_URL: 'postgres://app:db-pass-0123456789@db.internal:5432/app',
  REDIS_URL: 'redis://default:redis-pass-0123456789@cache.internal:6379',
  JWT_SECRET: 'jwt-secret-0123456789-0123456789-0123',
  ENCRYPTION_KEY: 'encryption-key-0123456789-0123456789',
  STRIPE_SECRET_KEY: 'sk_live_stripe_0123456789',
  OPENAI_API_KEY: 'sk-openai-0123456789',
};
const forbidden = ['db-pass-0123456789', 'redis-pass-0123456789', env.JWT_SECRET, env.ENCRYPTION_KEY, env.STRIPE_SECRET_KEY, env.OPENAI_API_KEY];

function sink() {
  const lines: string[] = [];
  const destination = new Writable({
    write(chunk, _encoding, done) {
      lines.push(String(chunk));
      done();
    },
  });
  return { destination, text: () => lines.join('') };
}

afterEach(() => resetConfig());

// The logger's own redaction knows field names like `password`; it has no path for `config.auth.jwtSecret`.
// What keeps a logged config safe is the config itself.
describe('logging the loaded config with the real logger', () => {
  for (const pretty of [false, true]) {
    it(`prints no secret, as ${pretty ? 'pretty lines' : 'JSON'}: the whole config, a part of it, or one nested in something else`, () => {
      const config = loadConfig({}, { env });
      const out = sink();
      const logger = new PinoLoggerAdapter({ destination: out.destination, pretty });
      logger.info({ config }, 'starting with');
      logger.info({ database: config.database, auth: config.auth }, 'parts of it');
      logger.info(config.database as unknown as Record<string, unknown>, 'one section as the log object');
      const shared = { redis: config.redis };
      logger.info({ first: shared, second: shared }, 'the same object twice');
      logger.child({ billing: config.billing }).warn({ startup: { ai: config.ai, encryption: [config.encryption] } }, 'nested');
      logger.error({ err: Object.assign(new Error('could not start'), { config }) }, 'in an error');

      const text = out.text();
      for (const secret of forbidden) expect(text, secret).not.toContain(secret);
      expect(text).toContain(REDACTED);
      // What isn't secret is still there to read
      expect(text).toContain('db.internal:5432/app');
      expect(text).toContain('app:***@');
    });
  }

  it('prints no secret through the console logger either', () => {
    const config = loadConfig({}, { env });
    const printed: unknown[][] = [];
    const spy = vi.spyOn(console, 'info').mockImplementation((...args) => void printed.push(args));
    try {
      const logger = new ConsoleLoggerAdapter({ billing: config.billing });
      logger.info({ config }, 'starting with');
      logger.info(config.database as unknown as Record<string, unknown>, 'one section as the log object');
      logger.child({ auth: config.auth }).info({ list: [config.encryption] }, 'nested');
    } finally {
      spy.mockRestore();
    }
    // As the console shows it, and as a collector reading JSON would
    const text = printed.map((args) => `${inspect(args, { depth: 10 })}\n${JSON.stringify(args)}`).join('\n');
    for (const secret of forbidden) expect(text, secret).not.toContain(secret);
    expect(text).toContain(REDACTED);
    expect(text).toContain('app:***@');
  });
});
