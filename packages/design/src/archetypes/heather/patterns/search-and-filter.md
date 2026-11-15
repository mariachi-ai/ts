# Search and filter

**The job:** find a video, person or folder, or narrow what is shown.

## What Heather does

- **One search for everything,** in the top bar: 40px, 12px corners, the input border, an 18px
  search icon inside, a placeholder that names what it finds ("Search videos, people, folders and
  channels").
- **Sorting** sits beside the heading of what it sorts, as two small selects (what, then which way).
- **Finding within a page** is a small search field beside the section's action ("Find a member").
- **Finding within a transcript** is a ghost "Find" button in the panel's toolbar.

## Where it appears

- `dashboard` (top bar search, sort selects), `settings` (find a member), `list-detail` (Find in
  the transcript), every page in the app frame (the top bar search).

## Variations and triggers

- **Nothing matches:** the page says so with [say-nothing-is-here](./say-nothing-is-here.md), keeping
  the search text so it can be changed.

## What it does not do

- No filter sidebar, no filter chips row above the grid.
- No search hidden behind an icon on wide screens.

## Why

- `inferred`: a library is found by words (titles, people, transcripts), so one wide search is the
  main tool and the rest is ordering.
