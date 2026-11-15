# Show an error

**The job:** say what went wrong, whether money moved, and what to do next.

## What Fennel does

- **In a field:** the ring turns red, and under it an inline prompt: a 16px alert icon and the
  message at 14px/400 in red on the pale red surface, 10px corners. It says how to fix it.
- **In a form:** a danger prompt above the fields (the tinted surface, 16px corners, a 24px icon, no
  border): how many details need checking and "Nothing was sent".
- **Somewhere else:** the snackbar, a dark grey slab with light text and one underlined action
  ("View").
- **A whole page:** left-aligned in the content column: the code small in mono, a 30px title, one
  muted line, then a lime pill and a link or a pale-lime pill; a large icon in a pale-lime circle to
  the right.

## Where it appears

- `errors`.

## Variations and triggers

- **404:** home and the help centre. **500:** "Nothing was sent or changed", Try again and Contact
  us. **403:** ask for access.

## What it does not do

- No red pages or red panels; red is the ring, the prompt's text and its tint.
- No error only in a snackbar when it belongs to a field.
- No validation while someone is still typing.
- No codes in sentences, no blame, no exclamation marks.

## Why

- `inferred`: it is money, so whether anything moved comes first.
