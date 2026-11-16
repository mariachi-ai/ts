# @mariachi/design

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
  - @mariachi/motion@0.1.1

## 0.1.0

### Minor Changes

- 232c35f: Per-variant button shadows: `components.button.<variant>.shadow`, `.hoverShadow` and
  `.activeShadow` for primary, secondary, ghost and danger. Each defaults to the button-wide shadow
  (ghost stays shadowless at rest, as before), so existing presets are unchanged. A preset can now give
  one variant its own treatment, such as a raised "ledge" primary beside a flat secondary.
- 3a33e60: A brand colour in the token contract: `color.brand.default`, `color.brand.fg` and
  `color.brand.subtle` (Tailwind `--color-brand`, `--color-brand-fg`, `--color-brand-subtle`), for a
  brand's signature colour when it isn't the action colour. It defaults to the accent, so existing
  presets are unchanged; contrast is checked for text on the brand and on its tint. The language
  galleries show it with the other colours.
- 0a6fd16: Three more design languages in the _bold and fast_ category, each a complete library faithful to one
  real product's visual system under an abstract name: **Volt** (`volt`), **Sprint** (`sprint`) and
  **Summit** (`summit`).
- 131c268: Two design languages in the _bold and fast_ category, each a complete library (preset, seven
  recipes, `DESIGN.md` with the generated reference, icons for every common action, a generated
  gallery, and a brand colour), each faithful to one real product's visual system under an abstract
  name: **Zephyr** (`zephyr`) and **Onyx** (`onyx`).
- a7d108e: Four more design languages in the _calm fintech_ category, each a complete library (preset, seven
  recipes, `DESIGN.md` with the generated reference, icons for every common action, and a generated
  gallery), each faithful to one real product's visual system under an abstract name: **Fennel**
  (`fennel`), **Basalt** (`basalt`), **Ember** (`ember`) and **Cirrus** (`cirrus`). Every one passes
  the contrast pairs in both modes.
- f117089: Three more design languages in the _calm and minimal_ category, each a complete library faithful to
  one real product's visual system under an abstract name: **Nocturne** (`nocturne`), **Vellum**
  (`vellum`) and **Chalk** (`chalk`).
- 737852e: Two design languages in the _calm and minimal_ category, each a complete library faithful to one
  real product's visual system under an abstract name: **Linen** (`linen`) and **Quill** (`quill`).
- b87e817: Three more design languages in the _content-first and immersive_ category, each a complete library
  faithful to one real product's visual system under an abstract name: **Marquee** (`marquee`), **Reel**
  (`reel`) and **Refrain** (`refrain`).
- 32e6214: Two design languages in the _content-first and immersive_ category, each a complete library faithful
  to one real product's visual system under an abstract name: **Cadence** (`cadence`) and **Mosaic**
  (`mosaic`).
- d49b47f: Three more design languages in the _dark and sharp_ category, each a complete library faithful to one
  real product's visual system under an abstract name: **Meridian** (`meridian`), **Flint** (`flint`) and
  **Comet** (`comet`).
- 2e5fb61: Two design languages in the _dark and sharp_ category, each a complete library faithful to one real
  product's visual system under an abstract name: **Obsidian** (`obsidian`) and **Anthracite** (`anthracite`).
  Both are dark-first with a light theme.
- fe40ae9: Three more design languages in the _editorial and warm-neutral_ category, each a complete library
  faithful to one real product's visual system under an abstract name: **Ochre** (`ochre`), **Margin**
  (`margin`) and **Quire** (`quire`).
- e033df0: Two design languages in the _editorial and warm-neutral_ category, each a complete library faithful
  to one real product's visual system under an abstract name: **Folio** (`folio`, also in _calm and
  minimal_) and **Broadsheet** (`broadsheet`).
