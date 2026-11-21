import { ProviderError } from '@mariachi/integrations';

/**
 * A Stytch call that failed. Codes are `stytch/<reason>` (`stytch/duplicate-email`); `providerCode` is Stytch's
 * `error_type`, never its message (it can echo input). `category` says what to do: only `rate-limited` and
 * `unavailable` are worth retrying, and the client already did. `StytchIdentityClient` turns these into the auth
 * port's `AuthError`s.
 */
export class StytchError extends ProviderError {
  override name = 'StytchError';
}
