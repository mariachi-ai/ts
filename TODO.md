# Todo

What is planned for Mariachi and not built yet. [`ROADMAP.md`](ROADMAP.md) says what exists today;
this file says what comes next and what is waiting.

Most of the "Later" list comes from an audit of the framework in November 2026, which asked how ready
it is for an AI agent to build an arbitrary app on it. Each item there was true when it was written.
Check the code again before starting one: some will have moved.

None of this exists in code. Don't generate code that uses it.

## Waiting on the maintainer

As of 2026-11-19. These need a decision or an action only the maintainer can take.

- **The next release.** Nine changes are merged and unreleased. The largest changesets are minor, so
  the release computes as 0.2.0; say the version and it is published from a maintainer's machine.
  - Vendor SDKs become optional peers: an app adds the SDKs it uses to its own dependencies.
  - Billing: settling stale usage (an app generates a migration for four new columns).
  - `bootstrap` uses an OpenTelemetry SDK that is already registered.
  - The design library's phase A, display faces in kits, and the Tally language.
  - `mariachi design reference <name>`, with the component CSS and patterns packed in
    `@mariachi/design-kits`.
  - The design packages no longer depend on `@mariachi/core` (their errors extend `Error`, not
    `MariachiError`).
  - `mariachi doctor`'s Redis hint and `db seed`'s remote-host check are fixed.
- **Pull requests to review or merge:**
  - #103, design kits refuse to publish without one clean commit. Waiting on a security review.
  - #109, the integrations plan.
- **Go on the integrations plan** ([`plans/integrations.md`](plans/integrations.md) once #109 is in).
  Nothing in it is built until then.
- **`.pnpm-store/` is tracked in git:** 20,800 files of a package manager's cache, although
  `.gitignore` lists the folder. Untracking them (`git rm -r --cached .pnpm-store`) is safe and makes
  every clone smaller.
- **Automated publishing**, when wanted: the repository and npm settings listed at the top of
  `.github/workflows/publish.yml`. Until then releases are made by hand.
- **Sandbox accounts** with each provider, for the integrations' one-off checks, when that work starts.

## Next

Not built yet; the release that carries it is decided when it is ready.

The goal: `mariachi init` gives a working multi-user app with nothing else to install.

Built for it already: organizations with a request check, invitation emails and `init --orgs`; a
generated app that needs only Postgres, starts with `pnpm dev` and has `mariachi token`; pages
(`init --ui`, `generate page`) with static files, an escaping `html` template and a design kit the
project owns; `mariachi docs` and `llms.txt`; cron schedules in the in-memory job queue; a local
GoTrue and mailbox in the `--auth gotrue` project, and its page that accepts an invitation
(`--orgs --ui`). What is left:

1. **Sign-in a person can use in a new project.**
   - A browser sign-in for the default (`--auth jwt`) project, or a decision that it has none. Its
     pages can show only public content today.
2. **Design kits in a generated project.** `init --ui` copies a kit into
   `src/design`, serves it under `/assets/design` and links its imports, and token overrides move to
   `src/design.css`. Serve `@mariachi/design/behaviors` and a kit's `motion.js` from `/assets`.
3. **What an agent reads and runs.**
   - Listing routes, procedures and jobs from the CLI.
   - Generators for an event and its subscriber, a webhook endpoint and a procedure on an existing
     service. The entity generator's fixed `name` column and naive plurals.
   - `mariachi validate` checking `ctx` first, Zod at boundaries and procedure names, not only imports.
     A `lint` script in generated projects.
   - The example entity indexed for search, as a worked example of `deps.search`.
3. **Small fixes.**
   - FusionAuth's three `IdentityClient` methods that throw `auth/not-supported` (resetting a password
     with a token, and the two halves of verifying an email with a code).
   - A rate limiter in Postgres, so a project with organizations and several processes shares its
     limits without Redis.

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

- The explorer's visual test of a package page should not depend on what the package exports.

### This repository

- The Release workflow needs repository and npm settings before it can publish (see "Waiting on the
  maintainer"). Until then a release is made by hand.
- `apps/` and `examples/` are stale; see "Reference app" in the roadmap.
