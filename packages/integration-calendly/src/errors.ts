import { ProviderError } from '@mariachi/integrations';

/**
 * A Calendly call that failed. Codes are `calendly/<reason>`; `category` says what to do (only `rate-limited` and
 * `unavailable` are worth retrying, and the client already did). `providerCode` is Calendly's error `title`
 * (`Permission Denied`, `Insufficient scope`, `Already Exists`); its `message` isn't kept.
 */
export class CalendlyError extends ProviderError {
  override name = 'CalendlyError';
}
