import { createHash, timingSafeEqual } from 'node:crypto';
import type { AuthWebhookEvent, AuthWebhookHandler } from '@mariachi/auth';
import { AuthError, ConfigError } from '@mariachi/core';
import type { IncomingRequest } from '@mariachi/server';
import { SignatureAuthController, type WebhookContext, WebhookController } from '@mariachi/webhooks';
import { provider } from './generated';
import { Auth0Event } from './schemas';

type Tokens = string | string[];

function tokenList(token: Tokens): string[] {
  const list = (Array.isArray(token) ? token : [token]).map((t) => t?.trim()).filter((t): t is string => Boolean(t));
  if (list.length === 0) throw new ConfigError('webhooks/invalid-secret', 'auth0 webhook: no event stream token configured');
  return list;
}

/**
 * Whether an `Authorization` header is `Bearer <token>` for one of the tokens, compared in constant time (both
 * sides are hashed first, so neither the length nor a prefix of the token leaks).
 */
export function auth0BearerMatches(header: string | undefined, token: Tokens): boolean {
  if (typeof header !== 'string') return false;
  const given = createHash('sha256').update(header).digest();
  let ok = false;
  for (const t of tokenList(token)) {
    ok = timingSafeEqual(given, createHash('sha256').update(`Bearer ${t}`).digest()) || ok;
  }
  return ok;
}

/**
 * The authenticator for a `WebhookController` that receives an Auth0 event stream. Auth0 signs nothing: a webhook
 * stream with Bearer Token authentication sends `Authorization: Bearer <token>`, the token chosen when the stream
 * was made, and that is what's checked. Pass two tokens while rotating. Anyone holding the token can post any body,
 * so keep it secret and the endpoint on HTTPS. Deduplicated on the event's `id` (`evt_…`).
 */
export class Auth0WebhookAuth extends SignatureAuthController {
  readonly provider = provider.id;
  readonly signatureHeader = 'authorization';
  private readonly tokens: string[];

  constructor(token: Tokens) {
    super();
    this.tokens = tokenList(token);
  }

  protected override signingSecrets(): string[] {
    return this.tokens;
  }

  protected verifySignature(header: string, _rawBody: Buffer, token: string): boolean {
    return auth0BearerMatches(header, token);
  }

  /** The event's own id: Auth0 redelivers a failed event with the same one. */
  protected override dedupKey(rawBody: Buffer, req: IncomingRequest): string | undefined {
    const id = eventId(rawBody);
    return id ? `event:${id}` : super.dedupKey(rawBody, req);
  }
}

/** `readonly auth = auth0WebhookAuth(config.auth0.eventStreamToken)` on a `WebhookController`. */
export function auth0WebhookAuth(token: Tokens): Auth0WebhookAuth {
  return new Auth0WebhookAuth(token);
}

/** What an event stream posts: a CloudEvent with the user under `data.object`. */
export const Auth0WebhookBody = Auth0Event;

/** Auth0's event type without the `com.auth0.` prefix some of its pages show: `user.created`. */
export function normalizeAuth0EventType(type: string): string {
  return type.replace(/^com\.auth0\./, '');
}

/** The delivery's event type, for its span: `eventType: auth0EventType` on the route. */
export function auth0EventType(payload: unknown): string | undefined {
  const type = (payload as { type?: unknown } | null)?.type;
  return typeof type === 'string' ? normalizeAuth0EventType(type) : undefined;
}

/**
 * An event stream's event as the auth port's `AuthWebhookEvent`: `user.created`, `user.updated` and `user.deleted`
 * (as `AUTH_EVENT_TYPES` names them) with the user record (`user_id`, `email`, `email_verified`, …) as `data`.
 * Other event types pass through under their own names. User events belong to no tenant.
 */
export function normalizeAuth0Event(event: Auth0Event): AuthWebhookEvent {
  const time = event.time ? Date.parse(event.time) : Number.NaN;
  return {
    id: event.id,
    type: normalizeAuth0EventType(event.type),
    provider: provider.id,
    data: (event.data.object ?? {}) as Record<string, unknown>,
    raw: event,
    timestamp: Number.isNaN(time) ? undefined : time,
  };
}

/**
 * `AuthWebhookHandler` for `createAuthWebhookDispatcher` (from `@mariachi/auth`), which dispatches each event to
 * `auth.user.created` and so on. Checks the bearer token like `Auth0WebhookAuth`.
 */
export class Auth0WebhookHandler implements AuthWebhookHandler {
  private readonly tokens: string[];

  constructor(config: { token: Tokens }) {
    try {
      this.tokens = tokenList(config.token);
    } catch {
      throw new AuthError('auth/invalid-config', 'Auth0 webhooks: the event stream token is required');
    }
  }

  verify(rawBody: string | Buffer, headers: Record<string, string | string[] | undefined>): AuthWebhookEvent {
    const raw = headers.authorization ?? Object.entries(headers).find(([k]) => k.toLowerCase() === 'authorization')?.[1];
    const header = Array.isArray(raw) ? raw[0] : raw;
    if (!header) throw new AuthError('auth/webhook-verification-failed', 'Missing Authorization header');
    if (!auth0BearerMatches(header, this.tokens)) throw new AuthError('auth/webhook-verification-failed', 'Auth0 event stream token invalid');
    let body: unknown;
    try {
      body = JSON.parse(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'));
    } catch {
      throw new AuthError('auth/webhook-invalid-payload', 'Auth0 webhook body is not JSON');
    }
    const parsed = Auth0Event.safeParse(body);
    if (!parsed.success) throw new AuthError('auth/webhook-invalid-payload', 'Auth0 webhook body is not an event');
    return normalizeAuth0Event(parsed.data);
  }
}

export interface Auth0WebhookControllerConfig {
  /** The event stream's bearer token (`AUTH0_EVENT_STREAM_TOKEN`), or two while rotating. */
  token: Tokens;
  /**
   * The procedure each event is passed to, as an `AuthWebhookEvent` (`{ id, type, data, … }`), to route on `type`.
   * Default `auth.auth0.webhook`.
   */
  procedure?: string;
  /** Turns the event into what the procedure receives, in place of the normalized event. */
  transform?: (ctx: WebhookContext, event: AuthWebhookEvent) => Promise<unknown>;
}

/**
 * Receives an Auth0 webhook event stream through `WebhookServer`: one `POST /auth0/events` route that checks the
 * bearer token, parses the event and passes it, normalized, to a procedure. Point the stream at
 * `https://<app>/<webhooks prefix>/auth0/events`.
 */
export class Auth0WebhookController extends WebhookController {
  readonly prefix = 'auth0';
  readonly auth: Auth0WebhookAuth;
  private readonly procedure: string;
  private readonly transform?: Auth0WebhookControllerConfig['transform'];

  constructor(config: Auth0WebhookControllerConfig) {
    super();
    this.auth = new Auth0WebhookAuth(config.token);
    this.procedure = config.procedure ?? 'auth.auth0.webhook';
    this.transform = config.transform;
  }

  init(): void {
    this.post('events', { mode: 'direct', procedure: this.procedure, eventType: auth0EventType }, async (ctx, body) => {
      const event = normalizeAuth0Event(Auth0WebhookBody.parse(body));
      return this.transform ? this.transform(ctx, event) : event;
    });
  }
}

function eventId(rawBody: Buffer): string | undefined {
  try {
    const id = (JSON.parse(rawBody.toString('utf8')) as { id?: unknown } | null)?.id;
    return typeof id === 'string' && id ? id : undefined;
  } catch {
    return undefined;
  }
}
