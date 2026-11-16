# Say nothing is here

**The job:** tell someone a place is empty and give them the first step.

## What Tally does

1. The header and toolbar stay exactly as they would with content.
2. Under them, centred: faded placeholder rows in the list's own shape (a link icon, grey bars, a pointer icon), fading out downwards.
3. A 16px line at 500 ("No links yet"), one grey sentence (balanced, at most 24rem).
4. The black primary with its key and one secondary; a small underlined link to learn more.

## Where it appears

- `empty-state`. Source: `observed` in the repo's empty-state component (the 64px tile, the 16px line, the sentence, the learn-more link) and the links page's empty view (placeholder rows).

## Variations and triggers

- **Places without a list shape** (a folder, a filter with no results): the 64px tile with 16px corners and a 24px icon instead of the placeholder rows.

## What it does not do

- No illustration or photo, no mascot.
- No hiding the toolbar.
- No exclamation marks.

## Why

- `inferred`: drawing the rows that will appear shows what the page is for.
