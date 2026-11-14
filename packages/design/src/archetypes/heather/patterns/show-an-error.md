# Show an error

**The job:** say what went wrong, whether anything was lost, and what to do now.

## What Heather does

- **In a field:** the border turns red; the message replaces the hint, 12px red with a small
  `circle-alert` icon, and says how to fix it ("Add the full address, like …").
- **In a form:** a danger alert above the fields (pale red, 8px corners, no border, the icon at the
  left), its 14px/653 title counting what needs fixing and its line saying what was not done
  ("Nobody was invited yet"). Focus moves to it.
- **Somewhere else:** a flag, white with the overlay shadow and 8px corners: the red icon, a 653
  title ("Upload stopped at 64%"), one line saying nothing was lost, one secondary action (Retry),
  and a close button.
- **A whole page:** inside the app frame, centred: a 64px round grey badge with a 28px outline icon,
  the code in 12px mono, a 32px/653 title, one sentence, then one primary and at most one more.

## Where it appears

- `errors` (all four), `sign-in` (field errors follow the same rule).

## Variations and triggers

- **Not found** (404): "We can't find that video", Back to the library.
- **Failure** (500): says nothing was changed, Try again, and a link to the status page.
- **No access** (403): names who shared it and offers Request access.

## What it does not do

- No codes inside sentences, no blame, no exclamation marks.
- No illustration on an error page; no leaving the frame.
- No red fill for a whole page or a toast; red is for the icon, the field border and the alert's
  tint.

## Why

- `inferred`: the product's own not-found page answers with one plain sentence and one way back to
  the library; the same order (what happened, what is safe, what to do) is kept everywhere.
