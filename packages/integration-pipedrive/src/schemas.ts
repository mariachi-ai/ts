import { z } from 'zod';

/**
 * Pipedrive's shapes, as far as an app reads them. Unknown fields pass through (`passthrough`), so a field
 * Pipedrive adds doesn't fail the boundary; a field the app relies on that goes missing does. Ids are numbers,
 * as Pipedrive gives them; the shared CRM helpers (`upsertContactByEmail`, `createDeal`, `addNote`) take and
 * return them as strings.
 */

const Id = z.number().int().positive();
const OptionalString = z.string().nullish();

/** A field value as an app sets one: Pipedrive field codes to values. `null` clears a custom field. */
export const FieldValues = z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]));
export type FieldValues = z.infer<typeof FieldValues>;

/** One of a person's email addresses or phone numbers. */
export const ContactPoint = z.object({ value: z.string(), primary: z.boolean().optional(), label: OptionalString }).passthrough();
export type ContactPoint = z.infer<typeof ContactPoint>;

export const Person = z
  .object({
    id: Id,
    name: z.string(),
    first_name: OptionalString,
    last_name: OptionalString,
    owner_id: z.number().nullish(),
    org_id: z.number().nullish(),
    emails: z.array(ContactPoint).default([]),
    phones: z.array(ContactPoint).default([]),
    add_time: OptionalString,
    update_time: OptionalString,
    /** Custom field values by their 40-character field code. */
    custom_fields: z.record(z.unknown()).nullish(),
  })
  .passthrough();
export type Person = z.infer<typeof Person>;

export const Organization = z
  .object({
    id: Id,
    name: z.string(),
    owner_id: z.number().nullish(),
    add_time: OptionalString,
    update_time: OptionalString,
    custom_fields: z.record(z.unknown()).nullish(),
  })
  .passthrough();
export type Organization = z.infer<typeof Organization>;

export const Deal = z
  .object({
    id: Id,
    title: z.string(),
    owner_id: z.number().nullish(),
    person_id: z.number().nullish(),
    org_id: z.number().nullish(),
    pipeline_id: z.number().nullish(),
    stage_id: z.number().nullish(),
    value: z.number().nullish(),
    currency: OptionalString,
    /** `open`, `won`, `lost` or `deleted`. */
    status: OptionalString,
    add_time: OptionalString,
    update_time: OptionalString,
    custom_fields: z.record(z.unknown()).nullish(),
  })
  .passthrough();
export type Deal = z.infer<typeof Deal>;

export const Pipeline = z.object({ id: Id, name: z.string(), order_nr: z.number().optional(), is_deleted: z.boolean().optional() }).passthrough();
export type Pipeline = z.infer<typeof Pipeline>;

export const Stage = z
  .object({ id: Id, name: z.string(), pipeline_id: z.number(), order_nr: z.number().optional(), is_deleted: z.boolean().optional(), deal_probability: z.number().nullish() })
  .passthrough();
export type Stage = z.infer<typeof Stage>;

/** A person, organization or deal field: `field_code` is the key its value is set and read under. */
export const Field = z
  .object({
    field_name: z.string(),
    /** `name`, `owner_id`… for a standard field; a 40-character hash for a custom one. */
    field_code: z.string(),
    field_type: z.string(),
    is_custom_field: z.boolean().optional(),
    options: z.array(z.object({ id: z.union([z.number(), z.string()]), label: z.string() }).passthrough()).nullish(),
  })
  .passthrough();
export type Field = z.infer<typeof Field>;

export const Note = z
  .object({
    id: Id,
    /** HTML, sanitized by Pipedrive. */
    content: z.string(),
    person_id: z.number().nullish(),
    org_id: z.number().nullish(),
    deal_id: z.number().nullish(),
    lead_id: OptionalString,
    user_id: z.number().nullish(),
    add_time: OptionalString,
    update_time: OptionalString,
  })
  .passthrough();
export type Note = z.infer<typeof Note>;

