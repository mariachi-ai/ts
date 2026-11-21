import { ProviderError } from '@mariachi/integrations';

/**
 * A Typeform call that failed. Codes are `typeform/<reason>`; `category` says what to do (only `rate-limited`
 * and `unavailable` are worth retrying, and the client already did).
 */
export class TypeformError extends ProviderError {
  override name = 'TypeformError';
}
