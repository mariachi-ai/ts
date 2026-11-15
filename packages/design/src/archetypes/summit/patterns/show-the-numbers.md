# Show the numbers

**The job:** say what a session, a week or a route amounted to, at a glance.

## What Summit does

1. **A row of two to four figures**, each a 12px grey label over a big tabular figure (20–24px in a feed, 32px in a session header) with its unit at 14px in regular weight beside it ("64.8 km").
2. **Hairline rules between the figures**, not boxes or tiles.
3. **A second, smaller row** under a hairline when there is more (20px figures: speed, power, effort), never a third.
4. The figures come before any sentence about them; a note, if any, is one 14px grey line above the row.

## Where it appears

- `dashboard` (each feed entry; the week card), `list-detail` (the session header's two rows; the segment effort), `pricing` (the price and its period).
- Source: `observed` on the public route pages (distance, climb and time as a row of figures under hairlines) and in the published screenshots of the web dashboard and session pages.

## Variations and triggers

- **In a table** (segments, boards): the figure is the cell's 14px text and the unit drops to 12px.
- **A figure that warns** (effort, heart rate over a zone) takes the danger text colour; nothing else is coloured.
- **On a phone** the first row stays on one line; the second row wraps or drops.

## What it does not do

- No stat tiles or cards per number, no icons above the figures, no coloured figures for emphasis.
- No unit in a separate column or in the label ("Distance (km)" is a form label, never a stat).
- Never the unit as large as the figure, and never a size off the ramp (the unit is 14px or 12px, not a percentage of the figure).

## Why

- `inferred`: the product is about effort measured; the figures are the content and everything else supports them. Hairlines keep a row readable as one line of results.
