import { z } from 'zod';

/**
 * Zendesk's shapes, as far as an app reads them, from developer.zendesk.com/api-reference. Unknown fields pass
 * through, so a field Zendesk adds doesn't fail the boundary; a field the app relies on that goes missing does.
 * Zendesk's ids are numbers.
 */

const Id = z.number().int();
const Time = z.string();

export const User = z
  .object({
    id: Id,
    name: z.string(),
    email: z.string().nullish(),
    /** The app's own id for the user: what `chatIdentity` signs and `upsertContact` matches on. Case-insensitive. */
    external_id: z.string().nullish(),
    role: z.string(),
    organization_id: Id.nullish(),
    user_fields: z.record(z.unknown()).nullish(),
    tags: z.array(z.string()).nullish(),
    created_at: Time,
    updated_at: Time,
  })
  .passthrough();
export type User = z.infer<typeof User>;

export const Organization = z
  .object({
    id: Id,
    name: z.string(),
    external_id: z.string().nullish(),
    domain_names: z.array(z.string()).nullish(),
    tags: z.array(z.string()).nullish(),
    organization_fields: z.record(z.unknown()).nullish(),
    created_at: Time,
    updated_at: Time,
  })
  .passthrough();
export type Organization = z.infer<typeof Organization>;

export const Ticket = z
  .object({
    id: Id,
    subject: z.string().nullish(),
    description: z.string().nullish(),
    /** `new`, `open`, `pending`, `hold`, `solved` or `closed`. */
    status: z.string(),
    priority: z.string().nullish(),
    type: z.string().nullish(),
    requester_id: Id,
    submitter_id: Id.nullish(),
    assignee_id: Id.nullish(),
    organization_id: Id.nullish(),
    group_id: Id.nullish(),
    /** The app's own id for the ticket, when it gave one. */
    external_id: z.string().nullish(),
    tags: z.array(z.string()).default([]),
    custom_fields: z.array(z.object({ id: Id, value: z.unknown() }).passthrough()).nullish(),
    created_at: Time,
    updated_at: Time,
  })
  .passthrough();
export type Ticket = z.infer<typeof Ticket>;

export const Comment = z
  .object({
    id: Id,
    type: z.string(),
    body: z.string(),
    html_body: z.string().nullish(),
    plain_body: z.string().nullish(),
    /** `false` for an internal note, which the requester never sees. */
    public: z.boolean(),
    author_id: Id,
    attachments: z.array(z.object({ id: Id, file_name: z.string(), content_url: z.string() }).passthrough()).default([]),
    created_at: Time,
  })
  .passthrough();
export type Comment = z.infer<typeof Comment>;

/** Cursor pagination's `meta`: `has_more`, and the cursor for the next page. */
const CursorMeta = z.object({ has_more: z.boolean(), after_cursor: z.string().nullish() }).passthrough();

export const UserPage = z.object({ users: z.array(User), next_page: z.string().nullish(), count: z.number().optional() }).passthrough();
export type UserPage = z.infer<typeof UserPage>;

export const TicketPage = z.object({ tickets: z.array(Ticket), meta: CursorMeta }).passthrough();
export type TicketPage = z.infer<typeof TicketPage>;

export const TicketSearchPage = z.object({ results: z.array(Ticket), next_page: z.string().nullish(), count: z.number().optional() }).passthrough();
export type TicketSearchPage = z.infer<typeof TicketSearchPage>;

export const CommentPage = z.object({ comments: z.array(Comment), meta: CursorMeta }).passthrough();
export type CommentPage = z.infer<typeof CommentPage>;

export const AccessTokenResponse = z.object({ access_token: z.string().min(1), token_type: z.string().optional(), expires_in: z.number().nullish() }).passthrough();

// What the app sends

const ExternalId = z.string().min(1).max(255);
const Fields = z.record(z.unknown());

export const CreateOrUpdateUserInput = z
  .object({
    /** The app's own user id. Matched case-insensitively. */
    externalId: ExternalId.optional(),
    /** The primary email on create. On an existing user, Zendesk adds it as another email identity. */
    email: z.string().email().optional(),
    /** Required by Zendesk to create a user. */
    name: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    organizationId: z.number().int().optional(),
    /** Custom user fields, by key: each must already exist as a user field in the account. */
    userFields: Fields.optional(),
    tags: z.array(z.string().min(1)).optional(),
    /** Don't send Zendesk's verification email to a new user. */
    skipVerifyEmail: z.boolean().optional(),
  })
  .refine((u) => u.externalId || u.email, { message: 'give externalId or email: Zendesk matches the user by one of them' });
