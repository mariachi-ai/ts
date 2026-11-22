import { type Context, fromZodError } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { IntercomError, settingError } from './errors';
import { type IntercomConfig, type IntercomOperation, configSchema, errorMap, operations, provider } from './generated';
import { API_BASE, type ChatIdentity, type ChatIdentityOptions, type IntercomRegion, REGIONS, type WidgetSnippetOptions, messengerSnippet, signChatIdentity } from './messenger';
import {
  CloseInput,
  Company,
  CompanyInput,
  Contact,
  ContactPage,
  Conversation,
  ConversationPage,
  CreateContactInput,
  CreateEventInput,
  CreateNoteInput,
  type ChatUser,
  GetConversationInput,
  ListConversationsInput,
  Note,
  ReplyInput,
  SearchInput,
  TrackEventInput,
  UpdateContactInput,
  UpsertContactInput,
} from './schemas';

/** The REST API version every call asks for (the `Intercom-Version` header): the shapes in `schemas.ts` are its. */
export const INTERCOM_API_VERSION = '2.18';

export interface IntercomDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

/**
 * The Intercom client: each operation takes `ctx` first, checks its input and Intercom's answer, and makes one span
 * (`intercom contacts.create`). Build it once at startup and share it.
 *
 * ```ts
 * const intercom = createIntercom(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * await intercom.upsertContact(ctx, { id: user.id, email: user.email, name: user.name });
 * const identity = await intercom.chatIdentity({ id: user.id, email: user.email });
 * html`…${intercom.widgetSnippet({ identity })}…`
 * ```
 */
