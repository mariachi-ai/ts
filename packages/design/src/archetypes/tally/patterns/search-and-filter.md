# Search and filter

**The job:** narrow a list or a chart to what matters.

## What Tally does

1. "Filter ▾" opens a white menu of filter kinds (domain, tag, creator); each opens a list of options with checkboxes and counts.
2. Chosen filters appear as joined pills under the toolbar: the kind, "is", the value, and a remove button, split by hairlines, 6px corners.
3. On analytics the second control is the date range ("Last 30 days ▾", 240px wide, a calendar icon).
4. Search is a plain 38px field with a 16px search icon inside its left edge.

## Where it appears

- `list-detail`, `empty-state`, `dashboard`.
- Source: `observed` in the repo's filter select, filter list and range panel files, and the public analytics screenshots.

## Variations and triggers

- **A breakdown card:** clicking a bar row filters the whole page by it; the row's bar turns its solid hue.

## What it does not do

- No filter sidebar beside the list; filters are a menu and pills.
- No tabs for saved views in the header.
- No coloured chips for filters; the pills are white with hairlines.

## Why

- `inferred`: filters are temporary, so they sit as small pills rather than taking a column.
