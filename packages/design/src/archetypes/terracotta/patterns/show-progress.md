# Show progress

**The job:** show how far through a set of steps someone is, or that something is on its way.

## What Terracotta does

**Through steps (a set-up flow):**
1. A bare header (the mark, `Questions?`, `Save and leave` as outline pills).
2. One question a screen in a 35rem column: a grey "Step 1 of 3", the 32px question, an ink sentence.
3. At the foot of the page, a **segmented progress bar**: one square-ended ink-on-grey segment a step, 8px apart, full width.
4. Under it, an underlined `Back` on the left and an ink `Next` on the right.

**While something loads:**
- Grids show **skeleton cards**: `#ebebeb` blocks at photo size with 20px corners and two text bars, with a slow sweep.
- A button that is working keeps its size and says what it's doing ("Confirming"), with a small spinner.

## Where it appears

- `onboarding` (the segmented bar), `empty-state` (resting skeleton cards), `errors` (the busy action).
- Source: the segmented bar is the set-up flow's published pattern (not measured, needs a login); the loading grey is a published token (private notes).

## Variations and triggers

- **Upload or long work** → the single ink bar with round ends (`m-progress`).

## What it does not do

- No spinner over a whole page or a whole grid.
- No step names or numbered circles across the top; the count is one grey line.
- No coral progress; progress is ink.

## Why

- `inferred`: the bar at the foot sits with Back and Next, where the hand is.
