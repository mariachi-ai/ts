import { ConfigError, type Context, ValidationError, fromZodError } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { CrispError, missingSetting } from './errors';
import { type CrispConfig, type CrispOperation, configSchema, errorMap, provider } from './generated';
import {
  AddEventInput,
  type ChatUser,
  Conversation,
  ConversationMeta,
  CreateProfileInput,
  CreatedProfile,
  ListConversationsInput,
  PeopleProfile,
  SendMessageInput,
  SentMessage,
  SetStateInput,
  TrackEventInput,
  UpdateDataInput,
  UpdateMetaInput,
  UpdateProfileInput,
  UpsertContactInput,
  envelope,
} from './schemas';
import { type ChatIdentity, type WidgetSnippetOptions, chatIdentityFor, checkedWebsiteId, widgetSnippetFor } from './widget';

export interface CrispDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

const TIERS = ['website', 'plugin'] as const;

/**
 * The Crisp client: the chat widget for a signed-in user (`chatIdentity`, `widgetSnippet`), the people the app
 * knows (`upsertContact`, `trackEvent`, `people`), and the conversations (`conversations`). Each REST operation
 * takes `ctx` first, checks its input and Crisp's answer, and makes one span (`crisp people.get`). Build it once at
 * startup and share it.
 *
 * ```ts
 * const crisp = createCrisp(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * const identity = await crisp.chatIdentity({ id: user.id, email: user.email, name: user.name });
 * html`…${crisp.widgetSnippet({ identity })}`;
 * ```
 */
