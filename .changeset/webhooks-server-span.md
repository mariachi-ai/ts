---
"@mariachi/webhooks": minor
---

`WebhookServer` takes a `tracer` and gives each delivery a SERVER span named `<provider> webhook`, with `mariachi.integration`, the event type when the route says how to read it (`eventType: (payload) => payload.type`), and a status that says whether the delivery was accepted. `VerifiedWebhookAuth`'s `provider` is public.
