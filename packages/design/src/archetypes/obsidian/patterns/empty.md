# Say nothing's here

**Job.** Explain an empty view and offer the one action that fills it.

## What Obsidian does (parts in order)

1. Centred in the panel (the header bar stays), on the canvas colour.
2. A 48px thin outline icon in subtle grey.
3. A 15px heading at 510, short.
4. One or two muted 13px lines saying what the thing is and what happens.
5. The primary action with its key inside the button (`Start a sprint ⇧S`), and one secondary (how it works).

## Where it appears

- `empty-state`: no sprint running.
- `errors`: the full-page errors use the same centred stack (32px icon, mono code, 17px title).

## Variations and triggers

- **A filtered list with no results**: one muted line in the list area and a way to clear filters (inferred from the filter pattern; not a recipe).
- **A group with no items** stays hidden rather than showing an empty group bar (inferred; not a recipe).

## What it does not do

- No illustrations, photos or colour; no large display heading.
- No more than one primary action.
- No empty table headers or skeleton rows standing in for "nothing".

## Why

- `inferred`: the empty view teaches one concept in one sentence and gets out of the way.
- `observed`: the language's recipes carry no media at all (media.role `none` on 21 of 21 screen-widths).
