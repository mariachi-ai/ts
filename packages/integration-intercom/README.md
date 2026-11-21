# @mariachi/integration-intercom

Intercom for a Mariachi app: the Messenger on its pages, with the signed-in user's identity signed
on the server; contacts, companies, events, conversations and notes through the REST API; and
Intercom's signed webhooks.

**Status: alpha.** Covered by unit tests against a scripted Intercom, and the Messenger's loader
run in a sandbox. Every call asks for REST API version `2.18` (`INTERCOM_API_VERSION`). The
contract is in [contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `INTERCOM_ACCESS_TOKEN` | Calls the REST API (secret) | Developer Hub › your app › Configure › Authentication |
| `INTERCOM_APP_ID` | The workspace ID the Messenger opens (public, optional) | The part of the Intercom address after `/apps/`, or `app_id` in Settings › Channels › Messenger › Install |
| `INTERCOM_REGION` | `us` (the default), `eu` or `au` (optional) | Your Intercom address: `app.eu.intercom.com` is `eu`, `app.au.intercom.com` is `au` |
| `INTERCOM_MESSENGER_SECRET` | Signs the user's identity for the Messenger (secret, optional) | Settings › Workspace › Security › Messenger |
| `INTERCOM_CLIENT_SECRET` | Checks the webhooks (secret, optional) | Developer Hub › your app › Configure › Basic information |

Intercom has no test mode, and nothing in a token tells test from production: use a separate
development workspace, with its own app and its own Messenger secret, for test.

## Use

```ts
import { createIntercom, settings } from '@mariachi/integration-intercom';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const intercom = createIntercom(settingsFromEnv(settings, readEnv), { tracer, metrics });

// At sign-up, or when the profile changes: the app's user id is Intercom's external_id
const { id: contactId } = await intercom.upsertContact(ctx, { id: user.id, email: user.email, name: user.name, attributes: { plan: 'team' } });

// When the user does something worth knowing in Intercom
await intercom.trackEvent(ctx, { userId: user.id, name: 'invited-teammate', metadata: { seats: 3 } });
```

Every operation takes `ctx` first and makes one span (`intercom contacts.create`). A failure is an
`IntercomError` with a category: only `rate-limited` and `unavailable` are retried, and the client
already did (a create is retried only after a rate limit, since Intercom takes no idempotency key).

`chatIdentity`, `widgetSnippet`, `upsertContact` and `trackEvent` are the same surface as the
other live-chat packages, so an app can switch providers. The rest is Intercom's own:

| | |
| --- | --- |
| `contacts` | `create`, `update`, `get`, `findByExternalId` (`null` when there's none), `search`, `attachCompany` |
| `companies` | `createOrUpdate`, by the app's own `companyId` |
| `events` | `create`: for a user (`userId`), a lead (`contactId`) or by `email` |
| `conversations` | `list`, `search`, `get`, `reply` (as a teammate: a `comment` or a `note`), `close` |
| `notes` | `create`, on a contact |

`search` takes Intercom's query: one condition, or `AND` / `OR` over several.

```ts
// A user's open conversations
const page = await intercom.conversations.search(ctx, {
  query: { operator: 'AND', value: [{ field: 'contact_ids', operator: '=', value: contactId }, { field: 'state', operator: '=', value: 'open' }] },
});
```

Custom attributes (on contacts and companies) must already exist in the workspace, under
Settings › Data, or Intercom refuses the call. An event's metadata keeps at most 20 keys per event
name, ever. Intercom ignores a repeated event with the same user, name and second; `trackEvent`
sends the time to the second, so a retried call is recorded once.

## The Messenger

The Messenger is Intercom's chat widget. For a signed-in user, the server signs who they are, so
nobody can open another user's conversations by changing an id in the page: `chatIdentity` makes a
JWT with the Messenger API secret (HS256, with `user_id`, `email`, `name`, `created_at` and the
`company` as claims, and an `exp`), and the Messenger takes it as `intercom_user_jwt`.

Turn on Messenger security in Intercom (Settings › Workspace › Security › Messenger) so that
it refuses users who aren't signed. Intercom's older identity verification, a `user_hash` (an
HMAC-SHA256 of the user's id), still works but is legacy: this package signs JWTs only.

**1. Serve the loader** with the other files pages load (in `src/app.ts`). Mariachi pages run no
inline script, so Intercom's install snippet is a file this package ships:

```ts
const packageFile = createRequire(import.meta.url).resolve;

api.withStaticFile('/assets/lib/intercom.js', packageFile('@mariachi/integration-intercom/intercom.js'));
```

**2. Put the Messenger on the page**, at the end of the layout's `<body>`, with the user's identity
signed for that render (it expires in an hour):

```ts
// The page route
const identity = user ? await intercom.chatIdentity({ id: user.id, email: user.email, name: user.name, company: { id: org.id, name: org.name } }) : undefined;

// src/api/pages/layout.ts
html`<body>…${page.chat ? intercom.widgetSnippet({ identity: page.identity }) : null}</body>`;
```

Without an identity the Messenger talks to an anonymous visitor. `hideDefaultLauncher: true`
hides Intercom's button, for an app that opens the Messenger from its own
(`window.Intercom('show')`).

**3. Send the page with the Messenger's policy.** `htmlResponse`'s Content-Security-Policy allows
only the app's own origin. `intercomCsp()` adds Intercom's published allowlist: the widget's
scripts, its API and realtime hosts, its frames, fonts, media and images. Inline script still
doesn't run.

```ts
this.get('/', { root: true, auth: false }, async (ctx) => htmlResponse(await homePage(ctx), { csp: intercomCsp() }));
```

**Consent.** The Messenger sets cookies (`intercom-id-*`, `intercom-session-*`,
`intercom-device-id-*`). Render `widgetSnippet` only once the visitor has agreed to them, through
the app's own consent banner; until then, leave it out of the page.

**Sign-out.** The Messenger keeps the user's session in a cookie for a week. Call
`window.Intercom('shutdown')` when the user signs out, in the sign-out button's script, so the
next person on that browser doesn't see their conversations:

```js
// public/sign-out.js
document.querySelector('[data-sign-out]')?.addEventListener('submit', () => window.Intercom?.('shutdown'));
```

## Webhooks

Intercom signs each notification with the app's client secret: `X-Hub-Signature` is `sha1=` and
the hex HMAC-SHA1 of the raw body. Subscribe to topics in the Developer Hub (your app › Configure ›
Webhooks); `ping` is always subscribed.

```ts
import { WebhookController } from '@mariachi/webhooks';
import { Conversation, IntercomWebhookBody, intercomEventType, intercomWebhookAuth } from '@mariachi/integration-intercom';

export class IntercomWebhooks extends WebhookController {
  readonly prefix = 'intercom';
  readonly auth = intercomWebhookAuth(config.intercom.clientSecret);
  init() {
    this.post('notifications', { mode: 'queue', jobName: 'intercom-notification', eventType: intercomEventType },
      async (_ctx, body) => IntercomWebhookBody.parse(body));
  }
}

// The job
if (payload.topic === 'conversation.user.created') {
  const conversation = Conversation.parse(payload.data.item);
  const userId = conversation.contacts?.contacts[0]?.external_id;   // the app's id for the user
}
```

Intercom retries a notification it got no 200 for within five seconds, with the same `id` and a
new `delivery_attempts`; the authenticator deduplicates on that `id` (give the `WebhookServer` an
`idempotency` store). Intercom doesn't keep notifications in order: compare `created_at`.

Intercom checks the endpoint with a `HEAD` request when its address is saved. `WebhookServer`
answers 404 to `HEAD`, so answer it in front of the webhook server (a proxy or load balancer rule)
until it does.

## Test

```ts
import { fakeIntercom, intercomContact, intercomConversation, intercomNotification, signedIntercomWebhook } from '@mariachi/integration-intercom/testing';

const intercom = fakeIntercom({ contacts: [intercomContact({ external_id: user.id })] });
await code.under.test(intercom);
expect(intercom.events_.map((e) => e.name)).toEqual(['invited-teammate']);

const { rawBody, headers } = signedIntercomWebhook(intercomNotification('conversation.user.created', intercomConversation()), clientSecret);
```
