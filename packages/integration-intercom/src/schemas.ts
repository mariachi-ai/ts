import { z } from 'zod';

/**
 * Intercom's shapes, as far as an app reads them (API version 2.18). Unknown fields pass through (`passthrough`),
 * so a field Intercom adds doesn't fail the boundary; a field the app relies on that goes missing does. Times are
 * Unix seconds, as Intercom sends them.
 */

/** The cursor to the next page: send `starting_after` back as `startingAfter`. Absent on the last page. */
export const Pages = z
  .object({ next: z.object({ starting_after: z.string().nullish() }).passthrough().nullish() })
  .passthrough();
export type Pages = z.infer<typeof Pages>;

export const Contact = z
  .object({
    type: z.literal('contact'),
    /** Intercom's id for the contact: what `contacts.get`, `contacts.update` and `notes.create` take. */
    id: z.string(),
    /** The app's own id for the user (`user_id` in the Messenger). */
    external_id: z.string().nullish(),
    role: z.string(),
    email: z.string().nullish(),
    name: z.string().nullish(),
    created_at: z.number(),
    updated_at: z.number(),
    custom_attributes: z.record(z.unknown()).optional(),
  })
  .passthrough();
export type Contact = z.infer<typeof Contact>;

export const ContactPage = z.object({ data: z.array(Contact), total_count: z.number().optional(), pages: Pages.nullish() }).passthrough();
export type ContactPage = z.infer<typeof ContactPage>;

export const Company = z
  .object({
    type: z.literal('company'),
    /** Intercom's id for the company: what `contacts.attachCompany` takes. */
    id: z.string(),
    /** The app's own id for the company. */
    company_id: z.string().nullish(),
    name: z.string().nullish(),
  })
  .passthrough();
export type Company = z.infer<typeof Company>;

export const Note = z.object({ type: z.literal('note'), id: z.string(), created_at: z.number(), body: z.string().nullish() }).passthrough();
export type Note = z.infer<typeof Note>;

export const ContactRef = z.object({ type: z.string(), id: z.string(), external_id: z.string().nullish() }).passthrough();

export const ConversationPart = z
  .object({
    type: z.string(),
    id: z.string(),
    /** `comment`, `note`, `assignment`, `close`…, or `unknown` for a kind this API version doesn't know: skip those. */
    part_type: z.string(),
    body: z.string().nullish(),
    created_at: z.number(),
    author: z.object({ type: z.string(), id: z.string().nullish() }).passthrough().nullish(),
  })
  .passthrough();
export type ConversationPart = z.infer<typeof ConversationPart>;

export const Conversation = z
  .object({
    type: z.literal('conversation'),
    id: z.string(),
    title: z.string().nullish(),
    created_at: z.number(),
    updated_at: z.number(),
    /** `open`, `closed` or `snoozed`. */
    state: z.string(),
    open: z.boolean().optional(),
    /** Who the conversation is with: one contact, unless more were added. */
    contacts: z.object({ contacts: z.array(ContactRef) }).passthrough().nullish(),
    /** Only on `conversations.get` (the 500 most recent) and in webhooks. */
    conversation_parts: z.object({ conversation_parts: z.array(ConversationPart) }).passthrough().nullish(),
  })
  .passthrough();
export type Conversation = z.infer<typeof Conversation>;

export const ConversationPage = z.object({ conversations: z.array(Conversation), total_count: z.number().optional(), pages: Pages.nullish() }).passthrough();
export type ConversationPage = z.infer<typeof ConversationPage>;

/** A notification Intercom posts to the app's webhook endpoint. `data.item` is the object the topic is about. */
export const Notification = z
  .object({
    type: z.literal('notification_event'),
    /** The notification's id (`notif_…`): the same on every delivery attempt, so dedupe on it. */
    id: z.string(),
    topic: z.string(),
    /** The workspace it came from. */
    app_id: z.string(),
    created_at: z.number(),
    delivery_attempts: z.number().optional(),
    first_sent_at: z.number().optional(),
    data: z.object({ item: z.object({ type: z.string().optional() }).passthrough().nullish() }).passthrough(),
  })
  .passthrough();
export type Notification = z.infer<typeof Notification>;

// ---- What the app sends ----

const Attribute = z.union([z.string(), z.number(), z.boolean(), z.null()]);
/** Custom attributes: each must already exist in the workspace (Settings › Data › People, or Companies), or Intercom refuses the call. */
export const CustomAttributes = z.record(Attribute);

const ContactFields = {
  /** The app's own id for the user. */
  externalId: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().url().optional(),
  signedUpAt: z.date().optional(),
  lastSeenAt: z.date().optional(),
  /** An admin's id: the teammate who owns the contact. */
  ownerId: z.string().optional(),
  unsubscribedFromEmails: z.boolean().optional(),
  customAttributes: CustomAttributes.optional(),
};

export const CreateContactInput = z.object({ role: z.enum(['user', 'lead']).default('user'), ...ContactFields });
export type CreateContactInput = z.input<typeof CreateContactInput>;

export const UpdateContactInput = z.object({ contactId: z.string().min(1), role: z.enum(['user', 'lead']).optional(), ...ContactFields });
export type UpdateContactInput = z.input<typeof UpdateContactInput>;

/** One condition (`field`, `operator`, `value`), or `AND` / `OR` over up to 15 of them, nested at most twice. */
export type SearchQuery =
  | { field: string; operator: '=' | '!=' | 'IN' | 'NIN' | '>' | '>=' | '<' | '<=' | '~' | '!~' | '^' | '$'; value: string | number | boolean | null | Array<string | number> }
  | { operator: 'AND' | 'OR'; value: SearchQuery[] };
