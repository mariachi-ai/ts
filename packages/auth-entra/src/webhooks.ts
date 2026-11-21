import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { AuthError } from '@mariachi/core';
import type { AuthWebhookEvent } from '@mariachi/auth';
import { type HttpResponse, type IncomingRequest, type RequestContext, httpResponse } from '@mariachi/server';
import { AuthController, type WebhookIdentity } from '@mariachi/webhooks';
import { provider } from './generated';
import { type ChangeNotification, EntraNotificationBody } from './schemas';

export { EntraNotificationBody };

/**
 * The authenticator for a `WebhookController` that receives Microsoft Graph change notifications. Graph signs
 * nothing: each notification carries the `clientState` the app gave when it subscribed, and every one in the
 * delivery must match it (compared in constant time) or the delivery is answered 401. Pass two values while
 * rotating.
 *
 * It also answers Graph's validation handshake: a POST with `?validationToken=` and no body, answered 200 with the
 * token as `text/plain`, before Graph creates a subscription.
 */
export class EntraWebhookAuth extends AuthController {
  readonly provider = provider.id;
  private readonly secrets: Buffer[];

  constructor(clientState: string | string[]) {
    super();
    const values = (Array.isArray(clientState) ? clientState : [clientState]).filter((s) => typeof s === 'string' && s.trim() !== '');
    if (values.length === 0) throw new AuthError('auth/invalid-config', 'Entra webhooks: the clientState (ENTRA_WEBHOOK_CLIENT_STATE) is required');
    if (values.some((s) => s.length > 128)) throw new AuthError('auth/invalid-config', 'Entra webhooks: Graph allows a clientState of at most 128 characters');
    this.secrets = values.map(digest);
  }

  handshake(req: IncomingRequest, _ctx?: RequestContext): HttpResponse | undefined {
    const token = req.query.validationToken;
    if (typeof token !== 'string' || !token || (req.rawBody && req.rawBody.length > 0)) return undefined;
    // Graph never sends markup; refusing it keeps the echo from being a reflection point.
    if (token.length > 4096 || /[<>]/.test(token) || [...token].some((c) => c.charCodeAt(0) < 0x20)) return undefined;
    return httpResponse(200, token, { 'content-type': 'text/plain; charset=utf-8' });
  }

  async auth(req: IncomingRequest, ctx: RequestContext): Promise<WebhookIdentity | null> {
    if (!req.rawBody || req.rawBody.length === 0) {
      ctx.logger.warn({ provider: this.provider }, 'webhook has no raw body; rejecting');
      return null;
    }
    let parsed: ReturnType<typeof EntraNotificationBody.safeParse>;
    try {
      parsed = EntraNotificationBody.safeParse(JSON.parse(req.rawBody.toString('utf8')));
    } catch {
      return null;
    }
    if (!parsed.success) return null;
    const notifications = parsed.data.value;
    const ok = notifications.every((n) => {
      if (typeof n.clientState !== 'string') return false;
      const given = digest(n.clientState);
      // Every secret is compared, so the time taken doesn't say which matched.
      return this.secrets.reduce((match, secret) => timingSafeEqual(given, secret) || match, false);
    });
    if (!ok) {
      ctx.logger.warn({ provider: this.provider }, 'Graph notification clientState rejected');
      return null;
    }
    // Graph gives notifications an id where it can; otherwise the delivery's bytes are its identity.
    const ids = notifications.map((n) => n.id);
    const eventId = ids.every((id): id is string => typeof id === 'string' && id.length > 0)
      ? createHash('sha256').update(ids.sort().join('\n')).digest('hex')
      : createHash('sha256').update(req.rawBody).digest('hex');
    return { provider: this.provider, verified: true, eventId, metadata: { notifications: notifications.length } };
  }
}

/** `entraWebhookAuth(config.entra.webhookClientState)`: see `EntraWebhookAuth`. */
export function entraWebhookAuth(clientState: string | string[]): EntraWebhookAuth {
  return new EntraWebhookAuth(clientState);
}

/** The delivery's change type for its span (`updated`, `deleted`), when its notifications agree on one. */
export function entraEventType(payload: unknown): string | undefined {
  const value = (payload as { value?: Array<{ changeType?: unknown }> } | null)?.value;
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const types = new Set(value.map((n) => n?.changeType));
  const [type] = types;
  return types.size === 1 && typeof type === 'string' && /^[a-z]+$/.test(type) ? type : undefined;
}

/**
 * The delivery's notifications about users, as the auth port's events: `updated` is `user.updated` (Graph sends
 * a user's creation, change and soft delete all as `updated`, so there's no `user.created`) and `deleted` is
 * `user.deleted` (deleted for good). `data` is `{ id }`, the user's object id: Graph sends ids, never the user, so
 * read the user with `EntraIdentityClient.getUser` (null once it's soft-deleted). Other resources are skipped. The
 * event's `id` is Graph's notification id when it gives one; the delivery itself is deduplicated by `WebhookServer`.
 */
export function entraAuthEvents(body: EntraNotificationBody): AuthWebhookEvent[] {
  const events: AuthWebhookEvent[] = [];
  for (const n of body.value) {
    const type = n.changeType === 'updated' ? 'user.updated' : n.changeType === 'deleted' ? 'user.deleted' : undefined;
    const id = userId(n);
    if (!type || !id) continue;
    events.push({
      // Without Graph's id two updates of one user look alike, so they get ids of their own rather than collapse
      id: n.id ?? randomUUID(),
      type,
      provider: provider.id,
      data: { id },
      raw: n,
    });
  }
  return events;
}

function userId(n: ChangeNotification): string | undefined {
  const odataType = n.resourceData?.['@odata.type']?.toLowerCase();
  const isUser = odataType === '#microsoft.graph.user' || /^\/?users\//i.test(n.resource);
  if (!isUser) return undefined;
  return n.resourceData?.id ?? /^\/?users\/([^/@]+)/i.exec(n.resource)?.[1];
}

function digest(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}
