# Show progress

**The job:** say how far something has got: a step in setup, a task, a date.

## What Quire does

1. **Step dots:** short 20 by 6px capsules, ink for done and current, grey for to come, with "Step 2 of 3" in muted 12px at the right.
2. **Tasks:** 16px checkboxes with 4px corners; a done task's text goes subtle grey and struck through; an overdue task's box is outlined in red with a red "Overdue" chip and a flag.
3. **Dates as chips:** blue for a date ("Nov 14."), grey for a weekday ("Friday").
4. **A month:** a 7-column grid; today a dark square with white text; the chosen day the blue tint; a 4px blue dot under scheduled days.
5. **A bar** where a quantity matters: a 6px rounded bar in blue on a grey track.

## Where it appears

- `onboarding` (step dots), `dashboard` (tasks, date chips, the month), `reading` (tasks in a green block).

## What it does not do

- No percentages in words where dots or a bar say it.
- No green ticks for done tasks: the box is checked in blue and the text struck through.

## Why

- `observed`: checkboxes beside tasks in the source's shared documents; `inferred`: the chips, the month and the overdue flag from the app screenshots in the private notes.
