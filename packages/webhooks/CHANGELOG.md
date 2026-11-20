# @mariachi/webhooks

## 0.2.0

### Patch Changes

- Updated dependencies [fb0b344]
- Updated dependencies [d957338]
- Updated dependencies [1613fb7]
  - @mariachi/core@0.2.0
  - @mariachi/observability@0.2.0
  - @mariachi/jobs@0.2.0
  - @mariachi/communication@0.2.0
  - @mariachi/database@0.2.0
  - @mariachi/server@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [df09ec1]
- Updated dependencies [f04e223]
- Updated dependencies [a76affd]
- Updated dependencies [0964659]
- Updated dependencies [8486aa5]
- Updated dependencies [867c6ca]
- Updated dependencies [aea145a]
  - @mariachi/jobs@0.1.1
  - @mariachi/core@0.1.1
  - @mariachi/server@0.1.1
  - @mariachi/communication@0.1.1
  - @mariachi/database@0.1.1
  - @mariachi/observability@0.1.1

## 0.1.0

### Minor Changes

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

- 690e674: `SignatureAuthController`, the base class for a signature scheme the ready-made authenticators don't
  cover, now keeps two rules by construction instead of leaving them to each subclass.
  - Dedup uses signed material only. The `eventIdHeader` option is gone: a delivery-id header the
    signature doesn't cover could be changed by whoever replays a captured delivery. The default key
    is a digest of the raw body; override `dedupKey` to return an id the signature covers.
  - A tenant is authenticated. `resolveTenant(req)` is gone. Implement `tenantFromPayload(payload)`
    to read it from the verified body, or `tenantFromRequest(req)` together with
    `tenantSigningSecrets(tenantId)` so that the delivery must verify under that tenant's own secret. A tenant
    from the request with only a shared secret fails with `webhooks/unauthenticated-tenant`.

  Breaking for subclasses: `verifySignature(signature, rawBody, secret, req)` is given one candidate
  secret (from `signingSecrets()` or `tenantSigningSecrets()`, each of which may return several during a rotation) in
  place of `(signature, rawBody, ctx, req)`, and `eventIdHeader` and `resolveTenant` no longer exist. A
  subclass that verified against a field of its own now returns that field from `signingSecrets()`.
  Dedup, which was off unless `eventIdHeader` was set, is now on for every subclass.

- b65120a: Ready-made signature checks, so a webhook endpoint no longer starts with a hand-written HMAC class:
  - `GitHubWebhookAuth` (`X-Hub-Signature-256`),
  - `StripeWebhookAuth` (the `t=…,v1=…` scheme; deduplicated on the body's `id`, which a header-only
    check couldn't do),
  - `StandardWebhookAuth` (Standard Webhooks and Svix: Clerk, Resend and others),
  - `HmacWebhookAuth` (one HMAC header: any algorithm, hex or base64, an optional prefix).

  Each verifies the exact bytes received, compares in constant time, refuses a timestamp more than
  five minutes off where the scheme signs one, accepts several signatures and several secrets (for a
  rotation), and fails at construction when no secret is configured.

  Dedup only uses signed material: an id the signature covers (Stripe's body `id`, `webhook-id`), or a
  digest of the signature where the sender signs only the body (GitHub, plain HMAC), so a captured
  delivery resent under a new delivery-id header is still a duplicate. A tenant is authenticated too:
  `tenantFromPayload` reads it from the signed body, and `tenantFromRequest` (a path parameter) is
  only accepted with a per-tenant `secret` function, so a delivery counts for a tenant only if that
  tenant's secret signed it.

  The checks are also plain functions in the new dependency-free `@mariachi/webhooks/verify` subpath
  (`verifyGitHubWebhook`, `verifyStripeWebhook`, `verifyStandardWebhook`, `verifyHmacSignature`, plus
  `signStandardWebhook` and `signStripeWebhook` for tests and senders), throwing
  `webhooks/invalid-signature`.

### Patch Changes

- 4d6e1e2: Webhook verifiers: a Stripe-style delivery whose signed body has no `id` is deduplicated on a
  digest of the signature that matched (it had no dedup key at all, leaving only the timestamp
  tolerance against a replay); and the Stripe-style and Standard Webhooks checks compute the MAC over
  the timestamp exactly as sent, so a sender that writes it with a leading zero is no longer refused.
- Updated dependencies [2fd4011]
- Updated dependencies [bb7f53a]
- Updated dependencies [44879db]
- Updated dependencies [6ad742b]
- Updated dependencies [92577a6]
- Updated dependencies [47f9687]
- Updated dependencies [da7d762]
- Updated dependencies [662ccc5]
- Updated dependencies [fcdeb4e]
- Updated dependencies [b1b411b]
- Updated dependencies [ea2f8fc]
- Updated dependencies [662ccc5]
- Updated dependencies [879b40f]
  - @mariachi/core@0.1.0
  - @mariachi/observability@0.1.0
  - @mariachi/database@0.1.0
  - @mariachi/communication@0.1.0
  - @mariachi/server@0.1.0
  - @mariachi/jobs@0.1.0
