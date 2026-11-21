/**
 * `@mariachi/integration-crisp/testing`: a Crisp for an app's tests, held in memory, with the same shape as
 * `createCrisp`'s client; and signed web hooks to post to the app's endpoint.
 */
import { createHmac } from 'node:crypto';
import { NotFoundError } from '@mariachi/core';
import type { Crisp } from './client';
import { CrispError } from './errors';
import { type Conversation, type ConversationMeta, type CrispWebhookBody, type DataRecord, type PeopleProfile, SendMessageInput, UpsertContactInput } from './schemas';
import { chatIdentityFor, widgetSnippetFor } from './widget';

export interface FakeCrispEvent {
  peopleId: string;
  text: string;
  data?: DataRecord;
  color?: string;
}

export interface FakeCrispMessage {
  sessionId: string;
  type: 'text' | 'note';
  content: string;
  fingerprint: number;
}

export interface FakeCrisp extends Crisp {
  profiles_: Map<string, PeopleProfile & { data: DataRecord }>;
  events_: FakeCrispEvent[];
  conversations_: Map<string, Conversation & { meta?: ConversationMeta }>;
  messages_: FakeCrispMessage[];
}

/**
 * An in-memory Crisp: seed profiles and conversations, hand it to the code under test in place of the client, then
 * read what it did from `profiles_`, `events_` and `messages_`. `chatIdentity` and `widgetSnippet` are the real ones,
 * signed with `identitySecret`.
 */
export function fakeCrisp(seed: { websiteId?: string; identitySecret?: string; profiles?: PeopleProfile[]; conversations?: Conversation[] } = {}): FakeCrisp {
  const websiteId = seed.websiteId ?? 'test-website';
  const identitySecret = seed.identitySecret ?? 'test-identity-secret';
  const profiles_ = new Map((seed.profiles ?? []).map((p) => [p.people_id, { ...p, data: {} }]));
  const conversations_ = new Map((seed.conversations ?? []).map((c) => [c.session_id, { ...c }]));
  const events_: FakeCrispEvent[] = [];
  const messages_: FakeCrispMessage[] = [];
  let next = profiles_.size + 1;
  const profileOf = (idOrEmail: string) => {
    const found = profiles_.get(idOrEmail) ?? [...profiles_.values()].find((p) => p.email === idOrEmail.toLowerCase());
    if (!found) throw new CrispError('crisp/not-found', 'crisp people.get failed (404)', { category: 'not-found', status: 404 });
    return found;
  };
  const conversationOf = (sessionId: string) => {
    const found = conversations_.get(sessionId);
    if (!found) throw new NotFoundError('crisp conversation', sessionId);
    return found;
  };
  const fake: FakeCrisp = {
    profiles_,
    events_,
    conversations_,
    messages_,
    people: {
      async create(_ctx, input) {
        const email = input.email.trim().toLowerCase();
        if ([...profiles_.values()].some((p) => p.email === email)) throw new CrispError('crisp/conflict', 'crisp people.create failed (409)', { category: 'conflict', status: 409 });
        const people_id = `people-${next++}`;
        profiles_.set(people_id, { people_id, email, person: { nickname: input.nickname }, ...(input.company ? { company: input.company } : {}), data: {} });
        return { people_id };
      },
      async get(_ctx, peopleId) {
        const { data: _data, ...profile } = profileOf(peopleId);
        return profile;
      },
      async update(_ctx, input) {
        const p = profileOf(input.peopleId);
        if (input.email) p.email = input.email.trim().toLowerCase();
        if (input.nickname) p.person = { ...p.person, nickname: input.nickname };
        if (input.company) p.company = input.company;
        if (input.segments) p.segments = input.segments;
      },
      async updateData(_ctx, input) {
        const p = profileOf(input.peopleId);
        p.data = { ...p.data, ...input.data };
      },
      async addEvent(_ctx, input) {
        events_.push({ peopleId: profileOf(input.peopleId).people_id, text: input.text, data: input.data, color: input.color });
      },
    },
    conversations: {
      async list(_ctx, input = {}) {
        const all = [...conversations_.values()].filter((c) => (!input.resolved || c.state === 'resolved') && (!input.notResolved || c.state !== 'resolved'));
        const per = input.perPage ?? 20;
        const page = input.page ?? 1;
        return all.slice((page - 1) * per, page * per);
      },
      async get(_ctx, sessionId) {
        return conversationOf(sessionId);
      },
      async sendMessage(_ctx, input) {
        const i = SendMessageInput.parse(input);
        conversationOf(i.sessionId);
        const fingerprint = i.fingerprint ?? messages_.length + 1;
        messages_.push({ sessionId: i.sessionId, type: i.type, content: i.content, fingerprint });
        return { fingerprint };
      },
      async setState(_ctx, input) {
        conversationOf(input.sessionId).state = input.state;
      },
      async resolve(ctx, sessionId) {
        await fake.conversations.setState(ctx, { sessionId, state: 'resolved' });
      },
      async getMeta(_ctx, sessionId) {
        return conversationOf(sessionId).meta ?? {};
      },
      async updateMeta(_ctx, { sessionId, ...meta }) {
        const c = conversationOf(sessionId);
        c.meta = { ...c.meta, ...meta };
      },
    },
    async chatIdentity(user) {
      return chatIdentityFor(identitySecret, user);
    },
    widgetSnippet(options = {}) {
      return widgetSnippetFor(websiteId, options);
    },
    async upsertContact(ctx, input) {
      const i = UpsertContactInput.parse(input);
      if (!i.email) throw new CrispError('crisp/email-required', 'Crisp keys people profiles by email: pass the user’s email', { category: 'invalid-request' });
      const existing = [...profiles_.values()].find((p) => p.email === i.email);
      const id = existing?.people_id ?? (await fake.people.create(ctx, { email: i.email, nickname: i.name ?? i.email })).people_id;
      if (existing && i.name) await fake.people.update(ctx, { peopleId: id, nickname: i.name });
      await fake.people.updateData(ctx, { peopleId: id, data: { ...i.attributes, user_id: i.id } });
      return { id, created: !existing };
    },
    async trackEvent(ctx, input) {
      await fake.people.addEvent(ctx, { peopleId: input.userId, text: input.name, data: input.metadata });
    },
  };
  return fake;
}

/** A web hook body as Crisp posts it. */
export function crispWebhookEvent(event: string, data: Record<string, unknown>, overrides: Partial<CrispWebhookBody> = {}): CrispWebhookBody {
  return { website_id: 'test-website', event, data, timestamp: Date.now(), ...overrides };
}

/** The body and headers a Crisp plugin hook would send, signed with `secret`, for posting to the app's controller. */
export function signedCrispWebhook(body: CrispWebhookBody, secret: string, timestamp: number = Date.now()): { rawBody: string; headers: Record<string, string> } {
  const rawBody = JSON.stringify(body);
  const signature = createHmac('sha256', secret).update(`[${timestamp};${rawBody}]`).digest('hex');
  return { rawBody, headers: { 'x-crisp-signature': signature, 'x-crisp-request-timestamp': String(timestamp) } };
}
