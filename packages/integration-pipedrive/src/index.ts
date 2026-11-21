export { createPipedrive, type Pipedrive, type PipedriveDeps } from './client';
export { PipedriveError } from './errors';
export { fieldsBody, isCustomFieldKey, noteHtml } from './fields';
export { PipedriveWebhookAuth, pipedriveWebhookAuth, pipedriveEventType, PipedriveWebhookBody, type PipedriveWebhookAuthOptions } from './webhooks';
export { provider, settings, configSchema, envNames, operations, webhookEvents, type PipedriveConfig, type PipedriveOperation, type PipedriveWebhookEvent } from './generated';
export type {
  ContactPoint,
  Deal,
  Field,
  FieldValues,
  Note,
  OffsetPage,
  Organization,
  OrganizationHit,
  Page,
  Person,
  PersonHit,
  Pipeline,
  SearchHit,
  Stage,
  Webhook,
  WebhookEvent,
  WebhookMeta,
  UpsertContactInput,
  SharedCreateDealInput,
  AddNoteInput,
} from './schemas';
