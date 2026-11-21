import { z } from 'zod';

/**
 * Mailchimp's shapes, as far as an app reads them. Unknown fields pass through (`passthrough`), so a field
 * Mailchimp adds doesn't fail the boundary; a field the app relies on that goes missing does.
 */

/**
 * A contact's status in the audience. `pending` is waiting for the person to confirm by email (double opt-in);
 * `cleaned` is an address Mailchimp stopped sending to because it bounced; `transactional` was added for
 * non-marketing mail and gets no campaigns. Mailchimp sets `cleaned` itself.
 */
export const MemberStatus = z.enum(['subscribed', 'unsubscribed', 'cleaned', 'pending', 'transactional']);
export type MemberStatus = z.infer<typeof MemberStatus>;

/** The statuses an app sets. */
export const SettableStatus = z.enum(['subscribed', 'unsubscribed', 'pending', 'transactional']);
export type SettableStatus = z.infer<typeof SettableStatus>;

/** Merge fields by tag (`FNAME`, `LNAME`, or the audience's own): what campaigns fill in. */
export const MergeFieldValues = z.record(z.unknown());
export type MergeFieldValues = z.infer<typeof MergeFieldValues>;

export const Member = z
  .object({
    /** The subscriber hash: the MD5 of the lowercased address (`subscriberHash`). */
    id: z.string(),
    email_address: z.string(),
    /** One of `MemberStatus`, or `archived` for an archived contact. */
    status: z.string(),
    list_id: z.string().optional(),
    contact_id: z.string().optional(),
    merge_fields: MergeFieldValues.nullable().optional(),
    tags: z.array(z.object({ id: z.number().optional(), name: z.string() }).passthrough()).optional(),
    language: z.string().optional(),
    timestamp_signup: z.string().optional(),
    timestamp_opt: z.string().optional(),
    last_changed: z.string().optional(),
  })
  .passthrough();
export type Member = z.infer<typeof Member>;

export const MergeField = z
  .object({
    merge_id: z.number().optional(),
    /** The merge tag: the key in `mergeFields` (`FNAME`). */
    tag: z.string(),
    name: z.string().optional(),
    type: z.string().optional(),
    required: z.boolean().optional(),
    default_value: z.string().optional(),
  })
  .passthrough();
export type MergeField = z.infer<typeof MergeField>;

export const MergeFieldPage = z.object({ merge_fields: z.array(MergeField).default([]), total_items: z.number().optional() }).passthrough();
export type MergeFieldPage = z.infer<typeof MergeFieldPage>;

export const BatchResult = z
  .object({
    new_members: z.array(Member.partial().passthrough()).default([]),
    updated_members: z.array(Member.partial().passthrough()).default([]),
    /** The addresses that weren't added or updated, each with `error_code` (`ERROR_CONTACT_EXISTS`, `ERROR_GENERIC`) and the `field` at fault. */
    errors: z
      .array(z.object({ email_address: z.string().optional(), error_code: z.string().optional(), field: z.string().optional() }).passthrough())
      .default([]),
    total_created: z.number().optional(),
    total_updated: z.number().optional(),
    error_count: z.number().optional(),
  })
  .passthrough();
export type BatchResult = z.infer<typeof BatchResult>;

const WebhookEvents = z
  .object({
    subscribe: z.boolean().optional(),
    unsubscribe: z.boolean().optional(),
    profile: z.boolean().optional(),
    cleaned: z.boolean().optional(),
    upemail: z.boolean().optional(),
    campaign: z.boolean().optional(),
  })
  .passthrough();
const WebhookSources = z.object({ user: z.boolean().optional(), admin: z.boolean().optional(), api: z.boolean().optional() }).passthrough();

export const Webhook = z
  .object({
    id: z.string(),
    url: z.string(),
    list_id: z.string().optional(),
    events: WebhookEvents.optional(),
    sources: WebhookSources.optional(),
    signing_enabled: z.boolean().optional(),
  })
  .passthrough();
export type Webhook = z.infer<typeof Webhook>;

/** A created webhook: with its signing secret, which Mailchimp returns this once. */
export const CreatedWebhook = Webhook.extend({ signing_secret: z.string().optional() });
export type CreatedWebhook = z.infer<typeof CreatedWebhook>;

