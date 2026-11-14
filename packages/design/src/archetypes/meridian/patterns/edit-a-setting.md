# Edit a setting

**The job:** let someone change one value and save it, knowing what it affects.

## What Meridian does

1. **One card per setting** on background-100 with a hairline and 8px corners.
2. **Inside:** a 20px title at 600, one muted sentence saying what it affects, then the control (an
   input to 20rem, a select, switches, or a prefixed input with the fixed part on background-200 in mono).
3. **A background-200 footer** with a hairline above: a 14px muted note on the left (a limit, a link to
   learn more) and the action on the right: a small primary "Save changes".
4. **Save stays disabled** until something changes; switches take effect at once and the footer says so.
5. **Cards stack 24px apart** beside a 12rem list of sections (ghost rows, the current one on the grey
   selected step).

## Where it appears

- `settings` (five cards), `onboarding` (one configuration card whose footer holds the full-width primary),
  `errors` (the form card with Cancel and Save in its footer).

## Variations and triggers

- **A destructive setting** is the last card: a red border, a red-tinted footer, a red "Delete workspace"
  button and the note "Only owners can delete a workspace."
- **A setting that applies at once** (switches): the footer's action becomes a secondary link to manage it.
- **On a phone** the cards come first; the list of sections follows.

## What it does not do

- No single Save for the whole page; each card saves itself.
- No inline edit-in-place; no modal for a single field.
- No labels to the left of controls: the card's title is the label.

## Why

- `observed`: the source's design system publishes this card (the fieldset: title, sentence, control, a
  tinted footer with a note on the left and a black "Save" button on the right). `inferred`: one card per
  value keeps each save small and its effect stated next to it.
