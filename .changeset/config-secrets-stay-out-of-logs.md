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
- `secret(schema)` and `secretUrl(schema)` from `@mariachi/config` mark the secrets in a section
  you register, for the same treatment.
- `@mariachi/core` exports `REDACT` and `redactForOutput(value)`: an object can declare the form
  it should be shown in, and a logger asks for it. `PinoLoggerAdapter` and `ConsoleLoggerAdapter`
  do; a logger of your own should call `redactForOutput` on what it is given.

**Changed:** code that serialised the config to pass its secrets on (`JSON.stringify(config)` sent
to a child process, say) now sends `[REDACTED]`. Read the fields you need and pass those.
