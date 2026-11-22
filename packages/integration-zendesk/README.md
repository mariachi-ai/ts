# @mariachi/integration-zendesk

Zendesk for a Mariachi app: the messaging Web Widget on its pages with the signed-in user, and the
Support API for users, organizations, tickets, their comments and events in a user's timeline.
Zendesk's webhooks arrive signed and deduplicated.

**Status: alpha.** Covered by unit tests against a scripted Zendesk, and the widget's setup script
run in a sandbox. The contract is in [contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `ZENDESK_SUBDOMAIN` | `acme` for `https://acme.zendesk.com` (public) | The account's address |
| `ZENDESK_CLIENT_ID` | The OAuth client the server signs in with | Admin Center › Apps and integrations › APIs › OAuth clients › Add OAuth client, kind **Confidential**: Identifier |
| `ZENDESK_CLIENT_SECRET` | Its secret (secret) | The same page: Secret, shown once when saved |
| `ZENDESK_OAUTH_SCOPE` | The scopes its access tokens ask for, space-separated (optional, `read write` by default, which covers every operation here) | Your choice of Zendesk's OAuth scopes, such as `tickets:write users:read` |
| `ZENDESK_EMAIL`, `ZENDESK_API_TOKEN` | Legacy: an agent's email and API token (secret), used only without an OAuth client | Admin Center › Apps and integrations › APIs › API tokens |
| `ZENDESK_WIDGET_KEY` | Which Web Widget pages load (public) | Admin Center › Channels › Messaging and social › Messaging › your widget › Installation: the `key=` in the snippet |
| `ZENDESK_MESSAGING_KEY_ID` | The signing key's ID, for signed-in users | Admin Center › Account › Security › End user authentication › Messaging › Create key |
| `ZENDESK_MESSAGING_SECRET` | Its shared secret (secret) | The same page, shown in full only when the key is made |
| `ZENDESK_WEBHOOK_SECRET` | A webhook's signing secret (secret, optional) | Admin Center › Apps and integrations › Webhooks › Webhooks › your webhook › Reveal secret |
| `ZENDESK_EVENT_SOURCE` | The app's name in users' event timelines (optional, `app` by default) | Your choice; keep it stable |

Every setting but the subdomain is optional: set the ones for what the app uses. The Support API
needs the OAuth client (or, for now, the API token); the widget needs the widget key; signed-in
users need the messaging key.

**API tokens are on their way out.** Zendesk stopped issuing new ones on October 27, 2026 (new
accounts since July 28, 2026 never had them) and turns all of them off on April 30, 2027. Use an
OAuth client: the package gets an access token with the client credentials grant, asking for
`ZENDESK_OAUTH_SCOPE` (`read write` unless set; Zendesk refuses a request without a scope), and fetches a new
one before it expires. Requests act as the admin who made the client, so make it as a dedicated
agent if who did what matters in the audit log.

Zendesk has no test keys. For test, use a sandbox (Enterprise plans: Admin Center › Account ›
Sandbox) or a trial account, each with its own subdomain, OAuth client, widget and messaging key.

## Use

```ts
import { createZendesk, settings } from '@mariachi/integration-zendesk';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const zendesk = createZendesk(settingsFromEnv(settings, readEnv), { tracer, metrics });
```

Every Support API operation takes `ctx` first and makes one span (`zendesk tickets.create`). A
failure is a `ZendeskError` with a category: only `rate-limited` and `unavailable` are retried,
waiting as long as Zendesk's `Retry-After` says, and the client already did. Zendesk's error code
(`RecordNotFound`, `RecordInvalid`) is in `providerCode`; its description never is, since it can
echo the input.

```ts
// The app's user as a Zendesk user, matched by external_id (the app's own id)
const { id, created } = await zendesk.upsertContact(ctx, { id: user.id, email: user.email, name: user.name });

// Their team as an organization, and the user in it
const org = await zendesk.organizations.createOrUpdate(ctx, { externalId: team.id, name: team.name });
await zendesk.users.createOrUpdate(ctx, { externalId: user.id, organizationId: org.id });

// A ticket from a contact form: the form's id as the idempotency key, so a retried job makes one ticket
const ticket = await zendesk.tickets.create(ctx, {
  subject: form.subject,
  comment: { body: form.message },
  requesterId: Number(id),
  idempotencyKey: form.id,
});

// The user's tickets, a reply, and an internal note
const { tickets, meta } = await zendesk.tickets.listRequested(ctx, { userId: Number(id), sort: '-updated_at' });
await zendesk.comments.add(ctx, { ticketId: ticket.id, body: 'Thanks, we are on it.' });
await zendesk.tickets.update(ctx, { ticketId: ticket.id, status: 'pending', comment: { body: 'Asked engineering', public: false } });
for await (const comment of zendesk.comments.all(ctx, { ticketId: ticket.id })) { /* ... */ }

// Search, in Zendesk's syntax (type:ticket is added)
await zendesk.tickets.search(ctx, { query: `status<solved requester:${user.email}`, sortBy: 'updated_at' });

// An event in the user's timeline in Agent Workspace
await zendesk.trackEvent(ctx, { userId: user.id, name: 'plan_upgraded', metadata: { plan: 'pro' } });
```

- **Ids** are Zendesk's numbers. `upsertContact` gives Zendesk's id as a string, the same shape as
  the app's other chat integrations; pass `Number(id)` to the ticket operations.
- **Creating a ticket** sends an `Idempotency-Key`, fresh per call unless given, so the client's
  own retries never make two. Zendesk keeps a key for two hours; the same key with another body
  fails with `zendesk/idempotency-key-reused`.
- **A ticket update or comment** is retried only after a rate limit: after an outage Zendesk may
  have added the comment already.
- **`users.createOrUpdate`** matches the user by `externalId`, case-insensitively, or else by
  `email`. Zendesk needs a `name` to create one, and on an existing user a new email becomes a
  second identity. It allows 5 calls a minute per user. Custom `userFields` (`attributes` in
  `upsertContact`) must exist in the account.
- **`organizations.createOrUpdate`** matches by `externalId` or `id`, never by name.
- **Events** go to the Events API (Suite Team and above). Each event belongs to a profile with
  source `ZENDESK_EVENT_SOURCE` and type `user`, found by the user's external_id. Zendesk makes
  an anonymous user for an external_id it doesn't know, so `upsertContact` first.

## The Web Widget

`zendesk.widgetSnippet()` gives two `<script>` tags: Zendesk's snippet, then the setup this package
ships, which tells the widget what it may store and signs the user in. Mariachi pages run no inline
script, so the setup is a file (`@mariachi/integration-zendesk/zendesk-messenger.js`) the app
serves.

**1. Serve the setup script** (in `src/app.ts`, beside the design's files):

```ts
const packageFile = createRequire(import.meta.url).resolve;

api.withStaticFile('/assets/lib/zendesk-messenger.js', packageFile('@mariachi/integration-zendesk/zendesk-messenger.js'));
```

**2. Sign the user and put the widget at the end of the layout's `<body>`**, as Zendesk asks:

```ts
// Where the signed-in user is loaded for the page (a service, with the client from the container)
const identity = await zendesk.chatIdentity({ id: user.id, email: user.email, emailVerified: user.emailVerified, name: user.name });

// The layout: identity is undefined for a visitor who isn't signed in
html`<body>…${zendesk.widgetSnippet({ identity, tokenUrl: '/chat/token', cookies: page.consent?.analytics ? 'all' : 'functional' })}</body>`
```

`chatIdentity` makes Zendesk's messaging JWT: HS256 with the messaging secret, the key ID as
`kid`, and `scope: "user"`, `external_id` (the user's id), `name` and `exp`. With it, the user's
conversations follow them across devices, and agents see them as verified.

- It lasts 10 minutes (`{ ttlSeconds }` changes that), as Zendesk advises short-lived tokens. When
  the widget needs a new one, the setup script fetches `tokenUrl`, a route of the app that answers a
  signed-in user with `{ "token": … }` and anyone else with 401:

  ```ts
  // A controller route (signed-in only); chat.identity is a procedure returning zendesk.chatIdentity(...) for ctx.userId
  this.get('/chat/token', { root: true }, async (ctx) => {
    const { token } = await this.call(ctx, 'chat.identity', {});
    return new HttpResponse(200, { token }, { 'cache-control': 'no-store' });
  });
  ```
- The email goes in only with `emailVerified: true`, as `email_verified`: Zendesk then trusts it
  as the user's, and an email can belong to one user only. Set it only when the user proved they
  own the address.
- Zendesk keeps the `name` from a user's first sign-in. `createdAt` and `company` aren't in the
  JWT: set them with `upsertContact` and `organizations.createOrUpdate`.
- A page rendered without `identity`, after one with, signs the widget out, so the next person on
  the same browser doesn't see the previous user's conversations.

**3. Send the page with the widget's policy.** `zendeskCsp()` adds Zendesk's hosts to the page's
Content-Security-Policy (`htmlResponse`'s by default): `*.zdassets.com`, `*.zendesk.com`, the
messaging and voice hosts (`*.smooch.io`, `*.twilio.com`, their `wss:` endpoints), and its images
and media. Everything else stays, and inline script still doesn't run.

```ts
this.get('/', { root: true, auth: false }, async (ctx) => htmlResponse(homePage(…), { csp: zendeskCsp() }));
```

That is Zendesk's list for a policy that isn't Google's strict, nonce-based kind, less one source
browsers can't read (`https://*.ingest.*.sentry.io`, the widget's own error reports). Zendesk
doesn't guarantee a custom policy: check the browser console after turning on a new widget feature.

**Cookies and consent.** The widget uses cookies and local storage, in three groups: essential,
functional and analytics. `cookies` passes the visitor's choice to `zE('messenger:set', 'cookies',
…)`: `functional` (the default) keeps everything but analytics, `all` adds the analytics ones
(pages viewed, proactive message analytics), and `none` stores nothing, which hides the widget.
Where the visitor must agree before anything is stored, render the snippet only once they have.

## Receive webhooks

Make a webhook in Admin Center › Apps and integrations › Webhooks, subscribed to Zendesk events
(`zen:event-type:ticket.created`, `…ticket.comment_added`, `…user.created`; the
[full list](https://developer.zendesk.com/api-reference/webhooks/event-types/webhook-event-types/)),
or connected to a trigger or automation. Its signing secret is `ZENDESK_WEBHOOK_SECRET`.

```ts
import { WebhookController } from '@mariachi/webhooks';
import { ZendeskWebhookBody, zendeskEventType, zendeskSubject, zendeskWebhookAuth } from '@mariachi/integration-zendesk';

export class ZendeskWebhooks extends WebhookController {
  readonly prefix = 'zendesk';
  readonly auth = zendeskWebhookAuth(config.zendesk.webhookSecret);
  init() {
    this.post('events', { mode: 'queue', jobName: 'zendesk-event', eventType: zendeskEventType },
      async (_ctx, body) => ZendeskWebhookBody.parse(body));
  }
}

// The job
if (payload.type === 'zen:event-type:ticket.comment_added') {
  const { id } = zendeskSubject(payload.subject)!;   // zen:ticket:342757 → { kind: 'ticket', id: '342757' }
}
```

- **The signature:** `X-Zendesk-Webhook-Signature` is the base64 HMAC-SHA256 of the
  `X-Zendesk-Webhook-Signature-Timestamp` header followed by the raw body, keyed with the
  webhook's secret. A delivery signed more than five minutes from now is refused
  (`toleranceSeconds` changes that). Each webhook has its own secret: pass a list for several, or
  for two during a rotation.
- **Dedup:** Zendesk delivers at least once, retrying after a 409, a timeout, or a 429 or 503 with
  a short `Retry-After`. A Zendesk event is deduplicated on its `id`, which the signature covers.
  A trigger's or automation's body is the account's own JSON, deduplicated on its signature, which
  covers its timestamp, so a retry Zendesk signs again isn't caught: put the ticket's id and what changed in the body, and
  make the job safe to run twice for them.
  For a trigger's span to name the event, give its body a `type` field.
- Zendesk signs a test sent before the webhook is saved with the fixed secret
  `dGhpc19zZWNyZXRfaXNfZm9yX3Rlc3Rpbmdfb25seQ==`.

## Test

```ts
import { fakeZendesk, signedZendeskWebhook, zendeskEvent } from '@mariachi/integration-zendesk/testing';

const zendesk = fakeZendesk();                       // in place of createZendesk's client
// …run the code under test with it…
expect([...zendesk.tickets_.values()][0]!.subject).toBe('Help');
expect(zendesk.events_).toEqual([{ userId: 'u_1', type: 'plan_upgraded', properties: { plan: 'pro' } }]);

const { rawBody, headers } = signedZendeskWebhook(zendeskEvent('ticket.created', { id: '35' }), secret);   // post it to the controller
```

The fake keeps users, organizations, tickets, comments and events in memory. Its `chatIdentity`
gives an unsigned stand-in token (`fake.<userId>`), and its `widgetSnippet` renders the real
markup.
