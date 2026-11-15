import { NotificationError } from '@mariachi/core';

/** A provider refused the message for good: a bad key, a suppressed address, an invalid request. Not retried. */
export const NOTIFICATION_REJECTED = 'notifications/rejected';
/** A provider or the network failed in a way that may pass: a timeout, a rate limit, a 5xx. Retried. */
export const NOTIFICATION_PROVIDER_FAILED = 'notifications/provider-failed';

export interface ProviderFailureDetail {
  /** HTTP status, for an HTTP API. */
  status?: number;
  /** SMTP reply code. */
  responseCode?: number;
  /** Set it to say outright, when the provider's own error says more than a status does. */
  retryable?: boolean;
  [key: string]: unknown;
}

/**
 * Whether sending again could work. HTTP: 408, 429 and 5xx. SMTP: 4xx replies. A failure with no
 * status at all (the connection dropped, DNS failed) is retried.
 */
export function isRetryable(detail: ProviderFailureDetail): boolean {
  if (detail.retryable !== undefined) return detail.retryable;
  if (detail.status !== undefined) return detail.status === 408 || detail.status === 429 || detail.status >= 500;
  if (detail.responseCode !== undefined) return detail.responseCode < 500;
  return true;
}

/** The error an email adapter throws when its provider fails: `notifications/provider-failed` or `notifications/rejected`, with `metadata.retryable`. */
export function providerFailure(provider: string, message: string, detail: ProviderFailureDetail = {}): NotificationError {
  const retryable = isRetryable(detail);
  return new NotificationError(retryable ? NOTIFICATION_PROVIDER_FAILED : NOTIFICATION_REJECTED, message, { ...detail, provider, retryable });
}
