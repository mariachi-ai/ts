---
'@mariachi/testing': minor
'@mariachi/search': minor
---

The test doubles now behave like what they stand in for, and shared contract suites hold them to it.

`TestRepository` with a `tenantColumn` is tenant-scoped the way the Postgres repository is. Before,
an operation whose context had no tenant ran across every tenant's rows, so a service that forgot the
tenant passed its tests and failed in production. Now it throws `database/tenant-required`, a row
written for another tenant is `database/tenant-mismatch`, an update can't change a row's id or
tenant, soft-deleted rows are hidden from updates, deleting a missing row throws `not-found`, and
`crossTenant()` is the way across. The filter operators `in`, `notIn`, `like`, `ilike`, `isNull`
and `isNotNull` were treated as "match everything"; they now work as in SQL, `null` means
`IS NULL`, and an unknown operator throws. A new `repositoryContract` runs against the double and
against `DrizzleRepository` on Postgres.

`TestJobQueue` implements `JobScheduler`, so `new DefaultJobs({ queue: new TestJobQueue() })`
type-checks and `jobs.schedule()` works: `getSchedules()` lists them and `runSchedule(name)`
enqueues one as its cron tick would.

The memory search adapter (and `TestSearchClient`) applies `sort` (`field:asc`, `field:desc`,
comma-separated) and returns `facetCounts` over everything that matched; before, both were ignored.
The search contract checks this against Typesense too.

**Changed:** a test that used `TestRepository` with a `tenantColumn` and a context without
`tenantId` now fails with `database/tenant-required`. Give the context a tenant, or use
`crossTenant()` where reading across tenants is the intent.
