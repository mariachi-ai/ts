# Show an error

**The job:** say what went wrong, whether anything written was lost, and what to do.

## What Vellum does

1. **A field:** the border turns red; the message replaces the help line in 13px red, regular weight.
2. **A form:** a red-tinted callout above it (14px corners, no border, no stripe), counting what to fix and saying nothing was made yet.
3. **Elsewhere in the app:** a tinted notice in the page with its one action (Retry, Undo), always saying the writing is safe. It sits in the page; it doesn't float over the writing.
4. **A whole page:** centred in a grey panel: a 40px outline icon in the subtle colour, a small "Error 404" line, a 20px bold title, one sentence, then the pills (the primary only where it is the one thing to do).

## Where it appears

- `errors` (the form, two notices, 404, 500 and 403 inside the app's frame).
- Source: not seen publicly beyond the site's own not-found page (a public page); the app's behaviour is `inferred`.

## Variations and triggers

- **Nothing was lost** → say so first ("Nothing you wrote was lost").
- **Reversible** → Undo in the notice.

## What it does not do

- No floating toast over entries in a recipe; no shadow on a notice.
- No codes in sentences, no blame, no exclamation marks.
- No red page backgrounds.

## Why

- `inferred`: no content in the source's app screenshots casts a shadow, so notices are tinted callouts like the form's.
- `inferred`: journal writers fear losing writing more than anything else.
