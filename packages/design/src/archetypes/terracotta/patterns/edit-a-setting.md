# Edit a setting

**The job:** see what's set and change one thing, without a form for everything.

## What Terracotta does

1. The account column on the left (see [move-between-areas](./move-between-areas.md)), the area's title at 22px on the right.
2. **Label-and-value rows** split by full-width hairlines, 24px above and below: the label in ink at 16px, the current value in grey at 14px under it, and one underlined ink action on the right (`Edit`, `Add`, `Update`).
3. Editing opens **that row in place**: the action becomes an underlined `Cancel`, the fields (56px, 8px corners) appear inside the row, and an ink `Save` closes it. Only one row is open at a time.
4. **Switches** for choices that take effect at once, on the same hairline rows, label and grey hint on the left, switch on the right.
5. Anything destructive goes last, under a hairline, with a sentence in ink about what will happen and a small solid burnt-red button.

## Where it appears

- `settings`. Source: the logged-in account pages were not found as public screenshots; the hairline rows, underlined ink actions and 56px fields are observed on public screens (private notes), so this layout is `inferred`.

## Variations and triggers

- **A value that is not set** shows "Not set" in grey and the action says `Add`.
- **Something checked by the product** (identity) shows when, and the action says `Update`.

## What it does not do

- No cards around groups of settings; hairlines only.
- No page-wide Save button; each row saves itself.
- No form open on arrival.
- No red text link for the destructive action; it is a solid button, last.

## Why

- `inferred`: most visits read a setting rather than change it, so values come first and forms appear one at a time.
