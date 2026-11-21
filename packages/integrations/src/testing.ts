/**
 * `@mariachi/integrations/testing`: what an integration's own tests use. A scripted `fetch`, so no test ever calls
 * a provider, and the check that a call's spans carry only the attributes the plan allows.
 */
import { IntegrationError } from '@mariachi/core';
import { PROVIDER_SPAN_ATTRIBUTES } from './call-provider';

// `mariachi.integration.event` is the inbound webhook span's (WebhookServer's)
const ALLOWED = new Set<string>([...PROVIDER_SPAN_ATTRIBUTES, 'mariachi.integration.event']);

/** A span as `@mariachi/testing`'s `TestTracer` records it. */
export interface SpanLike {
  name: string;
  attributes: Record<string, string | number | boolean>;
  events?: Array<{ name: string; attributes: Record<string, string | number | boolean> }>;
}

/**
 * Fails when a span or one of its events carries an attribute outside the plan's table, or when a value looks
 * like what must never be recorded: an email address, a URL, or a long id-like token.
 */
export function assertProviderSpans(spans: SpanLike[]): void {
  for (const span of spans) {
    for (const [key, value] of [...Object.entries(span.attributes), ...(span.events ?? []).flatMap((e) => Object.entries(e.attributes))]) {
      if (!ALLOWED.has(key)) throw new IntegrationError('integrations/span-attribute', `span "${span.name}" records "${key}", which isn't one of the attributes a provider call may carry`);
      if (typeof value === 'string' && looksSensitive(key, value)) throw new IntegrationError('integrations/span-attribute', `span "${span.name}" records "${key}" = a value that looks like data, not a name`);
    }
  }
}

function looksSensitive(key: string, value: string): boolean {
  if (key === 'mariachi.integration.connection' || key === 'mariachi.tenant_id') return false;
  return /@/.test(value) || /^https?:\/\//.test(value) || (key !== 'server.address' && /[?&=]/.test(value));
}

export interface ScriptedResponse {
  status?: number;
  json?: unknown;
  text?: string;
  headers?: Record<string, string>;
}

export interface RecordedRequest {
  method: string;
  url: URL;
  headers: Record<string, string>;
  body: string | undefined;
  /** The body parsed as JSON, when it is JSON. */
  json: unknown;
}

/**
 * A `fetch` that answers from a script, in order, and records each request. A request past the end of the
 * script fails the test: a call the test didn't expect.
 */
export function scriptedFetch(...responses: ScriptedResponse[]): typeof fetch & { requests: RecordedRequest[] } {
  const requests: RecordedRequest[] = [];
  const queue = [...responses];
  const fn = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    const headers = Object.fromEntries(Object.entries((init?.headers as Record<string, string>) ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
    const body = typeof init?.body === 'string' ? init.body : undefined;
    let json: unknown;
    try {
      json = body ? JSON.parse(body) : undefined;
    } catch {
      json = undefined;
    }
    requests.push({ method: init?.method ?? 'GET', url, headers, body, json });
    const next = queue.shift();
    if (!next) throw new IntegrationError('integrations/unexpected-request', `unexpected request: ${init?.method ?? 'GET'} ${url.pathname}`);
    const text = next.json !== undefined ? JSON.stringify(next.json) : (next.text ?? '');
    return new Response(next.status === 204 ? null : text, {
      status: next.status ?? 200,
      headers: { ...(next.json !== undefined ? { 'content-type': 'application/json' } : {}), ...next.headers },
    });
  }) as typeof fetch & { requests: RecordedRequest[] };
  fn.requests = requests;
  return fn;
}
