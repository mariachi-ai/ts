# Ask for a few details

**The job:** get a handful of answers typed in (sign in, recover an account, create a profile) with as
little on screen as possible.

## What Marigold does, in order

1. **No navigation:** a close button at the top left and, at most, one white button at the top right
   that switches to the other form ("Join" on the log-in form, "Log in" on sign-up and recovery).
2. **A narrow centred column,** 24rem for signing in and recovery, 42rem for a profile form.
3. **A heavy title** (32px, ink, sentence case), centred on the narrow forms, left-aligned on the
   wider ones. **No icon or picture above it**: a form opens with its title.
4. **The fields stacked 16px apart,** each with its label above (17px at 800), 48px tall in the pale
   well with a 2px border and 12px corners. A small uppercase grey link can sit inside a field at its
   right end ("Reset"). Placeholders only show a format, never the field's name. No required
   marker: every field is required unless its label ends in "(optional)".
5. **One full-width green action** under the fields, 50px with its lip.
6. **Other ways in,** when there are any: a labelled divider ("or", uppercase grey 15px, a 2px line
   each side), then one full-width white button per way, stacked, each with a 20px icon.
7. **The small print last:** centred, 15px, muted, with its links at 800 and no underline.

## Where it appears

- Recipes: `sign-in` (the log-in form, every part above), `errors` (the profile form, with its error
  states).
- `observed` on the source's public log-in form: the narrow centred column, fields in the well, the
  link inside the password field, the full-width action, the "or" divider, the stacked white buttons
  and the centred small print, in that order. (Looked at once in the selection preview; the probe
  skipped the page, so no numbers come from it.)

## Variations and triggers

- **Sign in, recover, sign up:** the narrow centred shape.
- **Recovery** (a lost password): the same shape with one field (email), a muted sentence under the
  title saying what will happen, and the green action ("Send me a link"). The small print offers
  help ("Don't use that email any more? Get help").
- **Link sent** (after recovery, or "email me a link"): the form is replaced, on the same screen, by
  the confirmation block: a 56px mail icon in a 7rem sky-tint circle, a 32px heading ("Check your
  email"), one muted sentence naming the address in bold ("We sent a link to **ana@example.net**. It
  works for an hour."), then a white "Resend link" and a blue uppercase "Use a different email" link,
  stacked in a 20rem column. No green action (there's nothing to do here but wait), no success alert,
  no toast. This is the only account screen that leads with an icon (`inferred`: it reuses
  [nothing-here](./nothing-here.md)'s block, which the language uses for every moment with nothing to
  fill in).
- **A profile or details form** inside the app: the wider left-aligned shape, inside the app's frame.

## What it does not do

- It doesn't put fields side by side, even on wide screens.
- It doesn't show the side column or the stats on these screens.
- It doesn't use a card around the form; the form sits on the white page.
- It doesn't use more than one primary; the other ways in are white buttons.
- It doesn't label fields with placeholders alone, and it doesn't mark required fields with a red
  asterisk (red is for errors only).
- It doesn't lead a form with an icon or a picture.

## Why

- `inferred`: the fewer things on a sign-in screen, the faster people get back to the practice they
  came for.
- Two of the source's habits are recorded and **not** followed (questions.md, 2): on its log-in form
  the fields are labelled only by their placeholders (Marigold keeps visible labels, for
  accessibility), and the action is the sky blue (Marigold keeps the one green primary, because blue
  means chosen in this language). Both are `inferred` choices until someone says otherwise.
