# Browse many things

**The job:** show many items of one kind (trips, articles, places) so one can be picked.

## What Transit does

1. A 36px title, then filters as pill chips on one line with a grey pill for the period at the right.
2. **Rows about 72px tall**, stacked with 4px between them or a hairline under the words:
   - app rows: a 48px grey icon tile, a 16px medium name (a tinted status tag beside it), a 14px grey line (date · time · kind), the figure at the right;
   - help rows: a 20px icon in a 64px column, the title in 16px medium, a chevron at the right, the hairline starting under the words.
3. The open item's row is edged in black (2px border).
4. A grey "Show more trips" button at the end; never numbered pages in the app.

## Where it appears

- `list-detail` (trips), `reading` ("More about payment"), `dashboard` (ride options as rows).
- Source: help rows `observed` on the source's help home and help sections (69px rows, measured); app rows `inferred` from its booking screens.

## Variations and triggers

- **Each item has a figure** → the figure at the right in medium tabular figures.
- **Items are articles or places to go** → help rows with a chevron.
- **Many groups** → one 20px heading per group, rows under each.

## What it does not do

- No cards with shadows in a grid for list items; no thumbnails or photos (icon tiles only).
- No zebra stripes, no boxed table around a list.
- No rows under about 64px for anything you tap; no third line of text.

## Why

- `observed`: the source's help lists measure 69px rows with an icon, a medium title and a chevron.
- `inferred`: 72px rows match the 48px controls; thumbs hit them easily.
