export { createCrisp, type Crisp, type CrispDeps } from './client';
export { CrispError } from './errors';
export { CRISP_SCRIPT_PATH, crispCsp, emailSignature, type ChatIdentity, type WidgetSnippetOptions } from './widget';
export {
  crispWebhookAuth,
  crispWebsiteHookAuth,
  crispEventType,
  CrispWebhookAuth,
  CrispWebsiteHookAuth,
  CrispWebhookBody,
  CRISP_SIGNATURE_HEADER,
  CRISP_TIMESTAMP_HEADER,
} from './webhooks';
export { provider, settings, configSchema, envNames, operations, webhookEvents, type CrispConfig, type CrispOperation, type CrispWebhookEvent } from './generated';
export { EVENT_COLORS } from './schemas';
export type {
  AddEventInput,
  ChatUser,
  Conversation,
  ConversationMeta,
  ConversationState,
  CreateProfileInput,
  DataRecord,
  DataValue,
  ListConversationsInput,
  PeopleProfile,
  SendMessageInput,
  SentMessage,
  SetStateInput,
  TrackEventInput,
  UpdateDataInput,
  UpdateMetaInput,
  UpdateProfileInput,
  UpsertContactInput,
} from './schemas';
