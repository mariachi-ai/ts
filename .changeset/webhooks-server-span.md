---
"@mariachi/webhooks": minor
---

`WebhookServer` takes a `tracer` and gives each delivery a SERVER span named `<provider> webhook`, with `mariachi.integration`, the event type when the route says how to read it (`eventType: (payload) => payload.type`), and a status that says whether the delivery was accepted. `VerifiedWebhookAuth` is exported, with its `Secrets` and `Verified` types, for a sender with a scheme of its own; its `verify` may be async (a body checked against a provider's published keys), and its `provider` is public. An authenticator can answer a sender's endpoint check (Graph's `validationToken`, Okta's challenge) in `handshake(req, ctx)`, before `auth`.
