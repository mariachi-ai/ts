# @mariachi/explorer

## 0.2.0

### Patch Changes

- 1e0acf3: The design packages no longer depend on `@mariachi/core`: `@mariachi/design`, `@mariachi/design-kits` and
  `@mariachi/motion` install nothing of the backend framework, so a site or a tool can use the design library
  on its own.

  `DesignError` and `DesignKitsError` keep their shape (a stable `code`, a message, optional `metadata`) but now
  extend `Error`, not `MariachiError`. Code that caught them as `MariachiError` should catch them by their own
  class, or check `code`. The explorer still lists their codes: it now treats any class that extends `Error`
  and takes `code` first as an error root.

## 0.1.1

## 0.1.0

### Minor Changes

- e0b2008: Explorer: a design languages section. `/design/languages/` lists every language from the design catalog as a card (name, pitch, swatches, category, tags), filtered by category, each tag group (feel, density, mode, suits, style) and a keyword search. Each language's page shows its settings resolved light and dark (colours with the brand colour and chart colours, type, radius, shadows, motion, density), its generated gallery and seven recipes in frames with a light/dark switch, its icons, and its `DESIGN.md` rendered (and raw). The gallery, recipe and CSS files are served in the package's own layout (`design/languages/<id>/…`, `design/css/…`). Each language's fonts (its `type` families, with the weights its preset uses) load from Google Fonts on its page, gallery and recipes, and lazily on the index cards; families Google doesn't have are skipped, and offline the stacks' fallbacks render. Languages also appear in the header nav, the design sidebar, the preset pages and `explorer.json`.

  `@mariachi/design` now exports `lucideSvg`, `lucidePaths`, `resolveDeep` and `toPx`, which its galleries and DESIGN.md references already use, so pages can show a language's icons and resolved values the same way.

- 92577a6: Add `@mariachi/explorer` (alpha): one searchable site for every package, doc, exported symbol, error
  code, CLI command, framework table and design component, generated from the repo at build time and
  styled with `@mariachi/design`.

  `@mariachi/cli` adds:
  - `mariachi explore`: serves the explorer for the installed version (needs `@mariachi/explorer`).
  - `mariachi design build|check|new-theme|list`: build one CSS file from `mariachi.design.ts`, check
    contrast, scaffold a theme that extends a preset.
  - `@mariachi/cli/program`: the command tree without parsing argv.
