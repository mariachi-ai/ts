import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { AuthError } from '@mariachi/core';
import { type HttpResponse, type IncomingRequest, httpResponse } from '@mariachi/server';
import { DEFAULT_TOLERANCE_SECONDS, type Secrets, type Verified, VerifiedWebhookAuth, type VerifiedWebhookAuthOptions, type WebhookHeaders, headerValue } from '@mariachi/webhooks';
import { provider } from './generated';
import { ZoomEvent } from './schemas';

export const ZOOM_SIGNATURE_HEADER = 'x-zm-signature';
export const ZOOM_TIMESTAMP_HEADER = 'x-zm-request-timestamp';

export interface ZoomWebhookAuthOptions extends Omit<VerifiedWebhookAuthOptions, 'secret'> {
  /** How far the signed timestamp may be from now, in seconds. Default 300. */
  toleranceSeconds?: number;
  /** The current time in Unix seconds, for tests. */
  nowSeconds?: () => number;
}

/**
 * Zoom's scheme: `x-zm-signature` is `v0=` and the hex HMAC-SHA256, keyed with the app's secret token, of
 * `v0:<x-zm-request-timestamp>:<raw body>`. A timestamp more than five minutes off is refused, so a captured
 * delivery can't be replayed later.
 *
 * Zoom checks the endpoint first, when the URL is set and every 72 hours, with a signed POST of
 * `{ event: "endpoint.url_validation", payload: { plainToken } }`, and wants `{ plainToken, encryptedToken }` back
 * within 3 seconds (`encryptedToken` is the hex HMAC-SHA256 of `plainToken` under the secret token). `handshake`
 * answers it when its signature holds; one that doesn't is refused by `auth`. The check never reaches the route.
 *
 * Each delivery is deduplicated on what Zoom signs: the event, its `event_ts`, the meeting instance's `uuid`, and
 * the participant for participant events. Zoom retries a delivery that fails with a 5xx, up to three times over
 * about an hour.
 */
export class ZoomWebhookAuth extends VerifiedWebhookAuth {
  constructor(private readonly options: VerifiedWebhookAuthOptions & ZoomWebhookAuthOptions) {
    super(options, provider.id);
  }

  async handshake(req: IncomingRequest): Promise<HttpResponse | undefined> {
    if (req.method.toUpperCase() !== 'POST' || !req.rawBody) return undefined;
    const body = parseJson(req.rawBody) as { event?: unknown; payload?: { plainToken?: unknown } } | undefined;
    if (body?.event !== 'endpoint.url_validation') return undefined;
    const plainToken = body.payload?.plainToken;
    if (typeof plainToken !== 'string' || plainToken === '') return undefined;
    const secrets = await this.secretsFor(req);
    if (!secrets) return undefined;
    let key: string;
    try {
      key = this.check(req.rawBody, req.headers, secrets).key;
    } catch {
      return undefined;
    }
    return httpResponse(200, { plainToken, encryptedToken: createHmac('sha256', key).update(plainToken).digest('hex') });
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Verified {
    const { timestamp, offered } = this.check(rawBody, headers, list(secret));
    // A body without the usual fields still dedupes a replay, on its signature
    return { eventId: dedupKey(rawBody) ?? `sig:${createHash('sha256').update(offered).digest('hex')}`, timestampSeconds: Number(timestamp) };
  }

  /** The signature over the timestamp and body, under any of the secrets: returns the one that matched. */
  private check(rawBody: Buffer, headers: WebhookHeaders, secrets: string[]): { key: string; timestamp: string; offered: Buffer } {
    const timestamp = headerValue(headers, ZOOM_TIMESTAMP_HEADER);
    if (!timestamp || !/^\d{1,12}$/.test(timestamp)) return invalid('the timestamp is missing or not Unix seconds');
    const now = this.options.nowSeconds?.() ?? Math.floor(Date.now() / 1000);
    if (Math.abs(now - Number(timestamp)) > (this.options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS)) return invalid('the timestamp is outside the tolerance');
    const signature = headerValue(headers, ZOOM_SIGNATURE_HEADER);
    if (!signature?.startsWith('v0=')) return invalid('the signature is missing or not v0=');
    const hex = signature.slice(3).trim();
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) return invalid('the signature is not a hex SHA-256');
    const offered = Buffer.from(hex, 'hex');
    // The timestamp exactly as sent: Zoom signed those characters
    const key = secrets.find((s) => {
      const expected = createHmac('sha256', s).update(`v0:${timestamp}:`).update(rawBody).digest();
      return expected.length === offered.length && timingSafeEqual(expected, offered);
    });
    if (!key) return invalid('signature mismatch');
    return { key, timestamp, offered };
  }