export const SearchQuery: z.ZodType<SearchQuery> = z.lazy(() =>
  z.union([
    z.object({
      field: z.string().min(1),
      operator: z.enum(['=', '!=', 'IN', 'NIN', '>', '>=', '<', '<=', '~', '!~', '^', '$']),
      value: z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.union([z.string(), z.number()])).max(15)]),
    }),
    z.object({ operator: z.enum(['AND', 'OR']), value: z.array(SearchQuery).min(1).max(15) }),
  ]),
);

export const SearchInput = z.object({
  query: SearchQuery,
  /** At most 150. */
  perPage: z.number().int().min(1).max(150).optional(),
  /** `pages.next.starting_after` from the page before. */
  startingAfter: z.string().optional(),
  sort: z.object({ field: z.string().min(1), order: z.enum(['ascending', 'descending']) }).optional(),
});
export type SearchInput = z.input<typeof SearchInput>;

export const CompanyInput = z.object({
  /** The app's own id for the company. It can't be changed once the company exists. */
  companyId: z.string().min(1),
  name: z.string().optional(),
  plan: z.string().optional(),
  size: z.number().int().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  /** Whole units: Intercom truncates fractions. */
  monthlySpend: z.number().int().optional(),
  /** When the company was created in the app. */
  createdAt: z.date().optional(),
  customAttributes: CustomAttributes.optional(),
});
export type CompanyInput = z.input<typeof CompanyInput>;

/** A data event's metadata: flat values, a link (`{ url, value }`) or an amount in cents (`{ amount, currency }`). At most 20 keys per event name, ever. */
export const EventMetadata = z.record(
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ url: z.string().url(), value: z.string() }).strict(),
    z.object({ amount: z.number().int().nonnegative(), currency: z.string().length(3) }).strict(),
  ]),
);

export const CreateEventInput = z
  .object({
    /** The event's name, past tense: `updated-plan`. */
    name: z.string().min(1),
    /** The app's own id for the user (their `external_id`). */
    userId: z.string().min(1).optional(),
    /** Intercom's id for the contact: the only way to name a lead. */
    contactId: z.string().min(1).optional(),
    /** Only where the app identifies users by email. */
    email: z.string().email().optional(),
    /** When it happened; now by default. Intercom ignores a repeat with the same user, name and second. */
    occurredAt: z.date().optional(),
    metadata: EventMetadata.optional(),
  })
  .refine((e) => [e.userId, e.contactId, e.email].filter((v) => v !== undefined).length === 1, { message: 'Name the contact once: userId, contactId or email' });
export type CreateEventInput = z.input<typeof CreateEventInput>;

export const ListConversationsInput = z.object({
  perPage: z.number().int().min(1).max(150).optional(),
  startingAfter: z.string().optional(),
});
export type ListConversationsInput = z.input<typeof ListConversationsInput>;

export const GetConversationInput = z.object({
  conversationId: z.string().min(1),
  /** Bodies as plain text instead of HTML. */
  plaintext: z.boolean().optional(),
});
export type GetConversationInput = z.input<typeof GetConversationInput>;

export const ReplyInput = z.object({
  conversationId: z.string().min(1),
  /** The teammate the reply is from. */
  adminId: z.string().min(1),
  /** HTML is allowed in a note. */
  body: z.string().min(1),
  /** `comment` (the default) is sent to the contact; `note` is seen only by teammates. */
  type: z.enum(['comment', 'note']).default('comment'),
  /** Images to attach, up to 10. */
  attachmentUrls: z.array(z.string().url()).max(10).optional(),
});
export type ReplyInput = z.input<typeof ReplyInput>;

export const CloseInput = z.object({
  conversationId: z.string().min(1),
  adminId: z.string().min(1),
  /** A last message to the contact, sent with the close. */
  body: z.string().min(1).optional(),
});
export type CloseInput = z.input<typeof CloseInput>;

export const CreateNoteInput = z.object({
  contactId: z.string().min(1),
  body: z.string().min(1),
  /** The teammate the note is from. */
  adminId: z.string().min(1).optional(),
});
export type CreateNoteInput = z.input<typeof CreateNoteInput>;

// ---- The surface every live-chat package shares ----

/** Who the app's user is, for the Messenger and for `upsertContact`. */
export const ChatUser = z.object({
  /** The app's own id for the user: Intercom's `user_id` / `external_id`. */
  id: z.string().min(1),
  email: z.string().email().optional(),
  name: z.string().optional(),
  /** When they signed up. */
  createdAt: z.date().optional(),
  /** The user's organisation in the app. Intercom needs its name to create the company. */
  company: z.object({ id: z.string().min(1), name: z.string().optional() }).optional(),
});
export type ChatUser = z.input<typeof ChatUser>;

export const UpsertContactInput = z.object({
  /** The app's own id for the user. */
  id: z.string().min(1),
  email: z.string().email().optional(),
  name: z.string().optional(),
  /** Custom attributes, each already defined in the workspace. */
  attributes: CustomAttributes.optional(),
});
export type UpsertContactInput = z.input<typeof UpsertContactInput>;

export const TrackEventInput = z.object({
  /** The app's own id for the user. */
  userId: z.string().min(1),
  name: z.string().min(1),
  metadata: EventMetadata.optional(),
  occurredAt: z.date().optional(),
});
export type TrackEventInput = z.input<typeof TrackEventInput>;
