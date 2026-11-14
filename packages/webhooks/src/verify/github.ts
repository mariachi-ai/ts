import { headerValue, type VerifiedWebhook, type WebhookHeaders } from './common';
import { verifyHmacSignature } from './hmac';

export const GITHUB_SIGNATURE_HEADER = 'x-hub-signature-256';
export const GITHUB_DELIVERY_HEADER = 'x-github-delivery';
export const GITHUB_EVENT_HEADER = 'x-github-event';

export interface VerifiedGitHubWebhook extends VerifiedWebhook {
  /** `X-GitHub-Delivery`. Not signed: for logs and support, never for dedup. */
  deliveryId?: string;
  /** `X-GitHub-Event`: `push`, `pull_request`, ... Not signed either; the body says what happened. */
  event?: string;
}

/**
 * GitHub webhooks: `X-Hub-Signature-256: sha256=<hex HMAC-SHA256 of the raw body>`. GitHub signs
 * only the body: no timestamp, and not the `X-GitHub-Delivery` id. So `eventId` is a digest of the
 * signature, which stays the same when a captured delivery is resent under a new delivery id, and
 * a dedup store is what stops a replay.
 */
export function verifyGitHubWebhook(rawBody: string | Buffer, headers: WebhookHeaders, secret: string | string[]): VerifiedGitHubWebhook {
  const { eventId } = verifyHmacSignature(rawBody, headerValue(headers, GITHUB_SIGNATURE_HEADER), secret, { prefix: 'sha256=', provider: 'GitHub' });
  return { eventId, deliveryId: headerValue(headers, GITHUB_DELIVERY_HEADER), event: headerValue(headers, GITHUB_EVENT_HEADER) };
}
