# Say nothing is here

**The job:** say a part of the product is empty and offer the first step.

## What Volt does

1. **The frame stays:** side column, top bar, the page title.
2. **One white card,** centred content, generous padding (64px above and below):
   - a 112px green circle with a black 56px outline icon;
   - a 32px regular title ("Nothing saved up yet");
   - one muted sentence at 20px, at most 28rem wide;
   - a black pill and a grey pill, side by side.

## Where it appears

- `empty-state`.
- Source: `inferred`; no empty screen was public. The parts are the source's: the green circle with
  a black mark, big regular type, a black and a grey pill.

## Variations and triggers

- **Nothing yet (first time)** → the green circle and "Start …".
- **Nothing matches a filter** → no card: one muted line under the chips and a grey "Clear filters"
  pill.

## What it does not do

- No illustration, no photo.
- No more than one sentence.
- No hiding the page title.

## Why

- `inferred`: an empty money screen should still feel like the product, so it keeps the green
  moment and the black pill.
