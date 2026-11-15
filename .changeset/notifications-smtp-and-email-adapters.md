---
'@mariachi/notifications': minor
'@mariachi/config': minor
---

`SmtpEmailAdapter` is a real SMTP client. It honours `email.smtpUrl` (`SMTP_URL`), which
`createEmailAdapter` used to ignore, so SMTP always went to `127.0.0.1:1025` with no login and no
TLS. `smtp://user:pass@host:587` requires STARTTLS when it carries credentials to a remote host,
`smtps://` is TLS from the start, and `?tls=required|opportunistic|none` overrides, except that
credentials for a remote host are never sent without TLS unless the URL says `?tls=none-insecure`. It now sends
through `nodemailer`, an optional peer dependency (`pnpm add nodemailer`), which also ends the old
client's header injection through a subject containing a line break.

New `PostmarkEmailAdapter` and `SendGridEmailAdapter` (over `fetch`), and `createEmailAdapter`
accepts `adapter: 'postmark'`, `'sendgrid'`, or `'custom'` with `instance`.

`EmailMessage` gains `cc`, `bcc`, `headers` and `attachments`, sent by every built-in adapter, and
`stream` (Postmark's `MessageStream`, per message).

Provider failures are split by whether sending again can help: `notifications/provider-failed`
(HTTP 408, 429, 5xx; SMTP 4xx; network errors) is retried, and the new `notifications/rejected`
(other HTTP 4xx; SMTP 5xx) is not. Both carry `metadata.retryable`; `providerFailure` builds them
for custom adapters. Add `notifications/rejected` to the dispatch job's `nonRetryableCodes`.

Config: `EMAIL_API_KEY` is the key for the adapter `EMAIL_ADAPTER` names, and `email.apiUrl`
(`EMAIL_API_URL`) holds the base URL of an HTTP email API for Postmark, SendGrid or a custom adapter.
A key never goes to another provider: `EMAIL_API_KEY` without `EMAIL_ADAPTER` fails at startup
(`config/email-adapter-required`) instead of being sent to the default adapter, Resend, and
`RESEND_API_KEY` is only given to the Resend adapter.

Breaking: `SmtpEmailConfig`'s `host` and `port` are optional and the adapter needs `nodemailer`
installed; a provider's refusal now has the code `notifications/rejected`, from
`DefaultNotifications.sendEmail` too (it was always `notifications/email-send-failed`); with
`EMAIL_ADAPTER` set to anything but `resend`, `RESEND_API_KEY` is no longer read.
