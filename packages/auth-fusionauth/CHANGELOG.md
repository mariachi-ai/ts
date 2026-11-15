# @mariachi/auth-fusionauth

## 0.1.0

### Minor Changes

- 35dc946: `IdentityClient` in `@mariachi/auth`: the calls an app's own backend makes to its identity provider (password sign-in, the social sign-in redirect and code exchange, refresh, sign-out, user lookups), so an app can switch providers by configuration. New `@mariachi/auth-workos`: WorkOS AuthKit token verification (JWKS, issuer, `client_id`, or `audience` for MCP tokens), `WorkOS-Signature` webhooks, and `createWorkOSIdentityClient` on `@workos-inc/node` (an optional peer). `@mariachi/auth-fusionauth` adds `createFusionAuthIdentityClient` and `fusionAuthEmailVouched`; its existing exports are unchanged.
- 662ccc5: Harden the framework core: architecture, security, data, async, HTTP, CLI and docs.

  Breaking changes to migrate:
  - **Communication**
    - The call signature is now `communication.call(ctx, name, input)`, with `ctx` first.
    - Procedures register as `register(name, { schema: { input, output }, handler })`.
    - Duplicate names throw `communication/duplicate-procedure`.
    - Declare procedure types with `declare module '@mariachi/communication' { interface Procedures { ... } }`.
  - **Dependency injection**
    - Abstract services take an explicit `deps` or instrumentation object instead of reading the global container in their constructors.
    - Container keys are typed (`createKey<T>()`, `KEYS`).
  - **Config**
    - Importing `@mariachi/config` no longer loads `.env`. Pass `loadConfig({ dotenv: true })` or load it yourself.
    - Invalid config throws `ConfigError`.
  - **HTTP**
    - The api-facade stub auth strategies, the auth resolver and `createRouter` are removed. Use `bearerStrategy`, `apiKeyStrategy`, `serviceTokenStrategy` or `hmacSignatureStrategy`, or use `SignatureAuthController` for webhooks.
    - Controller routes declare Zod schemas and are prefixed automatically.
    - Health and OpenAPI routes live under the server prefix, for example `/api/health/ready`.
    - Errors use the JSON error envelope.
  - **Database**
    - A repository with a `tenantColumn` throws when `ctx.tenantId` is missing, unless the call goes through `crossTenant()`.
    - Database failures throw `DatabaseError`.
    - Migrations are generated from `defineTable` schemas with `mariachi db generate`.
  - **Jobs**
    - `enqueue` and `enqueueWithDedup` take `ctx` first. Job data travels in a context envelope.
    - `start()` prunes schedules that the current process didn't register.
  - **Events**
    - `traceId` and `tenantId` travel on the envelope, not in the payload.
    - For at-least-once delivery, use the Redis Streams adapter or the outbox.
  - **Encryption**
    - Ciphertexts use the new `mx1:` envelope, which records the key id and supports associated data.
    - Values written by earlier versions can't be read. Decrypt them with the old version and re-encrypt them.
  - **Tenancy**
    - The authenticated tenant is authoritative. A header that names another tenant throws `tenancy/mismatch`, which maps to HTTP 403.
  - **`@mariachi/create` and the CLI**
    - Generators target the `src/` project layout created by `mariachi init` and use the current APIs.
    - The generator API is `generateEntity`, `generateService`, `generateController`, `generateJob` and `generateIntegration`.
    - The Handlebars dependency is removed.
    - `mariachi validate` rules have new names (list them with `mariachi validate --list`).
  - **Docs**
    - The docs are consolidated in `@mariachi/core/docs`, and the `.mariachi/` copies are removed.
    - The package catalog is generated from `package.json` metadata.

- 37e3d31: `IdentityClient`: email codes (`startEmailCode`, `signInWithEmailCode`), finishing a sign-in held at email verification (`pendingVerificationCode`, `verifyEmailAndSignIn`), `resetPassword` and `setPassword`. `sendPasswordReset` now returns who sends the email: `{ deliveredBy: 'app', token, url }` (the app emails it), `'provider'`, or `'nobody'` (no such account). `@mariachi/auth-workos` gains `emailsSentBy` (`'app'` by default: WorkOS's own emails off). FusionAuth implements the codes with its passwordless API and `setPassword` with the User API; held sign-ins and app-side resets stay FusionAuth's own (`auth/not-supported`).

### Patch Changes

- 27ab7f7: An audit of the four provider packages against two rules: webhook dedup uses only signed material,
  and a tenant is authenticated.

  `@mariachi/auth-clerk`:
  - `ClerkWebhookAuth` returns the Svix id as the event id, so `WebhookServer` deduplicates Clerk
    deliveries. It put the id in `metadata` only, and nothing was deduplicated.
  - `ClerkWebhookHandler` sets `tenantId` from the signed body for organization events.
  - `verify` returns `roles` (`org_role`), `org_permissions` among the scopes, and the verified
    payload in `claims`; `clerkIdentity` exports the mapping.
  - `createClerkMiddleware` is now the framework's `createAuthMiddleware`, so the claims reach
    `ctx.jwtClaims` and tenancy's `jwt-claim` strategy. Its own copy dropped them.

  `@mariachi/auth-workos`: the webhook handler accepts several secrets during a rotation
  (`secret: string | string[]`), and checks the signature over the timestamp exactly as sent.

  `@mariachi/auth-gotrue`: hooks are checked over the timestamp exactly as sent.

  `@mariachi/auth-fusionauth`: `verify` returns the verified payload in `claims`. The `issuer` option's
  comment said it defaulted to the server URL; it isn't checked unless set, and now says so, and the
  provider warns once when built without one (through `logger` if given).

  All four providers' `verify`, and `createAuthWebhookDispatcher`, refuse a tenant in the reserved
  personal-tenant namespace (`user.`).

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
