/**
 * `@mariachi/integration-intercom/testing`: an Intercom for an app's tests, held in memory, with the same shape as
 * `createIntercom`'s client; and a signed notification to post to the app's webhook endpoint.
 */
import { createHmac } from 'node:crypto';
import { fromZodError } from '@mariachi/core';
import type { z } from 'zod';
import type { Intercom } from './client';
import { IntercomError } from './errors';
import { type ChatIdentity, type IntercomRegion, messengerSnippet } from './messenger';
import {
  ChatUser,
  type Company,
  type Contact,
  type Conversation,
  CreateContactInput,
  CreateEventInput,
  type Note,
  type Notification,
  UpdateContactInput,
  UpsertContactInput,
} from './schemas';

/** A data event the fake recorded. */
export interface RecordedEvent {
  name: string;
  userId?: string;
  contactId?: string;
  email?: string;
  occurredAt: Date;
  metadata?: Record<string, unknown>;
}

export interface FakeIntercom extends Intercom {
  contacts_: Map<string, Contact>;
  companies_: Map<string, Company>;
  conversations_: Map<string, Conversation>;
  notes_: Note[];
  events_: RecordedEvent[];
  /** Replies and closes, in order, as `{ conversationId, kind, adminId, body }`. */
  actions_: Array<{ conversationId: string; kind: 'comment' | 'note' | 'close'; adminId: string; body?: string }>;
}

/**
 * An in-memory Intercom: hand it to the code under test in place of the client. `chatIdentity` gives an unsigned
 * stand-in (the fake holds no secret), so check the identity's `userId`, not its token.
 */
export function fakeIntercom(seed: { contacts?: Contact[]; conversations?: Conversation[]; appId?: string; region?: IntercomRegion } = {}): FakeIntercom {
  const contacts_ = new Map((seed.contacts ?? []).map((c) => [c.id, c]));
  const companies_ = new Map<string, Company>();
  const conversations_ = new Map((seed.conversations ?? []).map((c) => [c.id, c]));
  const notes_: Note[] = [];
  const events_: RecordedEvent[] = [];
  const actions_: FakeIntercom['actions_'] = [];
  let next = 1;
  const id = () => `fake_${next++}`;
  const now = () => Math.floor(Date.now() / 1000);
  const notFound = () => new IntercomError('intercom/not-found', 'intercom: no such object', { category: 'not-found', providerCode: 'not_found', status: 404 });
  const contactOf = (contactId: string) => {
    const c = contacts_.get(contactId);
    if (!c) throw notFound();
    return c;
  };
  const conversationOf = (conversationId: string) => {
    const c = conversations_.get(conversationId);
    if (!c) throw notFound();
    return c;
  };
  const byExternalId = (externalId: string) => [...contacts_.values()].find((c) => c.external_id === externalId && c.role === 'user') ?? null;
  const apply = (contact: Contact, i: Omit<z.output<typeof UpdateContactInput>, 'contactId'>): Contact => ({
    ...contact,
    ...(i.role ? { role: i.role } : {}),
    ...(i.externalId !== undefined ? { external_id: i.externalId } : {}),
    ...(i.email !== undefined ? { email: i.email } : {}),
    ...(i.name !== undefined ? { name: i.name } : {}),
    custom_attributes: { ...contact.custom_attributes, ...i.customAttributes },
    updated_at: now(),
  });
  const parse = <S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> => {
    const parsed = schema.safeParse(input);
    if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Intercom input');
    return parsed.data;
  };
  const page = <T>(items: T[]) => ({ type: 'list', data: items, total_count: items.length, pages: null });

  const fake: FakeIntercom = {
    contacts_,
    companies_,
    conversations_,
    notes_,
    events_,
    actions_,
    contacts: {
      async create(_ctx, input) {
        const i = parse(CreateContactInput, input);
        if (i.externalId && byExternalId(i.externalId)) throw new IntercomError('intercom/conflict', 'intercom: contact exists', { category: 'conflict', providerCode: 'conflict', status: 409 });
        const contact = apply({ type: 'contact', id: id(), role: i.role, created_at: now(), updated_at: now() }, i);
        contacts_.set(contact.id, contact);
        return contact;
      },
      async update(_ctx, input) {
        const { contactId, ...i } = parse(UpdateContactInput, input);
        const contact = apply(contactOf(contactId), i);
        contacts_.set(contact.id, contact);
        return contact;
      },
      async get(_ctx, contactId) {
        return contactOf(contactId);
      },
      async findByExternalId(_ctx, externalId) {
        return byExternalId(externalId);
      },
      async search(_ctx, input) {
        const q = input.query;
        const items = 'field' in q && q.operator === '=' ? [...contacts_.values()].filter((c) => (c as Record<string, unknown>)[q.field] === q.value) : [...contacts_.values()];
        return page(items);
      },
      async attachCompany(_ctx, input) {
        contactOf(input.contactId);
        const company = companies_.get(input.companyId);
        if (!company) throw notFound();
        return company;
      },
    },
    companies: {
      async createOrUpdate(_ctx, input) {
        const existing = [...companies_.values()].find((c) => c.company_id === input.companyId);
        const company: Company = { ...existing, type: 'company', id: existing?.id ?? id(), company_id: input.companyId, name: input.name ?? existing?.name };
        companies_.set(company.id, company);
        return company;
      },
    },
    events: {
      async create(_ctx, input) {
        const i = parse(CreateEventInput, input);
        if (i.userId && !byExternalId(i.userId)) throw notFound();
        events_.push({ name: i.name, userId: i.userId, contactId: i.contactId, email: i.email, occurredAt: i.occurredAt ?? new Date(), metadata: i.metadata });
      },
    },
    conversations: {
      async list() {
        const items = [...conversations_.values()].sort((a, b) => b.updated_at - a.updated_at);
        return { type: 'conversation.list', conversations: items, total_count: items.length, pages: null };
      },
      async search(_ctx, input) {
        const q = input.query;
        const items = [...conversations_.values()].filter((c) =>
          'field' in q && q.field === 'contact_ids' && q.operator === '=' ? (c.contacts?.contacts ?? []).some((r) => r.id === q.value) : 'field' in q && q.field === 'state' ? c.state === q.value : true,
        );
        return { type: 'conversation.list', conversations: items, total_count: items.length, pages: null };
      },
      async get(_ctx, input) {
        return conversationOf(typeof input === 'string' ? input : input.conversationId);
      },
      async reply(_ctx, input) {
        const conversation = conversationOf(input.conversationId);
        actions_.push({ conversationId: input.conversationId, kind: input.type ?? 'comment', adminId: input.adminId, body: input.body });
        return conversation;
      },
      async close(_ctx, input) {
        const conversation: Conversation = { ...conversationOf(input.conversationId), state: 'closed', open: false, updated_at: now() };
        conversations_.set(conversation.id, conversation);
        actions_.push({ conversationId: input.conversationId, kind: 'close', adminId: input.adminId, body: input.body });
        return conversation;
      },
    },
    notes: {
      async create(_ctx, input) {
        contactOf(input.contactId);
        const note: Note = { type: 'note', id: id(), created_at: now(), body: input.body };
        notes_.push(note);
        return note;
      },
    },
    async chatIdentity(user): Promise<ChatIdentity> {
      const u = parse(ChatUser, user);
      return { userId: u.id, token: `fake.${Buffer.from(u.id).toString('base64url')}.unsigned`, expiresAt: new Date(Date.now() + 3600_000) };
    },
    widgetSnippet(options = {}) {
      return messengerSnippet(seed.appId ?? 'fakeapp', seed.region ?? 'us', options);
    },
    async upsertContact(ctx, input) {
      const i = parse(UpsertContactInput, input);
      const fields = { email: i.email, name: i.name, customAttributes: i.attributes };
      const existing = byExternalId(i.id);
      if (existing) return { id: (await fake.contacts.update(ctx, { contactId: existing.id, ...fields })).id, created: false };
      return { id: (await fake.contacts.create(ctx, { externalId: i.id, ...fields })).id, created: true };
    },
    async trackEvent(ctx, input) {
      return fake.events.create(ctx, { userId: input.userId, name: input.name, metadata: input.metadata, occurredAt: input.occurredAt });
    },
  };
  return fake;
}

