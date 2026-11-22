import { ProviderError } from '@mariachi/integrations';

/**
 * A Zoom call that failed. Codes are `zoom/<reason>` (`zoom/meeting-not-found`, `zoom/daily-limit`); `category`
 * says what to do (only `rate-limited` and `unavailable` are worth retrying, and the client already did). Zoom's
 * own numeric code is in `providerCode`.
 */
export class ZoomError extends ProviderError {
  override name = 'ZoomError';
}