/** A webhook as Pipedrive answers with it. Its Basic auth password is dropped: the app has it in its settings. */
export const Webhook = z
  .object({
    id: Id,
    event_action: z.string(),
    event_object: z.string(),
    subscription_url: z.string(),
    name: z.string().nullish(),
    version: z.string().nullish(),
    is_active: z.union([z.number(), z.boolean()]).nullish(),
    last_http_status: z.number().nullish(),
  })
  .passthrough()
  .transform(({ http_auth_password: _password, ...rest }) => rest);
export type Webhook = z.output<typeof Webhook>;

/** A page of a v2 list: its items and the cursor for the next page, `null` on the last. */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

/** API v2's envelope around one object: `{ success, data }`. */
export function one<T extends z.ZodTypeAny>(item: T) {
  return z.object({ success: z.boolean().optional(), data: item }).passthrough().transform((r) => r.data as z.output<T>);
}

/** API v2's envelope around a list: `{ success, data: [], additional_data: { next_cursor } }`. */
export function page<T extends z.ZodTypeAny>(item: T) {
  return z
    .object({ data: z.array(item).nullable(), additional_data: z.object({ next_cursor: z.string().nullish() }).passthrough().nullish() })
    .passthrough()
    .transform((r): Page<z.output<T>> => ({ items: (r.data ?? []) as z.output<T>[], nextCursor: r.additional_data?.next_cursor ?? null }));
}

/** A search hit: the item and how well it matched. */
export interface SearchHit<T> {
  item: T;
  score: number;
}

/** API v2's search answer: `{ data: { items: [{ result_score, item }] }, additional_data: { next_cursor } }`. */
export function searchPage<T extends z.ZodTypeAny>(item: T) {
  return z
    .object({
      data: z.object({ items: z.array(z.object({ result_score: z.number(), item }).passthrough()) }).passthrough().nullable(),
      additional_data: z.object({ next_cursor: z.string().nullish() }).passthrough().nullish(),
    })
    .passthrough()
    .transform((r): Page<SearchHit<z.output<T>>> => ({
      items: (r.data?.items ?? []).map((hit) => ({ item: hit.item as z.output<T>, score: hit.result_score })),
      nextCursor: r.additional_data?.next_cursor ?? null,
    }));
}

/** A person as search finds them: emails and phones are plain strings here. */
export const PersonHit = z
  .object({
    id: Id,
    name: z.string(),
    emails: z.array(z.string()).default([]),
    phones: z.array(z.string()).default([]),
    organization: z.object({ id: z.number(), name: z.string().nullish() }).passthrough().nullish(),
  })
  .passthrough();
export type PersonHit = z.infer<typeof PersonHit>;

export const OrganizationHit = z.object({ id: Id, name: z.string() }).passthrough();
export type OrganizationHit = z.infer<typeof OrganizationHit>;

/** A page of a v1 list, paged by offset: the next page starts at `nextStart`, `null` on the last. */
export interface OffsetPage<T> {
  items: T[];
  nextStart: number | null;
}

/** API v1's list answer: `{ data: [], additional_data: { pagination: { more_items_in_collection, next_start } } }`. */
export function offsetPage<T extends z.ZodTypeAny>(item: T) {
  return z
    .object({
      data: z.array(item).nullable(),
      additional_data: z
        .object({ pagination: z.object({ more_items_in_collection: z.boolean().optional(), next_start: z.number().optional() }).passthrough().optional() })
        .passthrough()
        .nullish(),
    })
    .passthrough()
    .transform((r): OffsetPage<z.output<T>> => {
      const p = r.additional_data?.pagination;
      return { items: (r.data ?? []) as z.output<T>[], nextStart: p?.more_items_in_collection && p.next_start !== undefined ? p.next_start : null };
    });
}

// Inputs

const IdInput = z.number().int().positive();
const Cursor = { cursor: z.string().min(1).optional() };
/** v2 lists take up to 500 a page. */
const Limit500 = { limit: z.number().int().min(1).max(500).optional() };

export const CreatePersonInput = z.object({
  name: z.string().min(1),
  emails: z.array(z.object({ value: z.string().email(), primary: z.boolean().optional(), label: z.string().optional() })).optional(),
  phones: z.array(z.object({ value: z.string().min(1), primary: z.boolean().optional(), label: z.string().optional() })).optional(),
  orgId: IdInput.optional(),
  ownerId: IdInput.optional(),
  /** More fields by their field code; a 40-character code goes under `custom_fields` (see `fieldsBody`). */
  fields: FieldValues.optional(),
});
export type CreatePersonInput = z.input<typeof CreatePersonInput>;

