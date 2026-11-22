import { createRemoteJWKSet, decodeJwt, type JWTVerifyGetKey, jwtVerify } from 'jose';
import { AuthError } from '@mariachi/core';
import type { AuthWebhookEvent, AuthWebhookHandler } from '@mariachi/auth';
import { type Secrets, type Verified, VerifiedWebhookAuth, type WebhookHeaders, headerValue } from '@mariachi/webhooks';
import { z } from 'zod';
import { provider } from './generated';
import { KindeWebhookPayload } from './schemas';

/** How far a delivery's `timestamp` may be from now, either way, by default: five minutes. */
export const KINDE_WEBHOOK_TOLERANCE_SECONDS = 300;

export interface KindeWebhookOptions {
  /** The Kinde domain (`KINDE_ISSUER_URL`). Deliveries must verify against its keys, `<issuerUrl>/.well-known/jwks`. */
  issuerUrl: string;
  /** Refuse a delivery whose `timestamp` is further from now than this, either way. Default 300 (five minutes). */
  toleranceSeconds?: number;
  /** A key set to use in place of Kinde's (tests: `kindeTestKeys().jwks`). */
  jwks?: JWTVerifyGetKey;
  /** The clock, in ms, for tests. */
  now?: () => number;
}

const keySets = new Map<string, JWTVerifyGetKey>();

