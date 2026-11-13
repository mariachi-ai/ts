# Design fingerprint: the measures

A design library's fingerprint is a product's habits, measured on its rendered screens: how many text sizes a screen uses, how areas are separated, how tall a row is, how much of a screen carries the accent. This file defines every measure precisely enough that two runs on the same screens give the same numbers. It is the one spec shared by:

- the measuring probe;
- the agent's prompt, which never estimates these numbers from screenshots;
- `fingerprint.json` and `checks.json` (schemas at the end).

The playbook that uses it is [design-playbook.md](./design-playbook.md).

Measures are versioned. A change to a definition bumps `specVersion`, and fingerprints from different versions aren't compared.

**specVersion: 1**

## Rendering

| Setting | Value |
| --- | --- |
| Widths | `wide` 1440 × 900, `narrow` 1024 × 768, `phone` 390 × 844, at device pixel ratio 1 |
| Mode | The library's own mode: dark for a dark-first language or product (`data-mode="dark"` or the product's own switch), otherwise light |
| Motion | No preference, so declared motion can be read; the probe waits for running animations to finish |
| Settled | Fonts loaded (`document.fonts.ready`), no network request for 500 ms, running animations finished (or 1 s), then 300 ms more |
| The window | The first viewport, scrolled to the top |
| The page | The whole document |

Every measure is taken **in the window** unless it says **page**.

## Sets of elements

These definitions are used by the measures below.

- **Left out:** cookie and consent notices (a fixed or sticky element whose text mentions cookies, consent or privacy choices) and everything inside them. They're never answered or removed; the probe just doesn't count them.

- **Visible:** a box with width and height greater than 0, `visibility` not `hidden`, and `opacity` greater than 0. `aria-hidden` doesn't matter: decorative icons and pictures are still seen.
- **Text run:** a non-empty text node (after trimming) whose parent is visible. Its size is the parent's computed `font-size`, rounded to 0.5 px. Its weight is the parent's `font-weight`. Its length is its character count.
- **Body size:** the font size that carries the most characters in the window.
- **Control:** `a[href]`, `button`, `input` (except hidden), `select`, `textarea`, `summary`, or an element with role `button`, `link`, `tab`, `checkbox`, `radio`, `switch`, `menuitem` or `option`.
- **Container:** a visible element that isn't a control, is at least 80 × 32 px, and has at least one visible child.
- **Separated container:** a container separated from its surroundings by one or more of the following.
  - `border`: all four borders drawn (width > 0, style not `none`, colour alpha > 0).
  - `shadow`: `box-shadow` not `none`.
  - `tint`: its background colour differs from its nearest ancestor's effective background by ΔE2000 ≥ 2.
  - `divider`: a top or bottom border only, at least half its parent's width.
- **Media:** `img`, `video`, `canvas`, a `picture`, or an element with a `background-image`, at least 48 × 48 px and with no text inside. A box at least 95% of the window wide and 60% of it high is a backdrop, not media.
- **Icon:** an `svg` (or an `img` of an SVG) of at most 32 × 32 px.
- **Collection:** a parent (not inside an `svg`) with at least three visible children that share a tag and a first class name. It's a `list` when the children stack in one column, a `grid` when they sit in two or more columns and two or more rows, a `table` for `tbody` rows, and a `carousel` when its `scrollWidth` exceeds its `clientWidth` by more than 8 px with one row.
- **Main column:** the element containing the largest share of the window's text characters that has at least three block children, excluding `nav`, `aside`, `header` and `footer`.
- **Accent:** the product's action colour as drawn: the fill of its declared primary button (`.m-button[data-variant="primary"]`) when one is on the screen; otherwise the most common fill with OKLCH chroma > 0.1 on controls; otherwise `--m-color-accent-default`.
- **Fill:** an element's background colour; when that's transparent, the first colour stop of its background gradient; for a control, failing both, the background of an absolutely positioned `::before` that draws its face.
- **Primary action:** a control whose fill is within ΔE2000 5 of the accent, or the product's declared primary (`.m-button[data-variant="primary"]`).

## The measures

Each measure has an id, its unit, and how it's computed. A value is recorded per screen and per width. `fingerprint.json` then gives each measure's typical value (the median), its range (10th to 90th percentile) and the same by kind of screen.

### Type

