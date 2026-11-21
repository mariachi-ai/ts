import { ProviderError } from '@mariachi/integrations';

/**
 * A Pipedrive call that failed. Codes are `pipedrive/<reason>`; `category` says what to do (only `rate-limited`
 * and `unavailable` are worth retrying, and the client already did).
 */
export class PipedriveError extends ProviderError {
  override name = 'PipedriveError';
}
