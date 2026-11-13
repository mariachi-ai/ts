# Commit to the main action

**The job:** take the one step that costs something (book, continue, pay, publish) with the price and the consequence in view.

## What Terracotta does

1. A **lifted panel**: white, 12px corners, a hairline and the `lg` shadow, 24px inside.
2. The figure first: the price at 22px/600, underlined, with its unit in plain text ("$184 night").
3. The inputs that change the figure, as one outlined box split by hairlines (dates, guests).
4. **One full-width action:** the coral-to-magenta gradient (`--m-button-primary-bg: linear-gradient(to right, var(--m-color-accent-default), var(--m-color-accent-hover))`) as a pill or with 12px corners, white 16/500 text.
5. A grey reassurance line under it ("Nothing is charged yet").
6. The breakdown: each line's label underlined, amounts on the right, the total at 600 under a hairline.

## Where it appears

- `list-detail` (the booking panel), `pricing` (the breakdown card with `Use Host pays`), `errors` (Confirm and pay).
- Source: observed as a full-width gradient action on the place pages' booking panel, the log-in sheet (`Continue`), the help home's panel and the city landing's search card (private notes).

## Variations and triggers

- **Host tools and set-up flows** use the **ink** action (`--m-button-primary-bg: var(--m-color-bg-inverse)`), never the gradient: the gradient is for a guest's commitment.
- **Busy:** the action keeps its size and says what it's doing ("Confirming"), `aria-busy="true"`.
- **A sheet** (log in, confirm) puts the same single action full width in a centred white sheet with 32px corners.

## What it does not do

- Never two gradient actions in one view; the second action is a grey fill or an underlined ghost.
- No action without its figure: the price or the consequence sits above it.
- No coral outline or coral text button as a "lighter" version of the action.
- No sticky footer bar on wide screens; the panel itself is sticky.

## Why

- `inferred`: the gradient is reserved for the moment of commitment, so it reads as "this is the step", and stays rare.
- `observed`: the source's primary action is drawn as a gradient image, so the probe never counts it as a primary (`emphasis.primaries` is 0 on every studied source screen); the language declares it as `data-variant="primary"` (see the faithfulness notes).
