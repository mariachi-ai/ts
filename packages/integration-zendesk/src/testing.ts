/**
 * `@mariachi/integration-zendesk/testing`: a Zendesk for an app's tests, held in memory, with the same shape as
 * `createZendesk`'s client; and signed webhook deliveries to post to the app's endpoint.
 */
import { createHmac, randomUUID } from 'node:crypto';
import { NotFoundError, ValidationError } from '@mariachi/core';
import type { Zendesk } from './client';
import type { Comment, Organization, Ticket, User, ZendeskEvent } from './schemas';
import { zendeskWidgetSnippet } from './widget';

export interface TrackedEvent {
  userId: string;
  type: string;
  properties: Record<string, unknown>;
}

export interface FakeZendesk extends Zendesk {
  users_: Map<number, User>;
  organizations_: Map<number, Organization>;
  tickets_: Map<number, Ticket>;
  comments_: Map<number, Comment[]>;
  /** Every event `events.track` or `trackEvent` recorded, in order. */
  events_: TrackedEvent[];
}

/**
 * An in-memory Zendesk: seed users and tickets, hand it to the code under test in place of the client, then read
 * what it did from `users_`, `tickets_`, `comments_` and `events_`. `chatIdentity` gives an unsigned stand-in token
 * (`fake.<userId>`), and `widgetSnippet` renders the real markup with the widget key `test-widget-key`.
 */
export function fakeZendesk(seed: { users?: User[]; tickets?: Ticket[] } = {}): FakeZendesk {
  let next = 1000;
  const now = () => new Date().toISOString();
  const users_ = new Map((seed.users ?? []).map((u) => [u.id, u]));
  const organizations_ = new Map<number, Organization>();
  const tickets_ = new Map((seed.tickets ?? []).map((t) => [t.id, t]));
  const comments_ = new Map<number, Comment[]>();
  const events_: TrackedEvent[] = [];
  const ticketOf = (id: number) => {
    const ticket = tickets_.get(id);
    if (!ticket) throw new NotFoundError('zendesk ticket', String(id));
    return ticket;
  };
  const addComment = (ticketId: number, c: { body?: string; htmlBody?: string; public?: boolean; authorId?: number }, authorId: number) => {
    const list = comments_.get(ticketId) ?? [];
    list.push({ id: next++, type: 'Comment', body: c.body ?? c.htmlBody ?? '', html_body: c.htmlBody, public: c.public ?? true, author_id: c.authorId ?? authorId, attachments: [], created_at: now() });
    comments_.set(ticketId, list);
  };
  const byExternalId = (externalId: string) => [...users_.values()].find((u) => u.external_id?.toLowerCase() === externalId.toLowerCase());

  const fake: FakeZendesk = {
    users_,
    organizations_,
    tickets_,
    comments_,
    events_,
    users: {
      async createOrUpdate(_ctx, input) {
        if (!input.externalId && !input.email) throw new ValidationError('give externalId or email');
        const existing = (input.externalId ? byExternalId(input.externalId) : undefined) ?? [...users_.values()].find((u) => input.email && u.email === input.email);
        if (!existing && !input.name) throw new ValidationError('Zendesk needs a name to create a user');
        const user: User = {
          ...(existing ?? { id: next++, role: 'end-user', created_at: now() }),
          name: input.name ?? existing?.name ?? '',
          email: existing?.email ?? input.email ?? null,
          external_id: input.externalId ?? existing?.external_id ?? null,
          organization_id: input.organizationId ?? existing?.organization_id ?? null,
          user_fields: { ...existing?.user_fields, ...input.userFields },
          tags: input.tags ?? existing?.tags ?? [],
          updated_at: now(),
        } as User;
        users_.set(user.id, user);
        return { user, created: !existing };
      },
      async get(_ctx, userId) {
        const user = users_.get(userId);
        if (!user) throw new NotFoundError('zendesk user', String(userId));
        return user;
      },
      async search(_ctx, input) {
        const found = input.externalId
          ? [byExternalId(input.externalId)].filter((u): u is User => u !== undefined)
          : [...users_.values()].filter((u) => [u.name, u.email ?? ''].some((v) => v.toLowerCase().includes((input.query ?? '').replace(/^email:/, '').toLowerCase())));
        return { users: found, next_page: null, count: found.length };
      },
    },
    organizations: {
      async createOrUpdate(_ctx, input) {
        const existing = [...organizations_.values()].find((o) => (input.id && o.id === input.id) || (input.externalId && o.external_id === input.externalId));
        const organization: Organization = {
          ...(existing ?? { id: next++, created_at: now() }),
          name: input.name,
          external_id: input.externalId ?? existing?.external_id ?? null,
          domain_names: input.domainNames ?? existing?.domain_names ?? [],
          tags: input.tags ?? existing?.tags ?? [],
          updated_at: now(),
        } as Organization;
        organizations_.set(organization.id, organization);
        return organization;
      },
    },
    tickets: {
      async create(_ctx, input) {
        const requesterId = input.requesterId ?? (input.requester ? (await fake.users.createOrUpdate(_ctx, { email: input.requester.email, name: input.requester.name ?? input.requester.email })).user.id : 1);
        const ticket: Ticket = {
          id: next++,
          subject: input.subject ?? null,
          description: input.comment.body ?? input.comment.htmlBody ?? null,
          status: 'new',
          priority: input.priority ?? null,
          type: input.type ?? null,
          requester_id: requesterId,
          external_id: input.externalId ?? null,
          tags: input.tags ?? [],
          created_at: now(),
          updated_at: now(),
        };
        tickets_.set(ticket.id, ticket);
        addComment(ticket.id, input.comment, requesterId);
        return ticket;
      },
      async get(_ctx, ticketId) {
        return ticketOf(ticketId);
      },
      async update(_ctx, input) {
        const ticket = ticketOf(input.ticketId);
        const updated: Ticket = {
          ...ticket,
          ...(input.status ? { status: input.status } : {}),
          ...(input.priority ? { priority: input.priority } : {}),
          ...(input.type ? { type: input.type } : {}),
          ...(input.subject ? { subject: input.subject } : {}),
          ...(input.tags ? { tags: input.tags } : {}),
          ...(input.assigneeId !== undefined ? { assignee_id: input.assigneeId } : {}),
          updated_at: now(),
        };
        tickets_.set(updated.id, updated);
        if (input.comment) addComment(updated.id, input.comment, 1);
        return updated;
      },
      async listRequested(_ctx, input) {
        const tickets = [...tickets_.values()].filter((t) => t.requester_id === input.userId).slice(0, input.pageSize ?? 25);
        return { tickets, meta: { has_more: false, after_cursor: null } };
      },
      async search(_ctx, input) {
        const words = input.query.toLowerCase().split(/\s+/).filter(Boolean);
        const results = [...tickets_.values()].filter((t) => words.every((w) => `${t.subject ?? ''} ${t.description ?? ''} status:${t.status} ${t.tags.map((x) => `tags:${x}`).join(' ')}`.toLowerCase().includes(w)));
        return { results, next_page: null, count: results.length };
      },
    },
    comments: {
      async list(_ctx, input) {
        ticketOf(input.ticketId);
        const all = [...(comments_.get(input.ticketId) ?? [])];
        return { comments: input.sort === '-created_at' ? all.reverse() : all, meta: { has_more: false, after_cursor: null } };
      },
      async *all(ctx, input) {
        yield* (await fake.comments.list(ctx, input)).comments;
      },
      async add(_ctx, input) {
        const ticket = ticketOf(input.ticketId);
        addComment(ticket.id, input, 1);
        return ticket;
      },
    },
    events: {
      async track(_ctx, input) {
        events_.push({ userId: input.userId, type: input.type, properties: input.properties ?? {} });
      },
    },
    async chatIdentity(user, options = {}) {
      return { provider: 'zendesk', userId: user.id, token: `fake.${user.id}`, expiresAt: new Date(Date.now() + (options.ttlSeconds ?? 600) * 1000) };
    },
    widgetSnippet(options = {}) {
      return zendeskWidgetSnippet('test-widget-key', options);
    },
    async upsertContact(ctx, input) {
      const { user, created } = await fake.users.createOrUpdate(ctx, { externalId: input.id, email: input.email, name: input.name, userFields: input.attributes });
      return { id: String(user.id), created };
    },
    async trackEvent(ctx, input) {
      await fake.events.track(ctx, { userId: input.userId, type: input.name, properties: input.metadata ?? {} });
    },
  };
  return fake;
}

