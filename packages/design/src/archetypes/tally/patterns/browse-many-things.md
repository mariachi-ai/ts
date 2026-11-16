# Browse many things

**The job:** let someone scan many links (or records) and act on one quickly.

## What Tally does

1. A toolbar: Filter ▾ and Display ▾ as secondary buttons at the left; a search field and the black "Create link `C`" at the right. 8px between.
2. The list: each item is its own row card, 12px corners, a 1px `#e5e5e5` hairline, 16px across and 10px down, 12px between rows.
3. A row: a 32px round favicon ring; the short link at 14px/600 with a copy button, feature icons and 14px tags; under it in grey a turn-down arrow, the destination, the creator's 16px avatar and the date.
4. At the right: the clicks chip (6px corners, hairline, `#fafafa`, pointer icon, an abbreviated count) and a vertical-dots menu.
5. Under the list: "Viewing 1–7 of 248 links" in 14px and small Previous / Next buttons.
6. Selecting rows raises a floating white bar at the bottom (12px corners, a hairline and a soft drop) with bulk actions.

## Where it appears

- `list-detail` (links), `empty-state` (the toolbar with nothing under it), `dashboard` (bar rows in breakdowns).
- Source: `observed` in the repo's link card, title column, details column and card-list files, and in public help screenshots of the links list and its menu.

## Variations and triggers

- **Compact display:** the rows join into one bordered group with hairlines between them (first and last rounded); the destination moves inline.
- **People and events:** a real table in a 12px hairline frame, 14px/500 headers in ink, 40px rows.

## What it does not do

- No zebra stripes, no filled header band, no resting shadow on rows.
- No row actions spelled out on every row: one clicks chip and one menu.
- No coloured row backgrounds for status; status is a small badge.
- No full URL as the title: the short link is the title, the destination is grey.

## Why

- `inferred`: the short link is what people copy and share, so it leads; the destination only confirms it.
