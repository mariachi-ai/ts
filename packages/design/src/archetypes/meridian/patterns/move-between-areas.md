# Move between areas

**The job:** let someone see where they are and get to another part of the product.

## What Meridian does

1. **The sidebar,** 256px on background-200 with a hairline edge: the workspace switcher (a 24px tile, the
   name, a plan badge, an up-down chevron), a search with `⌘K`, then 36px rows of 14px muted text with a
   16px icon. The current row is default text on the grey selected step with 6px corners; counts sit
   right in the subtle grey. Members, Billing and Settings sit at the bottom behind a hairline.
2. **The breadcrumb bar,** 56px with a hairline under it: workspace / page in 14px muted with the current
   page in default text at 500; a status link with a dot, the bell and the avatar on the right.
3. **Underline tabs** for a page's own sections: 14px, 24px apart, the current one over a 2px grey-1000 bar.
4. **The site bar** on public pages: 64px on background-200, the mark and name (with "/ Docs" in the docs),
   14px grey links, then "Log in" (secondary) and one primary.

## Where it appears

- The app shell on `dashboard`, `list-detail`, `settings`, `empty-state`, `errors`; the site bar on
  `pricing` and `reading`; the docs sidebar and the page's contents on `reading`; underline tabs on
  `empty-state`.

## Variations and triggers

- **On a phone** the page comes first and the sidebar follows it.
- **First use** (onboarding, sign-in) drops the sidebar: a bar with the mark and the step only.
- **The docs sidebar** has no tint or edge: rows on the page colour, the current one on the grey step.

## What it does not do

- No top-level tabs over the app's content (the sidebar replaced them); no hamburger on wide windows.
- No coloured or bold current item: the grey step is enough.
- No icons on the docs sidebar's rows or on breadcrumbs.

## Why

- `observed`: the docs and design-system pages draw this sidebar (36–40px rows, the current one on a grey
  step) and fold it away at phone width; the site bar is on every public page measured.
  `told` (first study's notes): the app moved its top tabs into a left sidebar.
