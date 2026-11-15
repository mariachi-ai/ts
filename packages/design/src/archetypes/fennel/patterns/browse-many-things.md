# Browse many things

**The job:** let someone scan their money (payments, balances, recipients) and open the one they want.

## What Fennel does

1. A 22px section title ("Transactions") with an underlined "See all" at the right, or, on a list
   page, the 30px page title with a small pale-lime pill ("Statement").
2. Rows grouped under muted 14px/600 headings ("Today", "Yesterday"), with no rules between groups.
3. Each row, about 72px apart: a 48px circle on the neutral fill with a 24px forest-green icon (the
   money's direction: arrow up for sent, arrow down for received, arrows for converted, a card for
   card spend); the title at 16px/600 and a muted 14px line under it ("Sent · Today"); the amount at
   the right at 16px/600 in tabular figures with the currency code after it, and a second amount
   muted under it when a conversion happened.
4. Balances are a grid of neutral-fill cards (16px corners, no border): a white circle with the
   currency sign, the amount at 18px/600, the currency's name muted.

## Where it appears

- `dashboard` (balances, transactions), `list-detail` (payments grouped by day).

## Variations and triggers

- **Money in** takes a plus and the positive green: `+ 860.00 EUR`. Money out is plain text.
- **Cancelled** amounts are struck through, with "Cancelled" in the muted line.
- **A conversion** shows both amounts, the second muted.
- **Phones:** the same rows, full width; the amounts keep their place at the right.

## What it does not do

- No table for activity: tables are only for real columns of figures (fees, statements).
- No hairlines or zebra stripes between rows; space separates them.
- No minus signs and no red for money going out.
- No bare text rows: every row is led by its circle.
- No coloured icons: the icon is forest green in a neutral circle.

## Why

- `inferred`: money is read by direction and amount, so the circle carries the direction and the
  amount sits alone at the right edge, where the eye checks it.
- `inferred`: red is kept for things that went wrong, so spending never looks like an error.
