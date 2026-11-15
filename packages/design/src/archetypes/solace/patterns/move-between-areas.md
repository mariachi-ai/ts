# Move between areas

**The job:** get from one part of the product to another, and know where you are.

## What Solace does

- **The app header:** 80px, white, no rule under it. The mark (a glyph in a 32px orange rounded-square tile beside the name in bold); five 16px charcoal links, the current one on a warm off-white pill; at the right, ghost icon buttons (saved, history, notifications) and the avatar on the pale orange.
- **The site header** (public pages): the same mark and links; at the right "Log in" as a ghost pill and the one blue pill.
- **A bare mark** on a page that sells or signs in: the mark alone, centred on the plans page, top-left on the sign-in page; no links.
- **A side list** for sections within one area (settings): 16px items with a 20px icon, the current one on the warm off-white pill, no border.
- **An article's contents** in a side column: "In this article" at 18px, then its sections as 14px charcoal links.
- **Back** in the app is a round button (white over a picture, ghost elsewhere); on public pages a breadcrumb with ">" between, the parents muted.
- **The footer** (public pages): a warm off-white band, three columns of plain charcoal links under 16px bold headings, a 14px muted legal line.

## Where it appears

- App header: `dashboard`, `list-detail`, `settings`, `empty-state`. Site header and footer: `reading`. Bare mark: `pricing`, `sign-in`. Side list: `settings`. Contents and breadcrumb: `reading`. Round back: `list-detail`, `onboarding`.
- Source: `observed` on every studied public page (the 80px white header, charcoal links, "Log in" and the blue pill; the plans page and the sign-in page with the mark alone; the articles' contents column and ">" breadcrumbs). The app header is `inferred`: the source is a phone app with a bottom tab bar, and its web app is behind a login.

## Variations and triggers

- **Flows and errors** drop the header for a step count and close (onboarding) or nothing at all (the error sheet page).
- **On a phone** the header's links scroll sideways; the side list stacks above its section.

## What it does not do

- No coloured header and no rule or shadow under it.
- No sidebar for the whole app: areas are in the header; a side list only within settings.
- Never orange for the current item; it is the warm off-white pill.

## Why

- `inferred`: the product is mostly read one screen at a time on a phone, so the desktop keeps the navigation to one row and lets the page breathe under it.
