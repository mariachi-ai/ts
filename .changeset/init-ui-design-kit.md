---
'@mariachi/create': minor
'@mariachi/cli': minor
'@mariachi/api-facade': minor
'@mariachi/design': patch
---

`mariachi init --ui` gives the project a design kit of its own. It copies a kit into `src/design/` (`linen` unless the new `--kit <id>` names another) with `@mariachi/design-kits` when that can be imported, and otherwise with `npx @mariachi/design-kits@<the project's @mariachi range> add <id>`. A kit that can't be copied is reported with the command to run by hand, and `init` exits 1. Without `--ui`, nothing loads or fetches the kits.

The generated pages load the kit (`/assets/design/index.css`), its motion, `@mariachi/design`'s components alone (`/assets/lib/components.css`) and then the project's own `src/design.css` (`/assets/design.css`), where token overrides now go; `public/app.css` is gone. `public/enhance.js` starts `@mariachi/design`'s behaviours (`/assets/lib/behaviors.js`) and the kit's `motion.js` on every page. `<html data-theme>` is the kit's id, read from `src/design/kit.json` by the new `src/design-kit.ts` (the layout's `THEME` constant is gone), so `mariachi design add <other>` changes the look with no code change. The app won't start without a kit (`app/design-kit-missing`, naming the command to run).

`@mariachi/api-facade` adds `withStaticFile(urlPath, file)` and `staticFile(file)`, which serve one file at one path and nothing else from its directory. `@mariachi/design` exports `./behaviors.js`, the behaviours script as a file a server can send.
