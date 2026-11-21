import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { AuthError, ConfigError } from '@mariachi/core';
import type { IncomingRequest, RequestContext } from '@mariachi/server';
import { type Secrets, type Verified, VerifiedWebhookAuth, type WebhookHeaders, type WebhookIdentity, headerValue, signatureDigest } from '@mariachi/webhooks';
import { z } from 'zod';
import { provider } from './generated';
import { WebhookEvent } from './schemas';

const SIGNATURE = 'x-hubspot-signature-v3';
const TIMESTAMP = 'x-hubspot-request-timestamp';
const FIVE_MINUTES_MS = 5 * 60_000;

export interface HubSpotWebhookOptions {
  /**
   * The public address HubSpot calls, up to the app's own path: `https://app.example.com`, or
   * `https://example.com/api` when a proxy strips `/api`. HubSpot signs the full URL it called, so behind a proxy
   * or a load balancer the app must know it. Without it, the URL is rebuilt from the `Host` header over https.
   */
  publicBaseUrl?: string;
  /** For tests: the current time in Unix milliseconds. */
  now?: () => number;
}

/**
 * The authenticator for a `WebhookController` that receives HubSpot: `X-HubSpot-Signature-v3` is the base64
 * HMAC-SHA256, keyed with the app's client secret, of the method, the full URL HubSpot called, the raw body and
 * `X-HubSpot-Request-Timestamp`; a delivery more than five minutes old is refused. Pass two secrets while rotating.
 * A delivery that doesn't match is answered 401.
 *
 * ```ts
 * class HubSpotWebhooks extends WebhookController {
 *   readonly prefix = 'hubspot';
 *   readonly auth = hubspotWebhookAuth(config.hubspot.clientSecret, { publicBaseUrl: 'https://app.example.com' });
 *   init() {
 *     this.post('events', { mode: 'queue', jobName: 'hubspot-events', eventType: hubspotEventType },
 *       async (_ctx, body) => HubSpotWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function hubspotWebhookAuth(secret: string | string[], options: HubSpotWebhookOptions = {}): HubSpotWebhookAuth {
  return new HubSpotWebhookAuth(secret, options);
}

export class HubSpotWebhookAuth extends VerifiedWebhookAuth {
  // `verify` is given the headers, not the request; the request whose headers they are gives the method and URL
  private readonly requests = new WeakMap<WebhookHeaders, IncomingRequest>();

  constructor(
    secret: Secrets,
    private readonly options: HubSpotWebhookOptions = {},
  ) {
    super({ secret, provider: provider.id }, provider.id);
  }

  override async auth(req: IncomingRequest, ctx: RequestContext): Promise<WebhookIdentity | null> {
    this.requests.set(req.headers, req);
    try {
      return await super.auth(req, ctx);
    } finally {
      this.requests.delete(req.headers);
    }
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Verified {
    const req = this.requests.get(headers);
    if (!req) return invalid('request is unknown');
    const url = signedUrl(req, this.options.publicBaseUrl);
    return verifyHubSpotSignature(rawBody, headers, secret, { method: req.method, url, nowMs: this.options.now?.() });
  }
}

/**
 * Checks a HubSpot v3 signature over the exact bytes received. `url` is the full URL HubSpot called. Throws
 * `webhooks/invalid-signature`, or returns the dedup key: a digest of the signed batch's events, without their
 * attempt numbers, so HubSpot's retry of a batch deduplicates even though its body and timestamp changed.
 */
