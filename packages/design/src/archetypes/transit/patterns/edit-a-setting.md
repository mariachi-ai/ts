# Edit a setting

**The job:** see what's set and change one value.

## What Transit does

1. The account side list (15rem, 16px icons, the current row with a grey fill and a 4px black bar).
2. A 36px title; a prompt banner when there's one thing to ask (pale blue, a 20px bold line, one sentence, a blue button).
3. Sections under 20px bold headings.
4. **Rows about 72px tall**: the label in 16px medium over the value in grey, a 16px chevron at the right, a hairline under each row. The row opens the editor; values never sit in inline fields.
5. **Switches** for things that take effect at once (no Save).
6. Deleting comes last: a 20px heading, one grey sentence about what's lost, a red button.

## Where it appears

- `settings`.
- Source: the side list with a grey fill and black bar is `observed` on the source's store pages (its menu list); rows with a chevron are `observed` on its help sections; the account screens themselves are behind a sign-in (`inferred`).

## Variations and triggers

- **A value that's checked** (a verified phone) → a green tag after the value.
- **An on/off preference** → a switch, never a checkbox.
- **Something missing that matters** (no recovery phone) → the prompt banner at the top.

## What it does not do

- No Save button for the page; no inline text fields in the list.
- No cards around sections; no shadows.
- No black button in the list itself; the banner's action is blue.

## Why

- `inferred`: one row, one value keeps the screen scannable on a phone; the editor opens per row.
