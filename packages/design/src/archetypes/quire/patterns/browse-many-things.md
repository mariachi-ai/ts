# Browse many things

**The job:** show many pages (drafts, issues, tasks), each with where it stands, so one can be opened.

## What Quire does

1. **The toolbar first:** a round add button, the view's title at 19px semibold, then at the right a segmented capsule of icons (cards, list, board), round sort and more buttons and a search capsule.
2. **Page cards** in a grid of 13rem columns with 16px gaps: white, 14px corners, the page shadow, no border; a soft colour cover band (a gradient of two tints, 72px), the title at 17px semibold, two lines of the opening in muted 13px, then chips (the desk in its tint, the date in blue, "Overdue" in red).
3. **Or a collection table:** a hairline grid on white inside a 6px frame; column names in muted 12px weight 500; a row number in subtle grey; the title in 13px weight 500 with a 14px file icon; tags as chips; people as mentions (`@Name` on the mention highlight). Rows are about 34–44px.
4. **Or plain rows:** a 16px file icon, the title in 13px weight 500 over the person in muted 12px, the time at the right in muted 12px; faint hairlines between rows, no border round the list.
5. **A quiet "New"** under a table: a ghost `sm` button with a plus, in muted grey.

## Where it appears

- `dashboard` (page cards, recently edited rows, tasks), `list-detail` (the collection table), `reading` (page cards at the end of a part), `pricing` (plan panels and the comparison table).

## Variations and triggers

- **Cards** when the pages have covers or a visual identity; **the table** when the properties matter (status, editor, due); **rows** for recency.
- **On a phone** the grid becomes one column of cards; the table scrolls inside its frame.

## What it does not do

- No photos as covers: covers are token gradients.
- No coloured row backgrounds for status: status is a chip.
- No avatars with initials in tables: a person is a mention.
- No bold, filled or uppercase column headers.

## Why

- `inferred`: pages are the product, so a card looks like a small page (white, rounded, floating). The covers, chips and collection tables follow the source's documents and the app screenshots in the private notes; the mention for people is `observed` in the source's shared documents (a person in a table cell on the blue mention highlight).
