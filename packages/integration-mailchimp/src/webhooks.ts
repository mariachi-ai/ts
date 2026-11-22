import { type HttpResponse, type IncomingRequest, httpResponse } from '@mariachi/server';
import { type Secrets, StripeWebhookAuth } from '@mariachi/webhooks';
import { z } from 'zod';
import { provider } from './generated';

/**
 * Mailchimp's scheme is Stripe's with its own header: `X-Mailchimp-Signature: t=<seconds>,v1=<hex>`, the
 * HMAC-SHA256 of `"<t>.<raw body>"` keyed with the webhook's signing secret, refused more than five minutes from
 * now. On top, Mailchimp checks the URL with a GET when the webhook is created; that check is answered 200 here
 * and never reaches the route's handler.
 */
export class MailchimpWebhookAuth extends StripeWebhookAuth {
  constructor(secret: Secrets, options: { toleranceSeconds?: number } = {}) {
    super({ provider: provider.id, secret, header: 'x-mailchimp-signature', toleranceSeconds: options.toleranceSeconds });
  }

  handshake(req: IncomingRequest): HttpResponse | undefined {
    return req.method === 'GET' ? httpResponse(200, { ok: true }) : undefined;
  }
}

/**
 * The authenticator for a `WebhookController` that receives Mailchimp. Register the route for both POST (the
 * deliveries) and GET (Mailchimp's check of the URL). Pass two secrets while moving to a new webhook. A delivery
 * that doesn't verify is answered 401.
 *
 * ```ts
 * class MailchimpWebhooks extends WebhookController {
 *   readonly prefix = 'mailchimp';
 *   readonly auth = mailchimpWebhookAuth(config.mailchimp.webhookSecret);
 *   init() {
 *     const route = { mode: 'queue', jobName: 'mailchimp-event', eventType: mailchimpEventType } as const;
 *     const read = async (_ctx: unknown, body: unknown) => MailchimpWebhookBody.parse(body);
 *     this.post('events', route, read);
 *     this.get('events', route, read);    // Mailchimp's URL check, answered by the authenticator
 *   }
 * }
 * ```
 */
export function mailchimpWebhookAuth(secret: Secrets, options: { toleranceSeconds?: number } = {}): MailchimpWebhookAuth {
  return new MailchimpWebhookAuth(secret, options);
}

/**
 * Mailchimp's form keys, nested: `{ 'data[merges][FNAME]': 'Ada' }` becomes `{ data: { merges: { FNAME: 'Ada' } } }`.
 * A body that's already nested (JSON) is returned as it is.
 */
export function expandFormBody(body: unknown): unknown {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return body;
  const entries = Object.entries(body as Record<string, unknown>);
  if (!entries.some(([key]) => key.includes('['))) return body;
  const out: Record<string, unknown> = {};
  for (const [key, value] of entries) {
    const path = key.match(/^[^[\]]+|(?<=\[)[^[\]]*(?=\])/g) ?? [key];
    let node = out;
    for (const [index, part] of path.entries()) {
      if (part === '__proto__' || part === 'constructor' || part === 'prototype') break;
      if (index === path.length - 1) {
        node[part] = value;
        break;
      }
      const next = node[part];
      if (typeof next !== 'object' || next === null) node[part] = {};
      node = node[part] as Record<string, unknown>;
    }
  }
  return out;
}

const Merges = z.record(z.unknown());
const base = { fired_at: z.string() };

export const SubscribeEvent = z
  .object({
    ...base,
    type: z.literal('subscribe'),
    data: z.object({ id: z.string(), list_id: z.string(), email: z.string(), email_type: z.string().optional(), ip_opt: z.string().optional(), ip_signup: z.string().optional(), merges: Merges.optional() }).passthrough(),
  })
  .passthrough();

export const UnsubscribeEvent = z
  .object({
    ...base,
    type: z.literal('unsubscribe'),
    data: z
      .object({
        id: z.string(),
        list_id: z.string(),
        email: z.string(),
        /** `unsub` in Mailchimp's example. */
        action: z.string().optional(),
        reason: z.string().optional(),
        campaign_id: z.string().optional(),
        merges: Merges.optional(),
      })
      .passthrough(),
  })
  .passthrough();

export const ProfileEvent = z
  .object({ ...base, type: z.literal('profile'), data: z.object({ id: z.string().optional(), list_id: z.string(), email: z.string(), merges: Merges.optional() }).passthrough() })
  .passthrough();

export const UpemailEvent = z
  .object({ ...base, type: z.literal('upemail'), data: z.object({ list_id: z.string(), new_id: z.string().optional(), new_email: z.string(), old_email: z.string() }).passthrough() })
  .passthrough();

export const CleanedEvent = z
  .object({ ...base, type: z.literal('cleaned'), data: z.object({ list_id: z.string(), email: z.string(), reason: z.string().optional(), campaign_id: z.string().optional() }).passthrough() })
  .passthrough();

export const CampaignEvent = z
  .object({ ...base, type: z.literal('campaign'), data: z.object({ id: z.string(), list_id: z.string(), subject: z.string().optional(), status: z.string().optional() }).passthrough() })
  .passthrough();

/**
 * What Mailchimp posts, one of six events, read from its form encoding (`type=unsubscribe&data[email]=…`) or from
 * JSON. `type` tells them apart. Mailchimp retries a delivery that fails or takes over 10 seconds, for up to 75
 * minutes, so handle each one so that doing it twice is harmless: set the contact's state, don't toggle it.
 */
export const MailchimpWebhookBody = z.preprocess(expandFormBody, z.discriminatedUnion('type', [SubscribeEvent, UnsubscribeEvent, ProfileEvent, UpemailEvent, CleanedEvent, CampaignEvent]));
export type MailchimpWebhookBody = z.infer<typeof MailchimpWebhookBody>;

/** The delivery's event type, for its span: `eventType: mailchimpEventType` on the route. */
export function mailchimpEventType(payload: unknown): string | undefined {
  const type = (payload as { type?: unknown } | null)?.type;
  return typeof type === 'string' ? type : undefined;
}