export type CreateOrUpdateUserInput = z.input<typeof CreateOrUpdateUserInput>;

export const SearchUsersInput = z
  .object({
    /** An exact external_id. */
    externalId: ExternalId.optional(),
    /** Zendesk search syntax: `email:ada@example.com`, `jdoe`. */
    query: z.string().min(1).optional(),
    page: z.number().int().min(1).optional(),
    perPage: z.number().int().min(1).max(100).optional(),
  })
  .refine((s) => Boolean(s.externalId) !== Boolean(s.query), { message: 'give externalId or query, not both' });
export type SearchUsersInput = z.input<typeof SearchUsersInput>;

export const CreateOrUpdateOrganizationInput = z
  .object({
    /** The app's own id for the organization (its team, its customer): what an existing one is matched by. */
    externalId: ExternalId.optional(),
    /** Zendesk's id, to update one the app already knows. */
    id: z.number().int().optional(),
    /** Unique in the account. */
    name: z.string().min(1),
    domainNames: z.array(z.string().min(1)).optional(),
    organizationFields: Fields.optional(),
    tags: z.array(z.string().min(1)).optional(),
  })
  .refine((o) => o.externalId || o.id, { message: 'give externalId or id: Zendesk never matches an organization by name, and would fail on a duplicate' });
export type CreateOrUpdateOrganizationInput = z.input<typeof CreateOrUpdateOrganizationInput>;

const CommentInput = z
  .object({
    /** Plain text (Markdown renders when an agent writes it). */
    body: z.string().min(1).optional(),
    /** HTML, instead of `body`. */
    htmlBody: z.string().min(1).optional(),
    /** `false` makes it an internal note. */
    public: z.boolean().optional(),
    /** Who wrote it (a Zendesk user id); the API's own user by default. */
    authorId: z.number().int().optional(),
  })
  .refine((c) => Boolean(c.body) !== Boolean(c.htmlBody), { message: 'give body or htmlBody' });

const Priority = z.enum(['urgent', 'high', 'normal', 'low']);
const Status = z.enum(['new', 'open', 'pending', 'hold', 'solved', 'closed']);
const TicketType = z.enum(['problem', 'incident', 'question', 'task']);
const CustomFields = z.array(z.object({ id: z.number().int(), value: z.unknown() }));

export const CreateTicketInput = z
  .object({
    subject: z.string().min(1).optional(),
    /** The ticket's first comment, which becomes its description. */
    comment: CommentInput,
    /** The requester by Zendesk id: `upsertContact` gives it. */
    requesterId: z.number().int().optional(),
    /** Or the requester by email, made a user when there's none. */
    requester: z.object({ email: z.string().email(), name: z.string().min(1).optional() }).optional(),
    priority: Priority.optional(),
    type: TicketType.optional(),
    tags: z.array(z.string().min(1)).optional(),
    /** The app's own id for what the ticket is about. */
    externalId: z.string().min(1).optional(),
    customFields: CustomFields.optional(),
    /**
     * The same key and body within two hours gives back the first ticket instead of a second one. A fresh one per
     * call by default, so the client's own retries are safe; pass one from the app's data (a form submission's id) to
     * make a retried job safe too.
     */
    idempotencyKey: z.string().min(1).max(255).optional(),
  })
  .refine((t) => !(t.requesterId && t.requester), { message: 'give requesterId or requester, not both' });
export type CreateTicketInput = z.input<typeof CreateTicketInput>;

export const UpdateTicketInput = z.object({
  ticketId: z.number().int(),
  status: Status.optional(),
  priority: Priority.optional(),
  type: TicketType.optional(),
  subject: z.string().min(1).optional(),
  /** Replaces the ticket's tags. */
  tags: z.array(z.string().min(1)).optional(),
  assigneeId: z.number().int().nullable().optional(),
  customFields: CustomFields.optional(),
  /** Added with the change. A retried update would add it twice, so an update is retried only after a rate limit. */
  comment: CommentInput.optional(),
});
export type UpdateTicketInput = z.input<typeof UpdateTicketInput>;

