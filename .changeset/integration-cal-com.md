---
"@mariachi/integration-cal-com": minor
---

New: `@mariachi/integration-cal-com`, Cal.com through API v2 with an API key. The key's user, event types, free slots (`slotList` makes them one list in UTC), and bookings: create, get, list with cursor paging, cancel, reschedule, confirm and decline, each endpoint sent the `cal-api-version` it asks for (`CAL_API_VERSIONS`). Webhooks: `webhooks.create/list/delete`, `calComWebhookAuth` for `WebhookServer` (hex HMAC-SHA256 of the raw body, deduplicated on the signature), `CalComWebhookBody`, and `webhookBooking`, which reads the booking from every booking event, the flat meeting events too. `bookingPageUrl`, `calLink` and `attendeeEmails` for booking pages, the embed and matching bookings to an app's users, and a fake for tests. Built from its `contract.json`.