  /** The secrets the request must be signed with: the shared ones, or its tenant's. */
  private async secretsFor(req: IncomingRequest): Promise<string[] | undefined> {
    const { secret, tenantFromRequest } = this.options;
    if (typeof secret !== 'function') return list(secret);
    const tenantId = tenantFromRequest?.(req);
    const found = tenantId ? await secret(tenantId, req) : undefined;
    return found ? list(found) : undefined;
  }
}

/**
 * The authenticator for a `WebhookController` that receives Zoom. `secret` is `ZOOM_WEBHOOK_SECRET_TOKEN` (or two
 * while rotating). It answers Zoom's endpoint check itself, so the events route is all the app registers.
 *
 * ```ts
 * class ZoomWebhooks extends WebhookController {
 *   readonly prefix = 'zoom';
 *   readonly auth = zoomWebhookAuth(config.zoom.webhookSecretToken);
 *   init() {
 *     this.post('events', { mode: 'queue', jobName: 'zoom-event', eventType: zoomEventType },
 *       async (_ctx, body) => ZoomWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function zoomWebhookAuth(secret: Secrets, options: ZoomWebhookAuthOptions = {}): ZoomWebhookAuth {
  return new ZoomWebhookAuth({ ...options, secret });
}

/**
 * What Zoom posts: `{ event, event_ts, payload: { account_id, object } }`, the meeting's `id` always a number and
 * its instance's `uuid`. A recording event's `download_token` is dropped (download with `recordings.download`).
 */
export const ZoomWebhookBody = ZoomEvent;

/** The delivery's event type, for its span: `eventType: zoomEventType` on the route. */
export function zoomEventType(payload: unknown): string | undefined {
  const event = (payload as { event?: unknown } | null)?.event;
  return typeof event === 'string' ? event : undefined;
}

/**
 * What a delivery is deduplicated on: the event, when it happened, the meeting instance, and the participant
 * (someone joining twice is two events). All of it is inside the signed body.
 */
function dedupKey(rawBody: Buffer): string | undefined {
  const body = parseJson(rawBody) as
    | { event?: unknown; event_ts?: unknown; payload?: { object?: { uuid?: unknown; id?: unknown; participant?: { user_id?: unknown; participant_uuid?: unknown; id?: unknown } } } }
    | undefined;
  if (typeof body?.event !== 'string' || (typeof body.event_ts !== 'number' && typeof body.event_ts !== 'string')) return undefined;
  const object = body.payload?.object;
  const instance = object?.uuid ?? object?.id;
  const participant = object?.participant?.user_id ?? object?.participant?.participant_uuid ?? object?.participant?.id;
  return [body.event, String(body.event_ts), instance === undefined ? '' : String(instance), participant === undefined ? '' : String(participant)].join(':');
}

function list(secret: Secrets): string[] {
  return (Array.isArray(secret) ? secret : [secret]).map((s) => s?.trim()).filter((s): s is string => Boolean(s));
}

function parseJson(rawBody: Buffer): unknown {
  try {
    return JSON.parse(rawBody.toString('utf8'));
  } catch {
    return undefined;
  }
}

function invalid(reason: string): never {
  throw new AuthError('webhooks/invalid-signature', `zoom webhook: ${reason}`);
}
