# Show an error

**The job:** say what went wrong, whether anything changed, and what to do.

## What Transit does

1. **A field:** the 1px edge turns red; the message replaces the hint in 12px red and says how to fix it.
2. **A form:** a red-tinted banner above the fields (12px corners, no border) that counts the problems and says what didn't happen ("Check 2 details. Nothing has been booked yet.").
3. **Elsewhere:** a dark `#282828` snackbar with one line and a white pill action; the only thing here with a shadow, because it floats.
4. **A whole page:** left-aligned in the content column: a 64px grey circle with a 24px icon, "Error 404" in 14px grey, a 36px bold title, one sentence, a black button and a grey one. Other codes as grey tiles with a 20px title and one grey button.

## Where it appears

- `errors`, `onboarding` (the invite code field).
- Source: the left-aligned bold 404 with one black button is `observed` on its site's not-found pages (a 52px title over a picture there; the language keeps the app's 36px); the field and banner colours are `observed` in its published component values.

## Variations and triggers

- **Nothing was saved or charged** → say so in the banner or the page's sentence.
- **Payment failed** → the snackbar with "Update card".

## What it does not do

- No exclamation marks, no blame, no codes in sentences.
- No red page backgrounds; no red primary button for a retry.
- No centred error page; no illustration.

## Why

- `observed`: the site's 404 is left-aligned with one black button and links onward.
- `inferred`: saying that nothing changed is the reassurance a payment or booking error needs.