/** A Zendesk event as a webhook subscribed to it posts it: `zendeskEvent('ticket.created', { id: '35' })`. */
export function zendeskEvent(type: string, detail: Record<string, unknown> = {}, event: Record<string, unknown> = {}): ZendeskEvent {
  const domain = type.split('.')[0]!;
  return {
    type: `zen:event-type:${type}`,
    id: randomUUID(),
    account_id: 1,
    time: new Date().toISOString(),
    zendesk_event_version: '2022-11-06',
    subject: `zen:${domain}:${String(detail.id ?? '1')}`,
    detail,
    event,
  };
}

/**
 * The body and headers Zendesk would send: `X-Zendesk-Webhook-Signature` over the timestamp and the body, keyed
 * with `secret`. `body` is an event (`zendeskEvent`) or a trigger's own JSON. Zendesk signs a test sent before the
 * webhook exists with the fixed secret `dGhpc19zZWNyZXRfaXNfZm9yX3Rlc3Rpbmdfb25seQ==`.
 */
export function signedZendeskWebhook(body: unknown, secret: string, at: Date = new Date()): { rawBody: string; headers: Record<string, string> } {
  const rawBody = JSON.stringify(body);
  const timestamp = at.toISOString().replace(/\.\d{3}Z$/, 'Z');
  return {
    rawBody,
    headers: {
      'x-zendesk-webhook-signature': createHmac('sha256', secret).update(timestamp + rawBody).digest('base64'),
      'x-zendesk-webhook-signature-timestamp': timestamp,
      'x-zendesk-webhook-id': '01F1KRFQ6BG29CNWFR60NK5FNY',
      'x-zendesk-webhook-invocation-id': String(Math.floor(Math.random() * 1e10)),
    },
  };
}
