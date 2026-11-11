# Calm trust

For money, health, insurance: anything where people need to feel safe. Cool slate, one deep blue,
quiet surfaces and exact numbers.

This file is the design language in words. Follow it for anything visual. The tokens are in the
`calm-trust` preset of `@mariachi/design` (`data-theme="calm-trust"`, `themes/calm-trust.css`). The
six page shapes are in `recipes/`, as HTML using only the library's classes.

## Principles

- **Nothing surprises.** Every action that moves money or data says what will happen, in figures,
  before it happens.
- **Numbers are exact.** They're aligned, use tabular figures and are never decorative.
- **Colour means something.** Blue acts. Green and red only mean up or down, gained or lost, never
  decoration.
- **Quiet surfaces.** Structure comes from hairline borders and space, not from colour, shadow or
  boxes inside boxes.

## Tokens (what differs from minimal)

| What | Light | Dark |
| --- | --- | --- |
| Canvas, surface | near-white slate, white | `oklch(0.17 0.012 255)`, `oklch(0.205 0.014 255)` |
| Text, muted text | deep slate, mid slate | near-white, light slate |
| Accent (acts) | deep blue `oklch(0.48 0.13 255)` | `oklch(0.68 0.12 245)` |
| Success (gained) | teal-green | lighter teal-green |
| Danger (lost or failed) | red | lighter red |
| Radius | 4 / 8 / 12 px: controls 8, containers 12 | same |
| Shadows | soft and small, only for what floats or is clickable | none: borders carry it |
| Motion | 120 / 180 / 260 ms, no overshoot | same |

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. For data-heavy
screens (a back office), set `--m-density: 0.85` on the page rather than shrinking things by hand.

## Type

- Inter for everything, weight 600 and `-0.015em` tracking on headings.
- Geist Mono for account numbers, IDs and references (`INV-2041`, `···· 4821`).
- `font-variant-numeric: tabular-nums` on every amount. In tables, use `data-numeric` on the cell,
  which aligns right and sets tabular figures.
- Where currencies mix, never show a currency symbol alone: `€8,920.00 EUR`.
- Self-host the fonts (`@fontsource/inter`, `@fontsource/geist-mono`); no font CDN.

## Icons and imagery

- Lucide, outlined, 1.5 px stroke: 20 px beside body text, 16 px in controls. Never filled.
- Up and down always pair colour with a sign and an arrow: `↗ +$2,140.00`, never colour alone.
- Illustrations are simple and geometric, outlined in the muted text colour, at most one per empty
  state. No stock photos of people.

## Charts

- Categorical colours, in this order: deep blue, teal, amber, violet, slate (values in the catalog's
  `charts`). One series uses the accent alone.
- Up and down use success and danger with a sign and an arrow.
- Label axes plainly, and give every chart a text alternative that states the trend in figures.

## Components

- **Button.** One solid primary per view. Secondary is the default button; ghost for tertiary.
  No gradients. An action that moves money always has a text label, never an icon alone.
- **Field.** The label above, help text below. The error replaces the help text and says how to fix
  it. Controls are 40 px high.
- **Card.** A white surface with a hairline border and no shadow. A card gets a shadow on hover only
  when the whole card is clickable (`data-interactive`). No coloured card backgrounds.
- **Table.** A sunken header, sticky when the table scrolls, sentence-case headers. No zebra
  stripes; rows highlight on hover. Amounts right-aligned and tabular. Status as a badge.
- **Badge.** A subtle background and one word: Paid, Due, Overdue, Failed, Draft.
- **Dialog.** A confirm restates the effect in figures: "Send $1,200.00 to Acme Ltd on Nov 14".
  The destructive action is never the default focus.
- **Toast.** Only for a success that isn't already visible. Errors stay inline, where they happened.
- **Navigation.** A left sidebar in the app (240 px, collapsible); a top bar on public pages.

## Page shapes (recipes)

- **Dashboard.** A greeting line. A row of three or four figure cards (label, amount, change with
  sign and arrow). One primary chart, full width. Recent activity as a table of 5 to 8 rows with
  "See all". At most 1200 px wide.
- **List and detail.** Filters and search above a table. A row opens a detail **page** (not a
  drawer) with breadcrumbs, a header with the key figure and status, sections as cards, and the
  actions top right.
- **Onboarding.** One column, 480 px wide. A stepper of 3 to 5 steps, one question per step, saved
  as you go, Back always there, and why each piece of data is needed in one line under its field.
- **Settings.** Sections listed on the left (220 px). Each section is a card with its own Save.
  Closing the account comes last, in an outlined danger card that states what will happen.
- **Empty state.** A 48 px outlined illustration, one sentence on what goes here, one primary action
  and a "Learn how" link.
- **Pricing.** Three tiers. The middle one is marked by a border and a "Most chosen" badge, not a
  coloured fill. The yearly saving shown as a figure. Feature lists with check icons; an FAQ below.

## Words

- Plain and specific: "Paid", "Due tomorrow", "Your next payout is Monday, November 18".
- Say what happens, then do it: "Closing pays out your balance of $48,210.55, then cancels open
  invoices. It can't be undone."
- No jargon and no exclamation marks.

## Do and don't

| Do | Don't |
| --- | --- |
| Say what an action will do, in figures, before it does it | Use colour for decoration, or green and red for anything but up and down |
| Align numbers; use tabular figures | Animate numbers counting up |
| Keep one primary action per view | Put two solid buttons side by side |
| Use plain words: "Paid", "Due tomorrow" | Use jargon or exclamation marks |
| Use borders for structure in dark mode | Use glows, gradients or glass |
