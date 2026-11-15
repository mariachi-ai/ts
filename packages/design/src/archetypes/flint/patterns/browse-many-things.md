# Browse many things

**The job:** show many tasks, changes, repositories or pages at once, each with its state, so someone
can scan them and open one.

## What Flint does

- **In the side panel (tasks, repositories, docs pages):** rows, not cards.
  1. A muted 12px group label in sentence case (the repository, "Agents").
  2. 31px rows at 13px regular: a 16px state mark or icon, the name (cut with an ellipsis), then the
     age, a count or a key in muted text at the right.
  3. The current row is one grey step with 6px corners, the text unchanged; on public docs it is the
     link colour with no fill.
- **In the work area (changes, plans compared):** a table inside a hairline box with 8px corners:
  12px muted headers, 13px rows about 38px tall split by hairlines, the name in the text colour and
  everything else muted, diff counts in green and red, status as a 6px dot and a word.
- **Under a table:** "Showing 1–6 of 14" at the left, Prev / "1 / 3" / Next at the right.

## Where it appears

- `list-detail` (tasks grouped by repository), `dashboard` (open changes), `reading` (the docs panel),
  `onboarding` (the repository picker), `pricing` (the comparison table).

## Variations and triggers

- **Many groups:** each group gets its label; nothing collapses until a group passes about ten rows.
- **A narrow screen:** the side panel stacks above the work in the app and below the article on public
  docs; tables scroll sideways inside their box.
- **Something needs attention:** a blue 6px dot before the name (unread), never a coloured row.

## What it does not do

- No cards for things that are rows; no thumbnails or avatars to lead a row.
- No zebra stripes, no filled header row, no bold names.
- No coloured row backgrounds for state: the state is the mark and a word.
- No second line in a side-panel row: one line, the detail at the right.

## Why

- `inferred`: people come back to the same lists all day and read them at a glance; one-line 31px rows
  keep the most of a list on screen beside the work. The source keeps rows at about 30px on every public
  page measured (`density.rowHeight` 30 [23, 45]).