export const UpdatePersonInput = CreatePersonInput.partial().extend({ id: IdInput });
export type UpdatePersonInput = z.input<typeof UpdatePersonInput>;

export const ListPersonsInput = z.object({ orgId: IdInput.optional(), ownerId: IdInput.optional(), updatedSince: z.string().optional(), ...Limit500, ...Cursor });
export type ListPersonsInput = z.input<typeof ListPersonsInput>;

export const SearchPersonsInput = z.object({
  /** At least 2 characters, or 1 with `exactMatch`. */
  term: z.string().min(1),
  fields: z.array(z.enum(['name', 'email', 'phone', 'notes', 'custom_fields'])).optional(),
  /** Only full matches, not case-sensitive. */
  exactMatch: z.boolean().optional(),
  orgId: IdInput.optional(),
  limit: z.number().int().min(1).max(100).optional(),
  ...Cursor,
});
export type SearchPersonsInput = z.input<typeof SearchPersonsInput>;

export const CreateOrganizationInput = z.object({ name: z.string().min(1), ownerId: IdInput.optional(), fields: FieldValues.optional() });
export type CreateOrganizationInput = z.input<typeof CreateOrganizationInput>;

export const SearchOrganizationsInput = z.object({
  term: z.string().min(1),
  fields: z.array(z.enum(['name', 'address', 'notes', 'custom_fields'])).optional(),
  exactMatch: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  ...Cursor,
});
export type SearchOrganizationsInput = z.input<typeof SearchOrganizationsInput>;

export const CreateDealInput = z.object({
  title: z.string().min(1),
  /** The deal's value, in `currency`. */
  value: z.number().nonnegative().optional(),
  /** A three-letter code: `EUR`. The company's default when unset. */
  currency: z.string().length(3).optional(),
  personId: IdInput.optional(),
  orgId: IdInput.optional(),
  pipelineId: IdInput.optional(),
  /** A stage's id, from `stages.list`. The pipeline's first stage when unset. */
  stageId: IdInput.optional(),
  status: z.enum(['open', 'won', 'lost']).optional(),
  ownerId: IdInput.optional(),
  expectedCloseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD').optional(),
  fields: FieldValues.optional(),
});
export type CreateDealInput = z.input<typeof CreateDealInput>;

export const UpdateDealInput = CreateDealInput.partial().extend({ id: IdInput });
export type UpdateDealInput = z.input<typeof UpdateDealInput>;

export const ListDealsInput = z.object({
  personId: IdInput.optional(),
  orgId: IdInput.optional(),
  pipelineId: IdInput.optional(),
  stageId: IdInput.optional(),
  status: z.array(z.enum(['open', 'won', 'lost', 'deleted'])).optional(),
  updatedSince: z.string().optional(),
  ...Limit500,
  ...Cursor,
});
export type ListDealsInput = z.input<typeof ListDealsInput>;

export const ListStagesInput = z.object({ pipelineId: IdInput.optional(), ...Limit500, ...Cursor });
export type ListStagesInput = z.input<typeof ListStagesInput>;

export const ListPageInput = z.object({ ...Limit500, ...Cursor });
export type ListPageInput = z.input<typeof ListPageInput>;

export const CreateNoteInput = z
  .object({
    /** HTML; Pipedrive sanitizes it. For plain text, pass `noteHtml(text)`. */
    content: z.string().min(1),
    personId: IdInput.optional(),
    orgId: IdInput.optional(),
    dealId: IdInput.optional(),
    /** A lead's id (a UUID in Pipedrive). */
    leadId: z.string().min(1).optional(),
  })
  .refine((n) => n.personId ?? n.orgId ?? n.dealId ?? n.leadId, { message: 'A note belongs to a person, an organization, a deal or a lead: give one of their ids' });
export type CreateNoteInput = z.input<typeof CreateNoteInput>;

