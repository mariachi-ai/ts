# Choose an option

**The job:** let someone pick one of a few options.

## What Volt does

- **Choice tiles** for a short set of things with meaning (what to use first): 12px corners, a 1px
  control border, a 20px icon over a medium label; the chosen tile takes a 2px black line. The
  radios hide inside.
- **The segmented pill** for views of the same thing (Week, Month, Quarter; Light, Dark, Device):
  no track, the chosen segment sits on the grey pill in medium black.
- **Filter chips** for narrowing a list: small pills in a row, the chosen one black, the rest
  outlined.
- **Plan cards** for a choice that costs money: three cards, two outlined and the picked one in the
  brand green, each ending in a full-width pill.

## Where it appears

- `onboarding` (tiles), `dashboard` (the period switch), `settings` (theme), `list-detail` (chips),
  `pricing` (plans).
- Source: `observed` in the app screenshots (amount tiles with a 2px black chosen line, Week /
  Month / Year pills under the chart; earlier study). Plan cards are `inferred`: the source has no
  paid tiers.

## Variations and triggers

- **Two to four options with icons** → tiles in a grid. **Periods or modes** → the segmented pill.
- **More than six options** → rows with a chevron that open a list (see browse-many-things).

## What it does not do

- No select menu for two or three options.
- No coloured chosen state: chosen is black (a 2px line, a black chip or the grey pill).
- No radio circles on show; the tile is the target.

## Why

- `observed`: chosen things go black or grey in the source, never green.
- `inferred`: big targets suit a product used mostly on a phone.
