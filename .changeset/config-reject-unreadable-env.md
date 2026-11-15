---
'@mariachi/config': minor
---

`loadConfig` refuses environment values it can't read instead of silently using the default.
`PORT=eighty`, `DATABASE_POOL_MAX=ten` and the other numeric variables now fail with
`config/invalid` naming the variable; before, they were dropped and the default applied.
`TRUST_PROXY` (the one boolean) accepts `true`, `1`, `yes`, `on`, `false`, `0`, `no`, `off` in any
case and fails on anything else; before, anything but `true` or `1` meant false. The value is never
echoed in the message.

**Changed:** an environment name other than `development`, `test` or `production` in `ENV` or
`NODE_ENV` is now an error. Before, `NODE_ENV=staging` ran the app as `development`, with
production safeguards off. If `NODE_ENV` has to keep such a value for other tooling, set `ENV` to
one of the three; `ENV` decides.
