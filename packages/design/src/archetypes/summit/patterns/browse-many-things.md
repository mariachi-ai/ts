# Browse many things

**The job:** show many sessions, challenges, routes or people, each with what it amounted to, and let someone open one.

## What Summit does

1. **A feed of white cards** on the cool off-white, 12px apart: an avatar header (name in 14px at 600, a sport icon and the date in 12px grey), a 20px title at 600, one grey line, [the figures](./show-the-numbers.md), the token-drawn map inset by the card's padding, achievements, then the props row under a hairline.
2. **A small select above the feed** chooses whose sessions ("People you follow").
3. **Side cards** beside it list challenges (an icon tile, the name, a thin progress bar, a 12px line) and crews (a square avatar, name, members, a white "Join").
4. **A board** is a table: rank (a yellow crown for first), a small round avatar and the name, the time right-aligned in tabular figures; the current athlete's row tinted pale orange.

## Where it appears

- `dashboard` (the feed, challenges, a board, crews), `list-detail` (the segments table and its top ten).
- Source: `observed` on the public challenges page (white cards on the off-white with one orange button each, 4px outlined filter chips) and the routes pages (route cards with a map, a name and figures); the feed, boards and props `observed` in the published screenshots of the web dashboard and session pages.

## Variations and triggers

- **Boards** show the top ten, then "See the full board" as a full-width white button; a select chooses the period.
- **A grid of cards** (challenges, routes) when each item leads with a picture or a badge; a list when it leads with figures.
- **Too many:** the feed loads more on scroll; there is no pagination in the app.

## What it does not do

- No orange button inside a feed card; actions are the grey square props, comment and share buttons.
- No zebra rows, no row borders heavier than a hairline, no coloured row except the current athlete's.
- No avatars with photos or drawn faces in recipes; initials on the hairline grey stand in.

## Why

- `inferred`: browsing is social and competitive; every item shows its result and who did it, and the only colour left is for the person looking (their row, their wins).
