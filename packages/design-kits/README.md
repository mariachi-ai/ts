# @mariachi/design-kits

Every [`@mariachi/design`](../design/README.md) language and plain preset as a **kit**: the part of a
design language a project copies in and owns, so its look never changes under it.

```bash
npx @mariachi/design-kits list
npx @mariachi/design-kits add linen            # src/design/linen/ and src/design/design.css
```

With the Mariachi CLI it's `mariachi design add linen` (install this package beside it:
`pnpm add -D @mariachi/design-kits`).

## What a kit is

| File | What it is |
| --- | --- |
| `index.css` | Imports `fonts.css`, `base.css` and `tokens.css`, in order |
| `fonts.css`, `fonts/*.woff2` | The body and heading families, self-hosted (Latin and Latin Extended) |
| `fonts/<family>.LICENSE.txt` | Each family's licence. Keep it with the font files |
| `base.css` | The reset and base layers, no components |
| `tokens.css` | The language's tokens, light and dark, on `[data-theme="<id>"]` |
| `motion/` | `@mariachi/motion`'s `motion.css`, `motion.js`, `charts.js` and their types |
| `DESIGN.md` | The language in words: how it draws each component, with the token reference |
| `kit.json` | The id, the `@mariachi/design` version and commit, the fonts, and a sha256 per file |

Components aren't in a kit. A project makes each one when it needs it, as `DESIGN.md` describes, on
`--m-*` tokens.

## What `add` does

```
src/design/
  linen/         the kit, exactly as built: every file matches its sha256 in kit.json
  design.css     the project's own changes; made once, never written again
```

Then, in the project: import `linen/index.css`, `linen/motion/motion.css` and `design.css` in that
order, set `data-theme="linen"` on `<html>` (the mode follows the system; `data-mode="light"` or
`"dark"` pins it), and call `enhance()` from `linen/motion/motion.js` once at start.

| Situation | What happens |
| --- | --- |
| The kit is there, exactly as packed | Nothing is written; it says `unchanged` |
| The project edited, removed or added files in the kit's folder | The files are listed, nothing is written, exit 1. `--force` replaces the folder and lists what was discarded |
| Another kit is there | A switch: the old kit's folder is removed whole (same rule for edits). `--keep-others` leaves it |
| A folder with the kit's name isn't a kit | Refused, unless `--force` |
| This package was upgraded | A re-run moves a clean copy to the new version. Nothing updates on its own |
| `design.css` exists | Left alone, always |

Flags: `--dir <dir>` (default `src/design`), `--force`, `--keep-others`, `--dry-run`, `--json`.
Nothing outside `<dir>` is read or written.

## From code

```ts
import { addKit, installedKits, listKits, readKit } from '@mariachi/design-kits';

listKits();                                  // [{ id, label, kind, category, mode, fonts, files, bytes }]
const kit = readKit('linen');                // { manifest, manifestBytes, files: Map<path, Buffer> }, checked against kit.json

const result = addKit('linen', { dir: 'src/design' });
result.status;                               // 'added' | 'switched' | 'updated' | 'unchanged'
result.next.imports;                         // the three stylesheets, in order

installedKits('src/design');                 // each kit there, with edited / missing / extra files
```

`addKit` throws `DesignKitsError`: `design-kits/edited` (with the files in `metadata.kits`),
`design-kits/unknown-kit`, `design-kits/not-a-kit`, `design-kits/invalid-dir`. A packed file that doesn't
match its sha256 is `design-kits/corrupt`.

## How the kits are packed

The kits are about 11 MB as built (4.5 MB packed), because every kit has the motion files and many share a font.
This package stores each such file once (`dist/shared/<sha256>`), keeps a kit's own files in
`dist/kits/<id>/`, and puts a kit back together from its `kit.json`, checking every file's sha256.
The build reads every kit back and compares it with `@mariachi/design`'s build, byte for byte, so a
copy from this package is the kit as built. `dist/kits.json` lists what's inside.
