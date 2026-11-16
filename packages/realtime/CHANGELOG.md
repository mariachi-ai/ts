# @mariachi/realtime

## 0.1.1

### Patch Changes

- Updated dependencies [f04e223]
- Updated dependencies [0964659]
- Updated dependencies [8486aa5]
- Updated dependencies [867c6ca]
  - @mariachi/core@0.1.1

## 0.1.0

### Minor Changes

- bb7f53a: Personal tenants, for apps whose users don't all belong to an organization. Every provider returns
  an empty tenant for such a user, and an identity with no tenant is refused, so these apps couldn't
  serve them. `withPersonalTenants(verifier, { namespace })` (`@mariachi/auth`) wraps any token
  verifier and gives a person with no tenant their own: `user.<namespace>.<userId>` (the user id
  percent-encoded). Tenant-scoped tables, billing and roles then work as for any tenant.
  `@mariachi/core` exports `personalTenantId`, `parsePersonalTenant` and `isPersonalTenant`. Off
  unless you wrap a verifier.

  It applies only to a person (`identityType: 'session'`), only when the verified identity has no
  tenant, and the namespace keeps the same user id from two issuers apart.

  Tenant ids starting with `user.` are now reserved, with or without personal tenants in use. A token
  that names one as its tenant is refused by `JWTAdapter` (which also refuses to sign one, as
  `SessionManager.create` refuses to store one), and the API facade (`tenancy/reserved-tenant`, 403),
  `createAuthMiddleware` and realtime's `handleConnect` refuse an identity that carries one without
  the mark `withPersonalTenants` puts on it: a symbol, which no token payload can hold. Breaking only
  for an app whose own tenant ids start with `user.`.

  `JWTAdapter` takes `requireTenant: false` to accept a token with no tenant (for use under
  `withPersonalTenants`); `sign` leaves the tenant claim out when it's empty.

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

- 913200e: The default channel policy matches a channel against the caller's whole tenant id and user id, in
  place of splitting the name on `:`. A tenant or user id that contains a colon is now refused by it:
  such a tenant was already denied its own channels, and a broadcast to `tenant:a:b:chat` meant for
  tenant `a:b` reached tenant `a`'s subscribers to its channel `b:chat`.

  New `tenantChannel(tenantId, ...segments)`, `userChannel(userId, ...segments)` and
  `tenantUserChannel(tenantId, userId, ...segments)` build channel names the way the policy reads
  them, and throw `realtime/invalid-channel` for an id containing a colon. Use them for the names you
  broadcast to.

  `broadcast` refuses a tenant channel when `ctx.tenantId` contains a colon, for the same reason.

  Also stricter: `tenant:<id>:` with nothing after the last colon, and `public:` with no name, are denied.

### Patch Changes

- Updated dependencies [2fd4011]
- Updated dependencies [bb7f53a]
- Updated dependencies [6ad742b]
- Updated dependencies [92577a6]
- Updated dependencies [47f9687]
- Updated dependencies [da7d762]
- Updated dependencies [662ccc5]
- Updated dependencies [fcdeb4e]
- Updated dependencies [ea2f8fc]
- Updated dependencies [662ccc5]
- Updated dependencies [879b40f]
  - @mariachi/core@0.1.0
