# Browse many things

**The job:** show many videos (or folders, or members) at once, each with who made it, when, who can
see it and how it has been received, so someone can scan them and open one.

## What Heather does

1. **The title row:** a muted context line ("Library") over the 32px title at 653; the page's
   actions at the right, secondary first ("New folder"), the one primary last ("New recording").
2. **Underline tabs** for the kinds (Videos, Clips, Imported, Archived), with the count ("18
   videos") at the right end of the same hairline.
3. **Folders first,** as small bordered tiles in a 14rem grid: an outline folder icon, the name in
   medium, the count in 12px subtle.
4. **Then the videos,** under a 20px heading with two small sort selects at the right, as a grid of
   cards on 17rem columns with 16px gaps. Each card: the thumbnail flush at the top (one picture with
   a charcoal duration chip and the camera bubble), then a 24px avatar with "name · when" and the
   sharing state with a chevron, the title at 16px/653, and three counts (views, comments,
   reactions) with 16px outline icons.
5. **People in a table** (settings): no frame, no header fill, 12px/653 subtle headers, 14px rows on
   hairlines, a checkbox column, avatars beside names, roles as badges, a ghost ellipsis at the end.

## Where it appears

- `dashboard` (folders and the card grid), `list-detail` (up next: thumbnails in a list),
  `settings` (the members table).

## Variations and triggers

- **A video is private or a draft:** the sharing line says so ("Not shared"); nothing else changes.
- **Narrow:** the grid drops to two columns, then one; folders stack.
- **Many:** the grid keeps loading as you scroll; the count beside the tabs says how many there are.
  No page numbers in the library.

## What it does not do

- No list view of videos with columns; the library is cards.
- No buttons on a card: actions live in a menu, and the whole card opens the video.
- No coloured card borders or status stripes; no shadow on a resting card (a hovered card lifts).
- No zebra rows or filled header in a table.

## Why

- `inferred`: a video is recognised by its first frame and its author before its title, so the
  picture and the face lead and the words stay short.
