import { MariachiError, createContainer } from '@mariachi/core';
import { ProxyTracerProvider, type Tracer, type TracerProvider, trace } from '@opentelemetry/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// setupOpenTelemetry starts a real SDK; here it records the call (or throws what a test asks for)
const setup = vi.hoisted(() => ({ fn: vi.fn((_options: unknown) => async () => undefined) }));
vi.mock('@mariachi/observability', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mariachi/observability')>();
  return { ...actual, setupOpenTelemetry: (options: unknown) => setup.fn(options) };
});

const { bootstrap } = await import('./bootstrap');

const ENDPOINT = 'http://collector.test:4318/v1/traces';

function start() {
  return bootstrap({
    config: {
      serviceName: 'svc',
      observability: {
        logging: { adapter: 'console', level: 'info' },
        tracing: { adapter: 'otel', endpoint: ENDPOINT },
      },
    },
    configOptions: { env: {} },
    container: createContainer(),
    installSignalHandlers: false,
    captureProcessErrors: false,
  });
}

/** What the console logger printed at a level, message text only. */
const printed = (spy: ReturnType<typeof vi.spyOn>) => spy.mock.calls.map((args) => String(args[args.length - 1]));

let info: ReturnType<typeof vi.spyOn>;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  setup.fn.mockClear();
  info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
  warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => {
  trace.disable();
  vi.restoreAllMocks();
});

describe('bootstrap: tracing', () => {
  it('starts an SDK exporting to the endpoint when none is registered, and stops it on shutdown', async () => {
    const stop = vi.fn(async () => undefined);
    setup.fn.mockImplementationOnce(() => stop);
    const app = start();
    expect(setup.fn).toHaveBeenCalledWith({ serviceName: 'svc', endpoint: ENDPOINT });
    await app.shutdown.runAll(app.logger);
    expect(stop).toHaveBeenCalledOnce();
  });

  it('uses an SDK already registered (a --require preload) instead of starting a second one', async () => {
    // The preload's SDK, reduced to what matters here: a provider that records the spans it is given
    const started: string[] = [];
    const inner = new ProxyTracerProvider().getTracer('preload');
    const recording: Tracer = {
      startSpan: (name, options, context) => {
        started.push(name);
        return inner.startSpan(name, options, context);
      },
      startActiveSpan: ((name: string, ...rest: unknown[]) => {
        started.push(name);
        return (inner.startActiveSpan as (...args: unknown[]) => unknown)(name, ...rest);
      }) as Tracer['startActiveSpan'],
    };
    const provider: TracerProvider = { getTracer: () => recording };
    trace.setGlobalTracerProvider(provider);

    const app = start();
    expect(setup.fn).not.toHaveBeenCalled();
    expect(printed(info)).toContain('An OpenTelemetry SDK is already registered; using it');
    // Mariachi's tracer goes through the global provider, so its spans reach that SDK
    await expect(app.tracer.withSpan('mariachi.procedure', async () => 'ran')).resolves.toBe('ran');
    app.tracer.startSpan('http.route').end();
    expect(started).toEqual(['mariachi.procedure', 'http.route']);
  });

  it('starts without exporting, and says why, when the SDK packages are not installed', () => {
    setup.fn.mockImplementationOnce(() => {
      throw new MariachiError(
        'dependency/missing-peer',
        'setupOpenTelemetry requires the optional peer dependency "@opentelemetry/sdk-node"',
      );
    });
    expect(() => start()).not.toThrow();
    expect(printed(warn).some((m) => m.startsWith('Tracing is on, but spans are not exported'))).toBe(true);
  });

  it('still fails on any other error from starting the SDK', () => {
    setup.fn.mockImplementationOnce(() => {
      throw new MariachiError('config/invalid', 'bad exporter options');
    });
    expect(() => start()).toThrow('bad exporter options');
  });
});
