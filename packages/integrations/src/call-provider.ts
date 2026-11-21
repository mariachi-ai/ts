import { createRequire } from 'node:module';
import type { Context, MetricsAdapter, Span, TracerAdapter } from '@mariachi/core';
import { computeRetryDelay } from '@mariachi/core';
import { ProviderError, RETRIED_CATEGORIES } from './provider-error';

/**
 * One call to a provider, as its span names it. Every field is low-cardinality and safe to record: never a URL,
 * an id, an amount, an address or a body.
 */
export interface ProviderCall {
  /** The integration's stable id: `stripe`, `hubspot`, `s3`. */
  integration: string;
  /** The provider's name for the operation: `contacts.create`, never a URL. */
  operation: string;
  /** What kind of provider it is: `payments`, `email`, `crm`. */
  category: string;
  /** The host called: `api.hubapi.com`. */
  server: string;
  /** The HTTP method, for HTTP providers. */
  method?: string;
  /** An opaque id of the end user's connection the call used, when it used one. Never the provider's own id. */
  connection?: string;
}

export interface ProviderDeps {
  /** From the container in a Mariachi app. Without one, spans go through `@opentelemetry/api` when it's installed. */
  tracer?: TracerAdapter;
  /** From the container in a Mariachi app. Without one, no metrics are recorded. */
  metrics?: MetricsAdapter;
  retry?: { attempts?: number; baseDelayMs?: number; maxDelayMs?: number };
  /** Record `mariachi.tenant_id` (the app's own tenant id) on spans. Off by default. */
  tenantAttribute?: boolean;
  /** For tests: wait this long between attempts. */
  sleep?: (ms: number) => Promise<void>;
  /** For tests: the clock the duration is measured with. */
  now?: () => number;
}

/** What one attempt can report back to its span. */
export interface ProviderAttempt {
  /** 1 for the first attempt. */
  attempt: number;
  /** The provider's HTTP status, once it answered. */
  setStatusCode(code: number): void;
}

/**
 * Every attribute a provider call's span may carry, and nothing else (the integrations plan, "What each call
 * emits"). `@mariachi/integrations/testing`'s `assertProviderSpans` fails on anything outside it.
 */
export const PROVIDER_SPAN_ATTRIBUTES = [
  'mariachi.integration',
  'mariachi.integration.operation',
  'mariachi.integration.category',
  'server.address',
  'http.request.method',
  'http.response.status_code',
  'error.type',
  'mariachi.integration.error_category',
  'mariachi.integration.attempts',
  'mariachi.integration.connection',
  'mariachi.tenant_id',
] as const;

export const PROVIDER_METRICS = {
  calls: 'mariachi.integration.calls',
  duration: 'mariachi.integration.duration',
} as const;

const DEFAULT_ATTEMPTS = 3;

/**
 * Runs one call to a provider: one CLIENT span named `<integration> <operation>`, the calls counter and the
 * duration histogram, and retries of `rate-limited` and `unavailable` failures, waiting as long as the
 * provider's `Retry-After` asks. Each retry is an event on the span. Every integration's operations go through
 * it, usually by way of `providerRequest`; no package sets span attributes of its own.
 *
 * A failure that isn't a `ProviderError` (a bug, a validation error) fails at once and isn't retried, except a
 * network failure (`fetch` throwing a `TypeError`), which is `unavailable`.
 */
export async function callProvider<T>(
  ctx: Context,
  call: ProviderCall,
  fn: (attempt: ProviderAttempt) => Promise<T>,
  deps: ProviderDeps = {},
): Promise<T> {
  const tracer = deps.tracer ?? openTelemetryTracer();
  const now = deps.now ?? Date.now;
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const maxAttempts = Math.max(1, deps.retry?.attempts ?? DEFAULT_ATTEMPTS);
  const span = tracer?.startSpan(`${call.integration} ${call.operation}`, baseAttributes(ctx, call, deps), { kind: 'client' });
  const started = now();
  let attempt = 0;
  let status: number | undefined;
  try {
    for (;;) {
      attempt += 1;
      status = undefined;
      try {
        const result = await fn({ attempt, setStatusCode: (code) => { status = code; } });
        finish(span, deps.metrics, call, attempt, status, now() - started);
        return result;
      } catch (raw) {
        const error = asProviderError(raw, call);
        const retryable = error instanceof ProviderError && RETRIED_CATEGORIES.has(error.category);
        if (!retryable || attempt >= maxAttempts) throw error;
        const code = error.status ?? status;
        span?.addEvent?.('retry', { 'mariachi.integration.attempts': attempt, ...(code ? { 'http.response.status_code': code } : {}) });
        const delay = error.retryAfterMs ?? computeRetryDelay({ backoff: 'exponential', baseDelayMs: deps.retry?.baseDelayMs ?? 200, maxDelayMs: deps.retry?.maxDelayMs ?? 10_000, jitter: true }, attempt - 1);
        await sleep(delay);
      }
    }
  } catch (error) {
    fail(span, deps.metrics, call, attempt, error, status, now() - started);
    throw error;
  }
}

