import { Writable } from 'node:stream';
import { describe, it, expect } from 'vitest';
import { PrometheusMetricsAdapter } from './adapters/metrics/prometheus';
import { PinoLoggerAdapter, createLogger, createObservability, createTracer } from './index';

describe('PrometheusMetricsAdapter', () => {
  it('never throws on labels that differ between calls', async () => {
    const m = new PrometheusMetricsAdapter();
    m.increment('notifications.dispatched', 1, { channel: 'email' });
    expect(() => m.increment('notifications.dispatched', 1, { channel: 'sms', category: 'marketing' })).not.toThrow();
    expect(() => m.increment('notifications.dispatched')).not.toThrow();
    const out = await m.render();
    expect(out).toContain('notifications_dispatched{channel="email"} 1');
    expect(out).toContain('notifications_dispatched{channel="sms"} 1');
  });

  it('honors declared label sets', async () => {
    const m = new PrometheusMetricsAdapter().define('http.requests', { type: 'counter', labelNames: ['route', 'status'] });
    m.increment('http.requests', 1, { status: '200' });
    expect(await m.render()).toContain('http_requests{route="",status="200"} 1');
  });

  it('records histograms and timings', async () => {
    const m = new PrometheusMetricsAdapter();
    m.timing('db.query', 12, { op: 'select' });
    expect(await m.render()).toContain('db_query_duration_ms_bucket');
  });
});

describe('factories', () => {
  it('defaults to noop tracer/metrics/errors and fails on unknown adapters', () => {
    const o = createObservability({ logging: { adapter: 'console' } });
    expect(o.tracer).toBeDefined();
    expect(() => createTracer({ adapter: 'bogus' })).toThrow(/Unknown tracer adapter/);
  });
});

describe('PinoLoggerAdapter', () => {
  const sink = () => {
    const lines: string[] = [];
    const destination = new Writable({
      write(chunk, _encoding, done) {
        lines.push(String(chunk));
        done();
      },
    });
    return { lines, destination, text: () => lines.join('') };
  };

  it('writes JSON by default, with secrets redacted', () => {
    const out = sink();
    new PinoLoggerAdapter({ destination: out.destination }).info({ userId: 'u1', password: 'hunter2' }, 'signed in');
    const line = JSON.parse(out.text());
    expect(line).toMatchObject({ msg: 'signed in', userId: 'u1', password: '[REDACTED]' });
  });

  it('writes lines a person can read when pretty is on, still redacted', () => {
    const out = sink();
    const logger = new PinoLoggerAdapter({ pretty: true, destination: out.destination, level: 'debug' });
    logger.info({ userId: 'u1', password: 'hunter2' }, 'signed in');
    logger.child({ requestId: 'r1' }).debug({}, 'looked up');
    const text = out.text();
    // Not JSON: a level, the message, and the fields on their own lines
    expect(() => JSON.parse(text.split('\n')[0] as string)).toThrow();
    expect(text).toMatch(/INFO.*signed in/);
    expect(text).toMatch(/DEBUG.*looked up/);
    expect(text).toContain('userId: "u1"');
    expect(text).toContain('requestId: "r1"');
    expect(text).toContain('[REDACTED]');
    expect(text).not.toContain('hunter2');
  });

  it('is what createLogger builds from the logging config', () => {
    expect(createLogger({ level: 'warn', pretty: true })).toBeInstanceOf(PinoLoggerAdapter);
    expect(createLogger({ level: 'warn' })).toBeInstanceOf(PinoLoggerAdapter);
  });
});
