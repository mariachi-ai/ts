# Move between areas

**The job:** get to another part of the product, and see where you are.

## What Summit does

- **The top bar:** white, 56px, a faint bottom hairline. The wordmark and search at the left, four 14px links (three with a chevron menu), and at the right "Start free trial" (small, orange), the bell with an orange count, the avatar with a chevron and the orange `circle-plus`. The current link has a 2px signature-orange line on the bar's bottom edge.
- **A side column** for the sections of one thing (a session, settings): a white frame with a hairline, 38px rows, a 3px orange bar on the current one (settings and filter lists fill it orange instead).
- **Underline tabs** inside a page: 14px at 600, the current one over a 2px orange line.
- **Breadcrumbs** with › on public reading pages.

## Where it appears

- Every app recipe (the bar); `list-detail` and `settings` (side columns); `empty-state` (tabs); `reading` (breadcrumb, sections column); `reading` and `sign-in` (the public bar).
- Source: `observed`: full-height header links with the line at the bar's foot on the public pages and in the web screenshots; the public bar's white outlined log-in button and orange join button at the top right; › breadcrumbs and a ruled sections column on help pages.

## Variations and triggers

- **Public pages:** the bar without search, bell or avatar; "Log in" white and "Sign up free" orange. On sign-in, only the orange one.
- **First use:** the wordmark alone, centred.

## What it does not do

- No left navigation rail for the whole app; areas are in the top bar.
- No grey or tinted block for the current item in the bar or the side column (except the settings column's orange fill).
- No more than four top-bar links.

## Why

- `inferred`: the top bar is the product's spine; marking the current place with the signature orange line ties every screen to the brand without colouring the chrome.
