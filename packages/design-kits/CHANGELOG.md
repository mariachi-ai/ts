# @mariachi/design-kits

## 0.2.0

### Minor Changes

- ceec1b1: `mariachi design reference <name>` says how the project's design language builds a component: how
  the language draws it, its tokens, anatomy and accessibility, example markup, the CSS to copy (on
  `--m-*` tokens only), and where it appears in the language's pages. It answers a language's named
  patterns too (a player, a job card …), and `--list` names everything it can answer. The kit is the
  project's own (`--dir`, default `src/design`) unless `--kit` names another.

  Every kit's headers and `DESIGN.md` already pointed here. `@mariachi/design-kits` now packs each
  component's CSS and each language's patterns under `dist/reference/`, so the answer needs nothing
  else installed (`npx @mariachi/design-kits reference card`). From code: `designReference(name, kit)`
  and `referenceList(kit)`.

- 1e0acf3: The design packages no longer depend on `@mariachi/core`: `@mariachi/design`, `@mariachi/design-kits` and
  `@mariachi/motion` install nothing of the backend framework, so a site or a tool can use the design library
  on its own.

  `DesignError` and `DesignKitsError` keep their shape (a stable `code`, a message, optional `metadata`) but now
  extend `Error`, not `MariachiError`. Code that caught them as `MariachiError` should catch them by their own
  class, or check `code`. The explorer still lists their codes: it now treats any class that extends `Error`
  and takes `code` first as an error root.

## 0.1.1

### Patch Changes

- 3989057: Kits are published, and `mariachi design add <kit>` copies one into a project. The new
  `@mariachi/design-kits` ships every design language and plain preset as a kit (tokens, base styles,
  self-hosted fonts, motion and `DESIGN.md`, with a sha256 per file), storing shared fonts and the motion
  files once and putting each kit back together byte for byte. `mariachi design add linen` (or
  `npx @mariachi/design-kits add linen`, with nothing installed) writes the kit into `src/design/` and, once,
  `src/design.css` beside it for the project's own changes. It never writes `design.css` again, reports a
  copy the project has edited instead of replacing it (exit 1, unless `--force`), switches languages in
  place so the project's imports don't change, and never removes a file that isn't a kit's. `mariachi design list` shows the kits beside the
  presets and components. Each kit now carries the licence of every font it copies, as
  `fonts/<family>.LICENSE.txt`, recorded in `kit.json`.

  Tools that serve or assemble a kit without writing it use `hasKit(id)`, `kitJson(id)`,
  `kitJsonBytes(id)` and `readKitFile(id, path)`, which gives only the files `kit.json` lists, each
  checked against its sha256. The design catalog (components, languages, presets, tokens) ships as
  `@mariachi/design-kits/catalog.json`: it is too large for `@mariachi/design`, which leaves it out.

- Updated dependencies [f04e223]
- Updated dependencies [0964659]
- Updated dependencies [8486aa5]
- Updated dependencies [867c6ca]
  - @mariachi/core@0.1.1
