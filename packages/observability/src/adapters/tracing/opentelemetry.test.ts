import { ProxyTracerProvider, trace } from '@opentelemetry/api';
import { afterEach, describe, expect, it } from 'vitest';
import { openTelemetryRegistered } from './opentelemetry';

afterEach(() => trace.disable());

describe('openTelemetryRegistered', () => {
  it('is false until a tracer provider is registered, and false again once it is removed', () => {
    expect(openTelemetryRegistered()).toBe(false);
    trace.setGlobalTracerProvider(new ProxyTracerProvider());
    expect(openTelemetryRegistered()).toBe(true);
    trace.disable();
    expect(openTelemetryRegistered()).toBe(false);
  });

  it('sees a provider registered through another copy of the API, which shares the global key', () => {
    const key = Symbol.for('opentelemetry.js.api.1');
    const globals = globalThis as Record<symbol, unknown>;
    const before = globals[key];
    globals[key] = { version: '1.0.0', trace: { getTracer: () => undefined } };
    try {
      expect(openTelemetryRegistered()).toBe(true);
    } finally {
      globals[key] = before;
    }
  });
});
