# Move between areas

**The job:** let someone see where they are and get to the other places.

## What Heather does

1. **In the app, the 240px white sidebar** with a hairline edge: the wordmark and a collapse button,
   the workspace switcher (a bordered box with a square avatar, name, member count and a chevron),
   then rows at 15px/500 with 20px outline icons, about 36px tall with 6px corners. The current row
   is pale blue with blue text and icon. A hairline, then the channels with a 12px/653 heading and a
   ghost `+`. The record button sits at the bottom, solid blue and full width.
2. **The top bar:** no fill; the 40px search field with 12px corners at the left, notifications and
   the avatar at the right.
3. **Within a page:** underline tabs, 14px/500 subtle, the current one blue over a 2px line.
4. **On public pages, the site bar:** white, 60px, a hairline below; the wordmark, four 14px/500
   links (the current one blue), then Log in (secondary) and the one primary. The footer: four
   columns of 14px muted links under 14px/653 headings, then a 12px line.
5. **A breadcrumb** (14px subtle, "/") above the title where a page sits inside another.

## Where it appears

- The sidebar and top bar: `dashboard`, `settings`, `empty-state`, `errors`. The video page's own
  top bar: `list-detail`. The site bar and footer: `pricing`, `reading`. Tabs: `dashboard`,
  `settings`, `list-detail`. Breadcrumbs: `empty-state`, `reading`.

## Variations and triggers

- **Phone:** the page comes first and the sidebar drops below it.
- **The video page** swaps the sidebar for a toggle button so the video gets the width.

## What it does not do

- No coloured sidebar, no icons in the accent except on the current row.
- No sidebar on public pages, no site bar in the app.
- No uppercase or letter-spaced group headings.

## Why

- `observed` for the site bar and tabs on the source's public pages; `inferred` for the app frame,
  from public screenshots of the product: the current place should be found at a glance, and the
  record button is always one click away.
