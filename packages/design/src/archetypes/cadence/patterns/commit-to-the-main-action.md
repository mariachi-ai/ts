# Commit to the main action

**The job:** make the one thing a screen is for (play, continue, start a plan, sign in) the easiest thing to do.

## What Cadence does

- **In the app, the main action is play:** a round green button with a filled black triangle, 56px in a page's action row, 48px risen onto a hovered card. Green (`#1ed760`) with black, in both modes.
- **On public pages and in flows, the main action is a green pill:** 48px tall, bold 16px black label (`--m-button-font-size: var(--m-font-size-md)`), full width in a narrow form (Continue, Next), content width in a hero (Start 30 days free).
- **The site header's call is a green pill** too (Sign in), after bold 16px links.
- Everything else is quieter: the **white pill** (black text) for the app top bar's call and for errors and empty states; the **outlined pill** (a 1px grey ring, white text) for a second choice; ghost text or round ghost icons for the rest.
- Every button is a pill and grows to 104% on hover.

## Where it appears

- `list-detail` (play in the action row, on the hovered row), `dashboard` (play on the hovered card), `onboarding` (Next), `pricing` (Start 30 days free, the plan pills, the header's Sign in), `sign-in` (Continue), `reading` (the header's Sign in).
- Source: observed: the green play on every record, playlist, song and episode screen; the green header pill on the plans and help pages; the white pill in the web player's header, the not-found page and the pinned sign-up bar (ids in the private notes).

## Variations and triggers

- **A plan card's pill** takes the plan's colour (green, orange, blue) with black or white text as contrast allows; one green plan only.
- **Busy:** the pill keeps its width; `aria-busy="true"` swaps the label for a spinner.
- **Destructive** (close the account): a solid red pill, small, last on the page, never green.

## What it does not do

- No green for links, headings, icons that aren't "on", or decoration.
- No square or rounded-rectangle buttons.
- No two green actions side by side; the second is outlined or white.
- No shadow on buttons, except the play button risen onto art.

## Why

- `inferred`: green means play and on throughout; keeping it to the one action makes the next step obvious on a black screen full of coloured art.
