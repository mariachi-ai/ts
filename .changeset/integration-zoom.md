---
"@mariachi/integration-zoom": minor
---

New: `@mariachi/integration-zoom`, Zoom for the app's own account through a Server-to-Server OAuth app (the token is fetched, kept and renewed by the client). Meetings (create, get, update, delete, list, with the host's start link kept out of every meeting and read fresh by `meetings.startUrl`), past meetings and participants, cloud recordings and transcripts with token-authenticated downloads, users, `zoomWebhookAuth` for `WebhookServer` (the `x-zm-signature` check and Zoom's endpoint validation), `transcriptFile`, and a fake for tests. Built from its `contract.json`.
