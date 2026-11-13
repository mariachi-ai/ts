# Show an error

**The job:** say what went wrong, whether anything was lost or charged, and what to do next.

## What Terracotta does

- **In a field:** the border turns burnt red (`#c13515`); the message replaces the help text at 12px with a 14px `circle-alert` before it, and says how to fix it.
- **In a form:** a danger alert above the fields (the pale wash, no border, 12px corners, a 20px icon), its title counting the problems and its body saying what didn't happen ("Your card wasn't charged"). Focus moves to it.
- **Somewhere else:** an ink toast at the bottom left, one line, an optional light-grey detail, one action.
- **A change that isn't a failure** (dates just taken): a warning alert that offers what's still open.
- **A whole page** (a public page): a huge bold word (up to 8rem, 700, −4% tracking), a 32px grey line, a small "Error code: 404" at 400, and a short list of underlined ink links, beside a placeholder image. Its weights are the public family's: 400, 500 and 700, no 600.

## Where it appears

- `errors`. Source: the page-not-found and removed-page screens were in the inventory but skipped by the capture (they answer with HTTP 404 and 410; private notes); the full-page shape follows the language's first study of the live not-found page. Field and form colours are the published error tokens.

## Variations and triggers

- **404** links home, to search and to help; **500** says nothing was booked or charged and offers Try again; **403** offers Request access.

## What it does not do

- Never the brand coral for errors; errors are burnt red.
- No codes in sentences, no blame, no exclamation marks.
- No modal for an error that a field or a toast can carry.
- No red page background or red banner across the top.

## Why

- `inferred`: in a marketplace the first worry is money and dates, so every message says what happened to them.
