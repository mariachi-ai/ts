---
'@mariachi/create': minor
'@mariachi/cli': minor
---

`mariachi init --auth gotrue` (`createProject({ auth: 'gotrue' })`): a project that signs users in
with GoTrue (Supabase Auth, hosted or your own). `@mariachi/auth-gotrue` verifies its tokens
(configured from `AUTH_URL`, `AUTH_ORIGIN` or `APP_ORIGIN`, else a GoTrue on a private address with
its issuer discovered), `@mariachi/tenancy` takes the tenant from the organization claim
(`AUTH_ORG_CLAIM`, `org_id` by default), and a user whose token names no organization gets a
personal tenant (`withPersonalTenants`; `AUTH_PERSONAL_TENANTS=false` turns that off), so the
project works with a plain Supabase project and no token hook. It generates `GET /api/me`,
`GET /api/me/admin` (owners and admins, or a user in their own tenant), `MIGRATE_ON_START`, and an
example sign-in page at `/api/sign-in` (password, sign-up and magic link with plain fetch) that
reaches GoTrue at its public URL, with the publishable key hosted Supabase wants (`AUTH_ANON_KEY`),
or under the app's own origin. The default (`--auth jwt`) keeps its `src/main.ts` unchanged.

The default project's `docker-compose.yml` now creates the database that `DATABASE_URL` in
`.env.example` names (`POSTGRES_DB`); without it the first `mariachi db migrate` failed with a
missing database. The generated `AGENTS.md` no longer carries a placeholder link.
