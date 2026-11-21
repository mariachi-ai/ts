# @mariachi/integration-google-analytics

Google Analytics 4 for a Mariachi app: the page tag with Consent Mode v2, events the server sends
(the Measurement Protocol), and reports read back (the Data API).

**Status: alpha.** Covered by unit tests against a scripted Google, and the tag's setup script run
in a sandbox. The contract is in [contract.json](./contract.json).

## Consent first

The tag starts with every Consent Mode v2 type **denied**: `ad_storage`, `ad_user_data`,
`ad_personalization` and `analytics_storage`. Nothing is granted until the app's consent banner
says so. While `analytics_storage` is denied, Google sets no cookies, and the tag sends only
cookieless pings (Google calls this "advanced" consent mode). For "basic" mode, where nothing
reaches Google before consent, render the tag only once the visitor has granted
`analytics_storage`.

The server's events are for visitors who consented: they need the `_ga` cookie, which exists only
after `analytics_storage` is granted. With no cookie, send nothing. Don't make up a client ID.

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `GA_MEASUREMENT_ID` | The web stream's ID, `G-…` (public) | Admin › Data streams › your web stream: Measurement ID |
| `GA_API_SECRET` | Lets the server send events (secret, optional) | Admin › Data streams › your web stream › Measurement Protocol API secrets › Create |
| `GA_PROPERTY_ID` | The property reports are read from, a number (optional) | Admin › Property settings › Property details |
| `GA_SERVICE_ACCOUNT_JSON` | A service account key file, for reports (secret, optional) | Google Cloud › IAM & Admin › Service accounts › Keys › Add key › JSON. Enable the Google Analytics Data API in that project, and add the account's email as a **Viewer** under Analytics Admin › Property access management |
| `GA_REGION` | `eu` to send server events to Google's EU endpoint (optional) | Your choice |

Google Analytics has no test mode. Use a separate property for test: its own measurement ID, API
secret and property ID. A measurement ID is only checked for its shape (`G-` and capitals and
digits), since nothing in it tells test from production.

## The page tag

`gtagSnippet({ measurementId, consent })` gives two `<script>` tags: the setup, which sets the
consent defaults and configures the stream, then Google's `gtag.js`. Mariachi pages run no inline
script, so the setup is a file this package ships (`@mariachi/integration-google-analytics/gtag.js`)
and the app serves it. The order matters: the defaults are set before `gtag.js` measures anything.

**1. Serve the setup script** with the other files pages load (in `src/app.ts`, beside the design's
files):

```ts
const packageFile = createRequire(import.meta.url).resolve;

api.withStaticFile('/assets/lib/gtag.js', packageFile('@mariachi/integration-google-analytics/gtag.js'));
```

**2. Put the tag in the layout's `<head>`**, after the stylesheets (`src/api/pages/layout.ts`):

```ts
import { gtagSnippet, type ConsentGrant } from '@mariachi/integration-google-analytics';

export interface PageOptions {
  // …
  /** What the visitor granted, from the app's consent cookie. */
  consent?: ConsentGrant;
}

export function layout(page: PageOptions): Html {
  return html`<html lang="en" data-theme="${designTheme()}" data-mode="auto">
<head>
<meta charset="utf-8">
…
${STYLESHEETS.map((href) => html`<link rel="stylesheet" href="${href}">`)}
${gtagSnippet({ measurementId: config.ga.measurementId, consent: page.consent })}
</head>
…`;
}
```

The measurement ID is checked (`G-` and capitals and digits only) before it goes in the page; any
other value fails with `google-analytics/invalid-measurement-id`.

**3. Send the page with the tag's policy.** `htmlResponse`'s Content-Security-Policy allows only
the app's own origin. `gtagCsp()` adds what Google's tag needs: `gtag.js` from
`www.googletagmanager.com`, and its hits to `*.google-analytics.com`. Nothing else changes, and
inline script still doesn't run.

```ts
this.get('/', { root: true, auth: false }, async (ctx) =>
  htmlResponse(homePage({ consent: consentFrom(ctx.request.cookies) }), { csp: gtagCsp() }));
```

That is Google's list for Analytics without Ads features. A property linked to Google Ads needs
more origins: see Google's [CSP guide](https://developers.google.com/tag-platform/security/guides/csp).

**4. The consent banner** is the app's own: markup from the design kit, and a script file in
`public/`. The setup script defines `window.gtag`, so the banner updates consent with Google's own
call, and keeps the choice in a cookie so the next page renders with it:

```js
// public/consent.js, loaded by the layout as one of the page's scripts
for (const button of document.querySelectorAll('[data-consent]')) {
  button.addEventListener('click', () => {
    const granted = button.dataset.consent === 'grant';
    window.gtag?.('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    document.cookie = `consent=${granted ? 'analytics' : 'none'}; Path=/; Max-Age=15552000; SameSite=Lax; Secure`;
  });
}
```

```ts
// The page route: what the cookie says the visitor granted
const consentFrom = (cookies: Readonly<Record<string, string>>): ConsentGrant | undefined =>
  cookies.consent === 'analytics' ? { analytics_storage: true } : undefined;
```

