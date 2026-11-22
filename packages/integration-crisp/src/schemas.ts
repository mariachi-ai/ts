import { z } from 'zod';

/**
 * Crisp's shapes, as far as an app reads them. Unknown fields pass through (`passthrough`), so a field Crisp adds
 * doesn't fail the boundary; a field the app relies on that goes missing does.
 */

/** Every Crisp answer is `{ error, reason, data }`; the client returns `data`. */
export function envelope<T extends z.ZodTypeAny>(data: T) {
  return z.object({ error: z.literal(false).optional(), reason: z.string().optional(), data }).passthrough().transform((body) => body.data as z.output<T>);
}

/** A value Crisp keeps in a profile's or a conversation's custom data. */
export const DataValue = z.union([z.string(), z.number(), z.boolean()]);
export type DataValue = z.infer<typeof DataValue>;
export const DataRecord = z.record(DataValue);
export type DataRecord = z.infer<typeof DataRecord>;

export const PeopleProfile = z
  .object({
    people_id: z.string(),
    email: z.string().optional(),
    person: z.object({ nickname: z.string().optional() }).passthrough().optional(),
    company: z.object({ name: z.string().optional() }).passthrough().optional(),
    segments: z.array(z.string()).optional(),
  })
  .passthrough();
export type PeopleProfile = z.infer<typeof PeopleProfile>;

export const CreatedProfile = z.object({ people_id: z.string() }).passthrough();

export const ConversationState = z.enum(['pending', 'unresolved', 'resolved']);
export type ConversationState = z.infer<typeof ConversationState>;

export const Conversation = z
  .object({
    session_id: z.string(),
    website_id: z.string().optional(),
    people_id: z.string().optional(),
    state: z.string().optional(),
    /** Whether the visitor's email is verified (identity verification, or another method Crisp lists). */
    is_verified: z.boolean().optional(),
    is_blocked: z.boolean().optional(),
    availability: z.string().optional(),
    last_message: z.string().optional(),
    created_at: z.number().optional(),
    updated_at: z.number().optional(),
    meta: z.object({ nickname: z.string().optional(), email: z.string().optional(), data: z.record(z.unknown()).optional(), segments: z.array(z.string()).optional() }).passthrough().optional(),
  })
  .passthrough();
export type Conversation = z.infer<typeof Conversation>;

export const ConversationMeta = z
  .object({
    nickname: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    subject: z.string().optional(),
    origin: z.string().optional(),
    data: z.record(z.unknown()).optional(),
    segments: z.array(z.string()).optional(),
  })
  .passthrough();
export type ConversationMeta = z.infer<typeof ConversationMeta>;

export const SentMessage = z.object({ fingerprint: z.number() }).passthrough();
export type SentMessage = z.infer<typeof SentMessage>;

/** An email as Crisp keys a profile by it: trimmed, lower-case. */
const Email = z.string().trim().toLowerCase().email();
const Id = z.string().min(1).max(256);

export const CreateProfileInput = z.object({
  email: Email,
  /** Crisp requires one: the person's full name, or the email when the app has none. */
  nickname: z.string().min(1).max(256),
  company: z.object({ name: z.string().min(1) }).optional(),
  segments: z.array(z.string().min(1)).optional(),
});
export type CreateProfileInput = z.input<typeof CreateProfileInput>;

export const UpdateProfileInput = z.object({
  /** The profile's `people_id`, or its email. */
  peopleId: Id,
  email: Email.optional(),
  nickname: z.string().min(1).max(256).optional(),
  company: z.object({ name: z.string().min(1) }).optional(),
  segments: z.array(z.string().min(1)).optional(),
});
export type UpdateProfileInput = z.input<typeof UpdateProfileInput>;

export const UpdateDataInput = z.object({ peopleId: Id, data: DataRecord });
export type UpdateDataInput = z.input<typeof UpdateDataInput>;

export const EVENT_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'brown', 'grey', 'black'] as const;

export const AddEventInput = z.object({
  /** The profile's `people_id`, or its email. */
  peopleId: Id,
  /** What happened, as the timeline shows it: `signed_up`, `plan_upgraded`. */
  text: z.string().min(1).max(256),
  data: DataRecord.optional(),
  color: z.enum(EVENT_COLORS).optional(),
});
export type AddEventInput = z.input<typeof AddEventInput>;

export const ListConversationsInput = z.object({
  /** From 1. */
  page: z.number().int().min(1).default(1),
  /** 20 to 50; Crisp's default is 20. */
  perPage: z.number().int().min(20).max(50).optional(),
  /** Text searched in every conversation. */
  search: z.string().min(1).optional(),
  unread: z.boolean().optional(),
  resolved: z.boolean().optional(),
  notResolved: z.boolean().optional(),
});
export type ListConversationsInput = z.input<typeof ListConversationsInput>;

export const SendMessageInput = z.object({
  sessionId: Id,
  /** The message's text. */
  content: z.string().min(1).max(10_000),
  /** `note` is private: operators see it, the visitor doesn't. */
  type: z.enum(['text', 'note']).default('text'),
  /** Who the message is from, as the visitor sees it (an operator's or the app's name). */
  nickname: z.string().min(1).max(256).optional(),
  avatar: z.string().url().optional(),
  /** A number of your own, so the app can recognise this message when it comes back in a `message:received` hook. */
  fingerprint: z.number().int().positive().optional(),
});
export type SendMessageInput = z.input<typeof SendMessageInput>;

export const SetStateInput = z.object({ sessionId: Id, state: ConversationState });
export type SetStateInput = z.input<typeof SetStateInput>;

export const UpdateMetaInput = z.object({
  sessionId: Id,
  nickname: z.string().min(1).max(256).optional(),
  email: Email.optional(),
  phone: z.string().min(1).optional(),
  subject: z.string().optional(),
  data: DataRecord.optional(),
  segments: z.array(z.string().min(1)).optional(),
});
export type UpdateMetaInput = z.input<typeof UpdateMetaInput>;

/** The person the app's code knows, signed in: what `chatIdentity` and `upsertContact` start from. */
export const ChatUser = z.object({
  id: Id,
  email: Email.optional(),
  name: z.string().min(1).max(256).optional(),
  createdAt: z.date().optional(),
  company: z.object({ id: Id, name: z.string().min(1).max(256).optional() }).optional(),
});
export type ChatUser = z.input<typeof ChatUser>;

export const UpsertContactInput = z.object({
  /** The app's own id for the person, kept in the profile's data as `user_id`. */
  id: Id,
  /** Crisp keys profiles by email, so it's required here. */
  email: Email.optional(),
  name: z.string().min(1).max(256).optional(),
  /** Custom data merged into the profile's data. */
  attributes: DataRecord.optional(),
});
export type UpsertContactInput = z.input<typeof UpsertContactInput>;

export const TrackEventInput = z.object({
  /** The person's Crisp profile: the `id` `upsertContact` returned (its `people_id`), or its email. */
  userId: Id,
  name: z.string().min(1).max(256),
  metadata: DataRecord.optional(),
});
export type TrackEventInput = z.input<typeof TrackEventInput>;

/** What Crisp posts to a web hook: the event, the website, the event's data (as the RTM API sends it), and when. */
export const CrispWebhookBody = z
  .object({
    website_id: z.string(),
    event: z.string(),
    data: z.record(z.unknown()),
    /** When the event happened, in milliseconds. */
    timestamp: z.number(),
  })
  .passthrough();
export type CrispWebhookBody = z.infer<typeof CrispWebhookBody>;
