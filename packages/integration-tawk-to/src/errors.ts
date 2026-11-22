import { ProviderError } from '@mariachi/integrations';

/**
 * A Tawk.to failure. Codes are `tawk-to/<reason>`: `tawk-to/not-supported` for what Tawk.to only does in the browser
 * (contacts and events), `tawk-to/no-api-key` for a signed identity without the JavaScript API key, and
 * `tawk-to/invalid-setting` for a property or widget ID that can't be right.
 */
export class TawkToError extends ProviderError {
  override name = 'TawkToError';
}

/** What Tawk.to can't do from a server: it publishes no server API for contacts or events. */
export function notSupported(what: string, instead: string): TawkToError {
  return new TawkToError('tawk-to/not-supported', `Tawk.to has no server API for ${what}: ${instead}`, { category: 'invalid-request' });
}