export function createCrisp(config: CrispConfig, deps: CrispDeps = {}) {
  const cfg = configSchema.parse(config);
  const websiteId = checkedWebsiteId(cfg.websiteId);
  const tier = cfg.tokenTier ?? 'website';
  if (!(TIERS as readonly string[]).includes(tier)) throw new ConfigError('crisp/invalid-token-tier', 'CRISP_TOKEN_TIER is website (a token from the workspace settings) or plugin (a Marketplace plugin token)');
  const base = provider.baseUrl;
  const server = new URL(base).host;
  const site = `/website/${encodeURIComponent(websiteId)}`;

  function headers(): Record<string, string> {
    if (!cfg.tokenIdentifier || !cfg.tokenKey) {
      throw missingSetting('no-token', 'Set the Crisp API token (CRISP_TOKEN_IDENTIFIER and CRISP_TOKEN_KEY) to call the REST API');
    }
    return { authorization: `Basic ${Buffer.from(`${cfg.tokenIdentifier}:${cfg.tokenKey}`).toString('base64')}`, 'x-crisp-tier': tier };
  }

  async function call<T>(ctx: Context, operation: CrispOperation, request: Omit<ProviderRequest, 'url' | 'headers'> & { path: string }, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    const { path, ...rest } = request;
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server },
      { ...rest, url: `${base}${site}${path}`, headers: headers() },
      { schema, error: CrispError, failure, deps },
    );
  }

  const people = {
    /** Adds a profile. Fails with category `conflict` when one with this email exists: `get` it instead. */
    async create(ctx: Context, input: CreateProfileInput) {
      const i = parse(CreateProfileInput, input);
      const json = { email: i.email, person: { nickname: i.nickname }, ...(i.company ? { company: i.company } : {}), ...(i.segments ? { segments: i.segments } : {}) };
      return call(ctx, 'people.create', { method: 'POST', path: '/people/profile', json }, envelope(CreatedProfile));
    },
    /** A profile by its `people_id` or its email. Fails with category `not-found` when there's none. */
    async get(ctx: Context, peopleId: string) {
      return call(ctx, 'people.get', { method: 'GET', path: `/people/profile/${segment(peopleId)}` }, envelope(PeopleProfile));
    },
    /** Changes the fields given and keeps the rest. */
    async update(ctx: Context, input: UpdateProfileInput) {
      const i = parse(UpdateProfileInput, input);
      const json = {
        ...(i.email ? { email: i.email } : {}),
        ...(i.nickname ? { person: { nickname: i.nickname } } : {}),
        ...(i.company ? { company: i.company } : {}),
        ...(i.segments ? { segments: i.segments } : {}),
      };
      await call(ctx, 'people.update', { method: 'PATCH', path: `/people/profile/${segment(i.peopleId)}`, json }, z.unknown());
    },
    /** Merges these keys into the profile's custom data; other keys stay. */
    async updateData(ctx: Context, input: UpdateDataInput) {
      const i = parse(UpdateDataInput, input);
      await call(ctx, 'people.updateData', { method: 'PATCH', path: `/people/data/${segment(i.peopleId)}`, json: { data: i.data } }, z.unknown());
    },
    /** Stacks an event on the profile's timeline, which operators see beside the conversation. */
    async addEvent(ctx: Context, input: AddEventInput) {
      const i = parse(AddEventInput, input);
      const json = { text: i.text, ...(i.data ? { data: i.data } : {}), ...(i.color ? { color: i.color } : {}) };
      await call(ctx, 'people.addEvent', { method: 'POST', path: `/people/events/${segment(i.peopleId)}`, json }, z.unknown());
    },
  };

  const conversations = {
    /** One page of the website's conversations (`page` from 1, `perPage` 20 to 50). An empty page is the end. */
    async list(ctx: Context, input: ListConversationsInput = {}) {
      const i = parse(ListConversationsInput, input);
      const flag = (on: boolean | undefined) => (on ? 1 : undefined);
      return call(
        ctx,
        'conversations.list',
        {
          method: 'GET',
          path: `/conversations/${i.page}`,
          query: {
            per_page: i.perPage,
            search_query: i.search,
            search_type: i.search ? 'text' : undefined,
            filter_unread: flag(i.unread),
            filter_resolved: flag(i.resolved),
            filter_not_resolved: flag(i.notResolved),
          },
        },
        envelope(z.array(Conversation).nullable().transform((list) => list ?? [])),
      );
    },
    async get(ctx: Context, sessionId: string) {
      return call(ctx, 'conversations.get', { method: 'GET', path: `/conversation/${segment(sessionId)}` }, envelope(Conversation));
    },
    /**
     * Sends a text message (or a private `note`) as an operator. Crisp takes no idempotency key, so a send is retried
     * only after a rate limit, never after an outage.
     */
    async sendMessage(ctx: Context, input: SendMessageInput) {
      const i = parse(SendMessageInput, input);
      const user = i.nickname || i.avatar ? { user: { ...(i.nickname ? { nickname: i.nickname } : {}), ...(i.avatar ? { avatar: i.avatar } : {}) } } : {};
      const json = { type: i.type, from: 'operator', origin: 'chat', content: i.content, ...user, ...(i.fingerprint ? { fingerprint: i.fingerprint } : {}) };
      return call(ctx, 'conversations.sendMessage', { method: 'POST', path: `/conversation/${segment(i.sessionId)}/message`, json }, envelope(SentMessage));
    },
    /** `resolved`, `unresolved` or `pending`. */
    async setState(ctx: Context, input: SetStateInput) {
      const i = parse(SetStateInput, input);
      await call(ctx, 'conversations.setState', { method: 'PATCH', path: `/conversation/${segment(i.sessionId)}/state`, json: { state: i.state } }, z.unknown());
    },
    async resolve(ctx: Context, sessionId: string) {
      await conversations.setState(ctx, { sessionId, state: 'resolved' });
    },
    async getMeta(ctx: Context, sessionId: string) {
      return call(ctx, 'conversations.getMeta', { method: 'GET', path: `/conversation/${segment(sessionId)}/meta` }, envelope(ConversationMeta));
    },
    async updateMeta(ctx: Context, input: UpdateMetaInput) {
      const { sessionId, ...meta } = parse(UpdateMetaInput, input);
      await call(ctx, 'conversations.updateMeta', { method: 'PATCH', path: `/conversation/${segment(sessionId)}/meta`, json: meta }, z.unknown());
    },
  };

  return {
    people,
    conversations,

    /**
     * Who the signed-in user is, for the chat widget, signed on the server so nobody can chat as someone else: their
     * email with Crisp's identity verification signature, and a session token that ties their conversations to them.
     * Needs `CRISP_IDENTITY_SECRET`; a user without an email gets the session token only.
     */
    async chatIdentity(user: ChatUser): Promise<ChatIdentity> {
      return chatIdentityFor(cfg.identitySecret, user);
    },

    /** The widget's `<script>`, for the layout. See `README.md` for serving the loader and the page's policy. */
    widgetSnippet(options: WidgetSnippetOptions = {}) {
      return widgetSnippetFor(websiteId, options);
    },

    /**
     * The user's people profile, found by email or added, with the app's id kept in its data as `user_id` and
     * `attributes` merged in. `id` in the answer is Crisp's `people_id`, for `trackEvent`. Crisp keys profiles by
     * email, so a user without one fails with `crisp/email-required`.
     */
    async upsertContact(ctx: Context, input: UpsertContactInput): Promise<{ id: string; created: boolean }> {
      const i = parse(UpsertContactInput, input);
      if (!i.email) throw new CrispError('crisp/email-required', 'Crisp keys people profiles by email: pass the user’s email', { category: 'invalid-request' });
      let profile = await people.get(ctx, i.email).catch(unlessNotFound);
      let created = false;
      if (!profile) {
        try {
          const { people_id } = await people.create(ctx, { email: i.email, nickname: i.name ?? i.email });
          profile = { people_id };
          created = true;
        } catch (error) {
          // Another request added it in between
          if (!(error instanceof CrispError && error.category === 'conflict')) throw error;
          profile = await people.get(ctx, i.email);
        }
      } else if (i.name && profile.person?.nickname !== i.name) {
        await people.update(ctx, { peopleId: profile.people_id, nickname: i.name });
      }
      await people.updateData(ctx, { peopleId: profile.people_id, data: { ...i.attributes, user_id: i.id } });
      return { id: profile.people_id, created };
    },

    /** Stacks an event on the person's timeline: `userId` is the `id` `upsertContact` returned, or their email. */
    async trackEvent(ctx: Context, input: TrackEventInput): Promise<void> {
      const i = parse(TrackEventInput, input);
      await people.addEvent(ctx, { peopleId: i.userId, text: i.name, data: i.metadata });
    },
  };
}

export type Crisp = ReturnType<typeof createCrisp>;

/**
 * Crisp's error body is `{ error: true, reason, data }`: the reason is kept, `data.message` isn't (it can echo input).
 * Crisp limits with 429 or 420 ("Enhance Your Calm").
 */
function failure(status: number, body: unknown): FailureInfo | undefined {
  const reason = typeof body === 'object' && body !== null && typeof (body as { reason?: unknown }).reason === 'string' ? (body as { reason: string }).reason : undefined;
  if (status === 420 || status === 429) return { providerCode: reason, category: 'rate-limited', reason: 'rate-limited' };
  const mapped = mappedFailure(errorMap, reason);
  return { providerCode: reason, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

function unlessNotFound(error: unknown): undefined {
  if (error instanceof CrispError && error.category === 'not-found') return undefined;
  throw error;
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Crisp input');
  return parsed.data;
}

function segment(value: string): string {
  if (typeof value !== 'string' || value === '') throw new ValidationError('A Crisp id is a non-empty string');
  return encodeURIComponent(value);
}
