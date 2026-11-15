---
'@mariachi/config': minor
'@mariachi/core': minor
'@mariachi/observability': minor
---

Logging the loaded config no longer prints its secrets.

- `logger.info({ config })`, `console.log(config.database)` and `JSON.stringify(config.auth)` show
  every secret in the built-in config as `[REDACTED]`, and a connection URL (`database.url`,
  `redis.url`, `email.smtpUrl`) with only its password hidden. Reading a field still gives the
  value: `config.auth.jwtSecret` is unchanged for code that uses it.
- A URL also hides query parameters named like a credential (`?password=`, `?sslkey=`,
  `?access_token=`), and the Sentry DSN is treated as a URL: today's form shows unchanged, the
  older `public:secret@` form has its secret hidden.
- `Secrets` and `EnvSecretsAdapter` log as `[Secrets]` and `[EnvSecretsAdapter]`. The env adapter
  holds the whole environment, so a logged `ctx.secrets` used to print all of it.
- `secret(schema)` and `secretUrl(schema)` from `@mariachi/config` mark the secrets in a section
  you register, for the same treatment; `hideContents(instance, label)` does it for a class of
  your own that holds secrets.
- `@mariachi/core` exports `REDACT` and `redactForOutput(value)`: an object can declare the form
  it should be shown in, and a logger asks for it. `PinoLoggerAdapter` and `ConsoleLoggerAdapter`
  do; a logger of your own should call `redactForOutput` on what it is given.

**Changed:** code that serialised the config to pass its secrets on (`JSON.stringify(config)` sent
to a child process, say) now sends `[REDACTED]`. Read the fields you need and pass those.
