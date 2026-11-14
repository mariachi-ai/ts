---
'@mariachi/design-kits': minor
'@mariachi/cli': minor
'@mariachi/design': patch
---

Kits are published, and `mariachi design add <kit>` copies one into a project. The new
`@mariachi/design-kits` ships every design language and plain preset as a kit (tokens, base styles,
self-hosted fonts, motion and `DESIGN.md`, with a sha256 per file), storing shared fonts and the motion
files once and putting each kit back together byte for byte. `mariachi design add linen` (or
`npx @mariachi/design-kits add linen`, with nothing installed) writes the kit into `src/design/` and, once,
`src/design.css` beside it for the project's own changes. It never writes `design.css` again, reports a
copy the project has edited instead of replacing it (exit 1, unless `--force`), switches languages in
place so the project's imports don't change, and never removes a file that isn't a kit's. `mariachi design list` shows the kits beside the
presets and components. Each kit now carries the licence of every font it copies, as
`fonts/<family>.LICENSE.txt`, recorded in `kit.json`.
