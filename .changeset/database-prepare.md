---
"@mariachi/database": minor
"@mariachi/database-postgres": minor
---

`prepare: false` in the database config turns named prepared statements off, for a pooler in transaction mode that doesn't keep them (Supabase's shared pooler on port 6543, PgBouncer before 1.21). On by default, as before.
