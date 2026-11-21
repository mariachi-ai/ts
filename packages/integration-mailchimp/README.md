# @mariachi/integration-mailchimp

Mailchimp's Marketing API for an app's newsletter: subscribing the people who ask (double opt-in
by default), tags and merge fields, unsubscribing and erasing, and Mailchimp's signed webhooks
when someone unsubscribes or changes their address.

**This is not transactional email.** Receipts, password resets and other mail one person gets
because of something they did go through `@mariachi/notifications`' email port. Mailchimp
Transactional (formerly Mandrill) is a separate product with its own API, and this package
doesn't cover it.

**Status: alpha.** Covered by unit tests against a scripted Mailchimp. The contract is in
[contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `MAILCHIMP_API_KEY` | The API key (secret) | Profile › Extras › API keys › Create A Key. It's shown once |
| `MAILCHIMP_AUDIENCE_ID` | The audience the app's contacts are kept in | Audience › All contacts › Settings › Audience name and defaults |
| `MAILCHIMP_SERVER_PREFIX` | The account's data center (`us6`), optional | Read from the key's suffix after the dash (`…-us6`); leave it unset |
| `MAILCHIMP_WEBHOOK_SECRET` | Checks the webhooks (secret, optional) | Shown once when the webhook is created; `webhooks.create` returns it |

An API key has full access to the account: keep it on the server, never in a browser or a mobile
app. Plan to rotate it. Mailchimp's developer docs say keys don't expire, but its help centre says
keys made after 22 June 2026 expire after a year, and any key stops working when the user who
made it leaves the account.

Mailchimp has no test mode: use a separate audience for test, with its own `MAILCHIMP_AUDIENCE_ID`.

## Use

```ts
import { createMailchimp, settings } from '@mariachi/integration-mailchimp';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const mailchimp = createMailchimp(settingsFromEnv(settings, readEnv), { tracer, metrics });

// The person ticked "Send me the newsletter"
await mailchimp.subscribe(ctx, { email, firstName, lastName, tags: ['signup-page'], ipSignup: request.ip });

// They asked to stop, from the app's own settings
await mailchimp.members.unsubscribe(ctx, email);

// An erasure request: everything personal goes, and the address can't be added back through the API
await mailchimp.members.deletePermanently(ctx, email);
```

Every operation takes `ctx` first and makes one span (`mailchimp members.upsert`). Contacts are
named by email address; the client hashes it into Mailchimp's id (`subscriberHash(email)`, the
MD5 of the lowercased address), so `Ada@Example.com` and `ada@example.com` are one contact. A
failure is a `MailchimpError` with a category: only `rate-limited` and `unavailable` are
retried, and the client already did. The codes an app acts on:

