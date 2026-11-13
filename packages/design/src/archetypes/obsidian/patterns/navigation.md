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
- `pricing`: the site uses a 72px translucent navbar instead (13px muted links on the right; Log in as ghost; the main action an inverted 32px pill), aligned to the 80rem column.
- `reading`: the docs have a sidebar of their own (below) and a 64px bar instead of the navbar.
- `sign-in`: no navigation at all; the mark and one footnote line.
- Source study: the docs sidebar (280px, page colour, hairline on its right, 32px rows; 8px row radius on 3 of 3 docs articles), the HTML app frame on the home page, public screenshots of the sidebar.

## Variations and triggers

- **Phone (app):** the sidebar stacks above the panel (recipe behaviour at 390px).
- **The site:** the navbar on top, no sidebar. On a phone the navbar is 64px with the mark, Log in, the main action and a menu button; the links move into the menu, never a sideways scroll.
- **The docs:** a 280px docs sidebar on the page colour (not the frame colour of the app, because there is no panel), split from the article by a hairline on its right. Rows 32px, 13px at 510 in muted grey with 16px icons; the current row in default text with no fill; sub-pages under a thin guide line; other sections at the bottom over a hairline. On a phone it goes behind the menu button (the recipe, having no media queries, puts it after the article instead).

## What it does not do

- No top navigation inside the app; no tabs as primary navigation.
- No app sidebar (frame colour, grey current row, counts) on a public page; no navbar inside the app.
- No icons-only rail; no coloured or filled current row; no badges as pills on counts.
- No edge line between sidebar and panel: the panel's own hairline separates them.

## Why

- `inferred`: the darker frame recedes so the panel reads as the work; one panel keeps the eye in one place.
- `observed`: depth comes from one step of grey and a hairline (language structure.depth 2 on app recipes).
