// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Salesforce: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'salesforce',
  name: 'Salesforce',
  category: 'crm',
  server: '{myDomain}.my.salesforce.com',
  docs: 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/quickstart.htm',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'instanceUrl',
    env: 'SALESFORCE_INSTANCE_URL',
    label: 'My Domain URL',
    meaning: "The org's own address: the token and every API call go to it.",
    secret: false,
    required: true,
    whereToFind: "Setup › My Domain: the Current My Domain URL, https://<name>.my.salesforce.com. For test, a sandbox's, https://<name>--<sandbox>.sandbox.my.salesforce.com. Not login.salesforce.com: the client credentials flow needs the org's own domain. Salesforce's keys look the same in a sandbox and in production, so nothing here is checked per environment.",
    public: true,
  },
  {
    key: 'clientId',
    env: 'SALESFORCE_CLIENT_ID',
    label: 'Consumer key',
    meaning: "Names the app's External Client App to Salesforce.",
    secret: false,
    required: true,
    whereToFind: "Setup › External Client App Manager › the app › Settings › OAuth Settings: Consumer Key. In the app's OAuth settings, Enable Client Credentials Flow; in its policies, set Run As to an integration user, whose access is all the app gets. In the sandbox's own app for test.",
    url: 'https://help.salesforce.com/s/articleView?id=xcloud.remoteaccess_oauth_client_credentials_flow.htm&type=5',
  },
  {
    key: 'clientSecret',
    env: 'SALESFORCE_CLIENT_SECRET',
    label: 'Consumer secret',
    meaning: 'Proves the token request comes from the app.',
    secret: true,
    required: true,
    whereToFind: 'Next to the consumer key: Setup › External Client App Manager › the app › Settings › OAuth Settings: Consumer Secret.',
    url: 'https://help.salesforce.com/s/articleView?id=xcloud.remoteaccess_oauth_client_credentials_flow.htm&type=5',
  },
  {
    key: 'apiVersion',
    env: 'SALESFORCE_API_VERSION',
    label: 'API version',
    meaning: "The REST API version every call uses. Leave it unset for v68.0 (Winter '27); pin another only to match code written for it.",
    secret: false,
    required: false,
    whereToFind: 'A version the org lists at <My Domain URL>/services/data/, such as v68.0.',
    public: true,
  },
  {
    key: 'webhookSecret',
    env: 'SALESFORCE_WEBHOOK_SECRET',
    label: 'Flow webhook secret',
    meaning: "Checks that a call to the app's webhook came from the org's flow. Salesforce signs nothing it sends: the flow sends this secret in a header.",
    secret: true,
    required: false,
    whereToFind: "A long random string of your own, kept in the org as an External Credential's custom header (X-Webhook-Secret) that the flow's HTTP callout uses.",
  },
];

