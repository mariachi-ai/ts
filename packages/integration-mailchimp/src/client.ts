import { ConfigError, type Context, fromZodError } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { MailchimpError } from './errors';
import { type MailchimpConfig, type MailchimpOperation, configSchema, errorMap, provider } from './generated';
import { serverPrefixOf, subscriberHash } from './hash';
import {
  BatchMembersInput,
  BatchResult,
  CreateWebhookInput,
  CreatedWebhook,
  ListMergeFieldsInput,
  Member,
  MergeFieldPage,
  type MergeFieldValues,
  SubscribeInput,
  UpdateMemberInput,
  UpdateTagsInput,
  UpsertMemberInput,
  WebhookList,
} from './schemas';

export interface MailchimpDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

/**
 * The Mailchimp Marketing API client for the app's audience: each operation takes `ctx` first, checks its input
 * and Mailchimp's answer, and makes one span (`mailchimp members.upsert`). Contacts are named by email; the
 * client hashes it (`subscriberHash`). Build it once at startup and share it.
 *
 * ```ts
 * const mailchimp = createMailchimp(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * await mailchimp.subscribe(ctx, { email, firstName, tags: ['signup-page'] });   // double opt-in
 * ```
 */
export function createMailchimp(config: MailchimpConfig, deps: MailchimpDeps = {}) {
  const cfg = configSchema.parse(config);
  const prefix = cfg.serverPrefix ?? serverPrefixOf(cfg.apiKey);
  if (!prefix || !/^[a-z]+[0-9]+$/.test(prefix)) {
    throw new ConfigError('mailchimp/no-server-prefix', 'Set MAILCHIMP_SERVER_PREFIX (us6): the API key has no data center suffix after its dash');
  }
  const server = `${prefix}.api.mailchimp.com`;
  const base = `https://${server}/3.0`;
  const list = `/lists/${segment(cfg.audienceId)}`;
  const member = (email: string) => `${list}/members/${subscriberHash(email)}`;

  function call<T>(ctx: Context, operation: MailchimpOperation, request: Omit<ProviderRequest, 'url' | 'headers'> & { path: string }, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    const { path, ...rest } = request;
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server },
      { ...rest, url: `${base}${path}`, headers: { authorization: `Bearer ${cfg.apiKey}` } },
      { schema, error: MailchimpError, failure: failure(operation), deps },
    );
  }

  const members = {
    /**
     * Adds the contact, with `statusIfNew`, or updates it. An existing contact's status changes only when
     * `status` is given. For someone signing up, use `subscribe`, which does the double opt-in.
     */
    async upsert(ctx: Context, input: UpsertMemberInput) {
      const i = parse(UpsertMemberInput, input);
      return call(
        ctx,
        'members.upsert',
        {
          method: 'PUT',
          path: member(i.email),
          query: { skip_merge_validation: i.skipMergeValidation },
          json: { email_address: i.email, status_if_new: i.statusIfNew, status: i.status, merge_fields: i.mergeFields, language: i.language, email_type: i.emailType, ip_signup: i.ipSignup },
        },
        Member,
      );
    },
    /** The contact with this address, whatever its status. A contact who isn't in the audience fails as `mailchimp/not-found`. */
    async get(ctx: Context, email: string) {
      return call(ctx, 'members.get', { method: 'GET', path: member(parse(z.string().trim().email(), email)) }, Member);
    },
    /** Changes the contact's merge fields, status, language or address (`newEmail`). */
    async update(ctx: Context, input: UpdateMemberInput) {
      const i = parse(UpdateMemberInput, input);
      return call(
        ctx,
        'members.update',
        {
          method: 'PATCH',
          path: member(i.email),
          query: { skip_merge_validation: i.skipMergeValidation },
          json: { email_address: i.newEmail, merge_fields: i.mergeFields, status: i.status, language: i.language },
        },
        Member,
      );
    },
    /** Unsubscribes the contact: they stay in the audience, and get no campaigns. Do it whenever the person asks. */
    async unsubscribe(ctx: Context, email: string) {
      return members.update(ctx, { email, status: 'unsubscribed' });
    },
    /** Archives the contact: out of the audience, kept in the account's history, and can be added again. */
    async archive(ctx: Context, email: string) {
      await call(ctx, 'members.archive', { method: 'DELETE', path: member(parse(z.string().trim().email(), email)) }, z.unknown());
    },
    /**
     * Deletes everything personal about the contact, for an erasure request. The address can never be added
     * through the API again (`mailchimp/forgotten-email`): only the person can re-subscribe, through a Mailchimp form.
     */
    async deletePermanently(ctx: Context, email: string) {
      await call(ctx, 'members.deletePermanently', { method: 'POST', path: `${member(parse(z.string().trim().email(), email))}/actions/delete-permanent` }, z.unknown());
    },
    /** Adds and removes the contact's tags. A tag that doesn't exist yet is created. */
    async updateTags(ctx: Context, input: UpdateTagsInput) {
      const i = parse(UpdateTagsInput, input);
      const tags = [...i.add.map((name) => ({ name, status: 'active' as const })), ...i.remove.map((name) => ({ name, status: 'inactive' as const }))];
      await call(ctx, 'members.updateTags', { method: 'POST', path: `${member(i.email)}/tags`, json: { tags, is_syncing: i.isSyncing } }, z.unknown());
    },
    /**
     * Adds or updates up to 500 contacts in one call. Only for people who each asked to be on the list (an import
     * from a signup form that had its own consent). The answer lists the ones that failed; the call itself succeeds.
     */
    async batch(ctx: Context, input: BatchMembersInput) {
      const i = parse(BatchMembersInput, input);
      return call(
        ctx,
        'members.batch',
        {
          method: 'POST',
          path: list,
          json: { members: i.members.map((m) => ({ email_address: m.email, status: m.status, merge_fields: m.mergeFields })), update_existing: i.updateExisting },
        },
        BatchResult,
      );
    },
  };

  const mergeFields = {
    /** The audience's merge fields: each one's tag, name, type and whether it's required. */
    async list(ctx: Context, input: ListMergeFieldsInput = {}) {
      const i = parse(ListMergeFieldsInput, input);
      return call(ctx, 'mergeFields.list', { method: 'GET', path: `${list}/merge-fields`, query: { count: i.count, offset: i.offset } }, MergeFieldPage);
    },
  };

  const webhooks = {
    /**
     * Creates a webhook on the audience. The answer's `signing_secret` is shown this once: store it as
     * MAILCHIMP_WEBHOOK_SECRET. Mailchimp checks the URL with a GET first, so deploy the endpoint before creating it.
     * Not safe to repeat: list the webhooks first and create one only when the URL isn't there.
     */
    async create(ctx: Context, input: CreateWebhookInput) {
      const i = parse(CreateWebhookInput, input);
      return call(ctx, 'webhooks.create', { method: 'POST', path: `${list}/webhooks`, json: { url: i.url, events: i.events, sources: i.sources } }, CreatedWebhook);
    },
    async list(ctx: Context) {
      return call(ctx, 'webhooks.list', { method: 'GET', path: `${list}/webhooks` }, WebhookList).then((r) => r.webhooks);
    },
    async delete(ctx: Context, webhookId: string) {
      await call(ctx, 'webhooks.delete', { method: 'DELETE', path: `${list}/webhooks/${segment(parse(z.string().min(1), webhookId))}` }, z.unknown());
    },
  };

  /**
   * Subscribes someone who asked to be on the list. With double opt-in (the default) Mailchimp emails them to
   * confirm and they're `pending` until they do. A contact already subscribed stays subscribed; one who had
   * unsubscribed and asks again is re-subscribed the same way. Tags are added. Never call it for someone who
   * didn't ask: a signup's "send me the newsletter" box, unticked by default, is asking.
   */
  async function subscribe(ctx: Context, input: SubscribeInput) {
    const i = parse(SubscribeInput, input);
    const status = i.doubleOptIn ? 'pending' : 'subscribed';
    const fields: MergeFieldValues = { ...i.mergeFields };
    if (i.firstName !== undefined) fields.FNAME = i.firstName;
    if (i.lastName !== undefined) fields.LNAME = i.lastName;
    let contact = await members.upsert(ctx, {
      email: i.email,
      statusIfNew: status,
      mergeFields: Object.keys(fields).length ? fields : undefined,
      language: i.language,
      ipSignup: i.ipSignup,
    });
    if (contact.status === 'unsubscribed') contact = await members.update(ctx, { email: i.email, status });
    if (i.tags?.length) await members.updateTags(ctx, { email: i.email, add: i.tags });
    return contact;
  }

  return { subscribe, members, mergeFields, webhooks };
}

