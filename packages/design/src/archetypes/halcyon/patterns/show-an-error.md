# Show an error

**The job:** say what went wrong, whether anything changed, and what to do, as close to the cause as possible.

## What Halcyon does

- **In a field:** the border turns magenta and the message replaces the help text under the field,
  13px in magenta, saying how to fix it ("A routing number has 9 digits.").
- **In a form:** a danger alert above the fields, a tinted panel with no border: how many things need
  fixing, and what was not done ("Nothing was sent.").
- **Somewhere else:** a toast with what happened and one action ("View").
- **A whole page** (not found, failure, no access): inside the app frame, centred: one 19px/400 line,
  one muted sentence, a 13px muted note ("Error 404 · signed in to Fieldstone"), at most one neutral
  pill.

## Where it appears

- `errors` (all four), `onboarding` (a field error on the EIN).

## Variations and triggers

- **Money failed** after it left: a toast and, in the table, the struck-through amount and a "Failed"
  badge.
- **Nothing changed:** say so in the sentence.

## What it does not do

- No red; failure is a deep magenta.
- No icon or picture on a whole-page error, no large display title, no full-page takeover of the frame.
- No codes inside sentences, no blame, no exclamation marks.

## Why

- `inferred`: people are moving money; the first thing they need is whether money moved, so the
  words lead and the page stays calm and in its usual place.
