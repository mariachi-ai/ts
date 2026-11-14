# Say nothing is here

**The job:** tell someone a list is empty, why, and how to fill it.

## What Cirrus does

1. The shell and the page title stay.
2. One white panel, centred in the content column, about 44rem wide with generous space above and below.
3. A 56px pale-blue icon tile with 12px corners and the area's icon in blue.
4. A 28px heading ("No bills yet"), one muted 16px sentence on what will show up and when.
5. One blue button that does it for them ("Find my bills") and one secondary to do it by hand.

## Where it appears

- `empty-state`. Source: the app's empty screens aren't public; the shape follows the app's 404 and sign-in card (a lifted icon tile over a title and a muted line, measured) and the language's own panels. `inferred`.

## Variations and triggers

- **A filtered list with no results:** the same panel with a search icon and "Clear filters" as the only button.

## What it does not do

- No illustration or picture.
- No empty table headers left on the page.
- No more than two actions.

## Why

- `inferred`: an empty money app usually means an account isn't linked or a pattern isn't found yet, so the main action finds things for them.
