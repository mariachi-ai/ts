import { createHash, timingSafeEqual } from 'node:crypto';
import { ConfigError } from '@mariachi/core';
import type { IncomingRequest, RequestContext } from '@mariachi/server';
import { AuthController, type WebhookIdentity, headerValue } from '@mariachi/webhooks';
import { z } from 'zod';
import { provider } from './generated';

/**
 * Checks Drive's push notifications. They aren't signed: each carries back, in `X-Goog-Channel-Token`, the token
 * the app set when it started the channel (the `channelToken` setting), and this compares it in constant time.
 * Pass two tokens while rotating: channels started with the old one keep arriving until they expire. A
 * notification without the token is answered 401.
 *
 * The body is empty: what happened is in the headers, which this hands to the route as `identity.metadata`. Read
 * it with `GoogleDriveNotification.parse(ctx.identity.metadata)`.
 *
 * ```ts
 * class DriveWebhooks extends WebhookController {
 *   readonly prefix = 'google-drive';
 *   readonly auth = googleDriveChannelAuth(config.googleDrive.channelToken);
 *   init() {
 *     this.post('changes', { mode: 'queue', jobName: 'drive-changes', eventType: googleDriveEventType },
 *       async (ctx, _body) => GoogleDriveNotification.parse(ctx.identity.metadata));
 *   }
 * }
 * ```
 */
export class GoogleDriveChannelAuth extends AuthController {
  readonly provider = provider.id;
  private readonly digests: Buffer[];

  constructor(token: string | string[]) {
    super();
    const tokens = (Array.isArray(token) ? token : [token]).filter((t) => typeof t === 'string' && t.trim() !== '');
    if (tokens.length === 0) throw new ConfigError('webhooks/invalid-secret', 'google-drive webhook: no channel token configured');
    this.digests = tokens.map(digest);
  }

  async auth(req: IncomingRequest, ctx: RequestContext): Promise<WebhookIdentity | null> {
    const sent = headerValue(req.headers, 'x-goog-channel-token');
    // Digests have one length, so the comparison takes the same time whatever was sent; every token is compared
    const matched = sent ? this.digests.map((d) => timingSafeEqual(d, digest(sent))).includes(true) : false;
    const channelId = headerValue(req.headers, 'x-goog-channel-id');
    const resourceState = headerValue(req.headers, 'x-goog-resource-state');
    if (!matched || !channelId || !resourceState) {
      ctx.logger.warn({ provider: this.provider }, 'Drive notification without the channel token; rejecting');
      return null;
    }
    const messageNumber = headerValue(req.headers, 'x-goog-message-number');
    const changed = headerValue(req.headers, 'x-goog-changed');
    return {
      provider: this.provider,
      verified: true,
      // X-Goog-Message-Number identifies the message on its channel
      eventId: messageNumber ? `${channelId}:${messageNumber}` : undefined,
      metadata: {
        channelId,
        resourceId: headerValue(req.headers, 'x-goog-resource-id'),
        resourceState,
        messageNumber: messageNumber ? Number(messageNumber) : undefined,
        changed: changed ? changed.split(',').map((c) => c.trim()).filter(Boolean) : undefined,
        channelExpiration: headerValue(req.headers, 'x-goog-channel-expiration'),
      },
    };
  }
}

/** The authenticator for a WebhookController that receives Drive's change notifications. */
export function googleDriveChannelAuth(token: string | string[]): GoogleDriveChannelAuth {
  return new GoogleDriveChannelAuth(token);
}

/**
 * One notification, from its headers. `resourceState` is `sync` when a channel starts (nothing changed: ignore it)
 * and `change` when something did; Google may add states, so treat anything but `sync` as "list the changes".
 * It names no file: list the changes since the stored page token (`drive.changes.since`).
 */
export const GoogleDriveNotification = z
  .object({
    /** The channel's id, which the app chose: look up the page token stored with it. */
    channelId: z.string().min(1),
    resourceId: z.string().optional(),
    resourceState: z.string().min(1),
    messageNumber: z.number().int().optional(),
    /** Sometimes sent: `content`, `parents`, `children`, `permissions`. */
    changed: z.array(z.string()).optional(),
    /** When the channel expires, as Google writes it (a date in words). */
    channelExpiration: z.string().optional(),
  })
  .strip();
export type GoogleDriveNotification = z.infer<typeof GoogleDriveNotification>;

/** The notification's state, for its span: `eventType: googleDriveEventType` on the route. */
export function googleDriveEventType(payload: unknown): string | undefined {
  const state = (payload as { resourceState?: unknown } | null)?.resourceState;
  return typeof state === 'string' && /^[a-z_]{1,32}$/.test(state) ? state : undefined;
}

/** Whether the webhook's route got a real change rather than a channel's first `sync` message. */
export function isDriveChange(notification: Pick<GoogleDriveNotification, 'resourceState'>): boolean {
  return notification.resourceState !== 'sync';
}

function digest(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}
