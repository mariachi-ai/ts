import { randomUUID } from 'node:crypto';
import type { Html } from '@mariachi/api-facade';
import { type Context, fromZodError } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import { SignJWT } from 'jose';
import { z } from 'zod';
import { ZendeskError, settingError } from './errors';
import { type ZendeskConfig, type ZendeskOperation, configSchema, errorMap, operations, provider } from './generated';
import {
  AccessTokenResponse,
  AddCommentInput,
  type ChatIdentity,
  ChatUser,
  type Comment,
  CommentPage,
  CreateOrUpdateOrganizationInput,
  CreateOrUpdateUserInput,
  CreateTicketInput,
  ListCommentsInput,
  ListRequestedInput,
  Organization,
  SearchTicketsInput,
  SearchUsersInput,
  Ticket,
  TicketPage,
  TicketSearchPage,
  TrackEventInput,
  TrackEventsInput,
  UpdateTicketInput,
  UpsertContactInput,
  User,
  UserPage,
} from './schemas';
import { type WidgetSnippetOptions, zendeskWidgetSnippet } from './widget';

export interface ZendeskDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

/** An access token is fetched again this long before it expires. */
const TOKEN_MARGIN_MS = 60_000;
/** How long a messaging JWT lasts by default. Zendesk advises short-lived ones. */
const DEFAULT_IDENTITY_TTL_SECONDS = 600;

type Request = Omit<ProviderRequest, 'url' | 'headers'> & { path: string };

/**
 * Zendesk for an app: the messaging Web Widget for its pages and who is signed in to it, and the Support API (users,
 * organizations, tickets and their comments, timeline events). Each Support API operation takes `ctx` first, checks
 * its input and Zendesk's answer, and makes one span (`zendesk tickets.create`). Build it once at startup and share
 * it: it keeps the OAuth access token.
 *
 * ```ts
 * const zendesk = createZendesk(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * const identity = await zendesk.chatIdentity({ id: user.id, email: user.email, emailVerified: true, name: user.name });
 * html`<body>…${zendesk.widgetSnippet({ identity, tokenUrl: '/chat/token' })}</body>`
 * ```
 *
 * The Support API signs in with the OAuth client (`ZENDESK_CLIENT_ID` and `ZENDESK_CLIENT_SECRET`, the client
 * credentials grant), or else a legacy API token (`ZENDESK_EMAIL` and `ZENDESK_API_TOKEN`), which Zendesk stops
 * accepting on April 30, 2027. The widget needs neither.
 */
