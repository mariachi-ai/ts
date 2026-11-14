# Show an error

**The job:** say what went wrong, whether anything changed, and what to do.

## What Garnet does

1. **A field:** its edge turns red and the message replaces the hint in 13px at 500.
2. **A form:** a danger alert above the fields: a tint, no border, 12px corners, the title at 600 ("Two fields need a look") and that nothing was saved.
3. **A connection:** a warning alert with one outline pill ("Reconnect").
4. **Somewhere else:** a white toast with a hairline, the title at 600, one line and one outline pill.
5. **A whole page:** one centred line: the code at 24px, a 1px vertical rule, the sentence at 14px; then one pill.

## Where it appears

- `errors`.
- Source: `observed`: the site's 404 is exactly one line: the code, a vertical rule, one sentence. The field, form and toast errors are `inferred` (no form is public that we could submit, and none was).

## What it does not do

- No illustration or big icon on a whole-page error.
- No error codes inside sentences.
- No red for anything but an error.

## Why

- `inferred`: the one-line page keeps an error as plain as the rest of the product.
