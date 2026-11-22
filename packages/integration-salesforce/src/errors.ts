import { ProviderError } from '@mariachi/integrations';

/**
 * A Salesforce call that failed. Codes are `salesforce/<reason>` (`salesforce/duplicates-detected`); `category` says
 * what to do (only `rate-limited` and `unavailable` are worth retrying, and the client already did), and
 * `providerCode` is Salesforce's `errorCode` (`DUPLICATES_DETECTED`). Salesforce's message is never kept: it can
 * echo the record.
 */
export class SalesforceError extends ProviderError {
  override name = 'SalesforceError';
}
