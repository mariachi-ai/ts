---
'@mariachi/integrations': minor
---

Connections: an end user's own account at a provider. `Connections` runs the OAuth authorization-code
flow with PKCE and a signed, single-use, expiring `state`; keeps the user's tokens encrypted with
`@mariachi/encryption` in the app's database (`integrationConnectionsTable` and
`integrationAuthorizationsTable` from `@mariachi/integrations/schema`, `DrizzleConnectionStore` from
`/postgres`); refreshes an access token before it expires, one refresh at a time per connection across
processes; marks a connection `needs-reconnect` when the provider refuses its refresh token; and
revokes the grant at the provider on disconnect. It is a `CredentialResolver`, the interface a
per-user client takes as `deps.credentials`, whose `connectionId` becomes
`mariachi.integration.connection` on the call's span. `registerConnectionProcedures` and
`ConnectionsController` (`/http`) give the routes. The contract's `credentials.oauth` gains
`revokeUrl`.

A signed-in user resolves or invalidates only their own connection by id: another user's fails as
`integrations/connection-not-found`; a context with no user resolves any in its tenant. The refresh
margin is capped at half a token's lifetime (the new nullable `issued_at` column), and a token answer
with `expires_in: 0` is an unknown expiry, so a rotated refresh token in it is still stored.
