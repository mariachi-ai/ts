/**
 * `@mariachi/integration-mailchimp/testing`: a Mailchimp audience for an app's tests, held in memory, with the same
 * shape as `createMailchimp`'s client; and signed webhooks to post to the app's endpoint.
 */
import { NotFoundError, ValidationError } from '@mariachi/core';
import { signStripeWebhook } from '@mariachi/webhooks';
import type { Mailchimp } from './client';
import { MailchimpError } from './errors';
import { subscriberHash } from './hash';
import type { CreatedWebhook, Member, MergeField, MergeFieldValues, Webhook } from './schemas';
import type { MailchimpWebhookBody } from './webhooks';

export interface FakeMailchimp extends Mailchimp {
  /** The audience's contacts, by subscriber hash. */
  members_: Map<string, Member>;
  /** Contacts deleted permanently: they can't be added again. */
  forgotten_: Set<string>;
  webhooks_: Map<string, Webhook>;
}

/**
 * An in-memory audience: seed contacts and merge fields, then hand it to the code under test in place of the
 * client. It behaves as Mailchimp does where an app relies on it: `subscribe` leaves a new contact `pending` with
 * double opt-in, a permanently deleted address can't come back, and an unknown address is not found.
 */
export function fakeMailchimp(seed: { members?: Member[]; mergeFields?: MergeField[]; audienceId?: string } = {}): FakeMailchimp {
  const listId = seed.audienceId ?? 'test-audience';
  const members_ = new Map((seed.members ?? []).map((m) => [subscriberHash(m.email_address), m]));
  const forgotten_ = new Set<string>();
  const webhooks_ = new Map<string, Webhook>();
  const fields = seed.mergeFields ?? [
    { tag: 'FNAME', name: 'First Name', type: 'text', required: false },
    { tag: 'LNAME', name: 'Last Name', type: 'text', required: false },
  ];
  const email = (value: string) => {
    const trimmed = value.trim();
    if (!/^[^@\s]+@[^@\s]+$/.test(trimmed)) throw new ValidationError('Invalid Mailchimp input', [{ path: ['email'], message: 'Invalid email' }]);
    return trimmed;
  };
  const existing = (address: string) => {
    const m = members_.get(subscriberHash(email(address)));
    if (!m) throw new NotFoundError('mailchimp member');
    return m;
  };
  const put = (address: string, change: { status?: string; merge_fields?: MergeFieldValues; language?: string }, statusIfNew?: string) => {
    const hash = subscriberHash(email(address));
    const current = members_.get(hash);
    if (!current && forgotten_.has(hash)) {
      throw new MailchimpError('mailchimp/forgotten-email', 'mailchimp members.upsert failed (400)', { category: 'invalid-request', providerCode: 'Forgotten Email Not Subscribed', status: 400 });
    }
    const next: Member = {
      id: hash,
      email_address: current?.email_address ?? email(address),
      list_id: listId,
      tags: [],
      ...current,
      status: change.status ?? current?.status ?? statusIfNew ?? 'subscribed',
      merge_fields: { ...current?.merge_fields, ...change.merge_fields },
      ...(change.language ? { language: change.language } : {}),
      last_changed: new Date().toISOString(),
    };
    members_.set(hash, next);
    return next;
  };

  const fake: FakeMailchimp = {
    members_,
    forgotten_,
    webhooks_,
    async subscribe(_ctx, input) {
      const status = input.doubleOptIn === false ? 'subscribed' : 'pending';
      const merge: MergeFieldValues = { ...input.mergeFields };
      if (input.firstName !== undefined) merge.FNAME = input.firstName;
      if (input.lastName !== undefined) merge.LNAME = input.lastName;
      let contact = put(input.email, { merge_fields: merge, language: input.language }, status);
      if (contact.status === 'unsubscribed') contact = put(input.email, { status });
      if (input.tags?.length) await fake.members.updateTags(_ctx, { email: input.email, add: input.tags });
      return members_.get(contact.id) ?? contact;
    },
    members: {
      async upsert(_ctx, input) {
        return put(input.email, { status: input.status, merge_fields: input.mergeFields, language: input.language }, input.statusIfNew);
      },
      async get(_ctx, address) {
        return existing(address);
      },
      async update(_ctx, input) {
        const current = existing(input.email);
        const updated = put(input.email, { status: input.status, merge_fields: input.mergeFields, language: input.language });
        if (input.newEmail && input.newEmail !== current.email_address) {
          members_.delete(current.id);
          const moved = { ...updated, id: subscriberHash(input.newEmail), email_address: input.newEmail };
          members_.set(moved.id, moved);
          return moved;
        }
        return updated;
      },
      async unsubscribe(ctx, address) {
        return fake.members.update(ctx, { email: address, status: 'unsubscribed' });
      },
      async archive(_ctx, address) {
        members_.delete(existing(address).id);
      },
      async deletePermanently(_ctx, address) {
        const m = existing(address);
        members_.delete(m.id);
        forgotten_.add(m.id);
      },
      async updateTags(_ctx, input) {
        const m = existing(input.email);
        const names = new Set((m.tags ?? []).map((t) => t.name));
        for (const t of input.add ?? []) names.add(t);
        for (const t of input.remove ?? []) names.delete(t);
        members_.set(m.id, { ...m, tags: [...names].map((name) => ({ name })) });
      },
      async batch(_ctx, input) {
        const result = { new_members: [] as Member[], updated_members: [] as Member[], errors: [] as Array<{ email_address: string; error_code: string }> };
        for (const m of input.members) {
          const had = members_.has(subscriberHash(m.email));
          if (had && !input.updateExisting) {
            result.errors.push({ email_address: m.email, error_code: 'ERROR_CONTACT_EXISTS' });
            continue;
          }
          const contact = put(m.email, { status: m.status, merge_fields: m.mergeFields });
          (had ? result.updated_members : result.new_members).push(contact);
        }
        return { ...result, total_created: result.new_members.length, total_updated: result.updated_members.length, error_count: result.errors.length };
      },
    },
    mergeFields: {
      async list(_ctx, input = {}) {
        const offset = input.offset ?? 0;
        return { merge_fields: fields.slice(offset, offset + (input.count ?? 10)), total_items: fields.length };
      },
    },
    webhooks: {
      async create(_ctx, input) {
        const hook: CreatedWebhook = { id: `wh_${webhooks_.size + 1}`, url: input.url, list_id: listId, signing_enabled: true, signing_secret: `whsec_test_${webhooks_.size + 1}` };
        const { signing_secret: _secret, ...stored } = hook;
        webhooks_.set(hook.id, stored);
        return hook;
      },
      async list() {
        return [...webhooks_.values()];
      },
      async delete(_ctx, webhookId) {
        if (!webhooks_.delete(webhookId)) throw new NotFoundError('mailchimp webhook', webhookId);
      },
    },
  };
  return fake;
}

