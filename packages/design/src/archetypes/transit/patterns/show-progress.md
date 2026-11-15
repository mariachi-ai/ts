# Show progress

**The job:** say how far through a flow or a wait someone is.

## What Transit does

1. **In a flow:** "Step 2 of 4" in 14px grey over a 4px blue bar on a pale grey track, at the top of the column; the question and choices follow; Continue (black, full width) and Back (ghost, full width) at the foot.
2. **While loading:** grey skeleton blocks the size of what's coming; a button keeps its size and shows a small blue spinner.
3. **A trip under way:** the dot-and-square timeline with a time under each end.

## Where it appears

- `onboarding` (the step bar), `list-detail` (the timeline).
- Source: the blue progress and spinner are `observed` in the source's published component values; the step flow is `inferred` (sign-up flows are behind a form).

## Variations and triggers

- **Known steps** → the bar with "Step n of m"; **unknown wait** → skeletons or the spinner.

## What it does not do

- No black progress bar (black is the action); no numbered circles; no percentage text.
- No spinner over a whole page.

## Why

- `inferred`: blue is kept for things the system is doing (focus, progress), black for what the person does.
