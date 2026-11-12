# Design library

`@mariachi/design` is tokens and CSS for any web app: React, Vue, Svelte, server-rendered HTML, or
none. Every preset satisfies one token contract, so switching designs is one attribute, and changing
one thing is one line. Status: **alpha**. Browse every component and preset in the explorer
([explorer.md](./explorer.md)), and see [design-catalog.md](./design-catalog.md) for the generated list.

## Use it

```html
<link rel="stylesheet" href="node_modules/@mariachi/design/dist/css/mariachi.css">
<link rel="stylesheet" href="node_modules/@mariachi/design/dist/css/themes/minimal.css">

<html data-theme="minimal" data-mode="auto">
  <button class="m-button" data-variant="primary">Save</button>
</html>
```

With a bundler, import `@mariachi/design/mariachi.css` and `@mariachi/design/themes/<preset>.css`, or
only what you use: `@mariachi/design/base.css` plus `@mariachi/design/components/<name>.css`.

- `data-theme` picks the preset. Nest another `data-theme` to restyle a region.
- `data-mode` is `auto` (follows the OS), `light` or `dark`. Put it on the element that carries
  `data-theme`.
- The element with `data-theme` paints its own canvas, text colour and font.

## Presets

| Preset | Character |
| --- | --- |
| `minimal` | Neutral greys, one blue accent, 6px radius, soft shadows. The default. |
| `brutalist` | No radius, thick borders, hard offset shadows, uppercase headings, a loud accent. |
| `editorial` | Serif headings, warm paper, ink-blue accent, hairline rules, no shadows. |
| `soft` | Pastels, pill controls, large radius, diffuse shadows, rounded type. |
| `enterprise` | Dense (density 0.85), small radius, compact type, strong tables. |
| `terminal` | Monospace everywhere, square corners, no shadows, phosphor-green dark mode. |
| `halcyon` | Light type on white, a blue-violet accent, pill actions, ring-shadowed cards. A design language (below). |
| `fennel` | Near-black on white, forest-green controls, one lime pill, heavy condensed capitals. A design language. |
| `basalt` | Near-black on warm off-white, square hairline panels, an electric lime primary. A design language. |
| `ember` | Deep navy on pale mint, white rounded cards, one clear blue, heavy wide headings. A design language. |
| `cirrus` | Navy on cool off-white, 20px panels, one clear blue, tinted capital pills. A design language. |
| `zephyr` | Black screens and charcoal cards, a neon lime for gains and the primary pill, orange-red for losses, solid pills and price chips. A design language. |
| `onyx` | Near-black on a pale grey screen, white 16px widgets, one blue-violet action, heavy headings, huge balances, pill and round buttons. A design language. |
| `terracotta` | Ink on white, a coral-magenta action colour, rounded photo cards, a pill search bar, soft lifted panels and underlined links. A design language. |
| `marigold` | White screens with grey 2px outlines, a bright green action, sky-blue selection, rounded heavy type and chunky buttons on a darker lip. A design language. |
| `linen` | A pale blue-grey list sidebar beside a white page, bold titles, small rounded checkboxes, blue headings over a hairline, outlined tags and a soft charcoal dark mode. A design language. |
| `quill` | Ink-grey type on white, a graphite tag sidebar, one signature red, grey tag capsules, a red-edged selected note and round quiet chrome; a graphite dark mode with a calm blue. A design language. |
| `folio` | Near-black ink on a white page, a warm off-white sidebar, hover-only controls, tinted callouts and tag pills, one blue action. A design language. |
| `broadsheet` | Graphite ink on white, a serif for the words and a grotesque for the chrome, one bright orange for subscribing, 8px corners and hairlines. A design language. |
| `obsidian` | Near-black panels a step apart, a muted indigo action, a small dense type scale, hairlines and a command menu. A design language. |
| `carbon` | Near-black panels, white text, a red-orange brand glow, light-grey actions, 40px list rows and key caps for every shortcut. A design language. |
| `cadence` | Near-black 8px panels in a black frame, a bright green for play and on, white pills, huge bold titles, cover-art tiles and dense track lists. A design language. |
| `mosaic` | Ink on white, one bold red for saving, grey and black pills, 16px image tiles in a masonry grid and 32px dialogs. A design language. |
| `bazaar` | Warm ink on white, a light serif for headings, an orange brand mark, black pill buttons, outlined secondaries, 12px cards and listing cards with black stars and green sale prices. A design language. |
| `transit` | Black on white, big bold headings, 8px controls on a grey fill, black actions and one blue for focus. A design language. |
| `hearth` | Layered near-black greys, a blue-violet accent, rounded bold type, round avatars beside grouped messages, presence dots and role colours. A design language. |
| `harbor` | Near-black on white, warm off-white panels, one fresh green, pill buttons and chips, tailed bubbles on a warm wallpaper and blue read ticks. A design language. |
| `prism` | A periwinkle frame around a white panel, soft rounded rows, a white current tile with a glow, tinted groups, a vivid blue and heavy tight headings. A design language. |
| `confetti` | Warm yellow-grey canvases, white hairline panels, an orange-red accent (brand yellow in dark), chunky ledge buttons and bold uppercase table headers. A design language. |
| `volt` | Black and white with one electric green, black pill buttons, white 20px cards on light grey, big tight headlines and bold amounts. A design language. |
| `sprint` | Near-black on white, huge condensed uppercase display type, full-bleed media, black pill actions and one signature orange. A design language. |
| `summit` | Warm near-black on off-white, a signature orange, bold compact type, white 4px cards, stats rows with big figures and small units. A design language. |
| `solace` | Charcoal on white and warm off-white, a sunny orange brand, one bright blue action, bold rounded type, pill buttons and a midnight-blue night mode. A design language. |
| `heather` | Charcoal ink on white, one clear blue, 12px buttons, 16px hairline cards and video frames, pale-blue time chips and a charcoal dark mode. A design language. |
| `saffron` | A sunny yellow brand stripe, deep teal actions, graphite on white, a sturdy serif for figures and a plain grotesque for the rest. A design language. |
| `nocturne` | Night-blue scenes, white type, rounded tiles with durations, white pill actions and a soft violet brand; light pages in deep-plum ink. A design language. |
| `vellum` | White pages, grey grouped panels, a sky-blue signature, pill actions, an entry timeline with big date numerals, and a true black dark mode. A design language. |
| `chalk` | Black ink on white panes, a system-grey sidebar, white inset groups on grey, one clear blue, a warm signature yellow, round coloured list icons and a true-black dark mode. A design language. |
| `ochre` | Ink on ivory, warm greys, serif headings and reading text, ink actions, a clay brand colour and a warm near-black dark mode. A design language. |
| `margin` | Slate ink on white, a pale grey rail, a calm serif for documents, yellow highlights, soft grey pill buttons, one restrained blue and a deep slate dark mode. A design language. |
| `quire` | Ink on white pages over a pale grey window, capsule buttons, tinted blocks, page cards with soft covers, one clear blue and a true-black dark mode. A design language. |
| `meridian` | Black and white on a ten-step grey scale, hairline rings, 6px corners, dense 14px lists, status dots, mono for hashes and logs, and blue only for focus and links. A design language. |
| `flint` | Neutral near-black panels, compact 12–13px type, hairlines, small radii, an inverted primary, green and red diffs and an agent composer. A design language. |
| `comet` | Warm greys, one muted purple, light grotesque type, big split tabs with counts, generous one-line rows and a command menu. A design language. |
| `marquee` | A near-black canvas, one signature red, rounded hero billboards with white and grey pills, rows of rounded posters that grow on hover, rating boxes, red progress bars and plain light account pages. A design language. |
| `reel` | A cool blue-grey dark canvas, tight poster grids, a green for the main action, orange likes, blue lists, star ratings, tracked uppercase headings and serif titles. A design language. |
| `aria` | White pages and a true dark mode, a pale sidebar library with blue glyphs, square artwork everywhere, bold large titles, black pills, hairline track lists and a floating capsule player. A design language. |

