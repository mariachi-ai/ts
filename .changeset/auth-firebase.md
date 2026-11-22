---
"@mariachi/auth-firebase": minor
---

New: `@mariachi/auth-firebase`, Firebase Authentication without the Admin SDK. `createFirebaseAuth` verifies ID tokens against Google's published keys (RS256, project id as audience, `auth_time` checked), optionally asking Firebase whether the user was revoked; `createFirebaseIdentityClient` is an `IdentityClient` on the Identity Toolkit REST API: password and email-link sign-in, refresh and password resets with the web API key, and user management with the service account's own signed OAuth token. Every call goes through `callProvider`. Google and GitHub sign-in stay in the browser's Firebase SDK, and Firebase sends no webhooks. `firebaseWebConfig` gives the browser its public config; `fakeFirebase` stands in for tests. Built from its `contract.json`.