export function createIntercom(config: IntercomConfig, deps: IntercomDeps = {}) {
  const cfg = configSchema.parse(config);
  const region = (cfg.region ?? 'us').toLowerCase() as IntercomRegion;
  if (!REGIONS.includes(region)) throw settingError('invalid-region', 'INTERCOM_REGION is us, eu or au, or unset');
  const base = API_BASE[region];
  const server = new URL(base).host;

  function call<T>(ctx: Context, operation: IntercomOperation, request: Omit<ProviderRequest, 'url' | 'headers'> & { path: string }, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    const { path, ...rest } = request;
    // A read, a search or a put of the same thing is safe to repeat after an outage; a create isn't, so it's retried only after a rate limit
    const safe = operations[operation].idempotency === 'natural';
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server },
      { ...rest, url: `${base}${path}`, headers: { authorization: `Bearer ${cfg.accessToken}`, 'intercom-version': INTERCOM_API_VERSION } },
      { schema, error: IntercomError, failure, deps: safe ? { ...deps, retry: { unsafe: false, ...deps.retry } } : deps },
    );
  }

  const contacts = {
    /** Creates a user (`role: 'user'`, the default) or a lead. A user needs `externalId` (the app's id) or `email`. */
    async create(ctx: Context, input: CreateContactInput) {
      const i = parse(CreateContactInput, input);
      return call(ctx, 'contacts.create', { method: 'POST', path: '/contacts', json: { role: i.role, ...contactBody(i) } }, Contact);
    },
    /** Updates a contact by Intercom's id. Only the fields given change. */
    async update(ctx: Context, input: UpdateContactInput) {
      const { contactId, ...i } = parse(UpdateContactInput, input);
      return call(ctx, 'contacts.update', { method: 'PUT', path: `/contacts/${segment(contactId)}`, json: { role: i.role, ...contactBody(i) } }, Contact);
    },
    /** One contact by Intercom's id. */
    async get(ctx: Context, contactId: string) {
      return call(ctx, 'contacts.get', { method: 'GET', path: `/contacts/${segment(required(contactId, 'contactId'))}` }, Contact);
    },
    /** One user by the app's own id (users only, not leads), or `null` when there's none. */
    async findByExternalId(ctx: Context, externalId: string): Promise<Contact | null> {
      try {
        return await call(ctx, 'contacts.findByExternalId', { method: 'GET', path: `/contacts/find_by_external_id/${segment(required(externalId, 'externalId'))}` }, Contact);
      } catch (error) {
        // 404: no such user. (410 means it was merged into another contact: that's not "none", so it still fails.)
        if (error instanceof IntercomError && error.status === 404) return null;
        throw error;
      }
    },
    /** One page of contacts matching `query`: `{ field: 'email', operator: '=', value }`. A contact made minutes ago may not show yet. */
    async search(ctx: Context, input: SearchInput) {
      const i = parse(SearchInput, input);
      return call(ctx, 'contacts.search', { method: 'POST', path: '/contacts/search', json: searchBody(i) }, ContactPage);
    },
    /** Attaches a company (by Intercom's id, from `companies.createOrUpdate`) to a contact. */
    async attachCompany(ctx: Context, input: { contactId: string; companyId: string }) {
      const i = parse(z.object({ contactId: z.string().min(1), companyId: z.string().min(1) }), input);
      return call(ctx, 'contacts.attachCompany', { method: 'POST', path: `/contacts/${segment(i.contactId)}/companies`, json: { id: i.companyId } }, Company);
    },
  };

  const companies = {
    /** Creates the company with this `companyId` (the app's own id), or updates it. It shows in Intercom once a contact is attached. */
    async createOrUpdate(ctx: Context, input: CompanyInput) {
      const i = parse(CompanyInput, input);
      return call(
        ctx,
        'companies.createOrUpdate',
        {
          method: 'POST',
          path: '/companies',
          json: {
            company_id: i.companyId,
            name: i.name,
            plan: i.plan,
            size: i.size,
            website: i.website,
            industry: i.industry,
            monthly_spend: i.monthlySpend,
            remote_created_at: seconds(i.createdAt),
            custom_attributes: i.customAttributes,
          },
        },
        Company,
      );
    },
  };

  const events = {
    /**
     * Records a data event for one contact. `occurredAt` defaults to now, to the second: Intercom ignores a repeat
     * with the same user, name and second, so a retried call is recorded once.
     */
    async create(ctx: Context, input: CreateEventInput): Promise<void> {
      const i = parse(CreateEventInput, input);
      await call(
        ctx,
        'events.create',
        {
          method: 'POST',
          path: '/events',
          json: { event_name: i.name, created_at: seconds(i.occurredAt ?? new Date()), user_id: i.userId, id: i.contactId, email: i.email, metadata: i.metadata },
        },
        z.unknown(),
      );
    },
  };

  const conversations = {
    /** One page of conversations, most recently updated first. */
    async list(ctx: Context, input: ListConversationsInput = {}) {
      const i = parse(ListConversationsInput, input);
      return call(ctx, 'conversations.list', { method: 'GET', path: '/conversations', query: { per_page: i.perPage, starting_after: i.startingAfter } }, ConversationPage);
    },
    /** One page of conversations matching `query`: a contact's are `{ field: 'contact_ids', operator: '=', value: contactId }`. */
    async search(ctx: Context, input: SearchInput) {
      const i = parse(SearchInput, input);
      return call(ctx, 'conversations.search', { method: 'POST', path: '/conversations/search', json: searchBody(i) }, ConversationPage);
    },
    /** One conversation, with its 500 most recent parts. */
    async get(ctx: Context, input: GetConversationInput | string) {
      const i = parse(GetConversationInput, typeof input === 'string' ? { conversationId: input } : input);
      return call(ctx, 'conversations.get', { method: 'GET', path: `/conversations/${segment(i.conversationId)}`, query: { display_as: i.plaintext ? 'plaintext' : undefined } }, Conversation);
    },
    /** Replies as a teammate: a `comment` the contact sees, or a `note` only teammates see. */
    async reply(ctx: Context, input: ReplyInput) {
      const i = parse(ReplyInput, input);
      return call(
        ctx,
        'conversations.reply',
        { method: 'POST', path: `/conversations/${segment(i.conversationId)}/reply`, json: { message_type: i.type, type: 'admin', admin_id: i.adminId, body: i.body, attachment_urls: i.attachmentUrls } },
        Conversation,
      );
    },
    /** Closes the conversation as a teammate, with an optional last message. */
    async close(ctx: Context, input: CloseInput) {
      const i = parse(CloseInput, input);
      return call(
        ctx,
        'conversations.close',
        { method: 'POST', path: `/conversations/${segment(i.conversationId)}/parts`, json: { message_type: 'close', type: 'admin', admin_id: i.adminId, body: i.body } },
        Conversation,
      );
    },
  };

  const notes = {
    /** Adds a note to a contact, seen only by teammates. */
    async create(ctx: Context, input: CreateNoteInput) {
      const i = parse(CreateNoteInput, input);
      return call(ctx, 'notes.create', { method: 'POST', path: `/contacts/${segment(i.contactId)}/notes`, json: { body: i.body, admin_id: i.adminId } }, Note);
    },
  };

  return {
    contacts,
    companies,
    events,
    conversations,
    notes,

    /**
     * Signs who the signed-in user is, for the Messenger (`widgetSnippet({ identity })`): a JWT with the Messenger
     * API secret, so nobody can open another user's conversations. Make one each time a page renders.
     */
    async chatIdentity(user: ChatUser, options?: ChatIdentityOptions): Promise<ChatIdentity> {
      return signChatIdentity(cfg.messengerSecret, user, options);
    },

    /**
     * The Messenger for a page's `<body>`: the loader script (serve `@mariachi/integration-intercom/intercom.js`)
     * with the workspace, region and identity. Send the page with `intercomCsp()`. The Messenger sets cookies, so
     * render it only once the visitor has consented to them.
     */
    widgetSnippet(options: WidgetSnippetOptions = {}) {
      return messengerSnippet(cfg.appId, region, options);
    },

    /**
     * Creates or updates the user with the app's id as `external_id`: found by that id, then updated; created when
     * there's none. Returns Intercom's id for the contact, and whether it was created.
     */
    async upsertContact(ctx: Context, input: UpsertContactInput): Promise<{ id: string; created: boolean }> {
      const i = parse(UpsertContactInput, input);
      const fields = { email: i.email, name: i.name, customAttributes: i.attributes };
      const update = async (contactId: string) => ({ id: (await contacts.update(ctx, { contactId, ...fields })).id, created: false });
      const existing = await contacts.findByExternalId(ctx, i.id);
      if (existing) return update(existing.id);
      try {
        return { id: (await contacts.create(ctx, { role: 'user', externalId: i.id, ...fields })).id, created: true };
      } catch (error) {
        // Made by someone else since the lookup (the Messenger, another request): update that one
        if (!(error instanceof IntercomError && error.category === 'conflict')) throw error;
        const made = await contacts.findByExternalId(ctx, i.id);
        if (!made) throw error;
        return update(made.id);
      }
    },

    /** Records that the user did something: a data event on the user with the app's id as `external_id`. */
    async trackEvent(ctx: Context, input: TrackEventInput): Promise<void> {
      const i = parse(TrackEventInput, input);
      return events.create(ctx, { userId: i.userId, name: i.name, metadata: i.metadata, occurredAt: i.occurredAt });
    },
  };
}

