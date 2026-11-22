import { IntegrationError } from '@mariachi/core';
import { type ProviderCall, type ProviderDeps, ProviderError, callProvider, categoryForStatus, parseRetryAfter } from '@mariachi/integrations';
import type { FetchImplementation } from 'jose';
import { provider } from './generated';

/** The tracer, metrics and retry settings for the issuer's calls, from the container. All optional. */
export interface OidcDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
  /**
   * The integration id the spans carry. Default `oidc`. An adapter that verifies through this one (`auth0`, `okta`)
   * passes its own, so its key fetches are `auth0 jwks.get`.
   */
  integration?: string;
}

/**
 * One GET to the issuer through `callProvider`: a status that isn't 2xx is a `ProviderError` of its category
 * (`rate-limited` and `unavailable` are retried), and the answer is returned unread. `init.signal` is the deadline
 * for all the attempts together: once it has passed, the call fails at once as `<integration>/timeout`.
 */
export function fetchThrough(operation: 'discovery.get' | 'jwks.get', url: string, init: RequestInit, deps: OidcDeps): Promise<Response> {
  const integration = deps.integration ?? provider.id;
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
    deps,
  );
}

/** `jose`'s `customFetch` for a remote key set: every key fetch is one `<integration> jwks.get` call. */
export function jwksFetch(deps: OidcDeps): FetchImplementation {
  return (url, options) => fetchThrough('jwks.get', url, options, deps);
}
