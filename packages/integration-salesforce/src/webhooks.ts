import { createHash, timingSafeEqual } from 'node:crypto';
import { AuthError } from '@mariachi/core';
import { type Secrets, VerifiedWebhookAuth, type VerifiedWebhookAuthOptions, type Verified, type WebhookHeaders, headerValue } from '@mariachi/webhooks';
import { z } from 'zod';
import { provider, webhookSignature } from './generated';

/** The header a flow's HTTP callout sends the shared secret in. */
export const SALESFORCE_WEBHOOK_SECRET_HEADER = webhookSignature.header.toLowerCase();

/**
 * Checks a call from a Salesforce flow by its shared secret. Salesforce has no signed webhooks: a record-triggered
 * flow posts JSON with an HTTP callout, and the callout's External Credential adds `X-Webhook-Secret` with the
 * secret. The secret is compared in constant time; pass two while rotating. It doesn't cover the body, so the
 * endpoint must be HTTPS. A delivery is deduplicated on a digest of its raw body, so put the record's id and the
 * time it changed in the body (`SalesforceFlowEvent`): a retried callout then dedupes, and two changes don't.
 */
export class SalesforceFlowWebhookAuth extends VerifiedWebhookAuth {
  constructor(options: VerifiedWebhookAuthOptions) {
    super(options, provider.id);
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Verified {
    const sent = headerValue(headers, SALESFORCE_WEBHOOK_SECRET_HEADER);
    if (!sent) throw new AuthError('webhooks/invalid-signature', `${this.provider} webhook: no ${webhookSignature.header} header`);
    // Digests have one length, so the comparison takes the same time whatever was sent
    const digest = sha256(sent);
    const matches = (Array.isArray(secret) ? secret : [secret]).filter((s) => s.trim()).some((s) => timingSafeEqual(sha256(s), digest));
    if (!matches) throw new AuthError('webhooks/invalid-signature', `${this.provider} webhook: the secret doesn't match`);
    return { eventId: `body:${createHash('sha256').update(rawBody).digest('hex')}` };
  }
}

/**
 * The authenticator for a `WebhookController` that receives a Salesforce flow's callouts.
 *
 * ```ts
 * class SalesforceWebhooks extends WebhookController {
 *   readonly prefix = 'salesforce';
 *   readonly auth = salesforceFlowWebhookAuth(config.salesforce.webhookSecret);
 *   init() {
 *     this.post('records', { mode: 'queue', jobName: 'salesforce-record', eventType: salesforceEventType },
 *       async (_ctx, body) => SalesforceFlowEvent.parse(body));
 *   }
 * }
 * ```
 */
export function salesforceFlowWebhookAuth(secret: string | string[]): SalesforceFlowWebhookAuth {
  return new SalesforceFlowWebhookAuth({ secret });
}

/**
 * The body a flow should post: the flow builds it, so this is the shape to build. `event` names the change
 * (`contact.updated`), `recordId` and `changedAt` (the record's `LastModifiedDate`) make it unique, and `fields`
 * carries what the app needs. More keys pass through.
 */
export const SalesforceFlowEvent = z
  .object({
    event: z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/, 'lowercase and dotted, such as contact.updated'),
    sobject: z.string().min(1),
    recordId: z.string().regex(/^[A-Za-z0-9]{15}(?:[A-Za-z0-9]{3})?$/),
    changedAt: z.string().min(1),
    fields: z.record(z.unknown()).optional(),
  })
  .passthrough();
export type SalesforceFlowEvent = z.infer<typeof SalesforceFlowEvent>;

/** The delivery's event type, for its span: `eventType: salesforceEventType` on the route. */
export function salesforceEventType(payload: unknown): string | undefined {
  const event = (payload as { event?: unknown } | null)?.event;
  return typeof event === 'string' ? event : undefined;
}

function sha256(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}