export type Intercom = ReturnType<typeof createIntercom>;

/** Intercom's error body is `{ type: 'error.list', errors: [{ code, message }] }`: the first code is kept, never the message (it can echo input). */
function failure(_status: number, body: unknown): FailureInfo | undefined {
  const first = (body as { errors?: Array<{ code?: unknown }> } | null)?.errors?.[0]?.code;
  const code = typeof first === 'string' ? first : typeof first === 'number' ? String(first) : undefined;
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

type ContactFields = Omit<z.output<typeof UpdateContactInput>, 'contactId' | 'role'>;

function contactBody(i: ContactFields) {
  return {
    external_id: i.externalId,
    email: i.email,
    phone: i.phone,
    name: i.name,
    avatar: i.avatar,
    signed_up_at: seconds(i.signedUpAt),
    last_seen_at: seconds(i.lastSeenAt),
    owner_id: i.ownerId,
    unsubscribed_from_emails: i.unsubscribedFromEmails,
    custom_attributes: i.customAttributes,
  };
}

function searchBody(i: z.output<typeof SearchInput>) {
  return {
    query: i.query,
    pagination: i.perPage || i.startingAfter ? { per_page: i.perPage, starting_after: i.startingAfter } : undefined,
    sort: i.sort,
  };
}

function seconds(date: Date | undefined): number | undefined {
  return date ? Math.floor(date.getTime() / 1000) : undefined;
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Intercom input');
  return parsed.data;
}

function required(value: string, name: string): string {
  return parse(z.string().min(1, `${name} is required`), value);
}

function segment(value: string): string {
  return encodeURIComponent(value);
}
