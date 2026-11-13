# Commit to the main action

**The job:** take the one step that costs something (book, continue, pay, publish) with the price and the consequence in view.

## What Terracotta does

1. A **lifted panel**: white, 12px corners, a hairline and the `lg` shadow, 24px inside.
2. The figure first: the price at 22px/600, underlined, with its unit in plain text ("$184 night").
3. The inputs that change the figure, as one outlined box split by hairlines (dates, guests).
4. **One full-width action:** the coral-to-magenta gradient (`--m-button-primary-bg: linear-gradient(to right, var(--m-color-accent-default), var(--m-color-accent-hover))`) as a pill or with 12px corners, white 16/500 text. In host tools and the set-up flow the same action is **ink** (see below).
5. A grey reassurance line under it ("Nothing is charged yet").
6. The breakdown: each line's label underlined, amounts on the right, the total at 600 under a hairline.

## Which colour, by family

- **The gradient** is for a guest's commitment in the app (book, confirm and pay) and for the one action of a public page: the header's pill on a marketing page, the action in a reading page's hairline panel, the sign-in sheet's Continue. `observed` on all of these.
- **Ink** (`--m-button-primary-bg: var(--m-color-bg-inverse)`) is the primary inside host tools and the set-up flow: fee plans, Save, Next. `inferred` from the published screenshots of the host tools (they are behind a login; [questions.md](../questions.md), question 2).
- On a public page every other action is an ink pill (the source's host invitation has four, `observed`) or an underlined link.

## Where it appears

- `list-detail` (the booking panel), `errors` (Confirm and pay), `reading` (the panel's Sign in or join), `sign-in` (Continue): the gradient. `pricing` (the breakdown card's `Use Host pays`), `settings` (Save), `onboarding` (Next): ink.
- Source: observed as a full-width gradient action on the place pages' booking panel, the log-in sheet (`Continue`), the help pages' panel, the city landing's search card and the host invitation's header (private notes).

## Variations and triggers

- **Host tools and set-up flows** use the **ink** action, never the gradient (above).
- **On a phone** the place page pins the action to a bottom bar: white, a light top hairline, the price line on the left (16/500, the rating under it at 12px) and the gradient pill on the right, full height 48px (`observed`). The marketing page pins its pill the same way. Recipes can't draw a bar only on phones, so in a recipe the panel drops under the main column; a product adds the bar below 744px.
- **Wide, after the panel's column ends,** the header gives way to a sticky bar of section links with the price and a smaller gradient pill (`observed`). It is the same action, so there is still one in view.
- **Busy:** the action keeps its size and says what it's doing ("Confirming"), `aria-busy="true"`.
- **A sheet** (log in, confirm) puts the same single action full width in a centred white sheet with 32px corners.

## What it does not do

- Never two gradient actions in one view; the second action is a grey fill or an underlined ghost.
- No action without its figure: the price or the consequence sits above it.
- No coral outline or coral text button as a "lighter" version of the action.
- No bar pinned to the bottom of a wide screen; there the panel itself is sticky. Its wrapper must be as tall as the main column (`align-self: stretch` in a row aligned to the start), or the panel has nowhere to stick.

## Why

- `inferred`: the gradient is reserved for the moment of commitment, so it reads as "this is the step", and stays rare.
- `observed`: the source's primary action is drawn as a gradient image, so the probe never counts it as a primary (`emphasis.primaries` is 0 on every studied source screen); the language declares it as `data-variant="primary"` (see the faithfulness notes).
