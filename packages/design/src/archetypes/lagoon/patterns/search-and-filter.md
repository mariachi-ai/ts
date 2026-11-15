# Search and filter

**The job:** find a conversation, a person or a message.

## What Lagoon does

1. **A capsule search** at the top of the sidebar: raised white, no edge, a soft drop, a 16px grey search glyph inside at the left, "Search" as the placeholder.
2. **A round filter button** beside the new-chat button: it opens a menu of what to show (all, unread, known people).
3. **Results replace the list** in place; nothing opens elsewhere.

## Where it appears

- `dashboard`, `list-detail`, `settings` (searching settings), `errors`, `empty-state` (a search with no results), `reading` (search help, in the help bar).

## Variations and triggers

- **No results:** a large grey glyph, "No results" at 22px bold and one line naming what was searched (see say-nothing-is-here).

## What it does not do

- No search button; no advanced-search form; no filter chips row under the field.
- No square or bordered field.

## Why

- `inferred`: the reference's sidebar opens with the capsule search, and its filter lives in a menu, not in chips.