- dcd3c18: Design languages: complete visual systems an app is built from, each faithful to one real product's
  visual system under an abstract name, browsed by category. The first is **Halcyon** (`halcyon`, in
  the _calm fintech_ category): light type on white, a blue-violet accent, pill actions, ring-shadowed
  cards, hairline tables and figures with small raised cents. It's a preset extended from `minimal`,
  passing every contrast pair in both modes. `archetypes` and `categories` (exported, and new sections
  in `catalog.json`) add what an app needs beyond the tokens: search tags and keywords, a discovery card
  (who it's for, a pitch, resolved swatches), type, icons, a chart palette, density, six layout recipes
  as framework-free HTML (`@mariachi/design/archetypes/<id>/recipes/<name>.html`) and a `DESIGN.md` for
  agents (`@mariachi/design/archetypes/<id>/DESIGN.md`) with a reference generated from the preset (the actual scales, layout, colours and icon map). Each language also gets an icon for every common action, an `errors` recipe, and a generated gallery (`@mariachi/design/archetypes/<id>/gallery.html`) drawing the foundations, icons, every control in every state, error, loading and empty patterns, and all 36 components, in light and dark.
- 3a01067: Two more design languages in the _marketplace and commerce_ category, each a complete library faithful
  to one real product's visual system under an abstract name: **Keel** (`keel`) and **Relay** (`relay`).
- a4eb700: Two design languages in the _marketplace and commerce_ category, each a complete library faithful to
  one real product's visual system under an abstract name: **Bazaar** (`bazaar`) and **Transit**
  (`transit`). Terracotta (warm and friendly) is also listed here.
- 7c2eba5: Three more design languages in the _playful and quirky_ category, each a complete library faithful to
  one real product's visual system under an abstract name: **Kite** (`kite`), **Doodle** (`doodle`) and
  **Tinker** (`tinker`).
- 925a728: Two design languages in the _playful and quirky_ category, each a complete library faithful to one
  real product's visual system under an abstract name: **Nacre** (`nacre`) and **Confetti**
  (`confetti`).
- e21bba7: Three more design languages in the _social and messaging_ category, each a complete library faithful
  to one real product's visual system under an abstract name: **Lagoon** (`lagoon`), **Candid** (`candid`)
  and **Trellis** (`trellis`).
- 6b8498a: Two design languages in the _social and messaging_ category, each a complete library faithful to one
  real product's visual system under an abstract name: **Hearth** (`hearth`) and **Harbor** (`harbor`).
- 3750772: Three more design languages in the _warm and friendly_ category, each a complete library faithful to
  one real product's visual system under an abstract name: **Solace** (`solace`), **Heather**
  (`heather`) and **Saffron** (`saffron`).
- ddd11d2: Two design languages in the _warm and friendly_ category, each a complete library faithful to one
  real product's visual system under an abstract name: **Terracotta** (`terracotta`, also in
  _marketplace_) and **Marigold** (`marigold`).
- 92577a6: Add `@mariachi/design` (alpha): framework-agnostic tokens and CSS for any web app.
  - One token contract (semantic and component tiers) and six presets: minimal, brutalist, editorial,
    soft, enterprise, terminal. Switch with `data-theme`; `data-mode` is `auto`, `light` or `dark`.
  - 36 components as plain HTML + CSS (`m-` classes, data attributes, ARIA state), including AI patterns:
    chat, thinking, tool calls, citations, composer and usage meters.
  - Override at any granularity: one token, one component, one area, a replaced component
    (`replace` in `mariachi.design.ts`), or a whole preset (`extendTheme`). `buildDesign` emits only the
    tokens you changed.
  - Every preset passes WCAG contrast pairs in both modes; `checkTheme` runs them on your overrides.
  - DTCG token export, a Tailwind v4 theme mapping, and an optional behaviours script.

  `@mariachi/core` gains a dependency-free `@mariachi/core/errors` subpath (the error classes only), for
  browser-safe packages.

### Patch Changes

- 8ba4509: Fennel, Basalt and Ember set the new brand colour to their signature colours (a bright lime, an
  electric lime and a hot coral, each with dark text); Cirrus and Halcyon keep the default (their
  accent).
