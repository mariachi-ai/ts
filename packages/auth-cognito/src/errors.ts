import { ProviderError } from '@mariachi/integrations';

/**
 * A Cognito call that failed, as its span records it. Codes are `cognito/<reason>`; `category` says what to do (only
 * `rate-limited` and `unavailable` are worth retrying, and the call already was). The auth port's methods turn it
 * into the port's `AuthError`, keeping the category and Cognito's code in its metadata.
 */
export class CognitoError extends ProviderError {
  override name = 'CognitoError';
}