export const AddCommentInput = z.intersection(z.object({ ticketId: z.number().int() }), CommentInput);
export type AddCommentInput = z.input<typeof AddCommentInput>;

export const ListRequestedInput = z.object({
  /** The requester's Zendesk id. */
  userId: z.number().int(),
  /** At most 100. */
  pageSize: z.number().int().min(1).max(100).optional(),
  /** `meta.after_cursor` of the page before. */
  after: z.string().min(1).optional(),
  /** `updated_at`, `-updated_at`, `id`, `-id`, `status` or `-status`. */
  sort: z.enum(['updated_at', '-updated_at', 'id', '-id', 'status', '-status']).optional(),
});
export type ListRequestedInput = z.input<typeof ListRequestedInput>;

export const SearchTicketsInput = z.object({
  /** Zendesk search syntax without `type:`: `status<solved requester:ada@example.com`. */
  query: z.string().min(1),
  page: z.number().int().min(1).optional(),
  perPage: z.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['updated_at', 'created_at', 'priority', 'status', 'ticket_type']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
export type SearchTicketsInput = z.input<typeof SearchTicketsInput>;

export const ListCommentsInput = z.object({
  ticketId: z.number().int(),
  pageSize: z.number().int().min(1).max(100).optional(),
  after: z.string().min(1).optional(),
  /** Oldest first (`created_at`, the default) or newest first (`-created_at`). */
  sort: z.enum(['created_at', '-created_at']).optional(),
});
export type ListCommentsInput = z.input<typeof ListCommentsInput>;

export const TrackEventsInput = z.object({
  /** The user's external_id in Zendesk: the app's own user id. */
  userId: ExternalId,
  /** The event's type: `plan_upgraded`. */
  type: z.string().min(1),
  /** What happened, as a JSON object. */
  properties: Fields.default({}),
  description: z.string().min(1).optional(),
  /** When it happened; when Zendesk receives it by default. */
  createdAt: z.date().optional(),
});
export type TrackEventsInput = z.input<typeof TrackEventsInput>;

// The provider-neutral chat surface, shared with the app's other chat integrations

/** The signed-in user the widget is told about. `id` is the app's own user id, never an email address. */
export const ChatUser = z.object({
  id: ExternalId,
  email: z.string().email().optional(),
  /** Whether the user proved they own `email`. Only then does the email go in the JWT, as Zendesk asks. */
  emailVerified: z.boolean().optional(),
  name: z.string().min(1).max(255).optional(),
  createdAt: z.date().optional(),
  company: z.object({ id: z.string().min(1).max(255), name: z.string().min(1).max(255).optional() }).optional(),
});
export type ChatUser = z.input<typeof ChatUser>;

/**
 * Who the widget signs in, made on the server by `chatIdentity`: a messaging JWT (HS256, signed with the messaging
 * secret), which the widget hands to `zE('messenger', 'loginUser', …)`. Put it in the page with
 * `widgetSnippet({ identity })`.
 */
export interface ChatIdentity {
  provider: 'zendesk';
  userId: string;
  /** The JWT. */
  token: string;
  expiresAt: Date;
}

export const UpsertContactInput = z.object({
  /** The app's own user id: the Zendesk user's external_id. */
  id: ExternalId,
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  /** Custom user fields, by key. */
  attributes: Fields.optional(),
});
export type UpsertContactInput = z.input<typeof UpsertContactInput>;

export const TrackEventInput = z.object({
  userId: ExternalId,
  name: z.string().min(1),
  metadata: Fields.optional(),
});
export type TrackEventInput = z.input<typeof TrackEventInput>;

// Webhooks

/**
 * What a webhook subscribed to Zendesk events posts: the same envelope for every event, its `detail` the resource
 * and `event` what changed. A webhook a trigger or automation calls posts the body the account wrote instead.
 */
export const ZendeskEvent = z
  .object({
    /** `zen:event-type:ticket.created`. */
    type: z.string().startsWith('zen:event-type:'),
    /** Unique per event: dedupe on it. */
    id: z.string().min(1),
    account_id: z.number(),
    time: Time,
    zendesk_event_version: z.string(),
    /** The resource: `zen:ticket:342757`. `zendeskSubject` reads it. */
    subject: z.string(),
    detail: z.record(z.unknown()).nullable(),
    event: z.record(z.unknown()),
  })
  .passthrough();
export type ZendeskEvent = z.infer<typeof ZendeskEvent>;
