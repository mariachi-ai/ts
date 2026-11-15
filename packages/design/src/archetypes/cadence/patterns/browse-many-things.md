# Browse many things

**The job:** let someone scan many records, mixes, shows or performers and pick one to play or open.

## What Cadence does

1. **Filter chips** first, at the top of the main panel: 32px pills, the current one white with black text, the rest on the highlight grey with 14px regular labels.
2. On a home screen, a **greeting** at 32px bold, then a grid of **shortcut tiles**: 64px of art flush left, a bold 14px title, the highlight grey behind, 4px corners, 8px apart.
3. **Shelves**, each a 24px bold title with "See everything" (bold 14px, grey) on the right, then one row of **cards**: square art with 6px corners (a circle for a person), a 16px title and one or two grey 14px lines. Cards have no fill; their own 12px padding spaces them, so the grid has no gap.
4. On hover a card takes the highlight grey and the 48px green play button rises onto its art on the `md` shadow.

## Where it appears

- `dashboard` (chips, greeting, shortcut tiles, two shelves), `empty-state` (the chips over an empty collection).
- Source: observed on the home, browse, section and search-result screens (ids in the private notes); the shortcut tiles are from a published screenshot of the signed-in home.

## Variations and triggers

- **People** get round art and one grey line ("Performer").
- **A shelf opened with "See everything"** becomes one title over the full grid of the same cards.
- **Categories** (browse) are coloured tiles with a bold title in the corner; the colour is the content's, never the accent.
- **On a phone** the shortcut tiles go to one column and the shelves keep their card width, fewer to a row.

## What it does not do

- No frame or border on a card; the only fill is the hover grey.
- No green on cards except the risen play button.
- No more than two grey lines under a card title; longer text is clipped.
- No carousel arrows on wide screens; a shelf shows one row and "See everything" opens the rest.

## Why

- `inferred`: the art does the recognising, so the card adds nothing around it; play is one move away on every card because playing is the point of browsing.
