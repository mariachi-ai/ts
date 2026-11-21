import { X509Certificate, type KeyObject, verify as verifySignature } from 'node:crypto';
import { AuthError } from '@mariachi/core';
import { type ProviderDeps, providerRequest } from '@mariachi/integrations';
import { type Secrets, type Verified, VerifiedWebhookAuth, type VerifiedWebhookAuthOptions, type WebhookHeaders, headerValue } from '@mariachi/webhooks';
import { z } from 'zod';
import type { PayPalEnvironment } from './client';
import { PayPalError } from './errors';
import { provider } from './generated';
import { PayPalWebhookEvent } from './schemas';

/** The hosts a delivery's `PAYPAL-CERT-URL` may name, per environment. Anything else is refused before any fetch. */
const CERT_HOSTS: Readonly<Record<PayPalEnvironment, readonly string[]>> = {
  live: ['api.paypal.com', 'api-m.paypal.com'],
  sandbox: ['api.sandbox.paypal.com', 'api-m.sandbox.paypal.com'],
};
const CERT_PATH = /^\/v1\/notifications\/certs\/[A-Za-z0-9-]{1,100}$/;
const MAX_CACHED_CERTS = 32;

export interface PayPalWebhookVerifierOptions {
  /** `PAYPAL_ENVIRONMENT`. Certificates are only fetched from that environment's PayPal API host. */
  environment: PayPalEnvironment;
  /**
   * Refuse a delivery whose `PAYPAL-TRANSMISSION-TIME` is further than this from now, in seconds. Off by
   * default: PayPal retries a delivery for up to 3 days and doesn't say whether a retry carries a new time.
   */
  toleranceSeconds?: number;
}

export interface PayPalWebhookAuthOptions extends PayPalWebhookVerifierOptions {
  /** `PAYPAL_WEBHOOK_ID`: the id of the app's webhook (two while moving to a new one). Every delivery is signed for it. */
  webhookId: string | string[];
  /** The tenant named in the delivery's body, when the app puts one there. */
  tenantFromPayload?: VerifiedWebhookAuthOptions['tenantFromPayload'];
}

export interface PayPalWebhookAuthDeps extends ProviderDeps {
  /** For tests: answers the certificate download (`testing`'s `payPalWebhookSigner().fetch`). */
  fetch?: typeof fetch;
  /** For tests: the wall clock, in ms. */
  clock?: () => number;
}

/** The `PAYPAL-*` headers PayPal signs a delivery with. */
const SIGNATURE_HEADERS = ['paypal-transmission-id', 'paypal-transmission-time', 'paypal-transmission-sig', 'paypal-cert-url', 'paypal-auth-algo'] as const;

/**
 * PayPal's signature check, without a call to PayPal per delivery: `PAYPAL-TRANSMISSION-SIG` is the base64
 * SHA256withRSA signature of `<transmission id>|<transmission time>|<webhook id>|<CRC32 of the raw body>`, checked
 * with the certificate at `PAYPAL-CERT-URL`. That URL must be `https://` on PayPal's API host for the
 * environment, under `/v1/notifications/certs/`, or it is refused before anything is fetched; the certificate is
 * downloaded through `providerRequest` (span `paypal webhookCerts.get`) the first time and cached until it
 * expires. Throws `webhooks/invalid-signature`; returns the signed transmission id.
 */
export class PayPalWebhookVerifier {
  private readonly certs = new Map<string, { key: KeyObject; validTo: number }>();
  private readonly clock: () => number;

  constructor(
    private readonly options: PayPalWebhookVerifierOptions,
    private readonly deps: PayPalWebhookAuthDeps = {},
  ) {
    if (!CERT_HOSTS[options.environment]) throw new AuthError('webhooks/invalid-secret', 'PayPal webhook: environment must be sandbox or live');
    this.clock = deps.clock ?? Date.now;
  }

  async verify(rawBody: Buffer | string, headers: WebhookHeaders, webhookId: string | string[]): Promise<{ transmissionId: string }> {
    const body = typeof rawBody === 'string' ? Buffer.from(rawBody) : rawBody;
    const transmissionId = headerValue(headers, 'paypal-transmission-id');
    const transmissionTime = headerValue(headers, 'paypal-transmission-time');
    const signature = headerValue(headers, 'paypal-transmission-sig');
    const certUrl = headerValue(headers, 'paypal-cert-url');
    const algorithm = headerValue(headers, 'paypal-auth-algo');
    if (!transmissionId || !transmissionTime || !signature || !certUrl) invalid('missing PayPal transmission headers');
    if (algorithm !== 'SHA256withRSA') invalid('unexpected PAYPAL-AUTH-ALGO');
    if (this.options.toleranceSeconds !== undefined) {
      const at = Date.parse(transmissionTime);
      if (Number.isNaN(at) || Math.abs(this.clock() - at) > this.options.toleranceSeconds * 1000) invalid('transmission time outside the tolerance');
    }
    const key = await this.certificateKey(this.checkedCertUrl(certUrl));
    const sig = Buffer.from(signature, 'base64');
    const crc = crc32(body);
    const ids = (Array.isArray(webhookId) ? webhookId : [webhookId]).map((s) => s?.trim()).filter(Boolean);
    if (ids.length === 0) invalid('no webhook id configured');
    const ok = ids.some((id) => verifySignature('sha256', Buffer.from(`${transmissionId}|${transmissionTime}|${id}|${crc}`), key, sig));
    if (!ok) invalid('signature does not match');
    return { transmissionId };
  }

