# Search and filter

**The job:** narrow a long list down to the rows that matter.

## What Garnet does

1. Small white chips in one row above the table, 28px tall with 6px corners and a hairline: a search chip with a 12px icon, "Filter" with its count as a blue pill, then sort.
2. A chip with an active filter is pressed (`aria-pressed`) and keeps its count.
3. On public lists a filter is the pill track: "All", then categories, with a round search button beside it.
4. Asking in words is also a filter: the assistant beside the table takes "Find companies that…" and the table fills.

## Where it appears

- `list-detail`, `dashboard` (the "30 days" range chip), `empty-state` (the request in the composer).
- Source: `observed`: the "Search" and "Filter 2" chips in the product frames, the changelog's pill track of release types with a round search button (ids in the private notes).

## Variations and triggers

- **A range:** a chip with the value and a chevron ("30 days ⌄").
- **Many filters:** they stay in the filter chip's menu; only the count shows.

## What it does not do

- No sidebar of facets.
- No full-width search field over the table.
- No filter chips in colour; colour is for meaning.

## Why

- `inferred`: filters stay small so the table keeps the space, and the assistant is the way to ask for something complex.
