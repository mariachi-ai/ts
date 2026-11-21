# @mariachi/integration-typeform

Typeform's forms and responses, and its webhooks as they're submitted. Each answer is read by its
field's `ref`, so a form's wording can change without breaking the app.

**Status: alpha.** Covered by unit tests against a scripted Typeform. The contract is in
[contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `TYPEFORM_TOKEN` | A personal access token (secret) | Account › Personal tokens, with `forms:read`, `responses:read`, `webhooks:read`, `webhooks:write` |
| `TYPEFORM_WEBHOOK_SECRET` | Checks the webhooks (secret, optional) | A long random string of your own; `webhooks.put` gives it to Typeform |
| `TYPEFORM_API_BASE_URL` | Only for an EU account | `https://api.eu.typeform.com` |

Typeform has no test mode: use a separate form for test.

## Use

```ts
import { createTypeform, settings } from '@mariachi/integration-typeform';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const typeform = createTypeform(settingsFromEnv(settings, readEnv), { tracer, metrics });

// At deploy, or from an admin action: point the form's webhook at the app
await typeform.webhooks.put(ctx, { formId, tag: 'app', url: 'https://app.example.com/webhooks/typeform/responses' });

// Catch up after a gap
for await (const response of typeform.responses.all(ctx, { formId, since })) { /* ... */ }
```

Every operation takes `ctx` first and makes one span (`typeform responses.list`). A failure is a
`TypeformError` with a category: only `rate-limited` and `unavailable` are retried, and the client
already did.

## Receive responses as they're submitted

```ts
import { WebhookController } from '@mariachi/webhooks';
import { TypeformWebhookBody, answersByRef, typeformEventType, typeformWebhookAuth } from '@mariachi/integration-typeform';

export class TypeformWebhooks extends WebhookController {
  readonly prefix = 'typeform';
  readonly auth = typeformWebhookAuth(config.typeform.webhookSecret);
  init() {
    this.post('responses', { mode: 'queue', jobName: 'typeform-response', eventType: typeformEventType },
      async (_ctx, body) => TypeformWebhookBody.parse(body));
  }
}

// The job
const { form_response } = payload;
const answers = answersByRef(form_response);          // { email: 'a@b.co', plan: 'Team' }
const userId = form_response.hidden?.user_id;          // a hidden field the app put in the form's link
```

Typeform retries a failed delivery, so store responses keyed by `form_response.token`.

**Hidden fields** carry the app's own values into a response: add `user_id` as a hidden field and
link to the form as `https://form.typeform.com/to/<formId>#user_id=<id>`.

## Test

```ts
import { fakeTypeform, signedTypeformWebhook, typeformResponse } from '@mariachi/integration-typeform/testing';

const typeform = fakeTypeform({ forms: [form], responses: { [form.id]: [typeformResponse()] } });
const { rawBody, headers } = signedTypeformWebhook(form.id, typeformResponse(), secret);   // post it to the controller
```
