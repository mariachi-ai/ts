---
'@mariachi/cli': patch
---

`mariachi doctor` suggests `docker compose up -d <service>` for an unreachable Redis only when the Compose file runs Redis, and otherwise says to add one or point `REDIS_URL` at one; `mariachi db seed` checks the host a URL without one actually reaches (its `host=` parameter, else `PGHOST`) before taking the database as local.
