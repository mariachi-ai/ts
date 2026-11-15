# Show one thing and let someone change it

**Job.** Show everything about one item and let someone change any property in place, without a form or a save button.

## What Obsidian does (parts in order)

1. A side panel to the right of the list, split from it by a **muted hairline on its left**; same canvas colour (no lift, no shadow).
2. A top row: the ID (12px muted) on the left; copy link, copy branch name and close as 24px ghost icon buttons on the right.
3. The title at 24px and 590, tracked tight; a muted description at reading size below it.
4. **Property rows** between two hairlines: a 12px muted name (fixed 5.5rem) then the value with its glyph (status, priority bars, avatar, label pill, project, sprint). Each value is the control: it opens a menu.
5. Activity: 12px meta lines with an avatar or glyph, then comments in a hairline box, then the composer.

## Where it appears

- `list-detail`: the side panel for the selected row.
- `errors`: the new-item dialog uses the same property controls as secondary buttons in a row (Backlog, Medium, Assignee).
- Source study: the HTML app frame on the home page (properties on the right of the item view), public screenshots of the item view and the project view.

## Variations and triggers

- **Side panel** when opened from a list (the list stays visible).
- **Full panel** when opened directly (title and description centred in a reading column, properties in a right column): seen in the source study, not a recipe.
- **In a dialog** when creating: properties become a row of small secondary buttons under the fields.

## What it does not do

- No edit mode, no Save or Cancel for properties: a change applies at once.
- No form labels above inputs for properties; no input boxes until something is being typed.
- No cards or tabs to split the detail: one scrolling column.
- No coloured header or hero for the item.

## Why

- `inferred`: properties change often and one at a time, so each value is its own control; a save step would slow the keyboard path.
- `observed`: the side panel is split by a hairline, not lifted (the recipe's aside has `border-inline-start` and no shadow; source separation favours dividers, 0.73 of separated containers).
