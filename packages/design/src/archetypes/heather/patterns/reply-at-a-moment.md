# Reply at a moment

**The job:** let someone respond to an exact second of a video: a comment, a reaction, or a jump to
what was said.

## What Heather does

1. **Times are blue figures:** 12px tabular figures in the accent text colour. In the transcript a
   time is a plain blue link before the line; in comments and summaries it is a chip, pale blue with
   blue figures and 4px corners.
2. **The transcript line** is a row with 8px padding and 8px corners: the time in a 2.5rem column,
   the words at 14px. The line that is playing is pale blue with a 1px blue edge.
3. **A comment:** a 32px avatar, the name at 653, the time chip, "1 hour ago" in 12px subtle, the
   text, then Reply and React as 12px subtle links.
4. **The comment box:** 12px corners, the input border, a 2px blue edge while typing, placeholder
   "Add a comment at 0:48"; ghost buttons for a video reply and a reaction; Post as a small primary.
5. **Reactions** float in a card with the soft shadow, emoji as ghost buttons, "more" last.

## Where it appears

- `list-detail` (transcript, comments, the reaction bar, summary chips), `reading` (chapters as
  transcript rows).

## Variations and triggers

- **Chapters** reuse the transcript row, one per section.
- **The playing line changes** as the video plays; only one line is ever highlighted.

## What it does not do

- No grey timestamps; a time is always blue, because it is a link to that moment.
- No speech bubbles for other people's comments; only your own messages sit on pale blue.
- No bold or coloured text for the playing line; only its background and edge change.

## Why

- `inferred`: a time is the way into the video, so it looks like a link everywhere; the highlight
  stays light so the words remain easy to read while the video plays.
