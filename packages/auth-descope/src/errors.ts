import { ProviderError } from '@mariachi/integrations';

/**
 * A Descope call that failed. Codes are `descope/<reason>`; `category` says what to do (only `rate-limited` and
 * `unavailable` are worth retrying, and the client already did). `DescopeIdentityClient`'s methods turn it into
 * the auth port's `AuthError` codes and keep it as `cause`.
 */
export class DescopeError extends ProviderError {
  override name = 'DescopeError';
}
