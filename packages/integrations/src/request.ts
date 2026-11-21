import type { Context } from '@mariachi/core';
import type { z } from 'zod';
import { type ProviderCall, type ProviderDeps, callProvider } from './call-provider';
import { type ErrorCategory, ProviderError, type ProviderErrorOptions, categoryForStatus, parseRetryAfter } from './provider-error';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ProviderRequest {
  method: HttpMethod;
  /** The base URL and path: `https://api.hubapi.com/crm/v3/objects/contacts`. It's never recorded. */
  url: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  /** Sent as JSON. */
  json?: unknown;
  /** Sent as `application/x-www-form-urlencoded`. */
  form?: Record<string, string | number | boolean | undefined>;
  /**
   * Sent on every attempt of this call, so the provider does it once however often it's retried. Give it
   * wherever the provider accepts one: a create, a charge, a send.
   */
  idempotencyKey?: { header: string; value: string };
}

/** How a failed answer becomes an error: the reason in its code, and optionally a category and the provider's code. */
export interface FailureInfo {
  reason?: string;
  category?: ErrorCategory;
  providerCode?: string;
  message?: string;
}

export interface ProviderRequestOptions<T> {
  /**
   * Checks the answer at the boundary: a provider that changed its response fails here, not deep in the app.
   * Its input type is the provider's raw JSON, so a schema with defaults or transforms fits.
   */
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  /** Reads the provider's error body. Without it, the HTTP status decides the category and reason. */
  failure?: (status: number, body: unknown) => FailureInfo | undefined;
  /**
   * For a provider that answers 2xx with a failure inside (a batch or composite call, a GraphQL `errors` array):
   * return what failed, and the call fails as if the provider had answered with an error, before `schema` runs.
   * `category` is required here, since the status says nothing.
   */
  failureInBody?: (body: unknown) => (FailureInfo & { category: ErrorCategory }) | undefined;
  /** The integration's error class, so callers can `instanceof HubSpotError`. */
  error?: new (code: string, message: string, options: ProviderErrorOptions) => ProviderError;
  deps?: ProviderDeps & { fetch?: typeof fetch };
}

/**
 * One HTTP call to a provider, through `callProvider`: the span, the metrics and the retries, the answer checked
 * against `schema`, and a failed answer turned into the integration's error with its category. This is how an
 * integration's operations call their provider; reach for `callProvider` itself only for a provider that isn't
 * HTTP and JSON.
 */
export async function providerRequest<T>(
  ctx: Context | null,
  call: Omit<ProviderCall, 'method'>,
  request: ProviderRequest,
  options: ProviderRequestOptions<T>,
): Promise<T> {
  const doFetch = options.deps?.fetch ?? fetch;
  const ErrorClass = options.error ?? ProviderError;
  return callProvider(
    ctx,
    { ...call, method: request.method },
    async (attempt) => {
      const response = await doFetch(urlWith(request.url, request.query), init(request));
      attempt.setStatusCode(response.status);
      const body = await readBody(response);
      if (!response.ok) {
        const info = options.failure?.(response.status, body) ?? {};
        const category = info.category ?? categoryForStatus(response.status);
        const reason = info.reason ?? category;
        throw new ErrorClass(`${call.integration}/${reason}`, info.message ?? `${call.integration} ${call.operation} failed (${response.status})`, {
          category,
          providerCode: info.providerCode,
          status: response.status,
          retryAfterMs: parseRetryAfter(response.headers.get('retry-after')),
        });
      }
      const inBody = options.failureInBody?.(body);
      if (inBody) {
        throw new ErrorClass(`${call.integration}/${inBody.reason ?? inBody.category}`, inBody.message ?? `${call.integration} ${call.operation} failed`, {
          category: inBody.category,
          providerCode: inBody.providerCode,
          status: response.status,
        });
      }
      const parsed = options.schema.safeParse(body);
      if (!parsed.success) {
        throw new ErrorClass(`${call.integration}/invalid-response`, `${call.integration} ${call.operation} answered in an unexpected shape`, {
          category: 'unavailable',
          status: response.status,
          details: { issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), code: i.code })) },
        });
      }
      return parsed.data;
    },
    { ...options.deps, retry: { attempts: 3, ...options.deps?.retry } },
  );
}

function urlWith(url: string, query: ProviderRequest['query']): string {
  if (!query) return url;
  const u = new URL(url);
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  return u.toString();
}

function init(request: ProviderRequest): RequestInit {
  const headers: Record<string, string> = { accept: 'application/json', ...request.headers };
  if (request.idempotencyKey) headers[request.idempotencyKey.header] = request.idempotencyKey.value;
  let body: string | undefined;
  if (request.json !== undefined) {
    headers['content-type'] ??= 'application/json';
    body = JSON.stringify(request.json);
  } else if (request.form) {
    headers['content-type'] ??= 'application/x-www-form-urlencoded';
    const form = new URLSearchParams();
    for (const [k, v] of Object.entries(request.form)) if (v !== undefined) form.set(k, String(v));
    body = form.toString();
  }
  return { method: request.method, headers, body };
}

/** JSON when it parses, else the text, else null: a provider's error page shouldn't hide its status. */
async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
