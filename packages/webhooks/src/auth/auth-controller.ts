import type { HttpResponse, IncomingRequest, RequestContext } from '@mariachi/server';

export interface WebhookIdentity {
  provider: string;
  verified: boolean;
  /** Tenant the delivery belongs to (resolved from the signing secret, path, or payload). */
  tenantId?: string;
  /** Provider event/delivery id, used for deduplication when an idempotency store is configured. */
  eventId?: string;
  metadata?: Record<string, unknown>;
}

export abstract class AuthController {
  /** Return null when the request is not authentic. Never trust `req.body` for signatures; use `req.rawBody`. */
  abstract auth(req: IncomingRequest, ctx: RequestContext): Promise<WebhookIdentity | null>;

  /**
   * Answers a sender's check that the endpoint is the app's, before any delivery: Microsoft Graph's
   * `validationToken`, Okta's `x-okta-verification-challenge`. Return the response for that check, or nothing for
   * an ordinary delivery, which then goes through `auth`. A sender that authenticates its check (Okta sends its
   * secret) is checked here too: return `undefined` when it doesn't verify, and the request is refused by `auth`.
   * The check never reaches the route's handler, a procedure or a job, and isn't deduplicated or logged as a delivery.
   */
  handshake?(req: IncomingRequest, ctx: RequestContext): HttpResponse | undefined | Promise<HttpResponse | undefined>;
}
