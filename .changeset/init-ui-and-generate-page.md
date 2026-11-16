---
'@mariachi/create': patch
'@mariachi/cli': patch
---

`mariachi init --ui` and `mariachi generate page`: a project with pages a person can open.

- **`--ui`** (`createProject({ ui: true })`) adds pages sent by the same server as the API and
  styled with `@mariachi/design`: a layout with the design library's stylesheets and one `THEME`
  constant, a home page, a pages controller with routes at the server's root, `public/` served under
  `/assets`, and unit and end-to-end tests. Pages are built with `html`, which escapes what is put
  into it; scripts are files, and the page's policy runs no inline script. It works with `--auth
  jwt`, `--auth gotrue` and `--orgs`. Projects made without the flag are unchanged.
- **`mariachi generate page <name>`** writes `src/api/pages/<name>.ts` and its test, adds its route
  at `/<name>` and its link in the bar.
