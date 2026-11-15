# Show one thing

**The job:** show one transaction, account or company in full, and let someone act on it.

## What Halcyon does

1. **A back link** in muted text with a 12px chevron ("‹ Transactions"), not breadcrumbs.
2. **The thing's head:** a large initials avatar (round for a person or party, square with 8px corners
   for a company), its name, and for money the amount large (28px/380, raised cents, green if it came in).
3. **Label-and-value rows** on hairlines: the label at the left at 400, the value at the right; a
   status as a tinted badge; account numbers last four in muted mono.
4. **Quiet actions** under the rows: a neutral pill ("Download receipt") and a ghost one ("Add a note").

## Where it appears

- `list-detail` (the payment page under the table), `settings` (the company's head and rows).

## Variations and triggers

- **A value can be changed in place:** it becomes a small select ("Category") inside its row.
- **A value is private:** dots, never the number ("•••••••••").
- **Public reading:** the article column in `reading` is the one-thing page of the public family:
  eyebrow, headline, lede, byline, then 16px text.

## What it does not do

- No tabs to split one thing's facts; one column of rows.
- No boxed form for viewing; editing is per row.
- No solid accent action on a page that only shows something.

## Why

- `inferred`: a payment or account is checked more than it is changed; rows read like a statement,
  and keeping every action quiet makes it clear that looking changes nothing.
