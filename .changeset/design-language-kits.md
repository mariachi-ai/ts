---
"@mariachi/design": patch
---

The build writes a kit per language and preset to `dist/kits/<id>/`: the base a project copies in to own its language (fonts, the reset and base styles, the tokens, `DESIGN.md` and a `kit.json` with a sha per file). Components aren't in a kit; a project makes them from the library when it needs them. `designReference` is exported from `@mariachi/design/build`. Kits aren't in the npm package.
