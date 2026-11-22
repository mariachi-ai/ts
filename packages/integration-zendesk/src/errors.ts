import { ProviderError } from '@mariachi/integrations';

/**
 * A Zendesk call that failed, or a setting it can't work with. Codes are `zendesk/<reason>`; `category` says what to
 * do (only `rate-limited` and `unavailable` are worth retrying, and the client already did).
 */
export class ZendeskError extends ProviderError {
  override name = 'ZendeskError';
}

/** A setting or input the package can't work with: fails before anything is sent. */
export function settingError(reason: string, message: string): ZendeskError {
  return new ZendeskError(`zendesk/${reason}`, message, { category: 'invalid-request' });
}