export function verifyHubSpotSignature(rawBody: string | Buffer, headers: WebhookHeaders, secret: Secrets, request: { method: string; url: string; nowMs?: number }): Verified {
  const secrets = (Array.isArray(secret) ? secret : [secret]).map((s) => s?.trim()).filter(Boolean);
  if (secrets.length === 0) throw new ConfigError('webhooks/invalid-secret', 'HubSpot webhook: no client secret configured');
  const signature = headerValue(headers, SIGNATURE)?.trim();
  if (!signature || !/^[A-Za-z0-9+/]+={0,2}$/.test(signature)) return invalid('signature is missing or not base64');
  // The MAC covers the header's exact text, Unix milliseconds
  const timestamp = headerValue(headers, TIMESTAMP);
  if (!timestamp || !/^\d{1,15}$/.test(timestamp)) return invalid('timestamp is missing or not Unix milliseconds');
  if (Math.abs((request.nowMs ?? Date.now()) - Number(timestamp)) > FIVE_MINUTES_MS) return invalid('timestamp is more than five minutes off');
  const offered = Buffer.from(signature, 'base64');
  const signed = (key: string) => createHmac('sha256', key).update(request.method.toUpperCase()).update(decodeQuery(request.url)).update(rawBody).update(timestamp).digest();
  if (!secrets.some((key) => { const mac = signed(key); return mac.length === offered.length && timingSafeEqual(mac, offered); })) return invalid('signature mismatch');
  return { eventId: batchKey(rawBody) ?? signatureDigest(offered), timestampSeconds: Math.floor(Number(timestamp) / 1000) };
}

/** Fails the way every `@mariachi/webhooks` check does, so `VerifiedWebhookAuth` answers 401. */
function invalid(reason: string): never {
  throw new AuthError('webhooks/invalid-signature', `HubSpot webhook: ${reason}`);
}

/** The URL HubSpot called: the public base and the path the app received, or https and the `Host` header. */
function signedUrl(req: IncomingRequest, publicBaseUrl: string | undefined): string {
  if (publicBaseUrl) return `${publicBaseUrl.replace(/\/+$/, '')}${req.url}`;
  return `https://${headerValue(req.headers, 'host') ?? ''}${req.url}`;
}

/** HubSpot signs the URL with these escapes in its query decoded, and without a fragment. */
const DECODED: Record<string, string> = { '%3A': ':', '%2F': '/', '%3F': '?', '%40': '@', '%21': '!', '%24': '$', '%27': "'", '%28': '(', '%29': ')', '%2A': '*', '%2C': ',', '%3B': ';' };

function decodeQuery(url: string): string {
  const noFragment = url.split('#')[0]!;
  const at = noFragment.indexOf('?');
  if (at === -1) return noFragment;
  return noFragment.slice(0, at + 1) + noFragment.slice(at + 1).replace(/%(3A|2F|3F|40|21|24|27|28|29|2A|2C|3B)/gi, (m) => DECODED[m.toUpperCase()]!);
}

function batchKey(rawBody: string | Buffer): string | undefined {
  try {
    const events = JSON.parse(rawBody.toString()) as unknown;
    if (!Array.isArray(events) || events.length === 0) return undefined;
    const keys = events.map((e) => (typeof e === 'object' && e !== null ? hubspotEventKey(e as EventKeyFields) : '')).sort();
    return `events:${createHash('sha256').update(keys.join('\n')).digest('hex')}`;
  } catch {
    return undefined;
  }
}

/**
 * What HubSpot posts: a JSON array of events, up to 100, possibly out of order and occasionally twice. HubSpot
 * retries a delivery that fails (or takes over five seconds) up to ten times over 24 hours, so answer fast: queue
 * it.
 */
export const HubSpotWebhookBody = z.array(WebhookEvent).min(1);
export type HubSpotWebhookBody = z.infer<typeof HubSpotWebhookBody>;

type EventKeyFields = Pick<WebhookEvent, 'portalId' | 'subscriptionId' | 'eventId' | 'objectId' | 'occurredAt'>;

/**
 * The key to store an event under so it's handled once. HubSpot says an `eventId` alone isn't guaranteed unique,
 * and an event can arrive again in another batch; this key holds across both.
 */
export function hubspotEventKey(event: EventKeyFields): string {
  return [event.portalId, event.subscriptionId, event.eventId, event.objectId, event.occurredAt].join(':');
}

/** The delivery's event type, for its span: the batch's `subscriptionType` when every event shares one, else `mixed`. */
export function hubspotEventType(payload: unknown): string | undefined {
  if (!Array.isArray(payload)) return undefined;
  const types = new Set(payload.map((e) => (e as { subscriptionType?: unknown } | null)?.subscriptionType).filter((t): t is string => typeof t === 'string'));
  if (types.size === 0) return undefined;
  return types.size === 1 ? [...types][0] : 'mixed';
}
