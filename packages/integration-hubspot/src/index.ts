export { createHubSpot, type HubSpot, type HubSpotDeps } from './client';
export { HubSpotError } from './errors';
export { ASSOCIATION_TYPES } from './associations';
export { hubspotWebhookAuth, HubSpotWebhookAuth, verifyHubSpotSignature, hubspotEventKey, hubspotEventType, HubSpotWebhookBody, type HubSpotWebhookOptions } from './webhooks';
export { provider, settings, configSchema, envNames, operations, webhookEvents, type HubspotConfig as HubSpotConfig, type HubspotOperation as HubSpotOperation, type HubspotWebhookEvent as HubSpotWebhookEvent } from './generated';
export type {
  AddNoteInput,
  Association,
  AssociationInput,
  CreateDealInput,
  CrmObject,
  Filter,
  ObjectType,
  Pipeline,
  PipelineStage,
  Properties,
  PropertyValue,
  SearchInput,
  SearchPage,
  UpsertBatch,
  UpsertContactByEmailInput,
  UpsertResult,
  WebhookEvent,
} from './schemas';