/** A contact to seed the fake with, or to put in a test notification. */
export function intercomContact(overrides: Partial<Contact> = {}): Contact {
  return { type: 'contact', id: `ct_${Math.random().toString(36).slice(2, 10)}`, role: 'user', external_id: null, email: null, name: null, created_at: 1_763_700_000, updated_at: 1_763_700_000, ...overrides };
}

/** A conversation to seed the fake with, or to put in a test notification. */
export function intercomConversation(overrides: Partial<Conversation> = {}): Conversation {
  return { type: 'conversation', id: String(Math.floor(Math.random() * 1e9)), title: null, created_at: 1_763_700_000, updated_at: 1_763_700_000, state: 'open', open: true, ...overrides };
}

/** A notification on `topic` about `item`, as Intercom would post it. */
export function intercomNotification(topic: string, item: { type?: string } & Record<string, unknown>, overrides: Partial<Notification> = {}): Notification {
  return { type: 'notification_event', id: `notif_${Math.random().toString(36).slice(2, 14)}`, topic, app_id: 'fakeapp', created_at: 1_763_700_000, delivery_attempts: 1, first_sent_at: 1_763_700_001, data: { type: 'notification_event_data', item }, ...overrides };
}

/** The body and `X-Hub-Signature` header Intercom would send for this notification. */
export function signedIntercomWebhook(notification: Notification, clientSecret: string): { rawBody: string; headers: Record<string, string> } {
  const rawBody = JSON.stringify(notification);
  return { rawBody, headers: { 'x-hub-signature': `sha1=${createHmac('sha1', clientSecret).update(rawBody).digest('hex')}` } };
}
