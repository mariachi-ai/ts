# Play from a list

**The job:** show the songs or episodes of one thing, each with its state (playing, saved, explicit, new), and play any of them.

## What Cadence does

1. A header row in grey 14px: `#`, Title, Record, Added, and a clock icon for the length; **one rule** under it (`border.default`).
2. **Rows**, 56px: the number (16px, centred), 40px art with 4px corners, the title (16px, white) over the performer (14px, grey), then the record, the date added and the length in grey 14px, lengths in tabular figures.
3. **No rules between rows.** Hover lights the whole row with the tint, swaps the number for a play icon and shows the add (`circle-plus`) and more (`ellipsis`) buttons beside the length.
4. **The playing row** turns green: sound bars in place of its number, its title in the accent text colour.
5. **Explicit** content carries a tiny grey "E" tag before the performer.

## Where it appears

- `list-detail` (the mix's track list).
- Source: observed on the album and playlist screens: 56px rows, one rule under the header, none between rows (ids in the private notes).

## Variations and triggers

- **A record's own list** drops the art and the record column (every song is from it).
- **Episodes**, which carry a description, are taller rows split by hairlines: a 112px picture, the title, the show, two grey lines of description, the date and length, then add and a round white play button. A blue dot marks a new one. Observed on a show screen.
- **Compact** (the view switch on the right of the action row) drops the art and keeps one line per row.

## What it does not do

- No zebra stripes and no rule between song rows.
- No checkbox column; selecting is a click on the row, and its actions come from the more menu.
- No green for anything but what is playing.
- No status badges in colour; the only tag is the grey "E".

## Why

- `inferred`: a list someone plays from is read down the titles; rules and stripes would compete with the art, and space plus the hover tint already separates the rows.
