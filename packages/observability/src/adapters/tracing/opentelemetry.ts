import type { Span as OTELSpan, Tracer } from '@opentelemetry/api';
import { loadOptionalPeer } from '@mariachi/core';
import type { SpanKind, SpanOptions } from '@mariachi/core';
import type { Span, TracerAdapter } from '../../types';

type OtelApi = typeof import('@opentelemetry/api');

function wrapSpan(api: OtelApi, otelSpan: OTELSpan): Span {
  return {
    setAttribute(key, value) {
      otelSpan.setAttribute(key, value);
    },
    setStatus(status, message) {
      otelSpan.setStatus({ code: status === 'ok' ? api.SpanStatusCode.OK : api.SpanStatusCode.ERROR, message });
    },
    recordException(error) {
      otelSpan.recordException(error);
    },
    addEvent(name, attributes) {
      otelSpan.addEvent(name, attributes);
    },
    end() {
      otelSpan.end();
    },
  };
}

function otelKind(api: OtelApi, kind: SpanKind | undefined) {
  switch (kind) {
    case 'server':
      return api.SpanKind.SERVER;
    case 'client':
      return api.SpanKind.CLIENT;
    case 'producer':
      return api.SpanKind.PRODUCER;
    case 'consumer':
      return api.SpanKind.CONSUMER;
    default:
      return api.SpanKind.INTERNAL;
  }
}

/**
 * Uses the globally registered OpenTelemetry provider. Call `setupOpenTelemetry()` once at
 * startup (or register your own SDK) so spans are actually exported.
 */
export class OpenTelemetryTracerAdapter implements TracerAdapter {
  private readonly api: OtelApi;
  private readonly tracer: Tracer;

  constructor(serviceName = 'mariachi') {
    this.api = loadOptionalPeer<OtelApi>('@opentelemetry/api', 'OpenTelemetryTracerAdapter', import.meta.url);
    this.tracer = this.api.trace.getTracer(serviceName);
  }

  startSpan(name: string, attributes?: Record<string, string | number | boolean>, options?: SpanOptions): Span {
    return wrapSpan(this.api, this.tracer.startSpan(name, { attributes, kind: otelKind(this.api, options?.kind) }));
  }

  /** Runs `fn` inside an active span, so nested spans become children. */
  async withSpan<T>(name: string, fn: (span: Span) => Promise<T>): Promise<T> {
    return this.tracer.startActiveSpan(name, async (otelSpan) => {
      const wrapped = wrapSpan(this.api, otelSpan);
      try {
        const result = await fn(wrapped);
        otelSpan.setStatus({ code: this.api.SpanStatusCode.OK });
        return result;
      } catch (error) {
        otelSpan.recordException(error as Error);
        otelSpan.setStatus({ code: this.api.SpanStatusCode.ERROR, message: (error as Error).message });
        throw error;
      } finally {
        otelSpan.end();
      }
    });
  }

  /** Active trace id (for log correlation), if any. */
  activeTraceId(): string | undefined {
    return this.api.trace.getActiveSpan()?.spanContext().traceId;
  }
}

/**
 * The key `@opentelemetry/api` (major version 1) keeps its globals under. It is a `Symbol.for`, so every
 * copy of the API in the process shares it: a provider registered by a preload (`--require`) or another
 * SDK is seen here even when that code loaded a different copy of the API.
 */
const OTEL_API_GLOBAL = Symbol.for('opentelemetry.js.api.1');

/**
 * Whether an OpenTelemetry tracer provider is already registered for this process: by a preload, by
 * an SDK the app started itself, or by `setupOpenTelemetry`. Needs no OpenTelemetry package installed.
 */
export function openTelemetryRegistered(): boolean {
  const globals = (globalThis as Record<symbol, { trace?: unknown } | undefined>)[OTEL_API_GLOBAL];
  return Boolean(globals?.trace);
}

export interface OpenTelemetrySetupOptions {
  serviceName: string;
  /** OTLP/HTTP traces endpoint, e.g. http://localhost:4318/v1/traces */
  endpoint?: string;
  headers?: Record<string, string>;
}

/**
 * Starts the OpenTelemetry Node SDK with an OTLP/HTTP exporter. Requires the optional peers
 * `@opentelemetry/sdk-node` and `@opentelemetry/exporter-trace-otlp-http`. It always starts a new SDK;
 * check `openTelemetryRegistered()` first if something else may have registered one (`bootstrap` does).
 * Returns a shutdown function to register with the lifecycle ShutdownManager.
 */
export function setupOpenTelemetry(options: OpenTelemetrySetupOptions): () => Promise<void> {
  const sdkNode = loadOptionalPeer<any>('@opentelemetry/sdk-node', 'setupOpenTelemetry', import.meta.url);
  const exporterMod = loadOptionalPeer<any>(
    '@opentelemetry/exporter-trace-otlp-http',
    'setupOpenTelemetry',
    import.meta.url,
  );
  const sdk = new sdkNode.NodeSDK({
    serviceName: options.serviceName,
    traceExporter: new exporterMod.OTLPTraceExporter({ url: options.endpoint, headers: options.headers }),
  });
  sdk.start();
  return () => sdk.shutdown();
}
