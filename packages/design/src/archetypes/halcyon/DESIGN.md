# Halcyon

Category: calm fintech. Airy and exact: ink-violet text on white, one blue-violet accent, light type
weights, pill-shaped actions, cards that float on a ring shadow, full-bleed hairline tables, and
figures with small raised cents. For money and finance tools that should feel quiet and modern.

This file is the design language in words. Follow it for anything visual. The tokens are in the
`halcyon` preset of `@mariachi/design` (`data-theme="halcyon"`, `themes/halcyon.css`). The six page
shapes are in `recipes/`, as HTML using only the library's classes.

## Principles

- **Light, not loud.** Type is light (360 for body, 380 for headings), colour is rare, and space does
  the work. Nothing is bold except what must be found at a glance.
- **One accent, used for the one action.** The blue-violet fills the primary pill and draws the
  chart line. Everything else is ink, grey and white.
- **Exact figures.** Amounts use tabular figures with the cents small and raised. Incoming money is
  green; outgoing money is ink with a minus sign, not red.
- **Quiet structure.** Cards float on a soft ring shadow with no drawn border. Tables and settings are
  separated by hairlines, not boxes.

## Tokens (what differs from minimal)

| What | Light | Dark |
| --- | --- | --- |
| Canvas and surfaces | white `#ffffff`; the sidebar `#fbfcfd` | `#171721`, cards `#1e1e2a` |
| Text: default, muted, subtle | `#1e1e2a`, `#535461`, `#70707d` | `#ededf3`, `#c3c3cc`, `#9d9da8` |
| Hairlines | `#e8e9ef` (the neutral at 16%) | `#3b3c4b` |
| Accent | `#5266eb`; links and accent text `#465bd1` | `#5266eb`; text `#a7b6f8` |
| Gained | green `#036e43` | `#7fd3ab` |
| Lost or failed | deep magenta `#b0175f`, never red | `#f39cc3` |
| Neutral fill (secondary pills, hover, current nav) | `#f1f1f4` | `#2c2c3a` |
| Radius | 4px (badges, small), 8px (inputs, nav items), 12px (cards); every button a pill | same |
| Shadow | a ring: `0 0 2px` neutral halo + `0 1px 4px` soft drop; popovers add a long faint drop | a 1px ring |
| Motion | 150 / 300 / 500 ms, easing `cubic-bezier(0, 0, 0.6, 1)` (decelerate only) | same |

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. For dense data
screens set `--m-density: 0.85` on the page.

## Type

- **Inter** (variable) for text, at weight **360** for body and 420 for emphasis; **Inter Display**
  for headings and large figures at **380**. The light weights are the look: load the variable font
  (`@fontsource-variable/inter`) so 360 and 380 render as set.
- **Roboto Mono** for account numbers and codes, small.
- Body text is 15px with a 1.6 line height; secondary text and table headers 13px; labels 12px.
- Page titles are 28px display at 380. Marketing headings go to 42px and 57px, tight leading, never bold.
- Uppercase only for tiny section labels ("COMPARE PLANS"), tracked 6%.
- Figures: `font-variant-numeric: tabular-nums`; the cents at about 62% size, raised half an em
  (`$5,216,471.18`). Outgoing amounts take a real minus sign: `−$750.00`.

## Icons

- Lucide, outlined, **1.25px stroke**: 14px in navigation and buttons, 16px elsewhere. Never filled.
- Every sidebar item and most action pills carry an icon, set before the label.
- Up and down are small diagonal arrows (↗ green, ↘ magenta) beside the amount, never colour alone.

## Charts

- One series: a 1.5px accent line over a soft vertical fade of the accent (16% to 0%), no gridlines,
  date labels underneath in muted 13px.
- More series step through: blue-violet, periwinkle, teal, green, magenta.

## Components

- **Button.** Always a pill. Primary: solid accent, white text, one per view. Secondary: the neutral
  fill (`#f1f1f4`), ink text, no border. Ghost: text only, for quiet actions in bars ("Move money",
  "Customize"). Actions in a row are small pills with an icon each. Weight 360, never bold.
- **Input and select.** 8px radius, a hairline border, 36px high. Filters above a table are small
  selects in a row ("Date ▾", "Amount ▾").
- **Card.** White, 12px radius, no border, the ring shadow. Card titles are 15px at body weight, not
  headings. A card's main figure is 28px display.
- **Table.** Full-bleed: no outer frame, no header fill. Headers are 13px muted, sentence case.
  Rows are separated by hairlines and highlight in the sidebar tint on hover. Each party gets an
  initials avatar on a pale accent circle. Amounts right-aligned, green when money comes in; a failed
  one is struck through with an outlined magenta "Failed" badge.
- **Badge.** 4px radius, 12px text: a grey "Default", an outlined magenta "Failed", a solid ink "Pro".
- **Sidebar.** 220px on `#fbfcfd` with a hairline edge: workspace switcher at the top, a segmented
  product switch, then groups separated by hairlines. Items are 15px with a 14px icon; the current
  one has the neutral fill and an 8px radius. Counts sit right-aligned and muted; "New" is a badge.
- **Top bar.** No fill: a ghost "Search for anything" on the left; ghost actions, icon buttons and the
  avatar on the right.
- **Segmented control.** A pill track in the neutral fill; the selected segment is white.
- **Settings.** Not boxed forms: each setting is a row with its label (and a muted line of help) on
  the left and the value with an accent "Edit ›" link on the right, rows split by hairlines.

## Page shapes (recipes)

- **Dashboard.** "Welcome, Dana" at 28px. A row of small pills: the primary "Send" and secondary
  Transfer, Deposit, Request, Upload bill; "Customize" as a ghost on the right. A grid of cards: the
  balance with its area chart and up/down figures, the accounts list, then smaller summaries.
- **List and detail.** Title with a secondary pill on the right; filter selects in a row; the month's
  figures (net change, money in, money out) above a full-bleed table. A row opens its own page: a back
  link, the party's avatar and the amount large, then label-and-value rows split by hairlines.
- **Onboarding.** One 480px column, a thin progress bar, a light 42px heading, fields one under
  another, Back as a ghost button and Continue as the primary pill.
- **Settings.** A grouped settings nav (Company, Team, Security & controls) beside label-and-value
  rows with Edit links. Closing the account comes last, separated by a hairline, with a danger pill.
- **Empty state.** A 40px thin outline icon, a light 19px heading, one sentence, a primary pill and a
  secondary one.
- **Pricing.** A large light heading. One card split into three columns by hairlines (not three
  cards), with a tiny tracked "COMPARE PLANS" label and a yearly switch above, tier names whose last
  word is in the accent, prices in light display type, full-width pills (the middle one primary),
  check lists, and a tinted footer band with an arrow link. An FAQ below.

## Words

- Short and plain, sentence case everywhere: "Move money", "Match receipts", "Search for anything".
- Figures are exact; dates short ("Nov 11").

## Do and don't

| Do | Don't |
| --- | --- |
| Keep type light: 360 body, 380 headings | Use bold for headings or numbers |
| Make every button a pill | Square buttons, or outlined primary buttons |
| Float cards on the ring shadow | Draw card borders, or use heavy shadows |
| Separate rows with hairlines | Zebra stripes, filled table headers, boxed settings |
| Show gains in green, losses with a minus and ink | Use red for money going out |
| Set cents small and raised | Show amounts at one flat size in summaries |
