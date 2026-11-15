# Browse many things

**The job:** show many runs, jobs or members, each with its state, so one can be opened or acted on.

## What Meridian does

1. **A hairline frame** with 8px corners on background-100: a table with its header row on background-200
   (14px muted at 500, sentence case), or a grid of cards with 16px gaps.
2. **Rows of 14px split by hairlines**, about 36px for one line; a second line in 13px muted carries the
   detail (trigger, duration, commit message).
3. **The state as a 10px dot beside its word** (Ready, Running, Failed, Queued, Canceled).
4. **Machine values in 13px mono:** ids, commits, branches, endpoints.
5. **Times on the right**, relative ("22m ago"), with who did it and a 24px avatar; a ghost "more" (`ellipsis`)
   closes each row.
6. **A full-width secondary "Load more"** under the frame.

## Where it appears

- `list-detail` (the runs table), `dashboard` (recent runs in a card; job cards in a grid), `pricing` (the
  comparison table). The source's design system publishes the table and the entity row this follows.

## Variations and triggers

- **Many things with a picture of their own** (jobs, projects): cards in a grid of 17rem columns, a 40px
  avatar, the name, the endpoint in mono, a repository badge and the last change. A grid/list switch sits
  in the toolbar.
- **A few things inside a card:** hairline rows with no header, the card's padding at the sides.
- **The selected row** takes the grey hover step (`#f2f2f2` / `#1a1a1a`).

## What it does not do

- No zebra stripes in the app, no coloured row fills, no colour without a word.
- No pagination numbers when "Load more" will do.
- No bold for unread or new; a blue "Latest" badge marks the newest when it matters.

## Why

- `inferred`: rows are for scanning many machine-made things at once, so the state and the id lead and
  everything else is quieter. The frame, the header row and the 14/500 header are the published table;
  the dot beside the word is the published status dot.