export type Mailchimp = ReturnType<typeof createMailchimp>;

/**
 * Mailchimp answers a failure as problem+json: `{ title, status, detail, errors? }`. The title is the code
 * (`Member Exists`); `detail` and each error's `message` aren't kept, since they can echo the address. The names of
 * the fields at fault (`errors[].field`, a merge tag such as `FNAME`) are.
 */
function failure(operation: MailchimpOperation) {
  return (status: number, body: unknown): FailureInfo | undefined => {
    const problem = typeof body === 'object' && body !== null ? (body as { title?: unknown; errors?: unknown }) : {};
    const title = typeof problem.title === 'string' ? problem.title : undefined;
    const mapped = mappedFailure(errorMap, title);
    const fields = Array.isArray(problem.errors)
      ? problem.errors.map((e) => (e as { field?: unknown })?.field).filter((f): f is string => typeof f === 'string' && /^[A-Za-z0-9_.]+$/.test(f))
      : [];
    return {
      providerCode: title,
      ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}),
      ...(fields.length ? { message: `mailchimp ${operation} failed (${status}): invalid ${[...new Set(fields)].join(', ')}` } : {}),
    };
  };
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Mailchimp input');
  return parsed.data;
}

function segment(value: string): string {
  return encodeURIComponent(value);
}
