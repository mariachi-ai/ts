---
'@mariachi/create': minor
---

The sign-in page that `mariachi init --auth gotrue` generates uses PKCE for emailed links. Asking
for a magic link or signing up sends GoTrue a SHA-256 challenge and keeps the verifier in the
browser; the link comes back with a one-time code in the query, and the page exchanges it
(`/token?grant_type=pkce`) for a session. A link therefore works once, and only in the browser that
asked for it, within an hour. By default the page no longer takes a session from the address bar
(the implicit flow), so a link that carries someone else's tokens signs nobody in. Links an admin
makes (invites, GoTrue's `generate_link`) can only arrive that way, so `AUTH_LINK_SESSIONS=true`
turns it on: the page then asks GoTrue whose session it is, shows that account, and takes it only
when the user clicks Continue and nobody is signed in. A failed link gets the page's own message,
never the link's text, and the page is served with `Referrer-Policy: no-referrer`. The generated project gains `src/api/pages/sign-in.test.ts`, which
runs the page's script in a small fake browser (`src/api/pages/fake-browser.ts`).
