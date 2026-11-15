# Search and filter

**The job:** narrow a long list to what someone is looking for.

## What Meridian does

1. **One row of filters above the list,** 8px apart: a date button with `calendar`, a search box that
   grows, a select, and a status button with dots and a count.
2. **The search box:** 36px, a 16px `search` icon on the left, a key on the right (`/` in a page, `⌘K` for
   the whole product), placeholder "Filter by id, branch or commit…".
3. **A filter icon button** (`list-filter`) when the filters live in a menu.
4. **The result count** lives in the status button's badge ("3 of 5").

## Where it appears

- `list-detail` (date, search, trigger select, status), `dashboard` (search with `/`, the filter button,
  the view switch), the sidebar's `⌘K` search on every app page, `reading` (the docs search).

## Variations and triggers

- **Nothing matches:** the list's frame stays and says so (see say-nothing-is-here).
- **Product-wide search:** the sidebar's small box with `⌘K`, never a search page.

## What it does not do

- No filter chips row under the bar, no left filter column in the app.
- No search button: results narrow as you type.
- No colour on an active filter; the count says it.

## Why

- `observed`: the source's public lists put search with a key and a filters button at the top right of the
  list (its public gallery); its docs and design system carry the `⌘K` search box. `inferred`: one row keeps
  the list itself in the first window.
