# @mariachi/notifications

Sends a message to a user over email (Resend, or SMTP for Mailpit), SMS (Twilio), push (FCM) and
an in-app inbox. It respects per-category preferences, delivers each channel as its own retried job
and tracks every delivery.

**Status: beta.** Covered by unit tests and Postgres integration tests. The API can change before 1.0.

Guide: [notifications.md](../core/docs/notifications.md)

## Imports

| Import | Contents |
| --- | --- |
| `@mariachi/notifications` | Service, channel adapters, memory stores, job schema, types |
| `@mariachi/notifications/schema` | `notifications`, `notification_preferences`, `notification_deliveries` tables |
| `@mariachi/notifications/postgres` | `DrizzleNotificationStore` (inbox, preferences and deliveries in one), `notificationTables` (compiled tables for drizzle-kit) |

## Public API

| Export | Purpose |
| --- | --- |
| `DefaultNotifications` | `notify(ctx, intent)`, `deliverJob(ctx, job)` (worker), `sendEmail`, `sendSMS`, `sendPush`, `sendInApp`, `sendTemplatedEmail` |
| `createEmailAdapter(config)` | The email adapter `config.email.adapter` names: `resend`, `smtp`, `postmark`, `sendgrid`, or `custom` with `instance` |
| `ResendEmailAdapter`, `SmtpEmailAdapter`, `PostmarkEmailAdapter`, `SendGridEmailAdapter` | Email adapters. SMTP uses the optional peer `nodemailer`; Postmark and SendGrid use `fetch` |
| `TwilioSmsAdapter`, `FcmPushAdapter` | SMS and push adapters |
| `parseSmtpUrl`, `parseAddress` | What an `SMTP_URL` resolves to; `Name <address>` parsing |
| `DrizzleNotificationStore`, `MemoryInAppStore`, `MemoryPreferenceStore`, `MemoryDeliveryStore` | Stores |
| `NOTIFICATION_DISPATCH_JOB`, `notificationJobSchema` | Name and Zod schema for the per-channel job |
| `renderTemplate` | `{{var}}` (HTML-escaped for email) and `{{{raw}}}` placeholders |

## Config

| Setting | Notes |
| --- | --- |
| `email` | Required. `config.email.adapter`: `'resend'`, `'postmark'` or `'sendgrid'` (`apiKey`, `from`), `'smtp'` (`smtpUrl` as `smtp://user:pass@host:587` or `smtps://…`, `from`), or `'custom'` (`instance`). See the [guide](../core/docs/notifications.md#email-providers) |
| `sms`, `push` | Optional adapters; a channel without one fails with `notifications/*-not-configured` |
| `inApp`, `preferences`, `deliveries` | Stores; pass `DrizzleNotificationStore` for all three |
| `queue` | A `DefaultJobs`. Omit to send inline |
| `attempts` | Inline sends only. Default 3. Queued jobs retry per their job definition |

Twilio: `accountSid`, `authToken`, `from`. FCM: `projectId`, `accessToken` (string or async
function). Errors are `NotificationError`.
