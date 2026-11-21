---
"@mariachi/integration-supabase": minor
---

New: `@mariachi/integration-supabase`. Edge Functions (`functions.invoke`, as the app or for a signed-in user) and Auth's admin API (`admin.users` list, get, create, invite, delete), `supabaseAuthHookAuth` for Auth Hooks through `WebhookServer`, and the config that points `database-postgres`, `auth-gotrue` and `storage` at a project (`supabaseDatabaseConfig`, `supabaseAuthConfig`, `supabaseStorageConfig`). Built from its `contract.json`, with a fake for tests and the recipe `use-supabase.md`.
