# Runbook

## Running an app

```bash
pnpm dev    # mariachi dev: .env from .env.example, Postgres (Docker Compose), pending migrations, then the app with reload
```

### Deploying

1. CI: `tsc --noEmit`, `mariachi validate`, `mariachi db check` (fails if a schema change has no
   migration), tests.
2. Before starting the new version, run `mariachi db migrate`. It takes an advisory lock, so concurrent
   deploy jobs don't race.
3. Health probes (under the API prefix):
   - `/health/live`: process is up; use for liveness.
   - `/health/startup`: startup hooks finished; use for the startup probe.
   - `/health/ready`: every critical resource is healthy; 503 while starting or draining.
4. Give the platform a termination grace period longer than `SHUTDOWN_TIMEOUT_MS` (default 15s). On
   SIGTERM, readiness flips to 503, transports stop, jobs drain, and connections close in reverse
   start order.

### Operating jobs and events

- Dead-lettered jobs: `jobs.listDeadLetters()`, then `jobs.retryDeadLetter(id)` after fixing the
  cause. Expose both through an admin-only procedure.
- Dead-lettered events: Redis Streams entries past `maxDeliveries` land in `<prefix>:dead-letter`;
  handler failures go to the configured `DeadLetterSink`.
- Outbox backlog: `SELECT count(*) FROM mariachi_event_outbox WHERE published_at IS NULL`. A growing
  count means the relay is down or the bus is failing (check `last_error`).

## Environment

Read by `@mariachi/config` (`buildConfigFromEnv`). Unset values fall back to defaults; invalid values
fail the boot with `ConfigError`.

| Variable | Setting | Default |
| --- | --- | --- |
| `NODE_ENV` / `ENV` | `development`, `test`, `production` | `development` |
| `SERVICE_NAME` | service name in logs, traces and prefixes | `mariachi` |
| `HOST`, `PORT`, `ADMIN_PORT`, `WEBHOOK_PORT` | bind address and ports | `0.0.0.0`, 3000, 3001, 3002 |
| `TRUST_PROXY`, `CORS_ORIGINS`, `BODY_LIMIT_BYTES`, `SHUTDOWN_TIMEOUT_MS` | HTTP server | off, none, 1 MiB, 15000 |
| `DATABASE_URL`, `DATABASE_POOL_MAX` | Postgres, and the most connections the pool opens | none, 10 |
| `DATABASE_POOL_MIN` | Not used: the driver opens connections on demand and closes idle ones. Kept so existing environments still load | 2 |
| `REDIS_URL` | Redis for cache, jobs, events, rate limits, realtime | none |
| `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_EXPIRES_IN`, `SESSION_SECRET` | auth (secrets are at least 32 chars) | none, `1h` for expiry |
| `ENCRYPTION_ADAPTER`, `ENCRYPTION_KEY`, `ENCRYPTION_KEY_VERSION` | encryption: the local key and which generation it is (its key id) | `local`, none, 1 |
| `ENCRYPTION_KMS_KEY_ID` | the KMS key that wraps data keys, for `aws-kms` or `gcp-kms` | none |
| `LOG_ADAPTER`, `LOG_LEVEL` | logging (`pino` or `console`) | `pino`, `info` |
| `LOG_PRETTY` | human-readable log lines for a terminal; needs `pino-pretty` installed. Not for production | off |
| `STORAGE_ADAPTER`, `STORAGE_BUCKET`, `STORAGE_REGION`, `STORAGE_BASE_PATH` | file storage | `local`, none, none, none |
| `STORAGE_SIGNING_SECRET`, `STORAGE_PUBLIC_BASE_URL` | the local adapter's URL-signing secret (32+ characters) and where public objects are served from | none |
| `TRACING_ADAPTER`, `OTEL_EXPORTER_OTLP_ENDPOINT` / `..._TRACES_ENDPOINT` | OpenTelemetry tracing | off |
| `METRICS_ADAPTER`, `METRICS_PREFIX`, `ERRORS_ADAPTER`, `SENTRY_DSN` | metrics and error tracking | noop |
| `EMAIL_*` (`EMAIL_ADAPTER`, `EMAIL_API_KEY`, `EMAIL_FROM`, `EMAIL_API_URL`), `RESEND_API_KEY`, `SMTP_URL`, `STRIPE_*`, `SEARCH_ADAPTER`, `TYPESENSE_*`, `AI_*`, `OPENAI_API_KEY` | domain packages | see each package |

A value that can't be read is refused at start (`config/invalid`, naming the variable): a number
that isn't one, a boolean that isn't `true`/`false` (or `1`/`0`, `yes`/`no`, `on`/`off`), or an
environment name other than the three. `ENV` decides over `NODE_ENV`, so when other tooling needs
`NODE_ENV=staging`, set `ENV=production` for the app.

**Production sets `ENV=production`** (or `NODE_ENV=production`). With neither set, the app runs as
`development` and says so once at start (a process warning, code `MARIACHI_ENV_UNSET`).

## Developing the framework

```bash
pnpm install
pnpm build                 # packages and integrations; apps/ and examples/ are excluded (stale, see ROADMAP.md)
pnpm typecheck
pnpm lint                  # biome + scripts/lint-conventions.mjs
pnpm test:unit
pnpm test:integration      # needs Docker (Testcontainers), or set DATABASE_URL / REDIS_URL / NATS_URL
pnpm docs:check            # broken links + stale package catalog
pnpm docs:catalog          # regenerate packages.md after editing package.json metadata
pnpm changeset             # describe every user-facing change; versions move together
```

Integration tests live in `*.integration.test.ts` and run one package at a time. The `create`
package's integration test scaffolds a project, typechecks it against the built packages and runs its
tests, so an API change that breaks generated code fails CI.
