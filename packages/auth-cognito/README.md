# @mariachi/auth-cognito

An Amazon Cognito user pool as the app's identity provider: `createCognitoAuth` verifies the ID
and access tokens the pool issues, and `createCognitoIdentityClient` signs users in (managed login
or the app's own password page) and manages them through the admin API.

**Status: alpha.** Covered by unit tests against a scripted Cognito, with no user pool. The
contract is in [contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `COGNITO_REGION` | The pool's AWS Region, such as `us-east-1` | The first part of the user pool ID |
| `COGNITO_USER_POOL_ID` | The user pool, such as `us-east-1_EXAMPLE` | Cognito console › User pools › the pool › Overview |
| `COGNITO_CLIENT_ID` | The app client users sign in through | The pool › App clients |
| `COGNITO_CLIENT_SECRET` | Only for an app client with a secret (secret, optional) | The pool › App clients › the client › Show client secret |
| `COGNITO_DOMAIN` | The managed login domain (optional) | The pool › Branding › Domain: `example.auth.us-east-1.amazoncognito.com` or your own |
| `COGNITO_AWS_ACCESS_KEY_ID`, `COGNITO_AWS_SECRET_ACCESS_KEY` | AWS keys for the admin calls (optional) | IAM › access keys; leave both unset to use the AWS SDK's default credential chain (an IAM role, `AWS_PROFILE`) |

Cognito has no test mode and its IDs carry no prefix: use a separate user pool (and app client)
for test.

**The pool and app client**, as this package expects them:

- users sign in with their email (email as the pool's username attribute);
- for `signInWithPassword`, the app client allows `ALLOW_USER_PASSWORD_AUTH`;
- for managed login, the pool has a domain, and the app client the authorization code grant, the
  `openid`, `email` and `profile` scopes, the app's callback URL and its sign-out URL;
- for the user calls, the credentials may call `cognito-idp:AdminGetUser`, `ListUsers`,
  `AdminCreateUser`, `AdminSetUserPassword` and `AdminDeleteUser` on the pool.

## Use

```ts
// src/app.ts: once, with the container's tracer and metrics
import { type CognitoConfig, createCognitoAuth, createCognitoIdentityClient, settings } from '@mariachi/auth-cognito';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

const cognito = settingsFromEnv<CognitoConfig>(settings, readEnv);
const auth = createCognitoAuth(cognito, { tracer, metrics });                  // an AuthProvider
const identity = createCognitoIdentityClient(cognito, { tracer, metrics });   // an IdentityClient
```

**Checking tokens.** `auth.verify(token)` checks the RS256 signature against the pool's keys
(fetched from `https://cognito-idp.<region>.amazonaws.com/<poolId>/.well-known/jwks.json` and
cached), the issuer, the expiry, `token_use`, and the app client: `client_id` on an access token,
`aud` on an ID token. It accepts access tokens by default; pass `tokenUse: 'id'` to accept ID
tokens instead. `sub` is the user's id, `cognito:groups` their roles, the access token's `scope`
their scopes, and `tenantClaim` names a claim for the tenant (Cognito has no organizations; a pre
token generation trigger can add one). A token revoked at Cognito still verifies until it expires,
so keep access tokens short-lived.

**Signing in.** The same `IdentityClient` as every provider
([auth-and-providers.md](../core/docs/auth-and-providers.md#headless-sign-in-identityclient)):

```ts
const result = await identity.signInWithPassword({ email, password, ipAddress });
// 'signed-in', or 'pending' with reason 'email-verification' (sign-up not confirmed) or 'mfa'
// (pendingToken is Cognito's Session; providerData.challengeName says which factor)

const url = identity.authorizationUrl({ provider: 'google', redirectUri, state, codeChallenge });
const signedIn = await identity.exchangeCode({ code, codeVerifier, redirectUri });
const tokens = await identity.refresh(refreshToken);       // the same refresh token unless the client rotates them
await identity.signOut({ refreshToken });                   // revokes it, and the access tokens issued with it
reply.redirect(identity.logoutUrl({ logoutUri }));          // ends the managed login session in the browser
```

- `google` is Cognito's `Google` provider. GitHub isn't a Cognito social provider: add it to the
  pool as an OIDC provider and name it, `identityProviders: { github: 'GitHub' }`.
- Tokens carry the ID token too (`tokens.idToken`). The user comes from it: `emailVerified` is
  Cognito's `email_verified`.
- Users are identified by `sub`. `createUser` makes one with the email as its username and without
  Cognito's invitation email; with a password, it's set permanent. `externalIdAttribute`
  (`custom:external_id`) keeps the app's own id.
- With a client secret, password sign-in sends `SECRET_HASH` (`cognitoSecretHash`) and the token
  endpoints get it as Basic auth.
- Errors are the port's `AuthError`s (`auth/invalid-credentials`, `auth/invalid-grant`,
  `auth/rate-limited`, `auth/identity-provider`), with Cognito's code in `metadata.providerCode`.
- Not offered, and failing with `auth/not-supported`: password resets and email codes
  (`sendPasswordReset`, `resetPassword`, `startEmailCode`, `signInWithEmailCode`,
  `pendingVerificationCode`, `verifyEmailAndSignIn`), and challenges other than a second factor
  (`NEW_PASSWORD_REQUIRED`). Cognito runs these itself in managed login.

Every call to Cognito makes one span (`cognito auth.initiate`, `cognito users.get`, `cognito
jwks.get`) through `callProvider`. The admin calls are signed with AWS SigV4 by
`@aws-sdk/client-cognito-identity-provider`, an optional peer: install it to use them.

## Webhooks

Cognito sends none: it runs Lambda triggers (pre sign-up, post confirmation, pre token generation)
instead, so this package has no webhook handler. To hear about sign-ups in the app, have a trigger
call an endpoint of the app's own, signed with `@mariachi/webhooks`.

## Test

```ts
import { cognitoTestIssuer, fakeCognitoIdentityClient } from '@mariachi/auth-cognito/testing';

const issuer = await cognitoTestIssuer({ region, userPoolId, clientId });
const auth = createCognitoAuth(cognito, { jwks: issuer.jwks });
const token = await issuer.accessToken({ sub: 'user-1', 'cognito:groups': ['admins'] });

const identity = fakeCognitoIdentityClient({ issuer, users: [{ ...user, password: 'pw' }] });
```
