import { createHash, timingSafeEqual } from 'node:crypto';
import type { AuthEventType, AuthWebhookEvent } from '@mariachi/auth';
import { AuthError } from '@mariachi/core';
import { VerifiedWebhookAuth, type VerifiedWebhookAuthOptions, type Verified, type Secrets, type WebhookHeaders, headerValue } from '@mariachi/webhooks';
import { provider } from './generated';
import { type LogEvent, type LogEventObject, OktaEventHookDelivery } from './schemas';

export const OKTA_VERIFICATION_HEADER = 'x-okta-verification-challenge';

/**
 * Okta Event Hooks' scheme. Okta signs nothing: every request carries, as its `Authorization` header, the secret
 * given when the hook was created, which is compared here in constant time (pass two while rotating). The
 * one-time verification `GET` Okta sends when the hook is created or verified has no body: it's let through too
 * when it carries the secret and the challenge, which `oktaVerification` echoes back.
 *
 * A static secret proves the sender but not that a request is new: dedupe deliveries on `eventId` (the
 * `WebhookServer` does with an idempotency store) and events on their `uuid`.
 */
export class OktaEventHookAuth extends VerifiedWebhookAuth {
  constructor(options: VerifiedWebhookAuthOptions) {
    super(options, provider.id);
  }

  protected override acceptsEmptyBody(method: string): boolean {
    return method === 'GET';
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets, method: string): Verified {
    const given = headerValue(headers, 'authorization');
    const secrets = (Array.isArray(secret) ? secret : [secret]).filter((s) => typeof s === 'string' && s.trim() !== '');
    if (!given) return invalid('the Authorization header is missing');
    const offered = digest(given);
    // Every secret is compared, so the time taken says nothing about which one matched.
    const ok = secrets.map((s) => timingSafeEqual(offered, digest(s))).includes(true);
    if (!ok) return invalid('the Authorization header does not match the event hook secret');
    if (method === 'GET') {
      const challenge = headerValue(headers, OKTA_VERIFICATION_HEADER);
      if (!challenge) return invalid(`a GET without ${OKTA_VERIFICATION_HEADER}`);
      return { metadata: { verification: challenge } };
    }
    let eventId: unknown;
    try {
      eventId = (JSON.parse(rawBody.toString('utf8')) as { eventId?: unknown } | null)?.eventId;
    } catch {
      eventId = undefined;
    }
    // Okta's delivery id, so a retried delivery is processed once; else the body's digest.
    return { eventId: typeof eventId === 'string' && eventId ? eventId : `body:${createHash('sha256').update(rawBody).digest('hex')}` };
  }
}

/**
 * The authenticator for a `WebhookController` that receives Okta Event Hooks. `secret` is `OKTA_EVENT_HOOK_SECRET`
 * (or two while rotating).
 *
 * ```ts
 * class OktaWebhooks extends WebhookController {
 *   readonly prefix = 'okta';
 *   readonly auth = oktaWebhookAuth(config.okta.eventHookSecret);
 *   init() {
 *     this.get('events', { mode: 'reply' }, async (ctx) => oktaVerification(ctx));
 *     this.post('events', { mode: 'queue', jobName: 'okta-events', eventType: oktaEventType },
 *       async (_ctx, body) => OktaEventHookBody.parse(body));
 *   }
 * }
 * ```
 */
export function oktaWebhookAuth(secret: string | string[], options: Omit<VerifiedWebhookAuthOptions, 'secret'> = {}): OktaEventHookAuth {
  return new OktaEventHookAuth({ ...options, secret });
}

/**
 * The answer to Okta's one-time verification request, `{ verification: <the challenge> }`, for a `reply` route
 * on `GET`. Only an authenticated request has a challenge to echo.
 */
export function oktaVerification(ctx: { identity: { metadata?: Record<string, unknown> } }): { verification: string } {
  const verification = ctx.identity.metadata?.verification;
  if (typeof verification !== 'string') throw new AuthError('auth/webhook-invalid-payload', `Okta verification request without ${OKTA_VERIFICATION_HEADER}`);
  return { verification };
}

/** What Okta posts to an Event Hook: one or more System Log events in `data.events`. */
export const OktaEventHookBody = OktaEventHookDelivery;

/**
 * The delivery's event type, for its span: the events' type when they all share one (`user.lifecycle.create`),
 * else Okta's envelope type (`com.okta.event_hook`).
 */
export function oktaEventType(payload: unknown): string | undefined {
  const p = payload as { eventType?: unknown; data?: { events?: Array<{ eventType?: unknown }> } } | null;
  const types = new Set((p?.data?.events ?? []).map((e) => e?.eventType).filter((t): t is string => typeof t === 'string'));
  if (types.size === 1) return [...types][0];
  return typeof p?.eventType === 'string' ? p.eventType : undefined;
}

const EVENT_TYPE_MAP: Record<string, AuthEventType> = {
  'user.lifecycle.create': 'user.created',
  'user.account.update_profile': 'user.updated',
  // `user.lifecycle.delete.completed` isn't sent to event hooks: the initiated event is the one there is.
  'user.lifecycle.delete.initiated': 'user.deleted',
  'user.session.end': 'session.ended',
  'user.session.clear': 'session.revoked',
};

/**
 * An Okta event type in the auth port's words: `user.lifecycle.create` is `user.created`,
 * `user.account.update_profile` is `user.updated`, `user.lifecycle.delete.initiated` is `user.deleted`,
 * `user.session.end` is `session.ended` and `user.session.clear` is `session.revoked`. Every other type
 * (`user.lifecycle.deactivate`, `user.lifecycle.suspend`, …) is kept as Okta names it. `user.session.start` is
 * kept too: Okta sends it for sign-in attempts, failed ones included.
 */
export function normalizeOktaEventType(type: string): string {
  return EVENT_TYPE_MAP[type] ?? type;
}

/**
 * A delivery's events as the auth port's `AuthWebhookEvent`s, one per event, in order. `id` is the event's `uuid`
 * (dedupe on it), `data` names the user it's about (`userId` is Okta's id, `login` their username) and `raw` is
 * Okta's event.
 */
export function oktaAuthEvents(body: OktaEventHookDelivery): AuthWebhookEvent[] {
  return body.data.events.map((event) => {
    const user = userOf(event);
    const published = Date.parse(event.published);
    return {
      id: event.uuid,
      type: normalizeOktaEventType(event.eventType),
      provider: provider.id,
      data: {
        oktaEventType: event.eventType,
        userId: user?.id ?? null,
        login: user?.alternateId ?? null,
        displayName: user?.displayName ?? null,
        outcome: event.outcome?.result ?? null,
      },
      raw: event,
      ...(Number.isNaN(published) ? {} : { timestamp: published }),
    };
  });
}

/** The user an event is about: its `User` target (an admin's change), else its actor when that's a user (their own sign-out). */
function userOf(event: LogEvent): LogEventObject | undefined {
  return event.target?.find((t) => t.type === 'User') ?? (event.actor?.type === 'User' ? event.actor : undefined);
}

function digest(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

function invalid(reason: string): never {
  throw new AuthError('webhooks/invalid-signature', `okta webhook: ${reason}`);
}
