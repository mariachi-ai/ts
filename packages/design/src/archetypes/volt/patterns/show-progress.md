# Show progress

**The job:** show how far along something is: a step in a flow, a goal, spending over time.

## What Volt does

- **A step:** "Step 2 of 4" in a muted 14px line over an 8px pill bar, green on the grey track (the
  deeper green in light mode, for contrast).
- **A goal:** a ring: a 5px green arc on a grey track with a 24px outline icon in the middle, beside
  the amount and "$580.00 to go".
- **Spending:** green bars with 4px top corners, empty days as short grey stubs, the scale on the
  right in 12px muted figures, the period switch under it.
- **A price going up or down:** a single 2.5px green line, no fill, no axis.
- **Steps in an article:** numbers in small grey circles.

## Where it appears

- `onboarding` (the bar), `dashboard` (ring, bars, sparkline), `reading` (numbered steps).
- Source: `observed`: the help centre's numbered steps in grey circles; the app's green bars with
  empty grey days, rings and a single green line (earlier study's screenshots and release videos).

## Variations and triggers

- **A flow of more than one screen** → the step line and bar at the top.
- **A target amount** → the ring.

## What it does not do

- No percentages without the amount.
- No multicoloured charts for one series; one green.
- No spinner for a whole page; skeleton rows instead.

## Why

- `inferred`: green means "money that's yours" in the source, so progress towards money is green.
