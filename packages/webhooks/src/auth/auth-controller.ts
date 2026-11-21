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
   * Answers a sender's check that the endpoint is the app's, before any delivery is authenticated: Microsoft
   * Graph's `validationToken`, for one. Return the response for that check, or nothing for an ordinary delivery,
   * which then goes through `auth`. The check never reaches the route's handler, a procedure or a job.
   */
  handshake?(req: IncomingRequest): HttpResponse | undefined;
}
