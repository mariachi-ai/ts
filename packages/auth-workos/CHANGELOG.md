# @mariachi/auth-workos

## 0.1.0

### Minor Changes

- 35dc946: `IdentityClient` in `@mariachi/auth`: the calls an app's own backend makes to its identity provider (password sign-in, the social sign-in redirect and code exchange, refresh, sign-out, user lookups), so an app can switch providers by configuration. New `@mariachi/auth-workos`: WorkOS AuthKit token verification (JWKS, issuer, `client_id`, or `audience` for MCP tokens), `WorkOS-Signature` webhooks, and `createWorkOSIdentityClient` on `@workos-inc/node` (an optional peer). `@mariachi/auth-fusionauth` adds `createFusionAuthIdentityClient` and `fusionAuthEmailVouched`; its existing exports are unchanged.
- 37e3d31: `IdentityClient`: email codes (`startEmailCode`, `signInWithEmailCode`), finishing a sign-in held at email verification (`pendingVerificationCode`, `verifyEmailAndSignIn`), `resetPassword` and `setPassword`. `sendPasswordReset` now returns who sends the email: `{ deliveredBy: 'app', token, url }` (the app emails it), `'provider'`, or `'nobody'` (no such account). `@mariachi/auth-workos` gains `emailsSentBy` (`'app'` by default: WorkOS's own emails off). FusionAuth implements the codes with its passwordless API and `setPassword` with the User API; held sign-ins and app-side resets stay FusionAuth's own (`auth/not-supported`).

### Patch Changes

- Updated dependencies [03f68ae]
- Updated dependencies [35dc946]
- Updated dependencies [92577a6]
- Updated dependencies [da7d762]
- Updated dependencies [662ccc5]
- Updated dependencies [37e3d31]
- Updated dependencies [8a56f66]
- Updated dependencies [662ccc5]
- Updated dependencies [662ccc5]
  - @mariachi/auth@0.1.0
  - @mariachi/core@0.1.0
