import { z } from 'zod';

/**
 * Salesforce's shapes, as far as an app reads them. Records pass through (`passthrough`): which fields come back
 * depends on the query and on the org's own custom fields (`Plan__c`).
 */

/** A field's API name, as Salesforce spells it: `LastName`, `Plan__c`. */
export const FieldName = z.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,79}$/, 'a field API name, such as LastName or Plan__c');

/** A value Salesforce stores in a field. Dates go as `YYYY-MM-DD` strings, date-times as ISO strings. */
export const FieldValue = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export type FieldValue = z.infer<typeof FieldValue>;

/** Fields to write, by API name. */
export const Fields = z.record(FieldName, FieldValue);
export type Fields = z.infer<typeof Fields>;

/** A record id: 15 or 18 characters, such as `003…` for a contact. */
export const RecordId = z.string().regex(/^[A-Za-z0-9]{15}(?:[A-Za-z0-9]{3})?$/, 'a 15- or 18-character Salesforce id');

const Attributes = z.object({ type: z.string(), url: z.string().optional() }).passthrough();

/** Any record: its `Id` (when the query asked for it) and whatever fields it was read with. */
export const SObjectRecord = z.object({ attributes: Attributes.optional(), Id: z.string().optional() }).passthrough();
export type SObjectRecord = z.infer<typeof SObjectRecord> & Record<string, unknown>;

const text = z.string().nullable().optional();

export const Contact = SObjectRecord.extend({ FirstName: text, LastName: text, Email: text, Phone: text, AccountId: text });
export type Contact = z.infer<typeof Contact> & Record<string, unknown>;

export const Account = SObjectRecord.extend({ Name: text, Website: text });
export type Account = z.infer<typeof Account> & Record<string, unknown>;

export const Opportunity = SObjectRecord.extend({
  Name: text,
  StageName: text,
  CloseDate: text,
  Amount: z.number().nullable().optional(),
  AccountId: text,
});
export type Opportunity = z.infer<typeof Opportunity> & Record<string, unknown>;

export const Lead = SObjectRecord.extend({ FirstName: text, LastName: text, Email: text, Company: text, Status: text, IsConverted: z.boolean().optional() });
export type Lead = z.infer<typeof Lead> & Record<string, unknown>;

/** What a create answers. */
export const SaveResult = z.object({ id: z.string(), success: z.boolean() }).passthrough();
export type SaveResult = z.infer<typeof SaveResult>;

/** What an upsert by external id answers: `created` says whether it made a new record. */
export const UpsertResult = z.object({ id: z.string(), success: z.boolean(), created: z.boolean() }).passthrough();
export type UpsertResult = z.infer<typeof UpsertResult>;

/** One page of a query. `nextRecordsUrl` is there while `done` is false. */
export function queryPage<T extends z.ZodTypeAny>(record: T) {
  return z.object({ totalSize: z.number(), done: z.boolean(), records: z.array(record), nextRecordsUrl: z.string().optional() }).passthrough();
}
export interface QueryPage<T = SObjectRecord> {
  totalSize: number;
  done: boolean;
  records: T[];
  nextRecordsUrl?: string;
}

export const TokenResponse = z.object({ access_token: z.string().min(1), instance_url: z.string().url().optional(), token_type: z.string().optional() }).passthrough();

export const CompositeSubresponse = z.object({ body: z.unknown(), httpStatusCode: z.number(), referenceId: z.string() }).passthrough();
export type CompositeSubresponse = z.infer<typeof CompositeSubresponse>;
export const CompositeResponse = z.object({ compositeResponse: z.array(CompositeSubresponse) }).passthrough();

export const GetInput = z.object({ id: RecordId, fields: z.array(FieldName).min(1).optional() });
export type GetInput = z.infer<typeof GetInput>;

export const UpdateInput = z.object({ id: RecordId, fields: Fields });
export type UpdateInput = z.infer<typeof UpdateInput>;

export const DeleteInput = z.object({ id: RecordId });
export type DeleteInput = z.infer<typeof DeleteInput>;

export const UpsertInput = z.object({
  /** An External ID field of the object, such as `App_User_Id__c`. */
  externalIdField: FieldName,
  externalId: z.string().min(1),
  /** The fields to set; not the external id field itself, which is in the path. */
  fields: Fields,
});
export type UpsertInput = z.infer<typeof UpsertInput>;

export const CompositeRequest = z.object({
  method: z.enum(['GET', 'POST', 'PATCH', 'PUT', 'DELETE']),
  /** Under the API version: `sobjects/Contact`, or `sobjects/Contact/@{contact.id}`. */
  path: z.string().regex(/^[A-Za-z0-9_./@{}?=&%,-]+$/).refine((p) => !p.startsWith('/') && !p.includes('..'), 'a path under the API version, such as sobjects/Contact'),
  /** Names the result, so a later subrequest can use `@{<referenceId>.id}`. */
  referenceId: z.string().regex(/^[A-Za-z][A-Za-z0-9_]*$/),
  body: z.record(z.unknown()).optional(),
});
export type CompositeRequest = z.infer<typeof CompositeRequest>;
export const CompositeInput = z.array(CompositeRequest).min(1).max(25);

/** A field map for a create, with the fields Salesforce requires for that object. */
export function createFields<R extends z.ZodRawShape>(required: R) {
  return z.object(required).catchall(FieldValue).superRefine((fields, issue) => {
    for (const key of Object.keys(fields)) {
      if (!FieldName.safeParse(key).success) issue.addIssue({ code: 'custom', path: [key], message: 'not a field API name' });
    }
  });
}

const required = z.string().min(1);
/** A Contact needs `LastName`. */
export const ContactCreate = createFields({ LastName: required });
/** An Account needs `Name`. */
export const AccountCreate = createFields({ Name: required });
/** An Opportunity needs `Name`, `StageName` (one of the org's stages) and `CloseDate` (`YYYY-MM-DD`). */
export const OpportunityCreate = createFields({ Name: required, StageName: required, CloseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD') });
/** A Lead needs `LastName` and `Company`. */
export const LeadCreate = createFields({ LastName: required, Company: required });

/** The three operations every Mariachi CRM integration has, with the same shapes. */
export const UpsertContactByEmailInput = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  /** The account's name: found by name, or made. */
  company: z.string().min(1).optional(),
  /** More fields, by API name (`LeadSource`, `Plan__c`). */
  properties: Fields.optional(),
});
export type UpsertContactByEmailInput = z.input<typeof UpsertContactByEmailInput>;

export const CreateDealInput = z.object({
  name: z.string().min(1),
  amount: z.number().finite().optional(),
  /** An ISO currency code; only for an org with multiple currencies turned on. */
  currency: z.string().regex(/^[A-Z]{3}$/).optional(),
  /** The stage's API name. Without it, the org's first open stage. */
  stage: z.string().min(1).optional(),
  /** Made the opportunity's primary contact. */
  contactId: RecordId.optional(),
  /** The opportunity's account. */
  companyId: RecordId.optional(),
  /** More fields, by API name. `CloseDate` here replaces the default of 30 days from today. */
  properties: Fields.optional(),
});
export type CreateDealInput = z.input<typeof CreateDealInput>;

export const AddNoteInput = z.object({
  /** Plain text. Its first line is the note's title. */
  body: z.string().min(1),
  contactId: RecordId.optional(),
  dealId: RecordId.optional(),
  companyId: RecordId.optional(),
});
export type AddNoteInput = z.input<typeof AddNoteInput>;
