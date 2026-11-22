---
"@mariachi/integration-google-analytics": minor
---

New: `@mariachi/integration-google-analytics`, for Google Analytics 4. `gtagSnippet` puts the Google tag in a page's `<head>` with every Consent Mode v2 type denied until the visitor grants it (a setup script the app serves, since pages run no inline script), and `gtagCsp` widens the page's policy for it. `events.send` and `events.validate` speak the Measurement Protocol with the API secret kept out of spans and errors, `gaCookies` reads the tag's client and session IDs, and `signUp`, `login`, `purchase` and `generateLead` build Google's recommended events. `reports.run` and `reports.runRealtime` read the Data API as a service account, and `reportRows` turns a report into plain objects. A fake for tests. Built from its `contract.json`.
