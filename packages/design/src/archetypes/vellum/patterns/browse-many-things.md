# Browse many things

**The job:** show many entries (or records) in time order so someone can find one and open it.

## What Vellum does

1. **A grey month band** across the list: the month and year in 20px bold on the grey fill (`bg.sunken`).
2. **Rows under it,** each split from the next by a hairline:
   - a bordered date tile at the left (the weekday in 11px semibold capitals, tracked 4%, over a 24px regular numeral, 8px corners); a second entry on the same day leaves the tile's space empty;
   - the title in 15px semibold, two lines of text clamped, then the meta line in 11px: a tiny journal swatch, the journal's name in accent text, then time, place and weather;
   - a 72px square picture at the right when the entry has one (4px corners).
3. **The open row** fills with its journal's colour (the sky blue for the default journal), ink text.
4. **Above the list,** a plain toolbar of 18px grey view glyphs (timeline, photos, calendar, places), the current one on a grey pill, search at the right.

## Where it appears

- `list-detail` (the timeline), `dashboard` (Recently written: the same row without the tile, the journal and weekday in 11px accent capitals).
- Source: `observed` on the desktop and phone apps' timelines in the earlier study's screenshots (private notes).

## Variations and triggers

- **A short list on a dashboard** → no date tile; the journal and day as a small capital line above the title.
- **Grid of pictures** (the photos view) → the toolbar's second glyph; not a recipe yet.

## What it does not do

- No cards or boxes around rows; no zebra stripes.
- No dates hidden in grey meta text: the date is the tile.
- No row taller than three lines of text.
- No pagination: timelines scroll.

## Why

- `observed`: the source's timelines put the weekday and day numeral in a left column and group rows by month.
- `inferred`: time is the structure of a journal, so the date leads each row.
