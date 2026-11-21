import { z } from 'zod';

/** Tawk.to's custom attribute and event names: letters, digits and dashes (it lowercases attribute keys). */
export const TAWK_NAME = /^[A-Za-z0-9-]+$/;

/** A property or widget ID as it goes in the widget's address: letters, digits, dashes and underscores. */
export const TAWK_ID = /^[A-Za-z0-9_-]+$/;

/** The signed-in user the widget is told about. `id` is the app's own user id, never an email address. */
export const ChatUser = z.object({
  id: z.string().min(1).max(255),
  email: z.string().email().optional(),
  name: z.string().min(1).max(255).optional(),
  createdAt: z.date().optional(),
  company: z.object({ id: z.string().min(1).max(255), name: z.string().min(1).max(255).optional() }).optional(),
});
export type ChatUser = z.input<typeof ChatUser>;

/**
 * Who the widget signs in, made on the server by `chatIdentity`: the user's id and its `hash`, the hex HMAC-SHA256 of
 * the id keyed with the property's JavaScript API key. With Secure Mode on, Tawk.to accepts the name and email only
 * with a valid hash, so nobody can claim to be another user. Put it in the page with `widgetSnippet({ identity })`.
 */
export interface ChatIdentity {
  provider: 'tawk-to';
  userId: string;
  hash: string;
  name?: string;
  email?: string;
  /** Tawk.to custom attributes: `company-id`, `company-name`, `created-at` (ISO 8601). */
  attributes: Record<string, string>;
}

export const UpsertContactInput = z.object({
  id: z.string().min(1),
  email: z.string().email().optional(),
  name: z.string().optional(),
  attributes: z.record(z.unknown()).optional(),
});
export type UpsertContactInput = z.input<typeof UpsertContactInput>;

export const TrackEventInput = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});
export type TrackEventInput = z.input<typeof TrackEventInput>;

// Webhook payloads, as https://developer.tawk.to/webhooks/ documents them. Tawk.to's objects can gain fields, so each
// keeps what it doesn't name.

export const WebhookVisitor = z
  .object({ name: z.string(), email: z.string().optional(), city: z.string().optional(), country: z.string().optional() })
  .passthrough();
export const WebhookProperty = z.object({ id: z.string(), name: z.string() }).passthrough();

export const ChatStartEvent = z
  .object({
    event: z.literal('chat:start'),
    chatId: z.string(),
    time: z.string(),
    domain: z.string().optional(),
    referrer: z.string().optional(),
    message: z
      .object({
        text: z.string(),
        /** `msg`, `file` or `webrtc-call`. */
        type: z.string(),
        /** `agent`, `visitor` or `system`. */
        sender: z.object({ type: z.string() }).passthrough(),
      })
      .passthrough(),
    visitor: WebhookVisitor,
    property: WebhookProperty,
  })
  .passthrough();
export type ChatStartEvent = z.infer<typeof ChatStartEvent>;

export const ChatEndEvent = z
  .object({
    event: z.literal('chat:end'),
    chatId: z.string(),
    time: z.string(),
    domain: z.string().optional(),
    referrer: z.string().optional(),
    visitor: WebhookVisitor,
    property: WebhookProperty,
  })
  .passthrough();
export type ChatEndEvent = z.infer<typeof ChatEndEvent>;

export const TranscriptMessage = z
  .object({
    /** `t` is `a` (agent), `v` (visitor) or `s` (system); `n` the agent's or system's name; `id` the agent's id. */
    sender: z.object({ t: z.string(), n: z.string().optional(), id: z.string().optional() }).passthrough(),
    type: z.string(),
    msg: z.string(),
    time: z.string(),
    attchs: z
      .array(
        z
          .object({
            type: z.string(),
            content: z
              .object({
                file: z
                  .object({ url: z.string(), name: z.string(), mimeType: z.string(), size: z.number(), extension: z.string() })
                  .partial()
                  .passthrough()
                  .optional(),
              })
              .passthrough(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();

export const ChatTranscriptEvent = z
  .object({
    event: z.literal('chat:transcript_created'),
    time: z.string(),
    domain: z.string().optional(),
    referrer: z.string().optional(),
    property: WebhookProperty,
    chat: z.object({ id: z.string(), visitor: WebhookVisitor, messages: z.array(TranscriptMessage) }).passthrough(),
  })
  .passthrough();
export type ChatTranscriptEvent = z.infer<typeof ChatTranscriptEvent>;

export const TicketCreateEvent = z
  .object({
    event: z.literal('ticket:create'),
    time: z.string(),
    requester: z.object({ name: z.string(), email: z.string().optional() }).passthrough(),
    property: WebhookProperty,
    ticket: z.object({ id: z.string(), humanId: z.number(), subject: z.string(), message: z.string() }).passthrough(),
  })
  .passthrough();
export type TicketCreateEvent = z.infer<typeof TicketCreateEvent>;
