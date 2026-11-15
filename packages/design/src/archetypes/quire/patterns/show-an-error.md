# Show an error

**The job:** say what went wrong, whether anything was lost, and what to do.

## What Quire does

1. **In a field:** the border turns red and the message replaces the help text in red 13px, after blur or submit.
2. **In a form:** a red block decoration above the fields: how many things to fix and that nothing changed ("2 things to fix. Nothing was changed.").
3. **Somewhere else:** a toast: white, 14px corners, the menu shadow, a semibold title, one line, one capsule action ("Retry now").
4. **A whole page:** a white sheet centred on the window: a 40px outline icon in subtle grey, the code in small mono, a 19px semibold title, one sentence, one or two capsules (404 a way back, 500 Try again, 403 Ask for access).

## Where it appears

- `errors` (all four), `sign-in` (field rules).

## What it does not do

- No codes in sentences, no blame, no exclamation marks.
- No red page backgrounds or banners across the window.

## Why

- `inferred`: built from the library; the private notes record that the source's error states were not public. The source's public 404s are marketing pages with a large serif headline; the language keeps the app's 19px title.
