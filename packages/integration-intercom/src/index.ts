export { createIntercom, INTERCOM_API_VERSION, type Intercom, type IntercomDeps } from './client';
export { IntercomError } from './errors';
export {
  intercomCsp,
  signChatIdentity,
  messengerSnippet,
  INTERCOM_SCRIPT_PATH,
  REGIONS,
  API_BASE,
  MESSENGER_API_BASE,
  type ChatIdentity,
  type ChatIdentityOptions,
  type IntercomRegion,
  type WidgetSnippetOptions,
} from './messenger';
export { IntercomWebhookAuth, intercomWebhookAuth, intercomEventType, IntercomWebhookBody } from './webhooks';
export { provider, settings, configSchema, envNames, operations, webhookEvents, type IntercomConfig, type IntercomOperation, type IntercomWebhookEvent } from './generated';
export {
  Contact,
  Company,
  Conversation,
  ConversationPart,
  Note,
  Notification,
  type ContactPage,
  type ConversationPage,
  type SearchQuery,
  type SearchInput,
  type ChatUser,
  type UpsertContactInput,
  type TrackEventInput,
  type CreateContactInput,
  type UpdateContactInput,
  type CompanyInput,
  type CreateEventInput,
  type ReplyInput,
  type CloseInput,
  type CreateNoteInput,
  type GetConversationInput,
  type ListConversationsInput,
} from './schemas';