## Design languages

A design language is a complete visual system an app is built from: a preset plus everything an
agent needs to build a cohesive app with it. Each is taken faithfully from one real product's
visual system, measured rather than invented, under an abstract name; no logos, illustrations,
copied assets or proprietary fonts (the closest open font stands in). `archetypes` (exported, and in
`catalog.json`) lists them; `categories` groups them for browsing. Each has:

- **its preset**, of the same name (`halcyon`), extended from a base preset;
- **a category and search tags:** the feel, density, light or dark first, the kinds of apps it
  suits and visible traits. The catalog adds `keywords`, every searchable word in one list;
- **a discovery card:** who it's for, a one-sentence pitch and swatches (token paths, resolved to
  light and dark values in the catalog);
- **type, icons, charts and density:** open fonts by name, the icon rule, a categorical chart
  palette, and the density for data-heavy tools;
- **an icon for every common action** (add, edit, delete, settings, search, filter, more, close,
  …), by Lucide name, with the stroke and sizes;
- **seven layout recipes** (`dashboard`, `list-detail`, `onboarding`, `settings`, `empty-state`,
  `pricing`, `errors`) as framework-free HTML using only the library's classes and tokens, following
  the language's real screen patterns. The catalog holds the HTML, and
  `@mariachi/design/archetypes/<id>/recipes/<name>.html` is each one as a page;
