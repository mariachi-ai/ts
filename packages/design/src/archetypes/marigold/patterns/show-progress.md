# Show progress, runs and goals

**The job:** keep someone's progress in sight (a run of days, points, lives, today's goals) so that
coming back tomorrow feels worth it.

## What Marigold does, in order

1. **A row of stats at the top of the right column:** each is a coloured 22px icon followed by a
   heavy figure in the same colour (a flame and `23`, a gem and `1,140`, a heart and `4`). No labels
   on screen; the name is the accessible label.
2. **Goal cards below it:** an outlined card with a 24px title at 800 and a blue uppercase "View all"
   at the right, then one goal per row: the goal's name at 800 with a coloured icon at the right,
   and under it a thick 16px bar with the count (`26/40`) at its end.
3. **Stat tiles** where a person's totals are shown: small outlined cards with a 2px lip, a coloured
   20px icon and a heavy figure on the first line, a muted 13px name under it, two across.
4. **A progress bar at the top** of anything that has steps (see
   [one-step-at-a-time](./one-step-at-a-time.md)).
5. **Moments of completion** are told in the tone of the answer banner: a heavy title, one line with
   the number ("6th place", "12 of 12 minutes").

## Where it appears

- Recipe: `dashboard` (the stats row, the goals card, the ranking card in the right column).
- Recipe: `list-detail` (stat tiles on the person's card, the days-left count in orange).
- Recipe: `empty-state` (the goals card stays in the right column even when the main area is empty).
- Recipe: `onboarding` (the bar on top).

## Variations and triggers

- **Each stat has its own colour,** and keeps it everywhere: run of days orange, points blue, lives
  red, places gold-orange. Colour is never the only carrier; the icon is.
- **A finished goal** keeps its full bar; nothing turns grey.
- **Time left** is an orange uppercase label with a clock icon ("3 days left").

## What it does not do

- It doesn't use charts with axes or gridlines for a person's own progress: bars, counts and tiles
  only.
- It doesn't show a percentage when a count reads better (`26/40`, not `65%`).
- It doesn't put stats in the main column; they live in the right column (or above the content on
  phones).
- It doesn't mark a missed day or a missed goal in red; misses aren't shown at all.
- It doesn't use thin bars: the bar is 16px (10px only inside tight rows).

## Why

- `inferred`: the stats are figures you want to grow, so they are given colour and weight like a
  game's score, while the rest of the screen stays white and grey.
- `inferred`: no red for a miss, because the language encourages and never scolds (see
  [never.md](../never.md)).
