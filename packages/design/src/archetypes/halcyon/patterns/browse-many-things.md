# Browse many things

**The job:** show many transactions, accounts, recipients or invoices at once, each with its amount and
state, so someone can scan them, narrow them and open one.

## What Halcyon does

1. **The page title** (28px/380) at the left, the page's own action as a neutral pill at the right
   ("Attach receipts", "Add recipient").
2. **A row of filters** directly under it: small selects or pills ("Saved views", "Date", "Keyword",
   "Amount"), 32px tall, 8px apart. Search payments and people lives in the top bar, not here.
3. **The figures that sum up the filtered rows** ("Net change this month", "Money in", "Money out")
   as label-over-figure pairs on a hairline, at 19px, gains in green.
4. **A full-bleed table:** no frame, no header fill, 13px muted headers in sentence case, rows 53px
   on hairlines, a checkbox column at the left when rows can be selected, an initials avatar
   before each party, amounts right-aligned with raised cents.
5. **In a card** (accounts on the dashboard): 44px rows with an avatar, the name and the amount at the
   right; no hairlines inside the card.

## Where it appears

- `list-detail` (the transactions table, its filters and figures), `dashboard` (the accounts card),
  `empty-state` (the recipients table's heads and filters with no rows).

## Variations and triggers

- **A row failed:** the amount struck through and an outlined magenta "Failed" badge after the name.
- **Money came in:** the amount in green; money out stays ink with a real minus sign.
- **Narrow:** filters wrap; the table keeps its columns and scrolls inside the content.
- **Many rows:** more load below, with the count shown; no page numbers in the app.

## What it does not do

- No zebra stripes, no filled header row, no outer frame on a table.
- No cards for rows; no thumbnails.
- No red for money going out; no colour for state without a word.
- No solid accent button on a list page: the page's action is a neutral pill.

## Why

- `inferred`: people come to these pages to check that numbers are right; hairlines and plain rows keep
  the figures the loudest thing, and the filters sit where the eye starts so a narrowed view is always
  explained by what is above it.
