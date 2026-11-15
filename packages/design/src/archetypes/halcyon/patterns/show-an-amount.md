# Show an amount

**The job:** show money so it can be read exactly and compared at a glance.

## What Halcyon does

1. **Tabular figures** everywhere money appears, so columns line up to the cent.
2. **The cents small and raised:** about 62% size, lifted half an em, after a dot ("$5,216,471.18").
3. **Direction in words and signs, then colour:** money in is green; money out is ink with a real
   minus sign ("−$750.00"), never red. Up and down are small diagonal arrows beside the figure.
4. **Sizes by role:** a card's main figure 28px/380 (display face); a summary figure 19px; a row's
   amount at the row's 15px; a sidebar bookmark's balance 13px muted.

## Where it appears

- `dashboard` (balance, accounts, credit card), `list-detail` (the month's figures, the table, the
  payment's amount), `pricing` (prices at 28px/360), `settings` (the balance named in a sentence).

## Variations and triggers

- **A failed payment:** the amount struck through, with a "Failed" badge.
- **Rounded summaries** in chart labels: "$1.8M", "−$482K".
- **Private:** dots, never a partial number.

## What it does not do

- No bold figures; no coloured backgrounds behind amounts.
- No red for outgoing money; magenta is for failure, not for spending.
- No cents at full size in a summary figure.

## Why

- `inferred`: in a money product the figures are the content; the raised cents keep large balances
  readable by their whole part while staying exact.