export function createZendesk(config: ZendeskConfig, deps: ZendeskDeps = {}) {
  const cfg = configSchema.parse(config);
  const subdomain = checkedSubdomain(cfg.subdomain);
  const server = `${subdomain}.zendesk.com`;
  const base = `https://${server}`;
  if (cfg.eventSource?.toLowerCase() === 'zendesk') throw settingError('invalid-event-source', 'ZENDESK_EVENT_SOURCE can be anything but zendesk, which Zendesk keeps for its own events');
  const eventSource = cfg.eventSource ?? 'app';

  function call<T>(ctx: Context, operation: ZendeskOperation, request: Request, schema: z.ZodType<T, z.ZodTypeDef, unknown>, authorization: string | undefined, fetchImpl?: typeof fetch): Promise<T> {
    const { path, ...rest } = request;
    // A read, or a create-or-update of the same thing, is safe to repeat after an outage. A ticket update with a
    // comment, or an event, isn't: those are retried only after a rate limit (Zendesk refused them before acting).
    const idempotency = operations[operation].idempotency;
    const retry = idempotency === 'natural' ? { unsafe: false } : idempotency === 'none' ? { unsafe: true } : {};
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server },
      { ...rest, url: `${base}${path}`, headers: authorization ? { authorization } : {} },
      { schema, error: ZendeskError, failure, deps: { ...deps, fetch: fetchImpl ?? deps.fetch, retry: { ...retry, ...deps.retry } } },
    );
  }

  /** A Support API call, signed in. A token Zendesk refuses is fetched again on the next call. */
  async function api<T>(ctx: Context, operation: ZendeskOperation, request: Request, schema: z.ZodType<T, z.ZodTypeDef, unknown>, fetchImpl?: typeof fetch): Promise<T> {
    const authorization = await authorize(ctx);
    try {
      return await call(ctx, operation, request, schema, authorization, fetchImpl);
    } catch (error) {
      if (error instanceof ZendeskError && error.category === 'unauthorized') cached = undefined;
      throw error;
    }
  }

  /** The call, and the HTTP status Zendesk answered with (create-or-update says 201 for created, 200 for updated). */
  async function apiWithStatus<T>(ctx: Context, operation: ZendeskOperation, request: Request, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<{ body: T; status: number }> {
    let status = 0;
    const underlying = deps.fetch ?? fetch;
    const seen: typeof fetch = async (input, init) => {
      const response = await underlying(input, init);
      status = response.status;
      return response;
    };
    const body = await api(ctx, operation, request, schema, seen);
    return { body, status };
  }

  let cached: { value: string; expiresAt: number } | undefined;
  let pending: Promise<string> | undefined;

  /** The Authorization header: a Bearer token from the OAuth client, reused until shortly before it expires, or Basic with the API token. */
  function authorize(ctx: Context): Promise<string> {
    if (cfg.clientId && cfg.clientSecret) {
      if (cached && cached.expiresAt - TOKEN_MARGIN_MS > Date.now()) return Promise.resolve(`Bearer ${cached.value}`);
      const { clientId, clientSecret } = cfg;
      pending ??= (async () => {
        const started = Date.now();
        const res = await call(
          ctx,
          'oauth.token',
          { method: 'POST', path: '/oauth/tokens', form: { grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret } },
          AccessTokenResponse,
          // No Authorization header: the client's secret is the credential
          undefined,
        );
        // Without expires_in (a client made before April 30, 2026) the token lasts until it's revoked
        cached = { value: res.access_token, expiresAt: res.expires_in ? started + res.expires_in * 1000 : Number.POSITIVE_INFINITY };
        return res.access_token;
      })().finally(() => {
        pending = undefined;
      });
      return pending.then((token) => `Bearer ${token}`);
    }
    if (cfg.email && cfg.apiToken) return Promise.resolve(`Basic ${Buffer.from(`${cfg.email}/token:${cfg.apiToken}`).toString('base64')}`);
    return Promise.reject(
      settingError(
        'no-credentials',
        'Set ZENDESK_CLIENT_ID and ZENDESK_CLIENT_SECRET (Admin Center › Apps and integrations › APIs › OAuth clients, a confidential client) to call the Support API',
      ),
    );
  }

  const users = {
    /**
     * Creates the user, or updates the one with this `externalId` (or else `email`). `created` says which. Zendesk
     * allows 5 of these a minute per user: a burst for one user waits for the rate limit.
     */
    async createOrUpdate(ctx: Context, input: CreateOrUpdateUserInput): Promise<{ user: User; created: boolean }> {
      const i = parse(CreateOrUpdateUserInput, input);
      const user = compact({
        external_id: i.externalId,
        email: i.email,
        name: i.name,
        phone: i.phone,
        organization_id: i.organizationId,
        user_fields: i.userFields,
        tags: i.tags,
        skip_verify_email: i.skipVerifyEmail,
      });
      const { body, status } = await apiWithStatus(ctx, 'users.createOrUpdate', { method: 'POST', path: '/api/v2/users/create_or_update', json: { user } }, z.object({ user: User }).passthrough());
      return { user: body.user, created: status === 201 };
    },
    async get(ctx: Context, userId: number): Promise<User> {
      return api(ctx, 'users.get', { method: 'GET', path: `/api/v2/users/${id(userId)}` }, z.object({ user: User }).passthrough()).then((r) => r.user);
    },
    /** Users with this exact `externalId`, or matching a `query` in Zendesk's search syntax; a page at a time. */
    async search(ctx: Context, input: SearchUsersInput) {
      const i = parse(SearchUsersInput, input);
      return api(ctx, 'users.search', { method: 'GET', path: '/api/v2/users/search', query: { external_id: i.externalId, query: i.query, page: i.page, per_page: i.perPage } }, UserPage);
    },
  };

  const organizations = {
    /** Creates the organization, or updates the one with this `externalId` (or `id`). Zendesk never matches by name. */
    async createOrUpdate(ctx: Context, input: CreateOrUpdateOrganizationInput): Promise<Organization> {
      const i = parse(CreateOrUpdateOrganizationInput, input);
      const organization = compact({ id: i.id, external_id: i.externalId, name: i.name, domain_names: i.domainNames, organization_fields: i.organizationFields, tags: i.tags });
      return api(ctx, 'organizations.createOrUpdate', { method: 'POST', path: '/api/v2/organizations/create_or_update', json: { organization } }, z.object({ organization: Organization }).passthrough()).then(
        (r) => r.organization,
      );
    },
  };

  const tickets = {
    /**
     * Creates a ticket, its first comment its description. Sent with an `Idempotency-Key`, so a retry gives back the
     * same ticket (for two hours); the same key with another body fails with `zendesk/idempotency-key-reused`.
     */
    async create(ctx: Context, input: CreateTicketInput): Promise<Ticket> {
      const i = parse(CreateTicketInput, input);
      const ticket = compact({
        subject: i.subject,
        comment: comment(i.comment),
        requester_id: i.requesterId,
        requester: i.requester,
        priority: i.priority,
        type: i.type,
        tags: i.tags,
        external_id: i.externalId,
        custom_fields: i.customFields,
      });
      return api(
        ctx,
        'tickets.create',
        { method: 'POST', path: '/api/v2/tickets', json: { ticket }, idempotencyKey: { header: 'Idempotency-Key', value: i.idempotencyKey ?? randomUUID() } },
        z.object({ ticket: Ticket }).passthrough(),
      ).then((r) => r.ticket);
    },
    async get(ctx: Context, ticketId: number): Promise<Ticket> {
      return api(ctx, 'tickets.get', { method: 'GET', path: `/api/v2/tickets/${id(ticketId)}` }, z.object({ ticket: Ticket }).passthrough()).then((r) => r.ticket);
    },
    /** Changes what's given, optionally with a comment. Retried only after a rate limit, so a comment is never added twice. */
    async update(ctx: Context, input: UpdateTicketInput): Promise<Ticket> {
      const i = parse(UpdateTicketInput, input);
      const ticket = compact({
        status: i.status,
        priority: i.priority,
        type: i.type,
        subject: i.subject,
        tags: i.tags,
        assignee_id: i.assigneeId,
        custom_fields: i.customFields,
        comment: i.comment ? comment(i.comment) : undefined,
      });
      return api(ctx, 'tickets.update', { method: 'PUT', path: `/api/v2/tickets/${id(i.ticketId)}`, json: { ticket } }, z.object({ ticket: Ticket }).passthrough()).then((r) => r.ticket);
    },
    /** One page (25 by default) of the tickets a user requested: pass `meta.after_cursor` as `after` while `meta.has_more`. */
    async listRequested(ctx: Context, input: ListRequestedInput) {
      const i = parse(ListRequestedInput, input);
      return api(
        ctx,
        'tickets.listRequested',
        { method: 'GET', path: `/api/v2/users/${id(i.userId)}/tickets/requested`, query: { 'page[size]': i.pageSize ?? 25, 'page[after]': i.after, sort: i.sort } },
        TicketPage,
      );
    },
    /** Tickets matching `query` in Zendesk's search syntax (`type:ticket` is added), a page at a time, at most 1,000 in all. */
    async search(ctx: Context, input: SearchTicketsInput) {
      const i = parse(SearchTicketsInput, input);
      return api(
        ctx,
        'tickets.search',
        { method: 'GET', path: '/api/v2/search', query: { query: `type:ticket ${i.query}`, page: i.page, per_page: i.perPage, sort_by: i.sortBy, sort_order: i.sortOrder } },
        TicketSearchPage,
      );
    },
  };

  const comments = {
    /** One page of a ticket's comments, oldest first by default. */
    async list(ctx: Context, input: ListCommentsInput) {
      const i = parse(ListCommentsInput, input);
      return api(
        ctx,
        'comments.list',
        { method: 'GET', path: `/api/v2/tickets/${id(i.ticketId)}/comments`, query: { 'page[size]': i.pageSize ?? 100, 'page[after]': i.after, sort: i.sort } },
        CommentPage,
      );
    },
    /** Every comment on the ticket, fetching pages as they're read. Stop early with `break`. */
    async *all(ctx: Context, input: Omit<ListCommentsInput, 'after'>): AsyncGenerator<Comment> {
      let after: string | undefined;
      for (;;) {
        const page = await comments.list(ctx, { ...input, after });
        yield* page.comments;
        if (!page.meta.has_more || !page.meta.after_cursor) return;
        after = page.meta.after_cursor;
      }
    },
    /** A public reply (the requester is emailed) or, with `public: false`, an internal note. Never retried after an outage. */
    async add(ctx: Context, input: AddCommentInput): Promise<Ticket> {
      const i = parse(AddCommentInput, input);
      const { ticketId, ...c } = i;
      return api(ctx, 'comments.add', { method: 'PUT', path: `/api/v2/tickets/${id(ticketId)}`, json: { ticket: { comment: comment(c) } } }, z.object({ ticket: Ticket }).passthrough()).then((r) => r.ticket);
    },
  };

  const events = {
    /**
     * Records an event in the user's timeline in Agent Workspace (the Events API, on Suite Team and above). The event
     * belongs to a profile with source `ZENDESK_EVENT_SOURCE` and type `user`, found by the user's external_id;
     * Zendesk makes the profile, and an anonymous user when no user has that external_id, so `upsertContact` first.
     */
    async track(ctx: Context, input: TrackEventsInput): Promise<void> {
      const i = parse(TrackEventsInput, input);
      await api(
        ctx,
        'events.track',
        {
          method: 'POST',
          path: '/api/v2/user_profiles/events',
          json: {
            profile: { source: eventSource, type: 'user', identifiers: [{ type: 'external_id', value: i.userId }] },
            event: compact({ source: eventSource, type: i.type, properties: i.properties, description: i.description, created_at: i.createdAt?.toISOString() }),
          },
        },
        z.unknown(),
      );
    },
  };

  return {
    users,
    organizations,
    tickets,
    comments,
    events,

    /**
     * The user, signed for the Web Widget: a messaging JWT (HS256 with `ZENDESK_MESSAGING_SECRET`, `kid`
     * `ZENDESK_MESSAGING_KEY_ID`) with `scope: "user"`, `external_id` (the user's id), `name` and an `exp`. The widget
     * signs them in with it, so their conversations follow them across devices, and agents see them as verified.
     * Make it on the server, per request; the secret never goes to a page.
     *
     * - The email goes in only with `emailVerified: true`, as `email_verified`: Zendesk trusts it as the user's.
     * - Zendesk keeps the `name` from a user's first sign-in only.
     * - `createdAt` and `company` aren't in Zendesk's JWT: set them with `upsertContact` and `organizations`.
     */
    async chatIdentity(user: ChatUser, options: { ttlSeconds?: number } = {}): Promise<ChatIdentity> {
      const u = parse(ChatUser, user);
      if (!cfg.messagingKeyId || !cfg.messagingSecret) {
        throw settingError(
          'no-messaging-key',
          'Set ZENDESK_MESSAGING_KEY_ID and ZENDESK_MESSAGING_SECRET to sign users in to the widget: Admin Center › Account › Security › End user authentication › Messaging › Create key',
        );
      }
      const ttl = options.ttlSeconds ?? DEFAULT_IDENTITY_TTL_SECONDS;
      if (!Number.isInteger(ttl) || ttl < 30 || ttl > 86_400) throw settingError('invalid-ttl', 'ttlSeconds is a whole number of seconds from 30 to 86400');
      const exp = Math.floor(Date.now() / 1000) + ttl;
      const claims: Record<string, unknown> = { scope: 'user', external_id: u.id };
      if (u.name) claims.name = u.name;
      if (u.email && u.emailVerified === true) Object.assign(claims, { email: u.email, email_verified: true });
      const token = await new SignJWT(claims)
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT', kid: cfg.messagingKeyId })
        .setExpirationTime(exp)
        .sign(new TextEncoder().encode(cfg.messagingSecret));
      return { provider: 'zendesk', userId: u.id, token, expiresAt: new Date(exp * 1000) };
    },

    /**
     * The Web Widget for a page: Zendesk's snippet and the setup script this package ships (a Mariachi page runs no
     * inline script), which sets what the widget may store and, given `identity`, signs the user in. Put it at the end
     * of the layout's `<body>`, serve the setup script, and send the page with `zendeskCsp()`:
     *
     * ```ts
     * api.withStaticFile('/assets/lib/zendesk-messenger.js', packageFile('@mariachi/integration-zendesk/zendesk-messenger.js'));
     * htmlResponse(page, { csp: zendeskCsp() });
     * ```
     *
     * The widget stores cookies and local storage (essential, functional and, with `cookies: 'all'`, analytics). Where
     * the visitor must agree first, render the snippet only once they have, with their choice as `cookies`.
     */
    widgetSnippet(options: WidgetSnippetOptions = {}): Html {
      return zendeskWidgetSnippet(cfg.widgetKey ?? '', options);
    },

    /**
     * The user as a Zendesk user, matched by external_id (`id`): created, or updated. `attributes` are custom user
     * fields, which must exist in the account. Zendesk needs a `name` to create a user. Returns Zendesk's id for them.
     */
    async upsertContact(ctx: Context, input: UpsertContactInput): Promise<{ id: string; created: boolean }> {
      const i = parse(UpsertContactInput, input);
      const { user, created } = await users.createOrUpdate(ctx, { externalId: i.id, email: i.email, name: i.name, userFields: i.attributes });
      return { id: String(user.id), created };
    },

    /** The event in the user's timeline in Agent Workspace: `events.track` with `name` as its type and `metadata` as its properties. */
    async trackEvent(ctx: Context, input: TrackEventInput): Promise<void> {
      const i = parse(TrackEventInput, input);
      await events.track(ctx, { userId: i.userId, type: i.name, properties: i.metadata ?? {} });
    },
  };
}

