---
'@mariachi/database-postgres': patch
'@mariachi/testing': patch
---

`DrizzleRepository.updateWhere` refuses an empty filter (`{}`, `[]`, or only `undefined` values) with
`database/unsafe-operation`, as `deleteWhere` does. Its check looked at the combined condition, which
always holds the tenant and soft-delete clauses, so on a tenant-scoped or soft-delete table an empty
filter updated every row in the tenant. `TestRepository` now refuses an empty filter in `updateWhere`
and `deleteWhere` too.
