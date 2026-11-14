# Set a block apart

**The job:** mark part of a page as a note, a checklist, a question or a key fact, without leaving the page.

## What Quire does

1. **A tinted block:** a block decoration with 6px corners, no border and no stripe, 10px by 14px padding, a semibold title and the body in the tone's text colour. Green for done or checked, orange for open questions, red for a problem, blue for information.
2. **A toggle block:** a grey well (`#f5f6f7`) with 6px corners, the question in 16px semibold; it opens in place.
3. **A focus block:** a grey well with a 3px bar at the left, a 17px semibold title and the text in muted grey.
4. **A key-value table:** a two-column hairline table, the keys in bold link blue on the blue tint, the values in ink, at document size.
5. **Tasks inside a block** are 16px checkboxes with the text beside them, in the block's tone.

## Where it appears

- `list-detail` (toggle, green and orange blocks, focus-bar heading), `reading` (toggle, key-value table, focus block, green tasks, orange note), `errors` (the red block above the form), `dashboard` (tasks with chips).

## Variations and triggers

- **A tinted block** when the colour carries meaning; **a toggle** when the content is optional; **a focus block** for an aside the reader should see first.

## What it does not do

- No coloured left stripes on tinted blocks; no borders on blocks.
- No icons in blocks except a status icon in an error.
- No block inside a block.

## Why

- `observed`: the source's shared documents show grey toggle wells with a ▸, green and orange blocks with checkboxes in the tone's colour, a grey block with a left bar, and a key-value table with a faint blue header column. Colours are from the private notes.
- `told` (private notes): the toggle uses the library accordion's chevron on the right, not the source's triangle.
