# @mariachi/motion

Loading, motion and animated charts for every Mariachi design language. One package holds the behaviour and the
structure; each language is a thin overlay of tokens on top of it (`@mariachi/design`'s presets set them). A skeleton
is the same skeleton in every language: one language makes it rounded and warm, another square and still.

- **No look of its own.** Every colour, corner, duration and easing is a `--m-*` custom property, with a plain fallback.
- **No dependencies.** CSS, plus one small ESM file for what CSS can't do.
- **Reduced motion everywhere.** Under `prefers-reduced-motion: reduce`, movement becomes a short opacity change or nothing, count-ups show the final number, shimmer stops, and charts appear drawn.
- **Copied, not installed, in apps.** A project gets these files in `src/design/motion/` with the language's kit (shas in `kit.json`), as decided on 2026-11-14. The package exists so there's one source, one set of tests and one version.

## Files

| File | What |
| --- | --- |
| `dist/motion.css` | Every state and transition below, in `@layer mariachi.motion` (after `mariachi.components`, before `mariachi.overrides`: the file declares the order, and so does `@mariachi/design`'s `layers.css`). Shipped as written, with comments, since agents read it: 31 KB, 6.8 KB gzipped (4 KB minified and gzipped) |
| `dist/motion.js` | `enhance()`, `leave()`, `busy()`, `optimistic()`, `countUp()`, `navigate()` (and `prefersReducedMotion()`): ESM, browser only, 7 KB minified, 3 KB gzipped |
| `dist/charts.js` | `chart(spec)` → the chart's markup: an SVG in a `<figure class="m-chart">` with its data table (runs in Node and the browser); `updateChart(el, spec)`: 11 KB minified, 5 KB gzipped |
| `dist/motion.d.ts`, `dist/charts.d.ts` | Their types (copied into kits too, so a TypeScript project's copy typechecks) |
| `dist/catalog.json` | Every pattern with its markup examples, as `@mariachi/design`'s catalog has them (for `mariachi design reference`): `{ package, version, usage, patterns: [{ name, title, category, description, useWhen, anatomy, a11y, examples: [{ name, html, code? }] }] }` |
| `dist/gallery.html` | Every pattern live, in any language: `dist/gallery.html?theme=terracotta&mode=dark` from the repo, with `@mariachi/design` built beside it (not published) |

In an app, after the kit: `import './design/index.css'; import './design/motion/motion.css'`, and once at start
`import { enhance } from './design/motion/motion.js'; enhance();`.

## The markup (what an app, or the agent, writes)

### Loading
| Pattern | Markup |
| --- | --- |
| Skeleton shaped like content | `.m-skeleton` with `data-shape="text"` (the default), `"circle"`, `"block"`, plus `"row"`, `"card"`, `"media"` (keeps `aspect-ratio`) and `"lines"` (`style="--lines: 3"`). Group them in the shape of what's coming |
| A region that loads | `<section aria-busy="true">`: its `[data-when="loading"]` children show and its `[data-when="loaded"]` children hide; set `aria-busy="false"` to swap, with the enter motion |
| A picture | `<img class="m-media" src="…" data-placeholder="data:…">`: blur-up from the tiny placeholder, then a fade; without a placeholder, `.m-media-frame` shows a spinner until load. `enhance()` sets `data-loaded` (`"true"` or `"error"`); without it pictures show as normal |
| Upload or long work | the library's `m-progress`, with `data-indeterminate` for unknown length (on any `.m-progress` element; a native `<progress>` with no value is indeterminate already) |

### Actions
| Pattern | Markup and code |
| --- | --- |
| A busy button | `data-busy` on any button: a spinner replaces its leading icon (an `svg` or `[data-icon]` first child); a button with no icon keeps its label (for its width and for screen readers) with the spinner over it, as the library's `aria-busy` button does. Its width holds, `aria-busy="true"`, clicks are ignored. `busy(button, promise)` sets and clears it |
| An optimistic change | `optimistic(el, apply, commit, { undo, message?, error?, notify? })`: applies at once with `data-pending` (dimmed, a small pending mark), then confirms (with a toast and Undo when you pass `message`), or runs `undo()` to revert and shows a toast saying so, with Try again. Toasts use the library's `.m-toast` markup; `notify` hands them to your own. For small edits only: toggles, renames, reordering. Never payments or deletions |

### Motion
| Pattern | Markup and code |
| --- | --- |
| Enter | `data-enter` on anything: it fades, slides or scales in when it appears (the overlay picks which). A keyframe entrance (it plays when the element is added or stops being `display: none`), so it works without JavaScript and never replaces the element's own transitions |
| Stagger | `data-stagger` on a list: its children enter one after another (`--i` set by `enhance()`, or by `:nth-child` up to 12 without it), capped so a long list never waits |
| Exit | `leave(el)`: plays the exit, then removes it |
| Dialogs, sheets, popovers, toasts | automatic for `dialog`, `[popover]`, `.m-sheet` and `.m-toast`: open and close with `@starting-style` and `transition-behavior: allow-discrete`. A sheet is `<dialog class="m-dialog m-sheet" data-side="end">` (`end`, `start` or `bottom`), sliding in from its edge; a toast leaves with `data-state="closing"` (the library's behaviours) or `leave()`. Shown-inline examples (`data-static`) are left alone |
| Page and route transitions | automatic for full-page navigation (`@view-transition { navigation: auto }`, a short cross-fade); in a single-page app, `navigate(() => router.push(…))` wraps the change in a view transition. The overlay can choose slide (`navigate()` reads `--m-motion-route` and sets `data-m-route` on `<html>`; full-page navigations always cross-fade). Put `data-theme` on `<html>` so transitions take the language's timing; `view-transition-name` on shared parts (the sidebar, a card that becomes a page) keeps them in place |

### Charts
`chart({ kind, title, series, labels, … })` returns SVG for `line`, `area`, `bar`, `donut` and `sparkline`, plus `stat`
(a number that counts up, with its change). Lines draw on (`pathLength` and `stroke-dashoffset`), bars grow from
their base with a stagger, donuts sweep, and `updateChart(el, spec)` animates to new data. Series colours come from
the language's `charts.categorical` (`--m-chart-1` to `--m-chart-5`); axes and grid from its neutrals. Labels and
values are real text for screen readers, with a `<title>` and a table fallback.

The markup is a `<figure class="m-chart" data-kind="…">`: the SVG (`role="img"`, its `<title>` and a `<desc>` summary),
a legend when there's more than one series, and a visually hidden `<table>` of the data (a table can't sit inside an
SVG, so the figure holds both). `title` is required; `series` is `[{ name, values }]` or one series' values;
`format` and `locale` are `Intl.NumberFormat`'s. A stat takes `value`, `change` (a fraction: 0.124 is 12.4%),
`changeLabel`, `goodWhen: 'up' | 'down'` and an optional `series` for its sparkline; its number is `[data-count-up]`,
counted by `enhance()` when it scrolls into view. `animate: false` draws a chart in place (`data-static`). The figure
keeps its spec in `data-m-chart`, which `updateChart` tweens from; a different shape is drawn afresh.

## The overlay: tokens a language sets

These go in `@mariachi/design`'s contract (motion and component tokens), so every preset can set them and every kit's
`tokens.css` carries them. Each language's values come from its source's measured `motion.durations` and easing, or its
category's default, marked `inferred`.

| Token | Meaning | Default |
| --- | --- | --- |
| `--m-motion-duration-fast` / `-normal` / `-slow` | exist today | 120 / 200 / 320ms |
| `--m-motion-duration-enter` / `-exit` | entrances and exits | 240 / 160ms |
| `--m-motion-easing-standard` / `-emphasized` | exist today | |
| `--m-motion-easing-enter` / `-exit` | entrances decelerate, exits accelerate | `cubic-bezier(0.05, 0.7, 0.1, 1)` / `cubic-bezier(0.3, 0, 0.8, 0.15)` |
| `--m-motion-enter-transform` | the motion style: `translateY(0.5rem)` (slide), `scale(0.98)` (scale) or `none` (fade) | `translateY(0.375rem)` |
| `--m-motion-stagger` / `--m-motion-stagger-max` | delay per item, and the cap | 40ms / 320ms |
| `--m-motion-route` | page transition: `fade` or `slide` (read by `navigate()`; the CSS uses `-route-duration`) | fade |
| `--m-motion-route-duration` | | 200ms |
| `--m-skeleton-animation` | `m-shimmer`, `m-pulse` or `none` | `m-shimmer` |
| `--m-skeleton-bg` / `-highlight` / `-radius` / `-block-radius` | exist today | |
| `--m-loader-stroke` | the spinner's weight | 2px |
| `--m-chart-1` … `--m-chart-5` | series colours, from `charts.categorical` (the build sets them for each language; a plain preset uses its accent, then info, success, warning and danger) | |
| `--m-chart-stroke` / `--m-chart-bar-radius` / `--m-chart-draw` | line weight, bar corners, draw-on time | 2px / 2px / 600ms |

In the contract, the motion tokens are `motion.*` (semantic); `--m-skeleton-animation` is the skeleton component's
`animation`; the loader and chart tokens are `components.loader.*` and `components.chart.*`, token groups with no
component of their own. `defineTheme` gives every theme all of them, so every kit's `tokens.css` carries them, and
`withMotionOverlay(theme)` (what the build runs) sets a language's chart colours.

The keyframes `m-spin`, `m-pulse` and `m-shimmer` are in both this file and `@mariachi/design`'s `css/motion.css`,
identical (a test holds them so), so the library's components keep working with or without this file.

## For coding agents and new projects

- **A coding agent** writes the markup above by default. Every list and card region has a loading state shaped like it, actions that wait use `data-busy`, new content enters, and charts come from `chart()`. `mariachi design reference` reads `dist/catalog.json`.
- **A new project's copy-in** brings `dist/motion.css`, `dist/motion.js` and `dist/charts.js` (with their `.d.ts`) into `src/design/motion/`, adds their shas and the package version to `kit.json`, and the starter imports the CSS and calls `enhance()` once. `@mariachi/design`'s kit build already does this: every `dist/kits/<id>/` has a `motion/` folder, and its `kit.json` has `motion: { package, version, files }` with each file's sha in `files`.
- **The checks:** the fingerprint probe gains `loading.skeleton`, `motion.enter` and `charts.animated`, and the rebuild gate fails a one-shot build without them.
