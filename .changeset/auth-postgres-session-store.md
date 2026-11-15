---
'@mariachi/auth': minor
---

`DrizzleSessionStore` (`@mariachi/auth/postgres`): `SessionManager` sessions kept in the `sessions`
table, so they survive a restart and work across instances. `SessionManager` only shipped an
in-memory store.

Sessions now have an absolute end. With sliding expiry (the default) every use pushed the expiry
`ttlSeconds` ahead with no limit, so a session used once a month never expired.
`maxLifetimeSeconds` (default 90 days from issue; `null` for no limit) caps the slide and is
checked on `verify`. `revoke(id, { userId, tenantId? })` only revokes that user's session and
answers `not-found` otherwise.

`SessionManager.purgeExpired(graceSeconds)` deletes sessions that expired or were revoked before the
grace period (stores may implement the new optional `deleteExpired`), and `list` leaves out expired
sessions as well as revoked ones. The in-memory store no longer extends or re-revokes a revoked
session and lists newest activity first, as the Postgres store does; one contract suite runs against
both.

`sessionsTable` gains indexes on `user_id` and `expires_at`: a project that already has the table
needs a migration for them (`mariachi db generate`, then `db migrate`).

Breaking: existing sliding sessions older than 90 days are refused unless `maxLifetimeSeconds` is
raised or set to `null`.