- 407cc1b: The design fingerprint (spec 1, `docs/design-fingerprint.md`): `@mariachi/design/build` exports the probe that measures a rendered screen (`measureScreen`, and `probeSource` to evaluate it in a page), `buildFingerprint` and `buildChecks` for `fingerprint.json` and `checks.json`, `checkMessage`, and the `distance` and `spreads` used by the distinctiveness matrix. `pnpm --filter @mariachi/design fingerprint` measures every language's recipes at three widths in Chrome and writes each language's fingerprint, its checks and the matrix to `dist/`.
- 00f5846: The build writes a kit per language and preset to `dist/kits/<id>/`: the base a project copies in to own its language (fonts, the reset and base styles, the tokens, `DESIGN.md` and a `kit.json` with a sha per file). Components aren't in a kit; a project makes them from the library when it needs them. `designReference` is exported from `@mariachi/design/build`. Kits aren't in the npm package.
- d400e17: Marigold and Confetti use per-variant button shadows. Marigold's buttons stand on a solid lip below
  the face in each variant's darker step, with no ring, and its ghost button stays flat. Confetti's
  light primary takes the reference's white face on an amber ledge, every variant has its own ledge
  colour, and its tertiary button stays flat.
- 8a9ee49: `@mariachi/design` ships only what an app or tool reads: ESM only (no CommonJS build), no source maps, and no per-language galleries, recipe pages, DTCG token files or `catalog.json`. They're still built in the repo for the explorer. The packed size goes from 11.5 MB to 2.3 MB. `@mariachi/cli` now has `@mariachi/design` as an optional peer, loaded only by `mariachi design`, so a project that never runs it doesn't install the design package.
- 46233a3: The `enterprise` and `terminal` presets list `"Liberation Mono"` before the generic `monospace`, as the base stack does. On Linux without their named fonts, the generic family resolved to whatever fontconfig ranked first (often a CJK font), and Chromium could switch fonts mid-page.
- c2f9612: A theme on the root element no longer redefines `1rem`. `[data-theme]` set the theme's body size on
  the element, so on `<html>` every rem token scaled a second time (a 15px body made 36px buttons
  33.75px). The root now keeps the browser's size and its `<body>` takes the theme's size.
- e0b2008: Explorer: a design languages section. `/design/languages/` lists every language from the design catalog as a card (name, pitch, swatches, category, tags), filtered by category, each tag group (feel, density, mode, suits, style) and a keyword search. Each language's page shows its settings resolved light and dark (colours with the brand colour and chart colours, type, radius, shadows, motion, density), its generated gallery and seven recipes in frames with a light/dark switch, its icons, and its `DESIGN.md` rendered (and raw). The gallery, recipe and CSS files are served in the package's own layout (`design/languages/<id>/…`, `design/css/…`). Each language's fonts (its `type` families, with the weights its preset uses) load from Google Fonts on its page, gallery and recipes, and lazily on the index cards; families Google doesn't have are skipped, and offline the stacks' fallbacks render. Languages also appear in the header nav, the design sidebar, the preset pages and `explorer.json`.

  `@mariachi/design` now exports `lucideSvg`, `lucidePaths`, `resolveDeep` and `toPx`, which its galleries and DESIGN.md references already use, so pages can show a language's icons and resolved values the same way.

- Updated dependencies [2fd4011]
- Updated dependencies [bb7f53a]
- Updated dependencies [6ad742b]
- Updated dependencies [92577a6]
- Updated dependencies [47f9687]
- Updated dependencies [da7d762]
- Updated dependencies [662ccc5]
- Updated dependencies [fcdeb4e]
- Updated dependencies [ea2f8fc]
- Updated dependencies [662ccc5]
- Updated dependencies [879b40f]
  - @mariachi/core@0.1.0
  - @mariachi/motion@0.1.0