- **`DESIGN.md`**, the language in words: principles, foundations, type, icons, charts, the states of
  every control, all 36 components, error handling, page shapes, and do and don't. A **reference**
  generated from the preset is appended: the actual type and spacing scales, layout and density,
  radius, shadows, motion, every colour in light and dark, and the icon map. It ships at
  `@mariachi/design/archetypes/<id>/DESIGN.md`, and a project copies it to `docs/design.md`;
- **a gallery**, `@mariachi/design/archetypes/<id>/gallery.html`, generated from the preset:
  - the foundations and the icons;
  - every control in every state (default, hover, focus, pressed, disabled, error, loading);
  - errors, loading and empty patterns;
  - all 36 components with every example.

  Add `data-mode="dark"` on the root for dark. Hover, focus and pressed are drawn with the
  components' own rules, through `archetypes/gallery.css`, which only the galleries load.

| Language | Category | Character |
| --- | --- | --- |
| `halcyon` | Calm fintech | Airy and exact: light type, one blue-violet accent, pill actions, figures with raised cents |
| `fennel` | Calm fintech | Plain and confident: forest-green controls, one bright lime pill, soft green-grey fills, heavy capitals |
| `basalt` | Calm fintech | Flat and exact: square hairline panels on warm off-white, one electric lime action |
| `ember` | Calm fintech | Friendly and plain: white rounded cards on pale mint, navy type, one clear blue |
| `cirrus` | Calm fintech | Bright and friendly: rounded hairline panels, one clear blue, tinted category pills |
| `zephyr` | Bold and fast | Fast and high-contrast: black screens and charcoal cards, a neon lime for gains and the primary pill, orange-red for losses, solid pills and price chips |
| `onyx` | Bold and fast | Bold and fast: near-black on a pale grey screen, white 16px widgets, one blue-violet action, heavy headings, huge balances, pill and round buttons |
| `terracotta` | Warm and friendly | Warm and image-forward: ink on white, a coral-magenta action colour, rounded photo cards, a pill search bar, soft lifted panels and underlined links |
| `marigold` | Warm and friendly | Bright and encouraging: white screens with grey 2px outlines, a bright green action, sky-blue selection, rounded heavy type and chunky buttons on a darker lip |
| `linen` | Calm and minimal | Calm and quiet: a pale blue-grey list sidebar beside a white page, bold titles, small rounded checkboxes, blue headings over a hairline, outlined tags and a soft charcoal dark mode |
| `quill` | Calm and minimal | Calm and bookish: ink-grey type on white, a graphite tag sidebar, one signature red, grey tag capsules, a red-edged selected note and round quiet chrome; a graphite dark mode with a calm blue |
| `folio` | Editorial and warm-neutral | Document-first and warm-neutral: near-black ink on a white page, a warm off-white sidebar, hover-only controls, tinted callouts and tag pills, one blue action |
| `broadsheet` | Editorial and warm-neutral | Reading first: graphite ink on white, a serif for the words and a grotesque for the chrome, one bright orange for subscribing, 8px corners and hairlines |
| `obsidian` | Dark and sharp | Dark-first and exact: near-black panels a step apart, a muted indigo action, a small dense type scale, hairlines and a command menu |
| `carbon` | Dark and sharp | Dark and exact: near-black panels, white text, a red-orange brand glow, light-grey actions, 40px list rows and key caps for every shortcut |
| `cadence` | Content-first and immersive | Dark-first and content-first: near-black 8px panels in a black frame, a bright green for play and on, white pills, huge bold titles, cover-art tiles and dense track lists |
| `mosaic` | Content-first and immersive | Pictures first: ink on white, one bold red for saving, grey and black pills, 16px image tiles in a masonry grid and 32px dialogs |
| `bazaar` | Marketplace and commerce | Handmade marketplace: warm ink on white, a light serif for headings, an orange brand mark, black pill buttons, outlined secondaries, 12px cards and listing cards with black stars and green sale prices |
| `transit` | Marketplace and commerce | Stark and direct: black on white, big bold headings, 8px controls on a grey fill, black actions and one blue for focus |
| `hearth` | Social and messaging | Dark-first community chat: layered near-black greys, a blue-violet accent, rounded bold type, round avatars beside grouped messages, presence dots and role colours |
| `harbor` | Social and messaging | A messenger on the desktop: near-black on white, warm off-white panels, one fresh green, pill buttons and chips, tailed bubbles on a warm wallpaper and blue read ticks |
| `prism` | Playful and quirky | Playful and colourful: a periwinkle frame around a white panel, soft rounded rows, a white current tile with a glow, tinted groups, a vivid blue and heavy tight headings |
| `confetti` | Playful and quirky | Playful and dense: warm yellow-grey canvases, white hairline panels, an orange-red accent (brand yellow in dark), chunky ledge buttons and bold uppercase table headers |
| `volt` | Bold and fast | Loud and fast: black and white with one electric green, black pill buttons, white 20px cards on light grey, big tight headlines and bold amounts |
| `sprint` | Bold and fast | Athletic and stark: near-black on white, huge condensed uppercase display type, full-bleed media, black pill actions and one signature orange |
| `summit` | Bold and fast | Sporty and loud: warm near-black on off-white, a signature orange, bold compact type, white 4px cards, stats rows with big figures and small units |
| `solace` | Warm and friendly | Warm and soothing: charcoal on white and warm off-white, a sunny orange brand, one bright blue action, bold rounded type, pill buttons and a midnight-blue night mode |
| `heather` | Warm and friendly | Friendly and clean: charcoal ink on white, one clear blue, 12px buttons, 16px hairline cards and video frames, pale-blue time chips and a charcoal dark mode |
| `saffron` | Warm and friendly | Warm and plain-spoken: a sunny yellow brand stripe, deep teal actions, graphite on white, a sturdy serif for figures and a plain grotesque for the rest |
| `nocturne` | Calm and minimal | Dark-first and gentle: night-blue scenes, white type, rounded tiles with durations, white pill actions and a soft violet brand; light pages in deep-plum ink |
| `vellum` | Calm and minimal | A quiet journal: white pages, grey grouped panels, a sky-blue signature, pill actions, an entry timeline with big date numerals, and a true black dark mode |
| `chalk` | Calm and minimal | Native and calm: black ink on white panes, a system-grey sidebar, white inset groups on grey, one clear blue, a warm signature yellow, round coloured list icons and a true-black dark mode |
| `ochre` | Editorial | Warm and editorial: ink on ivory, warm greys, serif headings and reading text, ink actions, a clay brand colour and a warm near-black dark mode |
| `margin` | Editorial | Reading first: slate ink on white, a pale grey rail, a calm serif for documents, yellow highlights, soft grey pill buttons, one restrained blue and a deep slate dark mode |
| `quire` | Editorial | A calm document editor: ink on white pages over a pale grey window, capsule buttons, tinted blocks, page cards with soft covers, one clear blue and a true-black dark mode |
| `meridian` | Dark and sharp | Stark and exact: black and white on a ten-step grey scale, hairline rings, 6px corners, dense 14px lists, status dots, mono for hashes and logs, and blue only for focus and links |
| `flint` | Dark and sharp | Dark-first and sharp: neutral near-black panels, compact 12–13px type, hairlines, small radii, an inverted primary, green and red diffs and an agent composer |
| `comet` | Dark and sharp | Fast and focused: warm greys, one muted purple, light grotesque type, big split tabs with counts, generous one-line rows and a command menu |
| `marquee` | Content-first | Dark-first and content-first: a near-black canvas, one signature red, rounded hero billboards with white and grey pills, rows of rounded posters that grow on hover, rating boxes, red progress bars and plain light account pages |
| `reel` | Content-first | Slate and posters: a cool blue-grey dark canvas, tight poster grids, a green for the main action, orange likes, blue lists, star ratings, tracked uppercase headings and serif titles |
| `aria` | Content-first | Content-first and glassy: white pages and a true dark mode, a pale sidebar library with blue glyphs, square artwork everywhere, bold large titles, black pills, hairline track lists and a floating capsule player |

