---
"@mariachi/auth-gotrue": patch
---

`goTrueVerifiedEmail` sends Supabase's `sb_secret_…` key on `apikey` only. On `Authorization` the platform reads it as a JWT and refuses the request. A JWT key (the legacy `service_role` key, or a self-hosted GoTrue's) still goes on both.
