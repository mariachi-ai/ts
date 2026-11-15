# Show one thing

**The job:** show everything about one item (a trip, an article) and what you can do with it.

## What Transit does

1. **In the app:** a card (white, 2px pale-grey edge, 12px corners) beside the list, or full width on a phone:
   1. the map placeholder at the top, 8px corners inside the card;
   2. a 20px title and a 14px grey date line;
   3. the person: a 40px black avatar, name in medium, a grey line, the rating at the right;
   4. the dot-and-square timeline under a hairline;
   5. the fare as label-and-figure lines, the total under its own rule;
   6. grey buttons (Receipt, Ride again) and a ghost Get help.
2. **On a public page:** a help article: an underlined breadcrumb, a 36px title, 16px text in a 48rem column, one blue underlined link to another answer, 20px section headings over numbered steps, then related help rows.

## Where it appears

- `list-detail` (the trip), `reading` (the help article).
- Source: the article shape is `observed` on the source's help articles (36px title, 16px text, blue underlined links, numbered steps); the trip card is `inferred` from its booking panel (2px pale edge, 12px corners).

## Variations and triggers

- **The item has a route** → the map placeholder leads the card.
- **The item is text** → the article, with no card.

## What it does not do

- No tabs inside the card; no second card nested inside it (one level of panels).
- No coloured header band, no shadow under the card.
- No black button in the card unless the one action is there; secondary actions are grey.

## Why

- `observed`: the source's articles are single columns with blue links, black underlined breadcrumbs and no panels.
- `inferred`: the card repeats the booking panel so a trip looks like what booked it.