Tests hold each language to its preset's contrast pairs in both modes, a known category and its
tags, all seven recipes, recipe markup that uses only known classes and tokens (no colour literals),
the `DESIGN.md` sections with every component specified, a drawable icon for every action, and a
gallery with every component and state.

## Markup contract

- Components are classes prefixed `m-` (`.m-button`, `.m-card`). Parts are `.m-<component>-<part>`
  (`.m-card-header`, `.m-toast-title`).
- Options are data attributes: `data-variant`, `data-size` (`sm | md | lg`), `data-tone`
  (`neutral | accent | success | warning | danger | info`).
- State comes from HTML and ARIA, not classes: `disabled`, `aria-invalid`, `aria-selected`,
  `aria-current="page"`, `aria-busy`, `[open]`.
- Native elements first: `<dialog>`, `popover`, `<details>`, native form controls.

Never invent classes. If something is missing, compose components with the layout primitives
(`m-stack`, `m-cluster`, `m-grid`, `m-split`, `m-container`) or add a component (see
[recipes/add-design-component.md](./recipes/add-design-component.md)).

## Override anything, at any size

Every visual property in component CSS reads a token, and everything sits in cascade layers:

```css
@layer mariachi.reset, mariachi.theme, mariachi.base, mariachi.components, mariachi.overrides;
```

