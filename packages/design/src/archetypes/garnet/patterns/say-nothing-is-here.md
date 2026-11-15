# Say nothing is here

**The job:** show an empty list without leaving someone stuck.

## What Garnet does

1. The table frame stays, with its headers.
2. In its middle: a 40px tile on the well with an 18px icon, a 20px title at 600, one subtle line, then an outline pill and a ghost one.
3. The assistant panel beside it holds a ready-made request in the composer, so one press starts the work.

## Where it appears

- `empty-state`.
- Source: `observed`: the home page's lead-search frame before it fills shows the table's headers with one muted centred line and the chat composer beside it with a request typed (ids in the private notes). The tile, title and pills are `inferred`.

## Variations and triggers

- **Filtered to nothing:** the same frame with "Nothing matches these filters" and a "Clear filters" pill.

## What it does not do

- No illustration.
- No empty page without its frame.
- No maroon pill in the empty table when the page title row already has one.

## Why

- `inferred`: keeping the frame shows what will be there; the assistant is the fastest way to fill it.
