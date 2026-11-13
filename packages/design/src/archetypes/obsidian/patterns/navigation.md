# Move between areas

**Job.** Let someone go anywhere in the product and always know where they are.

## What Obsidian does (parts in order)

1. **The frame**: the sunken colour, holding a 232px sidebar and **one inset panel** (8px margin, hairline, 8px corners). Everything else happens inside the panel.
2. **Sidebar, top to bottom**: workspace switcher (ghost), search and new-item icon buttons; personal views (Overview, Assigned to me, Mentions) with muted counts; collapsible group headings (12px at 510, muted, sentence case); teams with a lettered square, their sub-views indented under a thin line; help and invite at the bottom.
3. **Rows** are 28px, 13px at 510 in the secondary text colour, a 16px icon, 8px radius; the current row is one grey step with default text.
4. **The panel's header bar** (44px): breadcrumb (muted parts, "›", the current part at 510), view chips, quiet icon buttons on the right.
5. **Settings** replace the sidebar with their own: a back link, then plain group headings (You, workspace, teams).

## Where it appears

- Every app recipe: `dashboard`, `list-detail`, `empty-state`, `errors` (the shared shell); `settings` (its own sidebar).
- `pricing`: public pages use a 72px translucent navbar instead (13px muted links; log in as ghost; the main action an inverted pill).
- Source study: the docs pages' sidebar (8px-radius rows, observed `<40` radius 8 on 3 of 3 docs articles), the HTML app frame on the home page, public screenshots of the sidebar.

## Variations and triggers

- **Phone:** the sidebar stacks above the panel (recipe behaviour at 390px).
- **Public pages:** navbar on top, no sidebar.

## What it does not do

- No top navigation inside the app; no tabs as primary navigation.
- No icons-only rail; no coloured or filled current row; no badges as pills on counts.
- No edge line between sidebar and panel: the panel's own hairline separates them.

## Why

- `inferred`: the darker frame recedes so the panel reads as the work; one panel keeps the eye in one place.
- `observed`: depth comes from one step of grey and a hairline (language structure.depth 2 on app recipes).
