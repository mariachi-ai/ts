# Read an article

**Job.** Explain one topic in prose a person reads top to bottom, with pictures of the product, and send them on to the next thing to read.

## What Obsidian does (parts in order)

1. **The docs frame:** everything on the page colour (the darkest step); a 280px docs sidebar split off by a hairline on its right; a 64px bar with a hairline under it: the sidebar's top (the mark, "Docs", a round search button), then a "/" breadcrumb, a round theme button and the inverted 32px pill.
2. **The title** at 32px and 590, tracked −2.2%, then a one-line lead in 15px.
3. **A figure** filling the 40rem column: 12px corners, no border, shadow or caption. In a kit it's a placeholder (surface colour, 16:10, a centred subtle `image` icon, an `aria-label`).
4. **The body** in `m-prose`: 15px at a 1.6 line height in the secondary grey; h2 24px and h3 20px at 590 with 48px above; links and bold in default text, links underlined; numbered steps with keys as `m-kbd`; inline code in mono.
5. **A callout** where a note matters: the neutral alert at 15px with a bold lead-in.
6. **Contents** to the right: no heading, 13px muted, the current entry in default text with a 2px bar on a hairline track, sub-sections indented.
7. **Related articles** at the end: a 13px muted label and up to three transparent hairline cards (icon, 15px/510 title, the section in 13px muted).

## Where it appears

- `reading`: a docs article about sprints.
- Source study: three docs articles (title 32px/590, body 15px in the secondary grey, figures with 12px corners and no caption, contents at the right, suggested articles as three hairline cards at the end; no date, no reading time, no previous and next), two changelog entries and one post (17px bodies in a 624px column, 8px figure corners, the date above or below the title).

## Variations and triggers

- **A post or changelog entry** instead of a docs page: the site navbar and footer instead of the docs frame; a "/" breadcrumb (posts) or the date (changelog) above the title; 48px/590 centred titles for posts, 32px for changelog entries; 17px body in a 39rem column; author and date in 15px muted; figures with 8px corners and, in posts, a 12px muted caption.
- **Narrow (1024px):** the contents disappear; the sidebar stays.
- **Phone:** the docs sidebar goes behind a menu button in the bar (the recipe, with no media queries, puts it after the article).

## What it does not do

- No inset panel, card around the article, or app sidebar.
- No coloured note boxes (no blue info, no tinted tip); one neutral callout style.
- No "On this page" heading over the contents; no previous and next links; no reading time; no updated date on docs.
- No indigo links: links are default text, underlined.

## Why

- `observed`: see "Where it appears" (measured: docs body text `#d0d6e0` 15px/24px, h1 32px/590, h2 24px/590, h3 20px/590, figures 12px radius, docs sidebar 280px with a 1px `#23252a` right edge, callouts `#1c1c1f` with an 8px radius).
- `inferred`: the docs read like the app's own documents but without the frame, so the article gets the whole page and the sidebar only a hairline.
