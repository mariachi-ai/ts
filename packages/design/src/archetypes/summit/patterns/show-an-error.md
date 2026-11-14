# Show an error

**The job:** say what went wrong, whether anything was lost, and what to do.

## What Summit does

- **In a field:** a red border and a 14px red message under it with the fix and an example.
- **In a form:** a pale red notice at the top (no border, no stripe), a semibold title and one line saying nothing is saved yet.
- **Somewhere else:** the near-black slab with a semibold white title, one grey line about the data, and one orange text action.
- **A whole page:** a white card split in two: a token-drawn dead-end route, then a 32px orange "404", a 24px line with a wink, a short list of ways out as orange links. Failures and no access are white cards with a 24px icon in a tinted circle, "ERROR 500" in 12px grey capitals, a 24px title, one or two sentences and one or two buttons.

## Where it appears

- `errors`.
- Source: `observed`: the page-not-found pages (a drawn picture beside a 34px title at 600 with a wink, a sentence and a bulleted list of ways out as links); field and notice colours `observed` in the published component styles.

## Variations and triggers

- **Offline or retrying:** the slab, not a page.
- **No access:** the info tone, with one way to ask.

## What it does not do

- No codes in sentences, no blame, no exclamation marks.
- No 404 numeral larger than the page title size (32px).
- The banner's action is not an orange button.

## Why

- `inferred`: the reader is mid-effort; say the data is safe and point the way back.