export type Zendesk = ReturnType<typeof createZendesk>;

/**
 * Zendesk's error body is `{ error, description, details }`. `error` is kept when it's a code (`RecordNotFound`,
 * `invalid_token`), never when it's a sentence; `description` and `details` aren't (they can echo the input).
 */
function failure(_status: number, body: unknown): FailureInfo | undefined {
  const error = typeof body === 'object' && body !== null ? (body as { error?: unknown }).error : undefined;
  const code = typeof error === 'string' && /^[A-Za-z][A-Za-z_]{1,63}$/.test(error) ? error : undefined;
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

function comment(c: { body?: string; htmlBody?: string; public?: boolean; authorId?: number }) {
  return compact({ body: c.body, html_body: c.htmlBody, public: c.public, author_id: c.authorId });
}

/** Leaves out what wasn't given, so an update changes only what the app named. `null` is kept: it clears a field. */
function compact<T extends Record<string, unknown>>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Zendesk input');
  return parsed.data;
}

/** A Zendesk id as it goes in a path: a positive whole number. */
function id(value: number): string {
  return String(parse(z.number().int().positive().safe(), value));
}

/** `acme` from `acme`, `acme.zendesk.com` or `https://acme.zendesk.com/`; anything else is refused. */
export function checkedSubdomain(value: string): string {
  const sub = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
    .replace(/\.zendesk\.com$/, '');
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(sub)) {
    throw settingError('invalid-subdomain', 'ZENDESK_SUBDOMAIN is the first part of the account address: acme for https://acme.zendesk.com');
  }
  return sub;
}
