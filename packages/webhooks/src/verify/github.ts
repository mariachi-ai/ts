import { headerValue, type VerifiedWebhook, type WebhookHeaders } from './common';
import { verifyHmacSignature } from './hmac';

export const GITHUB_SIGNATURE_HEADER = 'x-hub-signature-256';
export const GITHUB_DELIVERY_HEADER = 'x-github-delivery';
export const GITHUB_EVENT_HEADER = 'x-github-event';

export interface VerifiedGitHubWebhook extends VerifiedWebhook {
  /** `X-GitHub-Event`: `push`, `pull_request`, ... */
  event?: string;
}

/**
 * GitHub webhooks: `X-Hub-Signature-256: sha256=<hex HMAC-SHA256 of the raw body>`. The delivery id
 * (`X-GitHub-Delivery`) is the event id. GitHub signs no timestamp, so dedup is what stops a replay.
 */
export function verifyGitHubWebhook(rawBody: string | Buffer, headers: WebhookHeaders, secret: string | string[]): VerifiedGitHubWebhook {
  verifyHmacSignature(rawBody, headerValue(headers, GITHUB_SIGNATURE_HEADER), secret, { prefix: 'sha256=', provider: 'GitHub' });
  return { eventId: headerValue(headers, GITHUB_DELIVERY_HEADER), event: headerValue(headers, GITHUB_EVENT_HEADER) };
}
