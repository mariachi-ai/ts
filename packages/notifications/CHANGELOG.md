# @mariachi/notifications

## 0.1.1

### Patch Changes

- Updated dependencies [f04e223]
- Updated dependencies [0964659]
- Updated dependencies [8486aa5]
- Updated dependencies [867c6ca]
  - @mariachi/core@0.1.1
  - @mariachi/database@0.1.1

## 0.1.0

### Minor Changes

- 1499837: `SmtpEmailAdapter` is a real SMTP client. It honours `email.smtpUrl` (`SMTP_URL`), which
  `createEmailAdapter` used to ignore, so SMTP always went to `127.0.0.1:1025` with no login and no
  TLS. `smtp://user:pass@host:587` requires STARTTLS when it carries credentials to a remote host,
  `smtps://` is TLS from the start, and `?tls=required|opportunistic|none` overrides, except that
  credentials for a remote host are never sent without TLS unless the URL says `?tls=none-insecure`. It now sends
  through `nodemailer`, an optional peer dependency (`pnpm add nodemailer`), which also ends the old
  client's header injection through a subject containing a line break.

  New `PostmarkEmailAdapter` and `SendGridEmailAdapter` (over `fetch`), and `createEmailAdapter`
  accepts `adapter: 'postmark'`, `'sendgrid'`, or `'custom'` with `instance`.

  `EmailMessage` gains `cc`, `bcc`, `headers` and `attachments`, sent by every built-in adapter, and
  `stream` (Postmark's `MessageStream`, per message).

  Provider failures are split by whether sending again can help: `notifications/provider-failed`
  (HTTP 408, 429, 5xx; SMTP 4xx; network errors) is retried, and the new `notifications/rejected`
  (other HTTP 4xx; SMTP 5xx) is not. Both carry `metadata.retryable`; `providerFailure` builds them
  for custom adapters. Add `notifications/rejected` to the dispatch job's `nonRetryableCodes`.

  Config: `EMAIL_API_KEY` is the key for the adapter `EMAIL_ADAPTER` names, and `email.apiUrl`
  (`EMAIL_API_URL`) holds the base URL of an HTTP email API for Postmark, SendGrid or a custom adapter.
  A key never goes to another provider: `EMAIL_API_KEY` without `EMAIL_ADAPTER` fails at startup
  (`config/email-adapter-required`) instead of being sent to the default adapter, Resend, and
  `RESEND_API_KEY` is only given to the Resend adapter.

  Breaking: `SmtpEmailConfig`'s `host` and `port` are optional and the adapter needs `nodemailer`
  installed; a provider's refusal now has the code `notifications/rejected`, from
  `DefaultNotifications.sendEmail` too (it was always `notifications/email-send-failed`); with
  `EMAIL_ADAPTER` set to anything but `resend`, `RESEND_API_KEY` is no longer read.

- 662ccc5: Finish the domain packages, verified with integration tests against Postgres, Redis, Typesense and MinIO, and contract suites shared by the real adapters and the test doubles. The Phase 6 packages move from alpha to beta.

  Breaking changes:
  - audit: `AuditQuery.find` and `findByResource` take `ctx` first; `RepositoryAuditQuery` no longer takes a context in its constructor. Reads are scoped to `ctx.tenantId`. The canonical hash form now sorts keys and includes `ipAddress` and `userAgent`, so chains written before this release don't verify.
  - notifications: `InAppNotificationStore.markRead(id, userId)` requires the recipient. `NotificationQueue.enqueue(ctx, name, data, { dedupKey })` matches `DefaultJobs.enqueue`. `DeliveryStore` keeps one row per notification and channel (`get`, `updateByExternalId`). Email template values are HTML-escaped; use `{{{name}}}` for raw HTML.
  - ai: `ai_sessions.id` and `ai_messages.session_id` are text, and `ai_messages` gains `position`. Unknown models cost 0 (with a warning) instead of `gpt-4o-mini` rates, and `costTable` merges over the defaults.
  - search: `SearchField.type` is a closed union (arrays allowed). `default_sorting_field` is only set from `SearchIndex.defaultSortingField`.
  - integrations: `IntegrationRegistry.register` throws when a listed function has no handler, or the integration is already registered.
  - rate-limit: an unknown explicit tier name throws `rate-limit/unknown-tier` instead of falling back to `default`. Fixed-window counters move to a hash (existing counters reset once).
  - core: new HTTP mappings for `rate-limit/backend-failed` (503), `rate-limit/unknown-tier` (500), `auth/unknown-role` (400), `storage/invalid-signature` (403), `search/missing-query-fields` (400), `integrations/invalid-signature` (401) and upstream AI and integration failures (502).

  Added: `DrizzleAuditLog` with a database-backed hash chain, `verifyChain`, retention and export; `DrizzleApiKeyStore`, `DrizzleRoleStore.defineRole` and DB-backed RBAC permissions; `AnthropicAdapter` (`@mariachi/ai/anthropic`) and cross-provider fallback for generate and stream; `ai.costTable`, `ai.fallbackModels` and `ai.anthropicApiKey` config; feature flag writes and tenant overrides; billing plan mirroring (`syncPlans`, `price.*` webhooks); `DefaultRateLimiting.consumeTier` and `resolveTier`; `notificationJobSchema`; `resolveTenantCredential(..., { fallbackToGlobal: false })`; `ctx.request.rawBody` in facade handlers for local signed-URL uploads.

  Fixed: concurrent auth webhook deliveries could both claim an event; API key rotation could leave a tenant without a key; notification retries multiplied between the queue and the service and duplicated deliveries; S3 `putStream` failed for streams of unknown length; Typesense index creation failed with a sort field, alias schemas were lost on restart, and reindexing leaked collections; string search filters weren't quoted; `reset` didn't clear fixed-window limits; token-bucket `retryAfterMs` reported the whole window; prompt versions sorted as strings.

- 662ccc5: Complete the domain packages: billing replay and automatic idempotency keys, notification dispatch, AI sessions with budgets and fallback, append-only audit chaining, database-backed RBAC and API key rotation, and the storage, search, rate-limit, and integration gaps.

### Patch Changes

- 402cc1a: Export `notificationTables` from `@mariachi/notifications/postgres`: the compiled Drizzle tables, so an app's drizzle-kit schema can migrate them (as `billingTables` does for billing).
- 8a56f66: Peer dependencies on `@mariachi/database`, `@mariachi/database-postgres` and `@mariachi/explorer` accept any 0.x release (`>=0.0.5 <1`) instead of one exact version. A minor release no longer forces a major one: changesets bumped every peer dependent to major, and the fixed group took every package with it.
- Updated dependencies [2fd4011]
- Updated dependencies [bb7f53a]
- Updated dependencies [44879db]
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
  - @mariachi/database@0.1.0
