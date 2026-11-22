import { createHash, timingSafeEqual } from 'node:crypto';
import { AuthError, ConfigError } from '@mariachi/core';
import { type Secrets, type Verified, VerifiedWebhookAuth, type VerifiedWebhookAuthOptions, type WebhookHeaders, headerValue } from '@mariachi/webhooks';
import { provider } from './generated';
import { WebhookEvent } from './schemas';

export interface PipedriveWebhookAuthOptions extends Omit<VerifiedWebhookAuthOptions, 'secret'> {
  /** `PIPEDRIVE_WEBHOOK_USER`: the user name `webhooks.create` gave Pipedrive. */
  user: string;
  /** `PIPEDRIVE_WEBHOOK_PASSWORD`; or several while the webhooks are moved to a new one. */
  password: Secrets;
}

/**
 * Pipedrive's webhooks: they aren't signed, so a webhook is made with an HTTP Basic auth user name and password
 * (`webhooks.create` does), which Pipedrive sends with every delivery. This checks both, in constant time, and
 * answers anything else 401.
 *
 * Nothing in a delivery is signed, so the dedup key is the body's `meta.id`, the event's id. Whoever holds the
 * credentials can send any body, so trusting its id gives nothing more away.
 */
export class PipedriveWebhookAuth extends VerifiedWebhookAuth {
  private readonly user: string;

  constructor(options: PipedriveWebhookAuthOptions) {
    const { user, password, ...rest } = options;
    super({ ...rest, secret: password }, provider.id);
    if (!user?.trim()) throw new ConfigError('webhooks/invalid-secret', 'pipedrive webhook: no user name configured');
    this.user = user;
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Verified {
    const credentials = basicCredentials(headerValue(headers, 'authorization'));
    if (!credentials) throw new AuthError('webhooks/invalid-signature', 'pipedrive webhook: no Basic credentials');
    // Every comparison runs, so the time taken says nothing about which part was wrong
    const userOk = same(credentials.user, this.user);
    let passwordOk = false;
    for (const candidate of Array.isArray(secret) ? secret : [secret]) if (candidate && same(credentials.password, candidate)) passwordOk = true;
    if (!(userOk && passwordOk)) throw new AuthError('webhooks/invalid-signature', 'pipedrive webhook: wrong Basic credentials');
    const meta = metaOf(rawBody);
    return { eventId: meta?.id, metadata: { attempt: meta?.attempt } };
  }
}

/**
 * The authenticator for a `WebhookController` that receives Pipedrive.
 *
 * ```ts
 * class PipedriveWebhooks extends WebhookController {
 *   readonly prefix = 'pipedrive';
 *   readonly auth = pipedriveWebhookAuth({ user: config.pipedrive.webhookUser, password: config.pipedrive.webhookPassword });
 *   init() {
 *     this.post('events', { mode: 'queue', jobName: 'pipedrive-event', eventType: pipedriveEventType },
 *       async (_ctx, body) => PipedriveWebhookBody.parse(body));
 *   }
 * }
 * ```
 */
export function pipedriveWebhookAuth(options: PipedriveWebhookAuthOptions): PipedriveWebhookAuth {
  return new PipedriveWebhookAuth(options);
}

/**
 * What Pipedrive posts for a v2 webhook: `meta` (`action`, `entity`, `id`…), `data` and `previous`. Pipedrive
 * tries a failed delivery three more times (after 3, 30 and 150 seconds), with `meta.attempt` counting up.
 */
export const PipedriveWebhookBody = WebhookEvent;

/** The delivery's event type, `<entity>.<action>` (`deal.change`), for its span: `eventType: pipedriveEventType`. */
export function pipedriveEventType(payload: unknown): string | undefined {
  const meta = (payload as { meta?: { entity?: unknown; action?: unknown } } | null)?.meta;
  return typeof meta?.entity === 'string' && typeof meta.action === 'string' ? `${meta.entity}.${meta.action}` : undefined;
}

function basicCredentials(header: string | undefined): { user: string; password: string } | undefined {
  const match = /^Basic\s+([A-Za-z0-9+/=]+)\s*$/i.exec(header ?? '');
  if (!match) return undefined;
  const decoded = Buffer.from(match[1]!, 'base64').toString('utf8');
  const colon = decoded.indexOf(':');
  return colon < 0 ? undefined : { user: decoded.slice(0, colon), password: decoded.slice(colon + 1) };
}

/** Constant time whatever the lengths: both sides are hashed to the same length first. */
function same(a: string, b: string): boolean {
  return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
}

function metaOf(rawBody: Buffer): { id?: string; attempt?: number } | undefined {
  try {
    const meta = (JSON.parse(rawBody.toString('utf8')) as { meta?: { id?: unknown; attempt?: unknown } } | null)?.meta;
    return { id: typeof meta?.id === 'string' && meta.id ? meta.id : undefined, attempt: typeof meta?.attempt === 'number' ? meta.attempt : undefined };
  } catch {
    return undefined;
  }
}
