export { createZendesk, type Zendesk, type ZendeskDeps } from './client';
export { ZendeskError } from './errors';
export { zendeskCsp, ZENDESK_MESSENGER_SCRIPT_PATH, type WidgetCookies, type WidgetSnippetOptions } from './widget';
export { ZendeskWebhookAuth, zendeskWebhookAuth, zendeskEventType, zendeskSubject, ZendeskWebhookBody, type ZendeskWebhookAuthOptions } from './webhooks';
export { provider, settings, configSchema, envNames, operations, webhookEvents, type ZendeskConfig, type ZendeskOperation, type ZendeskWebhookEvent } from './generated';
export type {
  AddCommentInput,
  ChatIdentity,
  ChatUser,
  Comment,
  CommentPage,
  CreateOrUpdateOrganizationInput,
  CreateOrUpdateUserInput,
  CreateTicketInput,
  ListCommentsInput,
  ListRequestedInput,
  Organization,
  SearchTicketsInput,
  SearchUsersInput,
  Ticket,
  TicketPage,
  TicketSearchPage,
  TrackEventInput,
  TrackEventsInput,
  UpdateTicketInput,
  UpsertContactInput,
  User,
  UserPage,
  ZendeskEvent,
} from './schemas';
