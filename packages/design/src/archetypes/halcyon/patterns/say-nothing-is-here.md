# Say nothing is here

**The job:** show that a page has nothing in it yet, or nothing that matches, and how to change that.

## What Halcyon does

1. **The page keeps everything around the content:** the app frame, the 28px title, the page's own
   neutral pill, the search and filters, and the table's column heads.
2. **Where the rows would be,** centred: one line at 19px/400 ("No recipients yet"), then one muted
   sentence that says what goes here and how to add it, with the way as an accent link.

## Where it appears

- `empty-state`.

## Variations and triggers

- **Filtered to nothing:** the line says nothing matches the filters, and the sentence offers a reset
  link; the filters stay as set.
- **Brand-new area:** the sentence says what the area is for.

## What it does not do

- No icon, illustration or picture.
- No large title for the empty message; the page title stays the only 28px text.
- No solid accent pill in the message; the page's action is already in the title row.
- No hiding the filters or column heads.

## Why

- `inferred`: keeping the page's structure shows what will be here and that the filters, not a fault,
  decided what is shown.
