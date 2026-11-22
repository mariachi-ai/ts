import { ProviderError } from '@mariachi/integrations';

/**
 * A Google Analytics call that failed, or a setting it can't work with. Codes are `google-analytics/<reason>`;
 * `category` says what to do (only `rate-limited` and `unavailable` are worth retrying, and the client already did).
 */
export class GoogleAnalyticsError extends ProviderError {
  override name = 'GoogleAnalyticsError';
}

/** A setting or input the package can't work with: fails before anything is sent. */
export function settingError(reason: string, message: string): GoogleAnalyticsError {
  return new GoogleAnalyticsError(`google-analytics/${reason}`, message, { category: 'invalid-request' });
}
