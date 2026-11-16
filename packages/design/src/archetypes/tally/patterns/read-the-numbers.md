# Read the numbers

**The job:** show how links are doing over time and where the traffic comes from.

## What Tally does

1. The stat tabs: one bordered card whose top row is three tall tabs (24px down, 32px across), each an 8px colour square, a 14px grey label and a 30px figure at 500. The current tab has a 2px ink bar along its bottom.
2. Under them in the same card: the area chart, a 2px line in the tab's colour over a fade, dashed hairline gridlines, 12px grey axis labels, the last date in ink.
3. Below, a two-column grid of breakdown cards (20px gaps): a header with underline sub-tabs and an uppercase 12px unit label; 36px bar rows with a pale tint bar behind the label, the count at the right; "View all" at the foot.

## Where it appears

- `dashboard`. Source: `observed` in the repo's analytics tabs, chart, card and bar-list files, and the public analytics screenshots.

## Variations and triggers

- **Money:** the sales tab shows cents; a $/123 toggle swaps units.
- **One link:** the same page, filtered, with the link's own header.

## What it does not do

- No pie or donut charts, no 3D, no gradient-filled bars.
- No KPI cards in a separate row above the chart: the figures are the tabs.
- No coloured card backgrounds.

## Why

- `inferred`: putting the figures on the tabs makes switching the chart and reading the total one move.
