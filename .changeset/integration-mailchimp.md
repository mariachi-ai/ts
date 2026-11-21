---
"@mariachi/integration-mailchimp": minor
---

New: `@mariachi/integration-mailchimp`, Mailchimp's Marketing API for an app's newsletter audience (not transactional email). `subscribe` with double opt-in by default, the member operations (upsert, get, update, unsubscribe, archive, permanent delete, tags, batch), merge fields and webhooks, all by email through `subscriberHash`, with the data center read from the API key. `mailchimpWebhookAuth` checks `X-Mailchimp-Signature` and answers Mailchimp's GET check of the URL, `MailchimpWebhookBody` reads the form-encoded events, and a fake is included for tests. Built from its `contract.json`.
