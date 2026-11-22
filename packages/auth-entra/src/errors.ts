import { ProviderError } from '@mariachi/integrations';

/**
 * A call to Entra or Microsoft Graph that failed. Codes are `entra/<reason>` (`entra/permission-denied`,
 * `entra/rate-limited`); `category` says what to do (only `rate-limited` and `unavailable` are worth retrying,
 * and the client already did). `EntraIdentityClient`'s port methods turn it into the auth port's `AuthError`
 * codes; the subscription helper throws it as it is.
 */
export class EntraError extends ProviderError {
  override name = 'EntraError';
}
