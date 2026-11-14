# Show one thing

**The job:** show one payment (or one article) in full, with what can be done about it.

## What Volt does

1. **Round grey buttons** at the top of the panel: close at the left, more at the right.
2. **Who,** centred: the person's round initials (64px), the name at 24px 500, when and what for in
   a muted 14px line.
3. **The amount,** centred and huge: 56px at 700, tracked tight, green with a plus when money came
   in; a status badge under it ("RECEIVED").
4. **Two pills side by side,** equal width: a black one for the obvious next move ("Pay back") and a
   grey one ("Split it").
5. **"What happened":** steps with a small outline icon, a medium title and a muted line.
6. **"What you can do":** rows with an icon, a medium title and a chevron, split by hairlines.

## Where it appears

- `list-detail` (the receipt beside the list). A public article: `reading`.
- Source: `inferred` from the app's payment screens in public screenshots (earlier study): the
  person and the amount centred and large, pills under them.

## Variations and triggers

- **Money in** → the amount green with a plus; **money out** → black, no minus.
- **A request waiting on you** → a warning badge and "Pay" as the black pill.
- **An article** (help centre) → the title at 32px 500, muted text, numbered steps in grey circles,
  related rows on a grey band (see `reading`).

## What it does not do

- No tabs inside a receipt; it is one short column.
- No label-and-value table of fields; facts are steps with icons.
- No more than two pills; the rest are rows.

## Why

- `inferred`: a receipt answers "who, how much, did it work" in that order, so the amount sits in
  the middle at the largest size.