/** A contact to seed the fake with. */
export function mailchimpMember(address: string, overrides: Partial<Member> = {}): Member {
  return { id: subscriberHash(address), email_address: address, status: 'subscribed', list_id: 'test-audience', merge_fields: {}, tags: [], ...overrides };
}

/** An event as Mailchimp's form encoding carries it: `type=unsubscribe&fired_at=…&data[email]=…&data[merges][FNAME]=…`. */
export function mailchimpWebhookForm(event: { type: MailchimpWebhookBody['type']; fired_at?: string; data: Record<string, unknown> }): string {
  const form = new URLSearchParams();
  const add = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'object') for (const [k, v] of Object.entries(value as Record<string, unknown>)) add(`${key}[${k}]`, v);
    else form.append(key, String(value));
  };
  form.append('type', event.type);
  form.append('fired_at', event.fired_at ?? '2026-11-21 10:00:00');
  for (const [k, v] of Object.entries(event.data)) add(`data[${k}]`, v);
  return form.toString();
}

/**
 * The body and headers Mailchimp would send for this event, form-encoded and signed with the webhook's secret:
 * `X-Mailchimp-Signature: t=<now>,v1=<hex>`. Post it to the app's endpoint.
 */
export function signedMailchimpWebhook(
  event: Parameters<typeof mailchimpWebhookForm>[0],
  secret: string,
  options: { timestampSeconds?: number } = {},
): { rawBody: string; headers: Record<string, string> } {
  const rawBody = mailchimpWebhookForm(event);
  const t = options.timestampSeconds ?? Math.floor(Date.now() / 1000);
  return { rawBody, headers: { 'content-type': 'application/x-www-form-urlencoded', 'x-mailchimp-signature': signStripeWebhook(secret, t, rawBody) } };
}
