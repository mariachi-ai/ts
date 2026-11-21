/**
 * `@mariachi/integration-tawk-to/testing`: a Tawk.to client for an app's tests, with the same shape as
 * `createTawkTo`'s and test settings, that remembers who it signed; webhook payloads; and a signed delivery to post to
 * the app's endpoint.
 */
import { createHmac } from 'node:crypto';
import { type TawkTo, createTawkTo } from './client';
import type { TawkToConfig } from './generated';
import type { ChatEndEvent, ChatIdentity, ChatStartEvent, ChatTranscriptEvent, TicketCreateEvent } from './schemas';

export interface FakeTawkTo extends TawkTo {
  /** Every identity `chatIdentity` made, in order. */
  identities_: ChatIdentity[];
}

/** The real client with test settings (no network is involved either way), recording each identity it signs. */
export function fakeTawkTo(config: Partial<TawkToConfig> = {}): FakeTawkTo {
  const client = createTawkTo({ propertyId: 'testproperty', widgetId: 'default', apiKey: 'tawk-test-key', ...config });
  const identities_: ChatIdentity[] = [];
  return {
    ...client,
    identities_,
    async chatIdentity(user) {
      const identity = await client.chatIdentity(user);
      identities_.push(identity);
      return identity;
    },
  };
}

const property = { id: 'testproperty', name: 'Test property' };
const visitor = { name: 'Ada', email: 'ada@example.com', city: 'london', country: 'GB' };

/** A webhook payload of each type Tawk.to sends, with `overrides` on top. */
export const tawkToEvent = {
  chatStart(overrides: Partial<ChatStartEvent> = {}): ChatStartEvent {
    return { event: 'chat:start', chatId: 'chat_1', time: '2026-11-21T10:00:00.000Z', domain: 'app.example.com', referrer: '', message: { text: 'Hello', type: 'msg', sender: { type: 'visitor' } }, visitor, property, ...overrides };
  },
  chatEnd(overrides: Partial<ChatEndEvent> = {}): ChatEndEvent {
    return { event: 'chat:end', chatId: 'chat_1', time: '2026-11-21T10:05:00.000Z', domain: 'app.example.com', referrer: '', visitor, property, ...overrides };
  },
  chatTranscript(overrides: Partial<ChatTranscriptEvent> = {}): ChatTranscriptEvent {
    return {
      event: 'chat:transcript_created',
      time: '2026-11-21T10:05:01.000Z',
      domain: 'app.example.com',
      referrer: '',
      property,
      chat: { id: 'chat_1', visitor, messages: [{ sender: { t: 'v' }, type: 'msg', msg: 'Hello', time: '2026-11-21T10:00:00.000Z' }] },
      ...overrides,
    };
  },
  ticketCreate(overrides: Partial<TicketCreateEvent> = {}): TicketCreateEvent {
    return { event: 'ticket:create', time: '2026-11-21T10:10:00.000Z', property, requester: { name: 'Ada', email: 'ada@example.com' }, ticket: { id: 'ticket_1', humanId: 1, subject: 'Help', message: 'Please' }, ...overrides };
  },
};

/** The body and headers Tawk.to would send for this payload: `X-Tawk-Signature` and `X-Hook-Event-Id`. */
export function signedTawkToWebhook(payload: object, secret: string, eventId = 'evt_1'): { rawBody: string; headers: Record<string, string> } {
  const rawBody = JSON.stringify(payload);
  return { rawBody, headers: { 'x-tawk-signature': createHmac('sha1', secret).update(rawBody).digest('hex'), 'x-hook-event-id': eventId } };
}
