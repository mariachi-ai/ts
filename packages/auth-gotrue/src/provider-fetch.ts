import { IntegrationError } from '@mariachi/core';
import { type ProviderCall, type ProviderDeps, ProviderError, callProvider, categoryForStatus, parseRetryAfter } from '@mariachi/integrations';
import type { FetchImplementation } from 'jose';
import { type GotrueOperation, provider } from './generated';

/** The tracer, metrics and retry settings for the calls to GoTrue, from the container. All optional. */
export interface GoTrueDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

/**
 * One GET to GoTrue through `callProvider`: a status that isn't 2xx is a `ProviderError` of its category
 * (`rate-limited` and `unavailable` are retried), and the answer is returned unread. `init.signal` is the deadline
 * for all the attempts together, the waits between them included: once it has passed, the call fails at once
 * (`<integration>/timeout` during a fetch, the last failure during a wait).
 */
export function fetchThrough(operation: GotrueOperation, url: string, init: RequestInit, deps: GoTrueDeps): Promise<Response> {
  const integration = provider.id;
  const request = deps.fetch ?? fetch;
  const call: ProviderCall = { integration, operation, category: provider.category, server: new URL(url).hostname, method: 'GET' };
  return callProvider(
    null,
    call,
    async (attempt) => {
      let res: Response;
      try {
        res = await request(url, { ...init, method: 'GET' });
      } catch (error) {
        // Another attempt would be refused at once by the same signal
        if (init.signal?.aborted) throw new IntegrationError(`${integration}/timeout`, `${integration} ${operation} took too long`);
        throw error;
      }
      attempt.setStatusCode(res.status);
      if (!res.ok) {
        const category = categoryForStatus(res.status);
        await res.body?.cancel().catch(() => undefined);
        throw new ProviderError(`${integration}/${category}`, `${integration} ${operation} answered ${res.status}`, {
          category,
          status: res.status,
          retryAfterMs: parseRetryAfter(res.headers.get('retry-after')),
        });
      }
      return res;
    },
    // The deadline bounds the waits between attempts too: no retry sleeps past it
    { ...deps, signal: init.signal ?? deps.signal },
  );
}

/** `jose`'s `customFetch` for GoTrue's key set: every key fetch is one `gotrue jwks.get` call. */
export function jwksFetch(deps: GoTrueDeps): FetchImplementation {
  return (url, options) => fetchThrough('jwks.get', url, options, deps);
}
