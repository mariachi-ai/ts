# Say nothing is here

**The job:** say a list is empty and give the one way to fill it.

## What Fennel does

1. The page's 30px title and the app frame stay.
2. A centred block: a 96px pale-lime circle with a 48px forest-green icon, a 22px/600 heading ("No
   recipients yet"), one muted sentence about what will appear and why it helps.
3. A lime pill with a 16px icon for the main way ("Add a recipient"), and at most one pale-lime pill
   for another way.

## Where it appears

- `empty-state`.

## Variations and triggers

- **Empty after a search or filter:** no lime pill; a pale-lime "Clear filters".

## What it does not do

- No illustration or picture: the circle and icon stand in for one.
- No more than two actions, no long explanation.

## Why

- `inferred`: an empty list is a first step, so it gets the screen's one lime pill.
