---
'@mariachi/notifications': minor
'@mariachi/config': minor
---

`SmtpEmailAdapter` is a real SMTP client. It honours `email.smtpUrl` (`SMTP_URL`), which
`createEmailAdapter` used to ignore, so SMTP always went to `127.0.0.1:1025` with no login and no
TLS. `smtp://user:pass@host:587` requires STARTTLS when it carries credentials to a remote host,
`smtps://` is TLS from the start, and `?tls=required|opportunistic|none` overrides. It now sends
through `nodemailer`, an optional peer dependency (`pnpm add nodemailer`), which also ends the old
client's header injection through a subject containing a line break.

New `PostmarkEmailAdapter` and `SendGridEmailAdapter` (over `fetch`), and `createEmailAdapter`
accepts `adapter: 'postmark'`, `'sendgrid'`, or `'custom'` with `instance`.

`EmailMessage` gains `cc`, `bcc`, `headers` and `attachments`, sent by every built-in adapter.

Config: `email.apiKey` also reads `EMAIL_API_KEY` (before `RESEND_API_KEY`), and `email.apiUrl`
(`EMAIL_API_URL`) holds the base URL of an HTTP email API for Postmark, SendGrid or a custom adapter.

Breaking: `SmtpEmailConfig`'s `host` and `port` are optional and the adapter needs `nodemailer`
installed; provider failures from SMTP have the code `notifications/provider-failed`.
