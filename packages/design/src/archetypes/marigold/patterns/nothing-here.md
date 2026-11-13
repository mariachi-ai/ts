# Say nothing's here yet

**The job:** fill a place that has no content yet (no friends, no saved items, no history) with a
reason to start, not a blank.

## What Marigold does, in order

1. **The screen keeps its frame:** the side column, the page title and the tabs stay where they would
   be with content, and the right column keeps its cards.
2. **A centred block in the main column,** with 48px of space above and below:
   - a large icon (56px) in a pale tinted circle (7rem), in the tone of the subject (sky for people);
   - a heavy heading that says what it's for, not what's missing ("Gardening is better together");
   - one muted sentence, at most two lines, about 24rem wide, saying what you get;
   - the buttons stacked at full width in a 20rem column: the green primary first, then a white
     secondary. Each has a 20px icon before its label.

## Where it appears

- Recipe: `empty-state`.
- The full-page errors in `errors` use the same block with a smaller (48px) icon in a 6rem circle,
  plus an uppercase code label (see [show-an-error](./show-an-error.md)).

## Variations and triggers

- **Inside a card** (a goals card with no goals) the block shrinks: the icon at 40px with no circle,
  one line, one button.
- **When there's nothing to do yet** (content arrives on its own), there's no primary; the secondary
  explains when it will appear.

## What it does not do

- It doesn't say "No results", "Empty" or "Nothing here" as the heading.
- It doesn't use an illustration or a picture; one icon in a circle. (Pictures belong only in the
  public pages' picture slots: DESIGN.md, Page shapes, Pictures.)
- It doesn't put the buttons side by side; they stack, primary on top.
- It doesn't remove the tabs or the title to make room.
- It doesn't use grey for the circle; the circle always has a tint in a tone.

## Why

- `inferred`: an empty place is the moment to invite, so the heading sells the feature and the first
  button starts it.
- `inferred`: stacked full-width buttons are the language's phone habit carried to every width, so
  the empty state looks the same everywhere.
