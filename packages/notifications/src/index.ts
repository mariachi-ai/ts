import { PostmarkEmailAdapter } from './adapters/email/postmark';
import { ResendEmailAdapter } from './adapters/email/resend';
import { SendGridEmailAdapter } from './adapters/email/sendgrid';
import { SmtpEmailAdapter } from './adapters/email/smtp';
import { NotificationError } from '@mariachi/core';
import type { NotificationsConfig } from './notifications';
import type {
  EmailAdapter,
  EmailAttachment,
  EmailMessage,
  InAppNotification,
  InAppNotificationStore,
  NotificationTemplate,
  RenderedNotification,
  NotificationChannel,
  NotificationIntent,
  DeliveryRecord,
  SMSAdapter,
  PushAdapter,
  NotificationPreferencesStore,
  NotificationJob,
  NotificationQueue,
  DeliveryStore,
} from './types';

export type {
  NotificationsConfig,
  EmailMessage,
  EmailAttachment,
  EmailAdapter,
  InAppNotification,
  InAppNotificationStore,
  NotificationTemplate,
  RenderedNotification,
  NotificationChannel,
  NotificationIntent,
  DeliveryRecord,
  SMSAdapter,
  PushAdapter,
  NotificationPreferencesStore,
  NotificationJob,
  NotificationQueue,
  DeliveryStore,
};
export { NOTIFICATION_DISPATCH_JOB } from './types';
export { notificationJobSchema } from './job-schema';
export { renderTemplate } from './template';

export { ResendEmailAdapter, type ResendEmailAdapterOptions } from './adapters/email/resend';
export { SmtpEmailAdapter, parseSmtpUrl, type SmtpEmailConfig, type SmtpOptions, type SmtpTransport } from './adapters/email/smtp';
export { PostmarkEmailAdapter, type PostmarkEmailConfig } from './adapters/email/postmark';
export { SendGridEmailAdapter, type SendGridEmailConfig } from './adapters/email/sendgrid';
export { parseAddress, type EmailAddress } from './adapters/email/address';
export { TwilioSmsAdapter, type TwilioSmsConfig } from './adapters/sms/twilio';
export { FcmPushAdapter, type FcmPushConfig } from './adapters/push/fcm';
export { MemoryInAppStore, MemoryPreferenceStore, MemoryDeliveryStore } from './store/memory';

export interface EmailAdapterConfig {
  /** `'resend'`, `'smtp'`, `'postmark'`, `'sendgrid'`, or `'custom'` with `instance`. */
  adapter: string;
  apiKey?: string;
  from?: string;
  /** For `smtp`: `smtp://user:pass@host:587` or `smtps://…` (see `SmtpEmailConfig.url`). */
  smtpUrl?: string;
  /** For `smtp` without `smtpUrl`: a local sink. Default `127.0.0.1:1025` (Mailpit). */
  host?: string;
  port?: number;
  /** For `postmark` and `sendgrid`: the API's base URL, when it isn't the provider's own. */
  apiUrl?: string;
  /** For `custom`: your own `EmailAdapter`. */
  instance?: EmailAdapter;
}

/**
 * The email adapter `config.email` names. Anything else that sends mail plugs in as `adapter:
 * 'custom'` with `instance`, or by passing your own `EmailAdapter` to `DefaultNotifications`.
 */
export function createEmailAdapter(config: { email?: EmailAdapterConfig }): EmailAdapter {
  const emailConfig = config.email;
  if (!emailConfig) {
    throw new NotificationError('notifications/missing-email-config', 'Email config is required');
  }
  const requireKey = (provider: string): string => {
    if (!emailConfig.apiKey) throw new NotificationError('notifications/missing-api-key', `${provider} adapter requires apiKey`);
    return emailConfig.apiKey;
  };
  switch (emailConfig.adapter) {
    case 'smtp':
      return new SmtpEmailAdapter({
        url: emailConfig.smtpUrl,
        host: emailConfig.host,
        port: emailConfig.port,
        from: emailConfig.from ?? 'mariachi@localhost',
      });
    case 'resend':
      return new ResendEmailAdapter({ apiKey: requireKey('Resend'), from: emailConfig.from });
    case 'postmark':
      return new PostmarkEmailAdapter({ apiKey: requireKey('Postmark'), from: emailConfig.from, apiUrl: emailConfig.apiUrl });
    case 'sendgrid':
      return new SendGridEmailAdapter({ apiKey: requireKey('SendGrid'), from: emailConfig.from, apiUrl: emailConfig.apiUrl });
    case 'custom':
      if (!emailConfig.instance) throw new NotificationError('notifications/missing-email-config', "Email adapter 'custom' requires instance");
      return emailConfig.instance;
    default:
      throw new NotificationError('notifications/unknown-adapter', `Unknown email adapter: ${emailConfig.adapter}`);
  }
}

export { Notifications, DefaultNotifications } from './notifications';
export * from './schema/index';
