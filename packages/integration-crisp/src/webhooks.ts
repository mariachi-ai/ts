import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { AuthError, ConfigError } from '@mariachi/core';
import type { IncomingRequest, RequestContext } from '@mariachi/server';
import { AuthController, type Secrets, type Verified, VerifiedWebhookAuth, type VerifiedWebhookAuthOptions, type WebhookHeaders, type WebhookIdentity, headerValue } from '@mariachi/webhooks';
import { provider } from './generated';
import { CrispWebhookBody } from './schemas';

export const CRISP_SIGNATURE_HEADER = 'x-crisp-signature';
export const CRISP_TIMESTAMP_HEADER = 'x-crisp-request-timestamp';

/**
 * A plugin's web hooks: `X-Crisp-Signature` is the hex HMAC-SHA256, keyed with the hook's signing secret, of
 * `[timestamp;body]`, the `X-Crisp-Request-Timestamp` header and the JSON body as a string. Crisp signs the body as
 * `JSON.stringify` writes it, so the check accepts the bytes received or that form of them; either way the parsed body
 * is what was signed. Deduplicated on a digest of that body, which carries the event's own timestamp, so a
 * redelivery is dropped whatever its headers say.
 */
export class CrispWebhookAuth extends VerifiedWebhookAuth {
  constructor(private readonly options: VerifiedWebhookAuthOptions & { toleranceSeconds?: number }) {
    super(options, provider.id);
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Verified {
    const signature = headerValue(headers, CRISP_SIGNATURE_HEADER)?.trim();
    const timestamp = headerValue(headers, CRISP_TIMESTAMP_HEADER)?.trim();
    if (!signature || !/^[0-9a-fA-F]{64}$/.test(signature)) return invalid('signature is missing or not hex');
    if (!timestamp || !/^\d{1,16}$/.test(timestamp)) return invalid('timestamp is missing');
    if (this.options.toleranceSeconds !== undefined) {
      // Crisp doesn't document the header's unit; its timestamps elsewhere are milliseconds
      const n = Number(timestamp);
      const seconds = n > 100_000_000_000 ? n / 1000 : n;
      if (Math.abs(Date.now() / 1000 - seconds) > this.options.toleranceSeconds) return invalid('timestamp is outside the tolerance');
    }
    const raw = rawBody.toString('utf8');
    const canonical = canonicalBody(raw);
    if (canonical === undefined) return invalid('body is not JSON');
    const offered = Buffer.from(signature, 'hex');
    const bodies = raw === canonical ? [raw] : [raw, canonical];
    const secrets = (Array.isArray(secret) ? secret : [secret]).map((s) => s.trim()).filter(Boolean);
    const matches = secrets.some((key) => bodies.some((body) => safeEqual(offered, createHmac('sha256', key).update(`[${timestamp};${body}]`).digest())));
    if (!matches) return invalid('signature mismatch');
    return { eventId: bodyDigest(canonical), metadata: { attempt: headerValue(headers, 'x-delivery-attempt-count') } };
  }
}

/**
 * The authenticator for a `WebhookController` that receives a Crisp plugin's web hooks, signed with the hook's
 * secret (`CRISP_WEBHOOK_SECRET`). Pass two secrets while rotating. A delivery that doesn't match is answered 401.
 * `toleranceSeconds` also refuses a delivery whose timestamp is that far from now; it's off by default, since Crisp
 * doesn't document the timestamp's unit or how long its retries take.
 *
 * ```ts
 * class CrispWebhooks extends WebhookController {
 *   readonly prefix = 'crisp';
 *   readonly auth = crispWebhookAuth(config.crisp.webhookSecret);
 *   init() {
 *     this.post('events', { mode: 'queue', jobName: 'crisp-event', eventType: crispEventType },
 *       async (_ctx, body) => CrispWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function crispWebhookAuth(secret: string | string[], options: { toleranceSeconds?: number } = {}): CrispWebhookAuth {
  return new CrispWebhookAuth({ secret, ...options });
}

/**
 * A website's own web hooks (Settings › Advanced configuration › Web Hooks), which Crisp doesn't sign. As Crisp
 * advises, the hook's URL carries a key of your own, `?key=…`, compared here in constant time; anything without it is
 * refused. Deduplicated on a digest of the body. Prefer a plugin's signed hooks (`crispWebhookAuth`) where you can:
 * anyone who learns the URL can post to it.
 */
export class CrispWebsiteHookAuth extends AuthController {
  readonly provider = provider.id;
  private readonly keys: Buffer[];

  constructor(key: string | string[]) {
    super();
    this.keys = (Array.isArray(key) ? key : [key]).map((k) => k?.trim()).filter(Boolean).map((k) => Buffer.from(k));
    if (this.keys.length === 0) throw new ConfigError('webhooks/invalid-secret', 'crisp website hook: no key configured (CRISP_WEBHOOK_SECRET)');
    if (this.keys.some((k) => k.length < 24)) throw new ConfigError('webhooks/invalid-secret', 'crisp website hook: the key must be at least 24 characters of random text');
  }

  async auth(req: IncomingRequest, ctx: RequestContext): Promise<WebhookIdentity | null> {
    const given = req.query.key;
    const key = typeof given === 'string' ? Buffer.from(given) : undefined;
    if (!key || !this.keys.some((k) => safeEqual(key, k))) {
      ctx.logger.warn({ provider: this.provider }, 'crisp website hook has no matching key; rejecting');
      return null;
    }
    const canonical = req.rawBody ? canonicalBody(req.rawBody.toString('utf8')) : undefined;
    if (canonical === undefined) {
      ctx.logger.warn({ provider: this.provider }, 'crisp website hook body is not JSON; rejecting');
      return null;
    }
    return { provider: this.provider, verified: true, eventId: bodyDigest(canonical), metadata: {} };
  }
}

/** The authenticator for a website's own (unsigned) web hooks, whose URL ends `?key=<CRISP_WEBHOOK_SECRET>`. */
export function crispWebsiteHookAuth(key: string | string[]): CrispWebsiteHookAuth {
  return new CrispWebsiteHookAuth(key);
}

/**
 * What Crisp posts: `{ website_id, event, data, timestamp }`, `data` as the RTM API sends it. A failed delivery is
 * retried, and Crisp warns it can then arrive twice: the authenticators dedupe on the body, and a stored message is
 * keyed by `data.fingerprint`.
 */
export { CrispWebhookBody };

/** The delivery's event type, for its span: `eventType: crispEventType` on the route. */
export function crispEventType(payload: unknown): string | undefined {
  const event = (payload as { event?: unknown } | null)?.event;
  return typeof event === 'string' ? event : undefined;
}

function invalid(reason: string): never {
  throw new AuthError('webhooks/invalid-signature', `crisp webhook: ${reason}`);
}

function canonicalBody(raw: string): string | undefined {
  try {
    return JSON.stringify(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

function bodyDigest(canonical: string): string {
  return `body:${createHash('sha256').update(canonical).digest('hex')}`;
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}
