import { ProviderError } from '@mariachi/integrations';

/**
 * A call to Firebase that failed. Codes are `firebase/<reason>` (`firebase/email-exists`,
 * `firebase/rate-limited`), with Firebase's own code (`EMAIL_EXISTS`) in `providerCode` and never its
 * message, which can echo the input. `FirebaseIdentityClient` turns these into the auth port's
 * `AuthError` codes; this class is what's underneath, in `metadata`.
 */
export class FirebaseError extends ProviderError {
  override name = 'FirebaseError';
}
