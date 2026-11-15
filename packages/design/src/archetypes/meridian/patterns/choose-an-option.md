# Choose an option

**The job:** let someone pick one of a few options: a view, a plan, a period, a region, a way in.

## What Meridian does

1. **Two or three views** (grid or list, monthly or yearly): pill tabs inside a hairline frame with 3px
   inside; the current one on the grey selected step. On public pages the frame and chips are fully round.
2. **Many values** (runtime, region, trigger): a select, 36px, the same box as an input.
3. **Plans:** one hairline frame with 2px corners split into three columns by hairlines; the suggested
   plan on background-100 against background-200, with the only primary; the others secondary pills.
4. **Ways in** (sign-in): full-width 40px secondary buttons with a 16px icon, stacked 12px apart under the
   one primary.
5. **Checks and switches** for several on/off values: 16px checkboxes with 4px corners; switches blue when on.

## Where it appears

- `dashboard` (the grid/list switch), `pricing` (the period switch and the plans), `list-detail` (the
  trigger select and the status button with a count), `onboarding` (runtime and region), `settings` (the
  region select, the alert switches), `errors` (environments as checkboxes), `sign-in` (the ways in).

## Variations and triggers

- **A filter of several states:** a secondary button showing the chosen states' dots overlapped, "Status",
  and a badge with the count ("3 of 5").
- **A yearly saving:** a blue badge inside the pill tab ("−15%").

## What it does not do

- No radio cards with pictures; no coloured selected state (selected is a grey step, checked is grey-1000).
- No dropdown for two options.
- Pills never appear in the app's own controls except the view switch's framed chips.

## Why

- `observed`: the plans frame split by hairlines with the middle plan on the lighter white and pill plan
  buttons, and the stacked full-width ways in on the log-in page, are the source's public pages.
  `inferred`: the grey selected step keeps colour for state alone.
