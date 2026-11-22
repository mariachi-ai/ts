import { ProviderError } from '@mariachi/integrations';

/**
 * A HubSpot call that failed. Codes are `hubspot/<reason>`: `hubspot/already-exists` when a contact with the email
 * is there, `hubspot/invalid-properties` for a property HubSpot refused, else the category (`hubspot/not-found`).
 * `category` says what to do (only `rate-limited` and `unavailable` are worth retrying, and the client already
 * did); `providerCode` is HubSpot's own category, such as `VALIDATION_ERROR`.
 */
export class HubSpotError extends ProviderError {
  override name = 'HubSpotError';
}
