---
"@mariachi/integration-intercom": minor
---

New: `@mariachi/integration-intercom`. The Messenger for a page (`widgetSnippet`, with a loader file to serve, and `intercomCsp()`), the signed-in user signed on the server as a Messenger JWT (`chatIdentity`), `upsertContact` and `trackEvent` (the surface the live-chat packages share), Intercom's contacts, companies, data events, conversations (search, reply and close as a teammate) and notes through the REST API at version 2.18, `intercomWebhookAuth` for `WebhookServer` (`X-Hub-Signature`, deduplicated on the notification's id), and a fake for tests. Built from its `contract.json`.
