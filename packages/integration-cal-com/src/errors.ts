import { ProviderError } from '@mariachi/integrations';

/**
 * A Cal.com call that failed. Codes are `cal-com/<reason>`; `category` says what to do (only `rate-limited` and
 * `unavailable` are worth retrying, and the client already did). Cal.com documents no error codes of its own, so the
 * HTTP status decides the category, and Cal.com's message is never kept (it can echo the input).
 */
export class CalComError extends ProviderError {
  override name = 'CalComError';
}
