import { z } from 'zod';

/**
 * HubSpot's shapes, as far as an app reads them. Unknown fields pass through (`passthrough`), so a field HubSpot
 * adds doesn't fail the boundary; a field the app relies on that goes missing does.
 */

/**
 * A property's value as HubSpot takes it. HubSpot stores every value as a string: numbers and booleans are sent
 * as their text (`"1500"`, `"true"`), and `null` clears the property.
 */
export const PropertyValue = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export type PropertyValue = z.infer<typeof PropertyValue>;

/** Properties by their internal name (`firstname`, `dealstage`, `hs_note_body`), never their label. */
export const Properties = z.record(PropertyValue);
export type Properties = z.infer<typeof Properties>;

/** A HubSpot record: a contact, company, deal or note. Every property comes back as a string, or null. */
export const CrmObject = z
  .object({
    id: z.string(),
    properties: z.record(z.string().nullable()).default({}),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    archived: z.boolean().optional(),
  })
  .passthrough();
export type CrmObject = z.infer<typeof CrmObject>;

const Paging = z.object({ next: z.object({ after: z.string() }).passthrough().optional() }).passthrough();

/** One page of a search: `paging.next.after` is the cursor of the next, absent on the last. */
export const SearchPage = z
  .object({
    total: z.number(),
    results: z.array(CrmObject),
    paging: Paging.optional(),
  })
  .passthrough();
export type SearchPage = z.infer<typeof SearchPage>;

export const UpsertResult = CrmObject.extend({
  /** True when the upsert created the record, false when it updated one. */
  new: z.boolean(),
});
export type UpsertResult = z.infer<typeof UpsertResult>;

const BatchError = z.object({ category: z.string().optional(), status: z.string().optional() }).passthrough();

/** A batch call's answer: 200 when every input worked, 207 with `errors` when some didn't. */
export const UpsertBatch = z
  .object({
    status: z.string(),
    results: z.array(UpsertResult),
    errors: z.array(BatchError).optional(),
    numErrors: z.number().optional(),
  })
  .passthrough();
export type UpsertBatch = z.infer<typeof UpsertBatch>;

export const PipelineStage = z
  .object({
    /** The internal id a deal's `dealstage` takes: not its label. */
    id: z.string(),
    label: z.string(),
    displayOrder: z.number(),
    archived: z.boolean().optional(),
    /** `probability` (a string, 0.0 to 1.0) and `isClosed` (`"true"` or `"false"`), as HubSpot keeps them. */
    metadata: z.record(z.unknown()).default({}),
  })
  .passthrough();
export type PipelineStage = z.infer<typeof PipelineStage>;

export const Pipeline = z
  .object({
    /** The internal id a deal's `pipeline` takes; the account's first is `default`. */
    id: z.string(),
    label: z.string(),
    displayOrder: z.number(),
    archived: z.boolean().optional(),
    stages: z.array(PipelineStage),
  })
  .passthrough();
export type Pipeline = z.infer<typeof Pipeline>;

export const PipelineList = z.object({ results: z.array(Pipeline) }).passthrough();

const Id = z.union([z.string(), z.number()]).transform(String);

export const AssociationType = z
  .object({
    category: z.string(),
    typeId: z.number(),
    label: z.string().nullable().optional(),
  })
  .passthrough();

/** A record the one asked about is associated with, and how. */
export const Association = z
  .object({
    toObjectId: Id,
    associationTypes: z.array(AssociationType).default([]),
  })
  .passthrough();
export type Association = z.infer<typeof Association>;

export const AssociationPage = z.object({ results: z.array(Association), paging: Paging.optional() }).passthrough();
export type AssociationPage = z.infer<typeof AssociationPage>;

/**
 * The record types this package associates, as HubSpot's association paths name them. Custom objects take
 * their type id (`2-123456`).
 */
export const ObjectType = z.union([z.enum(['contact', 'company', 'deal', 'note', 'ticket']), z.string().regex(/^\d+-\d+$/)]);
export type ObjectType = z.infer<typeof ObjectType>;

/** An association to make as a record is created: HubSpot's own type ids, `ASSOCIATION_TYPES`. */
export const AssociationInput = z.object({
  toId: z.string().min(1),
  typeId: z.number().int().positive(),
  /** `HUBSPOT_DEFINED` for HubSpot's own types (the default); `USER_DEFINED` for a label the account made. */
  category: z.enum(['HUBSPOT_DEFINED', 'USER_DEFINED']).default('HUBSPOT_DEFINED'),
});
export type AssociationInput = z.input<typeof AssociationInput>;

export const CreateInput = z.object({
  properties: Properties,
  associations: z.array(AssociationInput).default([]),
});
export type CreateInput = z.input<typeof CreateInput>;

export const GetInput = z.object({
  id: z.string().min(1),
  /** The properties to read. Without it HubSpot returns a few defaults (for a contact: names, email, dates). */
  properties: z.array(z.string().min(1)).optional(),
});
export type GetInput = z.input<typeof GetInput>;

export const UpdateInput = z.object({
  id: z.string().min(1),
  properties: Properties,
});
export type UpdateInput = z.input<typeof UpdateInput>;

export const Filter = z.object({
  propertyName: z.string().min(1),
  operator: z.enum(['EQ', 'NEQ', 'LT', 'LTE', 'GT', 'GTE', 'BETWEEN', 'IN', 'NOT_IN', 'HAS_PROPERTY', 'NOT_HAS_PROPERTY', 'CONTAINS_TOKEN', 'NOT_CONTAINS_TOKEN']),
  value: z.string().optional(),
  highValue: z.string().optional(),
  values: z.array(z.string()).optional(),
});
export type Filter = z.infer<typeof Filter>;

