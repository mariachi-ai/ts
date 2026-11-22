import { ProviderError } from '@mariachi/integrations';

/**
 * A Crisp call that failed, or a Crisp operation the app can't run as configured. Codes are `crisp/<reason>`;
 * `category` says what to do (only `rate-limited` and `unavailable` are worth retrying, and the client already did).
 */
export class CrispError extends ProviderError {
  override name = 'CrispError';
}

/** A setting the operation needs isn't set: fails before anything is sent. */
export function missingSetting(reason: string, message: string): CrispError {
  return new CrispError(`crisp/${reason}`, message, { category: 'invalid-request' });
}
