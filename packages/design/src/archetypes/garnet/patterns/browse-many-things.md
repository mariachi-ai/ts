# Browse many things

**The job:** let someone scan many companies, people or deals and pick the ones worth acting on now.

## What Garnet does

1. A product bar above the table: a 28px search chip, a "Filter" chip with its count in a small blue pill, a sort chip, and the selection count at the right in subtle 12px.
2. The record table in a white panel with 12px corners: a hairline grid between rows **and** columns in `#f0f0f0`, sentence-case headers in subtle 13px at 400, 13px cells, rows about 37px.
3. A checkbox column first; the name at 500 after a 16px initial mark; secondary columns in the muted colour; a column an agent filled carries a small blue sparkles icon in its header.
4. Fit as the five-step signal bar with the score beside it: five green from 90, four from 80, three amber below.
5. Checked rows fill their box with the ink; the open row takes the well colour `#f8f8f8`.

## Where it appears

- `list-detail` (lead search), `dashboard` (new signals), `settings` (members).
- Source: `observed` on the product frames drawn on the public home and product pages: the company table with checkboxes, the "Filter 2" chip, the fit bars and scores, the column grid lines (1px `#f4f4f4` right edges on 181 cells of the home page) (ids in the private notes).

## Variations and triggers

- **Few rows in a panel** (dashboard): no product bar, no checkbox column.
- **People instead of companies:** the name cell is a white hairline chip with a round photo or initials and the role in subtle text after a dot ("Head of revenue").
- **Too many columns:** the table scrolls sideways inside its panel; the panel never grows past the sheet.

## What it does not do

- No zebra stripes and no filled header band; the header is white like the rows.
- No fit as a percentage pill, a coloured number or a coloured row.
- No row actions shown on every row; actions act on the checked rows from the bar or the side panel.
- No display face in a table.

## Why

- `inferred`: the bar's segments read faster than numbers, and the score beside it keeps it exact.
- `inferred`: the column grid makes a wide record table read as a database, which is what the product is.
