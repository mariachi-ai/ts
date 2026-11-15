# Browse many things

**The job:** show many conversations (or people, or plans), each with whether it needs you, so one can be opened.

## What Lagoon does

1. **Pinned first:** up to six people or groups as 64px circles, three to a row, the name in 11px below; the current one sits in a blue rounded square with white text.
2. **Then rows,** newest first, on the grey sidebar: an 8px blue unread dot in the margin, a 40px circle, the name in 13px bold with the time at the right in 11px grey, then a two-line grey preview ("You:" when you sent the last one). A muted chat shows a small bell-off glyph before the time.
3. **Hairlines inset to the text** between rows, never full width, never a border round the list.
4. **The current row** is solid blue with white text and 10px corners.

## Where it appears

- `dashboard` (pins and rows), `list-detail`, `errors` (rows, the current one with the unsent message), `empty-state` (the search that found nothing), `list-detail`'s member circles (a grid of 56px circles with "Add" last).

## Variations and triggers

- **People in a group:** a grid of circles with first names, ending in a grey "Add" circle.
- **Plans or options on a public page:** white grouped cards side by side, features as 44px rows.
- **Many settings sections:** rows with a coloured 24px tile instead of a circle.

## What it does not do

- No table, no columns of metadata, no checkboxes on rows, no counts in badges on rows (the blue dot says unread).
- No bold preview text for unread; only the dot changes.
- No photos or artwork in circles: initials on soft tints.

## Why

- `inferred`: the list is about people, so the face and the last words lead, and one dot is enough to say "new". The pinned circles and the dot are seen in the reference's own window; the rest follows from them.
