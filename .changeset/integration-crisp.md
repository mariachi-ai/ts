---
'@mariachi/integration-crisp': minor
---

`@mariachi/integration-crisp`: Crisp live chat, from its contract. `chatIdentity` signs the signed-in user's email for Crisp's identity verification and derives a session token only the server can, and `widgetSnippet` puts the widget in a page through a loader the package ships (`./crisp.js`), with `crispCsp` for Crisp's origins. `upsertContact` and `trackEvent` keep people profiles and their timeline, `people.*` and `conversations.*` cover profiles, data, events, and reading, answering and resolving conversations, all through `providerRequest`. `crispWebhookAuth` checks a plugin's signed web hooks (`[timestamp;body]`, HMAC-SHA256) and `crispWebsiteHookAuth` a website hook's key; a fake and signed deliveries for apps' tests.
