# Choose an option

**The job:** let someone pick one of a few options, or a value from a list.

## What Heather does

- **A few options with a sentence each:** choice tiles in a grid, 8px corners, a radio at the start,
  the name in medium and a 12px subtle line; the chosen tile pale blue with a blue edge.
- **Two or three modes:** segments, a quiet grey track with 12px corners and 4px padding, the chosen
  one white and raised with 8px corners (what to record; Monthly or Yearly).
- **Several options in a list:** radios with a 2px dark ring, the chosen one filled blue around a
  white dot, an outline icon before each label.
- **A long list or a device:** a select, 36px with 8px corners; small (32px) selects for sorting.
- **On or off:** a switch, blue when on.

## Where it appears

- `onboarding` (tiles, segments, selects, a switch), `settings` (radios, switches), `pricing` (the
  billing segment), `dashboard` (sort selects).

## Variations and triggers

- **The choice changes the price:** a pale-blue uppercase tag beside it ("Save 15%"), on the public
  site only.

## What it does not do

- No dropdown for two or three options; no checkboxes for one-of-many.
- No coloured fills for unchosen tiles; no blue text on the chosen segment's track.

## Why

- `inferred`: the more an option needs explaining, the more room it gets; the chosen one always
  reads as the current place (pale blue and blue), the same as the current nav row.
