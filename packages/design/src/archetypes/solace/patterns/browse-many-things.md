# Browse many things

**The job:** let someone scan sessions, courses or articles and open one.

## What Solace does

1. A 32px bold title for the collection ("Library").
2. **Search** in a 56px field with 12px corners and a 2px control border, the search icon inside on the left, a sentence-case placeholder that says what can be found.
3. **A segmented filter** under it: the warm off-white pill track, the chosen segment raised in white.
4. **Rows** separated by 2px soft warm rules: a picture shape (8px corners, about 6rem wide), a bold 18px title, one meta line in 14px muted with a small icon first ("Course · 21 days · 5–15 min"), and a chevron on the right.
5. **Round pagination** under the rows: the current page solid charcoal.

## Where it appears

- `list-detail` (the library half), `reading` (three more articles as picture cards at the end), `dashboard` (four flat colour tiles to explore).
- Source: `observed` on the public article lists (a grid of picture cards with a category line and a bold title) and the published app screenshots (search, colour tiles, rows with a picture and a meta line). The app's own list rows are `inferred` from those screenshots; the web app is behind a login.

## Variations and triggers

- **Picture cards in a grid** for reading (articles, stories): the picture first, square-cornered inside a 16px card with the soft 2px border, a 14px muted category, then the title at 20px bold.
- **Flat colour tiles** (orange, midnight, blue, sun yellow) with a bold 20px label for a handful of areas to explore.
- **No matches:** the rows give way to [say-nothing-is-here](./say-nothing-is-here.md), inside the column.

## What it does not do

- No table for sessions; tables are only for data the product doesn't show (see DESIGN.md, Table).
- No more than one meta line under a row title.
- No filter chips with counts, no sort menus: the segmented control is the filter.
- No photos of people; pictures are flat token shapes.

## Why

- `inferred`: the meta line answers the two questions people choose by (what kind, how long), so it is always there and always one line.