| Id | Unit | Computed |
| --- | --- | --- |
| `type.sizes` | count | Distinct font sizes carrying at least 3 characters |
| `type.headingRatio` | ratio | Largest font size ÷ body size |
| `type.weights` | count | Distinct font weights carrying at least 3 characters |
| `type.lineLength` | characters | Median over paragraphs at body size with at least 2 lines: characters ÷ lines (lines = height ÷ line height) |
| `type.headingEmphasis` | shares | Over headings (`h1`–`h6` and runs ≥ 1.2 × body size), the share made distinct by: `size` (≥ 1.2 × body), `weight` (≥ body weight + 200), `colour` (ΔE2000 ≥ 10 from body text), `space` (space above ≥ 1.5 × the median gap between paragraphs). One heading can count in several |

### Space

| Id | Unit | Computed |
| --- | --- | --- |
| `space.empty` | share | Lay an 8 px grid over the window. A cell has ink when it touches a text line box, media, a control, an icon or a drawn border or shadow edge. Empty = 1 − ink cells ÷ all cells |
| `space.steps` | px, shares | Every vertical gap between consecutive visible block siblings, and every container padding, snapped to the nearest step of the product's spacing scale (or to 4 px where it has none). Gives each step's share |
| `space.sectionRatio` | ratio | Median gap between the main column's children ÷ median gap between siblings inside them |
| `space.contentWidth` | share | The width of the union of text boxes in the main column ÷ the window width |
| `space.contentWidthPx` | px | The same width in px |
| `space.gutter` | px | Distance from the window's left edge to the main column's first text box |

### Density

| Id | Unit | Computed |
| --- | --- | --- |
| `density.elements` | count | Visible leaf elements (no visible element children) intersecting the window |
| `density.targets` | count | Controls intersecting the window |
| `density.rowsVisible` | count | Per `list` or `table` collection: items intersecting the window. Median over collections |
| `density.rowHeight` | px | Median item height over `list` and `table` collections |

### Structure

| Id | Unit | Computed |
| --- | --- | --- |
| `structure.depth` | count | The deepest nesting of separated containers (a card in a panel in a page is 2 separated levels) |
| `structure.separation` | shares | Over separated containers: `border`, `shadow`, `tint`, `divider` (a container can count in two). Also `space`: the share of collections whose items aren't separated containers |
| `structure.columns` | count | Side-by-side top-level blocks in the main column at least 120 px wide (distinct left edges ±8 px), per width |
| `structure.collections` | shares | Collections by kind: `list`, `grid`, `table`, `carousel` |

### Colour

| Id | Unit | Computed |
| --- | --- | --- |
| `colour.accentArea` | share | Area of elements whose background is the accent, plus text boxes whose colour is the accent, ÷ the window area |
| `colour.accentOn` | shares | The accent's elements by kind: `primary`, `link`, `badge`, `icon`, `selection`, `other` |
| `colour.hues` | count | Distinct hues (12 bins of 30° of OKLCH hue) among saturated colours (OKLCH chroma > 0.08) covering at least 0.2% of the window |
| `colour.meaning` | share | The share of saturated area (OKLCH chroma > 0.08) that's on status elements (`[role=status]`, `[role=alert]`, badges, alerts) |

### Shape

| Id | Unit | Computed |
| --- | --- | --- |
| `shape.radiusBySize` | px | Median `border-radius` of separated containers and controls by height: < 40, 40–120, 120–400, > 400 px |
| `shape.borderAndShadow` | shares | Over separated containers: border only, shadow only, both |

### Emphasis

| Id | Unit | Computed |
| --- | --- | --- |
| `emphasis.primaries` | count | Primary actions in the window |
| `emphasis.primariesPage` | count | Primary actions on the **page** |
| `emphasis.primaryAt` | shares | Where each primary action sits: one of the nine cells of a 3 × 3 grid over the window, plus `pinned` (a sticky or fixed ancestor) and `inRow` (inside a collection item) |
| `emphasis.primaryWidth` | share | Primary action width ÷ its parent's width |
| `emphasis.destructive` | label | How a control labelled delete, remove, cancel subscription, or with a danger colour, is drawn: `dangerFill`, `dangerText`, `plain` |

### Icons and pictures

