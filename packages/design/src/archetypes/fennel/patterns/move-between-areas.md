# Move between areas

**The job:** let someone know where they are and get to the other parts of the product.

## What Fennel does

- **In the app:** the 264px white side column with no edge line.
  1. The product's name at the top in the display face, in capitals at 600, forest green.
  2. Nav items at 16px with a 24px outline icon; the current one is forest-green text at 600 with
     no fill; hover takes the neutral fill as a pill.
  3. A second group under a muted 14px/600 heading ("Business").
  4. The top bar on the content side: a round neutral bell and the avatar with the person's name.
- **In a flow:** the flow bar, the name and a close button over a hairline; nothing else to click
  away to.
- **On help pages:** the site header over a hairline (the name; a globe icon with the language,
  "Log in", a small lime "Register"), and underlined breadcrumbs with 16px chevrons.
- **On marketing pages:** the navbar on the lime band (18px/600 links, "Log in" as a link, a small
  forest "Sign up" pill).
- **Every public page ends** with the site footer on the neutral fill: link columns under 18px/600
  headings, links at 18px in forest green, the fine print last.

## Where it appears

- The app frame: `dashboard`, `list-detail`, `settings`, `empty-state`. Flows: `onboarding`,
  `sign-in`. Public: `reading` (header, breadcrumbs, footer), `pricing` (navbar, footer).

## Variations and triggers

- **Phones:** the page comes first and the side column drops below it; the public header keeps the
  name and the Register pill.

## What it does not do

- No fill on the current nav item, no offer cards in the side column.
- No footer in the app or in a flow; no side column on a public page.
- No breadcrumbs inside the app or a flow; a flow has only its close button.

## Why

- `inferred`: the app is a place people return to daily, so its frame stays quiet; public pages are
  read once, so they carry the full footer.
