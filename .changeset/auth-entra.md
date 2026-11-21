---
"@mariachi/auth-entra": minor
---

New: `@mariachi/auth-entra`, the auth port's adapter for Microsoft Entra ID and Entra External ID, built from its `contract.json`. `createEntraAuth` verifies v2.0 access tokens against the tenant's own keys (one tenant, or any with `organizations`, each checked against its `tid`); `createEntraIdentityClient` signs in with PKCE, refreshes, builds the sign-out URL, and gets, finds, creates and deletes users through Microsoft Graph with the app's own token; `entraWebhookAuth` receives Graph change notifications on users (the `clientState` checked in constant time, the validation handshake answered) and `entraAuthEvents` reads them as `user.updated` and `user.deleted`; `createEntraSubscriptions().ensureUsers` keeps the subscription alive. Every call is one `entra <operation>` span.
