export { createSalesforce, DEFAULT_API_VERSION, DEFAULT_CLOSE_DAYS, noteHtml, noteTitle, type Salesforce, type SalesforceDeps } from './client';
export { SalesforceError } from './errors';
export { soql, soqlLike, soqlLiteral, isSoqlQuery, SoqlLike, type SoqlQuery, type SoqlValue } from './soql';
export { salesforceFlowWebhookAuth, SalesforceFlowWebhookAuth, SalesforceFlowEvent, salesforceEventType, SALESFORCE_WEBHOOK_SECRET_HEADER } from './webhooks';
export { provider, settings, configSchema, envNames, operations, webhookEvents, type SalesforceConfig, type SalesforceOperation } from './generated';
export {
  Account,
  Contact,
  Lead,
  Opportunity,
  SObjectRecord,
  type AddNoteInput,
  type CompositeRequest,
  type CompositeSubresponse,
  type CreateDealInput,
  type FieldValue,
  type Fields,
  type QueryPage,
  type SaveResult,
  type UpsertContactByEmailInput,
  type UpsertResult,
} from './schemas';
