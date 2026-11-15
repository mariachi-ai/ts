# Show progress

**The job:** show that something is under way, how far it has got, and what happened.

## What Flint does

- **A working task:** a ring of short strokes, muted, where the state mark sits.
- **An agent's steps:** one line each as they finish ("Read …", "Searched …", "Thought 6s").
- **A command:** a box with a 14px icon, "Ran" and the command in mono, a status tag ("Running",
  "Passed", "Failed") and the time, then its output.
- **A flow:** a step bar of short 3px segments (done in the text colour, to come on the hairline) and
  "Step 2 of 3" in muted 12px.
- **A share done:** a 4px split bar, amber then green, on the grey track (reviews); a 4px green bar
  for usage.

## Where it appears

- `list-detail` (ring, steps, the command box), `dashboard` (split bars, check dots), `onboarding`
  (step bar), `errors` (a failed command).

## Variations and triggers

- **A failure:** the command's box turns red and the agent says what it will do next.
- **Waiting in a queue:** a grey dot and "Queued".

## What it does not do

- No spinner over a whole page; lists show skeleton rows.
- No percentage text on bars that already show the share.
- No coloured progress for the flow's step bar: it is the text colour.

## Why

- `inferred`: an agent's run is long and mostly fine; quiet lines that become a box only when there is
  output keep a long thread readable. Observed in the product frame on the source's home page: one-line
  steps and a "Thought 6s" row.
