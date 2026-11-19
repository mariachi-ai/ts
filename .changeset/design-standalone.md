---
'@mariachi/design': minor
'@mariachi/design-kits': minor
'@mariachi/explorer': patch
---

The design packages no longer depend on `@mariachi/core`: `@mariachi/design`, `@mariachi/design-kits` and
`@mariachi/motion` install nothing of the backend framework, so a site or a tool can use the design library
on its own.

`DesignError` and `DesignKitsError` keep their shape (a stable `code`, a message, optional `metadata`) but now
extend `Error`, not `MariachiError`. Code that caught them as `MariachiError` should catch them by their own
class, or check `code`. The explorer still lists their codes: it now treats any class that extends `Error`
and takes `code` first as an error root.
