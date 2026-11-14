# Show progress

**The job:** show how far through a set of steps someone is, how much of a limit is used, or that
something is on its way.

## What Halcyon does

- **Through steps (a flow):** "Step 2 of 4 · Your company" at 12px/480 in muted text, over a thin
  rounded accent bar, at the top of the flow's card.
- **A limit used** (a credit card): the figure, a 6px accent bar on the neutral track, then a muted
  line with the labels left and what is available right.
- **Loading:** skeleton blocks in the neutral fill at row and figure sizes inside the page's real
  structure; a button that is working keeps its width and says what it is doing.

## Where it appears

- `onboarding` (the step bar), `dashboard` (the credit card's bar).

## Variations and triggers

- **Past a limit:** the bar turns magenta.

## What it does not do

- No numbered circles or step names across the top.
- No spinner over a whole page.

## Why

- `inferred`: one quiet line of where you are is enough in a short flow; the bar's colour is the
  accent so that it reads as the product's own, not as a warning.
