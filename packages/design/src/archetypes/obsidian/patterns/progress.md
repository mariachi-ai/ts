# Show progress

**Job.** Show how far something has got: a sprint, a project, a setup, a set of counts.

## What Obsidian does (parts in order)

- **Plain figures**: 24px at 590, tracked tight, tabular, with a 12px muted label under each; no card, no icon, no trend colour.
- **Thin bars**: 4px, indigo on a grey step; small beside a muted percentage in rows; full-width with a label and amount above and a 12px footer line in a usage block.
- **Status counts**: a status glyph, the state's name, a muted count on the right, one per row.
- **Steps**: "Step 3 of 5" in 12px muted over an 8rem bar.
- **Charts**: narrow stacked bars (2px corners), indigo first, then blue, then grey for "other"; a legend of 8px dots top right; dashed muted gridlines.

## Where it appears

- `dashboard`: four plain figures, the stacked bar chart, the sprint pane (usage block and status counts), project rows with a small bar and percentage.
- `onboarding`: the step count and bar.
- Source study: the public screenshot of the usage chart (plain figures over stacked bars, no card) and the sprint side panel.

## Variations and triggers

- One number that matters → a plain figure. Part of a whole → a bar. A breakdown by state → status counts. Over time → stacked bars.
- A meter past its marks turns yellow, then red (`m-meter`).

## What it does not do

- No cards around figures or charts; no donut or gauge charts; no coloured trend arrows.
- No progress colour other than indigo (and the warning hues for meters).
- No percentages without the counts nearby ("29 of 35").

## Why

- `observed`: the source's usage chart sits directly on the panel with plain figures above it; the `dashboard` recipe now does the same (its separated containers moved from border 0.75 to divider 0.75 after the faithfulness pass).
- `inferred`: figures are read, not decorated; one hue keeps the chart quiet next to status glyphs.
