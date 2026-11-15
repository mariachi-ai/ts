# Search and filter

**The job:** narrow a long list to the few things someone wants.

## What Flint does

- **Everywhere:** search is one key away (⌘K); its hint sits beside the search icon or box in muted
  12px text.
- **In the side panel:** a search icon button at the top, next to hide-panel.
- **On docs:** a bordered search box in the site bar with "Find in the docs" and "⌘K" at its right.
- **On a table:** a ghost "Filter" button with the filter icon beside the table's title; a range as a
  small secondary button with a clock ("Last 14 days").

## Where it appears

- `list-detail` and `dashboard` (panel search, Filter, range), `reading` (the docs search box),
  `empty-state` (the ⌘K hint).

## Variations and triggers

- **Filters applied:** the Filter button shows the count; the table's count line updates.

## What it does not do

- No large search field leading an app page; no filter sidebar.
- No chips row of every filter above a table.

## Why

- `inferred`: people who live in a keyboard-driven tool search by key; the docs search box with its key
  is observed on the source's docs pages.
