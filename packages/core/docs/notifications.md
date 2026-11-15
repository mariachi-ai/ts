# Notifications

`@mariachi/notifications` sends one message to a user across email, SMS, push and an in-app inbox.
It respects the user's preferences, delivers each channel as its own retried job and records every
delivery.

## Wire it

```ts
import {
  DefaultNotifications, NOTIFICATION_DISPATCH_JOB, notificationJobSchema,
  TwilioSmsAdapter, FcmPushAdapter, createEmailAdapter,
} from '@mariachi/notifications';
import { DrizzleNotificationStore } from '@mariachi/notifications/postgres';

const store = new DrizzleNotificationStore(db);          // inbox, preferences and delivery log
const notifications = new DefaultNotifications({
  email: createEmailAdapter(config),                     // config.email.adapter: resend, smtp, postmark, sendgrid or custom
  sms: new TwilioSmsAdapter({ accountSid, authToken, from: '+15550100' }),
  push: new FcmPushAdapter({ projectId, accessToken: () => google.getAccessToken() }),
  inApp: store,
  preferences: store,
  deliveries: store,
  queue: jobs,                                           // a DefaultJobs; omit to send inline
}, instrumentation);

// Register in every process that enqueues or runs jobs; the retry policy lives here.
jobs.registerJob(defineJob({
  name: NOTIFICATION_DISPATCH_JOB,
  schema: notificationJobSchema,
  retry: { attempts: 5, backoff: 'exponential', delay: 2_000 },
  nonRetryableCodes: ['notifications/missing-recipient', 'notifications/rejected'],
  handler: (ctx, job) => notifications.deliverJob(ctx, job),
}));
```

Add the tables from `@mariachi/notifications/schema`.

## Email providers

`createEmailAdapter(config)` reads `config.email` (env in brackets):

| `adapter` (`EMAIL_ADAPTER`) | Needs | Notes |
| --- | --- | --- |
| `resend` (default) | `apiKey` (`RESEND_API_KEY`, or `EMAIL_API_KEY` with `EMAIL_ADAPTER=resend`), `from` (`EMAIL_FROM`) | |
| `smtp` | `smtpUrl` (`SMTP_URL`), `from`; the optional peer `nodemailer` (`pnpm add nodemailer`) | Any SMTP relay, Amazon SES's SMTP endpoint included |
| `postmark` | `apiKey` (`EMAIL_API_KEY`: the server token), `from` | Over `fetch`, no SDK |
| `sendgrid` | `apiKey` (`EMAIL_API_KEY`), `from` | Over `fetch`, no SDK |
| `custom` | `instance`: your own `EmailAdapter` | Or pass the adapter straight to `DefaultNotifications` |

A key only goes to the provider it was set for. `EMAIL_API_KEY` belongs to the adapter
`EMAIL_ADAPTER` names, so setting it without `EMAIL_ADAPTER` stops the app at startup
(`config/email-adapter-required`) instead of sending it to the default, Resend. `RESEND_API_KEY` is
only ever given to the Resend adapter.

`SMTP_URL` is `smtp://user:pass@host:587` or `smtps://user:pass@host:465`, with special characters
in the user and password percent-encoded. `smtps` is TLS from the first byte. `smtp` upgrades with
STARTTLS: it's required when the URL has credentials and the host isn't the local machine, and used
when offered otherwise; `?tls=required`, `?tls=opportunistic` or `?tls=none` overrides that. A URL
with credentials for a remote host can't use `opportunistic` or `none`, because either can send the
password in the clear; `?tls=none-insecure` accepts that on purpose. With no `SMTP_URL` the adapter
sends to `127.0.0.1:1025`, which is Mailpit in `docker-compose.dev.yml`.

A message can carry `cc`, `bcc`, `replyTo`, `headers` and `attachments` (`{ filename, content,
contentType? }`), and `from` as `Ada <ada@example.com>`; every built-in adapter sends all of them.
`stream` names the provider's sending stream for one message (transactional, a newsletter stream):
Postmark sends it as `MessageStream`, and adapters whose provider has no such thing ignore it.

