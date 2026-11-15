# Show one thing

**The job:** show one run (or job, or guide) with what is known about it and what can be done to it.

## What Meridian does

1. **A back link** in 13px muted with `arrow-left` above the title.
2. **The title:** the thing's id in mono at 20px, or a 32px page title, with a status badge beside it.
3. **Actions on the right:** secondary buttons (Copy id, Open in shell) and one primary (Rerun).
4. **A details card:** labels in 13px muted over their values in a grid of 10rem columns, 24px apart;
   a background-200 footer with a hairline above holds the endpoint (mono, blue) and an external link.
5. **The log or the body below,** in its own card: a header row with its name and ghost tools, then 13px
   mono lines with times to the millisecond; warn and error lines on their tone tints.

## Where it appears

- `list-detail` (the run), `reading` (one guide: a 40px title, a lead, a primary and Copy page, the body,
  the page's contents on the right).

## Variations and triggers

- **A public page about one thing** (a guide, a post): the site bar, a larger title (40px), a 20px muted
  lead, 16px text up to 46rem, and the page's contents as 32px rows on a hairline at the right.
- **A short thing:** the details card alone, no log.

## What it does not do

- No hero picture, no tabs for fewer than three sections, no second primary.
- No label-colon-value lines: the label sits above the value.
- Never colour a whole log; only warn and error lines take a tint.

## Why

- `inferred`: details are read top to bottom once, then acted on; the id and state come first because
  that is what gets copied and checked. The label-over-value grid and the background-200 footer follow the
  first study's reading of the source's summary screen; the article shape follows the source's docs and design-system pages.
