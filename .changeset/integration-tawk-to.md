---
'@mariachi/integration-tawk-to': minor
'@mariachi/integrations': minor
---

Add `@mariachi/integration-tawk-to`, Tawk.to live chat for an app's pages: `createTawkTo` signs the signed-in user for Secure Mode (`chatIdentity`, the hex HMAC-SHA256 of their id with the JavaScript API key) and renders the widget (`widgetSnippet`), whose loader ships as the static file `@mariachi/integration-tawk-to/tawk-to.js` (no inline script) and signs the user in with `Tawk_API.login`, with `window.tawkTo.addEvent`, `logout` and `onLoad` for the page's own scripts; `tawkToCsp()` adds the hosts Tawk.to lists to a page's policy. Tawk.to has no server API, so `upsertContact` and `trackEvent` fail with `tawk-to/not-supported`. Webhooks (`chat:start`, `chat:end`, `chat:transcript_created`, `ticket:create`) are checked with `tawkToWebhookAuth` (HMAC-SHA1 of the raw body in `X-Tawk-Signature`) and read with `TawkToWebhookBody`. The contract format gains the `hmac-sha1-hex` webhook signature scheme.
