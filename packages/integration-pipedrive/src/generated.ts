// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Pipedrive: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'pipedrive',
  name: 'Pipedrive',
  category: 'crm',
  server: '{companyDomain}.pipedrive.com',
  docs: 'https://developers.pipedrive.com/docs/api/v1',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'apiToken',
    env: 'PIPEDRIVE_API_TOKEN',
    label: 'API token',
    meaning: "Calls Pipedrive as one user of one company, with that user's permissions. Sent in the x-api-token header.",
    secret: true,
    required: true,
    whereToFind: "In the Pipedrive web app, Settings › Personal preferences › API (an admin may need to enable API access for the user). A user has a different token in each company. Pipedrive has no test mode: for test, use a developer sandbox company, requested with Pipedrive's form; its token looks the same.",
    url: 'https://app.pipedrive.com/settings/api',
  },
  {
    key: 'companyDomain',
    env: 'PIPEDRIVE_COMPANY_DOMAIN',
    label: 'Company domain',
    meaning: "The company's subdomain: every call goes to https://<companyDomain>.pipedrive.com.",
    secret: false,
    required: true,
    whereToFind: "The first part of the address the company's Pipedrive opens at: acme for https://acme.pipedrive.com.",
    url: 'https://pipedrive.readme.io/docs/how-to-get-the-company-domain',
    public: true,
  },
  {
    key: 'webhookUser',
    env: 'PIPEDRIVE_WEBHOOK_USER',
    label: 'Webhook user name',
    meaning: "The HTTP Basic auth user name Pipedrive sends with every webhook, so the app can tell its webhooks from anyone else's requests. You choose it.",
    secret: true,
    required: false,
    whereToFind: 'Any value of your own: webhooks.create gives it to Pipedrive as http_auth_user.',
    url: 'https://pipedrive.readme.io/docs/guide-for-webhooks-v2',
  },
  {
    key: 'webhookPassword',
    env: 'PIPEDRIVE_WEBHOOK_PASSWORD',
    label: 'Webhook password',
    meaning: 'The HTTP Basic auth password Pipedrive sends with every webhook. You choose it.',
    secret: true,
    required: false,
    whereToFind: 'A long random string of your own: webhooks.create gives it to Pipedrive as http_auth_password.',
    url: 'https://pipedrive.readme.io/docs/guide-for-webhooks-v2',
  },
];

