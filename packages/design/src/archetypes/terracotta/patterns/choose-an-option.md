# Choose an option

**The job:** pick one of a few options that each need a word, an icon or a figure to tell apart.

## What Terracotta does

1. A large question or title (32px/500), a sentence in ink under it.
2. **Choice tiles or cards** in a grid: white, 12px corners, a 1px hairline edge drawn as an inset shadow; the chosen one takes a **2px ink edge** and the sunken fill.
3. Tiles: a 32px outline icon at 1.5px over a 16/500 label. Cards: name at 18/600, an optional pale badge, the figure at 32px/600, a grey line, and points with ink ticks (icons are ink; see DESIGN.md, Icons).
4. A **pill switch** (segmented control: grey track, white knob on a soft shadow) for a two- or three-way setting above the cards.
5. The commit action comes after, never inside a tile.

## Where it appears

- `onboarding` (kind of place), `pricing` (fee plans, period switch), `dashboard` (the reservations switch).
- Source: the 2px ink edge is the set-up flow's pattern (published screenshots; not measured, needs a login); the pill switch is observed in the host app screenshots (private notes).

## Variations and triggers

- **Many options with icons** → tiles in a grid of about 9rem columns.
- **Two to four options with figures** → cards side by side, wrapping under each other on phones.
- **A setting that applies at once** → a switch, not a tile.

## What it does not do

- Selection is never coral and never a tick in the corner: it is the ink edge.
- No radio dots on tiles; cards may carry an ink radio for the form's sake.
- No "recommended" ribbon or tilted badge; the pale `Most chosen` badge is the most.

## Why

- `told` (the language's first study): coral means commit, ink means chosen.
- `inferred`: an edge reads as "this one" without colouring the content inside.
