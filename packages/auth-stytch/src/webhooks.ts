import { AuthError } from '@mariachi/core';
import type { AuthWebhookEvent, AuthWebhookHandler } from '@mariachi/auth';
import { StandardWebhookAuth } from '@mariachi/webhooks';
import { type WebhookHeaders, verifyStandardWebhook } from '@mariachi/webhooks/verify';
import { provider } from './generated';
import { StytchWebhookBody } from './schemas';

/**
 * The authenticator for a `WebhookController` that receives Stytch. Stytch sends its webhooks through Svix
 * (Standard Webhooks): `svix-id`, `svix-timestamp` and `svix-signature` over the raw body, keyed with the
 * endpoint's `whsec_…` secret. Pass two secrets while rotating. A delivery that doesn't match is answered 401;
 * deliveries are deduplicated on the signed `svix-id`.
 *
 * ```ts
 * class StytchWebhooks extends WebhookController {
 *   readonly prefix = 'stytch';
 *   readonly auth = stytchWebhookAuth(config.stytch.webhookSecret);
 *   init() {
 *     this.post('events', { mode: 'queue', jobName: 'stytch-event', eventType: stytchEventType },
 *       async (_ctx, body) => StytchWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function stytchWebhookAuth(secret: string | string[]): StandardWebhookAuth {
  return new StandardWebhookAuth({ provider: provider.id, secret });
}

export { StytchWebhookBody };

/**
 * Stytch's event type for a body: `source.object_type.action`, lowercased (`direct.user.create`). The body has no
 * type field of its own.
 */
export function stytchEventType(payload: unknown): string | undefined {
  const p = payload as { source?: unknown; object_type?: unknown; action?: unknown } | null;
  if (typeof p?.source !== 'string' || typeof p.object_type !== 'string' || typeof p.action !== 'string') return undefined;
  return `${p.source}.${p.object_type}.${p.action}`.toLowerCase();
}

const USER_EVENTS: Record<string, string> = { create: 'user.created', update: 'user.updated', delete: 'user.deleted' };

/**
 * The auth port's event type (`AuthEventType`) for a Stytch one: a user created, updated or deleted, whether
 * through the API, an SDK or the Dashboard, is `user.created`, `user.updated` or `user.deleted`. Anything else
 * (`direct.user_device.new_device_attribute`) keeps Stytch's type.
 */
export function normalizeStytchEventType(stytchType: string): string {
  const [source, object, action, ...rest] = stytchType.split('.');
  if (rest.length === 0 && object === 'user' && source && action && USER_EVENTS[action]) return USER_EVENTS[action];
  return stytchType;
}

export interface StytchWebhookHandlerConfig {
  /** The endpoint's signing secret (`whsec_…`), or several while one is being rotated. */
  secret: string | string[];
  /** Refuse deliveries signed longer ago (or further ahead) than this. Default 300 seconds. */
  toleranceSeconds?: number;
  /** The clock in ms, for tests. */
  now?: () => number;
}

/**
 * Stytch's `AuthWebhookHandler`, for `createAuthWebhookDispatcher` from `@mariachi/auth`: checks the Svix
 * signature over the exact raw body and normalizes the event, so `direct.user.create` reaches the procedure
 * `auth.user.created`. `data` is the user (Stytch's User object) with `id` set to its `user_id`; a delete
 * carries only `id`. The event id is Stytch's `event_id`.
 */
export class StytchWebhookHandler implements AuthWebhookHandler {
  private readonly secrets: string[];

  constructor(private readonly config: StytchWebhookHandlerConfig) {
    this.secrets = (Array.isArray(config.secret) ? config.secret : [config.secret]).filter((s) => typeof s === 'string' && s.trim() !== '');
    if (this.secrets.length === 0) throw new AuthError('auth/invalid-config', 'Stytch webhooks: `secret` is required');
  }

  verify(rawBody: string | Buffer, headers: WebhookHeaders): AuthWebhookEvent {
    const raw = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody;
    try {
      verifyStandardWebhook(raw, headers, this.secrets, {
        toleranceSeconds: this.config.toleranceSeconds,
        nowSeconds: this.config.now ? Math.floor(this.config.now() / 1000) : undefined,
      });
    } catch {
      throw new AuthError('auth/webhook-verification-failed', 'Stytch webhook signature invalid');
    }
    let json: unknown;
    try {
      json = JSON.parse(raw.toString('utf8'));
    } catch {
      throw new AuthError('auth/webhook-invalid-payload', 'Stytch webhook body is not JSON');
    }
    const parsed = StytchWebhookBody.safeParse(json);
    if (!parsed.success) throw new AuthError('auth/webhook-invalid-payload', 'Stytch webhook body is not a Stytch event');
    const body = parsed.data;
    const timestamp = body.timestamp ? Date.parse(body.timestamp) : Number.NaN;
    return {
      id: body.event_id,
      type: normalizeStytchEventType(stytchEventType(body) ?? 'unknown'),
      provider: provider.id,
      data: { ...(body.user ?? {}), id: body.id },
      raw: body,
      ...(Number.isNaN(timestamp) ? {} : { timestamp }),
    };
  }
}