| Code | Means |
| --- | --- |
| `mailchimp/forgotten-email` | The address was deleted permanently. Only the person can re-subscribe, through a Mailchimp signup form |
| `mailchimp/member-exists` | Another contact already has that address (changing one's address with `members.update`) |
| `mailchimp/invalid-resource` | Mailchimp refused the contact: the message names the merge fields at fault |
| `mailchimp/invalid-api-key` | The key is wrong, deleted or expired |

### Consent

Mailchimp is for people who asked to hear from the app, and the law in much of the world (GDPR,
CAN-SPAM, CASL) says the same.

- Subscribe someone only when they asked: a box they tick themselves, unticked by default. Never
  because they made an account or bought something.
- Keep double opt-in on (`subscribe`'s default). Mailchimp emails the person to confirm, and they
  stay `pending`, receiving nothing, until they do. That proves the address is theirs and that
  they asked.
- `subscribe` doesn't re-subscribe someone already subscribed, and asks someone who had
  unsubscribed to confirm again.
- Pass `ipSignup` so the record of their consent says where it came from.
- Unsubscribe the moment someone asks, wherever they ask, and listen for `unsubscribe` webhooks so
  the app knows when they ask Mailchimp.
- `members.batch` is for imports where each person already asked (an old signup form's list),
  never for a list of customers.

### Other operations

| Operation | Does |
| --- | --- |
| `members.upsert(ctx, { email, statusIfNew, status?, mergeFields? })` | Adds or updates a contact, with no opt-in logic of its own |
| `members.get(ctx, email)` | The contact, whatever its status |
| `members.update(ctx, { email, mergeFields?, status?, newEmail? })` | Changes merge fields, status or address |
| `members.updateTags(ctx, { email, add?, remove? })` | Adds and removes tags |
| `members.archive(ctx, email)` | Removes the contact from the audience, keeping its history |
| `members.batch(ctx, { members, updateExisting? })` | Up to 500 contacts at once; the answer lists the ones that failed |
| `mergeFields.list(ctx)` | The audience's merge fields (`FNAME`, `LNAME`, the audience's own) |
| `webhooks.create(ctx, { url, events?, sources? })`, `.list`, `.delete` | The audience's webhooks |

## Hear when contacts change

Mailchimp posts the change as a form (`type=unsubscribe&data[email]=…`), signed with
`X-Mailchimp-Signature: t=…,v1=…` (an HMAC-SHA256 of the timestamp and the raw body), and checks
the URL with a GET when the webhook is created. `mailchimpWebhookAuth` checks the signature,
refuses deliveries more than five minutes old, and answers the GET; `MailchimpWebhookBody` reads
the form into one of six typed events.

```ts
import { WebhookController } from '@mariachi/webhooks';
import { MailchimpWebhookBody, mailchimpEventType, mailchimpWebhookAuth } from '@mariachi/integration-mailchimp';

export class MailchimpWebhooks extends WebhookController {
  readonly prefix = 'mailchimp';
  readonly auth = mailchimpWebhookAuth(config.mailchimp.webhookSecret);
  init() {
    const route = { mode: 'queue', jobName: 'mailchimp-event', eventType: mailchimpEventType } as const;
    const read = async (_ctx: unknown, body: unknown) => MailchimpWebhookBody.parse(body);
    this.post('events', route, read);
    this.get('events', route, read);   // Mailchimp's check of the URL: answered 200, never queued
  }
}

// The job
switch (payload.type) {
  case 'unsubscribe': /* payload.data.email stops getting the newsletter */ break;
  case 'upemail':     /* payload.data.old_email is now payload.data.new_email */ break;
  case 'cleaned':     /* mail to payload.data.email bounced */ break;
}
```

Then create the webhook once the endpoint is deployed, and store the secret it returns:

```ts
const hook = await mailchimp.webhooks.create(ctx, { url: 'https://app.example.com/webhooks/mailchimp/events' });
// hook.signing_secret is shown this once: store it as MAILCHIMP_WEBHOOK_SECRET
```

By default the webhook sends every contact event (subscribe, unsubscribe, profile, upemail,
cleaned) but not campaigns, from contacts and admins but not from the API: the app knows what it
changed itself. Creating a webhook isn't safe to repeat: `webhooks.list` first. A webhook made in
the dashboard shows its secret once after Save; a lost secret can't be read again, so delete the
webhook and make another.

Mailchimp retries a delivery that fails or takes over 10 seconds, for up to 75 minutes, so make
each event's handling safe to run twice: set the contact's state, don't toggle it.

## Test

```ts
import { fakeMailchimp, mailchimpMember, signedMailchimpWebhook } from '@mariachi/integration-mailchimp/testing';

const mailchimp = fakeMailchimp({ members: [mailchimpMember('ada@example.com')] });
const { rawBody, headers } = signedMailchimpWebhook({ type: 'unsubscribe', data: { id, list_id, email } }, secret);   // post it to the controller
```

The fake keeps a new contact `pending` under double opt-in and refuses a permanently deleted
address, as Mailchimp does.