/** The config `createSalesforce` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  instanceUrl: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  apiVersion: z.string().min(1).optional(),
  webhookSecret: z.string().min(1).optional(),
});
export type SalesforceConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  instanceUrl: 'SALESFORCE_INSTANCE_URL',
  clientId: 'SALESFORCE_CLIENT_ID',
  clientSecret: 'SALESFORCE_CLIENT_SECRET',
  apiVersion: 'SALESFORCE_API_VERSION',
  webhookSecret: 'SALESFORCE_WEBHOOK_SECRET',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'oauth.token': {
    purpose: "Gets an access token by the client credentials flow, as the app's Run As user. There's no refresh token: a new one is asked for when a call answers 401.",
    method: 'POST',
    path: '/services/oauth2/token',
    idempotency: 'natural',
  },
  'contacts.create': {
    purpose: 'Creates a contact: a person, usually at an account.',
    method: 'POST',
    path: '/services/data/{version}/sobjects/Contact',
    idempotency: 'none',
  },
  'contacts.get': {
    purpose: 'Reads one Contact by id, optionally only some fields.',
    method: 'GET',
    path: '/services/data/{version}/sobjects/Contact/{id}',
    idempotency: 'natural',
  },
  'contacts.update': {
    purpose: 'Changes the given fields of one Contact.',
    method: 'PATCH',
    path: '/services/data/{version}/sobjects/Contact/{id}',
    idempotency: 'natural',
  },
  'contacts.delete': {
    purpose: 'Deletes one Contact (to the Recycle Bin).',
    method: 'DELETE',
    path: '/services/data/{version}/sobjects/Contact/{id}',
    idempotency: 'natural',
  },
  'contacts.upsert': {
    purpose: 'Creates or updates the Contact whose external id field has this value; says which it did.',
    method: 'PATCH',
    path: '/services/data/{version}/sobjects/Contact/{externalIdField}/{externalId}',
    idempotency: 'natural',
  },
  'accounts.create': {
    purpose: 'Creates an account: a company or organization.',
    method: 'POST',
    path: '/services/data/{version}/sobjects/Account',
    idempotency: 'none',
  },
  'accounts.get': {
    purpose: 'Reads one Account by id, optionally only some fields.',
    method: 'GET',
    path: '/services/data/{version}/sobjects/Account/{id}',
    idempotency: 'natural',
  },
  'accounts.update': {
    purpose: 'Changes the given fields of one Account.',
    method: 'PATCH',
    path: '/services/data/{version}/sobjects/Account/{id}',
    idempotency: 'natural',
  },
  'accounts.delete': {
    purpose: 'Deletes one Account (to the Recycle Bin).',
    method: 'DELETE',
    path: '/services/data/{version}/sobjects/Account/{id}',
    idempotency: 'natural',
  },
  'accounts.upsert': {
    purpose: 'Creates or updates the Account whose external id field has this value; says which it did.',
    method: 'PATCH',
    path: '/services/data/{version}/sobjects/Account/{externalIdField}/{externalId}',
    idempotency: 'natural',
  },
  'opportunities.create': {
    purpose: 'Creates an opportunity: a deal in progress.',
    method: 'POST',
    path: '/services/data/{version}/sobjects/Opportunity',
    idempotency: 'none',
  },
  'opportunities.get': {
    purpose: 'Reads one Opportunity by id, optionally only some fields.',
    method: 'GET',
    path: '/services/data/{version}/sobjects/Opportunity/{id}',
    idempotency: 'natural',
  },
  'opportunities.update': {
    purpose: 'Changes the given fields of one Opportunity.',
    method: 'PATCH',
    path: '/services/data/{version}/sobjects/Opportunity/{id}',
    idempotency: 'natural',
  },
  'opportunities.delete': {
    purpose: 'Deletes one Opportunity (to the Recycle Bin).',
    method: 'DELETE',
    path: '/services/data/{version}/sobjects/Opportunity/{id}',
    idempotency: 'natural',
  },
  'opportunities.upsert': {
    purpose: 'Creates or updates the Opportunity whose external id field has this value; says which it did.',
    method: 'PATCH',
    path: '/services/data/{version}/sobjects/Opportunity/{externalIdField}/{externalId}',
    idempotency: 'natural',
  },
  'leads.create': {
    purpose: 'Creates a lead: a prospect not yet qualified into a contact, account and opportunity.',
    method: 'POST',
    path: '/services/data/{version}/sobjects/Lead',
    idempotency: 'none',
  },
  'leads.get': {
    purpose: 'Reads one Lead by id, optionally only some fields.',
    method: 'GET',
    path: '/services/data/{version}/sobjects/Lead/{id}',
    idempotency: 'natural',
  },
  'leads.update': {
    purpose: 'Changes the given fields of one Lead.',
    method: 'PATCH',
    path: '/services/data/{version}/sobjects/Lead/{id}',
    idempotency: 'natural',
  },
  'leads.delete': {
    purpose: 'Deletes one Lead (to the Recycle Bin).',
    method: 'DELETE',
    path: '/services/data/{version}/sobjects/Lead/{id}',
    idempotency: 'natural',
  },
  'leads.upsert': {
    purpose: 'Creates or updates the Lead whose external id field has this value; says which it did.',
    method: 'PATCH',
    path: '/services/data/{version}/sobjects/Lead/{externalIdField}/{externalId}',
    idempotency: 'natural',
  },
  'soql.query': {
    purpose: 'Runs a SOQL query and returns its first page of records, with the locator of the next.',
    method: 'GET',
    path: '/services/data/{version}/query',
    idempotency: 'natural',
  },
  'soql.queryMore': {
    purpose: 'Reads the next page of a query by the nextRecordsUrl its previous page gave.',
    method: 'GET',
    path: '/services/data/{version}/query/{queryLocator}',
    idempotency: 'natural',
  },
  'composite.execute': {
    purpose: "Runs up to 25 subrequests in one call, all or none: a later one can use an earlier one's id (@{ref.id}), and any failure rolls back the lot.",
    method: 'POST',
    path: '/services/data/{version}/composite',
    idempotency: 'none',
  },
} as const;
export type SalesforceOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  INVALID_SESSION_ID: {
    category: 'unauthorized',
    reason: 'session-expired',
  },
  invalid_client: {
    category: 'unauthorized',
    reason: 'invalid-client',
  },
  invalid_grant: {
    category: 'unauthorized',
    reason: 'invalid-grant',
  },
  REQUEST_LIMIT_EXCEEDED: {
    category: 'rate-limited',
    reason: 'request-limit-exceeded',
  },
  UNABLE_TO_LOCK_ROW: {
    category: 'unavailable',
    reason: 'row-locked',
  },
  DUPLICATE_VALUE: {
    category: 'conflict',
    reason: 'duplicate-value',
  },
  DUPLICATES_DETECTED: {
    category: 'conflict',
    reason: 'duplicates-detected',
  },
  REQUIRED_FIELD_MISSING: {
    category: 'invalid-request',
    reason: 'required-field-missing',
  },
  FIELD_CUSTOM_VALIDATION_EXCEPTION: {
    category: 'invalid-request',
    reason: 'validation-rule',
  },
  INVALID_FIELD: {
    category: 'invalid-request',
    reason: 'invalid-field',
  },
  INVALID_TYPE: {
    category: 'invalid-request',
    reason: 'invalid-type',
  },
  MALFORMED_ID: {
    category: 'invalid-request',
    reason: 'malformed-id',
  },
  MALFORMED_QUERY: {
    category: 'invalid-request',
    reason: 'malformed-query',
  },
  INVALID_CROSS_REFERENCE_KEY: {
    category: 'invalid-request',
    reason: 'invalid-reference',
  },
  INSUFFICIENT_ACCESS_OR_READONLY: {
    category: 'forbidden',
    reason: 'insufficient-access',
  },
  API_DISABLED_FOR_ORG: {
    category: 'forbidden',
    reason: 'api-disabled',
  },
  NOT_FOUND: {
    category: 'not-found',
    reason: 'not-found',
  },
  ENTITY_IS_DELETED: {
    category: 'not-found',
    reason: 'deleted',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'shared-secret',
  header: 'X-Webhook-Secret',
  secretSetting: 'webhookSecret',
  description: "Salesforce has no signed webhooks. A record-triggered flow posts JSON to the app with an HTTP callout whose External Credential adds the header X-Webhook-Secret: the shared secret. The app compares it with the setting in constant time. The secret doesn't cover the body, so it's only sent over HTTPS; a delivery is deduplicated on a digest of its raw body.",
} as const;
export const webhookEvents = ['record.changed'] as const;
export type SalesforceWebhookEvent = (typeof webhookEvents)[number];
