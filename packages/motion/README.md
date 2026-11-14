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
| `dist/motion.css` | Every state and transition below, in `@layer mariachi.motion` (after `mariachi.components`) |
| `dist/motion.js` | `enhance()`, `leave()`, `busy()`, `optimistic()`, `countUp()`, `navigate()`: ESM, browser only, about 6 KB |
| `dist/charts.js` | `chart(spec)` → an SVG string (runs in Node and the browser), `updateChart(el, spec)`: about 8 KB |
| `dist/catalog.json` | Every pattern with its markup examples, as `@mariachi/design`'s catalog has them (for `design_reference`) |

In an app, after the kit: `import './design/index.css'; import './design/motion/motion.css'`, and once at start
`import { enhance } from './design/motion/motion.js'; enhance();`.

## The markup (what an app, or the agent, writes)

### Loading
| Pattern | Markup |
| --- | --- |
| Skeleton shaped like content | `.m-skeleton` with `data-shape="text"` (the default), `"circle"`, `"block"`, plus `"row"`, `"card"`, `"media"` (keeps `aspect-ratio`) and `"lines"` (`style="--lines: 3"`). Group them in the shape of what's coming |
| A region that loads | `<section aria-busy="true">`: its `[data-when="loading"]` children show and its `[data-when="loaded"]` children hide; set `aria-busy="false"` to swap, with the enter motion |
| A picture | `<img class="m-media" src="…" data-placeholder="data:…">`: blur-up from the tiny placeholder, then a fade; without a placeholder, `.m-media-frame` shows a spinner until load |
| Upload or long work | the library's `m-progress`, with `data-indeterminate` for unknown length |

### Actions
| Pattern | Markup and code |
| --- | --- |
| A busy button | `data-busy` on any button: a spinner replaces its icon (or sits before its label), its width holds, `aria-busy="true"`, clicks are ignored. `busy(button, promise)` sets and clears it |
| An optimistic change | `optimistic(el, apply, commit, { undo })`: applies at once with `data-pending` (dimmed, a small pending mark), then confirms, or reverts and shows a toast with Undo. For small edits only: toggles, renames, reordering. Never payments or deletions |

### Motion
| Pattern | Markup and code |
| --- | --- |
| Enter | `data-enter` on anything: it fades, slides or scales in when it appears (the overlay picks which), using `@starting-style`, so it works without JavaScript |
| Stagger | `data-stagger` on a list: its children enter one after another (`--i` set by `enhance()`, or by `:nth-child` up to 12 without it), capped so a long list never waits |
| Exit | `leave(el)`: plays the exit, then removes it |
| Dialogs, sheets, popovers, toasts | automatic for `dialog`, `[popover]`, `.m-sheet` and `.m-toast`: open and close with `@starting-style` and `transition-behavior: allow-discrete` |
| Page and route transitions | automatic for full-page navigation (`@view-transition { navigation: auto }`, a short cross-fade); in a single-page app, `navigate(() => router.push(…))` wraps the change in a view transition. The overlay can choose slide; `view-transition-name` on shared parts (the sidebar, a card that becomes a page) keeps them in place |

### Charts
`chart({ kind, series, labels, … })` returns SVG for `line`, `area`, `bar`, `donut` and `sparkline`, plus `stat`
(a number that counts up, with its change). Lines draw on (`pathLength` and `stroke-dashoffset`), bars grow from
their base with a stagger, donuts sweep, and `updateChart(el, spec)` animates to new data. Series colours come from
the language's `charts.categorical` (`--m-chart-1` to `--m-chart-5`); axes and grid from its neutrals. Labels and
values are real text for screen readers, with a `<title>` and a table fallback.

## The overlay: tokens a language sets

These go in `@mariachi/design`'s contract (motion and component tokens), so every preset can set them and every kit's
`tokens.css` carries them. Each language's values come from its source's measured `motion.durations` and easing, or its
category's default, marked `inferred`.

| Token | Meaning | Default |
| --- | --- | --- |
| `--m-motion-duration-fast` / `-normal` / `-slow` | exist today | 120 / 200 / 320ms |
| `--m-motion-duration-enter` / `-exit` | entrances and exits | 240 / 160ms |
| `--m-motion-easing-standard` / `-emphasized` | exist today | |
| `--m-motion-easing-enter` / `-exit` | entrances decelerate, exits accelerate | |
| `--m-motion-enter-transform` | the motion style: `translateY(0.5rem)` (slide), `scale(0.98)` (scale) or `none` (fade) | `translateY(0.375rem)` |
| `--m-motion-stagger` / `--m-motion-stagger-max` | delay per item, and the cap | 40ms / 320ms |
| `--m-motion-route` | page transition: `fade` or `slide` (read by `navigate()`; CSS uses the next two) | fade |
| `--m-motion-route-duration` | | 200ms |
| `--m-skeleton-animation` | `m-shimmer`, `m-pulse` or `none` | `m-shimmer` |
| `--m-skeleton-bg` / `-highlight` / `-radius` / `-block-radius` | exist today | |
| `--m-loader-stroke` | the spinner's weight | 2px |
| `--m-chart-1` … `--m-chart-5` | series colours, from `charts.categorical` | |
| `--m-chart-stroke` / `--m-chart-bar-radius` / `--m-chart-draw` | line weight, bar corners, draw-on time | 2px / 2px / 600ms |

## For Ensemble's agent and new projects

- **The agent (Loom):** writes the markup above by default. Every list and card region has a loading state shaped like it, actions that wait use `data-busy`, new content enters, and charts come from `chart()`. `design_reference` reads `dist/catalog.json`.
- **New projects (Juno):** the copy-in brings `dist/motion.css`, `dist/motion.js` and `dist/charts.js` into `src/design/motion/`, adds their shas and the package version to `kit.json`, and the starter imports the CSS and calls `enhance()` once.
- **The checks:** the fingerprint probe gains `loading.skeleton`, `motion.enter` and `charts.animated`, and the rebuild gate fails a one-shot build without them.
