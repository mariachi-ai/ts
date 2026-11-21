import { ProviderError } from '@mariachi/integrations';

/**
 * An Intercom call that failed, or a setting it can't work with. Codes are `intercom/<reason>`; `category` says what
 * to do (only `rate-limited` and `unavailable` are worth retrying, and the client already did).
 */
export class IntercomError extends ProviderError {
  override name = 'IntercomError';
}

/** A setting or input the package can't work with: fails before anything is sent. */
export function settingError(reason: string, message: string): IntercomError {
  return new IntercomError(`intercom/${reason}`, message, { category: 'invalid-request' });
}
