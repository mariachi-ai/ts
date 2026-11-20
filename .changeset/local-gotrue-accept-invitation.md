---
'@mariachi/create': minor
'@mariachi/cli': minor
---

A new `--auth gotrue` project signs people in with nothing to sign up for. Its `docker-compose.yml`
runs GoTrue (`supabase/auth:v2.197.0`) on the project's own Postgres, in an `auth` schema, and
Mailpit (`axllent/mailpit:v1.27.11`), the mailbox every email goes to, at `http://localhost:8025`.
`AUTH_URL` in `.env.example` points at it, and sign-ups confirm their address by email.

- `mariachi init --auth gotrue` writes `.env` with an ES256 signing key made for the project
  (`GOTRUE_JWT_KEYS`, with `GOTRUE_JWT_SECRET`, and with `--orgs` an `AUTH_SERVICE_KEY` signed with
  it). `.env.example` lists them empty. The next steps no longer include `cp .env.example .env`.
- `mariachi dev` makes those keys wherever `.env` has them empty (a fresh clone), and starts the
  Compose services and waits when the local GoTrue isn't answering. `mariachi doctor` has an `auth`
  check: GoTrue's `/health` where the app reads it, with the fix to run.
- The sign-in page sends a visitor back to the page that sent them, given
  `/api/sign-in#return=/path` (a path on the same site only), after a password sign-in or an
  emailed link, even one that opens another tab.
- With `--orgs --ui`, `/invitations/accept` accepts an invitation: it keeps the token from the
  link, has the visitor sign in or sign up and come back, and accepts as them when they click
  Accept. `INVITATION_URL` defaults to it (on `APP_ORIGIN`, or on `http://localhost:<PORT>` in
  development). Invitations go to the mailbox over SMTP (`nodemailer` is now a dependency of a
  GoTrue project with `--orgs`). In a `--auth jwt` project the page says what accepting in the
  browser needs, since that project has no browser sign-in.
- `@mariachi/create` exports `fillLocalSecrets` and `LOCAL_SECRETS`.
