import { AuthError } from '@mariachi/core';
import { ProviderError } from '@mariachi/integrations';

/**
 * An Okta call that failed. Codes are `okta/<reason>` (`okta/invalid-grant`, `okta/rate-limited`); `category` says
 * what to do (only `rate-limited` and `unavailable` are worth retrying, and the client already did), and
 * `providerCode` is Okta's own (`E0000007`, `invalid_grant`). Okta's message is never kept: it can echo input.
 */
export class OktaError extends ProviderError {
  override name = 'OktaError';
}

/**
 * The auth port's error for a failed Okta call (`IdentityClient` promises `AuthError`s): `auth/rate-limited`,
 * `auth/invalid-grant` for a code, verifier or refresh token Okta refused, else `auth/identity-provider`. The
 * `OktaError` is its `cause`, and its category and Okta's code are in the metadata. An Okta that can't be reached
 * is a plain `ProviderError` (`okta/unavailable`), so the base class is tested; anything else that isn't already an
 * `AuthError` becomes `auth/identity-provider` too, so the port only ever rejects with `AuthError`s.
 */
export function toAuthError(error: unknown, refused: 'auth/invalid-grant' | 'auth/identity-provider' = 'auth/identity-provider'): unknown {
  if (error instanceof AuthError) return error;
  if (!(error instanceof ProviderError)) {
    const auth = new AuthError('auth/identity-provider', 'Okta request failed');
    Object.defineProperty(auth, 'cause', { value: error, enumerable: false });
    return auth;
  }
  const meta = { category: error.category, providerCode: error.providerCode, status: error.status };
  let auth: AuthError;
  if (error.category === 'rate-limited') auth = new AuthError('auth/rate-limited', 'Okta rate limit reached', meta);
  else if (error.code === 'okta/dpop-required') {
    auth = new AuthError('auth/invalid-config', 'Okta asked for DPoP: turn off "Require DPoP" on the service app (DPoP is not supported yet)', meta);
  } else if (refused === 'auth/invalid-grant' && (error.category === 'invalid-request' || error.code === 'okta/invalid-grant')) {
    auth = new AuthError('auth/invalid-grant', `Okta refused the grant (${error.providerCode ?? error.status})`, meta);
  } else auth = new AuthError('auth/identity-provider', `Okta request failed (${error.code})`, meta);
  Object.defineProperty(auth, 'cause', { value: error, enumerable: false });
  return auth;
}
