# Choose an option

**The job:** pick one or more of a few things: a filter, a plan, the performers someone likes, a setting.

## What Cadence does

- **Filter chips** for one of a few views: pills, the current one white with black text (see [search-and-filter](./search-and-filter.md)).
- **Round picks** for "choose what you like" in a flow: round art with the name under it in 14px; a picked one gets a green disc with a black tick in its top corner. A count says how many to pick ("Pick 3 or more").
- **Plan cards** for a plan: the highlight grey, 8px corners, the plan family and mark, the plan's name in 32px bold in its colour, the price in bold, a rule, plain bullets, a full-width pill in the plan's colour, centred 12px fine print; a coloured tag on the first card for an offer.
- **Switches and selects** for settings (see [edit-a-setting](./edit-a-setting.md)).
- **Checkboxes and radios** in forms: 16px, a 1px grey edge, green when checked.

## Where it appears

- `onboarding` (round picks), `pricing` (plan cards), `dashboard` and `empty-state` (chips), `settings` (switches, selects), `reading` (device chips in an article).
- Source: observed: chips on the search results screen, switches and selects on the settings screen; the plan cards from the plans page as first studied (ids in the private notes). The round picks follow the sign-up flow's known shape, which couldn't be opened (inferred).

## Variations and triggers

- **Three plans or fewer** sit in one row; on a phone they stack.
- **A plan on offer** gets the tag and its fine print says when the offer ends.

## What it does not do

- No radio list for plans; each plan is a card with its own pill.
- No green border or green fill to show a card is chosen; a pick gets the tick disc, a chip turns white.
- No toggle buttons drawn as segmented controls.

## Why

- `inferred`: picks are made by recognising faces and covers, so the art carries the choice and the mark of "chosen" is small.
