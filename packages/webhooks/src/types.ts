import type { RequestContext } from '@mariachi/server';
import type { WebhookIdentity } from './auth/auth-controller';

export interface WebhookContext extends RequestContext {
  identity: WebhookIdentity;
}

export interface WebhookRouteOpts {
  /**
   * `queue`: the handler's result is enqueued as a job (`jobName`), answered 202. `direct`: it's the
   * input of a procedure (`procedure`), answered 200. `reply`: it's the answer itself, with nothing
   * dispatched, for a sender's check that the endpoint is theirs (Okta's verification challenge).
   */
  mode: 'direct' | 'queue' | 'reply';
  /** Procedure name for `@mariachi/communication`. Required when mode is 'direct'. */
  procedure?: string;
  /** Job name for `@mariachi/jobs`. Required when mode is 'queue'. */
  jobName?: string;
  /** Log retention duration, e.g. '7d', '30d', '90d'. */
  ttl?: string;
  /** Store the payload in the webhook log. Default true. Disable for PII-heavy providers. */
  logPayload?: boolean;
  /**
   * The delivery's event type, read from what the handler returned, for its span
   * (`mariachi.integration.event`): `(payload) => payload.type`. A name like `invoice.paid`, never an id.
   */
  eventType?: (payload: unknown) => string | undefined;
}

export type WebhookHandler = (
  ctx: WebhookContext,
  body: unknown,
  params: Record<string, string>,
  query: Record<string, string | string[]>,
) => Promise<unknown>;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface WebhookRouteDefinition {
  method: HttpMethod;
  path: string;
  opts: WebhookRouteOpts;
  handler: WebhookHandler;
  controllerPrefix: string;
}
