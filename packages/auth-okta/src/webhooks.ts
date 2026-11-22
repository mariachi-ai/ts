import { createHash, timingSafeEqual } from 'node:crypto';
import type { AuthEventType, AuthWebhookEvent } from '@mariachi/auth';
import { AuthError } from '@mariachi/core';
import { type HttpResponse, type IncomingRequest, httpResponse } from '@mariachi/server';
import { type Secrets, type Verified, VerifiedWebhookAuth, type VerifiedWebhookAuthOptions, type WebhookHeaders, headerValue } from '@mariachi/webhooks';
import { provider } from './generated';
import { type LogEvent, type LogEventObject, OktaEventHookDelivery } from './schemas';

export const OKTA_VERIFICATION_HEADER = 'x-okta-verification-challenge';

/**
 * Okta Event Hooks' scheme. Okta signs nothing: every request carries, as its `Authorization` header, the secret
 * given when the hook was created, which is compared here in constant time (pass two while rotating).
 *
 * When the hook is created or verified, Okta first sends one `GET` with `x-okta-verification-challenge`.
 * `handshake` answers it, `200 { "verification": "<the challenge>" }`, when it carries the secret; one that
 * doesn't is refused by `auth`. The check never reaches the route. Register a `GET` on the hook's path so it
 * arrives (see `oktaWebhookAuth`).
 *
 * A static secret proves the sender but not that a request is new: dedupe deliveries on `eventId` (the
 * `WebhookServer` does with an idempotency store) and events on their `uuid`.
 */
export class OktaEventHookAuth extends VerifiedWebhookAuth {
  constructor(private readonly options: VerifiedWebhookAuthOptions) {
    super(options, provider.id);
  }

  async handshake(req: IncomingRequest): Promise<HttpResponse | undefined> {
    if (req.method.toUpperCase() !== 'GET') return undefined;
    const challenge = headerValue(req.headers, OKTA_VERIFICATION_HEADER);
    if (!challenge) return undefined;
    const secret = await this.secretFor(req);
    if (!secret || !matches(headerValue(req.headers, 'authorization'), secret)) return undefined;
    return httpResponse(200, { verification: challenge });
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Verified {
    const given = headerValue(headers, 'authorization');
    if (!given) return invalid('the Authorization header is missing');
    if (!matches(given, secret)) return invalid('the Authorization header does not match the event hook secret');
    let eventId: unknown;
    try {
      eventId = (JSON.parse(rawBody.toString('utf8')) as { eventId?: unknown } | null)?.eventId;
    } catch {
      eventId = undefined;
    }
    // Okta's delivery id, so a retried delivery is processed once; else the body's digest.
    return { eventId: typeof eventId === 'string' && eventId ? eventId : `body:${createHash('sha256').update(rawBody).digest('hex')}` };
  }

  /** The secret the request must carry: the shared one, or its tenant's. */
  private async secretFor(req: IncomingRequest): Promise<Secrets | undefined> {
    const { secret, tenantFromRequest } = this.options;
    if (typeof secret !== 'function') return secret;
    const tenantId = tenantFromRequest?.(req);
    return tenantId ? secret(tenantId, req) : undefined;
  }
}

/**
 * The authenticator for a `WebhookController` that receives Okta Event Hooks. `secret` is `OKTA_EVENT_HOOK_SECRET`
 * (or two while rotating). Register the hook's path for `GET` too: that's how Okta's verification request
 * arrives, and the authenticator answers it before the route.
 *
 * ```ts
 * class OktaWebhooks extends WebhookController {
 *   readonly prefix = 'okta';
 *   readonly auth = oktaWebhookAuth(config.okta.eventHookSecret);
 *   init() {
 *     const route = { mode: 'queue', jobName: 'okta-events', eventType: oktaEventType } as const;
 *     const handler = async (_ctx: unknown, body: unknown) => OktaEventHookBody.parse(body);
 *     this.get('events', route, handler);    // Okta's verification: answered by the authenticator
 *     this.post('events', route, handler);
 *   }
 * }
 * ```
 */
export function oktaWebhookAuth(secret: Secrets, options: Omit<VerifiedWebhookAuthOptions, 'secret'> = {}): OktaEventHookAuth {
  return new OktaEventHookAuth({ ...options, secret });
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

/** Whether the `Authorization` value is one of the secrets. Every secret is compared, so the time taken says nothing about which one matched. */
function matches(given: string | undefined, secret: Secrets): boolean {
  if (!given) return false;
  const offered = digest(given);
  return (Array.isArray(secret) ? secret : [secret])
    .filter((s) => typeof s === 'string' && s.trim() !== '')
    .map((s) => timingSafeEqual(offered, digest(s)))
    .includes(true);
}

function digest(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

function invalid(reason: string): never {
  throw new AuthError('webhooks/invalid-signature', `okta webhook: ${reason}`);
}