export const ListNotesInput = z.object({
  personId: IdInput.optional(),
  orgId: IdInput.optional(),
  dealId: IdInput.optional(),
  start: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(500).optional(),
});
export type ListNotesInput = z.input<typeof ListNotesInput>;

export const WEBHOOK_ACTIONS = ['create', 'change', 'delete', '*'] as const;
export const WEBHOOK_OBJECTS = ['activity', 'deal', 'lead', 'note', 'organization', 'person', 'pipeline', 'product', 'stage', 'user', '*'] as const;

export const CreateWebhookInput = z.object({
  /** A public HTTPS URL that doesn't redirect. Pipedrive doesn't accept self-signed certificates. */
  url: z.string().url(),
  /** `create`, `change`, `delete`, or `*` for all three. */
  action: z.enum(WEBHOOK_ACTIONS),
  /** `person`, `organization`, `deal`, `note`…, or `*` for every object. */
  object: z.enum(WEBHOOK_OBJECTS),
  /** The webhook's name in Pipedrive. */
  name: z.string().min(1),
});
export type CreateWebhookInput = z.input<typeof CreateWebhookInput>;

// The shared CRM helpers: the same three, with the same shapes, in every CRM integration

const SharedId = z.string().regex(/^\d+$/, "a Pipedrive id: digits, as the helpers return them");

export const UpsertContactInput = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  /** An organization's name: found by exact name, or made. */
  company: z.string().min(1).optional(),
  /** Pipedrive field codes to values; a 40-character code is a custom field. */
  properties: FieldValues.optional(),
});
export type UpsertContactInput = z.input<typeof UpsertContactInput>;

export const SharedCreateDealInput = z.object({
  name: z.string().min(1),
  amount: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  /** A stage's id, or its name (resolved through `stages.list`, not case-sensitive). */
  stage: z.string().min(1).optional(),
  contactId: SharedId.optional(),
  companyId: SharedId.optional(),
  properties: FieldValues.optional(),
});
export type SharedCreateDealInput = z.input<typeof SharedCreateDealInput>;

export const AddNoteInput = z
  .object({
    /** HTML, sanitized by Pipedrive. For plain text, pass `noteHtml(text)`. */
    body: z.string().min(1),
    contactId: SharedId.optional(),
    dealId: SharedId.optional(),
    companyId: SharedId.optional(),
  })
  .refine((n) => n.contactId ?? n.dealId ?? n.companyId, { message: 'A Pipedrive note belongs to a contact, a deal or a company: give one of their ids' });
export type AddNoteInput = z.input<typeof AddNoteInput>;

// Webhooks v2

const IdLike = z.union([z.string(), z.number()]);

/** A webhook v2 delivery's `meta`: what happened, to what, and the event's id. */
export const WebhookMeta = z
  .object({
    /** The event's id: the same id for each retry is what deduplication relies on. */
    id: z.string(),
    /** `create`, `change` or `delete`. */
    action: z.string(),
    /** `person`, `organization`, `deal`, `note`… */
    entity: z.string(),
    entity_id: IdLike.optional(),
    company_id: IdLike.optional(),
    user_id: IdLike.optional(),
    webhook_id: IdLike.optional(),
    timestamp: z.string().optional(),
    version: z.literal('2.0'),
    /** 1 for the first delivery, up to 4 with Pipedrive's retries. */
    attempt: z.number().optional(),
    /** `app` (the web app) or `api`. */
    change_source: z.string().optional(),
    is_bulk_edit: z.boolean().optional(),
    /** On a delete caused by a merge: the id the object was merged into. */
    merged_to_id: IdLike.optional(),
  })
  .passthrough();
export type WebhookMeta = z.infer<typeof WebhookMeta>;

/**
 * What Pipedrive posts for a v2 webhook. `data` is the object now (`null` on delete); `previous` is `null` on
 * create, the fields that changed on change, and the object as it was on delete.
 */
export const WebhookEvent = z
  .object({
    meta: WebhookMeta,
    data: z.record(z.unknown()).nullable(),
    previous: z.record(z.unknown()).nullable().optional(),
  })
  .passthrough();
export type WebhookEvent = z.infer<typeof WebhookEvent>;