export const SearchInput = z.object({
  /** Groups are ORed; the filters in a group are ANDed. At most five groups and 18 filters in all. */
  filterGroups: z.array(z.object({ filters: z.array(Filter).min(1).max(6) })).max(5).default([]),
  sorts: z.array(z.object({ propertyName: z.string().min(1), direction: z.enum(['ASCENDING', 'DESCENDING']) })).optional(),
  properties: z.array(z.string().min(1)).optional(),
  /** At most 200. */
  limit: z.number().int().min(1).max(200).optional(),
  /** `paging.next.after` from the previous page. */
  after: z.string().optional(),
});
export type SearchInput = z.input<typeof SearchInput>;

export const UpsertContactsInput = z.object({
  /** At most 100. Each is matched by `email`; `properties` are what to set on it. */
  contacts: z.array(z.object({ email: z.string().email(), properties: Properties.default({}) })).min(1).max(100),
});
export type UpsertContactsInput = z.input<typeof UpsertContactsInput>;

export const MoveDealInput = z.object({
  id: z.string().min(1),
  /** The stage's internal id, from `dealPipelines.list`. */
  stage: z.string().min(1),
  /** Only when the deal moves to another pipeline: the stage must be one of its stages. */
  pipeline: z.string().min(1).optional(),
});
export type MoveDealInput = z.input<typeof MoveDealInput>;

const Ref = z.object({ type: ObjectType, id: z.string().min(1) });

export const AssociateInput = z.object({ from: Ref, to: Ref });
export type AssociateInput = z.input<typeof AssociateInput>;

export const ListAssociationsInput = z.object({
  from: Ref,
  toType: ObjectType,
  /** At most 500. */
  limit: z.number().int().min(1).max(500).optional(),
  after: z.string().optional(),
});
export type ListAssociationsInput = z.input<typeof ListAssociationsInput>;

export const CreateNoteInput = z.object({
  /** The note's text (HTML allowed), up to 65,536 characters. */
  body: z.string().min(1).max(65_536),
  /** Where it sits on the timeline: ISO time or Unix milliseconds. Default now. */
  timestamp: z.union([z.string().min(1), z.number().int()]).optional(),
  associations: z.array(AssociationInput).default([]),
});
export type CreateNoteInput = z.input<typeof CreateNoteInput>;

/** The three operations every Mariachi CRM integration has, with the same names and shapes. */
export const UpsertContactByEmailInput = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  /** The company's name, as text on the contact (HubSpot's `company` property), not an association. */
  company: z.string().optional(),
  /** Any other properties, by HubSpot's internal names. They win over the fields above. */
  properties: Properties.optional(),
});
export type UpsertContactByEmailInput = z.input<typeof UpsertContactByEmailInput>;

export const CreateDealInput = z.object({
  name: z.string().min(1),
  amount: z.number().nonnegative().optional(),
  /** An ISO 4217 code the account has set up (`deal_currency_code`). Without it, the account's own currency. */
  currency: z.string().regex(/^[A-Z]{3}$/).optional(),
  /** The stage's internal id (`dealstage`), from `dealPipelines.list`. Without it, the first stage of the account's first pipeline. */
  stage: z.string().min(1).optional(),
  contactId: z.string().min(1).optional(),
  companyId: z.string().min(1).optional(),
  /** Any other properties, by HubSpot's internal names (`pipeline`, `closedate`). They win over the fields above. */
  properties: Properties.optional(),
});
export type CreateDealInput = z.input<typeof CreateDealInput>;

export const AddNoteInput = z
  .object({
    body: z.string().min(1).max(65_536),
    contactId: z.string().min(1).optional(),
    dealId: z.string().min(1).optional(),
    companyId: z.string().min(1).optional(),
  })
  .refine((i) => i.contactId || i.dealId || i.companyId, { message: 'A note needs a contact, a deal or a company to sit on' });
export type AddNoteInput = z.input<typeof AddNoteInput>;

/**
 * One event in a webhook delivery. HubSpot posts a JSON array of these, up to 100 at a time, possibly out of
 * order (sort by `occurredAt`) and occasionally more than once.
 */
export const WebhookEvent = z
  .object({
    /** Not guaranteed unique on its own: dedupe on `hubspotEventKey(event)`. */
    eventId: z.number(),
    subscriptionId: z.number(),
    /** The HubSpot account the event happened in. */
    portalId: z.number(),
    appId: z.number().optional(),
    /** Unix milliseconds. */
    occurredAt: z.number(),
    /** `contact.creation`, `deal.propertyChange`, `object.creation`... */
    subscriptionType: z.string(),
    /** 0 for the first delivery; HubSpot retries up to ten times over 24 hours. */
    attemptNumber: z.number(),
    /** The record's id. */
    objectId: z.number(),
    /** Generic (`object.*`) subscriptions: the record's type, `0-1` for a contact, `0-2` company, `0-3` deal. */
    objectTypeId: z.string().optional(),
    changeSource: z.string().optional(),
    /** Property changes only. */
    propertyName: z.string().optional(),
    propertyValue: z.string().optional(),
    /** Merges only. */
    primaryObjectId: z.number().optional(),
    mergedObjectIds: z.array(z.number()).optional(),
    newObjectId: z.number().optional(),
    /** Association changes only. */
    associationType: z.string().optional(),
    fromObjectId: z.number().optional(),
    toObjectId: z.number().optional(),
    associationRemoved: z.boolean().optional(),
    isPrimaryAssociation: z.boolean().optional(),
  })
  .passthrough();
export type WebhookEvent = z.infer<typeof WebhookEvent>;
