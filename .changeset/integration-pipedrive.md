---
"@mariachi/integration-pipedrive": minor
---

New: `@mariachi/integration-pipedrive`. Persons, organizations, deals, pipelines, stages, fields and notes (API v2, and v1 for notes and webhooks, which have no v2 endpoint), with cursor and offset paging; the three helpers every CRM integration shares (`upsertContactByEmail`, `createDeal` with a stage by id or name, `addNote`); `fieldsBody` for custom fields and `noteHtml` for plain-text notes; `pipedriveWebhookAuth`, checking the HTTP Basic credentials Pipedrive sends with its v2 webhooks, for `WebhookServer`; and a fake for tests. Built from its `contract.json`.
