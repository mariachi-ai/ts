# Show an error

**The job:** say what went wrong, whether anything changed, and what to do next.

## What Cirrus does

- **In a field:** the border turns red and the message replaces the hint below it in red 13px at 550.
- **In a form:** a pale red callout above the fields, with how many things need fixing and "Nothing was saved yet"; the form card keeps its 28px title.
- **A connection that needs attention:** a pale amber callout naming the institution, when it last synced and what is paused, with a secondary "Reconnect".
- **Something elsewhere:** a white toast with a hairline (its left edge in the tone), one line of detail and one action ("Retry now").
- **A whole page:** a white panel in the content column: a 56px icon tile on the quiet fill, "Error 404" in small mono capitals, a 28px title, one muted sentence and one or two buttons.

## Where it appears

- `errors`. Source: the app's 404 (a lifted icon tile, a 24px title, a muted line, a quiet link) and the site's 404 (a 48px title, one sentence, a blue pill) were measured; field and form errors follow the language's own components (private notes).

## Variations and triggers

- **404:** back to the overview. **500:** "nothing was changed", Try again and Contact support. **403:** ask for access.

## What it does not do

- No error codes in sentences, no blame, no exclamation marks.
- No red page backgrounds or red panels; red is the field's border and the callout's tint.
- No validation while someone is still typing.

## Why

- `inferred`: it is money, so saying that nothing changed comes before anything else.
