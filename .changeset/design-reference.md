---
'@mariachi/design-kits': minor
'@mariachi/cli': minor
---

`mariachi design reference <name>` says how the project's design language builds a component: how
the language draws it, its tokens, anatomy and accessibility, example markup, the CSS to copy (on
`--m-*` tokens only), and where it appears in the language's pages. It answers a language's named
patterns too (a player, a job card …), and `--list` names everything it can answer. The kit is the
project's own (`--dir`, default `src/design`) unless `--kit` names another.

Every kit's headers and `DESIGN.md` already pointed here. `@mariachi/design-kits` now packs each
component's CSS and each language's patterns under `dist/reference/`, so the answer needs nothing
else installed (`npx @mariachi/design-kits reference card`). From code: `designReference(name, kit)`
and `referenceList(kit)`.
