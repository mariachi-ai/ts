# @mariachi/auth-gotrue

## 0.1.0

### Minor Changes

- eff53de: `discoverIssuer: true` reads the issuer from GoTrue's `/.well-known/openid-configuration` (re-read after
  `jwksCacheMaxAgeMs`, like the JWKS) instead of assuming `url`, for an app that reaches GoTrue on an
  internal address and doesn't know its public origin (an Ensemble preview: `url: 'http://127.0.0.1:9999'`).
  It fails closed when the document can't be read or names no issuer, and can't be combined with `issuer`.
  Tests now pin the claims `verify` keeps for tenancy and roles: `org_id`, `org_role`, `app_metadata`, `act`.
- 00c7dab: New package `@mariachi/auth-gotrue`: an `AuthProvider` for GoTrue (Supabase Auth). `verify` checks access tokens
  against GoTrue's JWKS (ES256 by default, never HMAC) with issuer and audience, and maps `sub`, `session_id`, the
  org claim and `role`/`roles`/`org_role` onto `ResolvedIdentity`, keeping the whole payload in `claims`.
  `createWebhookHandler` verifies GoTrue's HTTP hooks (Standard Webhooks), fails closed, and normalizes them to
  `AUTH_EVENT_TYPES`.

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
