# Set preferences

**Job.** Let someone see and change many settings, each applying at once.

## What Obsidian does (parts in order)

1. The settings sidebar (back link, plain group headings) beside the inset panel.
2. A 40rem column: the page title at 24px, one muted line under it.
3. Sections 40px apart, each a 15px heading at 510 over **one hairline panel**.
4. Inside the panel, **rows split by hairlines**: the label (13px at 510) and a 12px muted help line on the left, the control on the right (a button with a chevron, a switch, view chips, keys).
5. A quiet ghost "Reset to defaults" at the end, right-aligned.

## Where it appears

- `settings`: three panels (Theme, Density, Keyboard), nine rows.
- Source study: the public screenshot of the preferences screen and of the display options menu.

## Variations and triggers

- A destructive setting (delete a workspace) sits last in its own panel with a danger button (inferred; not a recipe).
- Text that needs typing (a name, a URL) gets an input on the right, `sm` and sized to content.

## What it does not do

- No Save button: every control applies at once.
- No label-above-input form layout; no tabs within a settings page.
- No cards per setting; one panel per section.

## Why

- `observed`: row height 66.5px median on the `settings` recipe (two lines of text and 14px padding).
- `inferred`: a settings page is scanned, not filled in, so labels and controls line up on two edges.
