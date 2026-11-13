# Show an error

**The job:** say that something went wrong, that nothing is lost, and what to do next, at the size of
the problem: a field, a form, an answer, a background task or a whole page.

## What Marigold does, in order

- **A field:** the control's border turns red and a red message at 800 replaces the hint under it.
  Checked on blur and on submit, never while typing.
- **A form:** a danger alert above the form (pale red tint, 2px red outline, 16px corners, a 22px
  icon): a heavy title with the count ("2 things to fix") and one line saying nothing was saved yet.
  Focus moves to it.
- **An answer:** the pale red banner in the footer with the right answer (see
  [choose-an-answer](./choose-an-answer.md)).
- **A background task:** a white toast with a 2px outline and a lip: what happened, that the work is
  safe, and one button ("Retry").
- **A whole page,** centred in a 42rem column, in this order:
  1. a 48px icon in a 6rem pale circle, in a tone (sky for not found, orange for our fault, red for
     no access);
  2. a small uppercase grey code label ("Error 404");
  3. a page-title heading at 800 that says what happened in plain words;
  4. one muted sentence, about 26rem wide, that says what's safe or why;
  5. the buttons stacked at full width in a 20rem column, the green primary first.

## Where it appears

- Recipe: `errors` (all five sizes, on one page).

## Variations and triggers

- **Not found:** one button, back to the main screen.
- **Our fault:** "your progress is safe" in the sentence, Try again first, a status link second.
- **No access:** a request button first ("Ask to join"), Go back second.
- **An expired or invalid link** follows the whole-page shape with one button that goes home.

## What it does not do

- It doesn't put an error code in a sentence; the code is only the small label.
- It doesn't blame ("You entered an invalid…") or use exclamation marks.
- It doesn't use a red full-page background or a red heading; red is the circle's tint and the
  field messages only.
- It doesn't show a stack trace, a request id or technical detail.
- It doesn't use a dialog for an error.

## Why

- `inferred`: errors use the same centred block as empty states so that a failure feels like the
  product's normal voice, not an alarm.
- `observed`, on one of the source's two public error screens (an invalid link): a centred block
  with a large picture first, a heavy title, one line and one full-width button. The other (not
  found) is an unstyled server page with the picture beside the text. Marigold follows the first and
  replaces the picture with an icon in a circle (it ships no illustrations).
