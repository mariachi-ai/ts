# Ask for a few details

**The job:** get a handful of answers typed in (sign in, recover an account, create a profile) with as
little on screen as possible.

## What Marigold does, in order

1. **No navigation:** a close button at the top left and, at most, one white button at the top right
   that switches to the other form ("Join" on the log-in form).
2. **A narrow centred column,** 24rem for signing in, 42rem for a profile form.
3. **A heavy title,** centred on the narrow forms, left-aligned on the wider ones.
4. **The fields stacked 16px apart,** each 48px tall in the pale well with a 2px border and 12px
   corners. A small uppercase grey link can sit inside a field at its right end ("Reset").
5. **One full-width action** under the fields.
6. **Other ways in,** when there are any: a labelled divider ("or", uppercase grey, a 2px line each
   side), then one full-width white button per way, stacked, each with its own icon.
7. **The small print last:** centred, 13–15px, muted, with its links at 800.

## Where it appears

- Recipe: `errors` (the profile form, with its error states).
- `observed` on the source's public log-in form: the narrow centred column, fields in the well, the
  link inside the password field, the full-width action, the "or" divider, the stacked white buttons
  and the centred small print, in that order.

## Variations and triggers

- **Sign in, recover, sign up:** the narrow centred shape.
- **A profile or details form** inside the app: the wider left-aligned shape with labels above.

## What it does not do

- It doesn't put fields side by side, even on wide screens.
- It doesn't show the side column or the stats on these screens.
- It doesn't use a card around the form; the form sits on the white page.
- It doesn't use more than one primary; the other ways in are white buttons.

## Why

- `inferred`: the fewer things on a sign-in screen, the faster people get back to the practice they
  came for.
- Two habits are recorded and not settled (see questions.md): on the source's log-in form the
  fields are labelled only by their placeholders, and the action is the sky blue, not the green.
  Marigold keeps labels above fields and the green primary until someone says otherwise.
