# A path of steps

**The job:** show a course as a road of small steps: what's done, the one to do now, and what's
coming, so that the next step is always obvious.

## What Marigold does, in order

1. **A unit banner on top:** a full-width block in the brand green with 16px corners and the button
   lip under it, holding an uppercase section label (at 80% opacity), the unit's name as a heavy
   heading, and a white secondary button at the right ("Guide").
2. **Round step buttons in one column,** each about 72 × 64px, offset left and right in a gentle
   zigzag (each step shifted by one 48px unit from the last):
   - done: the green primary with a tick;
   - now: the green primary with a star, and a white outlined bubble above it saying "Start";
   - later: a grey round button with a lock or the step's icon in the subtle grey.
3. **A labelled divider** where the next unit begins: a 2px line, an uppercase grey label, a 2px line.
4. **The right column** beside it with the stats and goals (see [show-progress](./show-progress.md)).

## Where it appears

- Recipe: `dashboard`.

## Variations and triggers

- **The last step of a unit** is a review (a trophy icon), still a round button.
- **A step that can't be opened yet** is a grey button, not a disabled one: it stays clickable to say
  why it's locked.

## What it does not do

- It doesn't number the steps or show them as a list or a table.
- It doesn't show more than one "Start": exactly one step is current.
- It doesn't connect the steps with drawn lines; the zigzag alone makes the path.
- It doesn't put text labels under the steps; the name is in the bubble or the accessible label.
- It doesn't use pictures or illustrations for the steps; one icon each.

## Why

- `inferred`: a path reads as a journey and makes "just the next one" the whole decision, which suits
  short daily practice.
- `inferred`: locked steps stay visible (grey, not hidden) so the learner can see how far the road
  goes.