When a provider fails, an adapter throws one of two codes, built with `providerFailure`:

| Code | When | Retried |
| --- | --- | --- |
| `notifications/provider-failed` | HTTP 408, 429 or 5xx; an SMTP 4xx reply; a network error | Yes |
| `notifications/rejected` | Any other HTTP 4xx (a bad key, a suppressed address, an invalid request); an SMTP 5xx reply | No |

Both carry `metadata.retryable`. Inline sends stop at a rejection; for queued delivery, list the
code in the job's `nonRetryableCodes`, as the wiring above does.

An `EmailAdapter` is one method, so another provider (an HTTP email API of your platform's, say) is
a small class. `config.email.apiUrl` (`EMAIL_API_URL`) is there for its base URL:

```ts
class PlatformEmail implements EmailAdapter {
  constructor(private readonly options: { apiUrl: string; apiKey: string }) {}
  async send(message: EmailMessage): Promise<{ id: string }> {
    const res = await fetch(`${this.options.apiUrl}/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.options.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: message.to, subject: message.subject, html: message.html, text: message.text, replyTo: message.replyTo }),
    });
    if (!res.ok) throw providerFailure('platform', `Email API responded ${res.status}`, { status: res.status });   // rejected or provider-failed, by status
    return (await res.json()) as { id: string };
  }
}
```

## Send

```ts
await notifications.notify(ctx, {
  recipientUserId: user.id,
  recipientTenantId: org.id,
  category: 'billing',                        // preferences are per category
  template: { id: 'invoice', name: 'Invoice ready', channel: 'email',
              subject: 'Invoice {{number}} is ready', body: '<p>Hi {{name}}, your invoice is ready.</p>' },
  variables: { name: user.name, number: invoice.number },
  email: user.email, phone: user.phone, pushToken: device.token,
  idempotencyKey: `invoice:${invoice.id}`,    // dedup key for the queued jobs
});
```

Templates use `{{name}}` placeholders. In email bodies, values are HTML-escaped, so a user's
display name can't inject markup. Use `{{{name}}}` only for HTML you built yourself. Subjects never
contain line breaks. SMS, push and in-app bodies are plain text.

## Channels and preferences

- With `channels` omitted, the user's preferences for the category decide (default: `email` and
  `in_app`). An explicit empty list is a full opt-out.
- With `channels` given, they are filtered by the preferences.
- `priority: 'critical'` skips the preference filter (password resets, security alerts).

```ts
await store.setChannels(userId, tenantId, 'marketing', []);          // opt out of a category
await store.setChannels(userId, tenantId, 'billing', ['email', 'push']);
```

## Delivery and retries

With a `queue`, `notify` records each channel as `queued` and enqueues one
`notifications.dispatch` job per channel, carrying the caller's context. The job definition owns
the retries: `deliverJob` makes one attempt per run. Without a queue, channels are sent inline and
retried `attempts` times (default 3) with backoff. Either way:

- `notification_deliveries` holds one row per notification and channel, with its status
  (`queued`, `sent`, `delivered`, `failed`, `bounced`), `attemptCount`, provider id and last error.
- A channel already `sent` is skipped, so a redelivered job doesn't message the user twice.
- A missing recipient or an unconfigured channel fails immediately and isn't retried.
- Provider callbacks (Twilio status, email bounces) update the row with
  `store.updateByExternalId(providerId, { status: 'delivered', deliveredAt })`.

## Inbox

```ts
await store.findUnread(ctx.userId!, ctx.tenantId);
await store.markRead(notificationId, ctx.userId!);   // only the recipient can mark it read
await store.markAllRead(ctx.userId!, ctx.tenantId);
```

## Errors

Everything throws `NotificationError`: `notifications/missing-recipient`,
`notifications/*-not-configured`, `notifications/email-send-failed`, `notifications/sms-send-failed`,
`notifications/push-send-failed`, `notifications/provider-failed`, `notifications/rejected` and
configuration codes such as `notifications/missing-api-key` and `notifications/invalid-smtp-url`.
