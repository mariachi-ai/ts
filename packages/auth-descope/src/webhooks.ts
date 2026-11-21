import { createHash } from 'node:crypto';
import type { AuthWebhookEvent } from '@mariachi/auth';
import { HmacWebhookAuth } from '@mariachi/webhooks';
import { z } from 'zod';
import { provider } from './generated';
import { DescopeAuditEvent } from './schemas';

/** The header Descope's connectors put the signature in. */
export const DESCOPE_SIGNATURE_HEADER = 'x-descope-webhook-s256';

/**
 * The authenticator for a `WebhookController` that receives Descope's Audit Webhook (or an HTTP connector) with
 * an HMAC secret set: `x-descope-webhook-s256` is the base64 HMAC-SHA256 of the raw body, keyed with that secret.
 * Pass two secrets while rotating. A delivery that doesn't match is answered 401.
 *
 * Nothing in the scheme signs a timestamp or a delivery id, so a captured delivery stays valid for ever.
 * `WebhookServer` deduplicates on a digest of the signature: give it an idempotency store, or a replay is
 * processed again.
 *
 * ```ts
 * class DescopeWebhooks extends WebhookController {
 *   readonly prefix = 'descope';
 *   readonly auth = descopeWebhookAuth(config.descope.webhookSecret);
 *   init() {
 *     this.post('audit', { mode: 'queue', jobName: 'descope-audit', eventType: descopeEventType },
 *       async (_ctx, body) => DescopeWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function descopeWebhookAuth(secret: string | string[]): HmacWebhookAuth {
  return new HmacWebhookAuth({ provider: provider.id, secret, header: DESCOPE_SIGNATURE_HEADER, encoding: 'base64' });
}

/**
 * What the Audit Webhook connector posts: a JSON array of up to 100 audit events, so one delivery can carry
 * several. Each has `action`, `occurred` (Unix ms), `userId`, `actorId`, `loginIds` and `data`, and no id.
 */
export const DescopeWebhookBody = z.array(DescopeAuditEvent).min(1);
export type DescopeWebhookBody = z.infer<typeof DescopeWebhookBody>;

/** The delivery's event type, for its span: the events' `action` when they share one, else `batch`. */
export function descopeEventType(payload: unknown): string | undefined {
  if (!Array.isArray(payload) || payload.length === 0) return undefined;
  const actions = new Set(payload.map((e) => (e as { action?: unknown } | null)?.action));
  const [only] = actions;
  return actions.size === 1 && typeof only === 'string' ? only : 'batch';
}

const EVENT_TYPE_MAP: Record<string, string> = {
  UserCreated: 'user.created',
  UserModified: 'user.updated',
  UserDeleted: 'user.deleted',
  LoginSucceed: 'session.created',
  TenantCreated: 'organization.created',
  TenantDeleted: 'organization.deleted',
};

/**
 * Maps a Descope audit action onto the auth port's `AuthEventType`: `UserCreated`, `UserModified`, `UserDeleted`,
 * `LoginSucceed` (`session.created`), `TenantCreated` and `TenantDeleted` (a tenant is an organization). Every
 * other action passes through as it is.
 */
export function normalizeDescopeEventType(action: string): string {
  return EVENT_TYPE_MAP[action] ?? action;
}

/**
 * The delivery's events as the auth port's `AuthWebhookEvent`s. Descope gives audit events no id, so each `id` is
 * a digest of its action, user, actor and time: the same event delivered twice gets the same id.
 */
export function descopeAuthEvents(body: DescopeWebhookBody): AuthWebhookEvent[] {
  return body.map((event) => ({
    id: createHash('sha256').update(JSON.stringify([event.action, event.userId ?? null, event.actorId ?? null, event.occurred])).digest('hex'),
    type: normalizeDescopeEventType(event.action),
    provider: provider.id,
    data: { ...(event.data ?? {}), userId: event.userId ?? undefined, actorId: event.actorId ?? undefined, loginIds: event.loginIds ?? undefined },
    raw: event,
    timestamp: event.occurred,
  }));
}
