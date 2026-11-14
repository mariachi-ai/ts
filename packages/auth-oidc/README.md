# @mariachi/auth-oidc

**Status: alpha.** Token verification for any identity provider that issues standard OpenID Connect
tokens: Auth0, Amazon Cognito, Keycloak, Microsoft Entra ID, Okta, Firebase Auth, or your own. Use it
when the provider has no Mariachi package of its own.

It verifies; it doesn't sign users in. The provider's hosted page or SDK does that, and your API
receives the token.

Guide: [auth-and-providers.md](../core/docs/auth-and-providers.md)

## Usage

```ts
import { createOidcAuth } from '@mariachi/auth-oidc';
import { bearerStrategy } from '@mariachi/api-facade';

const auth = createOidcAuth({
  issuer: 'https://login.example.com/',      // exactly as in the token's `iss`, trailing slash included
  audience: 'https://api.example.com',       // your API's identifier
});

api.withAuthStrategy('session', bearerStrategy(auth));
```

On every call it checks the signature against the provider's published keys, and `iss`, `aud`, `exp`
and `nbf`. The keys are found through `<issuer>/.well-known/openid-configuration` (which must name
the same issuer), cached, and refetched when a token arrives signed by a key it hasn't seen. If the
document can't be re-read later, the keys already in hand keep being used and discovery is tried
again on the next call. Only asymmetric algorithms are accepted (`RS256` and `ES256` by default).

The issuer, `discoveryUrl`, `jwksUrl` and the document's `jwks_uri` must all be `https://`: over
plain HTTP, anyone on the path could serve their own keys. `http://` is accepted for the local
machine only (`localhost`, `127.x`, `::1`).

## What a token becomes

| `ResolvedIdentity` | From | Option |
| --- | --- | --- |
| `userId` | `sub` | `userIdClaim` |
| `tenantId` | `org_id`; empty when the token has none | `tenantClaim` |
| `roles` | `roles` | `rolesClaim` |
| `scopes` | `scope`, `scp`, `permissions` | `scopesClaim`; `rolesAsScopes: true` adds the roles |
| `sessionId` | `sid` | `sessionClaim` |
| `claims` | the whole verified payload | |

Each option takes a claim name, or a function for a claim that's nested or computed.

The tenant claim must be one only the provider sets (an organization id it adds to the token). A
claim the user can edit, such as profile or user metadata, would let them name any tenant.

Roles and scopes are kept apart by default: a route's `scopes: ['admin']` is not satisfied by a
role called `admin`. Set `rolesAsScopes: true` if your routes require roles by name, and check
`ctx.identity.roles` otherwise.

```ts
// Auth0: custom claims are namespaced; permissions come from its RBAC setting.
createOidcAuth({ issuer: 'https://acme.auth0.com/', audience: 'https://api.acme.com',
  tenantClaim: 'https://acme.com/org', rolesClaim: 'https://acme.com/roles' });

// Keycloak: realm roles are nested.
createOidcAuth({ issuer: 'https://id.acme.com/realms/app', audience: 'app-api',
  rolesClaim: (claims) => (claims.realm_access as { roles?: string[] } | undefined)?.roles });

// Microsoft Entra ID: the tenant is `tid`; `scp` and `roles` are read by default. Its `sub` differs
// per application for the same person, so `oid` is the stable user id. `oid` is only unique within
// one directory: in a multi-tenant app, always keep `tid` as the tenant alongside it.
createOidcAuth({ issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`, audience: clientId, tenantClaim: 'tid', userIdClaim: 'oid' });

// Amazon Cognito access tokens have no `aud`: say so, and check what they have instead.
createOidcAuth({
  issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
  audience: null,
  rolesClaim: 'cognito:groups',
  validate: (claims) => {
    if (claims.token_use !== 'access' || claims.client_id !== appClientId) throw new Error('not an access token for this app');
  },
});
```

## Config

| Option | Default | Notes |
| --- | --- | --- |
| `issuer` | required | Exactly the token's `iss` |
| `audience` | required | A string or list. `null` only when the provider's tokens have no `aud`; `validate` is then required |
| `tokenType` | none | `'access'`: refuse anything that doesn't show it's an access token (`typ: at+jwt` header, Cognito's `token_use: access`, or Keycloak's `typ: Bearer` claim) |
| `requireTokenType` | none | Require exactly this `typ` header, e.g. `at+jwt` |
| `authorizedParty` | none | Clients allowed to have obtained the token, checked against `azp` (or `client_id`). Set it when tokens carry several audiences |
| `userIdClaim` | `sub` | Must be an id the provider assigns and never changes. `email`, `preferred_username`, `upn`, `unique_name`, `name` and similar are refused at construction: a user who can edit that claim could become someone else. A function here must return such an immutable id too |
| `rolesAsScopes` | `false` | Also list the roles among the scopes |
| `jwksUrl` | from discovery | Skips discovery |
| `discoveryUrl` | `<issuer>/.well-known/openid-configuration` | For a document served elsewhere, such as an internal address |
| `algorithms` | `['RS256', 'ES256']` | HMAC algorithms are refused |
| `tenantClaim`, `rolesClaim`, `scopesClaim`, `sessionClaim` | see the table above | A claim name or a function |
| `validate` | none | Throw to refuse a verified token |
| `jwksCacheMaxAgeMs` | 60 000 | Keys and the discovery document |
| `jwksCooldownMs` | 5 000 | Least time between refetches caused by an unknown key id |
| `clockToleranceSeconds` | 5 | |

Errors are `AuthError`: `auth/invalid-token` (anything wrong with a token, or with discovery) and
`auth/invalid-config`. OpenID Connect defines no webhooks, so `createWebhookHandler` throws
`auth/not-supported`; verify your provider's own with `@mariachi/webhooks`.

An `id_token` and an access token are both JWTs from the same issuer. Send your API the access
token, and set `audience` to the API's identifier so an `id_token` (whose `aud` is the client id) is
refused. If your API's audience **is** the client id (some providers issue access tokens that way),
`aud` can't tell the two apart: set `tokenType: 'access'`, which refuses a token that doesn't mark
itself as an access token in one of the ways above. For a provider that marks them in no such way,
check a claim only access tokens carry in `validate`.

`validate` runs last, only on a token whose signature, issuer, audience and times already hold;
throw an `Error` with the reason to refuse it.
