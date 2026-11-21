import { ProviderError } from '@mariachi/integrations';

/**
 * A RevenueCat call that failed. Codes are `revenuecat/<reason>` (`revenuecat/not-found`,
 * `revenuecat/invalid-parameter`); `category` says what to do (only `rate-limited` and `unavailable` are worth
 * retrying, and the client already did), and `providerCode` is RevenueCat's error `type`.
 */
export class RevenueCatError extends ProviderError {
  override name = 'RevenueCatError';
}
