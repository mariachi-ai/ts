# Move between areas

**The job:** let someone get from one area of their money to another, and know where they are.

## What Halcyon does

**In the app:**
1. **The sidebar,** 220px on the pale panel with a hairline edge: the workspace and its plan badge, the
   product switch, then three hairline groups: Home, Tasks (a 12px/480 count) and Assistant (a "New"
   badge); the seven money areas; Bookmarks under a 12px/480 label, each with a 12px icon.
2. **Items** 15px at 400, 30px tall on a 36px pitch; the current one on the neutral fill with 8px
   corners; its sub-pages open beneath it on a guide line.
3. **The top bar:** no fill; "Search payments and people" as a ghost at the left; "Pay or transfer", settings,
   notifications and the avatar at the right, all at 360 with 12px icons.

**On public pages:** the white site bar (mark and wordmark; Products, Customers, Resources with 12px
chevrons and Pricing at 16px/420; "Log in" ghost; the primary pill), a section bar under a hairline on
journal pages, and the site footer.

**In flows:** only the mark and one way out.

## Where it appears

- Every app recipe (`dashboard`, `list-detail`, `settings`, `empty-state`, `errors`); `pricing` and
  `reading` (site bar, footer); `onboarding` and `sign-in` (the flow bar).

## Variations and triggers

- **Settings** swap the main nav for a back link and grouped settings pages.
- **On a phone** the page comes first and the sidebar drops below it.

## What it does not do

- No site bar in the app, no sidebar on public pages.
- No accent colour on the current item; no bold current item.
- No icons on settings pages' items.

## Why

- `inferred`: the frame never changes so that every state of every page, including nothing-here and
  errors, still says where you are.
