# Choose an option

**The job:** pick one of a few options that differ by a figure, a time or a kind (a ride, a vehicle, a plan, a period).

## What Transit does

1. A 20px bold title over the options ("Choose a ride"), or a 28px question in a flow.
2. **Option rows about 72px tall:** a 48px grey icon tile, the name in 16px medium with a small count or a tinted tag beside it, a 14px grey line (timing, a note), and the figure right-aligned in medium tabular figures.
3. **The chosen row takes a 2px black border** (a real border, 12px corners); the others keep a transparent one so nothing shifts. The radio inside is hidden; the whole row is the target.
4. Short either/or settings above a list use **pill chips** (36px, the grey fill, black when chosen) or the **segmented control** (grey track, the current segment white with a 2px black edge).
5. The commit is one black button after the options, full width at the foot of the panel ("Book Standard", "Continue").

## Where it appears

- `dashboard` (ride options, rider chips), `onboarding` (how you'll deliver, edged rows with a visible radio), `pricing` (plan cards with the picked one edged in black, the Monthly/Yearly switch), `list-detail` (filter chips).
- Source: grey-filled controls and black selection are `observed` on the source's booking and public pages; option rows with prices are `inferred` from the source's published booking flow (behind a sign-in; private notes).

## Variations and triggers

- **A price per option** → rows with the price at the right; a cheaper old price struck through in 14px grey under it.
- **Two to four options with several perks each** → plan cards side by side (stacked on a phone), the picked one edged in black.
- **Two or three ways to filter** → chips; **two periods** → the segmented control.

## What it does not do

- No coloured background, tick badge or blue for the chosen option; selection is the black border.
- No shadow under a chosen or hovered row.
- No inset shadow pretending to be an edge.
- Never two black buttons for the same choice.

## Why

- `inferred`: black is both the action and the selection colour in this system, so the chosen row reads as "this one" without a second colour.
- `observed`: panels and rows are never raised by a shadow on the source's pages (`structure.elevated` 0 on 57 of 66 studied screen-widths).
