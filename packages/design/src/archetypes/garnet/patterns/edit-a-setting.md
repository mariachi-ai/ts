# Edit a setting

**The job:** see the current values and change one.

## What Garnet does

1. A settings nav at the left: tracked capital group headings (12/600, +0.12em, subtle) and items in 13px; the current item a white pill with the sm shadow.
2. One white panel of rows separated by muted hairlines: the label at 500 and a muted hint on the left, the control on the right (input, select or switch).
3. Switches take effect at once; text fields save on blur.
4. A table of members under its own 20px title with a count in subtle text and an outline "Invite" pill.
5. The danger row sits alone in its own panel at the end with the danger pill.

## Where it appears

- `settings`.
- Source: `inferred`. The app's settings are behind a login. The nav's tracked capital headings are `observed` on the docs and compare pages' "Contents" rail; the hairline rows are `observed` on the pricing comparison table (ids in the private notes).

## Variations and triggers

- **A long group:** split into several panels, each with a 20px title above it.

## What it does not do

- No Save bar for switches.
- No boxed form per setting.
- No danger action inside the main panel.

## Why

- `inferred`: settings follow the same panel-and-hairline rhythm as the record table so the app reads as one thing.
