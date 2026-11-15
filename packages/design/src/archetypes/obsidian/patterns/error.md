# Show an error

**Job.** Say what went wrong, whether anything changed, and what to do next.

## What Obsidian does (parts in order)

- **In a field**: the border turns red; a red 13px message replaces the hint and says how to fix it.
- **In a form or dialog**: a danger alert at the top (the faint red tint, a red hairline, 8px radius, a 16px red icon, the title and body in red text): "2 fields need fixing" and "The issue wasn't created."
- **Elsewhere**: a toast bottom right (raised, hairline, overlay shadow) with what failed, what happened to the change, and one action ("Retry"); errors stay until dismissed.
- **A whole page**: centred in the panel: a 32px outline icon in subtle grey, the code in small mono, a 17px semibold title, one sentence, one or two small buttons.

## Where it appears

- `errors`: all four in one page (the new-item dialog, the offline toast, 404, 500, 403).

## Variations and triggers

- Validation runs on blur and on submit, never while typing.
- 404 → a way back to the list; 500 → "Nothing you changed was lost" and Try again; 403 → Request access as the primary.

## What it does not do

- No red backgrounds, banners across the top of the app, or modal error dialogs.
- No codes in sentences, no blame, no exclamation marks.
- No error that loses the person's input.

## Why

- `inferred`: in a fast keyboard tool an error must not break flow, so it stays where the work is (field, dialog, toast).
- `observed`: the source shows almost no saturated colour on its public pages (colour.hues typical 0 over 60 measured screen-widths). That red is therefore kept for errors and status is `inferred`.
