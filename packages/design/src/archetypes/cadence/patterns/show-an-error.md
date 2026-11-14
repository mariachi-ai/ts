# Show an error

**The job:** say what went wrong, whether anything changed, and what to do next.

## What Cadence does

- **In a field:** the control's ring turns red; under it a red 14px line with a 16px `circle-alert`, saying how to fix it. Checked on blur and on submit.
- **In a form:** a banner above the fields in the negative subdued set (dark red), 4px corners, a 16px icon, a bold title counting what needs fixing and a line saying what didn't change ("Your email hasn't changed"). Focus moves to it.
- **Somewhere else:** the snackbar, the announcement blue with white text, centred at the bottom, one line, at most 24rem.
- **A whole page:** on the near-black panel colour, centred: the green mark (or a 56px grey icon), a 48px bold title, one grey 16px line, a white pill back to somewhere safe, and a bold white text link to help.

## Where it appears

- `errors` (all four on one page), `onboarding` (a field error).
- Source: observed: the not-found page of the web player (the mark, a 48px bold title, one grey line, a white "Home" pill and a bold help link) and of the site (ids in the private notes). The field, banner and snackbar follow the published form and banner rules (private notes), not a public screen.

## Variations and triggers

- **404** goes back to Discover and links to help; **500** says nothing in the collection changed and offers Try again; **403** says who can open it and how to ask.

## What it does not do

- No green for an error, ever; no red page background.
- No codes in sentences (a small mono "Error 404" label at most), no blame, no exclamation marks.
- No dialog for an error a field or the snackbar can carry.

## Why

- `inferred`: people are mid-listening; the message says the music and the collection are safe before anything else.
