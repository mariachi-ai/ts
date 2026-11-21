---
"@mariachi/integration-hubspot": minor
---

New: `@mariachi/integration-hubspot`. HubSpot's contacts (with upsert by email), companies, deals and their pipelines, notes, and associations, over CRM v3 and associations v4 with a static access token. It has the three operations every CRM integration shares (`upsertContactByEmail`, `createDeal`, `addNote`), `hubspotWebhookAuth` for `WebhookServer` (HubSpot's v3 signature over the public URL, with retried batches deduplicated), `hubspotEventKey`, `ASSOCIATION_TYPES`, and a fake for tests. Built from its `contract.json`.
