# Show many things, each with a status

**Job.** Let someone scan dozens of items, see each one's state at a glance, and open one without leaving the list.

## What Obsidian does (parts in order)

1. The panel's 44px header bar: location (breadcrumb), view chips, quiet icon buttons on the right.
2. A second bar: a ghost **Filter** on the left, a secondary **Display** on the right.
3. Items grouped by state under **grey group bars** (36px, the header grey): status glyph, group name, a muted count, a `+` on the right. No column header row.
4. **36px rows**, full-bleed, split by the muted hairline, in this order: priority bars, ID (12px muted), status glyph, title (13px at 510, truncates), label pills (hairline, coloured dot), date (12px muted, tabular), assignee avatar (20px) last.
5. The selected row: one grey step and a 2px indigo bar on its left edge; it opens in a side panel (see [detail-panel.md](./detail-panel.md)).

## Where it appears

- `list-detail`: three groups (In progress, Todo, Backlog) of 36px rows.
- `dashboard`: the projects list (grey group bar with a count, then a plain table with health, progress, lead, target).
- Source study: the public app screenshots of lists and the HTML app frame on the source's home page (inventory ids in the private notes).

## Variations and triggers

- **A table with a header row** (12px muted at 510 on transparent) when items share several comparable columns, such as projects with health, progress and dates (`dashboard`).
- **Grouped by any property**: status by default; the Display control changes grouping and which properties show (observed in public screenshots; not a recipe).
- **Narrow:** titles truncate; pills and the avatar stay. Phone: the sidebar stacks above the panel.

## What it does not do

- No cards around a list, no zebra stripes, no outer frame: rows run edge to edge of the panel.
- No coloured row backgrounds for state: state is a 14px glyph (shape plus colour), never a filled badge.
- No row actions shown by default; no checkbox column; no pagination (lists scroll).
- No large text: nothing in a row is above 13px.

## Why

- `inferred`: people live in these lists all day, so density wins: 36px rows put more items in the window (measured row height 29.75px median over the recipe's collections, which include 28px sidebar rows).
- `observed`: the source's lists separate by dividers, not boxes (structure.separation: divider 0.75, border 0.05 on its list pages; 0 shadow).
