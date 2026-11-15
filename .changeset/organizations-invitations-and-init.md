---
'@mariachi/organizations': minor
'@mariachi/auth-gotrue': minor
'@mariachi/create': minor
'@mariachi/cli': minor
'@mariachi/core': patch
---

Organizations, part three: invitation emails, and a project that starts with all of it.

- **`invitationEmail({ email, acceptUrl, appName })`** in `@mariachi/organizations` sends each
  invitation to the address it is for. Give it to `registerOrganizationProcedures` as
  `deliverInvitation` with any email adapter from `@mariachi/notifications`. The token is added to
  your accept page's address as `?token=`; `compose` writes your own message. It sends in the
  request that invites, never through a queue, so the token is stored nowhere.
- **`goTrueVerifiedEmail({ url, serviceKey })`** in `@mariachi/auth-gotrue` says whether a GoTrue
  (Supabase Auth) user's email address is verified, for `verifiedEmail`: from a top-level
  `email_verified` claim when your token hook adds one, otherwise from the user's record, and never
  from `user_metadata`, which the user can rewrite. With no way to know it says so
  (`auth/verified-email-unavailable`) instead of guessing.
- **`mariachi init --orgs`** (`createProject({ organizations: true })`) generates a project with the
  tables, the wiring in `src/organizations.ts`, the `/api/organizations` routes, the membership check
  on every request, rate limits, and end-to-end tests. It works with `--auth jwt` and `--auth
  gotrue`. Projects made without the flag are unchanged.
