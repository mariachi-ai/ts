# Edit a setting

**The job:** let someone change one value and see it take effect.

## What Lagoon does

1. **Sections in the sidebar,** each with a coloured 24px tile and a white 15px glyph; the open one is solid blue.
2. **The open section** on the grouped grey: a 17px bold title beside round back and forward buttons, then grouped cards, 40rem wide.
3. **Each card:** a small 13px grey title above; 44px rows with the label at the left and the control at the right (a switch, a borderless menu showing its grey value, or a grey value and a chevron); hairlines inset to the text; an 11px grey footnote below that explains.
4. **Switches take effect at once:** there is no Save.
5. **Reset or remove** is a red text row alone in its own card, last.

## Where it appears

- `settings`, `list-detail` (switch rows in the group's details), `onboarding` (who to share with, as check rows), `sign-in` (the email and password rows).

## Variations and triggers

- **A value that needs typing:** a row with the label at the left and a borderless field at the right (`sign-in`).
- **A choice of a few:** check rows, the chosen one with a blue check at the right.

## What it does not do

- No Save button for switches; no form grid of labelled boxes; no section tabs across the top.
- No borders on the cards; no dividers that run to the card's edge on the text side.
- No help text inside rows when a footnote under the card can say it.

## Why

- `inferred`: the system's own settings are drawn this way on the phone and the desktop (seen in the reference's public help screenshots); Lagoon keeps one way to draw any list of values.
