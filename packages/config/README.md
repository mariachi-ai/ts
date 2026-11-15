# @mariachi/config

Typed, validated configuration built from environment variables and overrides, plus secrets and
feature flags. It is the only package that reads `process.env`.

**Status: beta.** Covered by unit tests and Postgres integration tests (feature flag store). The
API can change before 1.0.

Guides: [feature-flags.md](../core/docs/feature-flags.md), [conventions.md](../core/docs/conventions.md) (why only this package reads `process.env`)

## Imports

| Import | Contents |
| --- | --- |
| `@mariachi/config` | `loadConfig`, `useConfig`, sections, secrets, feature flags |
| `@mariachi/config/schema` | `featureFlagsTable` |
| `@mariachi/config/postgres` | `DrizzleFeatureFlagStore` |

## Public API

| Export | Purpose |
| --- | --- |
| `loadConfig(overrides?, options?)` / `useConfig()` | Build (once) and read the validated `AppConfig`; invalid input throws `ConfigError` with readable issues |
| `registerConfigSection` / `useConfigSection` | Typed, validated config for your own modules |
| `secret(schema)`, `secretUrl(schema)`, `REDACTED` | Mark a field in your own section as a secret, so it shows as `[REDACTED]` when logged |
| `hideContents(instance, label)` | For a class that holds secrets (a secrets adapter of your own): an instance logs as its label |
| `createSecrets(config)`, `Secrets`, `EnvSecretsAdapter` | Secrets, optionally per tenant |
| `createFeatureFlags(config)` | `'store'` (cached, tenant overrides, rollouts) or `'static'` flags |
| `DrizzleFeatureFlagStore` | `get`, `set`, `setTenantOverride` on the `feature_flags` table |
| `evaluateFlag`, `CachedFeatureFlags`, `StoreFeatureFlagAdapter`, `StaticFeatureFlagAdapter` | Building blocks |

## Secrets in logs

Reading a secret gives its value: `config.auth.jwtSecret` is the secret. Logging, printing or
serialising the config, or any part of it, does not:

```ts
logger.info({ config }, 'starting');          // jwtSecret: "[REDACTED]", url: "postgres://app:***@db:5432/app"
console.log(config.database);                 // the same
JSON.stringify(config.billing);               // the same
```

Every key, secret and API key in the built-in config shows as `[REDACTED]`, and a URL
(`database.url`, `redis.url`, `email.smtpUrl`, `email.apiUrl`, `ai.baseUrl`, `search.url`, the Sentry DSN) keeps everything but its password
and any query parameter named like a credential (`?password=`, `?sslkey=`, `?access_token=`). The
secrets store shows as `[Secrets]`, whatever it holds. Mark the secrets
in your own sections the same way:

```ts
import { registerConfigSection, secret, secretUrl } from '@mariachi/config';

registerConfigSection('payments', {
  schema: z.object({ apiKey: secret(z.string()), callbackUrl: secretUrl(z.string().url()).optional() }),
});
```

What this doesn't cover: a copy made with spread or `structuredClone` (`{ ...config.auth }`) is a
plain object and prints in full, as does the value itself once read (`logger.info({ key:
config.ai.apiKey })`). The logger's own field-name rules (`password`, `token`, `secret`, `apiKey`,
`authorization`) still catch some of those; don't rely on them for a copied config.

A logger of your own should pass what it is given through `redactForOutput` from `@mariachi/core`
before writing it, as the built-in ones do. `JSON.stringify` and `console.log` need nothing.

## Environment

`buildConfigFromEnv` maps well-known variables onto the config: `PORT`, `DATABASE_URL`,
`REDIS_URL`, `JWT_*`, `ENCRYPTION_*`, `STORAGE_*`, `STRIPE_*`, `EMAIL_*`/`RESEND_API_KEY`/`SMTP_URL`,
`TYPESENSE_*`, `AI_*`/`OPENAI_API_KEY`/`ANTHROPIC_API_KEY`, `LOG_*`, `OTEL_*`, `SENTRY_DSN` and more.
List and JSON variables (`CORS_ORIGINS`, `AI_FALLBACK_MODELS`, `AI_COST_TABLE`) are parsed, and
invalid JSON is a `ConfigError`, not a silent default.
