import { ProviderError } from '@mariachi/integrations';

/**
 * A Kinde call that failed. Codes are `kinde/<reason>`; `category` says what to do (only `rate-limited` and
 * `unavailable` are worth retrying, and the client already did). `KindeIdentityClient`'s methods turn it into the
 * auth port's `AuthError` codes and keep it as `cause`.
 */
export class KindeError extends ProviderError {
  override name = 'KindeError';
}
