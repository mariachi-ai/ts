# @mariachi/auth-oidc

## 0.2.0

### Patch Changes

- Updated dependencies [fb0b344]
  - @mariachi/core@0.2.0
  - @mariachi/auth@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [df09ec1]
- Updated dependencies [f04e223]
- Updated dependencies [0964659]
- Updated dependencies [8486aa5]
- Updated dependencies [867c6ca]
  - @mariachi/auth@0.1.1
  - @mariachi/core@0.1.1

## 0.1.0

### Minor Changes

- c34d708: New package: `@mariachi/auth-oidc`, an `AuthProvider` for any identity provider that issues standard
  OpenID Connect tokens (Auth0, Amazon Cognito, Keycloak, Microsoft Entra ID, Okta, Firebase Auth, or
  your own). `createOidcAuth({ issuer, audience })` finds the signing keys through the issuer's
  discovery document (which must name the same issuer), verifies the signature, `iss`, `aud`, `exp` and
  `nbf` with asymmetric algorithms only, and maps `sub`, a tenant claim, role claims and scope claims
  onto `ResolvedIdentity`. Claims are configurable by name or function; `audience` is required (`null`
  only for tokens that carry none, and then `validate` is required too). Every URL involved must be
  `https://` except on the local machine; `requireTokenType` can demand a `typ` such as `at+jwt`;
  roles join the scopes only with `rolesAsScopes`.

### Patch Changes

- Updated dependencies [2fd4011]
- Updated dependencies [03f68ae]
- Updated dependencies [bb7f53a]
- Updated dependencies [b402753]
- Updated dependencies [27ab7f7]
- Updated dependencies [35dc946]
- Updated dependencies [6ad742b]
- Updated dependencies [92577a6]
- Updated dependencies [47f9687]
- Updated dependencies [da7d762]
- Updated dependencies [662ccc5]
- Updated dependencies [fcdeb4e]
- Updated dependencies [37e3d31]
- Updated dependencies [ea2f8fc]
- Updated dependencies [8a56f66]
- Updated dependencies [662ccc5]
- Updated dependencies [662ccc5]
- Updated dependencies [879b40f]
  - @mariachi/core@0.1.0
  - @mariachi/auth@0.1.0