| Id | Unit | Computed |
| --- | --- | --- |
| `icons.size` | px | Median icon width |
| `icons.labelled` | share | Icons inside a control that also shows text ÷ icons inside controls |
| `media.area` | share | Media area in the window ÷ the window area |
| `media.role` | label | From the largest media box: `none` (no media), `thumb` (< 15% of the main column's width), `inset` (< 50%), `leads` (≥ 50%), `fullBleed` (≥ 95% of the window width) |
| `media.aspect` | ratio | Width ÷ height of the largest media box |

### Motion

| Id | Unit | Computed |
| --- | --- | --- |
| `motion.durations` | ms | Non-zero `transition-duration` and `animation-duration` values on visible elements, as a histogram. It's static: what's declared |
| `motion.properties` | names | The properties in `transition-property`, by count |

### Words

| Id | Unit | Computed |
| --- | --- | --- |
| `words.headingLength` | words | Median words per heading |
| `words.case` | shares | Headings and button labels in `sentence`, `title` or `upper` case (a label of one word counts as sentence case) |
| `words.buttonLength` | words | Median words per button label |
| `words.person` | per 1,000 words | "you" and "your", and "we", "our" and "us", on the **page** |
| `words.formats` | labels | The formats found for dates, times, money and large numbers, by count |

Words are only measured on a real product. A language's own recipes carry invented content, so its words are told (in DESIGN.md), not measured.

### States

States aren't measured on ordinary screens. The inventory includes screens of kind `empty`, `loading` and `error`. For each, the probe records `states.centred` (1 when the main column's centre is within 10% of the window's centre on both axes, else 0; measured on every screen), `media.role`, `emphasis.primaries` and `type.sizes`. `states.consistent` is the share of those screens that match the most common combination.

## Kinds of screen

Every screen in the inventory has one kind: `list`, `detail`, `form`, `dashboard`, `settings`, `dialog`, `firstUse`, `empty`, `error`, `loading`, `marketing`. A language's seven recipes map to them as:

| Recipe | Kind |
| --- | --- |
| `dashboard` | dashboard |
| `list-detail` | list and detail |
| `onboarding` | firstUse |
| `settings` | settings |
| `empty-state` | empty |
| `pricing` | marketing |
| `errors` | error |

## `fingerprint.json`

```json
{
  "specVersion": 1,
  "library": "terracotta",
  "source": { "mode": "language | existing | url | project", "commit": "…", "measuredAt": "2026-11-13T00:00:00Z" },
  "screens": [{ "id": "list-detail", "kind": ["list", "detail"], "widths": ["wide", "narrow", "phone"] }],
  "measures": {
    "type.sizes": {
      "unit": "count",
      "typical": 4,
      "range": [3, 5],
      "n": 21,
      "byKind": { "list": { "typical": 4, "range": [4, 5], "n": 3 } },
      "byWidth": { "phone": { "typical": 3, "range": [3, 4], "n": 7 } },
      "evidence": "observed"
    }
  }
}
```

- **Shapes.** A measure whose value is a set of shares or labels has `typical` as an object (share per key) and no `range`.
- **Evidence.** It's `observed` for anything the probe measured.
- **Missing values.** A measure that couldn't be taken on a screen (no paragraphs, so no line length) is left out for that screen. It's never recorded as 0.

## `checks.json`

```json
{
  "specVersion": 1,
  "library": "terracotta",
  "checks": [
    {
      "id": "type.sizes",
      "measure": "type.sizes",
      "normal": { "all": [3, 5], "byKind": { "dashboard": [4, 6] } },
      "message": "This screen uses {value} text sizes. Your screens use {low} to {high}."
    }
  ]
}
```

- **A check reports distance; it never fails.** The reviewer decides.
- **The normal range** is the fingerprint's range for that kind of screen when two or more distinct screens show that kind, falling back to `all`.
- **Which measures get a check:** only numbers measured on at least 5 screens with a clear range: the 10th percentile above 0 and the 90th within twice the 10th. A measure that varies freely, or sits at 0, carries no check.
- **The message** uses the product's own words for things where it has them ("rows", not "list items").

## Distance

A screen's distance from a library is the root mean square, over measures with a check, of:

- 0 when the value is inside the normal range;
- otherwise how far outside it is, divided by the spread of that measure across all of Mariachi's languages.

The distinctiveness check uses the same distance. Every language's own held-out screens should sit nearer to it than to any of the other languages.
