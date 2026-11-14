---
'@mariachi/design-kits': minor
'@mariachi/cli': minor
'@mariachi/design': patch
---

Kits are published, and `mariachi design add <kit>` copies one into a project. The new
`@mariachi/design-kits` ships every design language and plain preset as a kit (tokens, base styles,
self-hosted fonts, motion and `DESIGN.md`, with a sha256 per file), storing shared fonts and the motion
files once and putting each kit back together byte for byte. `mariachi design add linen` (or
`npx @mariachi/design-kits add linen`, with nothing installed) writes `src/design/linen/` and, once,
`src/design/design.css` for the project's own changes. It never writes `design.css` again, reports a copy
the project has edited instead of replacing it (exit 1, unless `--force`), and removes the old kit's
folder whole on a switch (unless `--keep-others`). `mariachi design list` shows the kits beside the
presets and components. Each kit now carries the licence of every font it copies, as
`fonts/<family>.LICENSE.txt`, recorded in `kit.json`.
