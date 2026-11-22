# @mariachi/auth-firebase

Firebase Authentication as the app's identity provider. `createFirebaseAuth` verifies the ID
tokens the browser's Firebase SDK gives, against Google's published keys, as Firebase documents for
a third-party JWT library. `createFirebaseIdentityClient` is the auth port's `IdentityClient` on
Firebase's REST APIs, for the app's own sign-in pages and user management. No Admin SDK: the
service account's requests are signed with `jose`.

**Status: alpha.** Covered by unit tests against a scripted Firebase. The contract is in
[contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `FIREBASE_API_KEY` | The web API key (public: Firebase says it's OK in code) | Firebase console › Settings › General › Your apps › Config: `apiKey` |
| `FIREBASE_AUTH_DOMAIN` | The browser SDK's sign-in domain (public, optional; default `<projectId>.firebaseapp.com`) | The same Config: `authDomain` |
| `FIREBASE_PROJECT_ID` | Whose tokens are accepted (public) | Settings › General: Project ID |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | The service account key file, whole (secret, optional) | Settings › Service accounts › Generate new private key |

Test and production are separate Firebase projects. Their keys look alike, so no setting is checked
per environment; a service account key from another project than `FIREBASE_PROJECT_ID` is refused.
Without the service account, tokens are verified and users sign in, but users can't be looked up,
created with a verified email, deleted or revoked.

## Use

```ts
import { createFirebaseAuth, createFirebaseIdentityClient, firebaseWebConfig, settings } from '@mariachi/auth-firebase';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const firebase = settingsFromEnv(settings, readEnv);
const auth = createFirebaseAuth(firebase, { tracer, metrics });              // an AuthProvider: bearerStrategy(auth)
const identity = createFirebaseIdentityClient(firebase, { tracer, metrics }); // an IdentityClient

// What the browser's initializeApp(config) takes: the public settings, never the service account
const webConfig = firebaseWebConfig(firebase);
```

- **Tokens:** `auth.verify(idToken)` checks RS256, a `kid` Google publishes (kept for the
  `Cache-Control` max-age, fetched again for a new `kid`), `aud` the project id, `iss`
  `https://securetoken.google.com/<projectId>`, `exp`, `iat` and `auth_time`, and a non-empty `sub`.
  `userId` is the Firebase uid; a `roles` custom claim becomes `roles`; every claim is in `claims`.
  Firebase has no organizations, so `tenantId` is empty: add one with `withPersonalTenants` or
  tenancy.
- **Revocation:** an ID token lives an hour. `createFirebaseAuth({ ...firebase, checkRevoked: true })`
  also asks Firebase, on every request, whether the user exists, is enabled and wasn't revoked
  since signing in (one call each; needs the service account). `identity.revokeSessions(ctx, uid)`
  revokes a user's sessions.
- **Sign-in:** `signInWithPassword`, `refresh`, `sendPasswordReset` / `resetPassword`, and email
  link sign-in (`startEmailCode` / `signInWithEmailCode`, with `emailLinkUrl` set to the page the
  link opens: its `oobCode` query parameter is the code) use the web API key. A user with a second
  factor comes back `pending` at `mfa`, with Firebase's `mfaPendingCredential` as `pendingToken`.
- **Emails:** Firebase sends them with its templates (`emailsSentBy: 'provider'`, the default), or
  returns the code and link for the app to send (`emailsSentBy: 'app'`, with the service account).
  With email enumeration protection (on for projects made since 2023-09-15) an unknown address is
  answered like a known one.
- **Users:** `getUser`, `findUserByEmail`, `createUser`, `deleteUser` and `setPassword` use the
  service account. Without it, `createUser` is the client SDK's self sign-up (a password, the email
  unverified). Firebase stores no id of the app's own: `externalId` is always `null`, and refused on
  create.

Every call makes one span (`firebase accounts.signInWithPassword`). The auth port's methods take no
`ctx`, so those spans carry no tenant. Errors are the port's `AuthError`s (`auth/invalid-credentials`,
`auth/invalid-grant`, `auth/rate-limited`, `auth/identity-provider`), with Firebase's code
(`EMAIL_EXISTS`) in `metadata.providerCode`. Sign-ins, sign-ups and emails are sent once; reads and
refreshes are retried when Firebase is down.

### Not done on the server

- **Google and GitHub sign-in** run in the browser through Firebase's client SDK
  (`signInWithPopup`, `signInWithRedirect`). `authorizationUrl` and `exchangeCode` fail with
  `auth/not-supported`; the browser sends the ID token the SDK gives, and `auth.verify` checks it.
- **Ending one session:** Firebase can't. `signOut` does nothing at Firebase (the app drops the
  tokens); `revokeSessions` ends them all.
- **Email verification holds:** Firebase signs in unverified users, so `pendingVerificationCode` and
  `verifyEmailAndSignIn` fail with `auth/not-supported`. Read `user.emailVerified`.

## Webhooks

None. Firebase sends no webhooks: its blocking functions (`beforeCreate`, `beforeSignIn`) are Cloud
Functions. `auth.createWebhookHandler()` fails with `auth/not-supported`.

## Test

```ts
import { fakeFirebase } from '@mariachi/auth-firebase/testing';

const firebase = await fakeFirebase({ users: [{ id: 'u1', email: 'ada@example.com', password: 'pw', emailVerified: true }] });
// firebase.auth in place of createFirebaseAuth, firebase.identity in place of the client
const token = await firebase.idToken({ id: 'u1', email: 'ada@example.com', emailVerified: true });  // the bearer token
firebase.identity.emails_;   // what Firebase would have emailed, with each code
```

`firebaseTestKeys(projectId)` gives just the signing key, its `jwks`, and a `fetch` that serves them,
for `createFirebaseAuth(config, { fetch })`.