function baseAttributes(ctx: Context, call: ProviderCall, deps: ProviderDeps): Record<string, string> {
  return {
    'mariachi.integration': call.integration,
    'mariachi.integration.operation': call.operation,
    'mariachi.integration.category': call.category,
    'server.address': call.server,
    ...(call.method ? { 'http.request.method': call.method.toUpperCase() } : {}),
    ...(call.connection ? { 'mariachi.integration.connection': call.connection } : {}),
    ...(deps.tenantAttribute && ctx.tenantId ? { 'mariachi.tenant_id': ctx.tenantId } : {}),
  };
}

function tags(call: ProviderCall, outcome: 'ok' | 'error'): Record<string, string> {
  return { integration: call.integration, operation: call.operation, category: call.category, outcome };
}

function finish(span: Span | undefined, metrics: MetricsAdapter | undefined, call: ProviderCall, attempts: number, status: number | undefined, ms: number): void {
  if (span) {
    if (status !== undefined) span.setAttribute('http.response.status_code', status);
    span.setAttribute('mariachi.integration.attempts', attempts);
    span.setStatus('ok');
    span.end();
  }
  metrics?.increment(PROVIDER_METRICS.calls, 1, tags(call, 'ok'));
  metrics?.histogram(PROVIDER_METRICS.duration, ms, tags(call, 'ok'));
}

function fail(span: Span | undefined, metrics: MetricsAdapter | undefined, call: ProviderCall, attempts: number, error: unknown, status: number | undefined, ms: number): void {
  if (span) {
    const code = error instanceof ProviderError ? error.status ?? status : status;
    if (code !== undefined) span.setAttribute('http.response.status_code', code);
    span.setAttribute('mariachi.integration.attempts', attempts);
    span.setAttribute('error.type', errorType(error, call));
    if (error instanceof ProviderError) span.setAttribute('mariachi.integration.error_category', error.category);
    // The code only: a provider's message can carry the data the plan keeps out of spans
    span.setStatus('error', errorType(error, call));
    span.end();
  }
  metrics?.increment(PROVIDER_METRICS.calls, 1, tags(call, 'error'));
  metrics?.histogram(PROVIDER_METRICS.duration, ms, tags(call, 'error'));
}

/** The provider's own code when it gave one (`card_declined`), else the error's code (`hubspot/rate-limited`). */
function errorType(error: unknown, call: ProviderCall): string {
  if (error instanceof ProviderError) return error.providerCode ?? error.code;
  const code = (error as { code?: unknown })?.code;
  return typeof code === 'string' && code.includes('/') ? code : `${call.integration}/error`;
}

function asProviderError(error: unknown, call: ProviderCall): unknown {
  // fetch throws a TypeError when the provider can't be reached at all
  if (error instanceof TypeError && /fetch|network|socket|ECONN|ETIMEDOUT|terminated/i.test(`${error.message} ${(error as { cause?: { code?: string } }).cause?.code ?? ''}`)) {
    return new ProviderError(`${call.integration}/unavailable`, `${call.integration} couldn't be reached`, { category: 'unavailable' });
  }
  return error;
}

type OtelApi = typeof import('@opentelemetry/api');
let otel: TracerAdapter | null | undefined;

/** A tracer over `@opentelemetry/api`'s global provider, when the package is installed; otherwise none. */
function openTelemetryTracer(): TracerAdapter | undefined {
  if (otel !== undefined) return otel ?? undefined;
  try {
    const api = createRequire(import.meta.url)('@opentelemetry/api') as OtelApi;
    const tracer = api.trace.getTracer('@mariachi/integrations');
    const kinds = { internal: api.SpanKind.INTERNAL, server: api.SpanKind.SERVER, client: api.SpanKind.CLIENT, producer: api.SpanKind.PRODUCER, consumer: api.SpanKind.CONSUMER };
    otel = {
      startSpan(name, attributes, options) {
        const s = tracer.startSpan(name, { attributes, kind: kinds[options?.kind ?? 'internal'] });
        return {
          setAttribute: (k, v) => void s.setAttribute(k, v),
          setStatus: (st, message) => void s.setStatus({ code: st === 'ok' ? api.SpanStatusCode.OK : api.SpanStatusCode.ERROR, message }),
          addEvent: (n, a) => void s.addEvent(n, a),
          end: () => s.end(),
        };
      },
      async withSpan(name, fn) {
        return tracer.startActiveSpan(name, async (s) => {
          try {
            return await fn({ setAttribute: (k, v) => void s.setAttribute(k, v), setStatus: () => {}, end: () => {} });
          } finally {
            s.end();
          }
        });
      },
    };
  } catch {
    otel = null;
  }
  return otel ?? undefined;
}
