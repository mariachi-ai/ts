# @mariachi/design-kits

Every [`@mariachi/design`](../design/README.md) language and plain preset as a **kit**: the part of a
design language a project copies in and owns, so its look never changes under it.

```bash
npx @mariachi/design-kits list
npx @mariachi/design-kits add linen            # the kit in src/design/, and src/design.css
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
src/
  design/        the kit, exactly as built: every file matches its sha256 in kit.json
  design.css     the project's own changes; made once, never written again
```

Then, in the project: import `design/index.css`, `design/motion/motion.css` and `design.css` in that
order, set `data-theme="linen"` on `<html>` (the mode follows the system; `data-mode="light"` or
`"dark"` pins it), and call `enhance()` from `design/motion/motion.js` once at start.

A project has one kit, and `data-theme` names the language, so the folder doesn't. The imports stay the
same when the language changes.

| Situation | What happens |
| --- | --- |
| The kit is there, as packed | Nothing is written; it says `unchanged` |
| The project edited or removed a kit file | The files are listed, nothing is written, exit 1. `--force` replaces them and lists what was discarded |
| Another kit is there | A switch, in place: the old kit's files are removed and the new one's written (same rule for edits) |
| The project has a file of its own in the folder | It stays, and is reported. If the new kit has a file of that name, it counts as an edit |
| The folder has files and no kit | Refused, with or without `--force`. A kit takes a folder of its own |
| This package was upgraded | A re-run moves a clean copy to the new version. Nothing updates on its own |
| `design.css` exists | Left alone, always |

Flags: `--dir <dir>` (default `src/design`), `--force`, `--dry-run`, `--json`. Only kit files are ever
removed, and nothing is written but the kit's folder and, once, the `design.css` beside it.

## What `reference` does

```bash
npx @mariachi/design-kits reference card                 # how the project's kit (in src/design) builds a card
npx @mariachi/design-kits reference card --kit meridian   # or another kit's
npx @mariachi/design-kits reference --list                # every component, and the language's named patterns
```

With the Mariachi CLI it's `mariachi design reference card`. Components aren't copied with a kit. When the project needs one, this answers in Markdown:
- how the language draws it (its `DESIGN.md` entry and its own tokens);
- its anatomy, use and accessibility;
- example markup;
- the CSS to copy, on `--m-*` tokens only;
- where it appears in the language's pages.

A language's named patterns (a player, a job card …) are answered too. Something it has no answer for gets the nearest components and exit code 1. `--json` prints the answer. The component CSS and the patterns are packed in this package, under `dist/reference/`.

## From code

```ts
import { addKit, installedKit, listKits, readKit } from '@mariachi/design-kits';

listKits();                                  // [{ id, label, kind, category, mode, fonts, files, bytes }]
const kit = readKit('linen');                // { manifest, manifestBytes, files: Map<path, Buffer> }, checked against kit.json

const result = addKit('linen', { dir: 'src/design' });
result.status;                               // 'added' | 'switched' | 'updated' | 'unchanged'
result.next.imports;                         // the three stylesheets, in order

installedKit('src/design');                  // the kit there, with edited / missing / extra files, or null
```

`addKit` throws `DesignKitsError`: `design-kits/edited` (with `edited`, `missing` and `extra` in its
metadata), `design-kits/unknown-kit`, `design-kits/not-a-kit`, `design-kits/invalid-dir`. A packed file
that doesn't match its sha256 is `design-kits/corrupt`.

### Reading a kit without writing it

For a server that hands out single files, or a tool that puts a kit into a project in memory:

```ts
import { hasKit, kitJson, kitJsonBytes, readKitFile } from '@mariachi/design-kits';

hasKit('linen');                             // true
const manifest = kitJson('linen');           // kit.json: id, label, mode, dataTheme, mariachi.version and .commit, fonts, files with sha256
kitJsonBytes('linen');                       // the same file's bytes, exactly as built
readKitFile('linen', 'tokens.css');          // a Buffer, checked against the sha256 in kit.json
```

`readKitFile` gives only a path `kit.json` lists. Anything else is `design-kits/unknown-file`:
`kit.json` itself, a path that climbs out of the kit, an absolute path. An id is checked against the
kit list before it is ever part of a path. Nothing is written anywhere.

`kitJson(id).mariachi.version` is the `@mariachi/design` version the kit was built from, which is this
package's version: compare it with the version you pin.

### The design catalog

```ts
import catalog from '@mariachi/design-kits/catalog.json' with { type: 'json' };   // or read catalogPath()

catalog.components;                          // 36 components: anatomy, tokens, accessibility notes, examples
catalog.archetypes;                          // every language: pitch, swatches, type, recipes
```

The catalog is what `@mariachi/design`'s build writes as `dist/catalog.json`: components, languages,
presets, semantic tokens and contrast pairs. It is about 9 MB (1 MB compressed), which is why it is
here and not in `@mariachi/design`, the package every app installs. Each language's `DESIGN.md` and
`showcase.json`, and the component CSS, stay in `@mariachi/design`.

## How the kits are packed

The kits are about 12 MB as built (4.8 MB packed), because every kit has the motion files and many share a font.
This package stores each such file once (`dist/shared/<sha256>`), keeps a kit's own files in
`dist/kits/<id>/`, and puts a kit back together from its `kit.json`, checking every file's sha256.
The build reads every kit back and compares it with `@mariachi/design`'s build, byte for byte, so a
copy from this package is the kit as built. `dist/kits.json` lists what's inside.
