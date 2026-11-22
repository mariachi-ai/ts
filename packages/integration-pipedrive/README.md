# @mariachi/integration-pipedrive

Pipedrive's persons, organizations, deals, pipelines, stages and notes, the three helpers every CRM
integration shares, and Pipedrive's webhooks, checked by their HTTP Basic credentials.

**Status: alpha.** Covered by unit tests against a scripted Pipedrive. The contract is in
[contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `PIPEDRIVE_API_TOKEN` | The API token (secret) | Settings › Personal preferences › API (`https://app.pipedrive.com/settings/api`) |
| `PIPEDRIVE_COMPANY_DOMAIN` | The company's subdomain: `acme` for `https://acme.pipedrive.com` | The address the company's Pipedrive opens at |
| `PIPEDRIVE_WEBHOOK_USER` | The webhooks' Basic auth user name (secret, optional) | Any value of your own; `webhooks.create` gives it to Pipedrive |
| `PIPEDRIVE_WEBHOOK_PASSWORD` | The webhooks' Basic auth password (secret, optional) | A long random string of your own; `webhooks.create` gives it to Pipedrive |

The token belongs to one user in one company: every call acts as that user, with their permissions
(an admin may need to enable API access for them). Use a user set up for the integration, not a
person's own. Pipedrive has no test mode: for test, use a
[developer sandbox](https://pipedrive.readme.io/docs/developer-sandbox-account) company, requested
with Pipedrive's form. Its token looks the same as a live one, so no check tells them apart.

## Use

```ts
import { createPipedrive, settings } from '@mariachi/integration-pipedrive';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const pipedrive = createPipedrive(settingsFromEnv(settings, readEnv), { tracer, metrics });

const person = await pipedrive.persons.findByEmail(ctx, 'ada@example.com');
await pipedrive.deals.update(ctx, { id: 30, status: 'won' });
for await (const deal of pipedrive.deals.all(ctx, { personId: 7 })) { /* ... */ }
```

Every operation takes `ctx` first and makes one span (`pipedrive persons.search`). A failure is a
`PipedriveError` with a category: only `rate-limited` and `unavailable` are retried, and the client
already did (a create or change only after a rate limit: see [Errors](#errors)).

| Resource | Operations | API |
| --- | --- | --- |
| `persons` | `create`, `get`, `update`, `list`, `all`, `search`, `findByEmail` | v2 |
| `organizations` | `create`, `get`, `search`, `findByName` | v2 |
| `deals` | `create`, `get`, `update`, `list`, `all` | v2 |
| `pipelines`, `stages` | `list`, `all` | v2 |
| `personFields`, `organizationFields`, `dealFields` | `list`, `all` | v2 |
| `notes` | `create`, `list`, `all` | v1: notes have no v2 endpoint |
| `webhooks` | `create`, `list`, `delete` | v1: webhooks have no v2 endpoint |

Ids are Pipedrive's numbers. Lists on v2 are paged by cursor (`nextCursor`, `null` on the last
page); notes, on v1, by offset (`nextStart`). `all` reads every page, and stops when you `break`.

### Custom fields

A value is set under its field code. Standard fields have names (`owner_id`, `visible_to`); custom
fields have a random 40-character code, which v2 takes under `custom_fields`. Pass both in `fields`
(or `properties`, in the shared helpers) and the client sorts them, by `fieldsBody`:

```ts
const codes = Object.fromEntries((await pipedrive.dealFields.list(ctx)).items.map((f) => [f.field_name, f.field_code]));
await pipedrive.deals.create(ctx, { title: 'Acme renewal', fields: { [codes.Plan!]: 'Enterprise', visible_to: 3 } });
```

Read the codes once (`dealFields.all`) and keep them in config: they don't change, a field's name can.

### Notes are HTML

A note's content is HTML, which Pipedrive sanitizes. For plain text, pass `noteHtml(text)`: it
escapes `<`, `>` and `&` and keeps line breaks.

## The same three in every CRM

The HubSpot, Salesforce and Pipedrive integrations each have these three, with the same names and
shapes, so an app can change CRM without changing its calls. Ids are strings.

```ts
const { id: contactId, created } = await pipedrive.upsertContactByEmail(ctx, {
  email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace', phone: '+44 20 7946 0000', company: 'Acme',
});
const { id: dealId } = await pipedrive.createDeal(ctx, { name: 'Acme renewal', amount: 1200, currency: 'EUR', stage: 'Proposal made', contactId });
await pipedrive.addNote(ctx, { body: noteHtml('Called, sending the proposal'), contactId, dealId });
```

In Pipedrive:

| Helper | Does |
| --- | --- |
| `upsertContactByEmail` | A contact is a **person**. Finds them by an exact search of the email field (`persons/search` with `fields=email&exact_match=true`, not case-sensitive) and changes what's given, or adds them. `company` is an **organization**, found by its exact name or added. A new person is named `firstName lastName` (or by the email address). Pipedrive keeps one name field, not a first and a last name, so an existing person's name changes only when both `firstName` and `lastName` are given; one alone leaves it as it is. (HubSpot and Salesforce keep the two apart and update whichever is given.) A new phone becomes the primary one and the others stay. Pipedrive has no unique email: two upserts of the same new address at the same moment can both add a person. |
| `createDeal` | `name` is the deal's title and `amount` its value. `stage` is a stage's id, or its name, looked up in every pipeline with `stages.list` (not case-sensitive); a name two pipelines share fails with `pipedrive/ambiguous-stage`, so pass the id. Without a stage the deal goes to the default pipeline's first stage. `contactId` is a person, `companyId` an organization. |
| `addNote` | A **note** on the person, deal and organization given (at least one). `body` is HTML. |

`properties` are field codes, as above.

## Errors

The HTTP status decides the category. Pipedrive's error body (`{ success: false, error, error_info }`)
gives no code an app would act on; `additional_data.code`, when it's there, is kept as
`providerCode`. The `error` text never is (it can echo input). Where Pipedrive documents what a
status means, the error says so:

| Status | Code | Category |
| --- | --- | --- |
| 402 | `pipedrive/account-not-open` (trial ended, no payment details) | `forbidden` |
| 415 | `pipedrive/feature-not-enabled` | `forbidden` |
| 422 from `webhooks.create` | `pipedrive/webhooks-limit` | `invalid-request` |
| 429 | `pipedrive/rate-limited`, retried | `rate-limited` |
| 501 | `pipedrive/not-implemented` | `invalid-request` |

Pipedrive's rate limits are per token, in 2-second windows and a daily budget. A 429 carries no
`Retry-After`, but its `x-ratelimit-reset` says how many seconds until the window resets, and the
client waits that long before retrying (failing at once, with `retryAfterMs` on the error, when that's
longer than `retry.maxDelayMs`). A token that keeps going after 429s gets a 403 page from Pipedrive's
CDN: slow down rather than retry.

Pipedrive takes no idempotency key, so a create or a change (a POST or PATCH) is retried only after a
rate limit, which Pipedrive refused before doing anything; after a server error or a lost connection
it fails at once, since Pipedrive may have done it. A GET, or a DELETE, is retried after either.

## Receive changes as they happen

Pipedrive's webhooks aren't signed. Instead, a webhook is made with a Basic auth user name and
password, which Pipedrive sends with every delivery; `pipedriveWebhookAuth` checks both, in constant
time, and answers anything else 401. `webhooks.create` makes a v2 webhook with them, and refuses to
without them.

```ts
// At deploy, or from an admin action: each call makes another webhook, so look first
const hooks = await pipedrive.webhooks.list(ctx);
if (!hooks.some((h) => h.subscription_url === url)) await pipedrive.webhooks.create(ctx, { url, action: '*', object: 'deal', name: 'app' });
```

```ts
import { WebhookController } from '@mariachi/webhooks';
import { PipedriveWebhookBody, pipedriveEventType, pipedriveWebhookAuth } from '@mariachi/integration-pipedrive';

export class PipedriveWebhooks extends WebhookController {
  readonly prefix = 'pipedrive';
  readonly auth = pipedriveWebhookAuth({ user: config.pipedrive.webhookUser, password: config.pipedrive.webhookPassword });
  init() {
    this.post('events', { mode: 'queue', jobName: 'pipedrive-event', eventType: pipedriveEventType },
      async (_ctx, body) => PipedriveWebhookBody.parse(body));
  }
}

// The job
const { meta, data, previous } = payload;   // meta.entity 'deal', meta.action 'change'
if (meta.entity === 'deal' && previous && 'stage_id' in previous) { /* the deal moved */ }
```

The body is `{ meta, data, previous }`. `data` is the object now (`null` on delete); `previous` is
`null` on create, the fields that changed on change, and the object as it was on delete. The event
type is `<entity>.<action>`: `person.create`, `deal.change`, `note.delete`.

A delivery that fails (not 2xx, or slower than 10 seconds) is tried three more times, after 3, 30 and
150 seconds, with `meta.attempt` counting up. Deliveries are deduplicated on `meta.id`, the event's
id. Nothing in a delivery is signed, so that id comes from the body: whoever has the Basic
credentials could send anything anyway. Pipedrive doesn't document `meta.id` as stable across
retries, so a retry may arrive with a new one: make the job safe to run twice too. After three days with no successful delivery,
Pipedrive deletes the webhook.

To move to a new password, pass both while the webhooks are remade: `password: [old, next]`.

## Test

```ts
import { fakePipedrive, pipedriveEvent, pipedriveWebhook } from '@mariachi/integration-pipedrive/testing';

const pipedrive = fakePipedrive({ stages: [{ id: 1, name: 'Qualified', pipeline_id: 1 }] });
await pipedrive.upsertContactByEmail(ctx, { email: 'ada@example.com' });   // runs the same helper code
pipedrive.persons_;                                                         // what's in it

const event = pipedriveEvent({ entity: 'deal', action: 'change', data: { id: 30, stage_id: 2 }, previous: { stage_id: 1 } });
const { rawBody, headers } = pipedriveWebhook(event, { user, password });   // post it to the controller
```
