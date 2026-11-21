import { ProviderError } from '@mariachi/integrations';

/**
 * A Mailchimp call that failed. Codes are `mailchimp/<reason>` (`mailchimp/member-exists`,
 * `mailchimp/forgotten-email`); `category` says what to do (only `rate-limited` and `unavailable` are worth
 * retrying, and the client already did). `providerCode` is Mailchimp's error title (`Invalid Resource`); its
 * `detail` is never kept, since it can echo the email address.
 */
export class MailchimpError extends ProviderError {
  override name = 'MailchimpError';
}
