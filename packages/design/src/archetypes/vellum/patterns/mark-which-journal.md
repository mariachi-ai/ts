# Mark which journal

**The job:** show which journal something belongs to, at a glance.

## What Vellum does

- **A square swatch** (12px, 3px corners) before each journal's name in the column; 8px in a meta line.
- **A colour band** behind a journal's large title at the top of its own pages and of first use.
- **The open row** filled with the journal's colour.
- **Written days** in the calendar filled with it.
- The name itself is accent text, never the journal's colour (teal or yellow text fails contrast).

## Where it appears

- `list-detail`, `dashboard` (calendar), `empty-state` (the band), `onboarding` and `sign-in` (the band), every page with the column.
- Source: `observed` in the desktop app (coloured squares in the column, filled calendar days, the open row) and the phone app (a journal band behind a large title), earlier study.

## Variations and triggers

- **The default journal** → the sky blue (`brand.default`).
- **Others** → success, warning, danger, accent or ink tokens; charts add lilac and teal.

## What it does not do

- No colour for decoration or for status.
- No white text on the sky blue: ink.
- No journal icons.

## Why

- `observed`: the source colour-codes journals everywhere.
- `inferred`: one meaning per colour keeps the colour readable.