Your own unlayered CSS beats every layer, so overrides need no specificity tricks. If your app uses
layers too, put overrides in `mariachi.overrides`.

| Level | How | Example |
| --- | --- | --- |
| 1. One token, everywhere | a custom property on `:root` | `:root { --m-color-accent-default: oklch(0.62 0.19 25); }` |
| 2. One component | its component token | `:root { --m-button-radius: 999px; }` |
| 3. One variant or one area | a scoped rule | `.marketing .m-card { --m-card-shadow: none; }` |
| 4. Replace a component | `replace` in `mariachi.design.ts` | `replace: { card: './src/styles/card.css' }` |
| 5. A whole preset | `extendTheme` | `extendTheme(minimal, { name: 'acme', tokens: { … } })` |

Component tokens fall back to semantic tokens on the component's own element, so a scoped semantic
override (`.marketing { --m-color-accent-default: … }`) reaches every component inside `.marketing`.
Semantic tokens that alias other semantic tokens (`--m-radius-control` → `--m-radius-md`) resolve where
the theme is applied; override the token components read (`--m-radius-control`) when you scope.

### `mariachi.design.ts`

Levels 4 and 5, plus choosing components, go in a typed config:

```ts
import { defineDesign } from '@mariachi/design';

export default defineDesign({
  base: 'minimal',                        // a preset name or a theme from extendTheme
  include: ['button', 'input', 'card'],   // dependencies are added automatically
  tokens: { color: { accent: { default: { light: 'oklch(0.55 0.2 260)', dark: 'oklch(0.72 0.16 260)' } } } },
  components: { button: { radius: '999px' } },
  replace: { card: './src/styles/card.css' },
});
```