  private checkedCertUrl(value: string): URL {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return invalid('PAYPAL-CERT-URL is not a URL');
    }
    const allowed = CERT_HOSTS[this.options.environment];
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash || !allowed.includes(url.hostname) || !CERT_PATH.test(url.pathname)) {
      invalid('PAYPAL-CERT-URL is not a PayPal certificate for this environment');
    }
    return url;
  }

  private async certificateKey(url: URL): Promise<KeyObject> {
    const now = this.clock();
    const cached = this.certs.get(url.href);
    if (cached && cached.validTo > now) return cached.key;
    const pem = await providerRequest(
      null,
      { integration: provider.id, operation: 'webhookCerts.get', category: provider.category, server: url.hostname },
      { method: 'GET', url: url.href, headers: { accept: '*/*' } },
      { schema: z.string().min(1), error: PayPalError, deps: this.deps },
    );
    let cert: X509Certificate;
    try {
      cert = new X509Certificate(pem);
    } catch {
      return invalid('PAYPAL-CERT-URL did not serve a certificate');
    }
    const validFrom = Date.parse(cert.validFrom);
    const validTo = Date.parse(cert.validTo);
    if (!(validFrom <= now && now < validTo)) invalid('the signing certificate is not valid now');
    if (this.certs.size >= MAX_CACHED_CERTS) this.certs.delete(this.certs.keys().next().value as string);
    this.certs.set(url.href, { key: cert.publicKey, validTo });
    return cert.publicKey;
  }
}

/**
 * The authenticator for a `WebhookController` that receives PayPal's events as they are, into a job (the
 * billing webhook handler, `createBillingWebhookHandler`, is the way that also keeps the billing mirror). It runs
 * `PayPalWebhookVerifier`'s check. PayPal signs only the body's CRC32, not a cryptographic digest of it, so the
 * delivery is deduplicated on the signed transmission id (a captured delivery is accepted once); read state
 * again from PayPal's API before acting on it, as `normalizePayPalEvent` does.
 */
export class PayPalWebhookAuth extends VerifiedWebhookAuth {
  private readonly verifier: PayPalWebhookVerifier;

  constructor(options: PayPalWebhookAuthOptions, deps: PayPalWebhookAuthDeps = {}) {
    super({ secret: options.webhookId, provider: provider.id, tenantFromPayload: options.tenantFromPayload }, provider.id);
    this.verifier = new PayPalWebhookVerifier(options, deps);
  }

  protected async verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Promise<Verified> {
    const { transmissionId } = await this.verifier.verify(rawBody, headers, secret);
    const body = parseBody(rawBody);
    return { eventId: `transmission:${transmissionId}`, metadata: { eventId: body?.id, eventType: body?.event_type } };
  }
}

/**
 * The delivery's `PAYPAL-*` headers as the one `signature` string `createBillingWebhookHandler`'s `handle` takes
 * (the adapter's `parseWebhook` reads it back). Empty when the delivery has no signature, which `handle` refuses.
 *
 * ```ts
 * await paypalWebhooks.handle(ctx, rawBody, payPalSignature(headers));
 * ```
 */
export function payPalSignature(headers: WebhookHeaders): string {
  if (!headerValue(headers, 'paypal-transmission-sig')) return '';
  return JSON.stringify(Object.fromEntries(SIGNATURE_HEADERS.map((h) => [h, headerValue(headers, h) ?? ''])));
}

/** `payPalSignature`'s string back as headers; nothing for anything else. */
export function signatureHeaders(signature: string): WebhookHeaders {
  try {
    const parsed = JSON.parse(signature) as Record<string, unknown>;
    return Object.fromEntries(SIGNATURE_HEADERS.map((h) => [h, typeof parsed[h] === 'string' ? (parsed[h] as string) : undefined]));
  } catch {
    return {};
  }
}

/**
 * `payPalWebhookAuth({ webhookId: config.paypal.webhookId, environment: config.paypal.environment })`.
 *
 * ```ts
 * class PayPalWebhooks extends WebhookController {
 *   readonly prefix = 'paypal';
 *   readonly auth = payPalWebhookAuth({ webhookId: config.paypal.webhookId, environment: config.paypal.environment });
 *   init() {
 *     this.post('events', { mode: 'queue', jobName: 'paypal-event', eventType: payPalEventType },
 *       async (_ctx, body) => PayPalWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function payPalWebhookAuth(options: PayPalWebhookAuthOptions, deps?: PayPalWebhookAuthDeps): PayPalWebhookAuth {
  return new PayPalWebhookAuth(options, deps);
}

/**
 * A delivery's body: `{ id, event_type, create_time, resource_type, resource }`. PayPal retries a delivery that
 * isn't answered 2xx, so the same event (`id`) can arrive more than once: `normalizePayPalEvent` is safe to run
 * again, and anything else the job does should be keyed by `id`.
 */
export const PayPalWebhookBody = PayPalWebhookEvent;

/** The delivery's event type, for its span: `eventType: payPalEventType` on the route. */
export function payPalEventType(payload: unknown): string | undefined {
  const type = (payload as { event_type?: unknown } | null)?.event_type;
  return typeof type === 'string' ? type : undefined;
}

/** CRC-32 (IEEE 802.3, the zlib one) of the bytes, as the unsigned decimal PayPal signs. */
export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = (TABLE[(crc ^ byte) & 0xff] as number) ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

const TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function parseBody(rawBody: Buffer): { id?: string; event_type?: string } | undefined {
  try {
    const parsed = JSON.parse(rawBody.toString('utf8')) as { id?: unknown; event_type?: unknown };
    return { id: typeof parsed.id === 'string' ? parsed.id : undefined, event_type: typeof parsed.event_type === 'string' ? parsed.event_type : undefined };
  } catch {
    return undefined;
  }
}

function invalid(reason: string): never {
  throw new AuthError('webhooks/invalid-signature', `paypal webhook: ${reason}`);
}