/** The config `createPipedrive` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  apiToken: z.string().min(1),
  companyDomain: z.string().min(1),
  webhookUser: z.string().min(1).optional(),
  webhookPassword: z.string().min(1).optional(),
});
export type PipedriveConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  apiToken: 'PIPEDRIVE_API_TOKEN',
  companyDomain: 'PIPEDRIVE_COMPANY_DOMAIN',
  webhookUser: 'PIPEDRIVE_WEBHOOK_USER',
  webhookPassword: 'PIPEDRIVE_WEBHOOK_PASSWORD',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'persons.create': {
    purpose: 'Adds a person (a contact). API v2.',
    method: 'POST',
    path: '/api/v2/persons',
    idempotency: 'none',
  },
  'persons.get': {
    purpose: 'Reads one person by id. API v2.',
    method: 'GET',
    path: '/api/v2/persons/{id}',
    idempotency: 'natural',
  },
  'persons.update': {
    purpose: 'Changes the given fields of a person. API v2.',
    method: 'PATCH',
    path: '/api/v2/persons/{id}',
    idempotency: 'natural',
  },
  'persons.list': {
    purpose: 'Lists persons, a page at a time by cursor. API v2.',
    method: 'GET',
    path: '/api/v2/persons',
    idempotency: 'natural',
  },
  'persons.search': {
    purpose: 'Searches persons by name, email, phone, notes or custom fields; with fields=email and exact_match=true, finds a person by email address (not case-sensitive). API v2.',
    method: 'GET',
    path: '/api/v2/persons/search',
    idempotency: 'natural',
  },
  'organizations.create': {
    purpose: 'Adds an organization (a company). API v2.',
    method: 'POST',
    path: '/api/v2/organizations',
    idempotency: 'none',
  },
  'organizations.get': {
    purpose: 'Reads one organization by id. API v2.',
    method: 'GET',
    path: '/api/v2/organizations/{id}',
    idempotency: 'natural',
  },
  'organizations.search': {
    purpose: 'Searches organizations by name, address, notes or custom fields. API v2.',
    method: 'GET',
    path: '/api/v2/organizations/search',
    idempotency: 'natural',
  },
  'deals.create': {
    purpose: 'Adds a deal, optionally linked to a person and an organization and placed in a stage. API v2.',
    method: 'POST',
    path: '/api/v2/deals',
    idempotency: 'none',
  },
  'deals.get': {
    purpose: 'Reads one deal by id. API v2.',
    method: 'GET',
    path: '/api/v2/deals/{id}',
    idempotency: 'natural',
  },
  'deals.update': {
    purpose: 'Changes the given fields of a deal: its stage, status, value. API v2.',
    method: 'PATCH',
    path: '/api/v2/deals/{id}',
    idempotency: 'natural',
  },
  'deals.list': {
    purpose: "Lists deals that aren't archived, a page at a time by cursor, optionally by person, organization, pipeline, stage or status. API v2.",
    method: 'GET',
    path: '/api/v2/deals',
    idempotency: 'natural',
  },
  'pipelines.list': {
    purpose: "Lists the company's pipelines. API v2.",
    method: 'GET',
    path: '/api/v2/pipelines',
    idempotency: 'natural',
  },
  'stages.list': {
    purpose: "Lists the stages of every pipeline, or of one. A deal's stage is set by a stage's id. API v2.",
    method: 'GET',
    path: '/api/v2/stages',
    idempotency: 'natural',
  },
  'personFields.list': {
    purpose: 'Lists the person fields, each with its field_code: the key a value is set under (a 40-character hash for a custom field). API v2.',
    method: 'GET',
    path: '/api/v2/personFields',
    idempotency: 'natural',
  },
  'organizationFields.list': {
    purpose: 'Lists the organization fields, each with its field_code. API v2.',
    method: 'GET',
    path: '/api/v2/organizationFields',
    idempotency: 'natural',
  },
  'dealFields.list': {
    purpose: 'Lists the deal fields, each with its field_code. API v2.',
    method: 'GET',
    path: '/api/v2/dealFields',
    idempotency: 'natural',
  },
  'notes.create': {
    purpose: 'Adds a note (HTML content, sanitized by Pipedrive) to a person, organization or deal. API v1: notes have no v2 endpoint.',
    method: 'POST',
    path: '/api/v1/notes',
    idempotency: 'none',
  },
  'notes.list': {
    purpose: 'Lists notes, optionally of one person, organization or deal, a page at a time by offset (start, limit). API v1.',
    method: 'GET',
    path: '/api/v1/notes',
    idempotency: 'natural',
  },
  'webhooks.create': {
    purpose: 'Subscribes a URL to an event (event_action and event_object), as a v2 webhook sent with the webhook user name and password as HTTP Basic auth. API v1: webhooks have no v2 endpoint.',
    method: 'POST',
    path: '/api/v1/webhooks',
    idempotency: 'none',
  },
  'webhooks.list': {
    purpose: "Lists the company's webhooks. API v1.",
    method: 'GET',
    path: '/api/v1/webhooks',
    idempotency: 'natural',
  },
  'webhooks.delete': {
    purpose: 'Deletes a webhook. API v1.',
    method: 'DELETE',
    path: '/api/v1/webhooks/{id}',
    idempotency: 'natural',
  },
} as const;
export type PipedriveOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'basic-auth',
  header: 'Authorization',
  secretSetting: 'webhookPassword',
  description: "Pipedrive doesn't sign webhooks. When a webhook is made with http_auth_user and http_auth_password, Pipedrive sends them on every delivery as Authorization: Basic followed by the base64 of user:password. Decode it, split at the first colon, and compare the user name with the webhookUser setting and the password with the webhookPassword setting, each in constant time; refuse the delivery unless both match. The v2 body is { meta, data, previous }: meta.id is the event's id, meta.action is create, change or delete, and meta.entity is the object type.",
} as const;
export const webhookEvents = ['person.create', 'person.change', 'person.delete', 'organization.create', 'organization.change', 'organization.delete', 'deal.create', 'deal.change', 'deal.delete', 'note.create', 'note.change', 'note.delete'] as const;
export type PipedriveWebhookEvent = (typeof webhookEvents)[number];
