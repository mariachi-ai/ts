# Move between areas

**The job:** show where you are and get somewhere else.

## What Quire does

1. **The grey sidebar,** 280px on `#f2f2f2`, no drawn edge: the space (a small tile, its name, a chevron) and a button to hide the sidebar; then rows of 13px with a 16px muted icon, 10px corners and 2px apart; group names in ink 13px semibold (not capitals); counts at the right in subtle grey with no pill; a hairline above the last group.
2. **The current row** is a white tile with the capsule ring.
3. **No top bar in the app:** the toolbar row sits on the window (see [browse-many-things](./browse-many-things.md)).
4. **A breadcrumb** in muted 12px above a page's title.
5. **On a published page** the sidebar holds the page's contents: the page's name, a search field, "On this page" in muted 12px, the headings (indented one step for a sub-heading) and linked pages with a chevron and a file icon.
6. **On public pages** a floating white capsule bar with the ring: the wordmark, ink links at 16px, "Sign in" as a link and an ink capsule.

## Where it appears

- `dashboard`, `list-detail`, `empty-state` (the app sidebar), `settings` (the settings sidebar), `reading` (the contents), `pricing` (the capsule bar).

## Variations and triggers

- **On a phone** the sidebar stacks; on a published page it follows the sheet.

## What it does not do

- No coloured bar or blue fill for the current row.
- No uppercase group names; no count pills.
- No top bar with a rule across the app.

## Why

- `observed`: the source's shared documents draw a 280px contents sidebar with a search field, a small muted label over the headings, 32px rows with 10px corners and linked pages with a chevron and a page icon; the public pages' floating capsule bar with an ink capsule.
- `inferred`: the app's sidebar (white current tile, coloured folder icons, counts) is from the app screenshots in the private notes.
