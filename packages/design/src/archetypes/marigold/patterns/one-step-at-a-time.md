# One step at a time

**The job:** walk someone through a task that has several parts (a lesson, sign-up questions, a
first-run set-up) without showing them more than the part they are on.

## What Marigold does, in order

1. **A top bar with no navigation.** A close button (`x`, a ghost icon button in the subtle grey) on
   the left, then a thick progress bar (`m-progress` at `data-size="lg"`) filling the rest of the row.
   Nothing else: no side column, no wordmark, no stats. A count of lives or a timer may sit at the
   right end.
2. **One heavy question** at page-title size and 800: centred over a grid of tiles, left-aligned
   over stacked rows. One sentence, ending in a question mark or written as an instruction.
3. **The answers,** as a grid of tiles (short answers, first-use choices) or stacked one per row
   (long answers): see [choose-an-answer](./choose-an-answer.md).
4. **At most one quiet extra** below the answers: an uppercase grey text button ("Not now"). Never a
   second field or question.
5. **A footer bar across the whole width,** separated by a 2px line: a white secondary button on the
   left (Skip) and the green primary on the right (Continue), both large, at least 9rem wide. On
   phones they stay at the two ends of the bar.

## Where it appears

- Recipe: `onboarding` (the whole screen).
- Recipe: `errors`, in the answer banners that take the footer bar's place once an answer is checked.

## Variations and triggers

- **Before an answer is picked,** the primary in the footer is disabled (grey face, grey label),
  never hidden. *(observed in the source's public app screenshots; the library draws disabled as half
  opacity, see questions.md)*
- **After checking,** the footer bar turns into the answer banner: pale green or pale red, the
  verdict, one line, and the one button. See [choose-an-answer](./choose-an-answer.md).
- **A step that only informs** (no question) keeps the top bar and the footer, with one Continue.

## What it does not do

- It doesn't show the side column, the stats row or any link that leaves the flow. The only way out
  is the close button.
- It doesn't number the steps in words ("Step 2 of 5" is the progress bar's accessible name, not a
  label on screen).
- It doesn't put two questions on one screen, and it doesn't put the primary button at the top.
- It doesn't use a back button in the top bar; going back is not offered mid-lesson.

## Why

- `inferred`: the bar is the only measure of "how much is left", so it is made thick and placed
  first; everything that could pull attention away (navigation, stats) is removed for the length of
  the flow.
- `inferred`: the action lives in a fixed place at the bottom so the hand (or the eye) never has to
  look for it between steps.
