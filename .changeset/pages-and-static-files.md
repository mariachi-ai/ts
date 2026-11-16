---
'@mariachi/api-facade': patch
'@mariachi/server': patch
---

The API server can send pages and the files they load.

- `root: true` on a route mounts it at the server's root, outside its prefix (`/`, not `/api/…`),
  and keeps it out of the OpenAPI document. `@mariachi/server` routes take `root` too.
- `html` is a template that escapes what is put into it; `raw` vouches for markup; `safeHref` keeps
  a link from data to this site, `http:`, `https:` or `mailto:`; `htmlResponse` sends a page with a
  Content-Security-Policy that loads from its own origin only and runs no inline script.
- `api.withStatic(urlPath, directory)` serves a directory's files, for the app's own styles,
  scripts, fonts and images: regular files inside the directory only (no `..`, no link out of it, no
  listings, no dotfiles), with a type by extension, `nosniff` and an `ETag`. `staticFiles` is the
  handler alone.
