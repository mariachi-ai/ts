---
'@mariachi/auth': minor
---

`DrizzleSessionStore` (`@mariachi/auth/postgres`): `SessionManager` sessions kept in the `sessions`
table, so they survive a restart and work across instances. `SessionManager` only shipped an
in-memory store.

`SessionManager.purgeExpired(graceSeconds)` deletes sessions that expired or were revoked before the
grace period (stores may implement the new optional `deleteExpired`), and `list` leaves out expired
sessions as well as revoked ones. The in-memory store no longer extends or re-revokes a revoked
session and lists newest activity first, as the Postgres store does; one contract suite runs against
both.

`sessionsTable` gains indexes on `user_id` and `expires_at`: a project that already has the table
gets them from its next `mariachi db generate`.
