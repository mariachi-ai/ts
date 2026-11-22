# @mariachi/integration-hubspot

HubSpot's CRM: contacts, companies, deals and their pipelines, notes, and the associations between
them, with HubSpot's signed webhooks as records change. It has the three operations every Mariachi
CRM integration shares, so an app can move between HubSpot, Salesforce and Pipedrive without
changing its calls.

**Status: alpha.** Covered by unit tests against a scripted HubSpot. The contract is in
[contract.json](./contract.json). It calls HubSpot's CRM v3 and associations v4 APIs, which
HubSpot supports until September 2027.

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `HUBSPOT_ACCESS_TOKEN` | The app's static access token (secret) | Development › Projects › your project › the app › Distribution › Install now, then Show |
| `HUBSPOT_CLIENT_SECRET` | Checks the webhooks (secret, optional) | The app's Auth tab › Client credentials |

Make a developer-platform app with static auth (`auth.type: "static"`, `distribution: "private"`
in `app-hsmeta.json`), with read and write scopes for contacts, companies and deals. HubSpot no
longer lets you make legacy private apps. The tokens carry no prefix that tells test from live:
for test, install the same app in a developer test account (Development › Test accounts) and use
the token shown next to it under Test installs.

## Use

```ts
import { createHubSpot, settings } from '@mariachi/integration-hubspot';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const hubspot = createHubSpot(settingsFromEnv(settings, readEnv), { tracer, metrics });

const { id: contactId } = await hubspot.upsertContactByEmail(ctx, { email, firstName, lastName });
const { id: dealId } = await hubspot.createDeal(ctx, { name: 'Team plan', amount: 1200, currency: 'EUR', contactId });
await hubspot.addNote(ctx, { body: 'Asked for an annual invoice', dealId });

// HubSpot's own operations
const company = await hubspot.companies.findByDomain(ctx, { domain: 'example.com' });
const [pipeline] = await hubspot.dealPipelines.list(ctx);                 // stage ids for dealstage
await hubspot.deals.moveToStage(ctx, { id: dealId, stage: 'closedwon' });
await hubspot.associations.create(ctx, { from: { type: 'contact', id: contactId }, to: { type: 'company', id: company!.id } });
```

Every operation takes `ctx` first and makes one span (`hubspot contacts.batchUpsert`). A failure is a
`HubSpotError` with a category: only `rate-limited` and `unavailable` are retried, and the client
already did. `hubspot/already-exists` is a contact whose email is taken; `hubspot/invalid-properties`
a property HubSpot refused.

| Resource | Operations |
| --- | --- |
| `contacts` | `create`, `get`, `update`, `search`, `findByEmail`, `upsertByEmail` (up to 100) |
| `companies` | `create`, `get`, `update`, `search`, `findByDomain` |
| `deals` | `create`, `get`, `update`, `search`, `moveToStage` |
| `dealPipelines` | `list`: pipelines and their stages, in display order |
| `notes` | `create` |
| `associations` | `create` (HubSpot's default type), `list`, `delete` |

Things HubSpot does that an app gets wrong:

- **Properties are HubSpot's internal names** (`firstname`, `dealstage`, `hs_note_body`), never the
  labels, and every value comes back as a string. Numbers and booleans are sent as text; `null`
  clears a property.
- **Stages and pipelines are ids**, not labels: read them from `dealPipelines.list`.
- **Search lags writes** by a moment and is limited to five requests a second per account. To
  create or update a contact, use `upsertContactByEmail`, never search then create.
- **HubSpot takes no idempotency key.** A `create` retried after HubSpot did it (a timeout, a
  5xx) can make two records. Contacts are safe through `upsertContactByEmail`.
- **Associations are directional**: a note on a contact is `ASSOCIATION_TYPES.noteToContact`
  (202), when associating records as they're created.

## The same three in every CRM

`@mariachi/integration-hubspot`, `-salesforce` and `-pipedrive` all have these, with the same
names, inputs and results. `properties` keys are each provider's own field names.

```ts
upsertContactByEmail(ctx, { email, firstName?, lastName?, phone?, company?, properties? }): Promise<{ id: string; created: boolean }>
createDeal(ctx, { name, amount?, currency?, stage?, contactId?, companyId?, properties? }): Promise<{ id: string }>
addNote(ctx, { body, contactId?, dealId?, companyId? }): Promise<{ id: string }>
```

In HubSpot:

- `upsertContactByEmail` is one batch upsert matched by email (`contacts.batchUpsert`), so two
  racing calls make one contact. `company` is the contact's company-name text, not an association.
  A batch HubSpot did nothing with (a 207 with only `errors`) fails like an error answer, with the
  first error's category, and its span and metrics count it as a failure.
- `createDeal` sets `dealname`, `amount`, `deal_currency_code` (a currency the account has set up)
  and `dealstage`, and associates the contact and the company (as its primary company). Without a
  `stage` it reads the pipelines and uses the first stage of the first one.
- `addNote` makes a note dated now, on each record given; it needs at least one.

## Receive changes as they happen

Subscribe the app to events (`contact.creation`, `deal.propertyChange`...) in its webhooks
component, with the target URL below.

```ts
import { WebhookController } from '@mariachi/webhooks';
import { HubSpotWebhookBody, hubspotEventKey, hubspotEventType, hubspotWebhookAuth } from '@mariachi/integration-hubspot';

export class HubSpotWebhooks extends WebhookController {
  readonly prefix = 'hubspot';
  // HubSpot signs the full URL it called: give the public one when the app is behind a proxy
  readonly auth = hubspotWebhookAuth(config.hubspot.clientSecret, { publicBaseUrl: 'https://app.example.com' });
  init() {
    this.post('events', { mode: 'queue', jobName: 'hubspot-events', eventType: hubspotEventType },
      async (_ctx, body) => HubSpotWebhookBody.parse(body));
  }
}

// The job: a batch of up to 100 events, possibly out of order. runOnce and the store are @mariachi/core's
for (const event of payload.sort((a, b) => a.occurredAt - b.occurredAt)) {
  await runOnce(idempotency, `hubspot:${hubspotEventKey(event)}`, async () => {
    if (event.subscriptionType === 'deal.propertyChange' && event.propertyName === 'dealstage') { /* event.propertyValue */ }
  });
}
```

The signature is `X-HubSpot-Signature-v3`: the base64 HMAC-SHA256 of the method, the full URL,
the raw body and `X-HubSpot-Request-Timestamp`, keyed with the client secret. Deliveries more than
five minutes old are refused. Without `publicBaseUrl` the URL is rebuilt from the `Host` header
over https.

HubSpot retries a delivery that fails or takes over five seconds, up to ten times over 24 hours,
so queue it and answer at once. A retried batch deduplicates in `WebhookServer` (its key leaves
out the attempt number). An event can also come again in another batch, and HubSpot says an
`eventId` alone isn't unique: store what each event did under `hubspotEventKey(event)`.

## Test

```ts
import { fakeHubSpot, hubspotEvent, signedHubSpotWebhook } from '@mariachi/integration-hubspot/testing';

const hubspot = fakeHubSpot();                                    // in memory, the client's shape
await hubspot.upsertContactByEmail(ctx, { email: 'ada@example.com' });
hubspot.records_.contacts;                                        // what the code under test wrote

const { rawBody, headers } = signedHubSpotWebhook('https://app.example.com/hubspot/events', [hubspotEvent()], secret);
```
