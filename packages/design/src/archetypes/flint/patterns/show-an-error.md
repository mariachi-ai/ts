# Show an error

**The job:** say what went wrong, whether anything changed, and what to do next.

## What Flint does

- **In a field:** the edge turns red; the message replaces the hint in red 12px and says how to fix it.
- **In a form or dialog:** a danger box at the top ("2 fields need fixing", "The schedule wasn't
  saved."), then each field's own message.
- **In a run:** the command's box turns red with its output, and the agent says in one line what
  failed, what it will do, and that nothing was pushed.
- **Somewhere else:** a toast at the bottom right that says what failed and what happened to the
  work, with one action ("Retry now").
- **A whole page:** centred in the panel: a 32px thin icon, the code in small mono, a 14px title at
  500, one sentence, one or two small buttons.

## Where it appears

- `errors` (all five), `sign-in` (a field, by the same rules).

## Variations and triggers

- **Nothing was lost:** say so first ("Your tasks are safe").
- **No access:** the page names who can grant it and offers Request access.

## What it does not do

- No codes in sentences, no blame, no exclamation marks.
- No red page backgrounds or red headings; red is the field edge, the message and the box tint.
- No error that disappears on its own: error toasts stay until dismissed.

## Why

- `inferred`: in an agent tool most failures are recoverable, so every error says what happened to the
  work. Observed on the source's not-found pages: a short plain sentence, one inverted button home,
  then a few links in the link colour.
