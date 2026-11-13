# Browse many things

**The job:** let someone scan many places, people or offers and pick one to open.

## What Terracotta does

1. The header, with the compact pill search in the centre (see [search-and-filter](./search-and-filter.md)).
2. A row of rounded filter chips under it, `Filters` first, a short vertical hairline, then the quick filters.
3. A plain heading that counts the results at 22px ("280 places on the Lisbon coast"); no hero, no intro paragraph.
4. A grid of **photo cards**: the photo first with 20px corners and no frame, a heart in its top-right corner and at most one white pill badge on it; under it the title at 500 with the rating on the right, one or two grey lines, and the price underlined at 600. Gaps are 24px across and 40px down; columns are about 15rem.
5. Beside the grid, a map about two fifths wide, as a picture layer with white price pills laid over it (the chosen one ink).
6. Round page numbers centred under the grid, the current one an ink disc.

## Where it appears

- `list-detail` (the results half), `dashboard` (Your listings), `empty-state` (Saved for later, as resting skeleton cards).
- Source: observed on the browse and landing screens and the resource cards (inventory ids in the private notes). The search results page itself was not measured (it never settles; see the notes), so the grid's numbers here come from the recipes.

## Variations and triggers

- **No map** when the things have no place (listings you own, saved items): the grid takes the full column.
- **Rows that scroll sideways** on a home or category screen: one heading per row, the same cards in a carousel. Observed on the source's browse screens.
- **A struck-through price** before a reduced one when a price has dropped.
- **Draft or unfinished items** keep the photo card; the badge says what's missing ("In progress"), the price line says "Draft".

## What it does not do

- No frame, border or shadow around a photo card. The only lifted things on a card are the white badge and the heart.
- No table for things that have photos; tables are for host tools with long numeric lists.
- No coral on the cards: the heart is the only coral, and only when saved.
- No "load more" spinner over the grid; loading is skeleton cards (see [show-progress](./show-progress.md)).
- No more than one badge per photo.

## Why

- `inferred`: the photo carries the decision, so nothing competes with it; the frame would make 20 cards read as 20 boxes.
- `inferred`: the map is a second way to scan the same results, not a separate area, so it sits beside the grid instead of in a tab.
