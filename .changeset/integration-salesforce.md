---
"@mariachi/integration-salesforce": minor
---

New: `@mariachi/integration-salesforce`. Signs in by the OAuth client credentials flow (an External Client App's Run As user), keeps the token and renews it on 401; contacts, accounts, opportunities and leads (create, get, update, delete, upsert by external id); SOQL through the `soql` tag, which escapes every value, with paging; all-or-none composite calls; the shared CRM helpers `upsertContactByEmail`, `createDeal` and `addNote`; a shared-secret `salesforceFlowWebhookAuth` for record-triggered flows' HTTP callouts; and a fake for tests. Built from its `contract.json`.
