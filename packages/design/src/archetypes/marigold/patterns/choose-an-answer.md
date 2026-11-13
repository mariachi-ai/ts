# Choose an answer, then hear whether it was right

**The job:** let someone pick one of a few answers, then tell them straight away whether it was right
and what to do next.

## What Marigold does, in order

1. **The choices as whole-card targets.** Each choice is a white tile with a 2px grey outline, 16px
   corners and a 4px grey lip drawn as its bottom border (`m-card` at `data-size="sm"` with
   `border-block-end-width: var(--m-border-width-thick)`), and the tile itself is the control
   (`role="radio"`).
   - **Tiles** (first-use choices, short answers): a grid four across on wide screens and two on
     phones; in each, a 32px coloured icon in a tinted rounded tile, the name at 800 and a muted
     count, all centred.
   - **Rows** (long answers): stacked one per row, the icon at the left, the name and a one-line hint
     beside it.
2. **The picked choice turns blue:** the sky tint, a light-blue 2px outline and blue text, all three
   together. Nothing else on the card changes.
3. **One action at the bottom** checks or continues (see
   [one-step-at-a-time](./one-step-at-a-time.md)).
4. **The verdict replaces the footer:** a banner in the pale green or pale red, 16px corners, a 36px
   icon in a white circle, a heavy 24px title in the tone ("Spot on!", "The answer:"), one
   line that teaches, and one button on the right in the same tone: green Continue after a right
   answer, red Got it after a wrong one.

## Where it appears

- Recipe: `onboarding` (a grid of eight tiles, one picked).
- Recipe: `errors` (both answer banners).
- The selected state is the same one the side column's current item and the pill tabs use
  (`dashboard`, `list-detail`).

## Variations and triggers

- **Choosing a subject or a goal at first use** uses the grid of tiles.
- **A grid of tiles** when every answer is one or two words or a picture.
- **A wrong answer** shows the right one in the banner's line, never just "Wrong".

## What it does not do

- It doesn't show selection with a tick alone or colour alone: tint, outline and text colour change
  together.
- It doesn't use the green for a picked choice; green is kept for "right" and for the action.
- It doesn't put the verdict in a dialog or a toast; it stays in the footer, in place.
- It doesn't explain at length: the banner has one title and one line.
- It doesn't use a select or a list of plain radios for a question that is the whole screen.

## Why

- `inferred`: blue for "chosen" and green for "right" are kept apart so that picking an answer never
  looks like being told it's right.
- `inferred`: the banner sits where the button was, so the eye and the thumb are already there.