export const WebhookList = z.object({ webhooks: z.array(Webhook).default([]) }).passthrough();

// What the app sends

const Email = z.string().trim().email();
const Tag = z.string().trim().min(1);

export const SubscribeInput = z.object({
  email: Email,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  /** Other merge fields by tag. `firstName` and `lastName` win over `FNAME` and `LNAME` here. */
  mergeFields: MergeFieldValues.optional(),
  /** Added to the contact, never removed. */
  tags: z.array(Tag).optional(),
  /**
   * Mailchimp emails the person to confirm, and they're `pending` until they do. Leave it on: turn it off only
   * where the person has already confirmed their address with the app and asked for the newsletter there.
   */
  doubleOptIn: z.boolean().default(true),
  /** The contact's language, as Mailchimp's codes (`en`, `fr`). */
  language: z.string().optional(),
  /** The address the person signed up from: a record of their consent. */
  ipSignup: z.string().optional(),
});
export type SubscribeInput = z.input<typeof SubscribeInput>;

export const UpsertMemberInput = z.object({
  email: Email,
  /** The status a contact that isn't in the audience yet gets. */
  statusIfNew: SettableStatus,
  /** Sets the status of an existing contact too. Leave it unset to keep theirs. */
  status: SettableStatus.optional(),
  mergeFields: MergeFieldValues.optional(),
  language: z.string().optional(),
  emailType: z.enum(['html', 'text']).optional(),
  ipSignup: z.string().optional(),
  /** Accept the contact without the audience's required merge fields. */
  skipMergeValidation: z.boolean().optional(),
});
export type UpsertMemberInput = z.input<typeof UpsertMemberInput>;

export const UpdateMemberInput = z.object({
  email: Email,
  /** A new address for the contact. */
  newEmail: Email.optional(),
  mergeFields: MergeFieldValues.optional(),
  status: SettableStatus.optional(),
  language: z.string().optional(),
  skipMergeValidation: z.boolean().optional(),
});
export type UpdateMemberInput = z.input<typeof UpdateMemberInput>;

export const UpdateTagsInput = z
  .object({
    email: Email,
    add: z.array(Tag).default([]),
    remove: z.array(Tag).default([]),
    /** Don't start the automations these tags would. */
    isSyncing: z.boolean().optional(),
  })
  .refine((i) => i.add.length + i.remove.length > 0, { message: 'add or remove at least one tag' });
export type UpdateTagsInput = z.input<typeof UpdateTagsInput>;

export const BatchMembersInput = z.object({
  /** Up to 500 a call. */
  members: z
    .array(z.object({ email: Email, status: SettableStatus, mergeFields: MergeFieldValues.optional() }))
    .min(1)
    .max(500),
  /** Change existing contacts' status and fields too. Off, existing contacts are left alone. */
  updateExisting: z.boolean().default(false),
});
export type BatchMembersInput = z.input<typeof BatchMembersInput>;

export const ListMergeFieldsInput = z.object({
  /** At most 1000; Mailchimp's default is 10. */
  count: z.number().int().min(1).max(1000).optional(),
  offset: z.number().int().min(0).optional(),
});
export type ListMergeFieldsInput = z.input<typeof ListMergeFieldsInput>;

export const CreateWebhookInput = z.object({
  url: z.string().url(),
  /** Which events to send. By default every contact event, and not campaigns. */
  events: z
    .object({
      subscribe: z.boolean().default(true),
      unsubscribe: z.boolean().default(true),
      profile: z.boolean().default(true),
      upemail: z.boolean().default(true),
      cleaned: z.boolean().default(true),
      campaign: z.boolean().default(false),
    })
    .default({}),
  /**
   * Who made the change: the contact (`user`), someone in Mailchimp (`admin`), or the API (`api`). By default not
   * `api`: the app already knows what it changed itself.
   */
  sources: z.object({ user: z.boolean().default(true), admin: z.boolean().default(true), api: z.boolean().default(false) }).default({}),
});
export type CreateWebhookInput = z.input<typeof CreateWebhookInput>;
