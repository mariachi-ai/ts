---
"@mariachi/integration-calendly": minor
---

New: `@mariachi/integration-calendly`. Calendly's event types and their open times, scheduled events (list, get, cancel), invitees (list, get, and booking through the Scheduling API), no-shows, single-use scheduling links and webhook subscriptions, with a personal access token and `all` generators over Calendly's page tokens. It has `calendlyWebhookAuth` for `WebhookServer` (Calendly's `t=…,v1=…` signature with its three-minute tolerance, retries deduplicated on `calendlyEventKey`), `uuidFromUri`, `inviteeUuids`, `answersByQuestion`, `emailKey`, and a fake for tests. Built from its `contract.json`.
