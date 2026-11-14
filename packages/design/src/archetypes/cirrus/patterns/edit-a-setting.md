# Edit a setting

**The job:** let someone check a value and change it, one at a time.

## What Cirrus does

1. A plain list of sections on the left (no panel behind it; the current one pale blue with blue text, like the sidebar).
2. The section's title at 20px with one secondary action at the right ("+ New category").
3. White panels with 20px corners, each with a 16px title at 550.
4. Rows split by full-width hairlines: the setting at 15px with one muted 13px line under it, and the control at the right: a switch (takes effect at once), a small select, or a secondary button.
5. When a section has numbers, a panel of 28px figures first (spent so far, budgeted) around a ring in category colours.

## Where it appears

- `settings`. Source: the app's settings screens aren't public; this follows the categories-and-budgets screenshot and the app's switch rows (private notes). `inferred` for everything but the figures and the budgets table.

## Variations and triggers

- **A list of things to edit** (categories) is a table with bars, as in [browse-many-things](./browse-many-things.md).
- **Something destructive** goes last in its own panel, with a danger button that opens a confirmation dialog.

## What it does not do

- No Save button at the bottom of a page of switches.
- No blue primary on a settings page; the one action is secondary.
- No nested panels inside panels.

## Why

- `inferred`: switches act at once, so a page-wide Save would be a second way to do the same thing.
