export { createMailchimp, type Mailchimp, type MailchimpDeps } from './client';
export { MailchimpError } from './errors';
export { subscriberHash, serverPrefixOf } from './hash';
export {
  MailchimpWebhookAuth,
  mailchimpWebhookAuth,
  mailchimpEventType,
  MailchimpWebhookBody,
  expandFormBody,
  SubscribeEvent,
  UnsubscribeEvent,
  ProfileEvent,
  UpemailEvent,
  CleanedEvent,
  CampaignEvent,
} from './webhooks';
export { provider, settings, configSchema, envNames, operations, webhookEvents, type MailchimpConfig, type MailchimpOperation } from './generated';
export type {
  BatchMembersInput,
  BatchResult,
  CreateWebhookInput,
  CreatedWebhook,
  ListMergeFieldsInput,
  Member,
  MemberStatus,
  MergeField,
  MergeFieldPage,
  MergeFieldValues,
  SettableStatus,
  SubscribeInput,
  UpdateMemberInput,
  UpdateTagsInput,
  UpsertMemberInput,
  Webhook,
} from './schemas';
