# Say nothing is here

**The job:** tell someone a list is empty, why, and what to do first.

## What Meridian does

1. **The page stays:** its title, primary action and tabs remain above.
2. **A dashed hairline frame** where the list would be, 64px of padding, everything centred.
3. **A 48px bordered icon tile** with a 20px outline icon and the faint card drop.
4. **A 16px title at 600** ("No incoming webhooks yet") and one muted sentence, at most 26rem wide.
5. **One secondary action** (the page's primary is already above) and a "Read the guide" link with an arrow.

## Where it appears

- `empty-state` (webhooks, under its tabs).

## Variations and triggers

- **Nothing matches a search:** the same frame with "No runs match" and a way to clear the filter.
- **A first-use empty page** with no primary above: the action in the frame becomes the primary.

## What it does not do

- No illustration or character; no colour in the tile.
- No second sentence, no list of features.
- Never hides the page's own title or tabs.

## Why

- `observed`: the source's public gallery, searched for nothing, keeps its title and search and shows a
  framed box with a small grey tile, a short title, a sentence and one button; its design system documents
  empty states as a short title, a sentence and a call to action. The dashed frame is the first study's
  reading of the app's empty lists (`inferred`).
