# @mariachi/integration-salesforce

A Salesforce org over its REST API: contacts, accounts, opportunities and leads, SOQL queries whose
values are always escaped, all-or-none composite calls, and the three CRM helpers every Mariachi
CRM integration has. The app signs in as one integration user, by the OAuth 2.0 client credentials
flow.

**Status: alpha.** Covered by unit tests against a scripted Salesforce. The contract is in
[contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `SALESFORCE_INSTANCE_URL` | The org's My Domain URL (public) | Setup › My Domain: `https://<name>.my.salesforce.com`. Not `login.salesforce.com` |
| `SALESFORCE_CLIENT_ID` | The External Client App's consumer key | Setup › External Client App Manager › the app › Settings › OAuth Settings |
| `SALESFORCE_CLIENT_SECRET` | Its consumer secret (secret) | Next to the consumer key |
| `SALESFORCE_API_VERSION` | Optional; default `v68.0` (Winter '27) | A version listed at `<My Domain URL>/services/data/` |
| `SALESFORCE_WEBHOOK_SECRET` | Optional (secret): checks calls from a flow | A long random string of your own (see below) |

**The app in Salesforce.** Make an External Client App (new Connected Apps can't be made from
Spring '26 on). In its OAuth settings, turn on **Enable Client Credentials Flow**; in its policies,
set **Run As** to an integration user. Everything the app does, it does as that user, with that
user's access and nothing more, so give it a permission set with just the objects and fields the
app writes. The flow gives no refresh token and no expiry: the client keeps the token it gets and
asks for a new one when a call answers 401.

**Test** against a sandbox: its own My Domain (`https://<name>--<sandbox>.sandbox.my.salesforce.com`)
and its own app's key and secret. Salesforce's keys look the same in a sandbox and in production,
so no setting is checked per environment.

## Use

```ts
import { createSalesforce, settings, soql } from '@mariachi/integration-salesforce';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const salesforce = createSalesforce(settingsFromEnv(settings, readEnv), { tracer, metrics });

await salesforce.contacts.create(ctx, { LastName: 'Lovelace', Email: email, Plan__c: 'team' });
await salesforce.accounts.upsert(ctx, { externalIdField: 'App_Org_Id__c', externalId: org.id, fields: { Name: org.name } });

for await (const c of salesforce.soql.all(ctx, soql`SELECT Id, Email FROM Contact WHERE AccountId = ${accountId}`)) { /* ... */ }
```

Every operation takes `ctx` first and makes one span (`salesforce contacts.create`). Fields are by
API name, custom ones included (`Plan__c`). A failure is a `SalesforceError`: `providerCode` is
Salesforce's `errorCode` (`DUPLICATES_DETECTED`), the code says what it means
(`salesforce/duplicates-detected`), and only `rate-limited` (`REQUEST_LIMIT_EXCEEDED`) and
`unavailable` (`UNABLE_TO_LOCK_ROW`, 5xx) are retried, which the client already did; a write (a
POST or PATCH) only after a rate limit, since an outage may come after Salesforce acted. Salesforce's
message is never kept: it can echo the record.

| Object | Operations | Create needs |
| --- | --- | --- |
| `contacts` (Contact) | `create`, `get`, `update`, `delete`, `upsert` | `LastName` |
| `accounts` (Account) | the same | `Name` |
| `opportunities` (Opportunity) | the same | `Name`, `StageName`, `CloseDate` (`YYYY-MM-DD`) |
| `leads` (Lead) | the same | `LastName`, `Company` |

- **`upsert`** writes by an External ID field (`App_User_Id__c`): it's the way to keep a record in
  step with the app's own, and the only write that's safe to retry. Salesforce takes no
  idempotency key, so a `create` retried after a timeout can make two.
- **SOQL** is written with the `soql` tag, which escapes every value it interpolates; the client
  runs nothing else, so input can't change a query. Use `soqlLike(value, { startsWith: true })`
  for a `LIKE`. `soql.query` returns one page (`nextRecordsUrl` while there are more),
  `soql.all` every record. Pass a schema (`Contact`) to type the records.
- **`composite(ctx, requests)`** runs up to 25 subrequests at once, all or none; a later one uses
  an earlier one's id as `@{<referenceId>.id}`.

### Lead or contact?

A **lead** is someone not yet qualified: a signup, a demo request, a list from an event. Sales
works it and, when it's real, converts it in Salesforce into a contact, an account and optionally
an opportunity. A **contact** is a person at an account the business already deals with. Make a
lead when sales qualifies who comes in; make a contact (`upsertContactByEmail`) for a customer's
people. Conversion isn't in the REST API (it's the SOAP API's `convertLead` and Apex), so this
client has no `leads.convert`: convert in Salesforce, or in a flow.

## The same three in every CRM

`@mariachi/integration-hubspot`, `-salesforce` and `-pipedrive` have the same three helpers, with
the same names and shapes, so an app can switch CRM without touching its calls:

```ts
const { id: contactId, created } = await salesforce.upsertContactByEmail(ctx, { email, firstName, lastName, company: 'Acme' });
const { id: dealId } = await salesforce.createDeal(ctx, { name: 'Acme, 50 seats', amount: 12000, contactId, companyId });
await salesforce.addNote(ctx, { body: 'Call recap\nThey want SSO', contactId, dealId });
```

In Salesforce:

- **`upsertContactByEmail`** finds the oldest Contact with that `Email` (a query, then a create or
  update: two calls at once for a new email can both create). A new contact's `LastName`, which
  Salesforce requires, is `lastName` or else the email's local part (`ada.lovelace`). `company` is
  an Account name: the oldest Account with that name, or a new one; it's set on a new contact, or
  on one without an account, and a contact that has an account keeps it. A contact with no account
  is private to its owner in Salesforce, so pass `company` where you can.
- **`createDeal`** makes an Opportunity. `StageName` is `stage` (the stage's API name), or else the
  org's first active open stage, read once from `OpportunityStage` and kept: its `ApiName`, or its
  `MasterLabel` where the org's `OpportunityStage` has no `ApiName` field. `CloseDate` is
  `properties.CloseDate`, or else 30 days from today (UTC): set the real one when you know it.
  `companyId` is its Account; `contactId` becomes its primary contact (an OpportunityContactRole),
  made in the same all-or-none call. `currency` sets `CurrencyIsoCode`, only for an org with
  multiple currencies.
- **`addNote`** makes a ContentNote (what Salesforce shows under Notes, rather than a Task, which is
  an activity) and links it with a ContentDocumentLink to each record given, in one all-or-none
  call. The body is plain text: it's escaped, each line is a paragraph, and the first line is the
  title. Anyone who can see a linked record can see the note.

`properties` are more fields by API name; the named arguments win over them.

## Hear about changes

Salesforce has no signed webhooks. This package takes the simplest route Salesforce has: a
**record-triggered flow** that posts to the app with an **HTTP callout**, sending a shared secret
in a header. In Salesforce, make a Named Credential for the app's URL whose External Credential
adds the custom header `X-Webhook-Secret` with the secret. Give the flow's HTTP callout action a
`SalesforceFlowEvent` as its sample body, and fill it from the record (`recordId` from its `Id`,
`changedAt` from its `LastModifiedDate`):

```json
{ "event": "contact.updated", "sobject": "Contact", "recordId": "003000000000001AAA", "changedAt": "2026-11-21T10:00:00.000Z", "fields": { "Email": "ada@example.com" } }
```

```ts
import { WebhookController } from '@mariachi/webhooks';
import { SalesforceFlowEvent, salesforceEventType, salesforceFlowWebhookAuth } from '@mariachi/integration-salesforce';

export class SalesforceWebhooks extends WebhookController {
  readonly prefix = 'salesforce';
  readonly auth = salesforceFlowWebhookAuth(config.salesforce.webhookSecret);   // two while rotating
  init() {
    this.post('records', { mode: 'queue', jobName: 'salesforce-record', eventType: salesforceEventType },
      async (_ctx, body) => SalesforceFlowEvent.parse(body));
  }
}
```

The secret is compared in constant time, but unlike a signature it doesn't cover the body: keep
the endpoint HTTPS and the secret long. Deliveries are deduplicated on a digest of the body, so
include `recordId` and `changedAt`: a repeated callout then dedupes and two changes don't. Read
the record again with `get` before acting on anything that matters.

For a stream of every change, Salesforce has Change Data Capture and Platform Events, read over
its Pub/Sub API (gRPC). That's not in this package.

## Test

```ts
import { fakeSalesforce, salesforceFlowWebhook } from '@mariachi/integration-salesforce/testing';

const salesforce = fakeSalesforce({ records: { Account: [{ Name: 'Acme' }] } });
await codeUnderTest(salesforce);
salesforce.records_.get('Contact');   // what it wrote
salesforce.notes_;                    // the notes, with what each is linked to

const { rawBody, headers } = salesforceFlowWebhook(event, secret);   // post it to the controller
```

The fake runs only simple queries (`SELECT … FROM <Object> [WHERE <Field> = <value>] [ORDER BY …]
[LIMIT n]`) and fails on anything else, so a test can't pass on a query it only pretended to run.
