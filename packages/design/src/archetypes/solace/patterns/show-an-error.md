# Show an error

**The job:** say what went wrong, that nothing is lost when that's true, and what to do next.

## What Solace does

- **In a field:** the 2px border turns red; the message sits under it in 12px red and says how to fix it ("Use at least 8 characters. This one has 6."). Checked on blur and on submit.
- **In a form:** a danger alert above the fields (pale red tint, no border, 12px corners, a 20px icon): a bold count ("2 things to fix") and one line on what didn't happen.
- **Somewhere else:** a charcoal toast with white text, 12px corners, one pill action ("Retry").
- **Before something can't be undone:** the confirm sheet: white, 16px corners over a charcoal scrim, a 20px bold title, one sentence, then full-width stacked pills, the red one first and the way out second.
- **A whole page:** the warm off-white band of [say-nothing-is-here](./say-nothing-is-here.md): flat shapes, the code in small mono, a 48px bold title, one sentence, one blue pill (and a white one).

## Where it appears

- `errors` (all five on one page).
- Source: `observed` on the site's page-not-found (the band, the shape, a bold title and one blue pill); the field, alert, toast and sheet are `inferred` from the published component values and the app screenshots (the dark banner and the confirm sheet).

## Variations and triggers

- **Offline:** the toast says what happened and that it will retry by itself.
- **Not in the plan** (403): the blue pill is "See plans".

## What it does not do

- No codes in sentences and no exclamation marks.
- No red page backgrounds or red headings; red is for the field, the alert and the destructive pill.
- No error without a way forward.

## Why

- `inferred`: blame-free words and the reassurance that progress is saved keep an error from undoing the calm the product sells.
