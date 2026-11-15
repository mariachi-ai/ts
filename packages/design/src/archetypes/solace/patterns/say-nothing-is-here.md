# Say nothing is here

**The job:** explain an empty place kindly and offer the way to fill it.

## What Solace does

1. Inside the page's own frame (the app header stays), **a warm off-white band** with 24px corners across the column.
2. Centred in it: **flat token shapes** (an orange disc, a sun-yellow circle, a blue rounded bar), about 200px wide.
3. A 48px bold title that says what is missing ("Nothing saved for offline yet").
4. **One kind sentence** at 18px, muted, at most about 26rem wide: what would appear here and why it's worth it.
5. **One blue pill** for the way to fill it, and at most one white pill beside it for "how it works".

## Where it appears

- `empty-state`; the whole-page errors in `errors` use the same band.
- Source: `observed` on the site's page-not-found (a full-width warm off-white band, a centred orange shape, a big bold title, two short lines and one blue pill). The app's own empty screens are `inferred` from it.

## Variations and triggers

- **Inside a list** (no search matches): the same parts without the band, centred in the list's column.
- **Night content:** the shapes use the midnight colour.

## What it does not do

- No illustration of people or faces; token shapes only.
- No grey icon in a circle, no dashed border.
- No more than two actions.

## Why

- `inferred`: an empty place is treated as a pause, not a failure: the warm band and the kind sentence say so.