```bash
mariachi design build -o src/styles/design.css   # base CSS, chosen components, base theme, and only the changed tokens
mariachi design check                           # unknown tokens and contrast; exits 1 on failures
```

`buildDesign()` from `@mariachi/design/build` does the same from code. Unknown tokens, components and
presets throw `DesignError` with a code (`design/invalid-config`, `design/unknown-component`,
`design/unknown-preset`).

### Your own preset

```bash
mariachi design new-theme acme --from soft      # writes src/styles/acme.theme.ts
```

```ts
import { extendTheme, soft } from '@mariachi/design';

export const acme = extendTheme(soft, {
  name: 'acme',
  tokens: { color: { accent: { default: 'oklch(0.55 0.2 30)' } } },
});
```

A partial per-mode value (`{ dark: '…' }`) changes one mode and keeps the other. `defineTheme()` defines
a preset from scratch and must give every required token. See
[recipes/add-design-preset.md](./recipes/add-design-preset.md) for adding a built-in preset.

The [explorer's playground](./explorer.md) edits tokens live, re-checks contrast, and writes the
override CSS or the config for you.

## Tokens

- **Semantic tokens** (`--m-color-bg-surface`, `--m-radius-control`, `--m-space-4`): what every preset
  defines. Colours, the sans font stack, the radius scale and shadows are required; spacing, type scale, motion
  and z-index have defaults.
- **Component tokens** (`--m-button-radius`, `--m-card-shadow`): each defaults to a semantic token. A
  preset sets one only when that component should differ.
- The CSS name is the token path in kebab case under `--m-` (`color.bg.surface` →
  `--m-color-bg-surface`; `components.button.paddingX.md` → `--m-button-padding-x-md`).
- Colour values can be one value or `{ light, dark }`.
- **Brand colour** (`color.brand.default`, `.fg`, `.subtle`; Tailwind `bg-brand`, `text-brand-fg`): a
  brand's signature colour when it isn't the action colour, such as a lime or a coral, for hero
  bands, logo marks and brand panels. It defaults to the accent, so a preset sets it only when its
  brand differs. It's checked as text on the brand (`brand.fg`) and text on its tint, never against
  the page, because it's not for controls or text.
- `@mariachi/design/tokens/<preset>.json` is the preset in W3C Design Tokens (DTCG) format, for
  Figma (Tokens Studio) and other tools.
- `@mariachi/design/tailwind.css` maps Tailwind v4's theme onto the tokens: `@import "tailwindcss";`,
  then this file and a preset theme. `bg-surface`, `text-fg-muted`, `rounded-control` and spacing
  utilities follow the active preset.

## Accessibility

- Every preset passes the contrast pairs in the contract in both modes: 4.5:1 for text, 3:1 for
  borders and focus rings. Components add their own pairs. `checkTheme()` and `mariachi design check`
  run the same pairs on your overrides.
- `--m-control-min-target` (24px) keeps pointer targets and their spacing at WCAG 2.5.8 size even in
  dense presets.
- Under `prefers-reduced-motion: reduce`, every duration token is 0ms.
- Each component documents its accessibility contract (labels, roles, ARIA) in the explorer and the
  catalog.

## Behaviours (optional)

Most components need no JavaScript. `@mariachi/design/behaviors` adds what CSS can't, delegated from
one root so later markup works too:

```ts
import { enhance, toast } from '@mariachi/design/behaviors';

enhance(); // tabs and menus (keyboard), dialog openers, copy buttons, auto-growing composer
toast({ title: 'Saved', tone: 'success' });
```