`consentUpdate(granted)` gives the parameters of an update with every type named
(`{ analytics_storage: 'granted', ad_storage: 'denied', … }`), and `CONSENT_TYPES` lists the four.

## Server events

```ts
import { createGoogleAnalytics, gaCookies, purchase, settings } from '@mariachi/integration-google-analytics';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const ga = createGoogleAnalytics(settingsFromEnv(settings, readEnv), { tracer, metrics });
```

An event belongs to the browser that made it, through the tag's client ID. Read it from the
request's cookies in the controller, and pass it on with the procedure's input:

```ts
const { clientId, sessionId } = gaCookies(ctx.request.cookies, config.ga.measurementId);
// From a raw header: gaCookies(request.headers.cookie, measurementId)
```

- `clientId` comes from `_ga` (`GA1.1.1234567890.1712345678` gives `1234567890.1712345678`).
- `sessionId` comes from the stream's own cookie, `_ga_<ID without G->`. Pass it to `events.send`:
  without it, Google doesn't count the events in sessions, engagement or Realtime.
- Both are missing until the visitor grants `analytics_storage`.

The cookies' format is Google's, not a documented interface. Google's documented way to read the
client ID is `gtag('get', '<measurement ID>', 'client_id', callback)` in the browser.

Then, wherever the event happens (a service, a job, a payment webhook):

```ts
await ga.events.send(ctx, {
  clientId,
  sessionId,
  userId: user.id,          // the app's own id, never an email address
  events: [purchase({ transactionId: order.id, value: 30, currency: 'USD', items: [{ itemId: 'pro', itemName: 'Pro plan', price: 30 }] })],
});
```

The recommended events an app most often sends from its server are built for you, with Google's
parameter names: `signUp({ method })`, `login({ method })`, `purchase({ transactionId, value,
currency, items, tax?, shipping?, coupon? })` and `generateLead({ value?, currency?, leadSource? })`.
Any other event is `{ name, params }`. Up to 25 go in one call.

- **Google answers 2xx for anything that arrives**, even events it drops as invalid. A resolved
  `send` means delivered, not recorded. The only check is the validation server:
  `ga.events.validate(ctx, sameInput)` sends the same request to `/debug/mp/collect` with
  Google's strictest checks, records nothing, and returns the problems (`[]` when there are none):
  `[{ fieldPath, description, validationCode: 'NAME_INVALID' }]`. Run it in a test or at setup
  for each new event. It doesn't check the API secret or the measurement ID.
- **The client checks what it can** before sending: event names (a letter first, then letters,
  digits and underscores, at most 40), Google's reserved event and parameter names, at most 25
  parameters per event. A bad event fails with `validation/invalid-input`.
- **`purchase` needs `transactionId`**: Google drops a second purchase with the same one, so a
  retried send (a redelivered payment webhook) counts once. Send it once the payment is confirmed.
- **Retries:** a send is retried after a rate limit only, never after an outage (Google may have
  recorded it).
- **The API secret** goes in the query string, as Google requires. Spans never record a URL, and
  the client logs nothing, so it never reaches a span, a log line or an error. Rotate it in the
  stream's settings now and then, as Google advises.
- `GA_REGION=eu` sends to `region1.google-analytics.com`.

## Reports

```ts
import { reportRows } from '@mariachi/integration-google-analytics';

const report = await ga.reports.run(ctx, {
  dimensions: ['pagePath'],
  metrics: ['screenPageViews', 'activeUsers'],
  dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
  orderBys: [{ metric: 'screenPageViews', desc: true }],
  limit: 10,
});
reportRows(report);   // [{ pagePath: '/pricing', screenPageViews: 1204, activeUsers: 311 }, …]

const now = await ga.reports.runRealtime(ctx, { dimensions: ['country'], metrics: ['activeUsers'] });   // the last 30 minutes
```

- Names are the Data API's: [dimensions and metrics](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema).
  Up to 9 dimensions, 10 metrics and 4 date ranges. Dates are `YYYY-MM-DD`, `today`, `yesterday`
  or `NdaysAgo`, in the property's time zone.
- `reportRows` keys each row by the names asked for: dimensions as strings, metrics as numbers.
  Page with `limit` and `offset`; `report.rowCount` is every row the query matched.
- The client signs in as the service account (a JWT signed with its key, exchanged at Google's
  token endpoint, scope `analytics.readonly`) and reuses the token until shortly before it
  expires. A refused token is fetched again on the next call.
- `google-analytics/permission-denied` (`forbidden`): the service account isn't a Viewer on the
  property. `google-analytics/quota-exhausted` (`rate-limited`): the property's Data API quota is
  spent for now.

## Test

```ts
import { fakeGoogleAnalytics, gaReport } from '@mariachi/integration-google-analytics/testing';

const ga = fakeGoogleAnalytics({ report: gaReport({ dimensions: ['pagePath'], metrics: ['screenPageViews'], rows: [['/pricing', 12]] }) });
// …run the code under test with it…
expect(ga.sent[0]!.events[0]!.name).toBe('purchase');
```

The fake checks events by the same rules as the client, keeps every send in `sent`, and answers
reports with `report` and `realtimeReport`.
