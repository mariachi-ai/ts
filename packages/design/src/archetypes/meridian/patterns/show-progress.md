# Show progress

**The job:** say how far something has got: a run, a set-up, a quota.

## What Meridian does

1. **A running thing is an amber dot with its word** ("Running"), never a spinner in a row.
2. **Steps of a set-up:** a side list of 14px rows with 16px icons (a green `circle-check` when done, the
   current one in default text at 500, the rest muted), and a 4px progress bar under them.
3. **Usage:** a 16px ring gauge in blue beside the label with "64K / 100K" on the right; past the warning
   mark it turns amber, over the limit red.
4. **A busy button** keeps its width and shows a spinner (`aria-busy`).

## Where it appears

- `onboarding` (the steps and the bar; "Step 2 of 3" in its bar), `dashboard` (the Usage card's gauges and
  the runs' dots), `list-detail` (Running), `errors` (the busy Save).

## Variations and triggers

- **Loading a list:** skeleton bars in grey-200 with 5px corners, never a spinner over the page.

## What it does not do

- No percentage text in the gauge, no coloured progress bar for a set-up (it is grey-1000).
- No step numbers in circles.

## Why

- `told` (first study's notes): ring gauges in the Usage card and the building dot come from the source's
  dashboard screenshots. `inferred`: the set-up's side list of steps.