/** One key set per Kinde domain, shared by every verifier in the process. */
function keysFor(issuer: string): JWTVerifyGetKey {
  let keys = keySets.get(issuer);
  if (!keys) {
    keys = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks`), { cacheMaxAge: 600_000, cooldownDuration: 30_000 });
    keySets.set(issuer, keys);
  }
  return keys;
}

const INVALID = 'webhooks/invalid-signature';

function refuse(reason: string): never {
  throw new AuthError(INVALID, `kinde webhook: ${reason}`);
}

/**
 * Checks one Kinde delivery: the body is a JWT signed with a key of the business (RS256), its `iss` (when it has
 * one) is the business's domain, and its `timestamp` is within the tolerance. Returns the verified payload.
 */
async function verifyDelivery(rawBody: string | Buffer, issuer: string, options: Omit<KindeWebhookOptions, 'issuerUrl'>): Promise<KindeWebhookPayload> {
  const token = (typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')).trim();
  if (!token) refuse('the body is empty');
  let claims: Record<string, unknown>;
  try {
    ({ payload: claims } = await jwtVerify(token, options.jwks ?? keysFor(issuer), { algorithms: ['RS256'] }));
  } catch {
    refuse("the body isn't a JWT signed with the business's keys");
  }
  if (claims.iss !== undefined && claims.iss !== issuer) refuse('the JWT was issued by another domain');
  const parsed = KindeWebhookPayload.safeParse(claims);
  if (!parsed.success) refuse('the payload has no type, event_id or timestamp');
  const sent = Date.parse(parsed.data.timestamp);
  const tolerance = (options.toleranceSeconds ?? KINDE_WEBHOOK_TOLERANCE_SECONDS) * 1000;
  if (Number.isNaN(sent) || Math.abs((options.now ?? Date.now)() - sent) > tolerance) {
    refuse('the timestamp is outside the tolerance');
  }
  return parsed.data;
}

function issuerOf(issuerUrl: string): string {
  if (!issuerUrl) throw new AuthError('auth/invalid-config', 'Kinde webhooks: `issuerUrl` is required');
  return issuerUrl.replace(/\/+$/, '');
}

/**
 * Verifies Kinde webhooks for a `WebhookController`: the body (`Content-Type: application/jwt`) is a JWT Kinde
 * signs with the business's keys, so there is no shared secret. A delivery whose `timestamp` is older (or
 * further ahead) than `toleranceSeconds` is refused, so a captured one can't be replayed later; inside the
 * window, it's deduplicated on the signed `event_id` (give `WebhookServer` an idempotency store). A delivery that
 * fails is answered 401.
 */
export class KindeWebhookAuth extends VerifiedWebhookAuth {
  constructor(private readonly options: KindeWebhookOptions) {
    // What verifies a delivery is the business's published keys: the base class's `secret` is the domain that names them.
    super({ secret: issuerOf(options.issuerUrl) }, provider.id);
  }

  protected async verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Promise<Verified> {
    const payload = await verifyDelivery(rawBody, [secret].flat()[0] ?? '', this.options);
    // `webhook-id` names the delivery, but nothing signs it: kept for the logs, never deduplicated on.
    return { eventId: payload.event_id, metadata: { type: payload.type, deliveryId: headerValue(headers, 'webhook-id') } };
  }
}

/**
 * The authenticator for a `WebhookController` that receives Kinde.
 *
 * ```ts
 * class KindeWebhooks extends WebhookController {
 *   readonly prefix = 'kinde';
 *   readonly auth = kindeWebhookAuth({ issuerUrl: config.kinde.issuerUrl });
 *   init() {
 *     this.post('events', { mode: 'queue', jobName: 'kinde-event', eventType: kindeEventType },
 *       async (_ctx, body) => KindeWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function kindeWebhookAuth(options: KindeWebhookOptions): KindeWebhookAuth {
  return new KindeWebhookAuth(options);
}

/**
 * A Kinde delivery's body, read into its payload: `{ type, event_id, timestamp, event_timestamp, source, data }`.
 * It decodes the JWT `kindeWebhookAuth` has already verified (the route's handler only runs after that), so use
 * it only behind that authenticator. Kinde retries a delivery it got no 200 for, so dedupe on `event_id` where
 * the event is stored.
 */
export const KindeWebhookBody = z
  .union([z.instanceof(Buffer), z.string()])
  .transform((body, ctx) => {
    try {
      return decodeJwt((typeof body === 'string' ? body : body.toString('utf8')).trim()) as unknown;
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'the body is not a JWT' });
      return z.NEVER;
    }
  })
  .pipe(KindeWebhookPayload);

/** The delivery's event type, for its span: `eventType: kindeEventType` on the route. */
export function kindeEventType(payload: unknown): string | undefined {
  const type = (payload as { type?: unknown } | null)?.type;
  return typeof type === 'string' ? type : undefined;
}

const EVENT_TYPE_MAP: Record<string, string> = {
  'user.authenticated': 'session.created',
};

/**
 * Maps a Kinde event type onto the auth port's `AuthEventType`: `user.created`, `user.updated`, `user.deleted`
 * and `organization.*` already match, `user.authenticated` is `session.created`. Others (`role.*`,
 * `permission.*`, `customer.*`, …) pass through.
 */
export function normalizeKindeEventType(type: string): string {
  return EVENT_TYPE_MAP[type] ?? type;
}

/** A verified payload as the auth port's `AuthWebhookEvent`, for code shared across providers. */
export function kindeAuthEvent(payload: KindeWebhookPayload): AuthWebhookEvent {
  const at = Date.parse(payload.event_timestamp ?? payload.timestamp);
  return {
    id: payload.event_id,
    type: normalizeKindeEventType(payload.type),
    provider: provider.id,
    data: payload.data,
    raw: payload,
    timestamp: Number.isNaN(at) ? undefined : at,
  };
}

/** `AuthWebhookHandler` for `createAuthWebhookDispatcher`: the same checks as `kindeWebhookAuth`, failing as `auth/webhook-verification-failed`. */
export class KindeWebhookHandler implements AuthWebhookHandler {
  private readonly issuer: string;

  constructor(private readonly options: KindeWebhookOptions) {
    this.issuer = issuerOf(options.issuerUrl);
  }

  async verify(rawBody: string | Buffer, _headers: Record<string, string | string[] | undefined>): Promise<AuthWebhookEvent> {
    try {
      return kindeAuthEvent(await verifyDelivery(rawBody, this.issuer, this.options));
    } catch (error) {
      if (error instanceof AuthError && error.code === INVALID) throw new AuthError('auth/webhook-verification-failed', error.message);
      throw error;
    }
  }
}
