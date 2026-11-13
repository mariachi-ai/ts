# Rank people

**The job:** show where someone stands among others this week, and how far they are from moving up.

## What Marigold does, in order

1. **A centred header:** a large coloured icon (48px trophy in orange), the group's name as a page
   title, one muted line saying what it takes to move up, and an orange uppercase "3 days left" with
   a clock.
2. **A pill segmented control** to switch the period or the people ("This week", "Friends", "All
   time").
3. **The ranking as open rows,** no outline around each row and no lines between them, only a 2px
   line above the first:
   - the place number at 800 in a fixed 1.5rem column; the top three in orange;
   - a round avatar with initials on a pale tint, varied by tone;
   - the name at 800, filling the row;
   - the score at 500, muted, right-aligned with tabular figures.
4. **The person's own row** in the pale grey well with 12px corners; its text stays the default colour.
5. **A labelled zone line** inside the list where the cut-off falls: uppercase, at 800, a chevron on
   each side, green for moving up ("Promotion zone").
6. **The selected person's card** in the right column: a large avatar, a 24px name, a muted "since"
   line, a full-width white Follow button with a square share button, an uppercase "Stats" label and
   stat tiles two across.

## Where it appears

- Recipe: `list-detail`.

## Variations and triggers

- **A cut-off for moving down** is the same line in red ("Demotion zone") near the bottom.
- **Fewer than ten people:** the list is shorter; it doesn't stretch to fill.

## What it does not do

- It doesn't use a table, column headers or sorting; the order is the ranking.
- It doesn't box each row in a card or separate rows with lines.
- It doesn't paginate; the whole group (up to about 30) is one scrolling list.
- It doesn't hide the person's own row: if it's below the window, it's still in place in the list.

## Why

- `inferred`: open rows with space between them keep a long list light enough to scan for one name,
  and the person's own row is the only tinted one so it's found at once.
- `inferred`: the zone line turns the ranking into a goal ("get above this line").
