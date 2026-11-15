# Browse many things

**The job:** show many payments, people or articles so someone can find one and open it.

## What Volt does

1. **A section title** at 24px, 500 (or a 16px medium day heading such as "This week" over a group).
2. **A white card** (20px corners, no edge, no shadow) holding the rows; one card per group.
3. **Rows about 70px tall:**
   - a 40px round icon or round initials at the start (grey for most, ink or green for emphasis);
   - a medium 16px title over a muted 14px line (what for, and when);
   - the amount at the end in tabular figures (green with a plus when money comes in), or a
     chevron when the row opens something, or a badge when it waits on you;
   - a hairline between rows that starts after the circle.
4. **The open row** takes the grey fill with 14px corners and loses its hairline.
5. **Above the list,** a row of filter chips (the chosen one a black pill, the rest outlined).
6. **On the public help centre,** the same idea at 57px: a 20px file icon, a medium title and a
   chevron, rows split by full-width hairlines in a white card with 8px corners on a grey band.

## Where it appears

- `dashboard` (Recent), `list-detail` (payments by day), `settings` (grouped rows), `reading`
  (Related), `sign-in` (Other ways in).
- Source: `observed` on the help centre's topic and article pages (rows in a white card on a grey
  band, measured at 57px) and in the app's screenshots (round icons, amounts at the end; earlier
  study). The 70px row is the app's two-line row; `inferred` for the desktop.

## Variations and triggers

- **Two lines** (title and a line of help) → about 70px; **one line** → 57px on the help centre.
- **Many groups** → one card per group under its own heading; no card holds two groups.
- **A popular-topics grid** on the help centre's home → the same rows as separate white cards in
  two columns (`inferred` from the source's support home).

## What it does not do

- No table for payments; tables are for comparing plans.
- No zebra stripes, no borders around rows, no shadow on the card.
- No pagination: "See all" and more on scroll.
- No red for money going out; out is plain black, in is green with a plus.

## Why

- `observed`: the help centre's rows and the app's activity rows keep one shape everywhere.
- `inferred`: a money app is read as a ledger; the amount at the end and the circle at the start
  make a column of names and a column of figures.
