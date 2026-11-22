// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** HubSpot: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'hubspot',
  name: 'HubSpot',
  category: 'crm',
  server: 'api.hubapi.com',
  baseUrl: 'https://api.hubapi.com',
  docs: 'https://developers.hubspot.com/docs/api-reference/legacy/crm/objects/contacts/guide',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'accessToken',
    env: 'HUBSPOT_ACCESS_TOKEN',
    label: 'Access token',
    meaning: "Reads and writes the account's contacts, companies, deals and notes. Sent as a Bearer token.",
    secret: true,
    required: true,
    whereToFind: "A developer-platform app with static auth and private distribution (legacy private apps can no longer be made), installed in the account: Development › Projects › the project › the app › Distribution › Install now, then Show to reveal the token. Give the app read and write scopes for contacts, companies and deals. For test, install the same app in a developer test account (Development › Test accounts) and Show the token next to it under Test installs: a test account's token looks like a live one.",
    url: 'https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/overview',
  },
  {
    key: 'clientSecret',
    env: 'HUBSPOT_CLIENT_SECRET',
    label: 'Client secret',
    meaning: "Checks that a webhook came from HubSpot: HubSpot signs each delivery with the app's client secret.",
    secret: true,
    required: false,
    whereToFind: 'Development › Projects › the project › the app › Auth › Client credentials › Client secret. Only needed to receive webhooks.',
    url: 'https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/request-validation',
  },
];

/** The config `createHubspot` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  accessToken: z.string().min(1),
  clientSecret: z.string().min(1).optional(),
});
export type HubspotConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  accessToken: 'HUBSPOT_ACCESS_TOKEN',
  clientSecret: 'HUBSPOT_CLIENT_SECRET',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'contacts.create': {
    purpose: 'Creates a contact with these properties, optionally associated with other records. Fails with a conflict when the email is taken.',
    method: 'POST',
    path: '/crm/v3/objects/contacts',
    idempotency: 'none',
  },
  'contacts.get': {
    purpose: 'Reads one contact by its id, or by its email with idProperty=email.',
    method: 'GET',
    path: '/crm/v3/objects/contacts/{contactId}',
    idempotency: 'natural',
  },
  'contacts.update': {
    purpose: "Changes some of a contact's properties.",
    method: 'PATCH',
    path: '/crm/v3/objects/contacts/{contactId}',
    idempotency: 'natural',
  },
  'contacts.search': {
    purpose: 'Finds contacts by their properties (an email, for one), a page at a time. Search is rate limited to five requests a second per account, and a record can take a few moments to appear in it.',
    method: 'POST',
    path: '/crm/v3/objects/contacts/search',
    idempotency: 'natural',
  },
  'contacts.batchUpsert': {
    purpose: 'Creates or updates contacts matched by email (idProperty=email), up to 100 at a time; each result says whether it was new.',
    method: 'POST',
    path: '/crm/v3/objects/contacts/batch/upsert',
    idempotency: 'natural',
  },
  'companies.create': {
    purpose: 'Creates a company with these properties, optionally associated with other records.',
    method: 'POST',
    path: '/crm/v3/objects/companies',
    idempotency: 'none',
  },
  'companies.get': {
    purpose: 'Reads one company by its id.',
    method: 'GET',
    path: '/crm/v3/objects/companies/{companyId}',
    idempotency: 'natural',
  },
  'companies.update': {
    purpose: "Changes some of a company's properties.",
    method: 'PATCH',
    path: '/crm/v3/objects/companies/{companyId}',
    idempotency: 'natural',
  },
  'companies.search': {
    purpose: 'Finds companies by their properties (a domain, for one), a page at a time.',
    method: 'POST',
    path: '/crm/v3/objects/companies/search',
    idempotency: 'natural',
  },
  'deals.create': {
    purpose: 'Creates a deal in a pipeline stage, optionally associated with contacts and companies.',
    method: 'POST',
    path: '/crm/v3/objects/deals',
    idempotency: 'none',
  },
  'deals.get': {
    purpose: 'Reads one deal by its id.',
    method: 'GET',
    path: '/crm/v3/objects/deals/{dealId}',
    idempotency: 'natural',
  },
  'deals.update': {
    purpose: "Changes some of a deal's properties, its stage (dealstage) among them.",
    method: 'PATCH',
    path: '/crm/v3/objects/deals/{dealId}',
    idempotency: 'natural',
  },
  'deals.search': {
    purpose: 'Finds deals by their properties, a page at a time.',
    method: 'POST',
    path: '/crm/v3/objects/deals/search',
    idempotency: 'natural',
  },
  'dealPipelines.list': {
    purpose: "Lists the account's deal pipelines with their stages: the internal ids a deal's pipeline and dealstage take.",
    method: 'GET',
    path: '/crm/v3/pipelines/deals',
    idempotency: 'natural',
  },
  'notes.create': {
    purpose: "Creates a note (hs_note_body, hs_timestamp) on the timeline of the contacts, companies and deals it's associated with.",
    method: 'POST',
    path: '/crm/v3/objects/notes',
    idempotency: 'none',
  },
  'associations.create': {
    purpose: "Associates two records with HubSpot's default (unlabeled) association type.",
    method: 'PUT',
    path: '/crm/v4/objects/{fromObjectType}/{fromObjectId}/associations/default/{toObjectType}/{toObjectId}',
    idempotency: 'natural',
  },
  'associations.list': {
    purpose: "Lists the records of one type a record is associated with, with each association's types, a page at a time.",
    method: 'GET',
    path: '/crm/v4/objects/{fromObjectType}/{fromObjectId}/associations/{toObjectType}',
    idempotency: 'natural',
  },
  'associations.delete': {
    purpose: 'Removes every association between two records. The records stay.',
    method: 'DELETE',
    path: '/crm/v4/objects/{fromObjectType}/{fromObjectId}/associations/{toObjectType}/{toObjectId}',
    idempotency: 'natural',
  },
} as const;
export type HubspotOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  CONFLICT: {
    category: 'conflict',
    reason: 'already-exists',
  },
  OBJECT_ALREADY_EXISTS: {
    category: 'conflict',
    reason: 'already-exists',
  },
  VALIDATION_ERROR: {
    category: 'invalid-request',
    reason: 'invalid-properties',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'hmac-sha256-timestamped',
  header: 'X-HubSpot-Signature-v3',
  secretSetting: 'clientSecret',
  description: "The header is the base64 HMAC-SHA256, keyed with the app's client secret, of the UTF-8 string: the request method, the full request URI as HubSpot called it (https://host/path?query, with %3A %2F %3F %40 %21 %24 %27 %28 %29 %2A %2C %3B in the query decoded), the raw body, and the X-HubSpot-Request-Timestamp header (Unix milliseconds), concatenated. Reject a timestamp more than five minutes old.",
} as const;
export const webhookEvents = ['contact.creation', 'contact.propertyChange', 'contact.deletion', 'contact.merge', 'contact.associationChange', 'contact.restore', 'contact.privacyDeletion', 'company.creation', 'company.propertyChange', 'company.deletion', 'company.merge', 'company.associationChange', 'company.restore', 'deal.creation', 'deal.propertyChange', 'deal.deletion', 'deal.merge', 'deal.associationChange', 'deal.restore', 'object.creation', 'object.propertyChange', 'object.deletion', 'object.merge', 'object.restore', 'object.associationChange'] as const;
export type HubspotWebhookEvent = (typeof webhookEvents)[number];
