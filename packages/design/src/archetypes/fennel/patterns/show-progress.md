# Show progress

**The job:** show how far through something someone is: a flow, or a payment on its way.

## What Fennel does

- **A flow:** a 4px bar (forest green on the neutral track, 10px ends) with the step labels under it
  at 12px; the current step in forest green at 600.
- **A payment:** a timeline of steps, each a 32px circle: done steps filled forest green with a lime
  check, the next one an outlined circle with a clock icon. The step's title at 600 (muted when not
  done) and its time in muted 14px.
- **Usage or a limit:** an 8px bar with a label and the amount in tabular figures over it.

## Where it appears

- `onboarding` (the step bar), `list-detail` (the payment's timeline).

## Variations and triggers

- **A step that waits on the person** keeps the outlined circle and names what is needed.

## What it does not do

- No spinner over a page; skeleton rows (a circle and two bars on the neutral fill) while a list
  loads.
- No percentages for a payment; times and plain steps ("We paid out your EUR").

## Why

- `inferred`: people want to know when the money arrives, so the timeline says it in words and
  times, not a bar.
