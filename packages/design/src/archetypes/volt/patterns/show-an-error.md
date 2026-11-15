# Show an error

**The job:** say what went wrong, whether money moved, and what to do next.

## What Volt does

- **In a field:** the border turns red; the message replaces the help text in red 14px and says
  how to fix it, with an example ("Did you mean @theowright?").
- **In a form:** a red notice above it (a flat red wash, 16px corners, no border, a 20px icon): how
  many things to fix, and that nothing was sent.
- **On this screen, after the fact** (a payment that didn't go): a red notice in the page that says
  where the money is ("The money is still in your balance") with a small grey "Retry".
- **A whole page:**
  - not found: centred on the screen with no card: a 32px title at 500, one muted line, one black
    pill back;
  - failure (500) and no access (403): white cards side by side, a 64px round icon, the code in
    small mono, a 24px title at 500, one sentence, one grey pill.

## Where it appears

- `errors` (inside the app's frame), `onboarding` and `sign-in` fields.
- Source: `observed`: both not-found pages (the site's and the help centre's) are a centred title
  (32px, 500), one muted line and one black pill. Field and form errors are `inferred`.

## Variations and triggers

- **Money involved** → always say whether it moved.
- **Something only another person can fix** → 403 with "Ask to join".

## What it does not do

- No floating toast for an error on the screen in front of you.
- No codes in sentences, no blame, no exclamation marks.
- No red page background; no giant error number.

## Why

- `observed`: the source's not-found pages are plain: title, line, pill.
- `inferred`: in a money app the first worry is the money, so every message says where it is.
