import { ProviderError } from '@mariachi/integrations';

/**
 * A Paddle call that failed, as `callProvider` sees it. Codes are `paddle/<reason>` (`paddle/customer-exists`,
 * `paddle/rate-limited`), with Paddle's own code in `providerCode` and never its `detail`, which can echo the
 * input. The billing adapter turns it into the port's `BillingError`, so an app using `DefaultBilling` rarely
 * meets it; code that calls `createPaddle` directly does.
 */
export class PaddleError extends ProviderError {
  override name = 'PaddleError';
}
