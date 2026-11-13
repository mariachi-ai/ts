# Say nothing is here

**The job:** tell someone a list is empty, why, and the one thing to do next.

## What Terracotta does

1. The page title stays (32px/500), as if the list were full.
2. A block bounded by hairlines above and below: a 40px ink outline icon (never coral), a 22px heading that says what's missing ("Nothing planned yet"), one sentence in ink about what will appear here, and **one ink-outlined button**.
3. A placeholder photo beside it on wide screens (16:9, 20px corners); it stacks under on phones.
4. Where the empty thing has a shape (saved places), resting skeleton cards in the grid with one grey line on how to fill it.
5. A grey line with an underlined help link under the block.

## Where it appears

- `empty-state`. Source: the no-results search state was in the inventory but skipped (the page never settles; private notes); the hairline-bounded invitation is the language's first study's reading of the product's empty trips and saved lists, so it is `inferred`.

## Variations and triggers

- **No results for a search** → the results heading says so ("No exact matches") and the one action removes filters; the chips stay above.

## What it does not do

- No illustration or mascot; a placeholder photo at most.
- No centred box in the middle of an empty page; the block sits in the page's normal column.
- No coral or gradient action; the button is ink-outlined.
- No more than one action.

## Why

- `inferred`: an empty list is a pause, not a commitment, so it gets the quiet action, not the coral one.
