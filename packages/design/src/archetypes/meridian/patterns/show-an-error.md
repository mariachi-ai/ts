# Show an error

**The job:** say what went wrong, whether anything changed, and what to do next.

## What Meridian does

1. **In a field:** the border turns red and a red 13px line with a 16px `circle-alert` replaces the help
   text, saying how to fix it.
2. **In a form:** a danger note at the top of the card: "2 fields need fixing. Nothing was saved."
3. **Elsewhere in the app:** a toast at the bottom right: 420px, a ring, 12px corners, a 14px title at 500,
   one line, one secondary action.
4. **A whole page:** a centred card with a 40px outline icon in the subtle grey, the code and its name in
   13px mono (`404 · NOT_FOUND`), a 24px title, one sentence, one or two buttons and the request id in mono
   with a copy button.

## Where it appears

- `errors`: a "New secret" page in the app with the note and field errors, the toast, then the full pages
  for 404, 500 and no access.

## Variations and triggers

- **500:** "Nothing was changed", Try again (primary) and a status link.
- **403:** who can grant access, and "Request access".
- **Inside the app** the shell stays around the error; a public 404 drops it.

## What it does not do

- No red page backgrounds, no illustrations, no exclamation marks, no blame.
- Never the code inside the sentence; codes go in mono on their own line.
- No modal for an error.

## Why

- `observed`: the platform's own page for a missing site sets a short title, one sentence, the code and name in
  mono and the request id in mono; the docs' 404 sets a large code, one sentence, a black "return" button
  and a secondary. `inferred`: the field, form and toast rules follow the published note and toast.
