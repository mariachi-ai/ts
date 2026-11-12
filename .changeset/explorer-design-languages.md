---
'@mariachi/explorer': minor
'@mariachi/design': patch
---

Explorer: a design languages section. `/design/languages/` lists every language from the design catalog as a card (name, pitch, swatches, category, tags), filtered by category, each tag group (feel, density, mode, suits, style) and a keyword search. Each language's page shows its settings resolved light and dark (colours with the brand colour and chart colours, type, radius, shadows, motion, density), its generated gallery and seven recipes in frames with a light/dark switch, its icons, and its `DESIGN.md` rendered (and raw). The gallery, recipe and CSS files are served in the package's own layout (`design/languages/<id>/…`, `design/css/…`). Languages also appear in the header nav, the design sidebar, the preset pages and `explorer.json`.

`@mariachi/design` now exports `lucideSvg`, `lucidePaths`, `resolveDeep` and `toPx`, which its galleries and DESIGN.md references already use, so pages can show a language's icons and resolved values the same way.
