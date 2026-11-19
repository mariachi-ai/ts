---
'@mariachi/auth-fusionauth': minor
---

`FusionAuthIdentityClient` implements the three `IdentityClient` methods that threw
`auth/not-supported`:

- `resetPassword({ token, password })` changes the password with FusionAuth's `changePasswordId`
  (Change Password API, FusionAuth 1.33 or later) and returns the user. A used, expired or unknown
  token, or a password the tenant's rules refuse, is `auth/invalid-grant` (FusionAuth's error codes
  are in `metadata.errors`). A user with two-factor is `auth/not-supported`.
- `pendingVerificationCode(pending)` and `verifyEmailAndSignIn({ pendingToken, code })` finish a
  sign-in held at `email-verification` with a code, when the tenant's email verification strategy is
  `FormField`. The code is checked on the Verify Email API, and the user is then signed in through the
  passwordless API, so the application needs passwordless login enabled. A wrong, used or expired
  code is `auth/invalid-grant`.
- New `emailsSentBy: 'provider' | 'app'` option (default `'provider'`, as before). With `'app'`,
  `sendPasswordReset` returns `{ deliveredBy: 'app', token }` and FusionAuth sends no email, and a held
  sign-in starts a verification whose code `pendingVerificationCode` returns.

A sign-in held at `email-verification` now carries a sealed `pendingToken` (a key derived from
`clientSecret`) when FusionAuth reports a verification id.
