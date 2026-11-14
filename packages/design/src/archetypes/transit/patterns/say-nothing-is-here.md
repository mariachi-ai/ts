# Say nothing is here

**The job:** say a list is empty and how to fill it.

## What Transit does

1. The header and the 36px page title stay where they would be.
2. Under the title, a centred block: a 96px grey circle with a 40px icon, a 20px bold heading ("No hourly bookings yet"), one grey sentence that says what the thing is and where it will show, then a black button and a grey one stacked, 20rem wide.

## Where it appears

- `empty-state`.
- Source: no empty state was reachable on its public pages; the block is `inferred` from its grey circles and button pairs.

## Variations and triggers

- **Nothing yet, first time** → the block with the action that creates the first item.
- **Nothing matches a filter** → one grey sentence and a "Clear filters" grey button, no circle.

## What it does not do

- No illustration or photo; no humour in the heading.
- The page title never disappears into the empty block.
- No second black button.

## Why

- `inferred`: keeping the title tells someone they're in the right place; the circle repeats the error pages' icon circle.
