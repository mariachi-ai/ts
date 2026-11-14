---
'@mariachi/create': minor
---

The sign-in page that `mariachi init --auth gotrue` generates uses PKCE for emailed links. Asking
for a magic link or signing up sends GoTrue a SHA-256 challenge and keeps the verifier in the
browser; the link comes back with a one-time code in the query, and the page exchanges it
(`/token?grant_type=pkce`) for a session. A link therefore works once, and only in the browser that
asked for it. The page no longer takes a session from the address bar (the implicit flow), so a
link that carries someone else's tokens signs nobody in, and it's served with
`Referrer-Policy: no-referrer`. The generated project gains `src/api/pages/sign-in.test.ts`, which
runs the page's script in a small fake browser (`src/api/pages/fake-browser.ts`).
