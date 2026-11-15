# Todo

What is planned for Mariachi and not built yet. [`ROADMAP.md`](ROADMAP.md) says what exists today;
this file says what comes next and what is waiting.

Most of the "Later" list comes from an audit of the framework in November 2026, which asked how ready
it is for an AI agent to build an arbitrary app on it. Each item there was true when it was written.
Check the code again before starting one: some will have moved.

None of this exists in code. Don't generate code that uses it.

## Next release (0.2.0)

The goal: `mariachi init` gives a working multi-user app with nothing else to install.

1. **Organizations, parts 2 and 3.** Part 1, the `@mariachi/organizations` package, shipped in 0.1.0.
   - Part 2: the request check that makes the organization a client names (`x-organization-id`) the
     tenant, after confirming membership; procedures and an optional controller; rate limits on
     inviting and accepting; `withUserNamespace` for apps with several identity providers.
   - Part 3: invitation emails through `@mariachi/notifications`, and `mariachi init --orgs`.
2. **The generated app uses what 0.1.0 shipped.**
   - The Postgres job queue when there is no Redis, so a new app needs only Postgres.
   - `pnpm dev` runs `mariachi dev`.
   - Search on Postgres, tenant-scoped.
   - Sign-in that works in the default template. Today a fresh app answers 401 on every route unless
     it was made with `--auth gotrue`.
3. **A UI path.** `init` makes a backend only. Add a page generator and static serving, install
   `@mariachi/design`, and ship the design kits (`mariachi design add <kit>`).
4. **What an agent reads and runs.**
   - `llms.txt` and a `mariachi docs` command; listing routes, procedures and jobs from the CLI.
   - Generators for an event and its subscriber, a webhook endpoint, a procedure on an existing
     service, a page and a seed. The entity generator's fixed `name` column and naive plurals.
   - `mariachi validate` checking `ctx` first, Zod at boundaries and procedure names, not only imports.
     A `lint` script in generated projects.
5. **Small fixes.**
   - FusionAuth's three `IdentityClient` methods that throw `auth/not-supported`.
   - Cron schedules in the in-memory job queue.
   - Stale counts in `CLAUDE.md`, this repo's README and the roadmap.
   - A way to clear usage records that were never forwarded and are past the resend window.
6. **Vendor SDKs as optional peers (breaking).** ioredis, nats, bullmq, typesense, the S3 SDK, stripe,
   resend, the AI SDK providers and `@clerk/backend` install with every app today. The rule is that an
   app installs the SDKs of the adapters it uses.

## Later

### AI

- Message content beyond text: images, files, thinking, citations.
- More on the adapter port: temperature, response format, provider options. With them, structured
  output and prompt caching.
- An embeddings port and a pgvector store (needs a `vector` column type). `createRAGPipeline` only
  prepends strings today.
- An MCP client that maps MCP tools to `ToolDefinition`.
- A token count from the adapter, in place of the four-characters-a-token estimate used for a reply
  that was cut short.

### Data

- Queries beyond one table: OR, joins, aggregates, upsert, projection, row locks. Anything more is raw
  Drizzle today, which goes around the tenant and soft-delete guards.
- Column types: array, bytea, vector.
- Running without Postgres in development (SQLite or PGlite).
- A Postgres-backed event bus. A lock for the memory cache adapter (`createLock` throws for memory).
- A `TenantStore` implementation. Without one, any key is an active tenant.

### Accounts and sign-in

- `mariachi init --auth workos|clerk|fusionauth|oidc`: only `jwt` and `gotrue` have templates.
- Copying organizations and memberships from a provider that has its own (WorkOS, Clerk, a GoTrue
  hook) into the organizations tables.
- Moving a personal tenant's data into an organization. Custom role names per organization. Joining by
  email domain, single sign-on per organization, SCIM. Teams inside an organization. Billing by seat.
- In the GoTrue template: invitations by token hash (the link carries `token_hash`, the page posts to
  `/verify`), and the refresh token in an `HttpOnly` cookie.
- `IdentityOAuthProvider` is `'google' | 'github'` only. MFA and choosing an organization can't be
  finished through the interface. Provider webhook `data` is the provider's raw object. Only WorkOS and
  FusionAuth have an `IdentityClient`.

### Billing

- Move normalisation behind `BillingAdapter`: Stripe event names are switched on outside the adapter,
  `refund` branches on `pi_`, and `Plan.lookupKey`, `SubscriptionStatus`, `prorationBehavior` and
  `requireLivemode` are Stripe's.
- More than one customer or subscription per tenant.
- A second provider (Paddle or Lemon Squeezy), after the above.
- Confirm against Stripe's test mode what a repeated v1 meter event returns.

### Search

- Tenant-scoped clients on Typesense (`forTenant`), as the Postgres and memory adapters have.
- Filters beyond equality, and a `sort` that isn't Typesense's string.
- A capped count for very large result sets on Postgres.

### HTTP

- `ServerRoute.schema` is a Fastify JSON schema; anything past JSON routes needs the concrete class.

### Integrations and webhooks

- An OAuth connection store: a token set per tenant or per user, with refresh. Then GitHub and Google
  integrations.
- The integrations workspace is private, has only Slack, and has a dry-run in place of tests. Handlers
  take `(input, ctx)`, against the `ctx`-first rule. `credentialSchema` is required and unused.
- One way to receive webhooks. There are five (`WebhookServer`, the facade's signature strategy, the
  auth dispatcher, the billing handler, `defineWebhookHandler`).
- An outbound webhooks package: endpoint registry, signing, a retry job, a delivery log.

### Jobs, notifications, realtime, observability

- Jobs: status and results of a job, listing schedules, more than one queue.
- Notifications: a template body per channel (one body serves every channel today); an inbox that
  shows read items; several push tokens per user with a device-token table; Web Push (VAPID) and APNs;
  `delivered` and `bounced`, which are never set.
- Realtime: a client SDK, resuming a connection, presence per channel, a transport other than WebSocket.
- Observability: trace propagation, serving `/metrics`, a Sentry environment that isn't fixed to
  `production`.
- A product analytics adapter (PostHog).

### Config

- Sections for cache, jobs, events, realtime, rate limits and tenancy.
- Secrets from somewhere other than the environment. Per-tenant secrets are `TENANT_<ID>_<KEY>`
  environment variables today.

### Deploying

- A Dockerfile and a CI workflow in the generated project. The deploy doc is four bullets.
- pnpm is assumed everywhere. One process, one app.

### Design and explorer

- `mariachi design reference <name> [--kit <id>]`, with the component catalogs shipped in
  `@mariachi/design-kits`.
- The explorer's visual test of a package page should not depend on what the package exports.

### This repository

- The Release workflow can't open its pull request: "GitHub Actions is not permitted to create or
  approve pull requests" is a repository setting. Until it is changed, a release is made by hand.
- No `package.json` has a `repository` field.
- `apps/` and `examples/` are stale; see "Reference app" in the roadmap.
