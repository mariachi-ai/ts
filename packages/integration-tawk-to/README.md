# @mariachi/integration-tawk-to

Tawk.to's live chat for a Mariachi app: the widget on its pages, the signed-in user signed in to
it (Tawk.to's Secure Mode, so nobody can chat as someone else), custom events from the page, and
signed webhooks when chats start and end and tickets are created.

**Status: alpha.** Covered by unit tests, and the loader script run in a sandbox. The contract is
in [contract.json](./contract.json).

## What runs where

Tawk.to publishes no server API: the widget, signing in, contacts and events all happen in the
browser, through its [JavaScript API](https://developer.tawk.to/jsapi/). The server's part is
signing the user (`chatIdentity`) and receiving webhooks.

| | Tawk.to |
| --- | --- |
| `chatIdentity(user)` | On the server: the user's id signed with the JavaScript API key |
| `widgetSnippet({ identity })` | A `<script>` for the page: loads the widget and signs the user in |
| `upsertContact(ctx, …)` | **Not supported**: fails with `tawk-to/not-supported`. The contact is made when the widget signs the user in, with the name, email and attributes from `chatIdentity` |
| `trackEvent(ctx, …)` | **Not supported**: fails with `tawk-to/not-supported`. Call `window.tawkTo.addEvent(name, metadata)` from a script on the page |

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `TAWKTO_PROPERTY_ID` | The property (site) the widget belongs to (public) | Administration › Overview: the Property ID, below the property image |
| `TAWKTO_WIDGET_ID` | Which of its chat widgets to show (public) | Administration › Chat Widget: the Widget ID under Widget Status |
| `TAWKTO_API_KEY` | Signs the signed-in user (secret, optional) | Administration › Overview › JavaScript API: turn on **Secure Mode** and copy the key beside it |
| `TAWKTO_WEBHOOK_SECRET` | Checks the webhooks (secret, optional) | In the Administration section, under Webhooks: create one, then copy its secret key |

Tawk.to has no test mode and its IDs and keys look the same everywhere: use a separate property for
test. Each property has its own API key.

## The widget

Mariachi pages run no inline script, so the widget's loader is a file this package ships
(`@mariachi/integration-tawk-to/tawk-to.js`) and the app serves it.

**1. Serve the loader** with the other files pages load (in `src/app.ts`):

```ts
import { createRequire } from 'node:module';
import { createTawkTo, settings } from '@mariachi/integration-tawk-to';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

const packageFile = createRequire(import.meta.url).resolve;
api.withStaticFile('/assets/lib/tawk-to.js', packageFile('@mariachi/integration-tawk-to/tawk-to.js'));

// Once, at startup
const tawk = createTawkTo(settingsFromEnv(settings, readEnv));
```

**2. Sign the user, and put the widget at the end of the layout's `<body>`** (`src/api/pages/layout.ts`):

```ts
// In the page route: who is signed in, if anyone
const identity = user ? await tawk.chatIdentity({ id: user.id, email: user.email, name: user.name, createdAt: user.createdAt }) : undefined;

html`<body>
…
${tawk.widgetSnippet({ identity })}
</body>`;
```

`chatIdentity` makes `hash`, the hex HMAC-SHA256 of the user's id keyed with `TAWKTO_API_KEY`. The
loader passes it to `Tawk_API.login` with the id, name and email once the widget loads, which also
brings back the user's earlier conversations. With Secure Mode on, Tawk.to takes a name or email
only with a valid hash, so a visitor can't take another user's name or history.

- Use the app's own user id, never an email address. Only make the identity on the server; the API
  key never goes to a page.
- `company` and `createdAt` become the custom attributes `company-id`, `company-name` and
  `created-at` (ISO 8601). Tawk.to keeps at most 50 attributes, each value at most 255 characters.
- Secure Mode has to be on for the property. If it's off, or the key is wrong, the widget answers
  the login with a 401 and the loader logs `Tawk.to login failed` in the browser console.
- With no identity the visitor chats anonymously.

**3. Send the page with the widget's policy.** `htmlResponse`'s Content-Security-Policy allows only
the app's own origin. `tawkToCsp()` adds the hosts Tawk.to
[lists](https://help.tawk.to/article/why-are-images-not-showing-up-in-the-widget): its script,
styles, frames, fonts and images from `*.tawk.to` (plus `cdn.jsdelivr.net`, Google Fonts,
`tawk.link` and `s3.amazonaws.com`), and its connection, `wss://*.tawk.to`. Inline script still
doesn't run.

```ts
this.get('/', { root: true, auth: false }, async (ctx) => htmlResponse(homePage(ctx), { csp: tawkToCsp() }));
```

### Consent

The widget sets cookies and local storage (`tawk_uuid_*`, `twk_idm_key`, `TawkConnectionTime`,
`twk_token_*`; see Tawk.to's
[list](https://help.tawk.to/article/what-are-tawkto-cookies-and-what-do-they-do)). Where visitors
must consent first, render `widgetSnippet` only once they have: nothing reaches Tawk.to until the
snippet is on the page. (Tawk.to also has a consent form of its own in the widget's settings.)

## From the page's own scripts

The loader defines `window.tawkTo` for the app's scripts (files in `public/`, as every script on a
Mariachi page is):

```js
// Record a custom event on the visitor's chat: letters, digits and dashes
await window.tawkTo.addEvent('requested-quotation', { plan: 'team', seats: '12' });

// When the user signs out of the app, sign them out of the widget too
document.querySelector('[data-sign-out]')?.addEventListener('click', () => window.tawkTo.logout());

// Anything else from Tawk.to's JavaScript API, once the widget is ready
window.tawkTo.onLoad((api) => api.addTags(['trial'], () => {}));
```

`addEvent` and `logout` wait for the widget, then resolve, or reject with Tawk.to's error code
(`INVALID_EVENT_NAME`, `SESSION_EXPIRED`, …). An `onLoad` the page set on `Tawk_API` before the
loader still runs.

## Webhooks

```ts
import { WebhookController } from '@mariachi/webhooks';
import { TawkToWebhookBody, tawkToEventType, tawkToWebhookAuth } from '@mariachi/integration-tawk-to';

export class TawkToWebhooks extends WebhookController {
  readonly prefix = 'tawk-to';
  readonly auth = tawkToWebhookAuth(config.tawkTo.webhookSecret);
  init() {
    this.post('events', { mode: 'queue', jobName: 'tawk-to-event', eventType: tawkToEventType },
      async (_ctx, body) => TawkToWebhookBody.parse(body));
  }
}

// The job
switch (payload.event) {
  case 'chat:start':              /* payload.chatId, payload.message, payload.visitor */ break;
  case 'chat:end':                /* payload.chatId, payload.visitor */ break;
  case 'chat:transcript_created': /* payload.chat.messages */ break;
  case 'ticket:create':           /* payload.ticket.humanId, payload.requester */ break;
}
```

- `X-Tawk-Signature` is the hex HMAC-SHA1 of the raw body, keyed with the webhook's secret key.
  A delivery that doesn't match is answered 401.
- Tawk.to retries a delivery for up to 12 hours until it gets a 2xx within 30 seconds, so queue the
  work. Deliveries are deduplicated on the signature, which a retry repeats; `X-Hook-Event-Id`
  isn't signed, so it's only kept in `identity.metadata.deliveryId`.
- Webhook payloads carry the visitor's name and email: they're the app's data, never put them on a
  span or in a log line.

## Test

```ts
import { fakeTawkTo, signedTawkToWebhook, tawkToEvent } from '@mariachi/integration-tawk-to/testing';

const tawk = fakeTawkTo();                     // test settings; tawk.identities_ lists who it signed
const { rawBody, headers } = signedTawkToWebhook(tawkToEvent.chatStart(), secret);   // post it to the controller
```
